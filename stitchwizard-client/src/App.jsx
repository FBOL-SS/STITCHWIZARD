import { useCallback, useMemo, useState } from 'react'
import Header from './components/Header'
import TabMenu from './components/TabMenu'
import Workers from './pages/Workers'
import Operations from './pages/Operations'
import Styles from './pages/Styles'

const tabs = [
  { id: 'operations', label: 'Operations' },
  { id: 'workers', label: 'Workers' },
  { id: 'styles', label: 'Styles' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('operations')
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, type = 'success') => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3500)
  }, [])

  const page = useMemo(() => {
    if (activeTab === 'workers') {
      return <Workers onNotify={notify} />
    }
    if (activeTab === 'styles') {
      return <Styles onNotify={notify} />
    }
    return <Operations onNotify={notify} />
  }, [activeTab, notify])

  return (
    <div className="min-h-screen bg-slate-100 font-[Inter]">
      <Header />
      <TabMenu tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {page}
      </main>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 flex flex-col items-center space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-xl px-4 py-3 text-sm shadow-lg transition ${
              toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== toast.id))}
              className="ml-3 text-white/80 transition hover:text-white"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
