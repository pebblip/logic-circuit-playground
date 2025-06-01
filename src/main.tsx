import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { useCircuitStore } from './stores/circuitStore'

// Cypress用にストアを公開
if (window.Cypress) {
  window.useCircuitStore = useCircuitStore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)