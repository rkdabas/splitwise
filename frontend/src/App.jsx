import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Expenses from './pages/Expenses'
import Settlements from './pages/Settlements'
import { api } from './api'

function Nav() {
  const loc = useLocation()
  const navigate = useNavigate()
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('splitwise_token') : null
  const link = (path, label) => {
    const isActive = loc.pathname === path
    return (
      <Link
        to={path}
        className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-y-[-1px] ${
          isActive ? 'text-emerald-700 bg-emerald-50 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {label}
      </Link>
    )
  }
  function handleLogout() {
    api.auth.logout().catch(() => {})
    localStorage.removeItem('splitwise_token')
    localStorage.removeItem('splitwise_userId')
    navigate('/login', { replace: true })
    window.location.reload()
  }
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 h-16">
        <Link to="/" className="mr-2 flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-900 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-50">
          <span className="text-emerald-600 drop-shadow-sm">Splitwise</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {link('/', 'Dashboard')}
          {link('/groups', 'Groups')}
          {link('/expenses', 'Expenses')}
          {link('/settlements', 'Settle')}
          {link('/users', 'Sign up')}
          {token ? (
            <>
              {link('/profile', 'Profile')}
              <button type="button" onClick={handleLogout} className="relative px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200">Logout</button>
            </>
          ) : (
            link('/login', 'Login')
          )}
        </div>
      </div>
    </nav>
  )
}

function OrbsBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div className="orb-3d orb-3d--emerald orb-3d--slow w-[320px] h-[320px] -top-32 -right-20 opacity-40" />
      <div className="orb-3d orb-3d--cyan w-[240px] h-[240px] top-1/3 -left-16 opacity-35" />
      <div className="orb-3d orb-3d--violet w-[280px] h-[280px] bottom-20 right-1/4 opacity-30" />
      <div className="orb-3d orb-3d--amber w-[180px] h-[180px] bottom-1/3 left-1/3 opacity-25" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <OrbsBackground />
      <Nav />
      <main className="relative z-10 mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:py-10 scene-3d">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settlements" element={<Settlements />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
