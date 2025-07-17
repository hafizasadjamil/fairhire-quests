import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobseeker', 'employer'], required: true },

    // Optional profile fields
    phone: { type: String },
    avatarUrl: { type: String },      // Cloudinary image link
    resumeUrl: { type: String },      // Cloudinary resume PDF link
    bio: { type: String },            // About me

    skills: [{ type: String }],       // ["Python", "NLP"]

    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],

    experience: [
      {
        title: String,
        company: String,
        years: Number,
      },
    ],

    projects: [
      {
        name: String,
        description: String,
      },
    ],

    certifications: [{ type: String }],
    languages: [{ type: String }],
    location: { type: String },
    linkedin: { type: String },
  },
  { timestamps: true }
);

// Password hash before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPwd = async function (enteredPwd) {
  return await bcrypt.compare(enteredPwd, this.password);
};

export default mongoose.model('User', userSchema);
