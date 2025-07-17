// models/Match.js
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  matches: [
    {
      job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      matchPercent: Number
    }
  ]
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);
