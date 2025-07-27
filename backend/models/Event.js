// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // candidate
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  type: {
    type: String,
    enum: ["interview", "hired", "rejected"],
    required: true
  },
  date: { type: Date, required: true },
  mode: { type: String, enum: ["online", "in-person"], default: "online" }, // only for interviews
  notes: { type: String }, // optional message like "Please join Zoom"
});


const Event = mongoose.model("Event", eventSchema);
export default Event;
