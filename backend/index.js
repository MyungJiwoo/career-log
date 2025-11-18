import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import appliedJobRoutes from "./routes/appliedJob.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = process.env.PORT;

// cors 허용
const isProd = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin: isProd ? process.env.PROD_ORIGIN : process.env.DEV_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use("/api/appliedJob", appliedJobRoutes);
app.use("/api/auth", userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB와 연결이 되었습니다."))
  .catch((error) => console.log("MongoDB와 연결이 실패했습니다: ", error));

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Local server is running on http://localhost:${PORT}`);
  });
}
