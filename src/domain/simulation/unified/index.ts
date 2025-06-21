/**
 * 統一シミュレーション評価サービス
 * エクスポート定義
 */

export {
  CircuitEvaluationService,
  getGlobalEvaluationService,
  setGlobalEvaluationService,
} from './CircuitEvaluationService';
export type {
  ICircuitEvaluationService,
  UnifiedEvaluationConfig,
  UnifiedEvaluationResult,
  UnifiedEvaluationError,
  CircuitComplexityAnalysis,
  EvaluationErrorType,
} from './types';
export { DEFAULT_UNIFIED_CONFIG } from './types';
