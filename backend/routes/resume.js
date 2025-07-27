import mongoose from "mongoose";
import express from "express";
import CandidateProfile from "../models/CandidateProfile.js";

const router = express.Router();

router.get("/anonymous/:userId", async (req, res) => {
  const { userId } = req.params;

  // ✅ Check for valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: "Invalid userId" });
  }

  try {
    const profile = await CandidateProfile.findOne({ userId });

    if (!profile || !profile.anonymousResumeUrl) {
      return res.status(404).json({ msg: "Anonymous resume not found" });
    }

    res.json({ url: profile.anonymousResumeUrl });
  } catch (err) {
    console.error("Anonymous resume route error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
