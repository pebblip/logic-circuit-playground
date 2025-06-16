/**
 * イベント駆動シミュレーション用の型定義
 * 
 * 特徴:
 * - 高性能なイベント処理
 * - デルタサイクル対応
 * - 複数解像度時間軸
 * - 並列処理サポート
 */

// ===============================
// 時間軸とイベント定義
// ===============================

/**
 * シミュレーション時間（picoseconds単位）
 * 高精度時間表現のため64bit整数相当の精度を使用
 */
export type SimulationTime = number;

/**
 * デルタサイクル番号
 * 同一時刻での順序管理用
 */
export type DeltaCycle = number;

/**
 * イベント優先度
 * 低い値ほど高優先度
 */
export type EventPriority = number;

/**
 * シミュレーションイベント
 */
export interface SimulationEvent {
  readonly id: string;
  readonly time: SimulationTime;
  readonly deltaCycle: DeltaCycle;
  readonly priority: EventPriority;
  readonly type: EventType;
  readonly target: EventTarget;
  readonly payload: EventPayload;
  readonly metadata?: EventMetadata;
}

/**
 * イベントタイプ
 */
export type EventType = 
  | 'GATE_EVALUATION'    // ゲート評価
  | 'SIGNAL_CHANGE'      // 信号変化
  | 'CLOCK_EDGE'         // クロックエッジ
  | 'DELTA_CYCLE_END'    // デルタサイクル終了
  | 'SIMULATION_END'     // シミュレーション終了
  | 'CUSTOM';            // カスタムイベント

/**
 * イベントターゲット
 */
export interface EventTarget {
  readonly gateId?: string;
  readonly wireId?: string;
  readonly pinIndex?: number;
  readonly nodeId?: string;
}

/**
 * イベントペイロード
 */
export interface EventPayload {
  readonly signalValue?: boolean;
  readonly previousValue?: boolean;
  readonly gateInputs?: readonly boolean[];
  readonly customData?: Record<string, unknown>;
}

/**
 * イベントメタデータ
 */
export interface EventMetadata {
  readonly sourceEvent?: string;
  readonly causedBy?: string;  
  readonly scheduledAt?: SimulationTime;
  readonly evaluationCount?: number;
  readonly debugInfo?: string;
}

// ===============================
// 時間解像度管理
// ===============================

/**
 * 時間解像度レベル
 */
export enum TimeResolution {
  PICOSECOND = 1,
  NANOSECOND = 1000,
  MICROSECOND = 1000000,
  MILLISECOND = 1000000000,
}

/**
 * 時間ホイール設定
 */
export interface TimeWheelConfig {
  readonly levels: readonly TimeWheelLevel[];
  readonly defaultResolution: TimeResolution;
  readonly maxSimulationTime: SimulationTime;
}

/**
 * 時間ホイールレベル
 */
export interface TimeWheelLevel {
  readonly resolution: TimeResolution;
  readonly wheelSize: number;
  readonly range: {
    readonly min: SimulationTime;
    readonly max: SimulationTime;
  };
}

// ===============================
// 回路状態管理
// ===============================

/**
 * Copy-on-Write回路状態
 */
export interface CircuitState {
  readonly version: number;
  readonly timestamp: SimulationTime;
  readonly gateStates: ReadonlyMap<string, GateState>;
  readonly wireStates: ReadonlyMap<string, WireState>;
  readonly parent?: CircuitState;  // COW用親状態
  readonly mutations: ReadonlySet<string>; // 変更されたオブジェクトID
}

/**
 * ゲート状態
 */
export interface GateState {
  readonly gateId: string;
  readonly output: boolean;
  readonly outputs?: readonly boolean[];
  readonly inputs: readonly boolean[];
  readonly metadata?: GateStateMetadata;
  readonly lastEvaluated: SimulationTime;
  readonly evaluationCount: number;
}

/**
 * ワイヤー状態
 */
export interface WireState {
  readonly wireId: string;
  readonly value: boolean;
  readonly previousValue: boolean;
  readonly lastChanged: SimulationTime;
  readonly transitions: number; // 遷移回数
  readonly strength: SignalStrength;
}

/**
 * 信号強度
 */
export enum SignalStrength {
  HIGH_IMPEDANCE = 0,
  WEAK = 1,
  STRONG = 2,
  SUPPLY = 3,
}

/**
 * ゲート状態メタデータ
 */
export interface GateStateMetadata {
  readonly clockState?: {
    readonly lastEdge: 'RISING' | 'FALLING';
    readonly edgeTime: SimulationTime;
    readonly frequency?: number;
  };
  readonly sequentialState?: {
    readonly qOutput: boolean;
    readonly qBarOutput: boolean;
    readonly internalNodes?: ReadonlyMap<string, boolean>;
  };
  readonly propagationDelay?: SimulationTime;
  readonly fanout?: number;
}

// ===============================
// イベントキュー
// ===============================

/**
 * イベントキューインターフェース
 */
export interface EventQueue {
  /**
   * イベントをスケジュール
   */
  schedule(event: SimulationEvent): void;
  
  /**
   * 次のイベントを取得（削除）
   */
  next(): SimulationEvent | undefined;
  
  /**
   * キューの先頭を確認（削除しない）
   */
  peek(): SimulationEvent | undefined;
  
  /**
   * キューサイズ
   */
  size(): number;
  
  /**
   * キューが空かどうか
   */
  isEmpty(): boolean;
  
  /**
   * 指定時刻より前のイベントを削除
   */
  clear(beforeTime?: SimulationTime): void;
  
  /**
   * 統計情報取得
   */
  getStats(): EventQueueStats;
}

/**
 * イベントキュー統計
 */
export interface EventQueueStats {
  readonly totalScheduled: number;
  readonly totalProcessed: number;
  readonly currentSize: number;
  readonly peakSize: number;
  readonly averageLatency: number;
  readonly memoryUsage: number;
}

// ===============================
// シミュレーション設定
// ===============================

/**
 * イベント駆動シミュレーション設定
 */
export interface EventDrivenConfig {
  readonly timeWheel: TimeWheelConfig;
  readonly maxDeltaCycles: number;
  readonly convergenceTimeout: SimulationTime;
  readonly enableParallel: boolean;
  readonly workerCount?: number;
  readonly memoryLimit: number; // bytes
  readonly eventBatchSize: number;
  readonly debugMode: boolean;
  readonly performanceTracking: boolean;
}

/**
 * シミュレーション結果
 */
export interface SimulationResult {
  readonly finalState: CircuitState;
  readonly statistics: SimulationStatistics;
  readonly timeline?: SimulationTimeline;
  readonly errors: readonly SimulationError[];
  readonly warnings: readonly string[];
}

/**
 * シミュレーション統計
 */
export interface SimulationStatistics {
  readonly totalEvents: number;
  readonly eventsByType: ReadonlyMap<EventType, number>;
  readonly averageEventsPerSecond: number;
  readonly peakEventsPerSecond: number;
  readonly simulationTime: SimulationTime;
  readonly realTimeMs: number;
  readonly speedup: number; // シミュレーション時間/実時間
  readonly memoryStats: MemoryStatistics;
  readonly convergenceInfo: ConvergenceStatistics;
}

/**
 * メモリ統計
 */
export interface MemoryStatistics {
  readonly peakUsage: number;
  readonly averageUsage: number;
  readonly currentUsage: number;
  readonly gcCount: number;
  readonly stateVersions: number;
}

/**
 * 収束統計
 */
export interface ConvergenceStatistics {
  readonly totalCycles: number;
  readonly maxDeltaCycles: number;
  readonly averageDeltaCycles: number;
  readonly convergenceFailures: number;
  readonly oscillationDetected: boolean;
}

/**
 * シミュレーションタイムライン
 */
export interface SimulationTimeline {
  readonly events: readonly TimestampedEvent[];
  readonly signals: ReadonlyMap<string, SignalTrace>;
  readonly markers: readonly TimelineMarker[];
}

/**
 * タイムスタンプ付きイベント
 */
export interface TimestampedEvent {
  readonly event: SimulationEvent;
  readonly processedAt: SimulationTime;
  readonly duration: SimulationTime;
}

/**
 * 信号トレース
 */
export interface SignalTrace {
  readonly signalId: string;
  readonly samples: readonly SignalSample[];
  readonly statistics: SignalStatistics;
}

/**
 * 信号サンプル
 */
export interface SignalSample {
  readonly time: SimulationTime;
  readonly value: boolean;
  readonly transition: 'RISING' | 'FALLING' | 'STABLE';
}

/**
 * 信号統計
 */
export interface SignalStatistics {
  readonly transitionCount: number;
  readonly frequency?: number;
  readonly dutyCycle?: number;
  readonly riseTime?: SimulationTime;
  readonly fallTime?: SimulationTime;
}

/**
 * タイムラインマーカー
 */
export interface TimelineMarker {
  readonly time: SimulationTime;
  readonly type: 'CLOCK_EDGE' | 'DELTA_CYCLE' | 'CONVERGENCE' | 'ERROR';
  readonly description: string;
  readonly data?: Record<string, unknown>;
}

// ===============================
// エラー処理
// ===============================

/**
 * シミュレーションエラー
 */
export interface SimulationError {
  readonly type: SimulationErrorType;
  readonly message: string;
  readonly time: SimulationTime;
  readonly context: ErrorContext;
  readonly severity: 'FATAL' | 'ERROR' | 'WARNING';
}

/**
 * シミュレーションエラータイプ
 */
export type SimulationErrorType =
  | 'CONVERGENCE_TIMEOUT'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'INVALID_EVENT'
  | 'SCHEDULING_ERROR'
  | 'PARALLEL_PROCESSING_ERROR'
  | 'TIME_RESOLUTION_ERROR';

/**
 * エラーコンテキスト
 */
export interface ErrorContext {
  readonly eventId?: string;
  readonly gateId?: string;
  readonly wireId?: string;
  readonly deltaCycle?: DeltaCycle;
  readonly stackTrace?: readonly string[];
  readonly additionalInfo?: Record<string, unknown>;
}

// ===============================
// 並列処理サポート
// ===============================

/**
 * 並列処理タスク
 */
export interface ParallelTask {
  readonly id: string;
  readonly type: 'GATE_EVALUATION' | 'EVENT_PROCESSING' | 'STATE_UPDATE';
  readonly workerId?: number;
  readonly priority: number;
  readonly payload: ParallelTaskPayload;
}

/**
 * 並列処理タスクペイロード
 */
export interface ParallelTaskPayload {
  readonly gateIds?: readonly string[];
  readonly events?: readonly SimulationEvent[];
  readonly state?: CircuitState;
  readonly config?: EventDrivenConfig;
}

/**
 * 並列処理結果
 */
export interface ParallelResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: string;
  readonly duration: number;
  readonly workerId: number;
}

// ===============================
// パフォーマンス測定
// ===============================

/**
 * パフォーマンスプロファイラー
 */
export interface PerformanceProfiler {
  startMeasurement(name: string): void;
  endMeasurement(name: string): number;
  recordEvent(name: string, duration?: number): void;
  getReport(): PerformanceReport;
  reset(): void;
}

/**
 * パフォーマンスレポート
 */
export interface PerformanceReport {
  readonly measurements: ReadonlyMap<string, MeasurementStats>;
  readonly events: readonly PerformanceEvent[];
  readonly summary: PerformanceSummary;
}

/**
 * 測定統計
 */
export interface MeasurementStats {
  readonly count: number;
  readonly total: number;
  readonly average: number;
  readonly min: number;
  readonly max: number;
  readonly percentiles: {
    readonly p50: number;
    readonly p90: number;
    readonly p95: number;
    readonly p99: number;
  };
}

/**
 * パフォーマンスイベント
 */
export interface PerformanceEvent {
  readonly name: string;
  readonly timestamp: number;
  readonly duration?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * パフォーマンスサマリー
 */
export interface PerformanceSummary {
  readonly totalDuration: number;
  readonly eventCount: number;
  readonly averageEventDuration: number;
  readonly bottlenecks: readonly string[];
  readonly recommendations: readonly string[];
}