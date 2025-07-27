// routes/uploadRoutes.js
import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST /api/upload/avatar
router.post("/avatar", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Avatar upload failed" });

  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url });
});

// POST /api/upload/resume
router.post("/resume", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Resume upload failed" });

  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
