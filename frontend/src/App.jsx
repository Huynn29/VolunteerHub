import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Home from './pages/Home.jsx'
import EventDetail from './pages/events/EventDetail.jsx'
import EventCreate from './pages/events/EventCreate.jsx'
import EventEdit from './pages/events/EventEdit.jsx'
import EventReport from './pages/events/EventReport.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'
import { ensurePushSubscription } from './services/push'

function useAuthUser() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('vh_user')
    return raw ? JSON.parse(raw) : null
  })
  useEffect(() => {
    const handler = () => {
      const raw = localStorage.getItem('vh_user')
      setUser(raw ? JSON.parse(raw) : null)
    }
    window.addEventListener('auth-changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('auth-changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return user
}

function getUser() {
  const raw = localStorage.getItem('vh_user')
  return raw ? JSON.parse(raw) : null
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('vh_token')
  return token ? children : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles = [] }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  const user = useAuthUser()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-semibold">VolunteerHub</Link>
          <nav className="space-x-4">
            <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user?.role === 'manager' && <Link to="/events/create">Tạo sự kiện</Link>}
            {user ? (
              <button onClick={()=>{ localStorage.removeItem('vh_token'); localStorage.removeItem('vh_user'); window.dispatchEvent(new Event('auth-changed')); navigate('/') }} className="text-red-600">Đăng xuất</button>
            ) : <Link to="/login">Login</Link>}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default function App() {
  useEffect(() => { ensurePushSubscription().catch(()=>{}) }, [])
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/create" element={<PrivateRoute><RoleRoute roles={["manager"]}><EventCreate /></RoleRoute></PrivateRoute>} />
        <Route path="/events/:id/edit" element={<PrivateRoute><RoleRoute roles={["manager"]}><EventEdit /></RoleRoute></PrivateRoute>} />
        <Route path="/events/:id/report" element={<PrivateRoute><RoleRoute roles={["manager","admin"]}><EventReport /></RoleRoute></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><RoleRoute roles={["admin"]}><AdminPanel /></RoleRoute></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}


