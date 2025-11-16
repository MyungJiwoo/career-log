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
    const { progress } = req.query ?? "all";

    if (progress === "all") {
      const allJobs = await AppliedJob.find().sort({ createdAt: -1 });
      return res.json(allJobs);
    }
    const jobs = await AppliedJob.find({ progress }).sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 합격률 통계 api
 */
router.get("/statistics", async (req, res) => {
  try {
    // 전체
    const totalApplications = await AppliedJob.countDocuments({});
    const allStagePassedCount = await AppliedJob.countDocuments({
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
      stages: {
        $elemMatch: {
          name: { $regex: /(서류|지원서|자기소개서|자소서)/ },
        },
      },
    });
    const documentPassedCount = await AppliedJob.countDocuments({
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
      stages: {
        $elemMatch: {
          name: { $regex: /(코딩|코테)/ },
        },
      },
    });
    const codingTestPassedCount = await AppliedJob.countDocuments({
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
      stages: {
        $elemMatch: {
          name: { $regex: /(과제)/ },
        },
      },
    });
    const assignmentPassedCount = await AppliedJob.countDocuments({
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
      stages: {
        $elemMatch: {
          name: { $regex: /(면접|인터뷰)/ },
        },
      },
    });
    const interviewPassedCount = await AppliedJob.countDocuments({
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

router.get("/:id", async (req, res) => {
  try {
    const job = await AppliedJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "지원 현황을 찾을 수 없습니다." });
    }

    res.json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // const number = Number(req.params.number);
    const job = await AppliedJob.findById(req.params.id);

    if (!job)
      return res.status(404).send({ message: "지원 현황을 찾을 수 없습니다." });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 전형 하나만 상태 변경
router.patch("/:jobId/stages/:stageId", async (req, res) => {
  try {
    const { jobId, stageId } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "pass", "nonpass"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 status 값입니다." });
    }

    const filter = { _id: jobId, "stages._id": stageId };
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
