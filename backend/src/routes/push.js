import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import Subscription from '../models/Subscription.js'
import { getVapidPublicKey } from '../utils/push.js'

const router = Router()

router.get('/vapid-public-key', (req, res) => {
  return res.json({ key: getVapidPublicKey() })
})

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { subscription } = req.body
    if (!subscription?.endpoint) return res.status(400).json({ message: 'Invalid subscription' })
    const doc = await Subscription.findOneAndUpdate(
      { userId: req.user.id, endpoint: subscription.endpoint },
      { ...subscription, userId: req.user.id },
      { upsert: true, new: true }
    )
    return res.status(201).json({ subscription: doc })
  } catch (e) {
    return res.status(400).json({ message: 'Cannot save subscription' })
  }
})

router.post('/unsubscribe', authenticate, async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) return res.status(400).json({ message: 'endpoint required' })
  await Subscription.findOneAndDelete({ userId: req.user.id, endpoint })
  return res.json({ message: 'Unsubscribed' })
})

export default router


