/**
 * 拡張ハイブリッド評価器
 * LegacyCompatibilityLayerのコンセプトを取り入れた高度な戦略選択機能
 */

import type { Circuit } from '../core/types';
import type { Gate, Wire } from '../../../types/circuit';
import { CircuitAnalyzer } from './CircuitAnalyzer';
import { MinimalEventDrivenEngine } from './MinimalEventDrivenEngine';
import { evaluateCircuit as evaluateTopological } from '../core/circuitEvaluation';
import { defaultConfig } from '../core/types';

/**
 * シミュレーション戦略
 */
export type SimulationStrategy = 
  | 'LEGACY_ONLY'           // 既存システムのみ（トポロジカルソート）
  | 'EVENT_DRIVEN_ONLY'     // イベント駆動のみ
  | 'AUTO_SELECT'           // 自動選択
  | 'COMPARISON_MODE';      // 比較モード（デバッグ用）

/**
 * 評価設定
 */
export interface EnhancedEvaluatorConfig {
  strategy: SimulationStrategy;
  autoSelectionThresholds: {
    maxGatesForLegacy: number;    // この数以下なら既存システム
    minGatesForEventDriven: number; // この数以上ならイベント駆動
  };
  enablePerformanceTracking: boolean;
  enableDebugLogging: boolean;
}

/**
 * 評価結果の拡張情報
 */
export interface EvaluationInfo {
  strategyUsed: SimulationStrategy;
  executionTimeMs: number;
  hasCircularDependency: boolean;
  gateCount: number;
  wireCount: number;
  recommendation?: string;
}

/**
 * 評価結果
 */
export interface EnhancedEvaluationResult {
  circuit: Circuit;
  evaluationInfo: EvaluationInfo;
  warnings: string[];
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: EnhancedEvaluatorConfig = {
  strategy: 'AUTO_SELECT',
  autoSelectionThresholds: {
    maxGatesForLegacy: 50,
    minGatesForEventDriven: 100,
  },
  enablePerformanceTracking: true,
  enableDebugLogging: false,
};

export class EnhancedHybridEvaluator {
  private config: EnhancedEvaluatorConfig;
  private eventDrivenEngine: MinimalEventDrivenEngine;
  private performanceHistory: Map<string, number[]> = new Map();
  
  constructor(config: Partial<EnhancedEvaluatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventDrivenEngine = new MinimalEventDrivenEngine({
      enableDebug: this.config.enableDebugLogging,
    });
  }

  /**
   * 回路を評価（メインAPI）
   */
  evaluate(circuit: Circuit): EnhancedEvaluationResult {
    const startTime = performance.now();
    
    // 戦略決定
    const strategy = this.determineStrategy(circuit);
    
    // 実行
    const result = this.executeWithStrategy(circuit, strategy);
    
    const executionTime = performance.now() - startTime;
    
    // パフォーマンス履歴を記録
    if (this.config.enablePerformanceTracking) {
      this.recordPerformance(circuit, executionTime);
    }
    
    // 評価情報を追加
    const evaluationInfo: EvaluationInfo = {
      strategyUsed: strategy,
      executionTimeMs: executionTime,
      hasCircularDependency: CircuitAnalyzer.hasCircularDependency(circuit),
      gateCount: circuit.gates.length,
      wireCount: circuit.wires.length,
      recommendation: this.getRecommendation(circuit, strategy),
    };
    
    return {
      circuit: result.circuit,
      evaluationInfo,
      warnings: result.warnings,
    };
  }

  /**
   * 戦略の決定
   */
  private determineStrategy(circuit: Circuit): SimulationStrategy {
    switch (this.config.strategy) {
      case 'LEGACY_ONLY':
      case 'EVENT_DRIVEN_ONLY':
      case 'COMPARISON_MODE':
        return this.config.strategy;
        
      case 'AUTO_SELECT':
        return this.autoSelectStrategy(circuit);
        
      default:
        return 'AUTO_SELECT';
    }
  }

  /**
   * 自動戦略選択
   */
  private autoSelectStrategy(circuit: Circuit): SimulationStrategy {
    const gateCount = circuit.gates.length;
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    const hasClockGates = circuit.gates.some(g => g.type === 'CLOCK');
    const hasSequentialElements = circuit.gates.some(g => 
      g.type === 'D-FF' || g.type === 'SR-LATCH'
    );
    
    // 循環依存、クロック、シーケンシャル要素がある場合はイベント駆動必須
    if (hasCircular || hasClockGates || hasSequentialElements) {
      return 'EVENT_DRIVEN_ONLY';
    }
    
    // 小規模回路は既存システムが高速
    if (gateCount <= this.config.autoSelectionThresholds.maxGatesForLegacy) {
      return 'LEGACY_ONLY';
    }
    
    // 大規模回路はイベント駆動が効率的
    if (gateCount >= this.config.autoSelectionThresholds.minGatesForEventDriven) {
      return 'EVENT_DRIVEN_ONLY';
    }
    
    // 中規模回路はパフォーマンス履歴を参考に
    const avgPerformance = this.getAveragePerformance(circuit);
    if (avgPerformance !== null && avgPerformance > 10) {
      // 過去に時間がかかった場合はイベント駆動
      return 'EVENT_DRIVEN_ONLY';
    }
    
    return 'LEGACY_ONLY';
  }

  /**
   * 戦略に基づく実行
   */
  private executeWithStrategy(
    circuit: Circuit,
    strategy: SimulationStrategy
  ): { circuit: Circuit; warnings: string[] } {
    switch (strategy) {
      case 'LEGACY_ONLY':
        return this.executeLegacy(circuit);
        
      case 'EVENT_DRIVEN_ONLY':
        return this.executeEventDriven(circuit);
        
      case 'COMPARISON_MODE':
        return this.executeComparison(circuit);
        
      default:
        return this.executeLegacy(circuit);
    }
  }

  /**
   * 既存システムで実行
   */
  private executeLegacy(circuit: Circuit): { circuit: Circuit; warnings: string[] } {
    const circuitData = {
      gates: circuit.gates,
      wires: circuit.wires,
      metadata: {},
    };
    
    const result = evaluateTopological(circuitData, defaultConfig);
    
    if (result.success) {
      return {
        circuit: result.data.circuit,
        warnings: [...result.warnings], // readonlyを解除
      };
    } else {
      if (this.config.enableDebugLogging) {
        console.error('[EnhancedHybridEvaluator] トポロジカル評価失敗:', result.error);
      }
      return {
        circuit,
        warnings: [`評価エラー: ${result.error.message}`],
      };
    }
  }

  /**
   * イベント駆動で実行
   */
  private executeEventDriven(circuit: Circuit): { circuit: Circuit; warnings: string[] } {
    const warnings: string[] = [];
    
    const result = this.eventDrivenEngine.evaluate(circuit);
    
    if (!result.success) {
      warnings.push('イベント駆動シミュレーションで収束しませんでした');
      if (result.hasOscillation) {
        warnings.push('発振が検出されました');
      }
    }
    
    if (this.config.enableDebugLogging && result.debugTrace) {
      console.debug('[EnhancedHybridEvaluator] デバッグトレース:', result.debugTrace);
    }
    
    // 更新された状態で新しいcircuitオブジェクトを返す
    return {
      circuit: {
        gates: circuit.gates.map(g => ({ ...g })),
        wires: circuit.wires.map(w => ({ ...w }))
      },
      warnings,
    };
  }

  /**
   * 比較モードで実行
   */
  private executeComparison(circuit: Circuit): { circuit: Circuit; warnings: string[] } {
    const warnings: string[] = [];
    
    // 両方の方式で実行
    const legacyStart = performance.now();
    const legacyResult = this.executeLegacy(circuit);
    const legacyTime = performance.now() - legacyStart;
    
    const eventDrivenStart = performance.now();
    const eventDrivenResult = this.executeEventDriven(circuit);
    const eventDrivenTime = performance.now() - eventDrivenStart;
    
    // 性能比較
    const speedup = legacyTime / eventDrivenTime;
    warnings.push(
      `性能比較: Legacy=${legacyTime.toFixed(2)}ms, EventDriven=${eventDrivenTime.toFixed(2)}ms, 速度向上=${speedup.toFixed(2)}倍`
    );
    
    // 結果の差異をチェック
    const differences = this.compareResults(legacyResult.circuit, eventDrivenResult.circuit);
    if (differences.length > 0) {
      warnings.push(`結果に差異があります: ${differences.join(', ')}`);
    }
    
    // イベント駆動の結果を返す（より正確なため）
    return {
      circuit: eventDrivenResult.circuit,
      warnings: [...eventDrivenResult.warnings, ...warnings],
    };
  }

  /**
   * 結果の比較
   */
  private compareResults(circuit1: Circuit, circuit2: Circuit): string[] {
    const differences: string[] = [];
    
    // ゲート出力の比較
    for (let i = 0; i < circuit1.gates.length; i++) {
      const gate1 = circuit1.gates[i];
      const gate2 = circuit2.gates.find(g => g.id === gate1.id);
      
      if (gate2 && gate1.output !== gate2.output) {
        differences.push(`ゲート${gate1.id}の出力が異なります`);
      }
    }
    
    // ワイヤー状態の比較
    for (let i = 0; i < circuit1.wires.length; i++) {
      const wire1 = circuit1.wires[i];
      const wire2 = circuit2.wires.find(w => w.id === wire1.id);
      
      if (wire2 && wire1.isActive !== wire2.isActive) {
        differences.push(`ワイヤー${wire1.id}の状態が異なります`);
      }
    }
    
    return differences;
  }

  /**
   * 推奨事項の生成
   */
  private getRecommendation(circuit: Circuit, strategyUsed: SimulationStrategy): string {
    const gateCount = circuit.gates.length;
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    
    if (hasCircular) {
      return 'この回路には循環依存があるため、イベント駆動シミュレーションが必要です';
    }
    
    if (strategyUsed === 'LEGACY_ONLY' && gateCount > 100) {
      return '大規模回路のため、イベント駆動シミュレーションの使用を検討してください';
    }
    
    if (strategyUsed === 'EVENT_DRIVEN_ONLY' && gateCount < 20) {
      return '小規模回路のため、既存システムの方が高速な可能性があります';
    }
    
    return '現在の設定が適切です';
  }

  /**
   * パフォーマンス履歴の記録
   */
  private recordPerformance(circuit: Circuit, executionTime: number): void {
    const hash = this.calculateCircuitHash(circuit);
    const history = this.performanceHistory.get(hash) || [];
    
    history.push(executionTime);
    
    // 最新10件のみ保持
    if (history.length > 10) {
      history.shift();
    }
    
    this.performanceHistory.set(hash, history);
  }

  /**
   * 平均パフォーマンスの取得
   */
  private getAveragePerformance(circuit: Circuit): number | null {
    const hash = this.calculateCircuitHash(circuit);
    const history = this.performanceHistory.get(hash);
    
    if (!history || history.length === 0) {
      return null;
    }
    
    return history.reduce((sum, time) => sum + time, 0) / history.length;
  }

  /**
   * 回路のハッシュ計算（簡易版）
   */
  private calculateCircuitHash(circuit: Circuit): string {
    const gateTypes = circuit.gates.map(g => g.type).sort().join(',');
    const gateCount = circuit.gates.length;
    const wireCount = circuit.wires.length;
    
    return `${gateTypes}_${gateCount}_${wireCount}`;
  }

  /**
   * 設定の更新
   */
  updateConfig(config: Partial<EnhancedEvaluatorConfig>): void {
    this.config = { ...this.config, ...config };
    this.eventDrivenEngine = new MinimalEventDrivenEngine({
      enableDebug: this.config.enableDebugLogging,
    });
  }

  /**
   * パフォーマンス履歴のクリア
   */
  clearPerformanceHistory(): void {
    this.performanceHistory.clear();
  }

  /**
   * 回路の解析情報を取得
   */
  analyzeCircuit(circuit: Circuit) {
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    const circularGates = CircuitAnalyzer.findCircularGates(circuit);
    const complexity = CircuitAnalyzer.getCircuitComplexity(circuit);
    
    return {
      hasCircularDependency: hasCircular,
      circularGates,
      complexity,
      recommendedMode: hasCircular ? 'event-driven' : 'topological',
      evaluationInfo: this.getRecommendation(circuit, this.determineStrategy(circuit)),
    };
  }
}