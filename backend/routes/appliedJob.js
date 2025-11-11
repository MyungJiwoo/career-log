import { Router } from "express";
import AppliedJob from "../models/AppliedJob.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { companyName, position, appliedDate, stages, contents, progress } =
      req.body;

    const latestJob = await AppliedJob.findOne().sort({ number: -1 });
    const nextNumber = latestJob ? latestJob.number + 1 : 1;

    const job = new AppliedJob({
      number: nextNumber,
      companyName,
      position,
      appliedDate,
      stages,
      contents,
      progress,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

router.get("/", async (req, res) => {
  try {
    const jobs = await AppliedJob.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/:number", async (req, res) => {
  try {
    const number = Number(req.params.number);
    const job = await AppliedJob.findOne({ number: number });

    if (!job) {
      return res.status(404).json({ message: "지원 현황을 찾을 수 없습니다." });
    }

    res.json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// todo: 수정하기
router.patch("/:id", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const job = await AppliedJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "지원 공고를 찾을 수 없습니다." });
    }

    await job.deleteOne();
    res.json({ message: "지원 공고가 삭제 되었습니다." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
