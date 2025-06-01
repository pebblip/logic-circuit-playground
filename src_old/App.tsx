import React from 'react'
import ResponsiveUltraModernCircuit from './app/ResponsiveUltraModernCircuit'
import ErrorBoundary from './shared/ui/ErrorBoundary'

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <ResponsiveUltraModernCircuit />
      </div>
    </ErrorBoundary>
  )
}

export default App