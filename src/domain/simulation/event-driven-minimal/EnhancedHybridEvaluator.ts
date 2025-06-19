/**
 * 拡張ハイブリッド評価器
 * LegacyCompatibilityLayerのコンセプトを取り入れた高度な戦略選択機能
 */

import type { Circuit } from '../core/types';
import type { Gate, Wire } from '../../../types/circuit';
import { CircuitAnalyzer } from './CircuitAnalyzer';
import { MinimalEventDrivenEngine } from './MinimalEventDrivenEngine';
import { EventDrivenEngine } from '../event-driven';
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
  delayMode?: boolean;  // 遅延モードの有効/無効
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
  private eventDrivenEngine: EventDrivenEngine;
  private performanceHistory: Map<string, number[]> = new Map();
  
  constructor(config: Partial<EnhancedEvaluatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventDrivenEngine = new EventDrivenEngine({
      enableDebug: this.config.enableDebugLogging,
      delayMode: this.config.delayMode || false,
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
    
    // 循環依存、シーケンシャル要素がある場合はイベント駆動必須
    // CLOCKゲートは時間依存のため、レガシーエンジンで処理
    if (hasCircular || hasSequentialElements) {
      return 'EVENT_DRIVEN_ONLY';
    }
    
    // CLOCKゲートがある場合はレガシーエンジンを使用
    // （イベント駆動は静的な評価のため、時間経過による変化に対応できない）
    if (hasClockGates) {
      return 'LEGACY_ONLY';
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
    
    // デバッグ設定を追加
    const config = {
      ...defaultConfig,
      enableDebug: this.config.enableDebugLogging,
    };
    
    const result = evaluateTopological(circuitData, config);
    
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
    
    
    // ワイヤー情報から入力値を動的に計算
    const gateInputsMap = new Map<string, boolean[]>();
    
    // 各ゲートの入力値をワイヤーから計算
    for (const gate of circuit.gates) {
      const inputs: boolean[] = [];
      const inputCount = this.getGateInputCount(gate);
      
      // 初期化
      for (let i = 0; i < inputCount; i++) {
        inputs[i] = false;
      }
      
      // ワイヤーから入力値を収集
      for (const wire of circuit.wires) {
        if (wire.to.gateId === gate.id) {
          const sourceGateState = result.finalState?.gateStates.get(wire.from.gateId);
          if (sourceGateState) {
            const outputIndex = wire.from.pinIndex === -1 ? 0 : 
                               wire.from.pinIndex === -2 ? 1 : 0;
            const value = sourceGateState.outputs[outputIndex] || false;
            
            if (wire.to.pinIndex >= 0 && wire.to.pinIndex < inputs.length) {
              inputs[wire.to.pinIndex] = value;
            }
          }
        }
      }
      
      gateInputsMap.set(gate.id, inputs);
    }
    
    // EventDrivenEngineの結果から正しいゲート状態を反映
    const updatedGates = circuit.gates.map(gate => {
      const gateState = result.finalState?.gateStates.get(gate.id);
      const dynamicInputs = gateInputsMap.get(gate.id) || [];
      
      
      if (gateState) {
        // GateStateからゲートオブジェクトに正しい状態を反映
        const updatedGate = { ...gate };
        
        // 出力値を反映
        if (gateState.outputs.length > 0) {
          updatedGate.output = gateState.outputs[0];
        }
        
        // OUTPUTゲートは入力をそのまま出力に反映
        if (gate.type === 'OUTPUT' && dynamicInputs.length > 0) {
          updatedGate.output = dynamicInputs[0];
        }
        
        // 動的に計算した入力値を反映（文字列形式で保存）
        updatedGate.inputs = dynamicInputs.map(input => input ? '1' : '');
        
        // メタデータを更新（D-FF、SR-LATCH等の状態保持ゲート用）
        if (gateState.metadata) {
          updatedGate.metadata = { ...updatedGate.metadata, ...gateState.metadata };
        }
        
        return updatedGate;
      }
      return { ...gate };
    });
    
    // ワイヤーの状態も更新
    const updatedWires = circuit.wires.map(wire => {
      const sourceGateState = result.finalState?.gateStates.get(wire.from.gateId);
      if (sourceGateState) {
        // pinIndex -1は出力index 0、pinIndex -2は出力index 1
        const outputIndex = wire.from.pinIndex === -1 ? 0 : 
                           wire.from.pinIndex === -2 ? 1 : 0;
        const isActive = sourceGateState.outputs[outputIndex] || false;
        return { ...wire, isActive };
      }
      return { ...wire };
    });

    return {
      circuit: {
        gates: updatedGates,
        wires: updatedWires
      },
      warnings,
    };
  }

  /**
   * ゲートの入力数を取得
   */
  private getGateInputCount(gate: Gate): number {
    switch (gate.type) {
      case 'INPUT':
      case 'CLOCK':
        return 0;
      case 'OUTPUT':
      case 'NOT':
        return 1;
      case 'AND':
      case 'OR':
      case 'XOR':
      case 'NAND':
      case 'NOR':
      case 'D-FF':
      case 'SR-LATCH':
        return 2;
      case 'MUX':
        return 3;
      case 'BINARY_COUNTER':
        return 1;
      case 'CUSTOM':
        // カスタムゲートの場合は定義から取得
        return gate.customGateDefinition?.inputs.length || 0;
      default:
        return 0;
    }
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
    this.eventDrivenEngine = new EventDrivenEngine({
      enableDebug: this.config.enableDebugLogging,
      delayMode: this.config.delayMode || false,
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