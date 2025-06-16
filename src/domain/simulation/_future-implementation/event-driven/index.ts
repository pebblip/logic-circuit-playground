/**
 * イベント駆動シミュレーションエンジン - 統合エクスポート
 * 
 * 高性能イベント駆動シミュレーションシステムの完全実装
 * 
 * 主要コンポーネント:
 * - EventDrivenSimulator: メインシミュレーションエンジン
 * - BinaryHeapEventQueue: 高性能優先度付きキュー (O(log n))
 * - DeltaCycleProcessor: 組み合わせ論理収束処理
 * - TimeWheelScheduler: 複数解像度タイマー (ns/μs/ms)
 * - StateManager: Copy-on-Write状態管理
 * - ParallelSimulation: Web Workers並列化
 * - PerformanceBenchmark: 性能測定・ベンチマーク
 * - LegacyCompatibilityLayer: 既存システム互換性
 * 
 * 使用例:
 * ```typescript
 * import { createEducationalSimulator, evaluateCircuitUnified } from './event-driven';
 * 
 * // 教育用最適化シミュレーター
 * const simulator = createEducationalSimulator();
 * const result = await simulator.simulate(gates, wires, duration);
 * 
 * // 既存APIの置き換え（互換レイヤー経由）
 * const compatResult = await evaluateCircuitUnified(circuit, config);
 * ```
 */

// ===============================
// 型定義エクスポート
// ===============================

export type {
  // 基本型
  SimulationTime,
  DeltaCycle,
  EventPriority,
  SimulationEvent,
  EventType,
  EventTarget,
  EventPayload,
  EventMetadata,
  TimeResolution,
  
  // 回路状態
  CircuitState,
  GateState,
  WireState,
  GateStateMetadata,
  SignalStrength,
  
  // イベントキュー
  EventQueue,
  EventQueueStats,
  
  // 設定・結果
  EventDrivenConfig,
  ExtendedEventDrivenConfig,
  SimulationResult,
  SimulationStatistics,
  SimulationError,
  SimulationTimeline,
  
  // 並列処理
  ParallelTask,
  ParallelTaskPayload,
  ParallelResult,
  WorkerPoolConfig,
  WorkerStats,
  
  // 性能測定
  PerformanceProfiler,
  PerformanceReport,
  BenchmarkResult,
  BenchmarkMetrics,
  BenchmarkSuite,
  BenchmarkConfig,
  
  // 互換性
  SimulationStrategy,
  CompatibilityConfig,
  ExecutionInfo,
  ValidationResult,
  PerformanceComparison,
  ExtendedCircuitEvaluationResult,
} from './types';

// ===============================
// メインクラスエクスポート
// ===============================

export {
  EventDrivenSimulator,
  createEducationalSimulator,
  createHighPerformanceSimulator,
} from './EventDrivenSimulator';

export {
  BinaryHeapEventQueue,
  CalendarQueue,
  createEventQueue,
} from './EventQueue';

export {
  DeltaCycleProcessor,
} from './DeltaCycleProcessor';

export {
  TimeWheelScheduler,
  AdaptiveTimeStepScheduler,
  createTimeWheelScheduler,
  createEducationalScheduler,
  DEFAULT_TIME_WHEEL_SETTINGS,
} from './TimeWheelScheduler';

export {
  EventDrivenStateManager,
  StateBuilder,
  StateHistory,
} from './StateManager';

export {
  SimulationWorkerPool,
  createEducationalWorkerPool,
  createHighPerformanceWorkerPool,
} from './ParallelSimulation';

export {
  PerformanceBenchmarkRunner,
  runQuickBenchmark,
  runDetailedBenchmark,
  DEFAULT_BENCHMARK_CONFIG,
} from './PerformanceBenchmark';

export {
  LegacyCompatibilityLayer,
  evaluateCircuitUnified,
  benchmarkSimulationStrategies,
  evaluateWithFeatureFlags,
  DEFAULT_COMPATIBILITY_CONFIG,
} from './LegacyCompatibilityLayer';

// ===============================
// 設定・定数エクスポート
// ===============================

export {
  DEFAULT_EVENT_DRIVEN_CONFIG,
} from './EventDrivenSimulator';

export {
  TimeResolution,
} from './types';

// ===============================
// ユーティリティ関数
// ===============================

/**
 * システム推奨設定取得
 */
export function getRecommendedConfig(): {
  simulator: ExtendedEventDrivenConfig;
  benchmark: BenchmarkConfig;
  compatibility: CompatibilityConfig;
} {
  const isEducational = typeof window !== 'undefined' && window.location?.hostname?.includes('edu');
  const cpuCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  
  return {
    simulator: {
      timeWheel: {
        levels: [
          {
            resolution: TimeResolution.NANOSECOND,
            wheelSize: isEducational ? 256 : 1024,
            range: { min: 0, max: isEducational ? 100000 : 1000000 },
          },
          {
            resolution: TimeResolution.MICROSECOND,
            wheelSize: isEducational ? 256 : 1024,
            range: { min: 0, max: isEducational ? 10000000 : 1000000000 },
          },
        ],
        defaultResolution: TimeResolution.NANOSECOND,
        maxSimulationTime: isEducational ? 100000000 : 1000000000000,
      },
      maxDeltaCycles: isEducational ? 100 : 1000,
      convergenceTimeout: isEducational ? 1000 : 10000,
      enableParallel: !isEducational && cpuCores > 2,
      workerCount: Math.min(4, cpuCores),
      memoryLimit: isEducational ? 50 * 1024 * 1024 : 200 * 1024 * 1024,
      eventBatchSize: isEducational ? 50 : 200,
      debugMode: isEducational,
      performanceTracking: true,
      algorithm: isEducational ? 'TIME_WHEEL' : 'ADAPTIVE',
      optimizeForEducation: isEducational,
      realTimeMode: false,
      checkpointInterval: 1000000,
      errorRecovery: true,
    },
    
    benchmark: {
      iterations: isEducational ? 3 : 10,
      warmupRounds: isEducational ? 1 : 3,
      timeout: isEducational ? 30000 : 60000,
      memoryMonitoring: true,
      detailedProfiling: !isEducational,
      compareWithLegacy: true,
      circuitSizes: isEducational ? [10, 50, 100] : [10, 50, 100, 500, 1000],
      simulationDuration: 1000000,
    },
    
    compatibility: {
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: isEducational ? 50 : 100,
        maxWiresForLegacy: isEducational ? 100 : 200,
        maxSimulationTimeForLegacy: 1000,
      },
      enablePerformanceTracking: true,
      enableFallback: true,
      fallbackTimeout: 5000,
      enableValidation: isEducational,
      validationTolerance: 0.001,
    },
  };
}

/**
 * システム互換性チェック
 */
export function checkSystemCompatibility(): {
  isSupported: boolean;
  features: {
    webWorkers: boolean;
    performanceAPI: boolean;
    bigInt: boolean;
    weakMap: boolean;
  };
  recommendations: string[];
} {
  const features = {
    webWorkers: typeof Worker !== 'undefined',
    performanceAPI: typeof performance !== 'undefined' && 'now' in performance,
    bigInt: typeof BigInt !== 'undefined',
    weakMap: typeof WeakMap !== 'undefined',
  };
  
  const recommendations: string[] = [];
  
  if (!features.webWorkers) {
    recommendations.push('Web Workersがサポートされていません。並列処理は無効化されます。');
  }
  
  if (!features.performanceAPI) {
    recommendations.push('Performance APIがサポートされていません。性能測定の精度が低下します。');
  }
  
  if (!features.bigInt) {
    recommendations.push('BigIntがサポートされていません。高精度時間処理で制限があります。');
  }
  
  const isSupported = features.performanceAPI && features.weakMap;
  
  return {
    isSupported,
    features,
    recommendations,
  };
}

/**
 * システム情報取得
 */
export function getSystemInfo(): {
  platform: string;
  browser?: string;
  memory?: {
    limit: number;
    used: number;
  };
  cpu: {
    cores: number;
    architecture?: string;
  };
  features: ReturnType<typeof checkSystemCompatibility>['features'];
} {
  const compatibility = checkSystemCompatibility();
  
  return {
    platform: typeof window !== 'undefined' ? 'browser' : 'node',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    memory: typeof performance !== 'undefined' && 'memory' in performance ? {
      limit: (performance as any).memory.jsHeapSizeLimit,
      used: (performance as any).memory.usedJSHeapSize,
    } : undefined,
    cpu: {
      cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1,
      architecture: typeof navigator !== 'undefined' ? (navigator as any).platform : undefined,
    },
    features: compatibility.features,
  };
}

// ===============================
// デフォルトエクスポート（便利関数）
// ===============================

/**
 * クイックスタート用関数
 * 最小限の設定で高性能シミュレーションを開始
 */
export default async function quickStartSimulation(
  gates: any[],
  wires: any[],
  options: {
    duration?: number;
    strategy?: SimulationStrategy;
    enableBenchmark?: boolean;
  } = {}
): Promise<{
  result: ExtendedCircuitEvaluationResult;
  benchmark?: BenchmarkSuite;
  recommendations: string[];
}> {
  const {
    duration = 1000000, // 1ms
    strategy = 'AUTO_SELECT',
    enableBenchmark = false,
  } = options;

  // システムチェック
  const systemInfo = getSystemInfo();
  const compatibility = checkSystemCompatibility();
  
  if (!compatibility.isSupported) {
    throw new Error('お使いの環境はイベント駆動シミュレーションをサポートしていません。');
  }

  // 回路オブジェクト作成
  const circuit = { gates, wires };

  // シミュレーション実行
  const result = await evaluateCircuitUnified(circuit, {
    timeProvider: { getCurrentTime: () => Date.now() },
    enableDebug: false,
    strictValidation: false,
    maxRecursionDepth: 100,
  }, {
    strategy,
    enablePerformanceTracking: true,
    enableFallback: true,
  });

  if (!result.success) {
    throw new Error(`シミュレーション失敗: ${result.error.message}`);
  }

  // ベンチマーク実行（オプション）
  let benchmark: BenchmarkSuite | undefined;
  if (enableBenchmark) {
    try {
      benchmark = await runQuickBenchmark();
    } catch (error) {
      console.warn('ベンチマーク実行に失敗:', error);
    }
  }

  // 推奨事項生成
  const recommendations: string[] = [
    ...compatibility.recommendations,
  ];

  if (result.data.executionInfo.performanceComparison) {
    recommendations.push(result.data.executionInfo.performanceComparison.recommendation);
  }

  const gateCount = gates.length;
  if (gateCount > 100) {
    recommendations.push('大規模回路です。並列処理の有効化を検討してください。');
  }

  return {
    result: result.data,
    benchmark,
    recommendations,
  };
}