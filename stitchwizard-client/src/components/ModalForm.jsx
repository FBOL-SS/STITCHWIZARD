import { useEffect } from 'react'

export default function ModalForm({ isOpen, title, onClose, onSubmit, submitLabel = 'Save', children }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown)
    }
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">✕</button>
        </div>
        <form
          onSubmit={event => {
            event.preventDefault()
            onSubmit()
          }}
          className="mt-6 space-y-4"
        >
          {children}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
