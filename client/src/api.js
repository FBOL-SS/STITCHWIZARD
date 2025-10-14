const API_BASE = import.meta.env.VITE_API_BASE || 'https://stitchwizard.onrender.com/api'

const readBody = async (response) => {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch (error) {
    return null
  }
}

const handleResponse = async (response) => {
  const data = await readBody(response)
  if (!response.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }
  return data
}

const jsonHeaders = {
  'Content-Type': 'application/json'
}

export const getOperations = () =>
  fetch(`${API_BASE}/operations`).then(handleResponse)

export const createOperation = (payload) =>
  fetch(`${API_BASE}/operations`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  }).then(handleResponse)

export const updateOperation = (id, payload) =>
  fetch(`${API_BASE}/operations/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  }).then(handleResponse)

export const deleteOperation = (id) =>
  fetch(`${API_BASE}/operations/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)

export const getWorkers = () =>
  fetch(`${API_BASE}/workers`).then(handleResponse)

export const createWorker = (payload) =>
  fetch(`${API_BASE}/workers`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  }).then(handleResponse)

export const updateWorker = (id, payload) =>
  fetch(`${API_BASE}/workers/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  }).then(handleResponse)

export const deleteWorker = (id) =>
  fetch(`${API_BASE}/workers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)

export const getStyles = () =>
  fetch(`${API_BASE}/styles`).then(handleResponse)
