import EventList from '../events/EventList'
import { useState } from 'react'
import { api } from '../../services/api'

export default function Dashboard() {
  const user = (()=>{ try { return JSON.parse(localStorage.getItem('vh_user')||'null') } catch { return null } })()
  const [pending, setPending] = useState(user?.managerPending)

  async function requestManager() {
    try {
      await api.post('/auth/request-manager')
      setPending(true)
      const u = JSON.parse(localStorage.getItem('vh_user')||'{}')
      u.managerPending = true
      localStorage.setItem('vh_user', JSON.stringify(u))
    } catch {}
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Sự kiện</h1>
      {user && user.role==='volunteer' && (
        <div className="mb-4 p-4 rounded bg-yellow-50 text-yellow-800 flex items-center justify-between">
          <div>
            <div className="font-semibold">Đăng ký trở thành Quản lý sự kiện</div>
            <div className="text-sm">{pending ? 'Yêu cầu của bạn đang chờ admin duyệt.' : 'Bạn có thể gửi yêu cầu để admin duyệt.'}</div>
          </div>
          {!pending && <button onClick={requestManager} className="px-3 py-2 bg-blue-600 text-white rounded">Gửi yêu cầu</button>}
        </div>
      )}
      <EventList />
    </div>
  )
}


