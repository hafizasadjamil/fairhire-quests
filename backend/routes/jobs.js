import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import protect from "../middleware/protect.js";
import { sendNotification } from "../utils/sendNotification.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { matchScoreCalculator } from "../utils/matchEngine.js"; // Your AI matching logic
import { isEmployer } from "../middleware/protect.js";
import CandidateProfile from "../models/CandidateProfile.js";

const router = express.Router();

// 🔵 Create Job (Employer only)
router.post("/create", protect, async (req, res) => {
  try {
    const employerId = req.user.id;
    const newJob = new Job({ ...req.body, employerId });
    await newJob.save();

    // Notify all jobseekers
    const jobseekers = await User.find({ role: "jobseeker" });
    await Promise.all(
      jobseekers.map((js) =>
        sendNotification(
          js._id,
          `New job posted: ${newJob.title}`,
          `/jobs/${newJob._id}`
        )
      )
    );

    res.status(201).json({ msg: "Job posted successfully", job: newJob });
  } catch (err) {
    console.error("Job creation error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 🔵 Get All Jobs (Public)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employerId", "name avatarUrl")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch jobs" });
  }
});

// 🔵 Get Single Job by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employerId",
      "name avatarUrl"
    );
    if (!job) return res.status(404).json({ msg: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Fetch job by ID failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🔵 Get Applications for a Job (with CandidateProfile enrichment)
router.get("/:id/applications", protect, async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.id }).populate(
      "userId",
      "skills"
    );

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch applications with skills" });
  }
});

// 🔵 Get Employer’s Own Jobs
router.get("/my", protect, async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort({
      createdAt: -1,
    });

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return { ...job.toObject(), applicationCount: count };
      })
    );

    res.json(jobsWithCounts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch jobs" });
  }
});

// 🔵 Update Job (with skill/requirements parsing)
router.put("/:id", protect, async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      requirements: Array.isArray(req.body.requirements)
        ? req.body.requirements
        : typeof req.body.requirements === "string"
        ? req.body.requirements
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user.id },
      updatedData,
      { new: true }
    );

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
});

// 🔵 Delete Job and Related Data
router.delete("/:id", protect, async (req, res) => {
  try {
    const jobId = req.params.id;

    // 🔐 Ensure only the employer who posted the job can delete it
    const job = await Job.findOneAndDelete({
      _id: jobId,
      employerId: req.user.id,
    });

    if (!job)
      return res.status(404).json({ msg: "Job not found or unauthorized" });

    // 🔁 Delete related data
    await Promise.all([
      Application.deleteMany({ jobId }),
      Event.deleteMany({ jobId }),
      Interview.deleteMany({ jobId }),
      User.updateMany({ savedJobs: jobId }, { $pull: { savedJobs: jobId } }),
    ]);

    res.json({ msg: "Job and all related data deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

router.put("/applications/:id/status", async (req, res) => {
  try {
    const { status, interviewDate, mode } = req.body;

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate({
        path: "jobId",
        populate: { path: "employerId", select: "name" },
      })
      .populate("userId");

    if (!app) return res.status(404).json({ msg: "Application not found" });

    // Build unified event payload
    const newEvent = {
      userId: app.userId._id,
      jobId: app.jobId._id,
      type: status, // "interview", "hired", "rejected"
      date: new Date().toISOString(), // fallback for rejected/hired
    };

    // Interview-specific additions
    if (status === "interview") {
      newEvent.date = interviewDate || newEvent.date;
      newEvent.mode = mode || "online";
    }

    // Optional notes or dynamic title could also be added if needed
    await Event.create(newEvent);

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update status" });
  }
});

// ✅ Get application status between employer and applicant
router.get(
  "/applications/status/:employerId/:applicantId",
  async (req, res) => {
    const { employerId, applicantId } = req.params;

    try {
      // Find any job that belongs to the employer
      const jobs = await Job.find({ employerId }).select("_id");
      const jobIds = jobs.map((j) => j._id);

      // Find the application for those jobs + user
      const application = await Application.findOne({
        jobId: { $in: jobIds },
        userId: applicantId,
      });

      if (!application) {
        return res.json({ status: "unknown" });
      }

      res.json({ status: application.status || "unknown" });
    } catch (err) {
      console.error("❌ Status fetch failed:", err);
      res.status(500).json({ error: "Failed to get application status" });
    }
  }
);

// 🔵 Get Blind Applications for a Job (with match score)

router.get(
  "/:jobId/applications-blind",
  protect,
  isEmployer,
  async (req, res) => {
    try {
      const { jobId } = req.params;

      // 1. Get the job posting (for required skills)
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ msg: "Job not found" });

      const jobSkills = job.skills || []; // 🧠 Required skills for matching

      // 2. Get all applications
      const applications = await Application.find({ jobId });

      // 3. Extract candidate profiles for each application
      const result = await Promise.all(
        applications.map(async (app) => {
          const profile = await CandidateProfile.findOne({
            userId: app.userId,
          });

          if (!profile) return null;

          const score = matchScoreCalculator(jobSkills, profile.skills || []);

          return {
            skills: profile.skills || [],
            experience: profile.experience || "N/A",
            certifications: profile.certifications || [],
            matchScore: score,
          };
        })
      );

      // 4. Remove nulls (if profile not found)
      const filtered = result.filter((r) => r !== null);

      res.json(filtered);
    } catch (err) {
      console.error("Blind applications error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

export default router;
