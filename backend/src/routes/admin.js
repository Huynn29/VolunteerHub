import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = Router();

// Admin: lock a user
router.post('/users/:id/lock', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.isLocked = true
  await user.save()
  return res.json({ message: 'User locked', user: { id: user._id, isLocked: user.isLocked } })
})

// Admin: unlock a user
router.post('/users/:id/unlock', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.isLocked = false
  await user.save()
  return res.json({ message: 'User unlocked', user: { id: user._id, isLocked: user.isLocked } })
})

export default router;

// List users (admin)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  return res.json({ users })
})

// List events (admin)
router.get('/events', authenticate, authorize('admin'), async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 })
  return res.json({ events })
})

// Approve/publish event (admin)
router.post('/events/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  ev.status = 'published'
  await ev.save()
  return res.json({ event: ev })
})

// Admin rejects/unpublishes event
router.post('/events/:id/reject', authenticate, authorize('admin'), async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  ev.status = 'draft'
  await ev.save()
  return res.json({ event: ev })
})

// Report registrations for an event (admin or manager owner)
router.get('/events/:id/registrations', authenticate, async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  const isAdmin = req.user.role === 'admin'
  const isOwnerManager = req.user.role === 'manager' && ev.createdBy.toString() === req.user.id
  if (!isAdmin && !isOwnerManager) return res.status(403).json({ message: 'Forbidden' })
  const regs = await Registration.find({ eventId: ev._id }).sort({ createdAt: -1 }).populate('userId', 'name email role')
  return res.json({ event: ev, registrations: regs })
})

// List pending manager requests
router.get('/manager-requests', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.find({ managerPending: true }).select('name email role managerPending createdAt')
  return res.json({ requests: users })
})

// Approve manager role
router.post('/manager-requests/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.role = 'manager'
  user.managerPending = false
  await user.save()
  return res.json({ user: { id: user._id, role: user.role, managerPending: user.managerPending } })
})

// Reject manager role
router.post('/manager-requests/:id/reject', authenticate, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.managerPending = false
  await user.save()
  return res.json({ user: { id: user._id, role: user.role, managerPending: user.managerPending } })
})


