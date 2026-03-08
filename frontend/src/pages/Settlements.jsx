import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Settlements() {
  const token = localStorage.getItem('splitwise_token')
  const userId = localStorage.getItem('splitwise_userId') || ''
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [balancesByGroup, setBalancesByGroup] = useState([])
  const [groupId, setGroupId] = useState('')
  const [fromUserId, setFromUserId] = useState(userId)
  const [toUserId, setToUserId] = useState('')
  const [amountCents, setAmountCents] = useState('')
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')

  const selectedGroup = groupId ? groups.find(g => g.id === groupId) : null
  const groupMembers = selectedGroup?.memberIds?.length
    ? users.filter(u => selectedGroup.memberIds.includes(u.id))
    : []

  useEffect(() => {
    if (!token) return
    api.groups.list().then(async (g) => {
      setGroups(g)
      const u = await api.users.list().catch(() => [])
      setUsers(u)
      if (g.length && !groupId) setGroupId(g[0].id)
      const byGroup = await Promise.all(
        g.map(async (gr) => {
          const b = await api.balances.get(gr.id).catch(() => [])
          return { group: gr, balances: b }
        })
      )
      setBalancesByGroup(byGroup)
    }).catch(() => setGroups([]))
  }, [token])

  useEffect(() => {
    if (groupId && groups.length && users.length) {
      const g = groups.find(x => x.id === groupId)
      const memberIds = g?.memberIds || []
      setFromUserId(prev => memberIds.includes(prev) ? prev : (memberIds[0] || ''))
      setToUserId(prev => memberIds.includes(prev) ? prev : (memberIds[1] || memberIds[0] || ''))
    }
  }, [groupId, groups.length, users.length])

  function displayUserName(id) {
    const u = users.find(x => x.id === id)
    if (u) return u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`
    return id
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCreated(null)
    if (!groupId || !groupId.trim()) {
      setError('Please select a group.')
      return
    }
    const cents = Math.round(parseFloat(amountCents) * 100)
    if (!cents || cents <= 0) {
      setError('Enter a valid amount.')
      return
    }
    try {
      const s = await api.settlements.create(fromUserId, toUserId, cents, groupId.trim())
      setAmountCents('')
      const group = groups.find(g => g.id === groupId)
      setCreated({ ...s, groupName: group?.name })
      const byGroup = await Promise.all(
        groups.map(async (gr) => {
          const b = await api.balances.get(gr.id).catch(() => [])
          return { group: gr, balances: b }
        })
      )
      setBalancesByGroup(byGroup)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="page-title mb-2 animate-in">Settle up</h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1">See what you <span className="keyword">owe</span> and who <span className="keyword">owes you</span> by group, then <span className="keyword">record a payment</span> below.</p>

      {!token && <div className="alert-warning mb-8">Please <Link to="/login" className="link">log in</Link> to see balances and record settlements.</div>}

      {token && balancesByGroup.length > 0 && (
        <section className="mb-10">
          <h2 className="section-title mb-4">What you need to pay / get — by group</h2>
          <div className="space-y-4">
            {balancesByGroup.map(({ group, balances }) => {
              const youOwe = balances.filter(b => b.fromUserId === userId)
              const youAreOwed = balances.filter(b => b.toUserId === userId)
              const hasAny = youOwe.length > 0 || youAreOwed.length > 0
              return (
                <div key={group.id} className="card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                    <span className="font-semibold text-slate-800">{group.name}</span>
                    <Link to={`/groups/${group.id}`} className="link text-sm">View group</Link>
                  </div>
                  <div className="space-y-4 p-5">
                    {!hasAny ? (
                      <p className="text-sm text-slate-500">Nothing to pay or receive in this group.</p>
                    ) : (
                      <>
                        {youOwe.length > 0 && (
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-600">You owe</div>
                            <ul className="space-y-1.5">
                              {youOwe.map(b => (
                                <li key={`${b.fromUserId}-${b.toUserId}`} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-700">to {displayUserName(b.toUserId)}</span>
                                  <span className="font-semibold text-rose-600">₹{(b.amountCents / 100).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {youAreOwed.length > 0 && (
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">You are owed</div>
                            <ul className="space-y-1.5">
                              {youAreOwed.map(b => (
                                <li key={`${b.fromUserId}-${b.toUserId}`} className="flex items-center justify-between text-sm">
                                  <span className="text-slate-700">{displayUserName(b.fromUserId)} owes you</span>
                                  <span className="font-semibold text-emerald-600">₹{(b.amountCents / 100).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <h2 className="section-title mb-4">Record a payment</h2>
      <form onSubmit={handleSubmit} className="card max-w-md p-8 shadow-lg">
        {error && <div className="alert-error mb-6">{error}</div>}
        {created && (
          <div className="alert-success mb-6">
            Settlement recorded in <strong>{created.groupName || 'group'}</strong>: {displayUserName(created.fromUserId)} paid {displayUserName(created.toUserId)} ₹{(created.amountCents / 100).toFixed(2)}. <Link to={`/groups/${groupId}`} className="underline">View group</Link>
          </div>
        )}
        <div className="space-y-5">
          <div>
            <label className="label">Group (required)</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)} className="input-base" required>
              <option value="">Select group by name…</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From (who paid)</label>
            <select value={fromUserId} onChange={e => setFromUserId(e.target.value)} className="input-base" required disabled={!groupId}>
              <option value="">Select user…</option>
              {groupMembers.map(u => (
                <option key={u.id} value={u.id}>{u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">To (who received)</label>
            <select value={toUserId} onChange={e => setToUserId(e.target.value)} className="input-base" required disabled={!groupId}>
              <option value="">Select user…</option>
              {groupMembers.map(u => (
                <option key={u.id} value={u.id}>{u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" step="0.01" value={amountCents} onChange={e => setAmountCents(e.target.value)} className="input-base" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={!token}>Record settlement</button>
        </div>
      </form>
    </div>
  )
}
