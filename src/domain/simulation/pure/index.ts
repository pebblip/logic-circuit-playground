/**
 * 新API純粋関数シミュレーション - メインエクスポート
 * 
 * 完全な型安全性とimmutabilityを提供する新しいAPI。
 * 既存のレガシーAPIと並行して使用可能。
 */

// ===============================
// 型定義のエクスポート
// ===============================

export type {
  // Result型パターン
  Result,
  Success,
  Failure,

  // エラー型
  ApiError,
  ValidationError,
  EvaluationError,
  DependencyError,
  ConfigurationError,

  // 設定型
  EvaluationConfig,
  CustomGateEvaluator,

  // ゲート評価結果
  GateEvaluationResult,
  GateMetadata,
  DebugInfo,

  // 回路関連型
  Circuit,
  CircuitMetadata,
  CircuitEvaluationResult,
  EvaluationStats,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  DebugTraceEntry,

  // バリデーション型
  ValidationResult,
  ValidationViolation,
  
  // 時間プロバイダー
  TimeProvider
} from './types';

// ===============================
// ユーティリティ関数のエクスポート
// ===============================

export {
  // Result型ヘルパー
  success,
  failure,
  isSuccess,
  isFailure,
  mapResult,
  flatMapResult,

  // 作成ヘルパー
  createGateResult,
  createValidationError,
  createEvaluationError,
  createDependencyError,

  // デフォルト設定
  defaultConfig,
  
  // 時間プロバイダー
  realTimeProvider,
  createDeterministicTimeProvider,
  createFixedTimeProvider
} from './types';

// ===============================
// バリデーション機能のエクスポート
// ===============================

export {
  // 基本バリデーション
  validateGateId,
  validateGateType,
  validateGatePosition,
  validateGateInputs,

  // 構造バリデーション
  validateGate,
  validateWire,
  validateCustomGateDefinition,

  // 回路バリデーション
  validateCircuit,
  validateCircuitLight
} from './validation';

// ===============================
// ゲート評価機能のエクスポート
// ===============================

export {
  // メイン評価関数
  evaluateGateUnified,

  // 後方互換性ヘルパー（非推奨）
  evaluateGateSingle,
  evaluateGateMulti,
  convertToLegacyFormat,

  // カスタムゲート評価器
  defaultCustomGateEvaluator
} from './gateEvaluation';

// ===============================
// 回路評価機能のエクスポート
// ===============================

export {
  // メイン回路評価関数
  evaluateCircuitPure,

  // 将来拡張機能（現在は未実装）
  evaluateCircuitIncremental,
  evaluateCircuitParallel,

  // デバッグユーティリティ
  visualizeDependencyGraph,
  formatEvaluationStats
} from './circuitEvaluation';

// ===============================
// 推奨API関数（メイン関数）
// ===============================

/**
 * 新API - ゲート評価
 * 
 * 推奨: この関数を使用してください
 * @see evaluateGateUnified
 */
export { evaluateGateUnified as evaluateGate_v2 } from './gateEvaluation';

/**
 * 新API - 回路評価
 * 
 * 推奨: この関数を使用してください
 * @see evaluateCircuitPure
 */
export { evaluateCircuitPure as evaluateCircuit_v2 } from './circuitEvaluation';

/**
 * 新API - 回路検証
 * 
 * 推奨: この関数を使用してください
 * @see validateCircuit
 */
export { validateCircuit as validateCircuit_v2 } from './validation';

// ===============================
// 使用例とドキュメント
// ===============================

/**
 * @example 基本的なゲート評価
 * ```typescript
 * import { evaluateGateUnified, defaultConfig } from './pure';
 * 
 * const andGate: Gate = {
 *   id: 'and1',
 *   type: 'AND',
 *   position: { x: 0, y: 0 },
 *   inputs: ['', ''],
 *   output: false
 * };
 * 
 * const result = evaluateGateUnified(andGate, [true, false], defaultConfig);
 * if (result.success) {
 *   console.log('Output:', result.data.primaryOutput); // false
 *   console.log('Outputs:', result.data.outputs); // [false]
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */

/**
 * @example 基本的な回路評価
 * ```typescript
 * import { evaluateCircuitPure, defaultConfig } from './pure';
 * 
 * const circuit: Circuit = {
 *   gates: [
 *     { id: 'input1', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], output: true },
 *     { id: 'not1', type: 'NOT', position: { x: 100, y: 0 }, inputs: [''], output: false }
 *   ],
 *   wires: [
 *     { id: 'wire1', from: { gateId: 'input1', pinIndex: -1 }, to: { gateId: 'not1', pinIndex: 0 }, isActive: false }
 *   ]
 * };
 * 
 * const result = evaluateCircuitPure(circuit, defaultConfig);
 * if (result.success) {
 *   const updatedCircuit = result.data.circuit;
 *   const stats = result.data.evaluationStats;
 *   console.log('Evaluated gates:', stats.evaluatedGates);
 *   console.log('NOT gate output:', updatedCircuit.gates[1].output); // false
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */

/**
 * @example エラーハンドリング
 * ```typescript
 * import { evaluateCircuitPure, isFailure } from './pure';
 * 
 * const result = evaluateCircuitPure(invalidCircuit);
 * if (isFailure(result)) {
 *   switch (result.error.type) {
 *     case 'VALIDATION_ERROR':
 *       console.log('Validation failed:', result.error.violations);
 *       break;
 *     case 'DEPENDENCY_ERROR':
 *       console.log('Dependency error:', result.error.circularDependencies);
 *       break;
 *     case 'EVALUATION_ERROR':
 *       console.log('Evaluation error at stage:', result.error.stage);
 *       break;
 *   }
 * }
 * ```
 */

/**
 * @example カスタム設定
 * ```typescript
 * import { evaluateCircuitPure, defaultConfig } from './pure';
 * 
 * const customConfig: EvaluationConfig = {
 *   ...defaultConfig,
 *   enableDebug: true,
 *   strictValidation: false,
 *   maxRecursionDepth: 50
 * };
 * 
 * const result = evaluateCircuitPure(circuit, customConfig);
 * if (result.success && result.data.debugTrace) {
 *   console.log('Debug trace:', result.data.debugTrace);
 * }
 * ```
 */

// ===============================
// 新旧API比較表
// ===============================

/**
 * 新旧API比較:
 * 
 * | 機能 | 旧API | 新API |
 * |------|-------|-------|
 * | ゲート評価 | `evaluateGate(gate, inputs)` | `evaluateGateUnified(gate, inputs, config)` |
 * | 戻り値型 | `boolean \| boolean[]` | `Result<GateEvaluationResult, EvaluationError>` |
 * | 副作用 | あり（オブジェクト変更） | なし（Immutable） |
 * | エラーハンドリング | 例外投げる | Result型で型安全 |
 * | 型安全性 | 低い | 高い |
 * | テスタビリティ | 低い | 高い |
 * | デバッグ情報 | なし | 詳細情報 |
 * | カスタム設定 | 限定的 | 包括的 |
 * 
 * 移行ガイド:
 * 1. 新しいコードでは新APIを使用
 * 2. 既存コードは段階的に移行
 * 3. 互換性アダプターで既存APIを維持
 */