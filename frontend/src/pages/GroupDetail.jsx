import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [balances, setBalances] = useState([])
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingGroup, setEditingGroup] = useState(false)
  const [editGroupName, setEditGroupName] = useState('')
  const [editGroupDesc, setEditGroupDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = localStorage.getItem('splitwise_userId') || ''
  const [expandedExpenseId, setExpandedExpenseId] = useState(null)
  const [expandedSettlementId, setExpandedSettlementId] = useState(null)

  function load() {
    if (!groupId) return
    setLoading(true)
    Promise.all([
      api.groups.get(groupId),
      api.balances.getForGroup(groupId),
      api.expenses.listForGroup(groupId),
      api.settlements.listForGroup(groupId).catch(() => []),
      api.users.list().catch(() => []),
    ])
      .then(([g, b, e, s, u]) => {
        setGroup(g)
        setBalances(b)
        setExpenses(e)
        setSettlements(s)
        setUsers(u)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  function formatDate(epochMs) {
    if (epochMs == null || epochMs <= 0) return '—'
    const d = new Date(epochMs)
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
  }

  useEffect(() => {
    load()
  }, [groupId, userId])

  const memberIdsSet = group ? new Set(group.memberIds) : new Set()
  const availableUsers = users.filter(u => !memberIdsSet.has(u.id))

  function displayUserName(id) {
    const u = users.find(x => x.id === id)
    if (u) return u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`
    return id
  }

  async function addMemberByDropdown(e) {
    e.preventDefault()
    if (!selectedUserId) return
    setError('')
    try {
      await api.groups.addMember(groupId, selectedUserId)
      const g = await api.groups.get(groupId)
      setGroup(g)
      setSelectedUserId('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function addMemberByName(e) {
    e.preventDefault()
    const name = newMemberName.trim()
    if (!name) return
    setError('')
    try {
      const guest = await api.users.createGuest(name)
      await api.groups.addMember(groupId, guest.id)
      const [g, u] = await Promise.all([api.groups.get(groupId), api.users.list()])
      setGroup(g)
      setUsers(u)
      setNewMemberName('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeMember(memberId) {
    if (!confirm('Remove this member from the group?')) return
    setError('')
    try {
      await api.groups.removeMember(groupId, memberId)
      const g = await api.groups.get(groupId)
      setGroup(g)
      setEditingMemberId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveEditMember() {
    if (!editingMemberId || !editingName.trim()) return
    setError('')
    try {
      await api.users.updateName(editingMemberId, editingName.trim())
      const u = await api.users.list()
      setUsers(u)
      setEditingMemberId(null)
      setEditingName('')
    } catch (err) {
      setError(err.message)
    }
  }

  function startEditGroup() {
    setEditGroupName(group.name)
    setEditGroupDesc(group.description || '')
    setEditingGroup(true)
  }

  async function saveEditGroup() {
    setError('')
    try {
      const g = await api.groups.update(groupId, { name: editGroupName.trim(), description: editGroupDesc.trim() })
      setGroup(g)
      setEditingGroup(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteGroup() {
    if (!confirm('Delete this group? All expenses and settlements in it will be removed. This cannot be undone.')) return
    setError('')
    try {
      await api.groups.delete(groupId)
      navigate('/groups')
    } catch (err) {
      setError(err.message)
    }
  }

  async function markAsDone() {
    setError('')
    try {
      const g = await api.groups.markAsDone(groupId)
      setGroup(g)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
      </div>
    )
  }
  if (!group) return <p className="text-slate-500">Group not found.</p>

  const totalExpenseCents = expenses.reduce((sum, e) => sum + e.amountCents, 0)
  const unsettledCents = balances.reduce((sum, b) => sum + b.amountCents, 0)
  const isSettled = group.settledAtEpochMs != null && group.settledAtEpochMs > 0
  const canMarkDone = !isSettled && unsettledCents === 0

  return (
    <div>
      <Link to="/groups" className="link mb-6 inline-block transition-transform hover:translate-x-[-2px]">← Groups</Link>
      <div className="mb-2 flex flex-wrap items-center gap-3 animate-in">
        {editingGroup ? (
          <div className="flex flex-col gap-2">
            <input type="text" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="input-base max-w-md py-2" placeholder="Group name" />
            <input type="text" value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} className="input-base max-w-md py-2" placeholder="Description (optional)" />
            <div className="flex gap-2">
              <button type="button" onClick={saveEditGroup} className="btn-primary py-2">Save</button>
              <button type="button" onClick={() => setEditingGroup(false)} className="py-2 text-slate-500 hover:underline">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="page-title"><span className="keyword">{group.name}</span></h1>
            {isSettled && <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">Done</span>}
            <button type="button" onClick={startEditGroup} className="text-sm text-slate-500 hover:underline">Edit name</button>
          </>
        )}
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-500 animate-in-delay-1">
        {!editingGroup && group.description && <span>{group.description}</span>}
        {group.createdAtEpochMs != null && group.createdAtEpochMs > 0 && (
          <span>Group created {formatDate(group.createdAtEpochMs)}</span>
        )}
        {isSettled && group.settledAtEpochMs != null && (
          <span>Marked done {formatDate(group.settledAtEpochMs)}</span>
        )}
      </div>

      {error && <div className="alert-error mb-8">{error}</div>}

      <div className="mb-10 grid gap-5 sm:grid-cols-2">
        <div className="card-3d-websline p-6 animate-in-delay-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500"><span className="keyword">Total trip expense</span></div>
          <div className="mt-1 text-2xl font-bold text-slate-800">₹{(totalExpenseCents / 100).toFixed(2)}</div>
          <div className="mt-0.5 text-xs text-slate-400">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="card-3d-websline p-6 animate-in-delay-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500"><span className="keyword">Still to be settled</span></div>
          <div className="mt-1 text-2xl font-bold text-amber-600">₹{(unsettledCents / 100).toFixed(2)}</div>
          <div className="mt-0.5 text-xs text-slate-400">Outstanding across the group</div>
          {canMarkDone && (
            <button type="button" onClick={markAsDone} className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Mark as done</button>
          )}
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        <button type="button" onClick={deleteGroup} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete group</button>
      </div>

      <section className="mb-10">
        <h2 className="section-title mb-4">Members</h2>
        <ul className="mb-5 flex flex-wrap gap-2">
          {group.memberIds.map(id => {
            const u = users.find(x => x.id === id)
            const isEditing = editingMemberId === id
            return (
              <li key={id} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm">
                {isEditing ? (
                  <>
                    <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className="input-base w-28 py-1.5 text-sm" autoFocus />
                    <button type="button" onClick={saveEditMember} className="link text-xs">Save</button>
                    <button type="button" onClick={() => { setEditingMemberId(null); setEditingName(''); }} className="text-xs text-slate-500 hover:underline">Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{u ? u.name : id}</span>
                    <button type="button" onClick={() => { setEditingMemberId(id); setEditingName((u && u.name) || ''); }} className="text-xs text-slate-500 hover:underline">Edit</button>
                    <button type="button" onClick={() => removeMember(id)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap items-end gap-4">
          <form onSubmit={addMemberByDropdown} className="flex items-center gap-2">
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="input-base min-w-[200px] py-2.5">
              <option value="">Select existing user…</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.email?.startsWith('guest_') ? u.name : `${u.name} (${u.email})`}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary shrink-0 py-2" disabled={!selectedUserId}>Add</button>
          </form>
          <span className="text-slate-400">or</span>
          <form onSubmit={addMemberByName} className="flex items-center gap-2">
            <input type="text" placeholder="Add any name…" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="input-base w-44 py-2.5" />
            <button type="submit" className="btn-primary shrink-0 py-2" disabled={!newMemberName.trim()}>Add member</button>
          </form>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title mb-3">Settlements</h2>
        <p className="mb-4 text-sm text-slate-500">
          <Link to="/settlements" className="link">Record settlement</Link> for this group · Click a row to see details
        </p>
        {settlements.length === 0 ? (
          <p className="text-slate-500">No settlements yet.</p>
        ) : (
          <ul className="space-y-2">
            {settlements.map(s => {
              const isOpen = expandedSettlementId === s.id
              return (
                <li key={s.id} className="card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <button type="button" onClick={() => setExpandedSettlementId(isOpen ? null : s.id)} className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-slate-50">
                    <span><strong>{displayUserName(s.fromUserId)}</strong> paid <strong>{displayUserName(s.toUserId)}</strong> ₹{(s.amountCents / 100).toFixed(2)}</span>
                    <span className="flex items-center gap-2 text-sm text-slate-400">{formatDate(s.createdAtEpochMs)}<span>{isOpen ? '▼' : '▶'}</span></span>
                  </button>
                  {isOpen && (
                    <div className="space-y-1 border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-sm">
                      <div><span className="text-slate-500">From:</span> {displayUserName(s.fromUserId)}</div>
                      <div><span className="text-slate-500">To:</span> {displayUserName(s.toUserId)}</div>
                      <div><span className="text-slate-500">Amount:</span> ₹{(s.amountCents / 100).toFixed(2)}</div>
                      <div><span className="text-slate-500">Settled on:</span> {formatDate(s.createdAtEpochMs)}</div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-title mb-3">Expenses</h2>
        <p className="mb-4 text-sm text-slate-500">
          <Link to={`/expenses?groupId=${groupId}`} className="link">Add expense</Link>
          {expenses.length > 0 && ' · Click a row to see who owes whom and details'}
        </p>
        {expenses.length === 0 ? (
          <p className="text-slate-500">No expenses yet.</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map(e => {
              const isOpen = expandedExpenseId === e.id
              return (
                <li key={e.id} className="card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <button type="button" onClick={() => setExpandedExpenseId(isOpen ? null : e.id)} className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-slate-50">
                    <span className="font-semibold">{e.title}</span>
                    <span className="flex items-center gap-2 text-slate-600">₹{(e.amountCents / 100).toFixed(2)} paid by {displayUserName(e.payerId)}<span className="text-sm text-slate-400">{formatDate(e.createdAtEpochMs)}</span><span className="text-slate-400">{isOpen ? '▼' : '▶'}</span></span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 text-sm">
                      {e.description && <div><span className="text-slate-500">Description:</span> {e.description}</div>}
                      <div><span className="text-slate-500">Split:</span> {e.splitType}</div>
                      <div><span className="text-slate-500">Added on:</span> {formatDate(e.createdAtEpochMs)}</div>
                      <div>
                        <span className="mb-1.5 block text-slate-500">Who owes whom for this expense:</span>
                        <ul className="space-y-1 pl-2">
                          {e.splits && e.splits.map((split, i) => {
                            const owes = split.amountCents > 0
                            const name = displayUserName(split.userId)
                            if (split.userId === e.payerId) return <li key={i}>{name} (paid) — settled</li>
                            return <li key={i}><strong>{name}</strong> {owes ? 'owes' : 'is owed'} <strong>{displayUserName(e.payerId)}</strong> ₹{(Math.abs(split.amountCents) / 100).toFixed(2)}</li>
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
