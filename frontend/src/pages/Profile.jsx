import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.auth.me().then(setUser).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  function logout() {
    localStorage.removeItem('splitwise_token')
    localStorage.removeItem('splitwise_userId')
    navigate('/login', { replace: true })
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
      </div>
    )
  }
  if (error)
    return (
      <div className="card max-w-md p-6">
        <p className="alert-error">{error}</p>
        <Link to="/login" className="link mt-4 inline-block">Login</Link>
      </div>
    )
  if (!user) return null

  return (
    <div>
      <h1 className="page-title mb-2 animate-in">Your <span className="keyword">profile</span></h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1">Account details and preferences.</p>
      <div className="card max-w-md space-y-6 p-8 animate-in-delay-2 shadow-lg">
        <div>
          <label className="label text-slate-500">User ID</label>
          <p className="font-mono text-lg font-semibold text-slate-800">{user.id}</p>
          <p className="mt-0.5 text-xs text-slate-500">Primary key for your account.</p>
        </div>
        <div>
          <label className="label text-slate-500">Name</label>
          <p className="text-slate-800"><span className="keyword">{user.name}</span></p>
        </div>
        <div>
          <label className="label text-slate-500">Email</label>
          <p className="text-slate-800"><span className="keyword">{user.email}</span></p>
        </div>
        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <Link to="/" className="link text-sm">Back to Dashboard</Link>
          <button type="button" onClick={logout} className="text-sm font-medium text-red-600 hover:underline">Logout</button>
        </div>
      </div>
    </div>
  )
}
