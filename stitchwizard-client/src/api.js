const API_BASE = import.meta.env.VITE_API_BASE || 'https://stitchwizard.onrender.com/api'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function handleResponse(res) {
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getWorkers() {
  const res = await fetch(`${API_BASE}/workers`)
  return handleResponse(res)
}

export async function createWorker(data) {
  const res = await fetch(`${API_BASE}/workers`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateWorker(id, data) {
  const res = await fetch(`${API_BASE}/workers/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function deleteWorker(id) {
  const res = await fetch(`${API_BASE}/workers/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function getOperations() {
  const res = await fetch(`${API_BASE}/operations`)
  return handleResponse(res)
}

export async function createOperation(data) {
  const res = await fetch(`${API_BASE}/operations`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateOperation(id, data) {
  const res = await fetch(`${API_BASE}/operations/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function deleteOperation(id) {
  const res = await fetch(`${API_BASE}/operations/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function getStyles() {
  const res = await fetch(`${API_BASE}/styles`)
  return handleResponse(res)
}

export async function getStyle(id) {
  const res = await fetch(`${API_BASE}/styles/${id}`)
  return handleResponse(res)
}

export async function createStyle(data) {
  const res = await fetch(`${API_BASE}/styles`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function updateStyle(id, data) {
  const res = await fetch(`${API_BASE}/styles/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

export async function deleteStyle(id) {
  const res = await fetch(`${API_BASE}/styles/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}
