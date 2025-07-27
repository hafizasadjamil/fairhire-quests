import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ UPDATED: Login route with role check
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (!user || !(await user.matchPwd(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // ✅ Check if user role matches requested role
    if (user.role !== role) {
      return res.status(403).json({ msg: `You're not registered as a ${role}` });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
