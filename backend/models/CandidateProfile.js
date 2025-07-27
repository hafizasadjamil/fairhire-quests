import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bio: { type: String },
  skills: { type: [String], default: [] },

  experience: [
    {
      title: String,
      company: String,
      years: String,
    },
  ],

  education: [
    {
      degree: String,
      institution: String,
      year: String,
    },
  ],

  projects: [
    {
      name: String,
      description: String,
    },
  ],

  certifications: [
    {
      name: { type: String},
      description: { type: String },
    },
  ],

  languages: { type: [String], default: [] },
  location: { type: String },
  linkedin: { type: String },

  resumeLink: { type: String },
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.model("CandidateProfile", candidateProfileSchema);
