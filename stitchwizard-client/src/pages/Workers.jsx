import { useEffect, useState } from 'react'
import { createWorker, deleteWorker, getWorkers, updateWorker } from '../api'
import WorkerCard from '../components/WorkerCard'
import ModalForm from '../components/ModalForm'

const initialForm = { role: '', rate_hour: '', efficiency: '' }

export default function Workers({ onNotify }) {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  async function loadWorkers() {
    setLoading(true)
    try {
      const data = await getWorkers()
      setWorkers(data)
    } catch (error) {
      onNotify('Failed to load workers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkers()
  }, [])

  function openCreate() {
    setForm(initialForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(worker) {
    setForm({ role: worker.role, rate_hour: worker.rate_hour, efficiency: worker.efficiency })
    setEditingId(worker.id)
    setModalOpen(true)
  }

  async function handleSubmit() {
    const rate = parseFloat(form.rate_hour)
    const efficiency = parseFloat(form.efficiency)
    if (Number.isNaN(rate) || Number.isNaN(efficiency)) {
      onNotify('Please provide valid numeric values', 'error')
      return
    }

    const payload = {
      role: form.role,
      rate_hour: rate,
      efficiency
    }

    try {
      if (editingId) {
        await updateWorker(editingId, payload)
        onNotify('Worker updated', 'success')
      } else {
        await createWorker(payload)
        onNotify('Worker created', 'success')
      }
      setModalOpen(false)
      loadWorkers()
    } catch (error) {
      onNotify(error.message || 'Unable to save worker', 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteWorker(id)
      onNotify('Worker deleted', 'success')
      loadWorkers()
    } catch (error) {
      onNotify(error.message || 'Unable to delete worker', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Workers</h2>
          <p className="text-sm text-slate-500">Manage worker types, hourly rates, and efficiency</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Add worker
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading workers...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map(worker => (
            <WorkerCard key={worker.id} worker={worker} onEdit={openEdit} onDelete={handleDelete} />
          ))}
          {workers.length === 0 && <p className="text-sm text-slate-500">No workers yet.</p>}
        </div>
      )}

      <ModalForm
        isOpen={modalOpen}
        title={editingId ? 'Edit worker' : 'Add worker'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update worker' : 'Create worker'}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <input
            type="text"
            value={form.role}
            onChange={event => setForm({ ...form, role: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Rate per hour</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.rate_hour}
            onChange={event => setForm({ ...form, rate_hour: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Efficiency (0-1)</label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            max="1"
            value={form.efficiency}
            onChange={event => setForm({ ...form, efficiency: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      </ModalForm>
    </section>
  )
}
