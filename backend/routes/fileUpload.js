import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import jwt from "jsonwebtoken";
import { Router } from "express";

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
 *  multer로 파일의 최대 크기 설정
 */
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
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
 * 파일 업로드
 */
router.post(
  "/file",
  authenticateToken,
  fileUpload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const originalName = req.body.originalName;
      const decodedFileName = decodeURIComponent(originalName); // 오리지널 이름이 URL 인코딩된 상태일 수 있어서 디코딩

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `post-files/${decodedFileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        // attachment 모드라면 링크를 눌렀을 때 바로 다운 받고, inline이라면 미리보기를 한다.
        ContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(
          decodedFileName
        )}`,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-files/${decodedFileName}`;
      res.json({ fileUrl });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "파일 업로드 중 에러가 발생했습니다." });
    }
  }
);

export default router;
