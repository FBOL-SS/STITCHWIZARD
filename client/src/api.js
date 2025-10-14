const API_BASE = import.meta.env.VITE_API_BASE || 'https://stitchwizard.onrender.com/api'
const AUTH_HEADER = { Authorization: 'Bearer demo-token' }

async function handleResponse(res) {
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export function getOperations() {
  return fetch(`${API_BASE}/operations`, { headers: AUTH_HEADER }).then(handleResponse)
}

export function createOperation(payload) {
  return fetch(`${API_BASE}/operations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function updateOperation(id, payload) {
  return fetch(`${API_BASE}/operations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function deleteOperation(id) {
  return fetch(`${API_BASE}/operations/${id}`, {
    method: 'DELETE',
    headers: AUTH_HEADER
  }).then(handleResponse)
}

export function getWorkers() {
  return fetch(`${API_BASE}/workers`, { headers: AUTH_HEADER }).then(handleResponse)
}

export function createWorker(payload) {
  return fetch(`${API_BASE}/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function updateWorker(id, payload) {
  return fetch(`${API_BASE}/workers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function deleteWorker(id) {
  return fetch(`${API_BASE}/workers/${id}`, {
    method: 'DELETE',
    headers: AUTH_HEADER
  }).then(handleResponse)
}

export function getStyles() {
  return fetch(`${API_BASE}/styles`, { headers: AUTH_HEADER }).then(handleResponse)
}

export function getStyle(id) {
  return fetch(`${API_BASE}/styles/${id}`, { headers: AUTH_HEADER }).then(handleResponse)
}

export function createStyle(payload) {
  return fetch(`${API_BASE}/styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function calculateCost(payload) {
  return fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: JSON.stringify(payload)
  }).then(handleResponse)
}

export function exportCost({ styleId, format = 'csv', batchSize, overheadPct, marginPct }) {
  const params = new URLSearchParams({ styleId, format })
  if (batchSize) params.append('batchSize', batchSize)
  if (overheadPct) params.append('overheadPct', overheadPct)
  if (marginPct) params.append('marginPct', marginPct)
  return fetch(`${API_BASE}/export?${params.toString()}`, { headers: AUTH_HEADER })
}
