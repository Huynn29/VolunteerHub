import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [wantManager, setWantManager] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('vh_token', data.token)
      localStorage.setItem('vh_user', JSON.stringify(data.user))
      // request manager if chosen and eligible
      if (wantManager && data.user.role === 'volunteer' && !data.user.managerPending) {
        try {
          await api.post('/auth/request-manager')
          const u = JSON.parse(localStorage.getItem('vh_user')||'{}')
          u.managerPending = true
          localStorage.setItem('vh_user', JSON.stringify(u))
        } catch {}
      }
      window.dispatchEvent(new Event('auth-changed'))
      const role = data.user.role
      if (role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="text-gray-700">Email</span>
          <input className="mt-1 w-full border p-2 rounded" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Mật khẩu</span>
          <input className="mt-1 w-full border p-2 rounded" placeholder="••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={wantManager} onChange={(e)=>setWantManager(e.target.checked)} />
          <span>Tôi muốn đăng ký làm Quản lý sự kiện</span>
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Đăng nhập</button>
      </form>
      <p className="text-sm mt-3">Chưa có tài khoản? <Link className="text-blue-600" to="/register">Đăng ký</Link></p>
    </div>
  )
}


