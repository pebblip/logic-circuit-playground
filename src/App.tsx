import React from 'react'
import UltraModernCircuitWithViewModel from './components/UltraModernCircuitWithViewModel'
import ErrorBoundary from './components/ErrorBoundary'

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <UltraModernCircuitWithViewModel />
    </ErrorBoundary>
  )
}

export default App