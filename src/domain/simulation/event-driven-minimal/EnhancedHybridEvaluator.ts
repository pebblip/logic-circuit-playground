/**
 * EnhancedHybridEvaluator
 *
 * 旧APIとの互換性のためのラッパークラス
 * 内部的にはCircuitEvaluationServiceを使用
 */

import { CircuitEvaluationService } from '../services/CircuitEvaluationService';
import type { Circuit } from '../core/types';
import type { EvaluatorResult } from '../core/types';

export interface EnhancedHybridEvaluatorConfig {
  enableDebugLogging?: boolean;
  delayMode?: boolean;
}

/**
 * 旧EnhancedHybridEvaluatorとの互換性のためのラッパー
 * 実際の評価はCircuitEvaluationServiceに委譲
 */
export class EnhancedHybridEvaluator {
  private service: CircuitEvaluationService;

  constructor(config: EnhancedHybridEvaluatorConfig = {}) {
    this.service = new CircuitEvaluationService({
      enableDebugLogging: config.enableDebugLogging ?? false,
      delayMode: config.delayMode ?? false,
    });
  }

  /**
   * 回路を評価
   */
  evaluateCircuit(circuit: Circuit): EvaluatorResult {
    return this.service.evaluateCircuit(circuit);
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<EnhancedHybridEvaluatorConfig>): void {
    this.service.updateConfig({
      enableDebugLogging: config.enableDebugLogging,
      delayMode: config.delayMode,
    });
  }
}
