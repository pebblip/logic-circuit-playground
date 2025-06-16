/**
 * メインイベント駆動シミュレーションエンジン
 * 
 * 統合機能:
 * - イベントキュー管理
 * - デルタサイクル処理
 * - タイムホイールスケジューリング
 * - Copy-on-Write状態管理
 * - 並列処理サポート
 * - パフォーマンス測定
 * 
 * アーキテクチャ:
 * - 高性能非同期処理
 * - 型安全なエラーハンドリング
 * - 拡張可能な設計
 * - 既存システムとの互換性
 */

import type {
  SimulationEvent,
  SimulationTime,
  SimulationResult,
  EventDrivenConfig,
  EventType,
  TimeResolution,
  SimulationStatistics,
  SimulationError,
  SimulationTimeline,
  PerformanceProfiler,
  PerformanceReport,
} from './types';

import type { Circuit } from '../core/types';
import type { Gate, Wire } from '../../../types/circuit';

import { BinaryHeapEventQueue, createEventQueue } from './EventQueue';
import { DeltaCycleProcessor, type DeltaCycleConfig } from './DeltaCycleProcessor';
import { 
  TimeWheelScheduler, 
  createTimeWheelScheduler,
  createEducationalScheduler 
} from './TimeWheelScheduler';
import { 
  EventDrivenStateManager,
  StateBuilder,
  type StateManagerOptions 
} from './StateManager';

/**
 * シミュレーション設定の拡張
 */
export interface ExtendedEventDrivenConfig extends EventDrivenConfig {
  readonly algorithm: 'BINARY_HEAP' | 'TIME_WHEEL' | 'ADAPTIVE';
  readonly optimizeForEducation: boolean;
  readonly realTimeMode: boolean;
  readonly checkpointInterval: SimulationTime;
  readonly errorRecovery: boolean;
}

/**
 * デフォルト設定
 */
export const DEFAULT_EVENT_DRIVEN_CONFIG: ExtendedEventDrivenConfig = {
  timeWheel: {
    levels: [
      {
        resolution: TimeResolution.NANOSECOND,
        wheelSize: 1024,
        range: { min: 0, max: 1000000 },
      },
      {
        resolution: TimeResolution.MICROSECOND,
        wheelSize: 1024,
        range: { min: 0, max: 1000000000 },
      },
    ],
    defaultResolution: TimeResolution.NANOSECOND,
    maxSimulationTime: 1000000000000,
  },
  maxDeltaCycles: 1000,
  convergenceTimeout: 10000,
  enableParallel: false,
  workerCount: 4,
  memoryLimit: 100 * 1024 * 1024, // 100MB
  eventBatchSize: 100,
  debugMode: false,
  performanceTracking: true,
  algorithm: 'ADAPTIVE',
  optimizeForEducation: true,
  realTimeMode: false,
  checkpointInterval: 1000000, // 1ms
  errorRecovery: true,
};

/**
 * イベント駆動シミュレーター
 */
export class EventDrivenSimulator {
  private config: ExtendedEventDrivenConfig;
  private eventQueue: BinaryHeapEventQueue | TimeWheelScheduler;
  private deltaCycleProcessor: DeltaCycleProcessor;
  private stateManager: EventDrivenStateManager;
  private profiler?: PerformanceProfiler;
  
  // シミュレーション状態
  private currentTime: SimulationTime = 0;
  private isRunning = false;
  private isPaused = false;
  private shouldStop = false;
  
  // 統計情報
  private statistics: Partial<SimulationStatistics> = {};
  private errors: SimulationError[] = [];
  private timeline?: SimulationTimeline;
  
  // 並列処理
  private workers: Worker[] = [];
  private parallelTaskQueue: unknown[] = [];

  constructor(config: Partial<ExtendedEventDrivenConfig> = {}) {
    this.config = { ...DEFAULT_EVENT_DRIVEN_CONFIG, ...config };
    
    // コンポーネント初期化
    this.initializeComponents();
  }

  /**
   * 回路シミュレーション開始
   */
  async simulate(
    gates: readonly Gate[],
    wires: readonly Wire[],
    duration: SimulationTime,
    options: SimulationOptions = {}
  ): Promise<SimulationResult> {
    if (this.isRunning) {
      throw new Error('Simulation already running');
    }

    this.isRunning = true;
    this.shouldStop = false;
    const startTime = Date.now();

    try {
      // プロファイラー開始
      if (this.config.performanceTracking) {
        this.profiler?.startMeasurement('total_simulation');
      }

      // 初期化
      await this.initializeSimulation(gates, wires, options);

      // メインシミュレーションループ
      const result = await this.runSimulationLoop(duration);

      // 統計情報完成
      this.completeStatistics(startTime, Date.now());

      return result;

    } catch (error) {
      this.handleSimulationError(error);
      
      return {
        finalState: this.stateManager.getCurrentState(),
        statistics: this.statistics as SimulationStatistics,
        timeline: this.timeline,
        errors: this.errors,
        warnings: [`Simulation failed: ${error}`],
      };
    } finally {
      this.isRunning = false;
      
      if (this.config.performanceTracking) {
        this.profiler?.endMeasurement('total_simulation');
      }
    }
  }

  /**
   * シミュレーション一時停止
   */
  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  /**
   * シミュレーション再開
   */
  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
    }
  }

  /**
   * シミュレーション停止
   */
  stop(): void {
    this.shouldStop = true;
  }

  /**
   * 現在時刻取得
   */
  getCurrentTime(): SimulationTime {
    return this.currentTime;
  }

  /**
   * 現在の状態取得
   */
  getCurrentState() {
    return this.stateManager.getCurrentState();
  }

  /**
   * イベントスケジュール
   */
  scheduleEvent(event: SimulationEvent): void {
    if (event.time < this.currentTime) {
      throw new Error('Cannot schedule event in the past');
    }
    
    this.eventQueue.schedule(event);
  }

  /**
   * パフォーマンスレポート取得
   */
  getPerformanceReport(): PerformanceReport | undefined {
    return this.profiler?.getReport();
  }

  /**
   * リソースクリーンアップ
   */
  dispose(): void {
    // Worker終了
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];

    // イベントキュークリア
    this.eventQueue.clear();
    
    // プロファイラーリセット
    this.profiler?.reset();
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * コンポーネント初期化
   */
  private initializeComponents(): void {
    // イベントキュー初期化
    if (this.config.algorithm === 'TIME_WHEEL') {
      this.eventQueue = this.config.optimizeForEducation 
        ? createEducationalScheduler()
        : createTimeWheelScheduler(1000, this.config.timeWheel.maxSimulationTime);
    } else {
      this.eventQueue = createEventQueue() as BinaryHeapEventQueue;
    }

    // デルタサイクルプロセッサー初期化
    const deltaCycleConfig: DeltaCycleConfig = {
      maxDeltaCycles: this.config.maxDeltaCycles,
      convergenceTimeout: this.config.convergenceTimeout,
      oscillationDetection: true,
      deadlockDetection: true,
      enableDebug: this.config.debugMode,
    };
    this.deltaCycleProcessor = new DeltaCycleProcessor(deltaCycleConfig);

    // 状態管理初期化は後でinitializeSimulationで行う

    // パフォーマンスプロファイラー初期化
    if (this.config.performanceTracking) {
      this.profiler = new SimplePerformanceProfiler();
    }

    // 並列処理初期化
    if (this.config.enableParallel) {
      this.initializeParallelProcessing();
    }
  }

  /**
   * シミュレーション初期化
   */
  private async initializeSimulation(
    gates: readonly Gate[],
    wires: readonly Wire[],
    options: SimulationOptions
  ): Promise<void> {
    this.profiler?.startMeasurement('initialization');

    // 状態管理初期化
    const stateManagerOptions: StateManagerOptions = {
      maxHistorySize: options.historySize || 1000,
      gcThreshold: 100,
      structuralSharing: true,
    };

    // 初期状態作成
    const initialState = {
      version: 0,
      timestamp: 0,
      gateStates: new Map(),
      wireStates: new Map(),
      mutations: new Set(),
    };

    this.stateManager = new EventDrivenStateManager(initialState, stateManagerOptions);
    
    // 回路から状態初期化
    this.stateManager.initializeFromCircuit(gates, wires, 0);

    // 初期イベント生成
    await this.generateInitialEvents(gates, wires);

    this.profiler?.endMeasurement('initialization');
  }

  /**
   * 初期イベント生成
   */
  private async generateInitialEvents(
    gates: readonly Gate[],
    wires: readonly Wire[]
  ): Promise<void> {
    // クロックゲートのイベント生成
    for (const gate of gates) {
      if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
        const frequency = gate.metadata.frequency as number || 1;
        const period = (1 / frequency) * TimeResolution.MILLISECOND;
        
        // 最初のクロックエッジをスケジュール
        this.scheduleEvent({
          id: `clock_${gate.id}_0`,
          time: period / 2, // 最初は立ち上がりエッジ
          deltaCycle: 0,
          priority: 10, // クロックは高優先度
          type: 'CLOCK_EDGE',
          target: { gateId: gate.id },
          payload: { 
            signalValue: true,
            customData: { frequency, period }
          },
        });
      }
    }

    // 入力ゲートの初期評価
    for (const gate of gates) {
      if (gate.type === 'INPUT') {
        this.scheduleEvent({
          id: `init_${gate.id}`,
          time: 0,
          deltaCycle: 0,
          priority: 20,
          type: 'GATE_EVALUATION',
          target: { gateId: gate.id },
          payload: {
            gateInputs: [],
          },
        });
      }
    }
  }

  /**
   * メインシミュレーションループ
   */
  private async runSimulationLoop(duration: SimulationTime): Promise<SimulationResult> {
    this.profiler?.startMeasurement('simulation_loop');

    const endTime = this.currentTime + duration;
    let eventCount = 0;
    const maxEventsPerCycle = this.config.eventBatchSize;

    while (this.currentTime < endTime && !this.shouldStop) {
      // 一時停止チェック
      if (this.isPaused) {
        await this.waitForResume();
        continue;
      }

      // 次のイベント時刻を取得
      const nextEvent = this.eventQueue.peek();
      if (!nextEvent || nextEvent.time > endTime) {
        break;
      }

      const targetTime = nextEvent.time;

      // デルタサイクル処理
      const deltaCycleResult = await this.deltaCycleProcessor.processDeltaCycles(
        targetTime,
        this.eventQueue,
        this.stateManager.getCurrentState(),
        this.createGateEvaluator()
      );

      if (!deltaCycleResult.success) {
        this.errors.push(...deltaCycleResult.errors);
        
        if (this.config.errorRecovery) {
          await this.recoverFromError(deltaCycleResult.errors);
        } else {
          break;
        }
      }

      // 時刻を進める
      this.currentTime = targetTime;
      eventCount += 1;

      // チェックポイント処理
      if (this.currentTime % this.config.checkpointInterval === 0) {
        await this.createCheckpoint();
      }

      // バッチ処理制限
      if (eventCount >= maxEventsPerCycle) {
        eventCount = 0;
        await this.yieldControl();
      }

      // リアルタイムモード調整
      if (this.config.realTimeMode) {
        await this.adjustRealTimeSpeed();
      }
    }

    this.profiler?.endMeasurement('simulation_loop');

    return {
      finalState: this.stateManager.getCurrentState(),
      statistics: this.statistics as SimulationStatistics,
      timeline: this.timeline,
      errors: this.errors,
      warnings: [],
    };
  }

  /**
   * ゲート評価関数作成
   */
  private createGateEvaluator(): (gateId: string, inputs: readonly boolean[]) => boolean[] {
    return (gateId: string, inputs: readonly boolean[]) => {
      const gateState = this.stateManager.getCurrentState().gateStates.get(gateId);
      if (!gateState) {
        throw new Error(`Gate ${gateId} not found`);
      }

      // 簡略化されたゲート評価（実際はcore/gateEvaluationを使用）
      return [this.evaluateGateLogic(gateId, inputs)];
    };
  }

  /**
   * 簡略化ゲート論理評価
   */
  private evaluateGateLogic(gateId: string, inputs: readonly boolean[]): boolean {
    const currentState = this.stateManager.getCurrentState();
    const gateState = currentState.gateStates.get(gateId);
    
    if (!gateState) return false;

    // ここで既存のゲート評価ロジックを呼び出す
    // 現在は簡略化
    switch (inputs.length) {
      case 0: return true; // INPUT gate
      case 1: return !inputs[0]; // NOT gate
      case 2: return inputs[0] && inputs[1]; // AND gate
      default: return false;
    }
  }

  /**
   * 並列処理初期化
   */
  private initializeParallelProcessing(): void {
    const workerCount = this.config.workerCount || 4;
    
    for (let i = 0; i < workerCount; i++) {
      // Worker作成は実際の環境に依存するため簡略化
      // const worker = new Worker('./simulation-worker.js');
      // this.workers.push(worker);
    }
  }

  /**
   * エラー回復処理
   */
  private async recoverFromError(errors: readonly SimulationError[]): Promise<void> {
    // 簡略化された回復処理
    for (const error of errors) {
      if (error.type === 'CONVERGENCE_TIMEOUT') {
        // 収束タイムアウト：時刻を少し進める
        this.currentTime += TimeResolution.NANOSECOND;
      }
    }
  }

  /**
   * チェックポイント作成
   */
  private async createCheckpoint(): Promise<void> {
    // 状態のスナップショット作成（StateManagerが自動で行う）
    // 追加の処理があればここに記述
  }

  /**
   * 制御を一時的に戻す
   */
  private async yieldControl(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * リアルタイム速度調整
   */
  private async adjustRealTimeSpeed(): Promise<void> {
    // シミュレーション時間と実時間の同期
    const realTimeMs = Date.now();
    const simulationTimeMs = this.currentTime / TimeResolution.MILLISECOND;
    const diff = realTimeMs - simulationTimeMs;
    
    if (diff > 0) {
      await new Promise(resolve => setTimeout(resolve, diff));
    }
  }

  /**
   * 一時停止待機
   */
  private async waitForResume(): Promise<void> {
    while (this.isPaused && !this.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * 統計情報完成
   */
  private completeStatistics(startTimeMs: number, endTimeMs: number): void {
    const queueStats = this.eventQueue.getStats();
    const stateStats = this.stateManager.getStats();

    this.statistics = {
      totalEvents: queueStats.totalProcessed,
      eventsByType: new Map(), // 実装省略
      averageEventsPerSecond: queueStats.totalProcessed / ((endTimeMs - startTimeMs) / 1000),
      peakEventsPerSecond: 0, // 実装省略
      simulationTime: this.currentTime,
      realTimeMs: endTimeMs - startTimeMs,
      speedup: this.currentTime / TimeResolution.MILLISECOND / ((endTimeMs - startTimeMs) / 1000),
      memoryStats: {
        peakUsage: stateStats.memoryUsage,
        averageUsage: stateStats.memoryUsage,
        currentUsage: stateStats.memoryUsage,
        gcCount: 0,
        stateVersions: stateStats.currentVersion,
      },
      convergenceInfo: {
        totalCycles: 0,
        maxDeltaCycles: 0,
        averageDeltaCycles: 0,
        convergenceFailures: this.errors.filter(e => e.type === 'CONVERGENCE_TIMEOUT').length,
        oscillationDetected: false,
      },
    };
  }

  /**
   * シミュレーションエラー処理
   */
  private handleSimulationError(error: unknown): void {
    const simError: SimulationError = {
      type: 'CONVERGENCE_TIMEOUT',
      message: `Simulation error: ${error}`,
      time: this.currentTime,
      context: {},
      severity: 'FATAL',
    };
    
    this.errors.push(simError);
  }
}

// ===============================
// 補助クラス・インターフェース
// ===============================

/**
 * シミュレーションオプション
 */
export interface SimulationOptions {
  readonly historySize?: number;
  readonly enableTimeline?: boolean;
  readonly timelineResolution?: TimeResolution;
  readonly maxRealTime?: number; // ms
}

/**
 * 簡単なパフォーマンスプロファイラー実装
 */
class SimplePerformanceProfiler implements PerformanceProfiler {
  private measurements = new Map<string, { start: number; total: number; count: number }>();
  private events: Array<{ name: string; timestamp: number; duration?: number }> = [];

  startMeasurement(name: string): void {
    const existing = this.measurements.get(name);
    this.measurements.set(name, {
      start: performance.now(),
      total: existing?.total || 0,
      count: existing?.count || 0,
    });
  }

  endMeasurement(name: string): number {
    const measurement = this.measurements.get(name);
    if (!measurement) return 0;

    const duration = performance.now() - measurement.start;
    measurement.total += duration;
    measurement.count += 1;

    this.events.push({
      name,
      timestamp: performance.now(),
      duration,
    });

    return duration;
  }

  recordEvent(name: string, duration?: number): void {
    this.events.push({
      name,
      timestamp: performance.now(),
      duration,
    });
  }

  getReport(): PerformanceReport {
    const measurements = new Map();
    
    for (const [name, data] of this.measurements) {
      measurements.set(name, {
        count: data.count,
        total: data.total,
        average: data.total / data.count,
        min: 0, // 簡略化
        max: 0, // 簡略化
        percentiles: {
          p50: 0, p90: 0, p95: 0, p99: 0
        }
      });
    }

    return {
      measurements,
      events: this.events,
      summary: {
        totalDuration: this.events.reduce((sum, e) => sum + (e.duration || 0), 0),
        eventCount: this.events.length,
        averageEventDuration: 0,
        bottlenecks: [],
        recommendations: [],
      },
    };
  }

  reset(): void {
    this.measurements.clear();
    this.events = [];
  }
}

// ===============================
// ファクトリー関数
// ===============================

/**
 * 教育用最適化シミュレーター作成
 */
export function createEducationalSimulator(): EventDrivenSimulator {
  const config: Partial<ExtendedEventDrivenConfig> = {
    optimizeForEducation: true,
    algorithm: 'TIME_WHEEL',
    maxDeltaCycles: 100,
    convergenceTimeout: 1000,
    enableParallel: false,
    debugMode: true,
    performanceTracking: true,
    memoryLimit: 50 * 1024 * 1024, // 50MB
  };

  return new EventDrivenSimulator(config);
}

/**
 * 高性能シミュレーター作成
 */
export function createHighPerformanceSimulator(): EventDrivenSimulator {
  const config: Partial<ExtendedEventDrivenConfig> = {
    optimizeForEducation: false,
    algorithm: 'ADAPTIVE',
    maxDeltaCycles: 10000,
    convergenceTimeout: 60000,
    enableParallel: true,
    workerCount: 8,
    debugMode: false,
    performanceTracking: true,
    memoryLimit: 500 * 1024 * 1024, // 500MB
  };

  return new EventDrivenSimulator(config);
}