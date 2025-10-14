import { useEffect, useState } from 'react'
import { createOperation, deleteOperation, getOperations, updateOperation } from '../api'
import OperationCard from '../components/OperationCard'
import ModalForm from '../components/ModalForm'

const initialForm = { name: '', time_min: '' }

export default function Operations({ onNotify }) {
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  async function loadOperations() {
    setLoading(true)
    try {
      const data = await getOperations()
      setOperations(data)
    } catch (error) {
      onNotify('Failed to load operations', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [])

  function openCreate() {
    setForm(initialForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(operation) {
    setForm({ name: operation.name, time_min: operation.time_min })
    setEditingId(operation.id)
    setModalOpen(true)
  }

  async function handleSubmit() {
    const timeMin = parseFloat(form.time_min)
    if (Number.isNaN(timeMin)) {
      onNotify('Please provide a valid time value', 'error')
      return
    }

    const payload = {
      name: form.name,
      time_min: timeMin
    }

    try {
      if (editingId) {
        await updateOperation(editingId, payload)
        onNotify('Operation updated', 'success')
      } else {
        await createOperation(payload)
        onNotify('Operation created', 'success')
      }
      setModalOpen(false)
      loadOperations()
    } catch (error) {
      onNotify(error.message || 'Unable to save operation', 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOperation(id)
      onNotify('Operation deleted', 'success')
      loadOperations()
    } catch (error) {
      onNotify(error.message || 'Unable to delete operation', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Operations</h2>
          <p className="text-sm text-slate-500">Maintain the building blocks for every garment style</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Add operation
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading operations...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operations.map(operation => (
            <OperationCard key={operation.id} operation={operation} onEdit={openEdit} onDelete={handleDelete} />
          ))}
          {operations.length === 0 && <p className="text-sm text-slate-500">No operations yet.</p>}
        </div>
      )}

      <ModalForm
        isOpen={modalOpen}
        title={editingId ? 'Edit operation' : 'Add operation'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update operation' : 'Create operation'}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={event => setForm({ ...form, name: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Time per piece (minutes)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.time_min}
            onChange={event => setForm({ ...form, time_min: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      </ModalForm>
    </section>
  )
}
