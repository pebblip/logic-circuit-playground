# 必須テストリスト

## 保持すべき価値のあるテスト（30ファイル）

### コアドメインロジック（8ファイル）⭐⭐⭐
- tests/domain/simulation/core/gateEvaluation.test.ts
- tests/domain/simulation/core/evaluateGate.test.ts  
- tests/domain/simulation/core/circuitEvaluation.test.ts
- tests/domain/simulation/core/truthTableGeneration.test.ts
- tests/domain/simulation/core/gateFactory.test.ts
- tests/domain/simulation/core/wireConnections.test.ts
- tests/domain/simulation/core/evaluationStrategy.test.ts
- tests/domain/simulation/event-driven/EventDrivenEngine.test.ts

### 重要なバグ回帰テスト（5ファイル）⭐⭐
- tests/bug-fixes/d-ff-edge-detection.test.ts
- tests/bug-fixes/fibonacci-basic-test.test.ts
- tests/bug-fixes/pin-state-synchronization.test.ts
- tests/bug-fixes/oscillating-circuit-fix.test.ts
- tests/bug-fixes/memory-element-state-fix.test.ts

### 基本機能テスト（10ファイル）⭐
- tests/domain/analysis/pinPositionCalculator.test.ts
- tests/domain/analysis/truthTableGenerator.test.ts
- tests/stores/circuitSlice.test.ts
- tests/stores/canvasSlice.test.ts
- tests/stores/timingChartSlice.test.ts
- tests/utils/circuitUtils.test.ts
- tests/utils/gateUtils.test.ts
- tests/services/customGateService.test.ts
- tests/services/galleryService.test.ts
- tests/hooks/useCircuitSimulation.test.ts

### 最小限の統合テスト（5ファイル）⭐
- tests/integration/basic-circuit-creation.test.ts
- tests/integration/gate-wire-connection.test.ts
- tests/integration/custom-gate-functionality.test.ts
- tests/integration/simulation-engine-integration.test.ts
- tests/integration/pin-state-fix-verification.test.tsx

### ギャラリー重要回路（2ファイル）⭐
- tests/gallery/fibonacci-counter.test.ts
- tests/gallery/basic-gates.test.ts

## 削除対象テスト（90+ファイル）

### UIコンポーネント（13ファイル）❌
- tests/components/ 全ファイル

### 重量級統合テスト（6ファイル）❌  
- tests/integration/storeUIIntegration.test.tsx
- tests/integration/gallery-all-circuits-browser-test.test.ts
- tests/integration/canvas-drag-drop.test.tsx
- tests/integration/circuit-animation.test.tsx
- tests/integration/responsive-layout.test.tsx
- tests/integration/oscillating-circuit.test.ts

### パフォーマンス・将来機能（10+ファイル）❌
- tests/performance/ 全ファイル
- tests/domain/simulation/delay-mode/ 全ファイル
- tests/domain/simulation/event-driven-minimal/ 全ファイル

### 重複・類似テスト（20+ファイル）❌
- tests/bug-fixes/ の大部分
- tests/gallery/ の大部分
- tests/features/ 全ファイル

### その他不要（40+ファイル）❌
- 実装詳細テスト
- 時間依存テスト
- 環境依存テスト
- 維持困難テスト