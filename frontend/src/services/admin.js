import { api } from './api'

export async function approveEvent(id) {
  return (await api.post(`/admin/events/${id}/approve`)).data.event
}

export async function rejectEvent(id) {
  return (await api.post(`/admin/events/${id}/reject`)).data.event
}



