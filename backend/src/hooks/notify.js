import Subscription from '../models/Subscription.js'
import { sendPush } from '../utils/push.js'

export async function notifyUsers(userIds, payload) {
  if (!userIds?.length) return
  const subs = await Subscription.find({ userId: { $in: userIds } })
  await Promise.all(subs.map(sub => sendPush({
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime,
    keys: sub.keys,
  }, payload)))
}


