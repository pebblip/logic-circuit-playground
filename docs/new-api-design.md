# 🚀 新API設計仕様

## 📋 設計概要

現在のAPIの問題点（型安全性、副作用、エラーハンドリング不統一）を解決する、完全に新しい純粋関数ベースのAPI設計。

### 🎯 設計原則

1. **完全な型安全性** - 戻り値の型を実行時ではなくコンパイル時に決定
2. **純粋関数** - 副作用なし、イミュータブル操作のみ
3. **統一エラーハンドリング** - Result型パターンによる一貫した成功/失敗処理
4. **後方互換性** - 既存APIと並行提供、段階的移行可能

---

## 🔧 **コア型定義**

### Result型パターン（Rust風）

```typescript
// 基本Result型 - 成功/失敗を型安全に表現
export type Result<T, E = ApiError> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly warnings: readonly string[];
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
  readonly warnings: readonly string[];
}

// ヘルパー関数
export const success = <T>(data: T, warnings: readonly string[] = []): Success<T> => ({
  success: true,
  data,
  warnings
});

export const failure = <E>(error: E, warnings: readonly string[] = []): Failure<E> => ({
  success: false,
  error,
  warnings
});
```

### エラー型定義

```typescript
export interface ApiError {
  readonly type: 'VALIDATION_ERROR' | 'EVALUATION_ERROR' | 'DEPENDENCY_ERROR' | 'CONFIGURATION_ERROR';
  readonly message: string;
  readonly context?: {
    readonly gateId?: string;
    readonly wireId?: string;
    readonly pinIndex?: number;
    readonly stack?: readonly string[];
  };
}

export interface ValidationError extends ApiError {
  readonly type: 'VALIDATION_ERROR';
  readonly violations: readonly {
    readonly field: string;
    readonly value: unknown;
    readonly constraint: string;
  }[];
}

export interface EvaluationError extends ApiError {
  readonly type: 'EVALUATION_ERROR';
  readonly stage: 'INPUT_COLLECTION' | 'GATE_LOGIC' | 'OUTPUT_ASSIGNMENT';
}

export interface DependencyError extends ApiError {
  readonly type: 'DEPENDENCY_ERROR';
  readonly missingDependencies: readonly string[];
  readonly circularDependencies: readonly string[][];
}
```

---

## 🎮 **ゲート評価API**

### 新しいゲート評価関数

```typescript
// ✅ 型安全な単一出力ゲート評価
export function evaluateGatePure(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<SingleGateResult, EvaluationError>

// ✅ 型安全な複数出力ゲート評価
export function evaluateMultiOutputGatePure(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<MultiGateResult, EvaluationError>

// ✅ ポリモーフィック統合版（推奨）
export function evaluateGateUnified(
  gate: Readonly<Gate>,
  inputs: readonly boolean[],
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<GateEvaluationResult, EvaluationError>
```

### 戻り値型定義

```typescript
// 単一出力結果
export interface SingleGateResult {
  readonly output: boolean;
  readonly metadata?: Readonly<GateMetadata>;
  readonly debugInfo?: Readonly<DebugInfo>;
}

// 複数出力結果
export interface MultiGateResult {
  readonly outputs: readonly boolean[];
  readonly metadata?: Readonly<GateMetadata>;
  readonly debugInfo?: Readonly<DebugInfo>;
}

// 統合結果型（推奨）
export interface GateEvaluationResult {
  readonly outputs: readonly boolean[]; // 常に配列、単一出力でも[boolean]
  readonly metadata?: Readonly<GateMetadata>;
  readonly debugInfo?: Readonly<DebugInfo>;
  
  // 便利メソッド（後方互換性用）
  readonly primaryOutput: boolean; // outputs[0] のエイリアス
  readonly isSingleOutput: boolean; // outputs.length === 1
}
```

### 設定型定義

```typescript
export interface EvaluationConfig {
  readonly timeProvider: TimeProvider;
  readonly enableDebug: boolean;
  readonly strictValidation: boolean;
  readonly maxRecursionDepth: number;
  readonly customGateEvaluator?: CustomGateEvaluator;
}

export const defaultConfig: EvaluationConfig = {
  timeProvider: realTimeProvider,
  enableDebug: false,
  strictValidation: true,
  maxRecursionDepth: 100,
};
```

---

## 🔄 **回路評価API**

### 新しい回路評価関数

```typescript
// ✅ 純粋関数版回路評価
export function evaluateCircuitPure(
  circuit: Readonly<Circuit>,
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<CircuitEvaluationResult, DependencyError | EvaluationError>

// ✅ 段階的評価（大規模回路用）
export function evaluateCircuitIncremental(
  circuit: Readonly<Circuit>,
  changedGateIds: readonly string[],
  previousResult: Readonly<CircuitEvaluationResult>,
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<CircuitEvaluationResult, EvaluationError>
```

### 回路型定義

```typescript
// Immutableな回路定義
export interface Circuit {
  readonly gates: readonly Gate[];
  readonly wires: readonly Wire[];
  readonly metadata?: Readonly<CircuitMetadata>;
}

// 回路評価結果
export interface CircuitEvaluationResult {
  readonly circuit: Readonly<Circuit>; // 更新された回路（元は変更されない）
  readonly evaluationStats: Readonly<EvaluationStats>;
  readonly dependencyGraph: Readonly<DependencyGraph>;
  readonly debugTrace?: readonly DebugTraceEntry[];
}

export interface EvaluationStats {
  readonly totalGates: number;
  readonly evaluatedGates: number;
  readonly skippedGates: number;
  readonly evaluationTimeMs: number;
  readonly dependencyResolutionTimeMs: number;
  readonly gateEvaluationTimes: ReadonlyMap<string, number>;
}
```

---

## 🛠️ **カスタムゲート評価API**

### 型安全なカスタムゲート処理

```typescript
// ✅ カスタムゲート専用評価関数
export function evaluateCustomGatePure(
  gate: Readonly<CustomGate>,
  inputs: readonly boolean[],
  evaluator: CustomGateEvaluator,
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<GateEvaluationResult, EvaluationError>

// カスタムゲート評価戦略
export interface CustomGateEvaluator {
  evaluateByTruthTable(
    definition: Readonly<CustomGateDefinition>,
    inputs: readonly boolean[]
  ): Result<readonly boolean[], EvaluationError>;
  
  evaluateByInternalCircuit(
    definition: Readonly<CustomGateDefinition>,
    inputs: readonly boolean[],
    config: Readonly<EvaluationConfig>
  ): Result<readonly boolean[], EvaluationError>;
}

// デフォルト実装
export const defaultCustomGateEvaluator: CustomGateEvaluator = {
  evaluateByTruthTable: (definition, inputs) => { /* ... */ },
  evaluateByInternalCircuit: (definition, inputs, config) => { /* ... */ }
};
```

---

## 🔍 **検証・バリデーションAPI**

### 入力検証

```typescript
// ✅ 回路構造の検証
export function validateCircuit(
  circuit: Readonly<Circuit>
): Result<ValidationResult, ValidationError>

// ✅ ゲート入力の検証  
export function validateGateInputs(
  gate: Readonly<Gate>,
  inputs: readonly boolean[]
): Result<void, ValidationError>

export interface ValidationResult {
  readonly isValid: boolean;
  readonly violations: readonly ValidationViolation[];
  readonly suggestions: readonly string[];
}

export interface ValidationViolation {
  readonly severity: 'ERROR' | 'WARNING' | 'INFO';
  readonly code: string;
  readonly message: string;
  readonly location: {
    readonly gateId?: string;
    readonly wireId?: string;
    readonly pinIndex?: number;
  };
}
```

---

## 🎯 **使用例**

### 基本的なゲート評価

```typescript
// ✅ 新API: 型安全、副作用なし
const gateResult = evaluateGateUnified(andGate, [true, false], config);

if (gateResult.success) {
  const output = gateResult.data.primaryOutput; // boolean型保証
  const outputs = gateResult.data.outputs; // readonly boolean[]型保証
  console.log(`AND gate result: ${output}`);
} else {
  console.error(`Evaluation failed: ${gateResult.error.message}`);
}

// ❌ 旧API: 型が不明、副作用あり
const legacyResult = evaluateGate(andGate, [true, false]); // boolean | boolean[]
if (Array.isArray(legacyResult)) {
  // 型ガードが必要、エラーの温床
}
```

### 回路評価

```typescript
// ✅ 新API: 完全にイミュータブル
const circuitResult = evaluateCircuitPure(circuit, config);

if (circuitResult.success) {
  const updatedCircuit = circuitResult.data.circuit; // 新しいオブジェクト
  const stats = circuitResult.data.evaluationStats;
  
  console.log(`Evaluated ${stats.evaluatedGates} gates in ${stats.evaluationTimeMs}ms`);
  
  // 元の回路は変更されていない
  expect(circuit.gates[0].output).toBe(originalValue); // ✅ 不変性保証
} else {
  console.error(`Circuit evaluation failed: ${circuitResult.error.message}`);
}

// ❌ 旧API: 副作用でオブジェクト変更
const { gates } = evaluateCircuit(circuit.gates, circuit.wires);
// 元のcircuit.gatesが変更されている！
```

### エラーハンドリング

```typescript
// ✅ 新API: 包括的エラー情報
const result = evaluateCircuitPure(invalidCircuit, config);

if (!result.success) {
  switch (result.error.type) {
    case 'DEPENDENCY_ERROR':
      console.log('Missing dependencies:', result.error.missingDependencies);
      console.log('Circular dependencies:', result.error.circularDependencies);
      break;
    case 'EVALUATION_ERROR':
      console.log('Evaluation failed at stage:', result.error.stage);
      console.log('Gate context:', result.error.context?.gateId);
      break;
  }
}

// ❌ 旧API: エラー情報不足
try {
  evaluateCircuit(gates, wires);
} catch (error) {
  console.log('何か失敗した'); // 何が失敗したかわからない
}
```

---

## 🔄 **移行戦略**

### Phase A: 新API実装（並行提供）

```typescript
// 既存APIは残したまま、新APIを追加
export { evaluateGate, evaluateCircuit } from './legacy/circuitSimulation';
export { evaluateGateUnified, evaluateCircuitPure } from './pure/circuitSimulation';
```

### Phase B: 段階的移行

```typescript
// 内部実装を新APIに移行、外部インターフェースは維持
export function evaluateGate(gate: Gate, inputs: boolean[]): boolean | boolean[] {
  const result = evaluateGateUnified(gate, inputs, defaultConfig);
  
  if (result.success) {
    // 後方互換性のため旧形式で返す
    return result.data.isSingleOutput ? result.data.primaryOutput : result.data.outputs;
  } else {
    // 旧APIの動作に合わせてエラーを投げる
    throw new Error(result.error.message);
  }
}
```

### Phase C: 完全移行

```typescript
// 旧APIを非推奨化、新APIを推奨
/**
 * @deprecated Use evaluateGateUnified instead
 */
export function evaluateGate(...): ... { /* ... */ }
```

---

## 📊 **パフォーマンス考慮**

### Immutabilityによるオーバーヘッド対策

```typescript
// ✅ 構造共有によるメモリ効率化
export function updateGateInCircuit(
  circuit: Readonly<Circuit>,
  gateId: string,
  updater: (gate: Readonly<Gate>) => Readonly<Gate>
): Readonly<Circuit> {
  const gateIndex = circuit.gates.findIndex(g => g.id === gateId);
  if (gateIndex === -1) return circuit;
  
  // 構造共有: 変更された部分のみ新しいオブジェクト
  return {
    ...circuit,
    gates: [
      ...circuit.gates.slice(0, gateIndex),
      updater(circuit.gates[gateIndex]),
      ...circuit.gates.slice(gateIndex + 1)
    ]
  };
}
```

### 差分更新による高速化

```typescript
// ✅ 差分更新で不要な再計算を回避
export function evaluateCircuitIncremental(
  circuit: Readonly<Circuit>,
  changedGateIds: readonly string[],
  previousResult: Readonly<CircuitEvaluationResult>,
  config: Readonly<EvaluationConfig>
): Result<CircuitEvaluationResult, EvaluationError> {
  // 変更されたゲートとその依存関係のみ再評価
  const affectedGateIds = computeAffectedGates(changedGateIds, previousResult.dependencyGraph);
  
  // 既存結果を基に差分更新
  return updateCircuitPartial(circuit, affectedGateIds, previousResult, config);
}
```

---

## 🧪 **テスト戦略**

### 1. 新API単体テスト

```typescript
describe('Pure API', () => {
  it('should maintain immutability', () => {
    const originalGate = Object.freeze({ id: 'test', type: 'AND', /* ... */ });
    const result = evaluateGateUnified(originalGate, [true, false]);
    
    expect(originalGate).toBe(originalGate); // 参照が変わっていない
    expect(result.success).toBe(true);
  });
  
  it('should provide detailed error information', () => {
    const invalidGate = { /* malformed gate */ };
    const result = evaluateGateUnified(invalidGate as any, [true]);
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('VALIDATION_ERROR');
    expect(result.error.context?.gateId).toBe(invalidGate.id);
  });
});
```

### 2. 後方互換性テスト

```typescript
describe('Legacy API Compatibility', () => {
  it('should produce same results as legacy API', () => {
    const gate = createTestGate();
    const inputs = [true, false];
    
    const legacyResult = evaluateGate(gate, inputs);
    const newResult = evaluateGateUnified(gate, inputs);
    
    if (newResult.success) {
      const convertedResult = newResult.data.isSingleOutput 
        ? newResult.data.primaryOutput 
        : newResult.data.outputs;
      expect(convertedResult).toEqual(legacyResult);
    }
  });
});
```

### 3. パフォーマンステスト

```typescript
describe('Performance Comparison', () => {
  it('should not significantly degrade performance', () => {
    const circuit = createLargeTestCircuit(1000);
    
    const legacyTime = measureTime(() => evaluateCircuit(circuit.gates, circuit.wires));
    const newTime = measureTime(() => evaluateCircuitPure(circuit));
    
    expect(newTime).toBeLessThan(legacyTime * 1.5); // 最大50%のオーバーヘッド許容
  });
});
```

---

## 🎯 **実装優先順位**

### Phase 1: 基盤実装 (1週間)
1. **Result型とエラー型定義**
2. **基本的なvalidation関数**
3. **evaluateGateUnified実装**
4. **基本テストスイート**

### Phase 2: 回路評価実装 (1週間)  
1. **evaluateCircuitPure実装**
2. **DependencyGraph実装**
3. **包括的エラーハンドリング**
4. **パフォーマンステスト**

### Phase 3: 高度な機能実装 (1週間)
1. **incremental evaluation**
2. **custom gate evaluator**
3. **debug tracing**
4. **migration utilities**

---

## 💡 **今後の拡張性**

### WebAssembly対応準備
```typescript
// 将来的にWASMで高速化可能な設計
export interface WasmCircuitEvaluator {
  evaluateCircuitWasm(
    circuit: SerializableCircuit,
    config: WasmConfig
  ): Promise<Result<CircuitEvaluationResult, EvaluationError>>;
}
```

### Worker対応
```typescript
// Web Workerでの並列実行対応
export interface WorkerEvaluationConfig extends EvaluationConfig {
  readonly useWorker: boolean;
  readonly workerCount: number;
  readonly chunkSize: number;
}
```

---

**この新API設計により、型安全性・保守性・パフォーマンス・テスタビリティの全てが大幅に向上し、技術的負債を根本から解決できます。**