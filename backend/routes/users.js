import express from 'express';
import protect  from '../middleware/protect.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
const router = express.Router();


// GET /api/users/me

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone bio skills avatarUrl resumeUrl education experience location linkedin certifications languages projects"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
       _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      skills: user.skills || [],
      avatarUrl: user.avatarUrl || "",
      resumeUrl: user.resumeUrl || "",
      education: user.education || [],
      experience: user.experience || [],
      location: user.location || "",
      linkedin: user.linkedin || "",
      certifications: user.certifications || [],
      languages: user.languages || [],
      projects: user.projects || []
    });
  } catch (err) {
    console.error("GET /me error", err);
    res.status(500).json({ msg: "Server error in /me" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // 🛡️ Validate ID format before querying
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id).select(
      "_id name email phone bio skills avatarUrl resumeUrl education experience location linkedin certifications languages projects"
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Fetch user failed", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Update Profile
router.put("/profile", protect, async (req, res) => {
  const { name, phone, bio, skills, resumeUrl, avatarUrl } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.skills = skills || user.skills;
    user.resumeUrl = resumeUrl || user.resumeUrl;
    user.avatarUrl = avatarUrl || user.avatarUrl;

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        avatarUrl: user.avatarUrl,
        resumeUrl: user.resumeUrl
      },
    });
  } catch (err) {
    console.error("PUT /profile error", err);
    res.status(500).json({ msg: "Server error in profile update" });
  }
});


export default router;
