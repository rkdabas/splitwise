import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('splitwise_token')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      api.auth.me().then(setUser).catch(() => setUser(null)),
      api.groups.list().then(setGroups).catch(() => setGroups([])),
    ]).finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500 border-r-emerald-400/50" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user && !token) {
    return (
      <div className="relative max-w-2xl">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-300/30 blur-[60px] animate-[orbFloat_12s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute top-20 -right-20 w-40 h-40 rounded-full bg-cyan-300/25 blur-[50px] animate-[orbFloat_10s_ease-in-out_infinite_2s] pointer-events-none" />
        <div className="absolute bottom-40 -left-16 w-44 h-44 rounded-full bg-violet-300/20 blur-[55px] animate-[orbFloat_11s_ease-in-out_infinite_1s] pointer-events-none" />

        <div className="relative text-center py-14 px-4 sm:py-16">
          <h1 className="page-title mb-4 animate-in">Split expenses with friends</h1>
          <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto animate-in-delay-1">
            <span className="keyword">Create groups</span>, <span className="keyword">add expenses</span>, and <span className="keyword">settle up</span> — without the hassle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-in-delay-2">
            <Link to="/login" className="btn-primary px-8 py-3 text-base hover-tilt-3d">Log in</Link>
            <Link to="/users" className="btn-secondary px-8 py-3 text-base transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md active:scale-[0.98] hover-tilt-3d">Create account</Link>
          </div>
        </div>
        <div className="relative grid gap-5 sm:grid-cols-3 mt-14">
          <div className="card-3d-websline p-6 text-center animate-in-delay-3">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold shadow-inner">G</div>
            <div className="section-title mb-1">Groups</div>
            <p className="text-sm text-slate-500"><span className="keyword">Create</span> a group and add friends or flatmates</p>
          </div>
          <div className="card-3d-websline p-6 text-center animate-in-delay-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold shadow-inner">₹</div>
            <div className="section-title mb-1">Expenses</div>
            <p className="text-sm text-slate-500"><span className="keyword">Add</span> bills and split equally or custom</p>
          </div>
          <div className="card-3d-websline p-6 text-center animate-in-delay-5">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold shadow-inner">✓</div>
            <div className="section-title mb-1">Settle up</div>
            <p className="text-sm text-slate-500"><span className="keyword">Record</span> payments and keep balances clear</p>
          </div>
        </div>
      </div>
    )
  }

  const displayName = user?.name || user?.email || 'there'

  return (
    <div className="max-w-3xl">
      <div className="mb-10 animate-in">
        <h1 className="page-title">Hey, {displayName}</h1>
        <p className="mt-1.5 text-slate-500">Here’s your <span className="keyword">expense hub</span></p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-10">
        <Link to="/expenses" className="card-3d-websline flex items-center gap-5 p-6 animate-in-delay-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-600 shadow-inner">+</div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800"><span className="keyword">Add expense</span></div>
            <div className="text-sm text-slate-500">Split a bill with your group</div>
          </div>
        </Link>
        <Link to="/settlements" className="card-3d-websline flex items-center gap-5 p-6 animate-in-delay-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-600 shadow-inner">₹</div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800"><span className="keyword">Settle up</span></div>
            <div className="text-sm text-slate-500">Record who paid whom</div>
          </div>
        </Link>
      </div>

      <section className="animate-in-delay-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Your <span className="keyword">groups</span></h2>
          <Link to="/groups" className="link text-sm font-semibold">Create group</Link>
        </div>
        {groups.length === 0 ? (
          <div className="card rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="mb-5 text-slate-500">You’re not in any groups yet</p>
            <Link to="/groups" className="btn-primary">Create your first group</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {groups.map(g => (
              <li key={g.id}>
                <Link to={`/groups/${g.id}`} className="card-3d-websline block p-5">
                  <div className="font-semibold text-slate-800">{g.name}</div>
                  {g.description && <div className="mt-0.5 truncate text-sm text-slate-500">{g.description}</div>}
                  <div className="mt-2 text-xs text-slate-400">{g.memberIds?.length || 0} members</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
