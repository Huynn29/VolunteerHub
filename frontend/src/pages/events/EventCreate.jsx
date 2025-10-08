import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../../services/manager'

export default function EventCreate() {
  const [form, setForm] = useState({ name: '', date: '', location: '', description: '', category: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function onChange(e){ setForm({ ...form, [e.target.name]: e.target.value }) }

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    if (!form.name || !form.date || !form.location || !form.description) {
      setError('Vui lòng nhập đủ thông tin')
      return
    }
    try {
      const ev = await createEvent(form)
      navigate(`/events/${ev._id}`)
    } catch (e) {
      setError('Tạo sự kiện thất bại')
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Tạo sự kiện</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="name" value={form.name} onChange={onChange} className="w-full border p-2 rounded" placeholder="Tên sự kiện" />
        <input name="date" type="datetime-local" value={form.date} onChange={onChange} className="w-full border p-2 rounded" />
        <input name="location" value={form.location} onChange={onChange} className="w-full border p-2 rounded" placeholder="Địa điểm" />
        <input name="category" value={form.category} onChange={onChange} className="w-full border p-2 rounded" placeholder="Danh mục (tuỳ chọn)" />
        <textarea name="description" value={form.description} onChange={onChange} className="w-full border p-2 rounded" placeholder="Mô tả" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Tạo</button>
      </form>
    </div>
  )
}



