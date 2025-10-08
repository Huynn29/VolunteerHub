import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import EventWall from '../../components/EventWall'
import { approveEvent as adminApprove, rejectEvent as adminReject } from '../../services/admin'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reg, setReg] = useState(null)
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('vh_user')||'null') } catch { return null } })
  const isManagerOwner = user?.role==='manager' && event?.createdBy === user?.id

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [evRes, myRegsRes, meRes] = await Promise.all([
          api.get(`/events/${id}`),
          user?.role === 'volunteer' ? api.get('/registrations/my').catch(()=>({ data:{ registrations: [] }})) : Promise.resolve({ data:{ registrations: [] } }),
          api.get('/auth/me').catch(()=>({ data:{ user: null } }))
        ])
        if (mounted) {
          setEvent(evRes.data.event)
          const regs = myRegsRes.data.registrations || []
          const found = regs.find(r => (r.eventId === id) || (r.event?._id === id) || (r.eventId?.toString?.() === id))
          if (found) setReg(found)
          const me = meRes.data.user
          if (me) {
            setUser({ id: me._id || me.id, name: me.name, email: me.email, role: me.role, managerPending: me.managerPending })
            // sync localStorage so header updates on next render
            const synced = { id: me._id || me.id, name: me.name, email: me.email, role: me.role, managerPending: me.managerPending }
            localStorage.setItem('vh_user', JSON.stringify(synced))
            window.dispatchEvent(new Event('auth-changed'))
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    const t = setInterval(async () => {
      if (!(user?.role === 'volunteer')) return
      try {
        const { data } = await api.get('/registrations/my')
        const regs = data.registrations || []
        const found = regs.find(r => (r.eventId === id) || (r.event?._id === id) || (r.eventId?.toString?.() === id))
        setReg(found || null)
      } catch {}
    }, 5000)
    return () => { mounted = false; clearInterval(t) }
  }, [id])

  async function register() {
    try {
      const { data } = await api.post('/registrations', { eventId: id })
      setReg(data.registration)
    } catch {}
  }

  async function cancelRegistration() {
    try {
      if (!reg?._id) return
      await api.delete(`/registrations/${reg._id}`)
      setReg(null)
    } catch {}
  }

  if (loading) return <p>Đang tải...</p>
  if (!event) return <p>Không tìm thấy sự kiện.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold">{event.name}</h1>
      <p className="text-gray-600">{new Date(event.date).toLocaleString()} • {event.location}</p>
      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${event.status==='published'?'bg-green-100 text-green-700':event.status==='completed'?'bg-gray-200 text-gray-700':'bg-yellow-100 text-yellow-700'}`}>{event.status}</span>
      <p className="mt-3">{event.description}</p>
      <div className="mt-4 space-x-2">
        {user?.role === 'volunteer' && (
          !reg ? (
            <button disabled={event.status!=='published' || new Date(event.date) < new Date()} onClick={register} className={`px-4 py-2 rounded text-white ${event.status!=='published'|| new Date(event.date)<new Date() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}>Đăng ký</button>
          ) : (
            <>
              <span className="inline-block mr-2 text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-700">{reg.status}</span>
              <button onClick={cancelRegistration} className="bg-red-600 text-white px-4 py-2 rounded">Hủy đăng ký</button>
            </>
          )
        )}
        {user?.role==='admin' && event.status!=='published' && (
          <button onClick={async()=>{ await adminApprove(id); const { data } = await api.get(`/events/${id}`); setEvent(data.event) }} className="bg-blue-600 text-white px-4 py-2 rounded">Duyệt</button>
        )}
        {user?.role==='admin' && event.status==='published' && (
          <button onClick={async()=>{ await adminReject(id); const { data } = await api.get(`/events/${id}`); setEvent(data.event) }} className="bg-yellow-600 text-white px-4 py-2 rounded">Thu hồi</button>
        )}
      </div>

      {event.status==='published' && <EventWall eventId={id} />}
      {user?.role==='manager' && isManagerOwner && (
        <div className="mt-4 space-x-2">
          <Link className="text-blue-600" to={`/events/${id}/edit`}>Sửa sự kiện</Link>
          <Link className="text-blue-600" to={`/events/${id}/report`}>Duyệt đăng ký TNV</Link>
        </div>
      )}
    </div>
  )
}


