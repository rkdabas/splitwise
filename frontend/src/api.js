const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function headers(includeAuth = false) {
  const h = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('splitwise_token')
  if (includeAuth && token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function handleRes(r) {
  if (!r.ok) {
    const err = await r.json().catch(() => ({ message: r.statusText }))
    throw new Error(err.message || r.statusText)
  }
  return r.json().catch(() => ({}))
}

export const api = {
  auth: {
    login: (email, password) =>
      fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      }).then(handleRes),
    me: () =>
      fetch(`${BASE}/auth/me`, { headers: headers(true) }).then(handleRes),
  },
  users: {
    list: () => fetch(`${BASE}/users`, { headers: headers() }).then(handleRes),
    get: (id) => fetch(`${BASE}/users/${id}`, { headers: headers() }).then(handleRes),
    create: (name, email, password) =>
      fetch(`${BASE}/users`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, email, password }),
      }).then(handleRes),
    createGuest: (name) =>
      fetch(`${BASE}/users/guest`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name }),
      }).then(handleRes),
    updateName: (id, name) =>
      fetch(`${BASE}/users/${id}/name`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ name }),
      }).then(handleRes),
  },
  groups: {
    listForUser: (userId) =>
      fetch(`${BASE}/groups?userId=${encodeURIComponent(userId)}`, { headers: headers() }).then(handleRes),
    get: (id) => fetch(`${BASE}/groups/${id}`, { headers: headers() }).then(handleRes),
    create: (name, description, createdByUserId) =>
      fetch(`${BASE}/groups`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, description, createdByUserId }),
      }).then(handleRes),
    addMember: (groupId, userId) =>
      fetch(`${BASE}/groups/${groupId}/members`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId }),
      }).then(handleRes),
    removeMember: (groupId, userId) =>
      fetch(`${BASE}/groups/${groupId}/members/${userId}`, { method: 'DELETE', headers: headers() }).then(handleRes),
    update: (groupId, body) =>
      fetch(`${BASE}/groups/${groupId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(handleRes),
    delete: (groupId) =>
      fetch(`${BASE}/groups/${groupId}`, { method: 'DELETE', headers: headers() }).then(handleRes),
    markAsDone: (groupId) =>
      fetch(`${BASE}/groups/${groupId}/mark-done`, { method: 'POST', headers: headers() }).then(handleRes),
  },
  expenses: {
    create: (body) =>
      fetch(`${BASE}/expenses`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(handleRes),
    listForGroup: (groupId) =>
      fetch(`${BASE}/expenses?groupId=${encodeURIComponent(groupId)}`, { headers: headers() }).then(handleRes),
  },
  settlements: {
    create: (fromUserId, toUserId, amountCents, groupId) =>
      fetch(`${BASE}/settlements`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ fromUserId, toUserId, amountCents, groupId: groupId || null }),
      }).then(handleRes),
    listForGroup: (groupId) =>
      fetch(`${BASE}/settlements?groupId=${encodeURIComponent(groupId)}`, { headers: headers() }).then(handleRes),
  },
  balances: {
    get: (userId, groupId) =>
      fetch(`${BASE}/balances?userId=${encodeURIComponent(userId)}&groupId=${encodeURIComponent(groupId)}`, { headers: headers() }).then(handleRes),
    getForGroup: (groupId) =>
      fetch(`${BASE}/balances/group/${groupId}`, { headers: headers() }).then(handleRes),
  },
}
