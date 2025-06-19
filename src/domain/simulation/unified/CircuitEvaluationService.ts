/**
 * 統一回路評価サービス
 * 全てのシミュレーション機能を統一するサービスレイヤー
 */

import type { Circuit } from '../core/types';
import type { Gate, Wire } from '@/types/circuit';
import type { Result } from '../core/types';
import { EnhancedHybridEvaluator, type SimulationStrategy } from '../event-driven-minimal/EnhancedHybridEvaluator';
import { CircuitAnalyzer } from '../event-driven-minimal/CircuitAnalyzer';
import type {
  ICircuitEvaluationService,
  UnifiedEvaluationConfig,
  UnifiedEvaluationResult,
  UnifiedEvaluationError,
  CircuitComplexityAnalysis,
} from './types';
import { DEFAULT_UNIFIED_CONFIG } from './types';

/**
 * 統一回路評価サービス実装
 */
export class CircuitEvaluationService implements ICircuitEvaluationService {
  private evaluator: EnhancedHybridEvaluator;
  private config: UnifiedEvaluationConfig;
  
  // パフォーマンス統計
  private stats = {
    totalEvaluations: 0,
    totalExecutionTime: 0,
    strategyUsage: new Map<SimulationStrategy, number>(),
  };

  constructor(config: Partial<UnifiedEvaluationConfig> = {}) {
    this.config = { ...DEFAULT_UNIFIED_CONFIG, ...config };
    this.evaluator = new EnhancedHybridEvaluator({
      strategy: this.config.strategy,
      enableDebugLogging: this.config.enableDebugLogging,
      autoSelectionThresholds: this.config.autoSelectionThresholds,
      delayMode: this.config.delayMode,
    });
  }

  /**
   * 回路を評価
   */
  async evaluate(circuit: Circuit): Promise<Result<UnifiedEvaluationResult, UnifiedEvaluationError>> {
    const startTime = performance.now();
    
    try {
      // 1. 複雑度分析
      const complexity = this.analyzeComplexity(circuit);
      
      // 2. 戦略決定（必要に応じて動的調整）
      let strategy = this.config.strategy;
      if (strategy === 'AUTO_SELECT') {
        strategy = complexity.recommendedStrategy;
        
        // 動的に戦略を調整
        this.evaluator.updateConfig({
          strategy,
          enableDebugLogging: this.config.enableDebugLogging,
        });
      }

      // 3. 回路評価実行
      const evaluationResult = this.evaluator.evaluate(circuit);
      
      // 4. 実行時間計測
      const executionTime = performance.now() - startTime;
      
      // 5. 統計更新
      this.updateStats(strategy, executionTime);
      
      // 6. 結果構築
      const result: UnifiedEvaluationResult = {
        circuit: evaluationResult.circuit,
        strategyUsed: strategy,
        performanceInfo: {
          executionTimeMs: executionTime,
          cycleCount: 1,
          cacheHit: false,
        },
        oscillationInfo: undefined,
        debugInfo: this.config.enableDebugLogging ? {
          strategyReason: complexity.reasoning,
          evaluationLogs: [],
          circularGates: complexity.circularGates,
        } : undefined,
        warnings: evaluationResult.warnings,
      };

      return { success: true, data: result, warnings: [] };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateStats('AUTO_SELECT', executionTime);

      const evaluationError: UnifiedEvaluationError = {
        type: this.categorizeError(error),
        message: error instanceof Error ? error.message : 'Unknown evaluation error',
        originalError: error instanceof Error ? error : undefined,
        recovery: this.generateRecoveryAdvice(error),
      };

      return { success: false, error: evaluationError, warnings: [] };
    }
  }

  /**
   * 回路の複雑度を分析
   */
  analyzeComplexity(circuit: Circuit): CircuitComplexityAnalysis {
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;
    const hasCircularDependency = CircuitAnalyzer.hasCircularDependency(circuit);
    const circularGates = hasCircularDependency ? CircuitAnalyzer.findCircularGates(circuit) : [];
    const hasClock = circuit.gates.some((g: Gate) => g.type === 'CLOCK');
    const hasSequentialElements = circuit.gates.some((g: Gate) => 
      g.type === 'D-FF' || g.type === 'SR-LATCH' || g.type === 'CLOCK'
    );

    // 最大深度計算（簡易版）
    const maxDepth = this.calculateMaxDepth(circuit);

    // 推奨戦略決定
    let recommendedStrategy: SimulationStrategy;
    let reasoning: string;

    if (hasCircularDependency || hasSequentialElements) {
      recommendedStrategy = 'EVENT_DRIVEN_ONLY';
      reasoning = `循環依存または順序回路を検出: ${hasCircularDependency ? '循環依存あり' : ''}${hasSequentialElements ? '順序素子あり' : ''}`;
    } else if (gateCount <= this.config.autoSelectionThresholds.maxGatesForLegacy) {
      recommendedStrategy = 'LEGACY_ONLY';
      reasoning = `小規模組み合わせ回路(${gateCount}ゲート) - 従来方式が効率的`;
    } else if (gateCount >= this.config.autoSelectionThresholds.minGatesForEventDriven) {
      recommendedStrategy = 'EVENT_DRIVEN_ONLY';
      reasoning = `大規模回路(${gateCount}ゲート) - イベント駆動が効率的`;
    } else {
      recommendedStrategy = 'AUTO_SELECT';
      reasoning = `中規模回路(${gateCount}ゲート) - 動的選択`;
    }

    return {
      gateCount,
      wireCount,
      hasCircularDependency,
      circularGates,
      maxDepth,
      hasClock,
      hasSequentialElements,
      recommendedStrategy,
      reasoning,
    };
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<UnifiedEvaluationConfig>): void {
    this.config = { ...this.config, ...config };
    
    // EnhancedHybridEvaluatorの設定も更新
    this.evaluator.updateConfig({
      strategy: this.config.strategy,
      enableDebugLogging: this.config.enableDebugLogging,
      autoSelectionThresholds: this.config.autoSelectionThresholds,
    });
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): UnifiedEvaluationConfig {
    return { ...this.config };
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats() {
    const strategyUsageStats: Record<SimulationStrategy, number> = {
      'AUTO_SELECT': 0,
      'LEGACY_ONLY': 0,
      'EVENT_DRIVEN_ONLY': 0,
      'COMPARISON_MODE': 0,
    };

    this.stats.strategyUsage.forEach((count, strategy) => {
      strategyUsageStats[strategy] = count;
    });

    return {
      totalEvaluations: this.stats.totalEvaluations,
      avgExecutionTime: this.stats.totalEvaluations > 0 
        ? this.stats.totalExecutionTime / this.stats.totalEvaluations 
        : 0,
      strategyUsageStats,
    };
  }

  /**
   * キャッシュをクリア（将来実装）
   */
  clearCache(): void {
    // 将来のキャッシュ機能用
  }

  // === プライベートメソッド ===

  /**
   * 最大深度を計算（簡易版）
   */
  private calculateMaxDepth(circuit: Circuit): number {
    // 簡易実装：入力からの最大パス長
    const visited = new Set<string>();
    const memo = new Map<string, number>();
    
    const dfs = (gateId: string): number => {
      if (visited.has(gateId)) return 0; // 循環検出
      if (memo.has(gateId)) return memo.get(gateId)!;
      
      visited.add(gateId);
      
      const gate = circuit.gates.find((g: Gate) => g.id === gateId);
      if (!gate || gate.type === 'INPUT') {
        memo.set(gateId, 0);
        visited.delete(gateId);
        return 0;
      }
      
      const inputWires = circuit.wires.filter((w: Wire) => w.to.gateId === gateId);
      const maxInputDepth = inputWires.reduce((max: number, wire: Wire) => {
        const depth = dfs(wire.from.gateId);
        return Math.max(max, depth);
      }, 0);
      
      const result = maxInputDepth + 1;
      memo.set(gateId, result);
      visited.delete(gateId);
      return result;
    };

    return circuit.gates.reduce((max: number, gate: Gate) => {
      return Math.max(max, dfs(gate.id));
    }, 0);
  }

  /**
   * 統計を更新
   */
  private updateStats(strategy: SimulationStrategy, executionTime: number): void {
    this.stats.totalEvaluations++;
    this.stats.totalExecutionTime += executionTime;
    
    const currentCount = this.stats.strategyUsage.get(strategy) || 0;
    this.stats.strategyUsage.set(strategy, currentCount + 1);
  }

  /**
   * エラーを分類
   */
  private categorizeError(error: unknown): UnifiedEvaluationError['type'] {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('oscillation')) return 'OSCILLATION_DETECTED';
      if (message.includes('timeout')) return 'SIMULATION_TIMEOUT';
      if (message.includes('memory')) return 'MEMORY_LIMIT_EXCEEDED';
      if (message.includes('invalid')) return 'CIRCUIT_INVALID';
      if (message.includes('strategy')) return 'STRATEGY_FAILED';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * 復旧アドバイスを生成
   */
  private generateRecoveryAdvice(error: unknown): UnifiedEvaluationError['recovery'] {
    const errorType = this.categorizeError(error);
    
    switch (errorType) {
      case 'OSCILLATION_DETECTED':
        return {
          suggestedStrategy: 'EVENT_DRIVEN_ONLY',
          suggestedActions: [
            '発振設定でcontinueOnOscillationを有効にする',
            'maxCyclesAfterDetectionを増やす',
            '回路設計を見直す（フィードバックループの確認）',
          ],
        };
        
      case 'SIMULATION_TIMEOUT':
        return {
          suggestedStrategy: 'LEGACY_ONLY',
          suggestedActions: [
            'より高速な評価戦略に切り替える',
            '回路規模を小さくする',
            'タイムアウト値を増やす',
          ],
        };
        
      case 'CIRCUIT_INVALID':
        return {
          suggestedActions: [
            '回路の接続を確認する',
            'ゲートの入力数を確認する',
            'ワイヤーの接続が正しいか確認する',
          ],
        };
        
      default:
        return {
          suggestedStrategy: 'AUTO_SELECT',
          suggestedActions: [
            '別の評価戦略を試す',
            'デバッグログを有効にして詳細を確認する',
          ],
        };
    }
  }
}

/**
 * グローバルサービスインスタンス（シングルトンパターン）
 */
let globalEvaluationService: CircuitEvaluationService | null = null;

/**
 * グローバル評価サービスを取得
 */
export function getGlobalEvaluationService(): CircuitEvaluationService {
  if (!globalEvaluationService) {
    globalEvaluationService = new CircuitEvaluationService();
  }
  return globalEvaluationService;
}

/**
 * グローバル評価サービスを設定
 */
export function setGlobalEvaluationService(service: CircuitEvaluationService): void {
  globalEvaluationService = service;
}