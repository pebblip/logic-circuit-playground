/**
 * 統一シミュレーション評価サービスの型定義
 * 全てのシミュレーション機能を統一するための型システム
 */

import type { Circuit } from '../core/types';
import type { Result } from '../core/types';

/**
 * 統一評価設定（大幅に簡素化）
 */
export interface UnifiedEvaluationConfig {
  // デバッグ・ログ設定
  enableDebugLogging: boolean;

  // 遅延モード設定
  delayMode?: boolean;
}

/**
 * 統一評価結果
 */
export interface UnifiedEvaluationResult {
  // 評価済み回路
  circuit: Circuit;

  // 使用された戦略
  strategyUsed: 'PURE_ENGINE';

  // パフォーマンス情報
  performanceInfo: {
    executionTimeMs: number;
    memoryUsageMB?: number;
    cycleCount?: number;
    cacheHit?: boolean;
  };

  // 発振情報
  oscillationInfo?: {
    detected: boolean;
    detectedAt?: number;
    period?: number;
    pattern?: string[];
  };

  // デバッグ情報（有効な場合のみ）
  debugInfo?: {
    strategyReason: string;
    evaluationLogs: string[];
    circularGates: string[];
  };

  // 警告・注意事項
  warnings: string[];
}

/**
 * 評価エラーの種類
 */
export type EvaluationErrorType =
  | 'CIRCUIT_INVALID'
  | 'SIMULATION_TIMEOUT'
  | 'OSCILLATION_DETECTED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'STRATEGY_FAILED'
  | 'UNKNOWN_ERROR';

/**
 * 統一評価エラー
 */
export interface UnifiedEvaluationError {
  type: EvaluationErrorType;
  message: string;
  circuitId?: string;
  gateId?: string;
  originalError?: Error;
  recovery?: {
    suggestedStrategy?: 'PURE_ENGINE';
    suggestedActions: string[];
  };
}

/**
 * デフォルト設定（大幅に簡素化）
 */
export const DEFAULT_UNIFIED_CONFIG: UnifiedEvaluationConfig = {
  enableDebugLogging: false,
  delayMode: false,
};

/**
 * 回路複雑度分析結果
 */
export interface CircuitComplexityAnalysis {
  gateCount: number;
  wireCount: number;
  hasCircularDependency: boolean;
  circularGates: string[];
  maxDepth: number;
  hasClock: boolean;
  hasSequentialElements: boolean;
  recommendedStrategy: 'PURE_ENGINE';
  reasoning: string;
}

/**
 * キャッシュキー生成用の回路ハッシュ
 */
export interface CircuitHash {
  hash: string;
  timestamp: number;
  gateCount: number;
}

/**
 * 統一評価サービスのインターフェース
 */
export interface ICircuitEvaluationService {
  /**
   * 回路を評価
   */
  evaluate(
    circuit: Circuit
  ): Promise<Result<UnifiedEvaluationResult, UnifiedEvaluationError>>;

  /**
   * 回路の複雑度を分析
   */
  analyzeComplexity(circuit: Circuit): CircuitComplexityAnalysis;

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<UnifiedEvaluationConfig>): void;

  /**
   * 現在の設定を取得
   */
  getConfig(): UnifiedEvaluationConfig;

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats(): {
    totalEvaluations: number;
    avgExecutionTime: number;
    strategyUsageStats: Record<'PURE_ENGINE', number>;
  };

  /**
   * キャッシュをクリア
   */
  clearCache(): void;
}
