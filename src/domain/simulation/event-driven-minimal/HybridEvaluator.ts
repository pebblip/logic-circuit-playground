/**
 * ハイブリッド評価器
 * 循環の有無によって適切なシミュレーターを選択
 */

import type { Circuit } from '../core/types';
import { CircuitAnalyzer } from './CircuitAnalyzer';
import { EventDrivenEngine } from '../event-driven';
import { evaluateCircuit as evaluateTopological } from '../core/circuitEvaluation';
import { defaultConfig } from '../core/types';

export interface HybridEvaluatorConfig {
  enableDebug?: boolean;
  delayMode?: boolean;
}

export class HybridEvaluator {
  private eventDrivenEngine: EventDrivenEngine;
  private useEventDriven = false;
  private config: HybridEvaluatorConfig;
  
  constructor(config: HybridEvaluatorConfig = {}) {
    this.config = {
      enableDebug: true,
      delayMode: false,
      ...config,
    };
    
    this.eventDrivenEngine = new EventDrivenEngine({
      enableDebug: this.config.enableDebug,
      delayMode: this.config.delayMode,
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: 10,
    });
  }

  /**
   * 回路を評価
   * 循環がある場合はイベント駆動、ない場合は従来のトポロジカルソート
   */
  evaluate(circuit: Circuit): Circuit {
    // 循環依存をチェック
    const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
    
    if (hasCircular) {
      return this.evaluateWithEventDriven(circuit);
    } else {
      // 遅延モードONの場合は常にイベント駆動を使用
      if (this.config.delayMode) {
        return this.evaluateWithEventDriven(circuit);
      }
      // 従来のトポロジカルソート方式
      return this.evaluateWithTopological(circuit);
    }
  }
  
  /**
   * 遅延モードの切り替え
   */
  setDelayMode(enabled: boolean): void {
    this.config.delayMode = enabled;
    this.eventDrivenEngine.setDelayMode(enabled);
  }

  /**
   * イベント駆動シミュレーションで評価
   */
  private evaluateWithEventDriven(circuit: Circuit): Circuit {
    const result = this.eventDrivenEngine.evaluate(circuit);
    
    if (!result.success) {
      console.warn('[HybridEvaluator] イベント駆動シミュレーション失敗:', {
        cycleCount: result.cycleCount,
        hasOscillation: result.hasOscillation,
      });
    }
    
    if (result.debugTrace) {
      console.debug('[HybridEvaluator] デバッグトレース:', result.debugTrace);
    }
    
    // 更新された状態で新しいcircuitオブジェクトを返す（不変性を保つ）
    return {
      gates: circuit.gates.map(g => ({ ...g })),
      wires: circuit.wires.map(w => ({ ...w }))
    };
  }

  /**
   * トポロジカルソートで評価
   */
  private evaluateWithTopological(circuit: Circuit): Circuit {
    const circuitData = {
      gates: circuit.gates,
      wires: circuit.wires,
      metadata: {},
    };
    
    const result = evaluateTopological(circuitData, defaultConfig);
    
    if (result.success) {
      // 成功時は更新された回路を返す
      return result.data.circuit;
    } else {
      console.error('[HybridEvaluator] トポロジカル評価失敗:', result.error);
      return circuit; // エラー時は元の回路を返す
    }
  }

  /**
   * 強制的にイベント駆動モードを使用
   */
  forceEventDriven(enabled: boolean): void {
    this.useEventDriven = enabled;
  }

  /**
   * 現在の評価モードを取得
   */
  getCurrentMode(circuit: Circuit): 'event-driven' | 'topological' {
    if (this.useEventDriven) {
      return 'event-driven';
    }
    return CircuitAnalyzer.hasCircularDependency(circuit) ? 'event-driven' : 'topological';
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
    };
  }
}