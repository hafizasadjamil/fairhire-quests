// models/Resume.js
import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // ✅ Ensure one resume per user
  },
  file_path: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  parsed_data: {
    type: Object,
    default: {},
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});


const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;
