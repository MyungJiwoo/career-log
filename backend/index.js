import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import appliedJobRoutes from "./routes/appliedJob.js";

const app = express();
const PORT = 3000;

// cors 허용
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/appliedJob", appliedJobRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB와 연결이 되었습니다."))
  .catch((error) => console.log("MongoDB와 연결이 실패했습니다: ", error));

app.listen(PORT, () => {
  console.log("Server is running");
});
