import { api } from './api'

export async function createEvent(payload) {
  return (await api.post('/events', payload)).data.event
}

export async function updateEvent(id, payload) {
  return (await api.patch(`/events/${id}`, payload)).data.event
}

export async function fetchEvent(id) {
  return (await api.get(`/events/${id}`)).data.event
}

export async function fetchEventRegistrations(id) {
  // backend allows admin or owning manager
  return (await api.get(`/admin/events/${id}/registrations`)).data
}



