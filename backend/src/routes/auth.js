import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  const payload = { id: user._id.toString(), role: user.role, name: user.name };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = '1d';
  return jwt.sign(payload, secret, { expiresIn });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (role === 'admin') return res.status(403).json({ message: 'Admin cannot be registered here' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const wantsManager = role === 'manager'
    const user = await User.create({ name, email, password: hashed, role: 'volunteer', managerPending: wantsManager });

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, managerPending: user.managerPending }, token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isLocked) return res.status(403).json({ message: 'Account is locked' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, managerPending: user.managerPending }, token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
});

// Request manager approval: sets managerPending = true
router.post('/request-manager', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.role === 'admin' || user.role === 'manager') return res.status(400).json({ message: 'Already manager/admin' })
  user.managerPending = true
  await user.save()
  return res.json({ user: { id: user._id, managerPending: user.managerPending } })
})

export default router;


