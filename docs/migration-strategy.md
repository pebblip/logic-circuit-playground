# 🔄 段階的API移行戦略

## 📋 移行概要

既存の103個のテストと全機能を維持しながら、新しい純粋関数APIに安全に移行する3段階戦略。

### 🎯 移行目標
- ✅ **既存テスト103個を100%維持**
- ✅ **機能のデグレを防止**
- ✅ **段階的な品質向上**
- ✅ **開発者体験の改善**

---

## 🗓️ **3段階移行計画**

### 📦 **Phase A: 並行提供** (1週間)
**目標**: 新APIを既存APIと並行して提供、機能検証

#### A1. 新API基盤実装
```bash
src/domain/simulation/
├── pure/                    # 新API実装
│   ├── types.ts            # Result型、エラー型
│   ├── validation.ts       # 入力検証
│   ├── gateEvaluation.ts   # 純粋関数ゲート評価
│   └── circuitEvaluation.ts # 純粋関数回路評価
└── legacy/                  # 既存API（変更なし）
    └── circuitSimulation.ts # 既存実装
```

#### A2. 並行エクスポート
```typescript
// src/domain/simulation/index.ts
// ✅ 既存API（互換性維持）
export { 
  evaluateGate, 
  evaluateCircuit, 
  evaluateCircuitSafe 
} from './legacy/circuitSimulation';

// ✅ 新API（並行提供）
export {
  evaluateGateUnified,
  evaluateCircuitPure,
  validateCircuit
} from './pure/circuitEvaluation';

export type {
  Result,
  GateEvaluationResult,
  CircuitEvaluationResult
} from './pure/types';
```

#### A3. 新API基本テスト
```typescript
// tests/domain/simulation/pure/
├── gateEvaluation.test.ts      # 新API単体テスト
├── circuitEvaluation.test.ts   # 新API回路テスト
├── validation.test.ts          # バリデーションテスト
└── compatibility.test.ts       # 互換性テスト
```

**成果物**: 新旧API並行動作、基本機能検証済み

---

### 🔧 **Phase B: 内部移行** (1週間)
**目標**: 既存APIの内部実装を新APIベースに移行、外部インターフェース維持

#### B1. Legacy Adapter実装
```typescript
// src/domain/simulation/legacy/adapter.ts
import { evaluateGateUnified, evaluateCircuitPure } from '../pure/circuitEvaluation';
import type { Gate, Wire } from '../../../types/circuit';

/**
 * 既存APIの互換性を維持するアダプター
 */
export function evaluateGateLegacyAdapter(
  gate: Gate,
  inputs: boolean[],
  timeProvider?: TimeProvider
): boolean | boolean[] {
  // 新API呼び出し
  const result = evaluateGateUnified(
    gate as Readonly<Gate>, 
    inputs as readonly boolean[], 
    { timeProvider: timeProvider || realTimeProvider, enableDebug: false, strictValidation: false, maxRecursionDepth: 100 }
  );
  
  if (result.success) {
    // 既存APIの戻り値形式に変換
    return result.data.isSingleOutput 
      ? result.data.primaryOutput 
      : [...result.data.outputs]; // readonlyを通常の配列に変換
  } else {
    // 既存APIの動作に合わせてエラーを投げる
    throw new Error(`Gate evaluation failed: ${result.error.message}`);
  }
}

export function evaluateCircuitLegacyAdapter(
  gates: Gate[],
  wires: Wire[],
  timeProvider?: TimeProvider
): { gates: Gate[]; wires: Wire[] } {
  const circuit = { gates: gates as readonly Gate[], wires: wires as readonly Wire[] };
  const config = { 
    timeProvider: timeProvider || realTimeProvider, 
    enableDebug: false, 
    strictValidation: false, 
    maxRecursionDepth: 100 
  };
  
  const result = evaluateCircuitPure(circuit, config);
  
  if (result.success) {
    // 既存APIの戻り値形式に変換（副作用をシミュレート）
    const updatedGates = [...result.data.circuit.gates];
    const updatedWires = [...result.data.circuit.wires];
    
    // 元の配列を更新（既存APIの副作用動作を維持）
    gates.splice(0, gates.length, ...updatedGates);
    wires.splice(0, wires.length, ...updatedWires);
    
    return { gates: updatedGates, wires: updatedWires };
  } else {
    // エラー処理（既存動作に合わせる）
    console.error('Circuit evaluation failed:', result.error.message);
    return { gates: [...gates], wires: [...wires] };
  }
}
```

#### B2. 段階的な内部移行
```typescript
// src/domain/simulation/legacy/circuitSimulation.ts
import { 
  evaluateGateLegacyAdapter, 
  evaluateCircuitLegacyAdapter 
} from './adapter';

// 段階1: evaluateGateを内部移行
export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  timeProvider?: TimeProvider
): boolean | boolean[] {
  return evaluateGateLegacyAdapter(gate, inputs, timeProvider);
}

// 段階2: evaluateCircuitを内部移行  
export function evaluateCircuit(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): { gates: Gate[]; wires: Wire[] } {
  return evaluateCircuitLegacyAdapter(gates, wires, timeProvider);
}

// 段階3: evaluateCircuitSafeも内部移行
export function evaluateCircuitSafe(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): CircuitEvaluationResult {
  // 新APIで評価してから旧形式に変換
  const circuit = { gates: gates as readonly Gate[], wires: wires as readonly Wire[] };
  const result = evaluateCircuitPure(circuit, { timeProvider, enableDebug: false, strictValidation: true, maxRecursionDepth: 100 });
  
  if (result.success) {
    return {
      gates: [...result.data.circuit.gates],
      wires: [...result.data.circuit.wires],
      errors: [], // 新APIは成功時エラーなし
      warnings: [...result.warnings]
    };
  } else {
    return {
      gates: [...gates],
      wires: [...wires],
      errors: [convertToLegacyError(result.error)],
      warnings: [...result.warnings]
    };
  }
}
```

#### B3. 互換性テスト強化
```typescript
// tests/domain/simulation/migration/
├── legacyCompatibility.test.ts     # 既存API完全互換性テスト
├── performanceRegression.test.ts   # パフォーマンス回帰テスト
├── edgeCaseCompatibility.test.ts   # エッジケース互換性
└── existingTestsValidation.test.ts # 既存103テストの結果一致確認
```

**成果物**: 内部実装を新APIに移行、既存APIは完全互換維持

---

### 🚀 **Phase C: 完全移行** (1週間)
**目標**: 新APIを主要APIに、旧APIを非推奨化

#### C1. APIの非推奨化
```typescript
// src/domain/simulation/index.ts
/**
 * @deprecated Use evaluateGateUnified instead
 * @see evaluateGateUnified for the new type-safe API
 */
export function evaluateGate(gate: Gate, inputs: boolean[]): boolean | boolean[] {
  console.warn('evaluateGate is deprecated. Use evaluateGateUnified for better type safety.');
  return evaluateGateLegacyAdapter(gate, inputs);
}

/**
 * @deprecated Use evaluateCircuitPure instead  
 * @see evaluateCircuitPure for the new immutable API
 */
export function evaluateCircuit(gates: Gate[], wires: Wire[]): { gates: Gate[]; wires: Wire[] } {
  console.warn('evaluateCircuit is deprecated. Use evaluateCircuitPure for immutable operations.');
  return evaluateCircuitLegacyAdapter(gates, wires);
}

// ✅ 新APIを推奨APIとして前面に
export {
  evaluateGateUnified as evaluateGate_v2,
  evaluateCircuitPure as evaluateCircuit_v2,
} from './pure/circuitEvaluation';
```

#### C2. 段階的なコードベース移行
```typescript
// 段階的にコードベースの新API利用を増やす
// 
// 1. 新しいコンポーネントは新APIのみ使用
// 2. 既存コンポーネントは段階的に移行
// 3. テストは両方のAPIで動作確認

// 例: src/stores/circuitStore.ts の段階的移行
import { 
  evaluateCircuitPure,  // 新API
  evaluateCircuit       // 既存API（フォールバック）
} from '../domain/simulation';

export const circuitStore = create<CircuitState>((set, get) => ({
  evaluateCircuit: (useNewApi = false) => {
    const { gates, wires } = get();
    
    if (useNewApi) {
      // 新API使用
      const result = evaluateCircuitPure({ gates, wires });
      if (result.success) {
        set({ 
          gates: [...result.data.circuit.gates], 
          wires: [...result.data.circuit.wires],
          lastEvaluationStats: result.data.evaluationStats
        });
      }
    } else {
      // 既存API使用（フォールバック）
      const { gates: newGates, wires: newWires } = evaluateCircuit(gates, wires);
      set({ gates: newGates, wires: newWires });
    }
  }
}));
```

#### C3. 移行完了の検証
```typescript
// tests/domain/simulation/migration/migrationComplete.test.ts
describe('Migration Complete Validation', () => {
  it('should maintain 100% compatibility with existing tests', async () => {
    // 既存の103個のテストを新API経由で実行
    const existingTestResults = await runAllExistingTests();
    const newApiTestResults = await runAllTestsWithNewApi();
    
    expect(newApiTestResults).toEqual(existingTestResults);
  });
  
  it('should provide better error messages with new API', () => {
    const invalidCircuit = createInvalidTestCircuit();
    
    // 旧API: エラー情報が不足
    expect(() => evaluateCircuit(invalidCircuit.gates, invalidCircuit.wires))
      .toThrow();
    
    // 新API: 詳細なエラー情報
    const result = evaluateCircuitPure(invalidCircuit);
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('VALIDATION_ERROR');
    expect(result.error.context?.gateId).toBeDefined();
  });
  
  it('should improve performance with new API', () => {
    const largeCircuit = createLargeTestCircuit(500);
    
    const legacyTime = measureTime(() => evaluateCircuit(largeCircuit.gates, largeCircuit.wires));
    const newTime = measureTime(() => evaluateCircuitPure(largeCircuit));
    
    expect(newTime).toBeLessThanOrEqual(legacyTime); // 同等以上のパフォーマンス
  });
});
```

**成果物**: 新API主要提供、旧API非推奨、完全互換性維持

---

## 🛡️ **リスク軽減策**

### 1. 段階的ロールバック対応
```typescript
// 緊急時のロールバック設定
export const API_CONFIG = {
  USE_NEW_API: process.env.USE_NEW_API === 'true',
  FALLBACK_TO_LEGACY: process.env.FALLBACK_TO_LEGACY === 'true',
  LOG_API_DIFFERENCES: process.env.LOG_API_DIFFERENCES === 'true'
};

export function evaluateCircuitWithFallback(gates: Gate[], wires: Wire[]) {
  if (API_CONFIG.USE_NEW_API) {
    try {
      const result = evaluateCircuitPure({ gates, wires });
      if (result.success) {
        return { gates: [...result.data.circuit.gates], wires: [...result.data.circuit.wires] };
      }
    } catch (error) {
      if (API_CONFIG.FALLBACK_TO_LEGACY) {
        console.warn('New API failed, falling back to legacy:', error);
        return evaluateCircuitLegacy(gates, wires);
      }
      throw error;
    }
  }
  return evaluateCircuitLegacy(gates, wires);
}
```

### 2. 自動回帰テスト
```typescript
// CI/CDでの自動回帰検証
describe('Regression Prevention', () => {
  beforeEach(() => {
    // テストごとに両方のAPIでスナップショット比較
  });
  
  it('should produce identical results across all test cases', () => {
    TEST_CASES.forEach(testCase => {
      const legacyResult = runLegacyApi(testCase);
      const newResult = runNewApiWithAdapter(testCase);
      
      expect(newResult).toEqual(legacyResult);
    });
  });
});
```

### 3. 段階的機能フラグ
```typescript
// 機能フラグによる段階的展開
interface FeatureFlags {
  enableNewGateEvaluation: boolean;
  enableNewCircuitEvaluation: boolean;
  enableStrictValidation: boolean;
  enablePerformanceLogging: boolean;
}

const featureFlags: FeatureFlags = {
  enableNewGateEvaluation: process.env.ENABLE_NEW_GATE_EVAL === 'true',
  enableNewCircuitEvaluation: process.env.ENABLE_NEW_CIRCUIT_EVAL === 'true',
  enableStrictValidation: process.env.ENABLE_STRICT_VALIDATION === 'true',
  enablePerformanceLogging: process.env.ENABLE_PERF_LOGGING === 'true'
};
```

---

## 📊 **品質保証チェックリスト**

### Phase A 完了条件
- [ ] 新API基盤実装完了
- [ ] 基本的なゲート評価が動作
- [ ] 型安全性の確認
- [ ] 基本テストスイート通過
- [ ] パフォーマンス測定完了

### Phase B 完了条件  
- [ ] 全既存テスト103個が通過
- [ ] 互換性アダプターの動作確認
- [ ] パフォーマンス回帰なし
- [ ] エラーハンドリングの改善確認
- [ ] メモリリークなし

### Phase C 完了条件
- [ ] 新API完全動作
- [ ] 非推奨警告の実装
- [ ] ドキュメント更新完了
- [ ] 移行ガイド作成完了
- [ ] 全機能品質テスト通過

---

## 📈 **成功指標**

### 技術指標
- **テスト通過率**: 103個全テスト 100%通過維持
- **パフォーマンス**: 新API ≥ 旧API性能
- **型安全性**: TypeScriptエラー0個達成
- **メモリ使用量**: 新API ≤ 旧API + 20%

### 開発者体験指標  
- **コンパイル時エラー検出**: boolean | boolean[] 型問題の撲滅
- **デバッグ容易性**: エラー情報の詳細化
- **コード保守性**: 副作用の排除による予測可能性向上

### 運用指標
- **デプロイ成功率**: 100%（回帰なし）
- **緊急ロールバック**: 0回
- **API利用者満足度**: 既存コードが問題なく動作

---

## 🔄 **継続的改善**

### 1. 段階的最適化
```typescript
// Phase D: パフォーマンス最適化（移行完了後）
export function evaluateCircuitOptimized(
  circuit: Readonly<Circuit>,
  config: OptimizedConfig
): Result<CircuitEvaluationResult, EvaluationError> {
  // WebAssembly、Worker活用、キャッシュ戦略等
}
```

### 2. 機能拡張
```typescript
// Phase E: 高度な機能追加（移行完了後）
export function evaluateCircuitWithAnalytics(
  circuit: Readonly<Circuit>
): Result<CircuitEvaluationResult & AnalyticsData, EvaluationError> {
  // 回路分析、最適化提案等
}
```

---

## 📋 **実装スケジュール**

| 週 | フェーズ | 主要タスク | 成果物 |
|---|---|---|---|
| 1 | Phase A | 新API基盤実装 | 並行API提供 |
| 2 | Phase B | 内部移行・互換性保証 | 内部新API化 |  
| 3 | Phase C | 完全移行・非推奨化 | 新API主要提供 |
| 4 | 検証 | 総合テスト・ドキュメント | 移行完了 |

**この移行戦略により、リスクを最小化しながら技術的負債を根本的に解決し、将来の拡張性を確保できます。**