import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Post from '../models/Post.js';
import Registration from '../models/Registration.js';

const router = Router();

// Basic aggregate counts; restrict to manager/admin
router.get('/', authenticate, authorize('manager', 'admin'), async (req, res) => {
  const [users, events, posts, registrations] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Post.countDocuments(),
    Registration.countDocuments(),
  ]);

  return res.json({
    totals: { users, events, posts, registrations },
  });
});

export default router;

// Volunteer dashboard aggregates
router.get('/volunteer', authenticate, authorize('volunteer'), async (req, res) => {
  // Counts of published upcoming events, posts, and user's recent registrations
  const now = new Date()
  const [events, myRegs, posts] = await Promise.all([
    Event.countDocuments({ status: 'published', date: { $gte: now } }),
    Registration.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10),
    Post.countDocuments(),
  ])

  return res.json({ totals: { upcomingEvents: events, myRecentRegistrations: myRegs.length, posts } })
})


