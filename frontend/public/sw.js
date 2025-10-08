self.addEventListener('push', function(event) {
  if (!event.data) return
  const payload = event.data.json()
  const title = payload.title || 'VolunteerHub'
  const options = {
    body: payload.body || '',
    data: payload,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = payloadToUrl(event.notification.data)
  event.waitUntil(clients.openWindow(url))
})

function payloadToUrl(data) {
  if (data?.eventId) return `/events/${data.eventId}`
  return '/'
}


