import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import protect from '../middleware/protect.js';
import mongoose from "mongoose";

const router = express.Router();


router.get('/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const employerId = req.user._id;

    // ✅ Get employer jobs
    const jobs = await Job.find({ employerId }).sort({ createdAt: -1 });
    const jobIds = jobs.map(job => job._id);

    // ✅ Date filter
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    // ✅ Total stats
    const totalApps = await Application.countDocuments({ jobId: { $in: jobIds } });
    const totalInterviews = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'interview',
    });
    const totalHires = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'hired',
    });

    // ✅ Weekly deltas
    const deltaJobs = await Job.countDocuments({ employerId, createdAt: { $gte: oneWeekAgo } });
    const deltaApps = await Application.countDocuments({ jobId: { $in: jobIds }, createdAt: { $gte: oneWeekAgo } });
    const deltaInter = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'interview',
      updatedAt: { $gte: oneWeekAgo }
    });
    const deltaHires = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: 'hired',
      updatedAt: { $gte: oneWeekAgo }
    });

    const stats = {
      activeJobs: jobs.length,
      applications: totalApps,
      interviews: totalInterviews,
      hires: totalHires,
      deltaJobs,
      deltaApps,
      deltaInter,
      deltaHires,
    };

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return { ...job.toObject(), applicationCount: count };
      })
    );

    res.json({ stats, jobs: jobsWithCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// routes/employer.js
router.get('/applicant/:userId', protect, async (req, res) => {
  const { userId } = req.params;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: "Invalid applicant ID" });
  }

  try {
    const user = await User.findById(userId).select(
      "name email phone bio avatarUrl resumeUrl skills"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const formattedUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatarUrl,
      resume: user.resumeUrl,
      skills: user.skills || [],
    };

    res.json(formattedUser);
  } catch (err) {
    console.error("Fetch applicant profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ UPDATE profile info
router.put('/profile', protect, async (req, res) => {
  if (req.user.role !== 'employer') return res.status(403).json({ msg: "Forbidden" });

  const { name, company, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  user.name = name || user.name;
  user.company = company || user.company;
  user.avatarUrl = avatar || user.avatarUrl;

  await user.save();

  res.json({ msg: 'Profile updated', user });
});



export default router;
