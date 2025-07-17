import express from "express";
import Interview from "../models/Interview.js";
import protect, { isEmployer } from "../middleware/protect.js";

const router = express.Router();

// 📌 POST /api/interviews/schedule
router.post("/schedule", protect, isEmployer, async (req, res) => {
  try {
    const { jobId, candidateId, interviewDate, mode } = req.body;

    if (!jobId || !candidateId || !interviewDate)
      return res.status(400).json({ msg: "Missing required fields" });

    const interview = new Interview({
      jobId,
      employerId: req.user._id,
      candidateId,
      interviewDate,
      mode,
    });

    await interview.save();
    res.status(201).json({ msg: "Interview scheduled", interview });
  } catch (err) {
    console.error("Interview schedule error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 GET /api/interviews/mine => For candidate to fetch interviews
router.get("/mine", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user._id }).populate("jobId", "title");
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch interviews" });
  }
});

export default router;
