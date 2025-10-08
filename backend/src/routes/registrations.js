import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { notifyUsers } from '../hooks/notify.js';

const router = Router();

// Volunteer registers for an event
// Only volunteer can register
router.post('/', authenticate, authorize('volunteer'), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId required' });
    const ev = await Event.findById(eventId)
    if (!ev) return res.status(404).json({ message: 'Event not found' })
    const now = new Date()
    if (ev.status !== 'published') return res.status(400).json({ message: 'Event not open for registration' })
    if (ev.date < now) return res.status(400).json({ message: 'Event already started or ended' })
    const reg = await Registration.create({ userId: req.user.id, eventId, status: 'pending' });
    await notifyUsers([req.user.id, ev.createdBy], { title: 'Đăng ký sự kiện', body: 'Bạn vừa đăng ký một sự kiện.', eventId })
    return res.status(201).json({ registration: reg });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Already registered' });
    return res.status(400).json({ message: 'Invalid data' });
  }
});

// Volunteer cancels his registration
router.delete('/:id', authenticate, authorize('volunteer'), async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ message: 'Registration not found' });
  if (reg.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const ev = await Event.findById(reg.eventId)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  const now = new Date()
  if (ev.date < now) return res.status(400).json({ message: 'Event already started' })
  await reg.deleteOne();
  await notifyUsers([req.user.id, ev.createdBy], { title: 'Hủy đăng ký', body: 'Bạn vừa hủy đăng ký một sự kiện.', eventId: reg.eventId.toString() })
  return res.json({ message: 'Cancelled' });
});

// Volunteer views his registrations
router.get('/my', authenticate, authorize('volunteer'), async (req, res) => {
  const regs = await Registration.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const eventIds = regs.map(r => r.eventId)
  const events = await Event.find({ _id: { $in: eventIds } }).lean()
  const eventById = new Map(events.map(e => [e._id.toString(), e]))
  const enriched = regs.map(r => ({ ...r, event: eventById.get(r.eventId.toString()) }))
  return res.json({ registrations: enriched });
});

export default router;

// Manager approves a registration
router.post('/:id/approve', authenticate, authorize('manager'), async (req, res) => {
  const reg = await Registration.findById(req.params.id)
  if (!reg) return res.status(404).json({ message: 'Registration not found' })
  const ev = await Event.findById(reg.eventId)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  const isOwnerManager = req.user.role === 'manager' && ev.createdBy.toString() === req.user.id
  if (!isOwnerManager) return res.status(403).json({ message: 'Forbidden' })
  reg.status = 'approved'
  await reg.save()
  await notifyUsers([reg.userId], { title: 'Đăng ký được duyệt', body: 'Đơn đăng ký của bạn đã được duyệt.', eventId: reg.eventId.toString() })
  return res.json({ registration: reg })
})

// Manager rejects a registration
router.post('/:id/reject', authenticate, authorize('manager'), async (req, res) => {
  const reg = await Registration.findById(req.params.id)
  if (!reg) return res.status(404).json({ message: 'Registration not found' })
  const ev = await Event.findById(reg.eventId)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  const isOwnerManager = req.user.role === 'manager' && ev.createdBy.toString() === req.user.id
  if (!isOwnerManager) return res.status(403).json({ message: 'Forbidden' })
  reg.status = 'rejected'
  await reg.save()
  await notifyUsers([reg.userId], { title: 'Đăng ký bị từ chối', body: 'Đơn đăng ký của bạn đã bị từ chối.', eventId: reg.eventId.toString() })
  return res.json({ registration: reg })
})

// Manager marks volunteer as completed after event
router.post('/:id/complete', authenticate, authorize('manager'), async (req, res) => {
  const reg = await Registration.findById(req.params.id)
  if (!reg) return res.status(404).json({ message: 'Registration not found' })
  const ev = await Event.findById(reg.eventId)
  if (!ev) return res.status(404).json({ message: 'Event not found' })
  const isOwnerManager = req.user.role === 'manager' && ev.createdBy.toString() === req.user.id
  if (!isOwnerManager) return res.status(403).json({ message: 'Forbidden' })
  reg.status = 'completed'
  await reg.save()
  await notifyUsers([reg.userId], { title: 'Hoàn thành sự kiện', body: 'Trạng thái của bạn đã được cập nhật hoàn thành.', eventId: reg.eventId.toString() })
  return res.json({ registration: reg })
})


