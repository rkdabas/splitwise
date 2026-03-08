import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const { user, token } = await api.auth.login(email, password)
      localStorage.setItem('splitwise_token', token)
      localStorage.setItem('splitwise_userId', user.id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title mb-2 animate-in">Login</h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1">Sign in with your <span className="keyword">email</span> and <span className="keyword">password</span>.</p>
      <form onSubmit={handleLogin} className="card p-8 animate-in-delay-2 shadow-lg hover-tilt-3d bg-white/95 backdrop-blur-sm border-slate-200/90">
        {error && <div className="alert-error mb-6">{error}</div>}
        <div className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-base" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Login</button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account? <Link to="/users" className="link">Register</Link>
        </p>
      </form>
    </div>
  )
}
