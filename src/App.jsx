import React from 'react'
import { useLocation } from 'react-router-dom'
import StableLogicCircuit from './components/StableLogicCircuit'
import LogicCircuitV4 from './components/LogicCircuitV4'
import SimpleLogicCircuit from './components/SimpleLogicCircuit'
import UltimateLogicCircuit from './components/UltimateLogicCircuit'
import ModernLogicCircuit from './components/ModernLogicCircuit'
import StyledStableCircuit from './components/StyledStableCircuit'
import BestLogicCircuit from './components/BestLogicCircuit'
import CleanLogicCircuit from './components/CleanLogicCircuit'
import ProfessionalCircuit from './components/ProfessionalCircuit'
import ModernProfessionalCircuit from './components/ModernProfessionalCircuit'
import UltraModernCircuit from './components/UltraModernCircuit'
import SimpleLogicCircuitDebug from './components/SimpleLogicCircuitDebug'
import TestWireConnection from './components/TestWireConnection'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const location = useLocation()
  const useUltraModern = true; // ウルトラモダン版を使用
  const useModernProfessional = false; // モダンプロフェッショナル版を使用
  const useProfessional = false; // プロフェッショナル版を使用
  const useClean = false; // 洗練されたデザイン
  const useBest = false; // ベストプラクティス版
  const useStyledStable = false; // デザイン改善版安定コンポーネント
  const useModernUI = false; // モダンデザインシステムUI
  const useUltimateUI = false; // 究極のユーザーファーストUI
  const useSimpleUI = false; // シンプルUIを使用
  const useStableVersion = false; // 安定版を使用
  const useTestMode = false; // テストモードの切り替え
  
  return (
    <ErrorBoundary>
      {useUltraModern ? <UltraModernCircuit /> :
       useModernProfessional ? <ModernProfessionalCircuit /> :
       useProfessional ? <ProfessionalCircuit /> :
       useClean ? <CleanLogicCircuit /> :
       useBest ? <BestLogicCircuit /> :
       useStyledStable ? <StyledStableCircuit /> :
       useModernUI ? <ModernLogicCircuit /> :
       useUltimateUI ? <UltimateLogicCircuit /> :
       useSimpleUI ? <SimpleLogicCircuit /> :
       useStableVersion ? <StableLogicCircuit /> : 
       useTestMode ? <TestWireConnection /> : <LogicCircuitV4 />}
    </ErrorBoundary>
  )
}

export default App