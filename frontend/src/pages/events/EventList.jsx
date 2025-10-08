import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

export default function EventList() {
  const [events, setEvents] = useState([])
  const [q, setQ] = useState('')
  const [range, setRange] = useState('all') // all | upcoming | past
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/events', { params: { range: range === 'all' ? undefined : range, category: category || undefined } })
        if (mounted) setEvents(data.events || [])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [range, category])

  const filtered = useMemo(() => {
    const now = new Date()
    return events.filter(e => {
      const matchQ = q ? (e.name?.toLowerCase().includes(q.toLowerCase()) || e.location?.toLowerCase().includes(q.toLowerCase())) : true
      const dt = new Date(e.date)
      const matchRange = range === 'all' ? true : range === 'upcoming' ? dt >= now : dt < now
      return matchQ && matchRange
    })
  }, [events, q, range])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 mb-4">
        <input className="border p-2 rounded w-full md:w-1/3" placeholder="Tìm kiếm" value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="border p-2 rounded md:w-40" value={range} onChange={(e)=>setRange(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="past">Đã diễn ra</option>
        </select>
        <input className="border p-2 rounded md:w-48" placeholder="Danh mục (vd: môi trường)" value={category} onChange={(e)=>setCategory(e.target.value)} />
      </div>
      {loading ? <p>Đang tải...</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => (
            <div key={e._id} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold text-lg mb-1">{e.name}</h3>
              <p className="text-sm text-gray-600">{new Date(e.date).toLocaleString()} • {e.location}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${e.status==='published'?'bg-green-100 text-green-700':e.status==='completed'?'bg-gray-200 text-gray-700':'bg-yellow-100 text-yellow-700'}`}>{e.status}</span>
              <p className="mt-2 line-clamp-3">{e.description}</p>
              <div className="mt-3 flex justify-between">
                <Link className="text-blue-600" to={`/events/${e._id}`}>Chi tiết</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


