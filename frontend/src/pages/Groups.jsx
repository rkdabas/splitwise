import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Groups() {
  const token = localStorage.getItem('splitwise_token')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingGroupId, setEditingGroupId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.groups.list().then(setGroups).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [token])

  async function handleCreate(e) {
    e.preventDefault()
    if (!token) {
      setError('Please log in first.')
      return
    }
    setError('')
    try {
      const g = await api.groups.create(name, description)
      setGroups(prev => [g, ...prev])
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(g) {
    setEditingGroupId(g.id)
    setEditName(g.name)
    setEditDesc(g.description || '')
  }

  async function saveEdit() {
    if (!editingGroupId) return
    setError('')
    try {
      const updated = await api.groups.update(editingGroupId, { name: editName.trim(), description: editDesc.trim() })
      setGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
      setEditingGroupId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteGroup(g, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete group "${g.name}"? All expenses and settlements in it will be removed. This cannot be undone.`)) return
    setError('')
    try {
      await api.groups.delete(g.id)
      setGroups(prev => prev.filter(x => x.id !== g.id))
      setEditingGroupId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="page-title mb-2 animate-in">Groups</h1>
      <p className="mb-8 text-slate-500 animate-in-delay-1"><span className="keyword">Create</span> and <span className="keyword">manage</span> groups to split expenses with.</p>

      {!token && <div className="alert-warning mb-8">Please <Link to="/login" className="link">log in</Link> to create and view groups.</div>}

      <form onSubmit={handleCreate} className="card mb-10 max-w-md p-8 animate-in-delay-2 shadow-lg">
        <h2 className="section-title mb-6">Create group</h2>
        {error && <div className="alert-error mb-6">{error}</div>}
        <div className="space-y-5">
          <div>
            <label className="label">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-base" />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={!token}>Create group</button>
        </div>
      </form>

      <h2 className="section-title mb-4 animate-in-delay-3">Your groups</h2>
      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <span>Loading…</span>
        </div>
      )}
      {!loading && groups.length === 0 && <p className="text-slate-500">No groups yet. Create one above.</p>}
      <ul className="space-y-3">
        {groups.map(g => (
          <li key={g.id} className="card-3d-websline p-5">
            {editingGroupId === g.id ? (
              <div className="space-y-3">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-base w-full max-w-md py-2" placeholder="Group name" />
                <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="input-base w-full max-w-md py-2" placeholder="Description (optional)" />
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} className="btn-primary py-2">Save</button>
                  <button type="button" onClick={() => setEditingGroupId(null)} className="py-2 text-slate-500 hover:underline">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link to={`/groups/${g.id}`} className="min-w-0 flex-1 cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <span className="font-semibold text-slate-800 hover:underline">{g.name}</span>
                  {g.description && <span className="ml-2 text-slate-500">— {g.description}</span>}
                  <span className="ml-2 text-sm text-slate-400">({g.memberIds?.length ?? 0} members)</span>
                  {g.createdAtEpochMs > 0 && (
                    <span className="mt-1 block text-sm text-slate-400">Created {new Date(g.createdAtEpochMs).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  )}
                </Link>
                <div className="flex shrink-0 gap-2" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); startEdit(g); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); deleteGroup(g, e); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
