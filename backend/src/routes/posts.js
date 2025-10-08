import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Registration from '../models/Registration.js'
import { notifyUsers } from '../hooks/notify.js'
import Event from '../models/Event.js'

const router = Router();

// List feed
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  return res.json({ posts });
});

// Create post
router.post('/', authenticate, async (req, res) => {
  try {
    const { eventId, content } = req.body;
    if (!content) return res.status(400).json({ message: 'content required' });
    if (eventId) {
      const ev = await Event.findById(eventId)
      if (!ev) return res.status(404).json({ message: 'Event not found' })
      if (ev.status !== 'published') return res.status(403).json({ message: 'Event is not published yet' })
    }
    const post = await Post.create({ eventId, content, authorId: req.user.id });
    if (eventId) {
      const regs = await Registration.find({ eventId })
      const memberIds = Array.from(new Set(regs.map(r => r.userId.toString())))
      await notifyUsers(memberIds, { title: 'Bài viết mới', body: 'Có bài viết mới trong sự kiện.', eventId })
    }
    return res.status(201).json({ post });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid data' });
  }
});

// Like post
router.post('/:id/like', authenticate, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const userId = req.user.id;
  if (!post.likes.find((id) => id.toString() === userId)) {
    post.likes.push(userId);
    await post.save();
  }
  return res.json({ post });
});

// Comment on post
router.post('/:id/comment', authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content required' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push({ authorId: req.user.id, content });
  await post.save();
  return res.status(201).json({ post });
});

export default router;


