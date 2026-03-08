import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'

const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Equal' },
  { value: 'EXACT', label: 'Exact amounts' },
  { value: 'PERCENTAGE', label: 'Percentage' },
]

const defaultCurrency = 'INR'
const defaultSplitType = 'EQUAL'

export default function Expenses() {
  const [searchParams] = useSearchParams()
  const userId = localStorage.getItem('splitwise_userId') || ''
  const groupIdFromUrl = searchParams.get('groupId') || ''

  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amountCents, setAmountCents] = useState('')
  const [currency, setCurrency] = useState(defaultCurrency)
  const [groupId, setGroupId] = useState(groupIdFromUrl)
  const [payerId, setPayerId] = useState(userId)
  const [participantIds, setParticipantIds] = useState([])
  const [splitType, setSplitType] = useState(defaultSplitType)
  const [exactAmountByUserId, setExactAmountByUserId] = useState({})
  const [percentageByUserId, setPercentageByUserId] = useState({})
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    Promise.all([
      api.groups.listForUser(userId).catch(() => []),
      api.users.list().catch(() => []),
    ]).then(([g, u]) => {
      setGroups(g)
      setUsers(u)
      if (groupIdFromUrl) setGroupId(groupIdFromUrl)
    })
  }, [userId, groupIdFromUrl])

  const selectedGroup = groupId ? groups.find(g => g.id === groupId) : null
  const groupMembers = selectedGroup?.memberIds?.length
    ? users.filter(u => selectedGroup.memberIds.includes(u.id))
    : []

  useEffect(() => {
    if (groupId && groups.length && users.length) {
      const g = groups.find(x => x.id === groupId)
      if (g?.memberIds?.length) {
        setParticipantIds(g.memberIds)
        setPayerId(prev => g.memberIds.includes(prev) ? prev : (g.memberIds[0] || userId))
      } else {
        api.groups.get(groupId).then(gr => {
          if (gr.memberIds?.length) {
            setParticipantIds(gr.memberIds)
            setPayerId(prev => gr.memberIds.includes(prev) ? prev : (gr.memberIds[0] || userId))
          }
        }).catch(() => {})
      }
    } else {
      setParticipantIds(userId ? [userId] : [])
    }
  }, [groupId, groups.length, users.length, userId])

  function displayUser(id) {
    const u = users.find(x => x.id === id)
    if (u) return u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`
    return id
  }

  function buildBody() {
    const body = {
      title,
      description: description || null,
      amountCents: Math.round(parseFloat(amountCents) * 100) || 0,
      currency,
      payerId,
      groupId: groupId.trim() || null,
      splitType,
      participantIds: participantIds.filter(Boolean),
    }
    if (splitType === 'EXACT') {
      const map = {}
      participantIds.forEach(id => {
        const val = exactAmountByUserId[id]
        if (val != null && val !== '') {
          const cents = Math.round(parseFloat(String(val).trim()) * 100)
          if (!isNaN(cents)) map[id] = cents
        }
      })
      if (Object.keys(map).length) body.exactAmountsCents = map
    }
    if (splitType === 'PERCENTAGE') {
      const map = {}
      participantIds.forEach(id => {
        const val = percentageByUserId[id]
        if (val != null && val !== '') {
          const pct = parseInt(String(val).trim(), 10)
          if (!isNaN(pct)) map[id] = pct
        }
      })
      if (Object.keys(map).length) body.percentageShares = map
    }
    return body
  }

  function resetForm(keepGroupContext) {
    setTitle('')
    setDescription('')
    setAmountCents('')
    setCurrency(defaultCurrency)
    setPayerId(userId)
    setGroupId(keepGroupContext && groupIdFromUrl ? groupIdFromUrl : '')
    setSplitType(defaultSplitType)
    setExactAmountByUserId({})
    setPercentageByUserId({})
    if (keepGroupContext && groupIdFromUrl) {
      api.groups.get(groupIdFromUrl).then(g => {
        if (g.memberIds?.length) setParticipantIds(g.memberIds)
        else setParticipantIds(userId ? [userId] : [])
      }).catch(() => setParticipantIds(userId ? [userId] : []))
    } else {
      setParticipantIds(userId ? [userId] : [])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCreated(null)
    if (!groupId || !groupId.trim()) {
      setError('Please select a group.')
      return
    }
    if (participantIds.length === 0) {
      setError('Select at least one participant.')
      return
    }
    try {
      const expense = await api.expenses.create(buildBody())
      setCreated(expense)
      resetForm(true)
    } catch (err) {
      setError(err.message)
    }
  }

  function toggleParticipant(id) {
    setParticipantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div>
      <h1 className="page-title mb-2 animate-in">Add expense</h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1">Split a <span className="keyword">bill</span> with a group or between participants.</p>

      {!userId && <div className="alert-warning mb-8">Log in and set your user on the <span className="keyword">Dashboard</span> first.</div>}

      <form onSubmit={handleSubmit} className="card max-w-lg p-8 animate-in-delay-2 shadow-lg">
        {error && <div className="alert-error mb-6">{error}</div>}
        {created && (
          <div className="alert-success mb-6">Expense created: {created.title} — ₹{(created.amountCents / 100).toFixed(2)}</div>
        )}

        <div className="space-y-5">
          <div>
            <label className="label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" step="0.01" value={amountCents} onChange={e => setAmountCents(e.target.value)} className="input-base" required />
            </div>
            <div>
              <label className="label">Currency</label>
              <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <label className="label">Group (required)</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)} className="input-base" required>
              <option value="">Select group…</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Paid by</label>
            <select value={payerId} onChange={e => setPayerId(e.target.value)} className="input-base" required disabled={!groupId}>
              <option value="">Select user…</option>
              {groupMembers.map(u => (
                <option key={u.id} value={u.id}>{u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`}</option>
              ))}
            </select>
            {groupId && !groupMembers.length && <p className="mt-1 text-sm text-slate-500">Select a group to load members.</p>}
          </div>
          <div>
            <label className="label">Participants</label>
            {!groupId ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-500">Select a group above to choose participants from that group.</p>
            ) : (
              <>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  {groupMembers.map(u => (
                    <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-lg py-1.5 hover:bg-white/60">
                      <input type="checkbox" checked={participantIds.includes(u.id)} onChange={() => toggleParticipant(u.id)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-slate-700">{u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`}</span>
                    </label>
                  ))}
                </div>
                {participantIds.length > 0 && <p className="mt-1.5 text-sm text-slate-500">{participantIds.length} selected</p>}
              </>
            )}
          </div>
          <div>
            <label className="label">Split type</label>
            <select value={splitType} onChange={e => setSplitType(e.target.value)} className="input-base">
              {SPLIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {splitType === 'EXACT' && (
            <div>
              <label className="label">Exact amount (₹) per person</label>
              <p className="mb-3 text-sm text-slate-500">Enter how much each participant’s share is in rupees.</p>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                {participantIds.map(id => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm text-slate-700">{displayUser(id)}</span>
                    <span className="text-slate-500">₹</span>
                    <input type="number" step="0.01" min="0" placeholder="0" value={exactAmountByUserId[id] ?? ''} onChange={e => setExactAmountByUserId(prev => ({ ...prev, [id]: e.target.value }))} className="input-base flex-1 py-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {splitType === 'PERCENTAGE' && (
            <div>
              <label className="label">Percentage share per person</label>
              <p className="mb-3 text-sm text-slate-500">Enter each participant’s share as a percentage (should add up to 100).</p>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                {participantIds.map(id => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm text-slate-700">{displayUser(id)}</span>
                    <input type="number" min="0" max="100" placeholder="0" value={percentageByUserId[id] ?? ''} onChange={e => setPercentageByUserId(prev => ({ ...prev, [id]: e.target.value }))} className="input-base w-24 py-2" />
                    <span className="text-slate-500">%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary w-full py-3" disabled={!userId}>Add expense</button>
        </div>
      </form>
    </div>
  )
}
