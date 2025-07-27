import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  jobType: { type: String },
  salary: { type: String },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: [String], // ✅ Add this line
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
