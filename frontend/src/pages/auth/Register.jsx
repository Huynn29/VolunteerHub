import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('volunteer')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      localStorage.setItem('vh_token', data.token)
      localStorage.setItem('vh_user', JSON.stringify(data.user))
      // no reactive dispatch; page will navigate
      const next = data.user.role === 'admin' ? '/admin' : '/dashboard'
      navigate(next)
    } catch (err) {
      setError(err.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Đăng ký</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="text-gray-700">Họ tên</span>
          <input className="mt-1 w-full border p-2 rounded" placeholder="Nguyễn Văn A" value={name} onChange={(e)=>setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Email</span>
          <input className="mt-1 w-full border p-2 rounded" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Mật khẩu</span>
          <input className="mt-1 w-full border p-2 rounded" placeholder="••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Vai trò mong muốn</span>
          <select className="mt-1 w-full border p-2 rounded" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="volunteer">Tình nguyện viên</option>
          <option value="manager">Quản lý sự kiện</option>
          </select>
          <span className="text-xs text-gray-500">Chọn Quản lý sự kiện sẽ gửi yêu cầu chờ admin duyệt.</span>
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Đăng ký</button>
      </form>
      <p className="text-sm mt-3">Đã có tài khoản? <Link className="text-blue-600" to="/login">Đăng nhập</Link></p>
    </div>
  )
}


