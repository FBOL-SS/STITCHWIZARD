import { useEffect, useMemo, useState } from 'react'
import React, { useEffect, useState } from 'react';
import {
  getOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  getStyles
} from './api'

const tabs = [
  { key: 'operations', label: 'Operations' },
  { key: 'workers', label: 'Workers' },
  { key: 'styles', label: 'Styles' }
]

const App = () => {
  const [activeTab, setActiveTab] = useState('operations')
  const [operations, setOperations] = useState([])
  const [workers, setWorkers] = useState([])
  const [styles, setStyles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState({ type: null, item: null })
  const [toasts, setToasts] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    refreshAll()
  }, [])

  const refreshAll = async () => {
    try {
      setLoading(true)
      const [ops, wrk, sty] = await Promise.all([
        getOperations(),
        getWorkers(),
        getStyles()
      ])
      setOperations(ops)
      setWorkers(wrk)
      setStyles(sty)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong while loading data')
      pushToast('error', error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const refreshOperations = async () => {
    const data = await getOperations()
    setOperations(data)
  }

  const refreshWorkers = async () => {
    const data = await getWorkers()
    setWorkers(data)
  }

  const createToastId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random()}`
  }

  const pushToast = (type, message) => {
    const id = createToastId()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const openModal = (type, item = null) => {
    setModalState({ type, item })
  }

  const closeModal = () => {
    setModalState({ type: null, item: null })
  }

  const handleOperationSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      time_min: Number(values.time_min),
      batch_threshold: values.batch_threshold ? Number(values.batch_threshold) : 0,
      batch_reduction_pct: values.batch_reduction_pct ? Number(values.batch_reduction_pct) : 0
    }
    try {
      if (modalState.item) {
        await updateOperation(modalState.item.id, payload)
        pushToast('success', 'Operation updated successfully')
      } else {
        await createOperation(payload)
        pushToast('success', 'Operation created successfully')
      }
      await refreshOperations()
      closeModal()
    } catch (error) {
      pushToast('error', error.message || 'Failed to save operation')
    }
  }

  const handleWorkerSubmit = async (values) => {
    const payload = {
      role: values.role.trim(),
      rate_per_hour: Number(values.rate_per_hour),
      efficiency: Number(values.efficiency)
    }
    try {
      if (modalState.item) {
        await updateWorker(modalState.item.id, payload)
        pushToast('success', 'Worker updated successfully')
      } else {
        await createWorker(payload)
        pushToast('success', 'Worker created successfully')
      }
      await refreshWorkers()
      closeModal()
    } catch (error) {
      pushToast('error', error.message || 'Failed to save worker')
    }
  }

  const handleDeleteOperation = async (operation) => {
    const confirmDelete = window.confirm(`Delete operation "${operation.name}"?`)
    if (!confirmDelete) {
      return
    }
    try {
      await deleteOperation(operation.id)
      pushToast('success', 'Operation deleted')
      await refreshOperations()
    } catch (error) {
      pushToast('error', error.message || 'Failed to delete operation')
    }
  }

  const handleDeleteWorker = async (worker) => {
    const confirmDelete = window.confirm(`Delete worker "${worker.role}"?`)
    if (!confirmDelete) {
      return
    }
    try {
      await deleteWorker(worker.id)
      pushToast('success', 'Worker deleted')
      await refreshWorkers()
    } catch (error) {
      pushToast('error', error.message || 'Failed to delete worker')
    }
  }

  const activeContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
            <span className="text-sm font-medium">Loading StitchWizard data...</span>
          </div>
        </div>
      )
    }

    if (errorMessage) {
      return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-600">
          <p className="font-medium">{errorMessage}</p>
          <button
            onClick={refreshAll}
            className="mt-4 inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )
    }

    if (activeTab === 'operations') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Operations</h2>
              <p className="text-sm text-slate-500">Track each operation with timing and batching details.</p>
            </div>
            <button
              onClick={() => openModal('operation')}
              className="inline-flex items-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
            >
              + Add operation
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {operations.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
                No operations yet. Start by adding your first operation.
              </div>
            )}
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{operation.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{operation.time_min.toFixed(2)} minutes</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('operation', operation)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOperation(operation)}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500">
                  <div>
                    <dt className="font-medium text-slate-400">Batch threshold</dt>
                    <dd className="mt-1 text-slate-700">{operation.batch_threshold || 0}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-400">Batch reduction %</dt>
                    <dd className="mt-1 text-slate-700">{((operation.batch_reduction_pct || 0) * 100).toFixed(0)}%</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'workers') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Workers</h2>
              <p className="text-sm text-slate-500">Maintain worker roles, hourly rates, and efficiency.</p>
            </div>
            <button
              onClick={() => openModal('worker')}
              className="inline-flex items-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
            >
              + Add worker
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workers.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
                No workers yet. Create roles to assign operations later.
              </div>
            )}
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{worker.role}</h3>
                    <p className="mt-1 text-sm text-slate-500">${worker.rate_per_hour.toFixed(2)} per hour</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('worker', worker)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(worker)}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500">
                  <div>
                    <dt className="font-medium text-slate-400">Efficiency</dt>
                    <dd className="mt-1 text-slate-700">{(worker.efficiency * 100).toFixed(0)}%</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-400">ID</dt>
                    <dd className="mt-1 text-slate-700">#{worker.id}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Styles</h2>
          <p className="text-sm text-slate-500">Overview of stitched styles and their cost parameters.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {styles.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
              No styles found. Add styles through the backend or future UI updates.
            </div>
          )}
          {styles.map((style) => (
            <div
              key={style.id}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{style.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{style.operation_count} operations</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  Style #{style.id}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500">
                <div>
                  <dt className="font-medium text-slate-400">Overhead %</dt>
                  <dd className="mt-1 text-slate-700">{(style.overhead_pct * 100).toFixed(0)}%</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-400">Margin %</dt>
                  <dd className="mt-1 text-slate-700">{(style.margin_pct * 100).toFixed(0)}%</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    )
  }, [activeTab, errorMessage, loading, operations, styles, workers])

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800"
      style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
    >
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            <span className="mr-2 text-3xl text-blue-500">🪡</span>
            StitchWizard
          </h1>
          <p className="text-sm text-slate-500">Garment labor-cost intelligence</p>
        </header>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-white text-slate-500 shadow-sm hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {activeContent}
      </main>
      {modalState.type === 'operation' && (
        <Modal title={modalState.item ? 'Edit operation' : 'Add operation'} onClose={closeModal}>
          <OperationForm
            initialValue={modalState.item}
            onSubmit={handleOperationSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modalState.type === 'worker' && (
        <Modal title={modalState.item ? 'Edit worker' : 'Add worker'} onClose={closeModal}>
          <WorkerForm
            initialValue={modalState.item}
            onSubmit={handleWorkerSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

const Modal = ({ title, children, onClose }) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const OperationForm = ({ initialValue, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: initialValue?.name || '',
    time_min: initialValue?.time_min?.toString() || '',
    batch_threshold: initialValue?.batch_threshold?.toString() || '',
    batch_reduction_pct: initialValue?.batch_reduction_pct?.toString() || ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600">Name</label>
        <input
          required
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Operation name"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-600">Time (minutes)</label>
          <input
            required
            name="time_min"
            type="number"
            step="0.1"
            min="0"
            value={form.time_min}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Batch threshold</label>
          <input
            name="batch_threshold"
            type="number"
            min="0"
            step="1"
            value={form.batch_threshold}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-600">Batch reduction (%)</label>
        <input
          name="batch_reduction_pct"
          type="number"
          step="0.05"
          min="0"
          max="1"
          value={form.batch_reduction_pct}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <p className="mt-1 text-xs text-slate-400">Enter as decimal (e.g. 0.2 for 20% reduction)</p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
        >
          {initialValue ? 'Save changes' : 'Create operation'}
        </button>
      </div>
    </form>
  )
}

const WorkerForm = ({ initialValue, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    role: initialValue?.role || '',
    rate_per_hour: initialValue?.rate_per_hour?.toString() || '',
    efficiency: initialValue?.efficiency?.toString() || ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-600">Role</label>
        <input
          required
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Sewing technician"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-600">Rate per hour</label>
          <input
            required
            name="rate_per_hour"
            type="number"
            step="0.5"
            min="0"
            value={form.rate_per_hour}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Efficiency (0-1)</label>
          <input
            required
            name="efficiency"
            type="number"
            step="0.05"
            min="0.1"
            max="1"
            value={form.efficiency}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600"
        >
          {initialValue ? 'Save changes' : 'Create worker'}
        </button>
      </div>
    </form>
  )
}

const ToastStack = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) {
    return null
  }
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg transition ${
            toast.type === 'error'
              ? 'border-red-200 bg-white text-red-600'
              : 'border-blue-100 bg-white text-blue-600'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 text-lg ${toast.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                {toast.type === 'error' ? '⚠️' : '✅'}
              </span>
              <p className="text-sm font-medium leading-snug text-slate-700">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
  getStyles,
  getStyle,
  createStyle,
  calculateCost,
  exportCost
} from './api';

function OperationForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState({ name: '', time_min: 0, batch_threshold: 0, batch_reduction_pct: 0 });

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({ name: '', time_min: 0, batch_threshold: 0, batch_reduction_pct: 0 });
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editing ? 'Editar operación' : 'Crear operación'}</h3>
      <label>
        Nombre
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label>
        Minutos por pieza
        <input
          type="number"
          value={form.time_min}
          onChange={(e) => setForm({ ...form, time_min: Number(e.target.value) })}
          min="0"
          step="0.1"
          required
        />
      </label>
      <label>
        Umbral batch
        <input
          type="number"
          value={form.batch_threshold}
          onChange={(e) => setForm({ ...form, batch_threshold: Number(e.target.value) })}
          min="0"
        />
      </label>
      <label>
        Reducción batch (%)
        <input
          type="number"
          value={form.batch_reduction_pct}
          onChange={(e) => setForm({ ...form, batch_reduction_pct: Number(e.target.value) })}
          min="0"
          max="1"
          step="0.01"
        />
      </label>
      <div className="actions">
        {editing && (
          <button type="button" onClick={onCancel} className="secondary">
            Cancelar
          </button>
        )}
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}

function WorkerForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState({ role: '', rate_per_hour: 0, efficiency: 1 });

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({ role: '', rate_per_hour: 0, efficiency: 1 });
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editing ? 'Editar trabajador' : 'Crear trabajador'}</h3>
      <label>
        Rol
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
      </label>
      <label>
        Tarifa por hora
        <input
          type="number"
          value={form.rate_per_hour}
          onChange={(e) => setForm({ ...form, rate_per_hour: Number(e.target.value) })}
          min="0"
          step="0.1"
          required
        />
      </label>
      <label>
        Eficiencia (0-1)
        <input
          type="number"
          value={form.efficiency}
          onChange={(e) => setForm({ ...form, efficiency: Number(e.target.value) })}
          min="0.01"
          max="1"
          step="0.01"
          required
        />
      </label>
      <div className="actions">
        {editing && (
          <button type="button" onClick={onCancel} className="secondary">
            Cancelar
          </button>
        )}
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}

function StyleBuilder({ operations, workers, onCreate }) {
  const [name, setName] = useState('');
  const [overhead, setOverhead] = useState(0.2);
  const [margin, setMargin] = useState(0.2);
  const [lines, setLines] = useState([]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        operationId: operations[0]?.id || '',
        workerId: workers[0]?.id || '',
        quantity_per_unit: 1,
        sequence: prev.length + 1
      }
    ]);
  };

  const updateLine = (id, changes) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...changes } : line)));
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    const payload = {
      name,
      overhead_pct: Number(overhead),
      margin_pct: Number(margin),
      operations: lines.map((line, index) => ({
        operationId: Number(line.operationId),
        workerId: line.workerId ? Number(line.workerId) : null,
        quantity_per_unit: Number(line.quantity_per_unit) || 1,
        sequence: index + 1
      }))
    };
    onCreate(payload).then(() => {
      setName('');
      setOverhead(0.2);
      setMargin(0.2);
      setLines([]);
    });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Crear estilo/prenda</h3>
      <label>
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <div className="grid two">
        <label>
          Overhead %
          <input type="number" value={overhead} step="0.01" onChange={(e) => setOverhead(e.target.value)} />
        </label>
        <label>
          Margin %
          <input type="number" value={margin} step="0.01" onChange={(e) => setMargin(e.target.value)} />
        </label>
      </div>
      <div>
        <div className="list-header">
          <span>Operaciones</span>
          <button type="button" onClick={addLine} disabled={!operations.length || !workers.length}>
            Añadir línea
          </button>
        </div>
        {lines.map((line) => (
          <div key={line.id} className="list-row">
            <select
              value={line.operationId}
              onChange={(e) => updateLine(line.id, { operationId: e.target.value })}
            >
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
            <select value={line.workerId} onChange={(e) => updateLine(line.id, { workerId: e.target.value })}>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.role}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={line.quantity_per_unit}
              min="0.1"
              step="0.1"
              onChange={(e) => updateLine(line.id, { quantity_per_unit: e.target.value })}
            />
            <button type="button" className="secondary" onClick={() => removeLine(line.id)}>
              Quitar
            </button>
          </div>
        ))}
      </div>
      <button type="submit" disabled={!lines.length}>
        Guardar estilo
      </button>
    </form>
  );
}

function Calculator({ styles, styleDetails, onSelectStyle, calculation, onCalculate, onExport, workerSelections, setWorkerSelections }) {
  const [batchSize, setBatchSize] = useState('');
  const [overhead, setOverhead] = useState('');
  const [margin, setMargin] = useState('');

  useEffect(() => {
    if (styleDetails) {
      const map = {};
      styleDetails.operations.forEach((op) => {
        map[op.operation_id] = op.worker_id ?? undefined;
      });
      setWorkerSelections(map);
    }
  }, [styleDetails, setWorkerSelections]);

  const handleCalculate = () => {
    if (!styleDetails) return;
    onCalculate({
      styleId: styleDetails.style.id,
      workerMap: workerSelections,
      batchSize: batchSize ? Number(batchSize) : undefined,
      overheadPct: overhead === '' ? undefined : Number(overhead),
      marginPct: margin === '' ? undefined : Number(margin)
    });
  };

  const handleExport = (format) => {
    if (!styleDetails) return;
    onExport({
      styleId: styleDetails.style.id,
      format,
      batchSize,
      overheadPct: overhead,
      marginPct: margin
    });
  };

  return (
    <div className="card">
      <h3>Cálculo de costos</h3>
      <label>
        Seleccionar estilo
        <select value={styleDetails?.style.id || ""} onChange={(e) => onSelectStyle(e.target.value)}>
          <option value="">-- Seleccionar --</option>
          {styles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
      </label>
      {styleDetails && (
        <div className="calculation-panel">
          <div className="grid three">
            <label>
              Batch size
              <input value={batchSize} onChange={(e) => setBatchSize(e.target.value)} type="number" min="0" />
            </label>
            <label>
              Overhead % override
              <input value={overhead} onChange={(e) => setOverhead(e.target.value)} type="number" step="0.01" />
            </label>
            <label>
              Margin % override
              <input value={margin} onChange={(e) => setMargin(e.target.value)} type="number" step="0.01" />
            </label>
          </div>
          <div>
            <h4>Asignación de trabajadores</h4>
            {styleDetails.operations.map((op) => (
              <div key={op.id} className="list-row">
                <span>
                  {op.sequence}. {op.operation_name} (qty {op.quantity_per_unit})
                </span>
                <select
                  value={workerSelections[op.operation_id] ?? ''}
                  onChange={(e) =>
                    setWorkerSelections({
                      ...workerSelections,
                      [op.operation_id]: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                >
                  <option value="">--</option>
                  {op.available_workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.role}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="button" onClick={handleCalculate}>
              Calcular
            </button>
            <button type="button" className="secondary" onClick={() => handleExport('csv')}>
              Exportar CSV
            </button>
            <button type="button" className="secondary" onClick={() => handleExport('xlsx')}>
              Exportar XLSX
            </button>
          </div>
        </div>
      )}
      {calculation && (
        <div className="results">
          <h4>Detalle de operaciones</h4>
          <table>
            <thead>
              <tr>
                <th>Secuencia</th>
                <th>Operación</th>
                <th>Trabajador</th>
                <th>Qty</th>
                <th>Tiempo (min)</th>
                <th>Costo mano de obra</th>
              </tr>
            </thead>
            <tbody>
              {calculation.breakdown.map((row) => (
                <tr key={row.operationId}>
                  <td>{row.sequence}</td>
                  <td>{row.operationName}</td>
                  <td>{row.worker}</td>
                  <td>{row.quantity}</td>
                  <td>{row.timeMinutes.toFixed(2)}</td>
                  <td>${row.laborCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            <p>Subtotal: ${calculation.summary.subtotal.toFixed(2)}</p>
            <p>Overhead ({(calculation.summary.overheadPct * 100).toFixed(1)}%): ${calculation.summary.overhead.toFixed(2)}</p>
            <p>Total antes de margen: ${calculation.summary.totalBeforeMargin.toFixed(2)}</p>
            <p>Margen ({(calculation.summary.marginPct * 100).toFixed(1)}%): ${calculation.summary.margin.toFixed(2)}</p>
            <p className="total">Total: ${calculation.summary.total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [operations, setOperations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [styleDetails, setStyleDetails] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [workerSelections, setWorkerSelections] = useState({});
  const [editingOperation, setEditingOperation] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [error, setError] = useState('');

  const refreshData = () => {
    Promise.all([getOperations(), getWorkers(), getStyles()])
      .then(([ops, workersData, stylesData]) => {
        setOperations(ops);
        setWorkers(workersData);
        setStyles(stylesData);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveOperation = (form) => {
    const payload = { ...form, time_min: Number(form.time_min) };
    const action = editingOperation
      ? updateOperation(editingOperation.id, payload)
      : createOperation(payload);
    action
      .then(() => {
        setEditingOperation(null);
        refreshData();
      })
      .catch((err) => setError(err.message));
  };

  const handleSaveWorker = (form) => {
    const payload = {
      role: form.role,
      rate_per_hour: Number(form.rate_per_hour),
      efficiency: Number(form.efficiency)
    };
    const action = editingWorker ? updateWorker(editingWorker.id, payload) : createWorker(payload);
    action
      .then(() => {
        setEditingWorker(null);
        refreshData();
      })
      .catch((err) => setError(err.message));
  };

  const handleDeleteOperation = (id) => {
    deleteOperation(id).then(refreshData).catch((err) => setError(err.message));
  };

  const handleDeleteWorker = (id) => {
    deleteWorker(id).then(refreshData).catch((err) => setError(err.message));
  };

  const handleCreateStyle = (payload) => {
    return createStyle(payload)
      .then(() => {
        refreshData();
      })
      .catch((err) => {
        setError(err.message);
        throw err;
      });
  };

  const handleSelectStyle = (id) => {
    if (!id) {
      setStyleDetails(null);
      setCalculation(null);
      return;
    }
    getStyle(id)
      .then((details) => {
        setStyleDetails(details);
        setCalculation(null);
      })
      .catch((err) => setError(err.message));
  };

  const handleCalculate = (payload) => {
    calculateCost(payload)
      .then((result) => setCalculation(result))
      .catch((err) => setError(err.message));
  };

  const handleExport = ({ styleId, format, batchSize, overheadPct, marginPct }) => {
    exportCost({ styleId, format, batchSize, overheadPct, marginPct })
      .then(async (res) => {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `style-${styleId}-cost.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="container">
      <header>
        <h1>StitchWizard</h1>
        <p>Calculadora de costos laborales para confección</p>
      </header>
      {error && (
        <div className="error" onClick={() => setError('')}>
          {error}
        </div>
      )}
      <main className="grid three">
        <section>
          <OperationForm
            onSave={handleSaveOperation}
            editing={editingOperation}
            onCancel={() => setEditingOperation(null)}
          />
          <div className="card">
            <h3>Operaciones</h3>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Min/Pieza</th>
                  <th>Batch</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id}>
                    <td>{op.name}</td>
                    <td>{op.time_min}</td>
                    <td>
                      {op.batch_threshold}/{(op.batch_reduction_pct * 100).toFixed(0)}%
                    </td>
                    <td>
                      <button type="button" onClick={() => setEditingOperation(op)}>
                        Editar
                      </button>
                      <button type="button" className="secondary" onClick={() => handleDeleteOperation(op.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <WorkerForm onSave={handleSaveWorker} editing={editingWorker} onCancel={() => setEditingWorker(null)} />
          <div className="card">
            <h3>Tipos de trabajador</h3>
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Tarifa</th>
                  <th>Eficiencia</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.role}</td>
                    <td>${worker.rate_per_hour}</td>
                    <td>{worker.efficiency}</td>
                    <td>
                      <button type="button" onClick={() => setEditingWorker(worker)}>
                        Editar
                      </button>
                      <button type="button" className="secondary" onClick={() => handleDeleteWorker(worker.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <StyleBuilder operations={operations} workers={workers} onCreate={handleCreateStyle} />
          <div className="card">
            <h3>Estilos</h3>
            <ul className="style-list">
              {styles.map((style) => (
                <li key={style.id}>
                  <strong>{style.name}</strong>
                  <span>{style.operation_count} operaciones</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Calculator
        styles={styles}
        styleDetails={styleDetails}
        onSelectStyle={handleSelectStyle}
        calculation={calculation}
        onCalculate={handleCalculate}
        onExport={handleExport}
        workerSelections={workerSelections}
        setWorkerSelections={setWorkerSelections}
      />
    </div>
  );
}
