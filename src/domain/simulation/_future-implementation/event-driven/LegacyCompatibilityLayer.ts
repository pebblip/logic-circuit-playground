/**
 * 既存システムとの互換レイヤー
 * 
 * 目的:
 * - 既存coreAPIとの互換性維持
 * - 段階的なイベント駆動システムへの移行
 * - フィーチャーフラグによる切り替え
 * - 性能比較とフォールバック機能
 * 
 * 戦略:
 * - アダプターパターンによる透過的な切り替え
 * - 既存インターフェースの保持
 * - エラー処理とフォールバック
 * - 段階的ロールアウト
 */

import type { Gate, Wire } from '../../../types/circuit';
import type {
  Result,
  Circuit,
  CircuitEvaluationResult,
  EvaluationConfig,
  EvaluationError,
  ValidationError,
} from '../core/types';

import {
  EventDrivenSimulator,
  createEducationalSimulator,
  createHighPerformanceSimulator,
  type ExtendedEventDrivenConfig,
} from './EventDrivenSimulator';

import { evaluateCircuit as legacyEvaluateCircuit } from '../core/circuitEvaluation';
import { runQuickBenchmark } from './PerformanceBenchmark';

/**
 * シミュレーション戦略
 */
export type SimulationStrategy = 
  | 'LEGACY_ONLY'           // 既存システムのみ
  | 'EVENT_DRIVEN_ONLY'     // イベント駆動のみ
  | 'AUTO_SELECT'           // 自動選択
  | 'HYBRID'                // ハイブリッド実行
  | 'COMPARISON_MODE';      // 比較モード

/**
 * 互換レイヤー設定
 */
export interface CompatibilityConfig {
  readonly strategy: SimulationStrategy;
  readonly autoSelectionThresholds: {
    readonly maxGatesForLegacy: number;
    readonly maxWiresForLegacy: number;
    readonly maxSimulationTimeForLegacy: number; // ms
  };
  readonly enablePerformanceTracking: boolean;
  readonly enableFallback: boolean;
  readonly fallbackTimeout: number; // ms
  readonly enableValidation: boolean;
  readonly validationTolerance: number;
}

/**
 * デフォルト互換設定
 */
export const DEFAULT_COMPATIBILITY_CONFIG: CompatibilityConfig = {
  strategy: 'AUTO_SELECT',
  autoSelectionThresholds: {
    maxGatesForLegacy: 100,
    maxWiresForLegacy: 200,
    maxSimulationTimeForLegacy: 1000,
  },
  enablePerformanceTracking: true,
  enableFallback: true,
  fallbackTimeout: 5000,
  enableValidation: false, // 本格運用時は false
  validationTolerance: 0.001,
};

/**
 * 実行結果情報
 */
export interface ExecutionInfo {
  readonly strategyUsed: SimulationStrategy;
  readonly executionTimeMs: number;
  readonly memoryUsage?: number;
  readonly fallbackTriggered: boolean;
  readonly validationResult?: ValidationResult;
  readonly performanceComparison?: PerformanceComparison;
}

/**
 * 検証結果
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly differences: readonly Difference[];
  readonly similarity: number; // 0-1
}

/**
 * 差異情報
 */
export interface Difference {
  readonly type: 'GATE_OUTPUT' | 'WIRE_STATE' | 'TIMING' | 'METADATA';
  readonly location: string;
  readonly legacyValue: unknown;
  readonly eventDrivenValue: unknown;
  readonly severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
}

/**
 * 性能比較結果
 */
export interface PerformanceComparison {
  readonly legacyTime: number;
  readonly eventDrivenTime: number;
  readonly speedup: number;
  readonly memoryDifference: number;
  readonly recommendation: string;
}

/**
 * 拡張回路評価結果
 */
export interface ExtendedCircuitEvaluationResult extends CircuitEvaluationResult {
  readonly executionInfo: ExecutionInfo;
}

/**
 * 互換レイヤーメインクラス
 */
export class LegacyCompatibilityLayer {
  private config: CompatibilityConfig;
  private performanceHistory: Map<string, PerformanceComparison[]> = new Map();
  private eventDrivenSimulator?: EventDrivenSimulator;

  constructor(config: CompatibilityConfig = DEFAULT_COMPATIBILITY_CONFIG) {
    this.config = config;
  }

  /**
   * 統合回路評価（メインエントリーポイント）
   */
  async evaluateCircuitUnified(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    const startTime = Date.now();
    
    try {
      // 戦略決定
      const strategy = this.determineStrategy(circuit, config);
      
      // 実行
      const result = await this.executeWithStrategy(circuit, config, strategy);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      if (!result.success) {
        return result;
      }

      // 実行情報追加
      const extendedResult: ExtendedCircuitEvaluationResult = {
        ...result.data,
        executionInfo: {
          strategyUsed: strategy,
          executionTimeMs: executionTime,
          fallbackTriggered: false,
          ...result.data.executionInfo,
        },
      };

      return {
        success: true,
        data: extendedResult,
        warnings: result.warnings,
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'EVALUATION_ERROR',
          message: `Unified evaluation failed: ${error}`,
          stage: 'CIRCUIT_TRAVERSAL',
          originalError: error,
        } as EvaluationError,
        warnings: [],
      };
    }
  }

  /**
   * パフォーマンス履歴取得
   */
  getPerformanceHistory(circuitHash?: string): readonly PerformanceComparison[] {
    if (circuitHash) {
      return this.performanceHistory.get(circuitHash) || [];
    }
    
    const allHistory: PerformanceComparison[] = [];
    for (const history of this.performanceHistory.values()) {
      allHistory.push(...history);
    }
    return allHistory;
  }

  /**
   * 最適化推奨取得
   */
  getOptimizationRecommendations(circuit: Readonly<Circuit>): readonly string[] {
    const recommendations: string[] = [];
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;

    // 回路サイズベースの推奨
    if (gateCount > this.config.autoSelectionThresholds.maxGatesForLegacy) {
      recommendations.push('大規模回路のため、イベント駆動シミュレーションの使用を推奨');
    }

    // 性能履歴ベースの推奨
    const circuitHash = this.calculateCircuitHash(circuit);
    const history = this.performanceHistory.get(circuitHash);
    
    if (history && history.length > 0) {
      const avgSpeedup = history.reduce((sum, comp) => sum + comp.speedup, 0) / history.length;
      
      if (avgSpeedup > 2.0) {
        recommendations.push('イベント駆動シミュレーションで2倍以上の高速化が期待できます');
      } else if (avgSpeedup < 0.5) {
        recommendations.push('この回路では既存システムが高速です');
      }
    }

    // 回路特性ベースの推奨
    const clockGateCount = circuit.gates.filter(g => g.type === 'CLOCK').length;
    if (clockGateCount > 0) {
      recommendations.push('クロック回路のため、イベント駆動シミュレーションが効果的です');
    }

    return recommendations;
  }

  /**
   * リソースクリーンアップ
   */
  dispose(): void {
    if (this.eventDrivenSimulator) {
      this.eventDrivenSimulator.dispose();
      this.eventDrivenSimulator = undefined;
    }
  }

  // ===============================
  // プライベートメソッド
  // ===============================

  /**
   * 戦略決定
   */
  private determineStrategy(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): SimulationStrategy {
    switch (this.config.strategy) {
      case 'LEGACY_ONLY':
      case 'EVENT_DRIVEN_ONLY':
      case 'COMPARISON_MODE':
      case 'HYBRID':
        return this.config.strategy;

      case 'AUTO_SELECT':
        return this.autoSelectStrategy(circuit, config);

      default:
        return 'LEGACY_ONLY';
    }
  }

  /**
   * 自動戦略選択
   */
  private autoSelectStrategy(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): SimulationStrategy {
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;
    const thresholds = this.config.autoSelectionThresholds;

    // 回路サイズベースの判定
    if (gateCount <= thresholds.maxGatesForLegacy && 
        wireCount <= thresholds.maxWiresForLegacy) {
      return 'LEGACY_ONLY';
    }

    // 性能履歴ベースの判定
    const circuitHash = this.calculateCircuitHash(circuit);
    const history = this.performanceHistory.get(circuitHash);
    
    if (history && history.length >= 3) {
      const avgSpeedup = history.reduce((sum, comp) => sum + comp.speedup, 0) / history.length;
      
      if (avgSpeedup > 1.5) {
        return 'EVENT_DRIVEN_ONLY';
      } else if (avgSpeedup < 0.7) {
        return 'LEGACY_ONLY';
      }
    }

    // 回路特性ベースの判定
    const hasClockGates = circuit.gates.some(g => g.type === 'CLOCK');
    const hasSequentialElements = circuit.gates.some(g => 
      g.type === 'D-FF' || g.type === 'SR-LATCH'
    );

    if (hasClockGates || hasSequentialElements) {
      return 'EVENT_DRIVEN_ONLY';
    }

    // デフォルト：中規模以上はイベント駆動
    return gateCount > 50 ? 'EVENT_DRIVEN_ONLY' : 'LEGACY_ONLY';
  }

  /**
   * 戦略に基づく実行
   */
  private async executeWithStrategy(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>,
    strategy: SimulationStrategy
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    switch (strategy) {
      case 'LEGACY_ONLY':
        return this.executeLegacyOnly(circuit, config);

      case 'EVENT_DRIVEN_ONLY':
        return this.executeEventDrivenOnly(circuit, config);

      case 'AUTO_SELECT':
        // 再帰を避けるため、具体的な戦略を選択
        const selectedStrategy = this.autoSelectStrategy(circuit, config);
        return this.executeWithStrategy(circuit, config, selectedStrategy);

      case 'HYBRID':
        return this.executeHybrid(circuit, config);

      case 'COMPARISON_MODE':
        return this.executeComparisonMode(circuit, config);

      default:
        return this.executeLegacyOnly(circuit, config);
    }
  }

  /**
   * 既存システムのみで実行
   */
  private async executeLegacyOnly(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    const startTime = Date.now();
    
    const result = legacyEvaluateCircuit(circuit, config);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    if (!result.success) {
      return result;
    }

    const executionInfo: ExecutionInfo = {
      strategyUsed: 'LEGACY_ONLY',
      executionTimeMs: executionTime,
      fallbackTriggered: false,
    };

    const extendedResult: ExtendedCircuitEvaluationResult = {
      ...result.data,
      executionInfo,
    };

    return {
      success: true,
      data: extendedResult,
      warnings: result.warnings,
    };
  }

  /**
   * イベント駆動のみで実行
   */
  private async executeEventDrivenOnly(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    const startTime = Date.now();
    let fallbackTriggered = false;

    try {
      // イベント駆動シミュレーター取得または作成
      if (!this.eventDrivenSimulator) {
        this.eventDrivenSimulator = this.createOptimalSimulator(circuit);
      }

      // シミュレーション実行
      const simulationResult = await this.eventDrivenSimulator.simulate(
        circuit.gates,
        circuit.wires,
        1000000, // 1ms in picoseconds
        {
          enableTimeline: this.config.enablePerformanceTracking,
        }
      );

      // 結果変換
      const convertedResult = this.convertEventDrivenResult(simulationResult, circuit);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const executionInfo: ExecutionInfo = {
        strategyUsed: 'EVENT_DRIVEN_ONLY',
        executionTimeMs: executionTime,
        memoryUsage: simulationResult.statistics.memoryStats?.currentUsage,
        fallbackTriggered,
      };

      const extendedResult: ExtendedCircuitEvaluationResult = {
        ...convertedResult,
        executionInfo,
      };

      return {
        success: true,
        data: extendedResult,
        warnings: simulationResult.warnings,
      };

    } catch (error) {
      // フォールバック実行
      if (this.config.enableFallback) {
        console.warn('Event-driven simulation failed, falling back to legacy system:', error);
        fallbackTriggered = true;
        
        const fallbackResult = await this.executeLegacyOnly(circuit, config);
        
        if (fallbackResult.success) {
          fallbackResult.data.executionInfo.fallbackTriggered = true;
        }
        
        return fallbackResult;
      }

      return {
        success: false,
        error: {
          type: 'EVALUATION_ERROR',
          message: `Event-driven simulation failed: ${error}`,
          stage: 'CIRCUIT_TRAVERSAL',
          originalError: error,
        } as EvaluationError,
        warnings: [],
      };
    }
  }

  /**
   * ハイブリッド実行
   */
  private async executeHybrid(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    // 回路を分割して最適な手法で実行
    const { sequentialPart, combinationalPart } = this.partitionCircuit(circuit);

    // シーケンシャル部分はイベント駆動で実行
    const sequentialResult = await this.executeEventDrivenOnly(sequentialPart, config);
    
    if (!sequentialResult.success) {
      return sequentialResult;
    }

    // 組み合わせ部分は既存システムで実行
    const combinationalResult = await this.executeLegacyOnly(combinationalPart, config);
    
    if (!combinationalResult.success) {
      return combinationalResult;
    }

    // 結果をマージ
    const mergedResult = this.mergeResults(sequentialResult.data, combinationalResult.data);

    return {
      success: true,
      data: mergedResult,
      warnings: [...sequentialResult.warnings, ...combinationalResult.warnings],
    };
  }

  /**
   * 比較モード実行
   */
  private async executeComparisonMode(
    circuit: Readonly<Circuit>,
    config: Readonly<EvaluationConfig>
  ): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
    const startTime = Date.now();

    // 並列実行
    const [legacyPromise, eventDrivenPromise] = await Promise.allSettled([
      this.executeLegacyOnly(circuit, config),
      this.executeEventDrivenOnly(circuit, config),
    ]);

    const endTime = Date.now();

    // 結果検証
    const validationResult = this.validateResults(legacyPromise, eventDrivenPromise);
    
    // 性能比較
    const performanceComparison = this.comparePerformance(legacyPromise, eventDrivenPromise);
    
    // 性能履歴更新
    if (performanceComparison) {
      const circuitHash = this.calculateCircuitHash(circuit);
      const history = this.performanceHistory.get(circuitHash) || [];
      history.push(performanceComparison);
      
      // 履歴サイズ制限
      if (history.length > 10) {
        history.shift();
      }
      
      this.performanceHistory.set(circuitHash, history);
    }

    // 成功した結果を返す（イベント駆動を優先）
    let primaryResult: Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>;
    
    if (eventDrivenPromise.status === 'fulfilled' && eventDrivenPromise.value.success) {
      primaryResult = eventDrivenPromise.value;
    } else if (legacyPromise.status === 'fulfilled' && legacyPromise.value.success) {
      primaryResult = legacyPromise.value;
    } else {
      return {
        success: false,
        error: {
          type: 'EVALUATION_ERROR',
          message: 'Both simulation methods failed',
          stage: 'CIRCUIT_TRAVERSAL',
        } as EvaluationError,
        warnings: [],
      };
    }

    // 実行情報を拡張
    primaryResult.data.executionInfo = {
      ...primaryResult.data.executionInfo,
      strategyUsed: 'COMPARISON_MODE',
      validationResult,
      performanceComparison,
    };

    return primaryResult;
  }

  /**
   * 最適なシミュレーター作成
   */
  private createOptimalSimulator(circuit: Readonly<Circuit>): EventDrivenSimulator {
    const gateCount = circuit.gates.length;
    
    if (gateCount > 1000) {
      return createHighPerformanceSimulator();
    } else {
      return createEducationalSimulator();
    }
  }

  /**
   * イベント駆動結果を既存形式に変換
   */
  private convertEventDrivenResult(
    eventDrivenResult: any,
    originalCircuit: Readonly<Circuit>
  ): CircuitEvaluationResult {
    // 簡略化された変換
    // 実際の実装では詳細なマッピングが必要
    
    const updatedGates = originalCircuit.gates.map(gate => ({ ...gate }));
    const updatedWires = originalCircuit.wires.map(wire => ({ ...wire }));
    
    const circuit: Circuit = {
      gates: updatedGates,
      wires: updatedWires,
      metadata: originalCircuit.metadata,
    };

    return {
      circuit,
      evaluationStats: {
        totalGates: updatedGates.length,
        evaluatedGates: updatedGates.length,
        skippedGates: 0,
        evaluationTimeMs: 0,
        dependencyResolutionTimeMs: 0,
        gateEvaluationTimes: new Map(),
      },
      dependencyGraph: {
        nodes: new Map(),
        edges: [],
        evaluationOrder: [],
        hasCycles: false,
        cycles: [],
      },
    };
  }

  /**
   * 回路分割（ハイブリッド用）
   */
  private partitionCircuit(circuit: Readonly<Circuit>): {
    sequentialPart: Circuit;
    combinationalPart: Circuit;
  } {
    const sequentialGates = circuit.gates.filter(gate =>
      gate.type === 'CLOCK' || gate.type === 'D-FF' || gate.type === 'SR-LATCH'
    );
    
    const combinationalGates = circuit.gates.filter(gate =>
      !sequentialGates.includes(gate)
    );

    // 簡略化された分割
    return {
      sequentialPart: {
        gates: sequentialGates,
        wires: circuit.wires.filter(wire =>
          sequentialGates.some(gate => gate.id === wire.from.gateId || gate.id === wire.to.gateId)
        ),
        metadata: circuit.metadata,
      },
      combinationalPart: {
        gates: combinationalGates,
        wires: circuit.wires.filter(wire =>
          combinationalGates.some(gate => gate.id === wire.from.gateId || gate.id === wire.to.gateId)
        ),
        metadata: circuit.metadata,
      },
    };
  }

  /**
   * 結果マージ
   */
  private mergeResults(
    sequentialResult: ExtendedCircuitEvaluationResult,
    combinationalResult: ExtendedCircuitEvaluationResult
  ): ExtendedCircuitEvaluationResult {
    // 簡略化されたマージ
    return {
      ...sequentialResult,
      circuit: {
        gates: [...sequentialResult.circuit.gates, ...combinationalResult.circuit.gates],
        wires: [...sequentialResult.circuit.wires, ...combinationalResult.circuit.wires],
        metadata: sequentialResult.circuit.metadata,
      },
      executionInfo: {
        strategyUsed: 'HYBRID',
        executionTimeMs: sequentialResult.executionInfo.executionTimeMs + combinationalResult.executionInfo.executionTimeMs,
        fallbackTriggered: sequentialResult.executionInfo.fallbackTriggered || combinationalResult.executionInfo.fallbackTriggered,
      },
    };
  }

  /**
   * 結果検証
   */
  private validateResults(
    legacyPromise: PromiseSettledResult<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>>,
    eventDrivenPromise: PromiseSettledResult<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>>
  ): ValidationResult | undefined {
    if (!this.config.enableValidation) {
      return undefined;
    }

    // 両方成功した場合のみ検証
    if (legacyPromise.status === 'fulfilled' && legacyPromise.value.success &&
        eventDrivenPromise.status === 'fulfilled' && eventDrivenPromise.value.success) {
      
      const legacyResult = legacyPromise.value.data;
      const eventDrivenResult = eventDrivenPromise.value.data;
      
      return this.compareCircuitResults(legacyResult.circuit, eventDrivenResult.circuit);
    }

    return undefined;
  }

  /**
   * 回路結果比較
   */
  private compareCircuitResults(legacy: Circuit, eventDriven: Circuit): ValidationResult {
    const differences: Difference[] = [];

    // ゲート出力比較
    for (const legacyGate of legacy.gates) {
      const eventDrivenGate = eventDriven.gates.find(g => g.id === legacyGate.id);
      
      if (eventDrivenGate) {
        if (legacyGate.output !== eventDrivenGate.output) {
          differences.push({
            type: 'GATE_OUTPUT',
            location: legacyGate.id,
            legacyValue: legacyGate.output,
            eventDrivenValue: eventDrivenGate.output,
            severity: 'MAJOR',
          });
        }
      }
    }

    // ワイヤー状態比較
    for (const legacyWire of legacy.wires) {
      const eventDrivenWire = eventDriven.wires.find(w => w.id === legacyWire.id);
      
      if (eventDrivenWire) {
        if (legacyWire.isActive !== eventDrivenWire.isActive) {
          differences.push({
            type: 'WIRE_STATE',
            location: legacyWire.id,
            legacyValue: legacyWire.isActive,
            eventDrivenValue: eventDrivenWire.isActive,
            severity: 'MAJOR',
          });
        }
      }
    }

    const similarity = 1 - (differences.length / (legacy.gates.length + legacy.wires.length));

    return {
      isValid: differences.length === 0,
      differences,
      similarity: Math.max(0, similarity),
    };
  }

  /**
   * 性能比較
   */
  private comparePerformance(
    legacyPromise: PromiseSettledResult<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>>,
    eventDrivenPromise: PromiseSettledResult<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>>
  ): PerformanceComparison | undefined {
    if (legacyPromise.status === 'fulfilled' && legacyPromise.value.success &&
        eventDrivenPromise.status === 'fulfilled' && eventDrivenPromise.value.success) {
      
      const legacyTime = legacyPromise.value.data.executionInfo.executionTimeMs;
      const eventDrivenTime = eventDrivenPromise.value.data.executionInfo.executionTimeMs;
      const speedup = legacyTime / eventDrivenTime;

      let recommendation: string;
      if (speedup > 1.5) {
        recommendation = 'イベント駆動シミュレーションを推奨';
      } else if (speedup < 0.7) {
        recommendation = '既存システムを推奨';
      } else {
        recommendation = '性能差は軽微、どちらでも可';
      }

      return {
        legacyTime,
        eventDrivenTime,
        speedup,
        memoryDifference: 0, // 簡略化
        recommendation,
      };
    }

    return undefined;
  }

  /**
   * 回路ハッシュ計算
   */
  private calculateCircuitHash(circuit: Readonly<Circuit>): string {
    // 簡略化されたハッシュ計算
    const gateTypes = circuit.gates.map(g => g.type).sort().join(',');
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;
    
    return `${gateTypes}_${gateCount}_${wireCount}`;
  }
}

// ===============================
// 便利関数・エクスポート
// ===============================

/**
 * 統合評価関数（既存APIの置き換え）
 */
export async function evaluateCircuitUnified(
  circuit: Readonly<Circuit>,
  config: Readonly<EvaluationConfig> = {},
  compatibilityConfig?: Partial<CompatibilityConfig>
): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
  const layer = new LegacyCompatibilityLayer({
    ...DEFAULT_COMPATIBILITY_CONFIG,
    ...compatibilityConfig,
  });

  try {
    return await layer.evaluateCircuitUnified(circuit, {
      timeProvider: { getCurrentTime: () => Date.now() },
      enableDebug: false,
      strictValidation: true,
      maxRecursionDepth: 100,
      ...config,
    });
  } finally {
    layer.dispose();
  }
}

/**
 * 性能ベンチマーク実行
 */
export async function benchmarkSimulationStrategies(
  circuit: Readonly<Circuit>
): Promise<PerformanceComparison> {
  const layer = new LegacyCompatibilityLayer({
    ...DEFAULT_COMPATIBILITY_CONFIG,
    strategy: 'COMPARISON_MODE',
    enablePerformanceTracking: true,
  });

  try {
    const result = await layer.evaluateCircuitUnified(circuit, {
      timeProvider: { getCurrentTime: () => Date.now() },
      enableDebug: false,
      strictValidation: false,
      maxRecursionDepth: 100,
    });

    if (result.success && result.data.executionInfo.performanceComparison) {
      return result.data.executionInfo.performanceComparison;
    }

    throw new Error('Benchmark failed');
  } finally {
    layer.dispose();
  }
}

/**
 * フィーチャーフラグベースの評価
 */
export async function evaluateWithFeatureFlags(
  circuit: Readonly<Circuit>,
  config: Readonly<EvaluationConfig>,
  featureFlags: {
    readonly useEventDriven?: boolean;
    readonly enableComparison?: boolean;
    readonly enableFallback?: boolean;
  }
): Promise<Result<ExtendedCircuitEvaluationResult, ValidationError | EvaluationError>> {
  let strategy: SimulationStrategy = 'AUTO_SELECT';
  
  if (featureFlags.enableComparison) {
    strategy = 'COMPARISON_MODE';
  } else if (featureFlags.useEventDriven === true) {
    strategy = 'EVENT_DRIVEN_ONLY';
  } else if (featureFlags.useEventDriven === false) {
    strategy = 'LEGACY_ONLY';
  }

  const compatibilityConfig: CompatibilityConfig = {
    ...DEFAULT_COMPATIBILITY_CONFIG,
    strategy,
    enableFallback: featureFlags.enableFallback ?? true,
  };

  return evaluateCircuitUnified(circuit, config, compatibilityConfig);
}