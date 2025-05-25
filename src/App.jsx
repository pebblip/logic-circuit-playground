import React from 'react'
import LogicCircuitBuilderModern from './components/LogicCircuitBuilderModern'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <LogicCircuitBuilderModern />
    </ErrorBoundary>
  )
}

export default App