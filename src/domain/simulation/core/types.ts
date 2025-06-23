/**
 * 新API用の型定義 - 完全な型安全性とエラーハンドリングを提供
 *
 * 主な特徴:
 * - Result型パターンによる統一エラーハンドリング
 * - Immutableな型定義（Readonly）
 * - 明確な成功/失敗の型分離
 */

// ===============================
// Result型パターン（Rust風）
// ===============================

/**
 * 成功/失敗を型安全に表現するResult型
 */
export type Result<T, E = ApiError> = Success<T> | Failure<E>;

/**
 * 成功結果
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly warnings: readonly string[];
}

/**
 * 失敗結果
 */
export interface Failure<E> {
  readonly success: false;
  readonly error: E;
  readonly warnings: readonly string[];
}

// ===============================
// Result型ヘルパー関数
// ===============================

/**
 * 成功結果を作成
 */
export const success = <T>(
  data: T,
  warnings: readonly string[] = []
): Success<T> => ({
  success: true,
  data,
  warnings,
});

/**
 * 失敗結果を作成
 */
export const failure = <E>(
  error: E,
  warnings: readonly string[] = []
): Failure<E> => ({
  success: false,
  error,
  warnings,
});

// ===============================
// エラー型定義
// ===============================

/**
 * API共通エラーベース
 */
export interface ApiError {
  readonly type:
    | 'VALIDATION_ERROR'
    | 'EVALUATION_ERROR'
    | 'DEPENDENCY_ERROR'
    | 'CONFIGURATION_ERROR';
  readonly message: string;
  readonly context?: {
    readonly gateId?: string;
    readonly wireId?: string;
    readonly pinIndex?: number;
    readonly stack?: readonly string[];
  };
}

/**
 * バリデーションエラー
 */
export interface ValidationError extends ApiError {
  readonly type: 'VALIDATION_ERROR';
  readonly violations?: readonly ValidationViolation[];
}

/**
 * 評価エラー
 */
export interface EvaluationError extends ApiError {
  readonly type: 'EVALUATION_ERROR';
  readonly stage:
    | 'INPUT_COLLECTION'
    | 'GATE_LOGIC'
    | 'OUTPUT_ASSIGNMENT'
    | 'CIRCUIT_TRAVERSAL';
  readonly originalError?: unknown;
}

/**
 * 依存関係エラー
 */
export interface DependencyError extends ApiError {
  readonly type: 'DEPENDENCY_ERROR';
  readonly missingDependencies: readonly string[];
  readonly circularDependencies: readonly string[][];
}

/**
 * 設定エラー
 */
export interface ConfigurationError extends ApiError {
  readonly type: 'CONFIGURATION_ERROR';
  readonly invalidSettings: readonly string[];
}

// ===============================
// 評価設定
// ===============================

// TimeProvider definition moved here to eliminate circular dependency

/**
 * 時間プロバイダーインターフェース
 * CLOCKゲートなどの時間依存処理で使用
 */
export interface TimeProvider {
  getCurrentTime(): number;
}

export const realTimeProvider: TimeProvider = {
  getCurrentTime: () => Date.now(),
};

export const createDeterministicTimeProvider = (
  baseTime: number = 0,
  incrementMs: number = 100
): TimeProvider => {
  let currentTime = baseTime;
  return {
    getCurrentTime: () => {
      const time = currentTime;
      currentTime += incrementMs;
      return time;
    },
  };
};

export const createFixedTimeProvider = (fixedTime: number): TimeProvider => {
  return {
    getCurrentTime: () => fixedTime,
  };
};

/**
 * 評価設定
 */
export interface EvaluationConfig {
  readonly timeProvider: TimeProvider;
  readonly enableDebug: boolean;
  readonly strictValidation: boolean;
  readonly maxRecursionDepth: number;
  readonly customGateEvaluator?: CustomGateEvaluator;
  readonly allowCircularDependencies?: boolean; // 循環依存を許可（オシレータ用）
  readonly forceTwoPhaseEvaluation?: boolean; // D-FF二段階評価を強制有効化
}

/**
 * デフォルト設定
 */
export const defaultConfig: EvaluationConfig = {
  timeProvider: { getCurrentTime: () => Date.now() },
  enableDebug: false,
  strictValidation: true,
  maxRecursionDepth: 100,
};

// ===============================
// ゲート評価結果
// ===============================

/**
 * ゲートメタデータ
 */
export interface SimulationGateMetadata {
  readonly evaluationTime?: number;
  readonly inputValidation?: {
    readonly expectedInputCount: number;
    readonly actualInputCount: number;
    readonly isValid: boolean;
  };
  readonly customGateInfo?: {
    readonly definitionId: string;
    readonly evaluationMethod: 'TRUTH_TABLE' | 'INTERNAL_CIRCUIT';
  };
}

/**
 * デバッグ情報
 */
export interface DebugInfo {
  readonly gateId: string;
  readonly gateType: string;
  readonly inputs: readonly boolean[];
  readonly evaluationTimeMs: number;
  readonly intermediateValues?: Record<string, unknown>;
}

/**
 * 統合ゲート評価結果
 */
export interface GateEvaluationResult {
  readonly outputs: readonly boolean[]; // 常に配列、単一出力でも[boolean]
  readonly metadata?: Readonly<SimulationGateMetadata>;
  readonly debugInfo?: Readonly<DebugInfo>;

  // 便利プロパティ（後方互換性用）
  readonly primaryOutput: boolean; // outputs[0] のエイリアス
  readonly isSingleOutput: boolean; // outputs.length === 1
}

// ===============================
// 回路評価結果
// ===============================

import type { Gate, Circuit as BaseCircuit } from '../../../types/circuit';

// ※ Circuit型を再エクスポート（必要に応じてReadonly化）
export type Circuit = BaseCircuit;
export type EvaluationCircuit = Circuit; // 後方互換性

/**
 * 回路メタデータ
 */
export interface CircuitMetadata {
  readonly name?: string;
  readonly description?: string;
  readonly createdAt?: number;
  readonly version?: string;
}

/**
 * 評価統計
 */
export interface EvaluationStats {
  readonly totalGates: number;
  readonly evaluatedGates: number;
  readonly skippedGates: number;
  readonly evaluationTimeMs: number;
  readonly dependencyResolutionTimeMs: number;
  readonly gateEvaluationTimes: ReadonlyMap<string, number>;
  readonly memoryUsage?: {
    readonly heapUsed: number;
    readonly heapTotal: number;
  };
}

/**
 * 依存関係グラフ
 */
export interface DependencyGraph {
  readonly nodes: ReadonlyMap<string, DependencyNode>;
  readonly edges: readonly DependencyEdge[];
  readonly evaluationOrder: readonly string[];
  readonly hasCycles: boolean;
  readonly cycles: readonly string[][];
}

/**
 * 依存関係ノード
 */
export interface DependencyNode {
  readonly gateId: string;
  readonly dependencies: readonly string[];
  readonly dependents: readonly string[];
  readonly depth: number;
}

/**
 * 依存関係エッジ
 */
export interface DependencyEdge {
  readonly from: string;
  readonly to: string;
  readonly wireId: string;
  readonly pinIndex: number;
}

/**
 * デバッグトレースエントリ
 */
export interface DebugTraceEntry {
  readonly timestamp: number;
  readonly gateId: string;
  readonly action:
    | 'START_EVALUATION'
    | 'END_EVALUATION'
    | 'INPUT_COLLECTION'
    | 'OUTPUT_ASSIGNMENT';
  readonly data?: Record<string, unknown>;
}

/**
 * 回路評価結果
 */
export interface CircuitEvaluationResult {
  readonly circuit: Readonly<Circuit>; // 更新された回路（元は変更されない）
  readonly evaluationStats: Readonly<EvaluationStats>;
  readonly dependencyGraph: Readonly<DependencyGraph>;
  readonly debugTrace?: readonly DebugTraceEntry[];
}

// ===============================
// カスタムゲート評価
// ===============================

import type { CustomGateDefinition } from '../../../types/gates';

/**
 * カスタムゲート評価戦略
 */
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

// ===============================
// バリデーション結果
// ===============================

/**
 * バリデーション違反
 */
export interface ValidationViolation {
  readonly severity: 'ERROR' | 'WARNING' | 'INFO';
  readonly code: string;
  readonly message: string;
  readonly location: {
    readonly gateId?: string;
    readonly wireId?: string;
    readonly pinIndex?: number;
  };
  readonly suggestion?: string;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly violations: readonly ValidationViolation[];
  readonly suggestions: readonly string[];
  readonly metadata: {
    readonly validatedAt: number;
    readonly validationTimeMs: number;
    readonly rulesApplied: readonly string[];
  };
}

// ===============================
// ユーティリティ型
// ===============================

/**
 * 型ガード: Success判定
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * 型ガード: Failure判定
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/**
 * Result型のmap操作
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  mapper: (data: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(mapper(result.data), result.warnings);
  } else {
    return result;
  }
}

/**
 * Result型のflatMap操作
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  mapper: (data: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    const mappedResult = mapper(result.data);
    if (isSuccess(mappedResult)) {
      return success(mappedResult.data, [
        ...result.warnings,
        ...mappedResult.warnings,
      ]);
    } else {
      return failure(mappedResult.error, [
        ...result.warnings,
        ...mappedResult.warnings,
      ]);
    }
  } else {
    return result;
  }
}

/**
 * GateEvaluationResultを作成するヘルパー
 */
export function createGateResult(
  outputs: readonly boolean[],
  metadata?: Readonly<SimulationGateMetadata>,
  debugInfo?: Readonly<DebugInfo>
): GateEvaluationResult {
  return {
    outputs,
    metadata,
    debugInfo,
    primaryOutput: outputs[0] || false,
    isSingleOutput: outputs.length === 1,
  };
}

/**
 * エラーを作成するヘルパー
 */
export function createValidationError(
  message: string,
  violations: ValidationViolation[] = [],
  context?: ApiError['context']
): ValidationError {
  return {
    type: 'VALIDATION_ERROR',
    message,
    violations,
    context,
  };
}

export function createEvaluationError(
  message: string,
  stage: EvaluationError['stage'],
  context?: ApiError['context'],
  originalError?: unknown
): EvaluationError {
  return {
    type: 'EVALUATION_ERROR',
    message,
    stage,
    context,
    originalError,
  };
}

export function createDependencyError(
  message: string,
  missingDependencies: readonly string[] = [],
  circularDependencies: readonly string[][] = [],
  context?: ApiError['context']
): DependencyError {
  return {
    type: 'DEPENDENCY_ERROR',
    message,
    missingDependencies,
    circularDependencies,
    context,
  };
}

// =============================
// 評価エンジン用の型定義
// =============================

// ※ EvaluationGateは削除し、Gate型を直接使用

// ※ EvaluationCircuitは削除し、Circuit型を直接使用

/**
 * 評価コンテキスト
 * 時刻やメモリなど、評価に必要な外部情報を含む
 */
export interface EvaluationContext {
  readonly currentTime: number;
  readonly memory: GateMemory;
}

/**
 * ゲートの永続化された状態
 */
export interface GateMemory {
  [gateId: string]: {
    readonly [key: string]: unknown;
  };
}

/**
 * ゲート評価関数の型
 * 純粋関数として、同じ入力に対して常に同じ出力を返す
 */
export type GateEvaluator<
  TInputs extends readonly boolean[] = readonly boolean[],
  TOutputs extends readonly boolean[] = readonly boolean[],
> = (
  inputs: TInputs,
  gateId: string,
  context: EvaluationContext,
  gate?: Gate
) => EvaluationResult<TOutputs>;

/**
 * 評価結果
 */
export interface EvaluationResult<
  TOutputs extends readonly boolean[] = readonly boolean[],
> {
  readonly outputs: TOutputs;
  readonly memoryUpdate?: {
    readonly [key: string]: unknown;
  };
}

/**
 * 各ゲートタイプの入出力定義
 */
export interface GateTypeDefinitions {
  // 基本論理ゲート
  AND: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };
  OR: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };
  NOT: { inputs: readonly [boolean]; outputs: readonly [boolean] };
  XOR: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };
  NAND: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };
  NOR: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };
  XNOR: { inputs: readonly [boolean, boolean]; outputs: readonly [boolean] };

  // 入出力
  INPUT: { inputs: readonly []; outputs: readonly [boolean] };
  OUTPUT: { inputs: readonly [boolean]; outputs: readonly [boolean] };

  // 順序回路
  'SR-LATCH': {
    inputs: readonly [boolean, boolean];
    outputs: readonly [boolean, boolean];
  };
  'D-FF': {
    inputs: readonly [boolean, boolean];
    outputs: readonly [boolean, boolean];
  };

  // 特殊ゲート
  CLOCK: { inputs: readonly []; outputs: readonly [boolean] };
  MUX: { inputs: readonly boolean[]; outputs: readonly [boolean] };
  BINARY_COUNTER: {
    inputs: readonly [boolean, boolean];
    outputs: readonly boolean[];
  };
  CUSTOM: { inputs: readonly boolean[]; outputs: readonly boolean[] };
}

/**
 * 型安全なゲート評価関数のマップ
 */
export type GateEvaluatorMap = {
  [K in keyof GateTypeDefinitions]: GateEvaluator<
    GateTypeDefinitions[K]['inputs'],
    GateTypeDefinitions[K]['outputs']
  >;
};

/**
 * 評価エンジンの内部結果
 */
export interface EvaluatorResult {
  readonly circuit: Circuit;
  readonly context: EvaluationContext;
  readonly hasChanges: boolean;
  readonly warnings?: readonly string[];
}

/**
 * 循環依存エラー
 */
export class CircularDependencyError extends Error {
  constructor(public readonly loops: readonly string[][]) {
    const loopDescriptions = loops.map(
      loop => loop.join(' → ') + ' → ' + loop[0]
    );

    super(
      `
循環回路が検出されました：
${loopDescriptions.join('\\n')}

この回路を正しくシミュレートするには遅延モードが必要です。
⏱️ ボタンをクリックして遅延モードを有効にしてください。
    `.trim()
    );

    this.name = 'CircularDependencyError';
  }
}
