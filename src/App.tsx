import React from 'react'
import UltraModernCircuitWithViewModel from './components/UltraModernCircuitWithViewModel'
import ErrorBoundary from './components/ErrorBoundary'

function App(): React.ReactElement {
  // 発見システムを統合した実装
  return (
    <ErrorBoundary>
      <UltraModernCircuitWithViewModel />
    </ErrorBoundary>
  )
}

export default App