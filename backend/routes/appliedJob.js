import { Router } from "express";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import AppliedJob from "../models/AppliedJob.js";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * s3 객체 생성
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: async () => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
});

/**
 * 로그인 확인 미들웨어 (엑세스 토큰 기준)
 */
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

/**
 * 새로운 지원 현황 생성
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      companyName,
      position,
      appliedDate,
      stages,
      contents,
      progress,
      fileUrl,
    } = req.body;

    const latestJob = await AppliedJob.findOne().sort({ number: -1 });
    // const latestJob = await AppliedJob.findOne({
    //   author: req.user.userId,
    // }).sort({ number: -1 });

    const nextNumber = latestJob ? latestJob.number + 1 : 1;

    const job = new AppliedJob({
      number: nextNumber,
      companyName,
      position,
      appliedDate,
      stages,
      contents,
      progress,
      author: req.user.userId,
      fileUrl,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

/**
 * 모든 지원 현황
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { progress = "all", page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 20;

    const skip = (validPage - 1) * validLimit;

    const baseFilter = { author: req.user.userId };
    const filter = progress === "all" ? baseFilter : { ...baseFilter, progress };

    const [jobs, totalCount] = await Promise.all([
      AppliedJob.find(filter).sort({ createdAt: -1 }).skip(skip).limit(validLimit),
      AppliedJob.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / validLimit);

    return res.json({
      data: jobs,
      totalCount,
      totalPages,
      currentPage: validPage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 합격률 통계
 */
router.get("/statistics", authenticateToken, async (req, res) => {
  try {
    const authorFilter = { author: req.user.userId };

    // 전체
    const totalApplications = await AppliedJob.countDocuments(authorFilter);
    const allStagePassedCount = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $not: {
          $elemMatch: { status: { $ne: "pass" } },
        },
      },
    });
    let totalPassRate = 0;
    if (totalApplications > 0) {
      totalPassRate = (allStagePassedCount / totalApplications) * 100;
    }

    // 서류
    const totalDocumentApplications = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(서류|지원서|자기소개서|자소서)/ },
        },
      },
    });
    const documentPassedCount = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(서류|지원서|자기소개서|자소서)/ },
          status: "pass",
        },
      },
    });
    let documentPassRate = 0;
    if (totalDocumentApplications > 0) {
      documentPassRate =
        (documentPassedCount / totalDocumentApplications) * 100;
    }

    // 코딩 테스트
    const totalCodingTestAttempts = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(코딩|코테)/ },
        },
      },
    });
    const codingTestPassedCount = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(코딩|코테)/ },
          status: "pass",
        },
      },
    });
    let codingTestPassRate = 0;
    if (totalCodingTestAttempts > 0) {
      codingTestPassRate =
        (codingTestPassedCount / totalCodingTestAttempts) * 100;
    }

    // 과제 테스트
    const totalAssignmentAttempts = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(과제)/ },
        },
      },
    });
    const assignmentPassedCount = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(과제)/ },
          status: "pass",
        },
      },
    });
    let assignmentPassRate = 0;
    if (totalAssignmentAttempts > 0) {
      assignmentPassRate =
        (assignmentPassedCount / totalAssignmentAttempts) * 100;
    }

    // 면접
    const totalInterviewAttempts = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(면접|인터뷰)/ },
        },
      },
    });
    const interviewPassedCount = await AppliedJob.countDocuments({
      ...authorFilter,
      stages: {
        $elemMatch: {
          name: { $regex: /(면접|인터뷰)/ },
          status: "pass",
        },
      },
    });
    let interviewPassRate = 0;
    if (totalInterviewAttempts > 0) {
      interviewPassRate = (interviewPassedCount / totalInterviewAttempts) * 100;
    }

    return res.json({
      totalApplications,
      totalPassRate,
      totalDocumentApplications,
      documentPassRate,
      totalCodingTestAttempts,
      codingTestPassRate,
      totalAssignmentAttempts,
      assignmentPassRate,
      totalInterviewAttempts,
      interviewPassRate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 지원 현황 상세보기
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await AppliedJob.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "지원 현황을 찾을 수 없습니다." });
    }

    res.json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 지원 현황 수정
 */
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(req.body);
    const {
      companyName,
      position,
      appliedDate,
      stages,
      contents,
      progress,
      fileUrl: newFileUrls = [],
    } = req.body;

    const job = await AppliedJob.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!job)
      return res.status(404).send({ message: "지원 현황을 찾을 수 없습니다." });

    const oldFileUrls = job.fileUrl || [];
    const deletedFiles = oldFileUrls.filter(
      (url) => !newFileUrls.includes(url)
    );

    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname.substring(1));
      } catch (error) {
        console.log("URL 파싱 에러: ", err);
        return null;
      }
    };

    for (const url of deletedFiles) {
      const key = getS3KeyFromUrl(url);

      if (key) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            })
          );
          console.log("파일 삭제 완료: ", key);
        } catch (error) {
          console.log("S3 파일 삭제 에러: ", error);
          return null;
        }
      }
    }

    const updatedJob = await AppliedJob.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          companyName,
          position,
          appliedDate,
          stages,
          contents,
          progress,
          fileUrl: newFileUrls,
        },
      },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 지원 현황 세부 전형의 합격/불합격 상태 변경
 */
router.patch("/:jobId/stages/:stageId", authenticateToken, async (req, res) => {
  try {
    const { jobId, stageId } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "pass", "nonpass"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 status 값입니다." });
    }

    const filter = {
      _id: jobId,
      author: req.user.userId,
      "stages._id": stageId,
    };
    const update = { $set: { "stages.$.status": status } };
    const options = {
      new: true,
      runValidators: true,
    };

    const updated = await AppliedJob.findOneAndUpdate(filter, update, options);
    if (!updated) {
      return res.status(404).json({ message: "해당 전형을 찾을 수 없습니다." });
    }

    return res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 지원 현황 삭제
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await AppliedJob.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "지원 공고를 찾을 수 없습니다." });
    }

    const getS3KeyFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname.substring(1));
      } catch (error) {
        console.log("URL 파싱 에러: ", error);
        return null;
      }
    };

    const allFiles = Array.isArray(job.fileUrl) ? job.fileUrl : [];

    for (const fileUrl of allFiles) {
      const key = getS3KeyFromUrl(fileUrl);

      if (key) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            })
          );
          console.log("파일 삭제 완료: ", key);
        } catch (error) {
          console.log("S3 파일 삭제 에러: ", error);
        }
      }
    }

    await job.deleteOne();
    res.json({ message: "지원 공고가 삭제 되었습니다." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
