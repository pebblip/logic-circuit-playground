# 順序回路（フィードバックループ）評価機能の調査結果

**調査日**: 2025-06-16  
**対象**: `evaluateCircuit`関数の順序回路処理能力

## 🎯 調査概要

evaluateCircuit関数が順序回路（フィードバックループを持つ回路）を正しく処理できるかどうかを調査し、現在の実装の問題点と改善案を明確にする。

## 📊 調査結果サマリー

### ✅ 正常に動作する機能

1. **D-FFゲートの評価**
   - ✅ 立ち上がりエッジトリガーの正確な実装
   - ✅ メタデータ状態（`qOutput`, `previousClockState`）の適切な管理
   - ✅ 状態保持機能の正常動作

2. **SR-LATCHゲートの評価**
   - ✅ Set/Reset操作の正確な実装
   - ✅ 状態保持機能（S=0, R=0時）
   - ✅ メタデータ状態の適切な管理

3. **循環依存の検出**
   - ✅ フィードバックループの確実な検出
   - ✅ 循環参照による無限ループの防止
   - ✅ 明確なエラーメッセージ（日本語）

4. **組み合わせ回路の評価**
   - ✅ 1回の評価で安定状態に収束
   - ✅ 依存関係グラフによる効率的な評価順序
   - ✅ 高速なパフォーマンス

### ❌ 問題と制限事項

1. **真のフィードバックループの処理不可**
   - ❌ NORゲート間のクロスカップリングは循環依存として検出される
   - ❌ 反復評価による収束機能なし
   - ❌ 真のSR-Latchの手動構築は不可能

2. **複数出力ピンの処理問題**
   - ⚠️ SR-LATCHのQ-bar出力（負のピンインデックス）で予期しない動作
   - ⚠️ カスタムゲートの複数出力処理に課題

3. **CLOCKゲートの時間依存処理**
   - ⚠️ 固定時間プロバイダーでの動作に課題
   - ⚠️ 実時間と評価時間の同期問題

## 🔍 詳細調査結果

### 1. D-FFゲートの評価方法

**実装場所**: `src/domain/simulation/core/gateEvaluation.ts:240-269`

```typescript
function evaluateDFlipFlopGate(
  gate: Readonly<Gate>,
  inputs: readonly boolean[]
): Result<readonly boolean[], EvaluationError> {
  const d = inputs[0];
  const clk = inputs[1];
  const prevClk = gate.metadata?.previousClockState || false;
  let qOutput = gate.metadata?.qOutput || false;

  // 立ち上がりエッジ検出
  if (!prevClk && clk) {
    qOutput = d;
  }

  return success([qOutput]);
}
```

**評価**:
- ✅ 立ち上がりエッジトリガーを正確に実装
- ✅ メタデータからの状態取得と更新が適切
- ✅ エッジ検出ロジックが論理的に正しい

**テスト結果**:
```
D-FF初期状態: { output: false, qOutput: false, previousClockState: false }
D-FF立ち上がりエッジ後: { output: true, qOutput: true, previousClockState: true }
```

### 2. フィードバックループの循環参照処理

**実装場所**: `src/domain/simulation/core/circuitEvaluation.ts:320-428`

```typescript
function topologicalSort(
  dependencies: Map<string, string[]>,
  _dependents: Map<string, string[]>
): Result<{ evaluationOrder: string[]; cycles: string[][] }, DependencyError> {
  // 深度優先探索による循環依存検出
  function visit(gateId: string, path: string[]): boolean {
    if (visiting.has(gateId)) {
      // 循環依存を発見
      const cycleStart = path.indexOf(gateId);
      if (cycleStart >= 0) {
        const cycle = [...path.slice(cycleStart), gateId];
        cycles.push(cycle);
      }
      return false;
    }
    // ...
  }
}
```

**評価**:
- ✅ 循環依存を確実に検出
- ✅ 無限ループを防止
- ❌ 順序回路特有のフィードバックを処理できない

**制限事項**:
現在の実装は組み合わせ回路を前提としており、順序回路のフィードバックループを「バグ」として扱う。これは意図的な設計判断と思われる。

### 3. NORゲート間の相互接続処理

**テスト結果**:
```
=== 真のフィードバックループ（NORゲート）テスト ===
評価結果: FAILURE
期待通りの循環依存エラー: 回路に無限ループが発生しています：nor-q → nor-qbar → nor-q
```

**評価**:
- ✅ 循環依存として正しく検出
- ❌ 真のSR-Latch構築は不可能
- ❌ フィードバック回路のシミュレーション機能なし

### 4. 順序回路での安定状態の収束処理

**現在の実装**: 1回評価のみ、反復評価なし

**組み合わせ回路での収束**:
```
最終状態: AND出力: false, NOT出力: true
評価時間: 0 ms
評価順序: ['input-1', 'input-2', 'and-gate', 'not-gate']
```

**評価**:
- ✅ 組み合わせ回路は1回で収束
- ❌ フィードバックループの収束機能なし
- ⚠️ 順序回路には専用ゲート（D-FF、SR-LATCH）のみ対応

## 🚨 発見された問題

### 1. 複数出力ピンの処理問題

SR-LATCHの出力テストで発見:
```
SR-LATCH状態: { output: true, qOutput: true, qBarOutput: false }
出力状態: { Q: true, QBar: true }  // ← QBarが期待値と異なる
```

**原因**: 負のピンインデックス（`pinIndex: -1`）でのQ-bar出力処理に問題がある可能性

### 2. CLOCKゲートの時間同期問題

D-FFシフトレジスタテストで発見:
```
時間0での状態: CLOCK出力: false
時間1500での状態: CLOCK出力: false  // ← 期待値true
```

**原因**: CLOCKゲートの`startTime`メタデータが評価時に適切に設定されていない可能性

## 💡 改善案

### 1. 反復評価機能の追加

```typescript
export function evaluateCircuitIterative(
  circuit: Readonly<Circuit>,
  config: Readonly<EvaluationConfig & { maxIterations?: number }>
): Result<CircuitEvaluationResult, EvaluationError> {
  let currentCircuit = circuit;
  let iteration = 0;
  const maxIterations = config.maxIterations || 100;

  while (iteration < maxIterations) {
    const result = evaluateCircuit(currentCircuit, config);
    if (!result.success) return result;

    // 収束チェック
    if (isCircuitStable(circuit, result.data.circuit)) {
      return result;
    }

    currentCircuit = result.data.circuit;
    iteration++;
  }

  return failure(createEvaluationError(
    'Circuit did not converge within maximum iterations',
    'CIRCUIT_TRAVERSAL'
  ));
}
```

### 2. フィードバック回路の特別処理

```typescript
interface SequentialCircuitConfig extends EvaluationConfig {
  enableFeedbackProcessing: boolean;
  convergenceThreshold: number;
  feedbackIterations: number;
}

function processFeedbackLoops(
  circuit: Circuit,
  dependencyGraph: DependencyGraph
): Result<Circuit, EvaluationError> {
  // フィードバックループを含む回路の特別処理
  // 1. フィードバックループを識別
  // 2. 反復評価で安定状態を探索
  // 3. 収束判定
}
```

### 3. 複数出力ピンの修正

```typescript
function updateWireStates(gate: Gate, ...): void {
  wireMap.forEach(wire => {
    if (wire.from.gateId === gate.id) {
      if (gate.type === 'SR-LATCH' && wire.from.pinIndex === -1) {
        // Q-bar出力の特別処理
        wire.isActive = gate.metadata?.qBarOutput || false;
      } else if (gate.type === 'CUSTOM' && gate.outputs && wire.from.pinIndex < 0) {
        // カスタムゲートの複数出力処理
        const outputIndex = -wire.from.pinIndex - 1;
        wire.isActive = gate.outputs[outputIndex] || false;
      } else {
        wire.isActive = gate.output;
      }
    }
  });
}
```

### 4. CLOCKゲートの時間同期修正

```typescript
function evaluateClockGate(
  gate: Readonly<Gate>,
  config: Readonly<EvaluationConfig>
): Result<readonly boolean[], EvaluationError> {
  if (!gate.metadata?.isRunning) {
    return success([false]);
  }

  const frequency = gate.metadata.frequency || 1;
  const period = 1000 / frequency;
  const now = config.timeProvider.getCurrentTime();
  
  // startTimeの確実な初期化
  const startTime = gate.metadata.startTime ?? now;
  const elapsed = now - startTime;
  
  // 周期的な切り替え（修正版）
  const halfPeriod = period / 2;
  const cyclePosition = elapsed % period;
  const isHigh = cyclePosition >= halfPeriod;

  return success([isHigh]);
}
```

## 📈 推奨される開発アプローチ

### 短期的改善（優先度：高）

1. **複数出力ピンのバグ修正**
   - SR-LATCHのQ-bar出力処理を修正
   - カスタムゲートの複数出力処理を改善

2. **CLOCKゲートの時間同期修正**
   - `startTime`の初期化タイミングを修正
   - 時間プロバイダーとの同期を改善

3. **エラーメッセージの改善**
   - 循環依存エラーを英語に統一（テスト対応）
   - より詳細なデバッグ情報を提供

### 中期的改善（優先度：中）

1. **反復評価機能の実装**
   - フィードバック回路の収束処理
   - 安定状態の自動検出

2. **順序回路専用の評価モード**
   - 組み合わせ回路と順序回路の区別
   - 適切な評価戦略の自動選択

### 長期的改善（優先度：低）

1. **真のフィードバックループ対応**
   - NORゲートでのSR-Latch構築対応
   - より複雑な順序回路のサポート

2. **パフォーマンス最適化**
   - 大規模順序回路の効率的処理
   - 並列評価の検討

## 🏁 結論

現在の`evaluateCircuit`関数は**組み合わせ回路に特化した優秀な実装**であり、D-FFやSR-LATCHなどの専用ゲートを通じて順序回路の基本機能を提供している。

**主な強み**:
- 循環依存の確実な検出と防止
- 専用順序ゲートの正確な実装
- 高速で安定した評価性能

**主な制限**:
- 真のフィードバックループ処理不可
- 1回評価のみ（反復評価なし）
- 一部の出力ピン処理に課題

教育用論理回路シミュレータとしては現在の実装で十分実用的だが、より高度な順序回路シミュレーションには追加の機能実装が必要である。

---

**次のアクション**:
1. 複数出力ピンのバグ修正を優先実装
2. CLOCKゲートの時間同期問題を解決
3. 反復評価機能の設計検討

**影響範囲**:
- `src/domain/simulation/core/circuitEvaluation.ts`
- `src/domain/simulation/core/gateEvaluation.ts`
- 関連するテストケース