import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:admin@volunteerhub.local', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY
}

export async function sendPush(subscription, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (err) {
    // swallow errors to avoid crashing the request flow
  }
}


