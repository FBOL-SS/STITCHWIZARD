export default function WorkerCard({ worker, onEdit, onDelete }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{worker.role}</h3>
          <p className="text-sm text-slate-500">${Number(worker.rate_hour).toFixed(2)}/hr · Eff {Number(worker.efficiency).toFixed(2)}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">ID {worker.id}</span>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={() => onEdit(worker)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(worker.id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
