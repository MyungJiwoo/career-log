import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const router = Router();
const isProd = process.env.NODE_ENV === "production";

/**
 * Access Token 발급 함수
 */
const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
    // { expiresIn: "30s" }
  );
};

/**
 * Refresh Token 발급 함수
 */
const createRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
    // { expiresIn: "2m" }
  );
};

/**
 * 쿠키로 토큰 세팅
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access Token 쿠키
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15분
    // maxAge: 30 * 1000,
  });

  // Refresh Token 쿠키
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    // maxAge: 2 * 60 * 1000,
  });
};

/**
 * 쿠키 비우기
 */
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};

/**
 * 회원가입
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser)
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error);
  }
});

/**
 * 로그인
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "비활성화된 계정입니다. 관리자에게 문의하세요." });
    }

    // 이미 refreshToken이 있다면 다른 곳에서 로그인 중으로 판단
    if (user.refreshToken) {
      try {
        jwt.verify(user.refreshToken, process.env.JWT_REFRESH_SECRET);
        // return res
        //   .status(401)
        //   .json({ message: "이미 다른 기기에서 로그인되어 있습니다." });
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          user.refreshToken = null;
          user.isLoggedIn = false;
          await user.save(); // 만료된 토큰 정리 후 새 로그인 진행
        } else {
          return res
            .status(401)
            .json({ message: "세션 검증 중 오류가 발생했습니다." });
        }
      }
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      // 비밀번호 5회 이상 틀리면 계정 잠금
      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res.status(401).json({
          message: "비밀번호를 5회 이상 틀려 계정이 비활성화되었습니다.",
        });
      }
      await user.save();
      return res.status(401).json({
        message: "비밀번호가 일치하지 않습니다.",
        remainingAttempts: 5 - user.failedLoginAttempts,
      });
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;

    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      const ipAddress = response.data.ip;
      user.ipAddress = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error.message);
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.refreshToken;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error);
  }
});

/**
 * 토큰 재발급 (리프레시 토큰 사용)
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "리프레시 토큰이 존재하지 않습니다." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      const decodedToken = jwt.decode(refreshToken); // 만료돼도 userId 추출
      if (decodedToken?.userId) {
        await User.findByIdAndUpdate(decodedToken.userId, {
          $set: { refreshToken: null, isLoggedIn: false },
        });
      } else {
        await User.updateOne(
          { refreshToken },
          { $set: { refreshToken: null, isLoggedIn: false } }
        );
      }
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ message: "유효하지 않은 리프레시 토큰입니다." });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshToken) {
      return res
        .status(401)
        .json({ message: "리프레시 토큰 정보가 유효하지 않습니다." });
    }

    if (user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .json({ message: "이미 다른 세션에서 로그인되었습니다." });
    }

    const newAccessToken = createAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 50 * 1000,
    });

    res.json({ message: "토큰이 재발급되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 로그아웃
 */
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(200).json({ message: "이미 로그아웃된 상태입니다." });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.refreshToken === refreshToken) {
        user.refreshToken = null;
        user.isLoggedIn = false;
        await user.save();
      }
    } catch (error) {
      console.log("리프레시 토큰 검증 오류: ", error.message);
    }

    clearAuthCookies(res);

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error);
  }
});

/**
 * 계정 삭제
 */
router.delete("/delete/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error);
  }
});

/**
 * 토큰 인증 (엑세스 토큰 기준)
 */
router.post("/verify-token", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res
      .status(200)
      .json({ isValid: false, message: "토큰이 유효하지 않습니다." });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      return res
        .status(200)
        .json({ isValid: false, message: "로그인이 만료되었습니다." });
    }

    return res.status(200).json({ isValid: true, user: decoded });
  } catch (error) {
    return res
      .status(200)
      .json({ isValid: false, message: "토큰이 유효하지 않습니다." });
  }
});

export default router;
