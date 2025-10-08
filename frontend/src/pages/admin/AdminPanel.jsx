import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'
import { CSVLink } from 'react-csv'
import { saveAs } from 'file-saver'
import { approveEvent as adminApprove, rejectEvent as adminReject } from '../../services/admin'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const [u, e, m] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/events'),
        api.get('/admin/manager-requests'),
      ])
      setUsers(u.data.users || [])
      setEvents(e.data.events || [])
      setRequests(m.data.requests || [])
    } catch (e) {
      setError('Không thể tải dữ liệu admin (cần quyền admin).')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function lockUser(id, isLock) {
    if (isLock) await api.post(`/admin/users/${id}/lock`)
    else await api.post(`/admin/users/${id}/unlock`)
    load()
  }

  async function approveEvent(id) {
    await adminApprove(id)
    load()
  }

  async function rejectEvent(id) {
    await adminReject(id)
    load()
  }

  async function deleteEvent(id) {
    await api.delete(`/events/${id}`)
    load()
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ users, events }, null, 2)], { type: 'application/json;charset=utf-8' })
    saveAs(blob, 'admin-export.json')
  }

  const userCsv = useMemo(() => users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, isLocked: u.isLocked })), [users])
  const eventCsv = useMemo(() => events.map(e => ({ id: e._id, name: e.name, date: e.date, status: e.status, createdBy: e.createdBy })), [events])
  const [requests, setRequests] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <div className="space-x-2">
          <CSVLink data={userCsv} filename="users.csv" className="bg-blue-600 text-white px-3 py-2 rounded">Export Users CSV</CSVLink>
          <CSVLink data={eventCsv} filename="events.csv" className="bg-blue-600 text-white px-3 py-2 rounded">Export Events CSV</CSVLink>
          <button onClick={exportJSON} className="bg-gray-800 text-white px-3 py-2 rounded">Export JSON</button>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? <p>Đang tải...</p> : (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Người dùng</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Tên</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Trạng thái</th>
                    <th className="p-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">{u.isLocked ? 'Đã khóa' : 'Hoạt động'}</td>
                      <td className="p-2 space-x-2">
                        {u.isLocked ? (
                          <button onClick={()=>lockUser(u._id, false)} className="px-2 py-1 bg-green-600 text-white rounded">Mở khóa</button>
                        ) : (
                          <button onClick={()=>lockUser(u._id, true)} className="px-2 py-1 bg-red-600 text-white rounded">Khóa</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Sự kiện</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Tên</th>
                    <th className="p-2">Ngày</th>
                    <th className="p-2">Trạng thái</th>
                    <th className="p-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e._id} className="border-b">
                      <td className="p-2">{e.name}</td>
                      <td className="p-2">{new Date(e.date).toLocaleString()}</td>
                      <td className="p-2">{e.status}</td>
                      <td className="p-2 space-x-2">
                        {e.status !== 'published' && (
                          <button onClick={()=>approveEvent(e._id)} className="px-2 py-1 bg-blue-600 text-white rounded">Duyệt</button>
                        )}
                        {e.status === 'published' && (
                          <button onClick={()=>rejectEvent(e._id)} className="px-2 py-1 bg-yellow-600 text-white rounded">Thu hồi</button>
                        )}
                        <button onClick={()=>deleteEvent(e._id)} className="px-2 py-1 bg-red-600 text-white rounded">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="font-semibold mb-2">Yêu cầu trở thành Quản lý</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Tên</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Trạng thái</th>
                    <th className="p-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id} className="border-b">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">{r.managerPending ? 'Chờ duyệt' : '-'}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={async()=>{ await api.post(`/admin/manager-requests/${r._id}/approve`); load() }} className="px-2 py-1 bg-blue-600 text-white rounded">Duyệt</button>
                        <button onClick={async()=>{ await api.post(`/admin/manager-requests/${r._id}/reject`); load() }} className="px-2 py-1 bg-red-600 text-white rounded">Từ chối</button>
                      </td>
                    </tr>
                  ))}
                  {!requests.length && (
                    <tr><td className="p-2" colSpan="4">Không có yêu cầu nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}


