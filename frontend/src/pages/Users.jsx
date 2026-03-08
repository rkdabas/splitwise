import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

export default function Users() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    try {
      await api.users.create(name, email, password)
      setName('')
      setEmail('')
      setPassword('')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="page-title mb-2 animate-in">Create account</h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1">Register with <span className="keyword">name</span>, <span className="keyword">email</span> and <span className="keyword">password</span>.</p>

      <form onSubmit={handleRegister} className="card mb-8 max-w-md p-8 animate-in-delay-2 shadow-lg">
        <h2 className="section-title mb-1">Register</h2>
        <p className="mb-6 text-sm text-slate-500">Your <span className="keyword">profile</span> will show your account details after you sign in.</p>
        {error && <div className="alert-error mb-6">{error}</div>}
        <div className="space-y-5">
          <div>
            <label className="label">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-base" minLength={6} required />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Register</button>
        </div>
      </form>

      <p className="text-sm text-slate-500">Already have an account? <Link to="/login" className="link">Login</Link></p>
    </div>
  )
}
