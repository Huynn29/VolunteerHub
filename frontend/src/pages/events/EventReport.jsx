import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchEventRegistrations, fetchEvent } from '../../services/manager'
import { api } from '../../services/api'

export default function EventReport() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [regs, setRegs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [ev, data] = await Promise.all([ fetchEvent(id), fetchEventRegistrations(id) ])
        setEvent(ev)
        setRegs(data.registrations || [])
      } catch (e) {
        setError('Không thể tải báo cáo (cần quyền admin/manager sở hữu).')
      }
    })()
  }, [id])

  async function approve(regId){
    await api.post(`/registrations/${regId}/approve`)
    const data = await fetchEventRegistrations(id)
    setRegs(data.registrations || [])
  }

  async function reject(regId){
    await api.post(`/registrations/${regId}/reject`)
    const data = await fetchEventRegistrations(id)
    setRegs(data.registrations || [])
  }

  if (error) return <p className="text-red-600">{error}</p>
  if (!event) return <p>Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Báo cáo sự kiện</h1>
      <p className="text-gray-700 mb-4">{event.name} • {new Date(event.date).toLocaleString()}</p>
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Volunteer</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Đăng ký lúc</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {regs.map(r => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{r.userId?.name || r.userId} <span className="text-xs text-gray-500">{r.userId?.email}</span></td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  {r.status==='pending' && (
                    <>
                      <button onClick={()=>approve(r._id)} className="px-2 py-1 bg-blue-600 text-white rounded">Duyệt</button>
                      <button onClick={()=>reject(r._id)} className="px-2 py-1 bg-red-600 text-white rounded">Từ chối</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!regs.length && (
              <tr>
                <td className="p-2" colSpan="4">Chưa có tình nguyện viên đăng ký.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



