import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    req.user = {
      ...user._doc,
      id: user._id,        // <-- this line is important!
     _id: user._id
    };
    next();
  } catch (err) {
    console.error("❌ Token failed", err);
    res.status(401).json({ msg: 'Token failed' });
  }
};

export default protect;

// Add these below the default export
export const isJobseeker = (req, res, next) => {
  if (req.user?.role !== 'jobseeker') {
    return res.status(403).json({ msg: 'Only jobseekers allowed' });
  }
  next();
};

export const isEmployer = (req, res, next) => {
  if (req.user?.role !== 'employer') {
    return res.status(403).json({ msg: 'Only employers allowed' });
  }
  next();
};
