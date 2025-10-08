import { Router } from 'express';
import Event from '../models/Event.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import Registration from '../models/Registration.js'
import { notifyUsers } from '../hooks/notify.js'
import { z } from 'zod'

const router = Router();

// List events (public or authenticated)
router.get('/', optionalAuth, async (req, res) => {
  const { range, category } = req.query
  const now = new Date()
  const query = {}
  if (category) query.category = category
  if (range === 'upcoming') query.date = { $gte: now }
  if (range === 'past') query.date = { $lt: now }
  // Visibility: public/volunteer see only published; manager sees own + published; admin sees all
  if (!req.user) {
    query.status = 'published'
  } else if (req.user.role === 'volunteer') {
    query.status = 'published'
  } else if (req.user.role === 'manager') {
    query.$or = [{ status: 'published' }, { createdBy: req.user.id }]
  } // admin no extra filter
  const events = await Event.find(query).sort({ createdAt: -1 });
  return res.json({ events });
});

// Create event (manager, admin)
// Only manager can create
const eventSchema = z.object({
  name: z.string().min(3),
  date: z.preprocess((v)=> new Date(v), z.date()),
  location: z.string().min(2),
  description: z.string().min(5),
  category: z.string().optional(),
})

router.post('/', authenticate, authorize('manager'), async (req, res) => {
  try {
    const parsed = eventSchema.parse(req.body)
    const payload = { ...parsed, createdBy: req.user.id };
    const event = await Event.create(payload);
    return res.status(201).json({ event });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid event data' });
  }
});

// Get event detail
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  return res.json({ event });
});

// Update event (owner manager or admin)
// Only manager can edit if owner, admin cannot edit per requirement
router.patch('/:id', authenticate, authorize('manager'), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const isOwnerManager = req.user.role === 'manager' && event.createdBy.toString() === req.user.id;
  if (!isOwnerManager) return res.status(403).json({ message: 'Forbidden' });

  try {
    const parsed = eventSchema.partial().parse(req.body)
    Object.assign(event, parsed);
  } catch (e) {
    return res.status(400).json({ message: 'Invalid event data' })
  }
  await event.save();
  return res.json({ event });
});

// Delete event (owner manager or admin)
// Only admin can delete
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  // Admin only

  await event.deleteOne();
  return res.json({ message: 'Deleted' });
});

export default router;

// Manager marks event completed and notifies members
router.post('/:id/complete', authenticate, authorize('manager'), async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  const isOwnerManager = req.user.role === 'manager' && event.createdBy.toString() === req.user.id
  if (!isOwnerManager) return res.status(403).json({ message: 'Forbidden' })
  event.status = 'completed'
  await event.save()
  const regs = await Registration.find({ eventId: event._id, status: 'approved' })
  const memberIds = Array.from(new Set(regs.map(r => r.userId.toString())))
  await notifyUsers(memberIds, { title: 'Sự kiện hoàn thành', body: 'Sự kiện bạn tham gia đã hoàn thành.', eventId: event._id.toString() })
  return res.json({ event })
})


