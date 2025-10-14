import { useEffect, useMemo, useState } from 'react'
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
