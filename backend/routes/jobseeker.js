import express from "express";
import multer from "multer";
import { cloudinary } from "../utils/cloudinary.js";
import protect, { isJobseeker } from "../middleware/protect.js";
import Resume from "../models/Resume.js";
import Application from "../models/Application.js";
import SavedJob from "../models/SavedJob.js";
import User from "../models/User.js";
import Job from "../models/Job.js"; // top of file
import { sendNotification } from "../utils/sendNotification.js";
import Event from "../models/Event.js";
import Match from "../models/Match.js";
import mongoose from "mongoose";
import upload from "../middleware/upload.js";
import { exec } from "child_process";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ DASHBOARD ROUTE

router.get("/dashboard", protect, isJobseeker, async (req, res) => {
  try {
    const userId = req.user.id;

    const allApps = await Application.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "jobId",
        select: "title company location requiredSkills employerId",
        populate: {
          path: "employerId",
          select: "name avatarUrl",
        },
      });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const statusCounts = {
      applied: 0,
      interview: 0,
      hired: 0,
      shortlisted: 0,
      appliedWeek: 0,
      interviewWeek: 0,
      hiredWeek: 0,
    };

    for (const app of allApps) {
      const { status, appliedAt } = app;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
        if (appliedAt >= oneWeekAgo) {
          statusCounts[`${status}Week`]++;
        }
      }
    }

    const stats = [
      {
        title: "Jobs Applied",
        value: allApps.length,
        delta: `+${statusCounts.appliedWeek} this week`,
        icon: "FileText",
      },
      {
        title: "Interviews",
        value: statusCounts.interview,
        delta: `+${statusCounts.interviewWeek} this week`,
        icon: "UserCheck",
      },
      {
        title: "Hired",
        value: statusCounts.hired,
        delta: `+${statusCounts.hiredWeek} this week`,
        icon: "Briefcase",
      },
    ];

    const user = await User.findById(userId).select(
      "name email avatarUrl resumeUrl phone skills bio"
    );
    let matchMap = {};
    const checklist = [
      { label: "Name", done: !!user.name },
      { label: "Phone", done: !!user.phone },
      {
        label: "Skills",
        done: Array.isArray(user.skills) && user.skills.length > 0,
      },
      { label: "Bio", done: !!user.bio },
      { label: "Profile Picture", done: !!user.avatarUrl },
      { label: "Resume", done: !!user.resumeUrl },
    ];

    const completed = checklist.filter((i) => i.done).length;
    const progress = Math.round((completed / checklist.length) * 100);

    const savedRaw = await SavedJob.find({ userId }).populate(
      "jobId",
      "title company location"
    );
    const savedJobs = savedRaw.map((s) => ({
      _id: s.jobId?._id,
      title: s.jobId?.title || "Untitled Job",
      company: s.jobId?.company || "No company name",
      location: s.jobId?.location || "N/A",
    }));

    const eventsRaw = await Event.find({ userId })
      .populate({
        path: "jobId",
        select: "title employerId",
        populate: {
          path: "employerId",
          select: "name",
        },
      })
      .sort({ date: 1 })
      .limit(100);

    const events = eventsRaw.map((ev) => ({
      _id: ev._id,
      date: ev.date,
      mode: ev.mode || "online",
      title: ev.title,
      jobTitle: ev.jobId?.title || "Untitled Job",
      employerName: ev.jobId?.employerId?.name || "Unknown Company",
    }));

    // ✅ Build recentApps with matching skills
    const userSkills = (user.skills || []).map((s) => s.toLowerCase());
    const recentApps = allApps.map((app) => {
      const match = matchMap[app.jobId?._id?.toString()] || 0;

      let matchSkills = [];
      if (
        app.jobId?.requiredSkills &&
        Array.isArray(app.jobId.requiredSkills)
      ) {
        matchSkills = app.jobId.requiredSkills.filter((skill) =>
          userSkills.includes(skill.toLowerCase())
        );
      }

      return {
        ...app.toObject(),
        match,
        matchSkills,
      };
    });

    res.json({
      stats,
      recentApps,
      savedJobs,
      progress,
      checklist,
      events,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        bio: user.bio || null,
        skills: user.skills || [],
        avatarUrl: user.avatarUrl || null,
        resumeUrl: user.resumeUrl || null,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/parsed-resume", protect, isJobseeker, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user_id: req.user._id,
      status: "processed",
    }).sort({ updated_at: -1 });

    if (!resume || !resume.parsed_data) {
      return res.status(404).json({ msg: "No parsed resume found" });
    }

    res.json(resume.parsed_data);
  } catch (err) {
    console.error("❌ Error fetching parsed data:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/applied-jobs", protect, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .populate({
        path: "jobId",
        populate: { path: "employerId", select: "name avatarUrl" },
      })
      .sort({ createdAt: -1 });

    // ✅ Filter out broken job references
    const valid = apps.filter((a) => a.jobId);

    const jobs = valid.map((a) => ({
      _id: a.jobId._id,
      title: a.jobId.title,
      location: a.jobId.location,
      company: a.jobId.employerId?.name || "Unknown",
      avatar: a.jobId.employerId?.avatarUrl || null,
      appliedAt: a.createdAt,
    }));

    res.json(jobs);
  } catch (err) {
    console.error("Applied jobs error:", err);
    res.status(500).json({ error: "Failed to fetch applied jobs" });
  }
});

// DELETE /jobseeker/unapply/:jobId

router.post("/apply/:jobId", protect, isJobseeker, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const existing = await Application.findOne({
      userId: req.user.id,
      jobId,
    });

    if (existing) {
      return res.status(400).json({ msg: "Already applied to this job" });
    }

    // ✅ Fetch job and employer info
    const job = await Job.findById(jobId).populate("employerId", "name");

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const app = new Application({
      userId: req.user.id,
      jobId,
      jobTitle: job.title,
      employerName: job.employerId?.name || "Unknown",
      createdAt: new Date(),
    });

    await app.save();

    // ✅ Notify Employer
    if (job?.employerId?._id) {
      await sendNotification(
        job.employerId._id,
        `${req.user.name} applied to your job: ${job.title}`,
        `/employer/applicant/${req.user.id}`
      );
    }

    res.status(201).json({ msg: "Application submitted" });
  } catch (err) {
    console.error("❌ Application failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/unapply/:jobId", protect, isJobseeker, async (req, res) => {
  await Application.deleteOne({ userId: req.user.id, jobId: req.params.jobId });
  res.json({ msg: "Unapplied successfully" });
});

// 👉 POST /jobseeker/save/:jobId
router.post("/save/:jobId", protect, isJobseeker, async (req, res) => {
  try {
    const exists = await SavedJob.findOne({
      userId: req.user.id,
      jobId: req.params.jobId,
    });
    if (exists) {
      // Unsave if already saved
      await SavedJob.findByIdAndDelete(exists._id);
      return res.json({ msg: "Job unsaved" });
    } else {
      const saved = new SavedJob({
        userId: req.user.id,
        jobId: req.params.jobId,
      });
      await saved.save();
      return res.status(201).json({ msg: "Job saved" });
    }
  } catch (err) {
    console.error("❌ Save job error:", err);
    res.status(500).json({ msg: "Failed to save/unsave job" });
  }
});

// 👉 GET /jobseeker/saved-jobs Python: Select Interpreter
router.get("/saved-jobs", protect, isJobseeker, async (req, res) => {
  try {
    const saved = await SavedJob.find({ userId: req.user.id }).populate({
      path: "jobId",
      select: "title location employerId",
      populate: {
        path: "employerId",
        select: "name avatarUrl", // fetch employer name & avatar
      },
    });

    const jobs = saved
      .filter((s) => s.jobId) // ✅ Only include if jobId is valid
      .map((s) => ({
        _id: s.jobId._id,
        title: s.jobId.title,
        location: s.jobId.location,
        company: s.jobId.employerId?.name || "No company name",
        avatar: s.jobId.employerId?.avatarUrl || null,
        savedAt: s.savedAt,
      }));

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch saved jobs" });
  }
});
router.post(
  "/upload-profile-files",
  protect,
  isJobseeker,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const updates = {};
      const userId = (req.user && (req.user._id || req.user.id))?.toString();
      console.log("📌 Upload route userId:", userId);

      if (!userId) {
        console.error("❌ Missing userId in upload route:", req.user);
        return res.status(400).json({ msg: "Invalid user ID" });
      }

      const baseUrl = process.env.BASE_URL || "http://localhost:5000";

      // ✅ Avatar Upload
      if (req.files?.avatar?.length) {
        const avatarFile = req.files.avatar[0];
        updates.avatarUrl = `${baseUrl}/uploads/${avatarFile.filename}`;
      }

      // ✅ Resume Upload
      if (req.files?.resume?.length) {
        const resumeFile = req.files.resume[0];
        const filePath = `${baseUrl}/uploads/${resumeFile.filename}`;
        console.log("🧾 Resume upload for userId:", userId);

        // ✅ Update Resume collection
        await Resume.updateOne(
          { user_id: userId },
          {
            $set: {
              file_path: filePath,
              status: "pending",
              parsed_data: {},
              updated_at: new Date(),
            },
            $setOnInsert: {
              user_id: userId,
              created_at: new Date(),
            },
          },
          { upsert: true }
        );

        // ✅ Update resumeUrl in users collection
        updates.resumeUrl = filePath;
        // const pythonPath = path.join(
        //   process.cwd(),
        //   "fairhire-ai-engine",
        //   ".venv",
        //   "Scripts",
        //   "python.exe"
        // );
        const pythonPath = path.resolve(
          __dirname,
          "../../fairhire-ai-engine/.venv/Scripts/python.exe"
        );

        const scriptPath = path.resolve(
          __dirname,
          "../../fairhire-ai-engine/main.py"
        );

        exec(
          `"${pythonPath}" "${scriptPath}" --mode batch`,
          (error, stdout, stderr) => {
            if (error) {
              console.error("❌ Failed to trigger AI Engine:", error);
              return;
            }
            console.log("✅ AI Engine triggered successfully:\n", stdout);
          }
        );
        // ✅ Trigger AI pipeline after resume upload
      }

      // ✅ Profile Fields
      const jsonFields = [
        "skills",
        "education",
        "experience",
        "projects",
        "certifications",
        "languages",
      ];

      for (const key in req.body) {
        if (jsonFields.includes(key)) {
          try {
            updates[key] = JSON.parse(req.body[key]);
            console.log(`✅ Parsed ${key}:`, parsed);
            console.log("📦 Certifications received:", req.body.certifications);
          } catch {
            console.error(`❌ Failed to parse ${key}:`, req.body[key]);
            updates[key] = [];
          }
        } else {
          updates[key] = req.body[key] || "";
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
      }).select(
        "name email phone bio skills education experience avatarUrl location linkedin certifications languages projects"
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      res.status(500).json({ msg: "Upload failed" });
    }
  }
);

router.get("/profile", protect, isJobseeker, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone skills bio education experience avatarUrl resumeUrl location linkedin certifications languages projects"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🧠 Get parsed resume (latest)
    const latestResume = await Resume.findOne({ user_id: req.user.id }).sort({
      created_at: -1,
    });
    const parsed = latestResume?.parsed_data || {};

    res.json({
      name: user.name || parsed.name || "",
      email: user.email,
      phone: user.phone || parsed.phone || "",
      skills: (user.skills?.length ? user.skills : parsed.skills) || [],
      bio: user.bio || parsed.bio || "",
      education: user.education?.length
        ? user.education
        : parsed.education || [],
      experience: user.experience?.length
        ? user.experience
        : parsed.experience || [],
      avatarUrl: user.avatarUrl || "",
      avatar: user.avatarUrl || "",
      resumeUrl: latestResume?.file_path || user.resumeUrl || "",
      location: user.location || parsed.location || "",
      linkedin: user.linkedin || parsed.linkedin || "",
      certifications: user.certifications?.length
        ? user.certifications
        : parsed.certifications || [],
      languages: user.languages?.length
        ? user.languages
        : parsed.languages || [],
      projects: user.projects?.length ? user.projects : parsed.projects || [],
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🔍 GET /jobseeker/matching-jobs → Jobs that match user skills

router.get("/events", protect, isJobseeker, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id })
      .populate({
        path: "jobId",
        select: "title employerId",
        populate: {
          path: "employerId",
          select: "name",
        },
      })
      .sort({ date: 1 });

    const formatted = events.map((ev) => ({
      _id: ev._id,
      type: ev.type,
      date: ev.date,
      mode: ev.mode || "online",
      jobTitle: ev.jobId?.title || "Unknown Job",
      employerName: ev.jobId?.employerId?.name || "Unknown Company",
      notes: ev.notes || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Merged Event fetch error:", err);
    res.status(500).json({ msg: "Failed to fetch merged events" });
  }
});

// routes/jobseeker.js or matchingJobs route file

router.get("/matching-jobs", protect, isJobseeker, async (req, res) => {
  try {
    // ✅ Only find match documents where matches array is non-empty
    const matchDoc = await Match.findOne({
      user_id: req.user.id,
      matches: { $exists: true, $ne: [] },
    });

    if (!matchDoc) return res.json([]);
    // ✅ Sort matches by rank
    const sortedMatches = matchDoc.matches.sort((a, b) => a.rank - b.rank);
    // ✅ Prepare job IDs
    const jobIds = sortedMatches.map((m) =>
      typeof m.job_id === "string"
        ? new mongoose.Types.ObjectId(m.job_id)
        : m.job_id
    );

    // ✅ Fetch jobs with employer details
    const jobs = await Job.find({ _id: { $in: jobIds } }).populate({
      path: "employerId",
      select: "name avatarUrl",
    });
    // ✅ Attach match reason and rank to each job
    const jobsWithMatchData = jobs.map((job) => {
      const matchData = sortedMatches.find(
        (m) => m.job_id.toString() === job._id.toString()
      );
      return {
        ...job.toObject(),
        rank: matchData?.rank,
        match_reason: matchData?.match_reason,
      };
    });

    res.json(jobsWithMatchData);
  } catch (err) {
    console.error("❌ Matching jobs error:", err);
    res.status(500).json({ msg: "Failed to fetch matching jobs" });
  }
});

export default router;
