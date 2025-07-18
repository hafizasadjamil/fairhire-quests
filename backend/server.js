import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import employerRoutes from "./routes/employer.js";
import notificationRoutes from "./routes/notifications.js";
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import jobseekerRoutes from './routes/jobseeker.js';
import uploadRoutes from './routes/upload.js';
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interviews.js";
import path from "path";
import { fileURLToPath } from "url";
import streamRoutes from './routes/stream.js';
import chatRoutes from "./routes/chat.js";
dotenv.config();
await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobseeker', jobseekerRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));
app.use('/api/stream', streamRoutes);
app.use("/api/chat", chatRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
