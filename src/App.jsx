import React from 'react'
import LogicCircuitBuilder from './components/LogicCircuitBuilder'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <LogicCircuitBuilder />
    </ErrorBoundary>
  )
}

export default App