import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const injectFont = () => {
  if (typeof document === 'undefined') {
    return
  }
  const existing = document.querySelector('link[data-stitchwizard-font]')
  if (existing) {
    return
  }
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap'
  link.setAttribute('data-stitchwizard-font', 'true')
  document.head.appendChild(link)
}

const ensureTailwind = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }
  if (!window.tailwind) {
    window.tailwind = {}
  }
  if (!window.tailwind.config) {
    window.tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui']
          }
        }
      }
    }
  }
  if (window.tailwindcss) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-stitchwizard-tailwind]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    script.defer = true
    script.setAttribute('data-stitchwizard-tailwind', 'true')
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => resolve())
    document.head.appendChild(script)
  })
}

const start = async () => {
  injectFont()
  await ensureTailwind()
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found')
  }
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

start()
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
