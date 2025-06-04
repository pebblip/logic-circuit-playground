/**
 * 回路シミュレーション - 新API内部実装版
 * 
 * 外部インターフェース: 既存APIと完全に同じ
 * 内部実装: 新APIベースに移行
 * 目的: 既存テスト783個の100%互換性維持
 */

import type { Gate, Wire } from '../../types/circuit';
import { isCustomGate } from '../../types/gates';
import {
  setGateInputValue,
  getGateInputValue,
  booleanArrayToDisplayStates,
} from '../signalConversion';

// レガシーアダプターをインポート
import {
  evaluateGateLegacyAdapter,
  evaluateCircuitLegacyAdapter,
  evaluateCircuitSafeLegacyAdapter,
  measureAdapterPerformance,
  logMemoryUsage
} from './adapter.deprecated';

// ===============================
// 時間プロバイダー（既存インターフェース維持）
// ===============================

export interface TimeProvider {
  getCurrentTime(): number;
}

export const realTimeProvider: TimeProvider = {
  getCurrentTime: () => Date.now()
};

export const createDeterministicTimeProvider = (baseTime: number = 0, incrementMs: number = 100): TimeProvider => {
  let currentTime = baseTime;
  return {
    getCurrentTime: () => {
      const time = currentTime;
      currentTime += incrementMs;
      return time;
    }
  };
};

export const createFixedTimeProvider = (fixedTime: number): TimeProvider => {
  return {
    getCurrentTime: () => fixedTime
  };
};

// ===============================
// デバッグユーティリティ（既存維持）
// ===============================

const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Simulation] ${message}`, data);
    }
  }
};

// ===============================
// エラー型定義（既存互換）
// ===============================

export interface CircuitEvaluationError {
  type: 'INVALID_GATE' | 'INVALID_WIRE' | 'CIRCULAR_DEPENDENCY' | 'MISSING_DEPENDENCY' | 'EVALUATION_ERROR';
  message: string;
  details?: {
    gateId?: string;
    wireId?: string;
    stack?: string[];
  };
}

export interface CircuitEvaluationResult {
  gates: Gate[];
  wires: Wire[];
  errors: CircuitEvaluationError[];
  warnings: string[];
}

// ===============================
// ゲート評価（新API内部実装）
// ===============================

/**
 * ゲート評価（後方互換性用オーバーロード）
 * 内部実装: 新APIベース
 */
export function evaluateGate(
  gate: Gate,
  inputs: boolean[]
): boolean | boolean[];

export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  timeProvider?: TimeProvider
): boolean | boolean[];

export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  timeProvider: TimeProvider = realTimeProvider
): boolean | boolean[] {
  // 非推奨化警告を表示（開発時のみ）
  if (deprecationConfig.enableWarnings) {
    // 関数ごとに1回だけ警告を表示するため、静的フラグを使用
    if (!warningShownMap.has('evaluateGate')) {
      showDeprecationWarning('evaluateGate', 'Use evaluateGateUnified() for type-safe gate evaluation');
      warningShownMap.set('evaluateGate', true);
    }
  }
  
  // 使用統計の記録
  trackLegacyUsage('evaluateGate', `${gate.type}(${gate.id})`);
  
  // 開発時のパフォーマンス監視
  if (process.env.NODE_ENV === 'development') {
    return measureAdapterPerformance(
      () => evaluateGateLegacyAdapter(gate, inputs, timeProvider),
      `evaluateGate_${gate.type}_${gate.id}`
    ).result;
  }
  
  // 新APIベースの実装を使用
  return evaluateGateLegacyAdapter(gate, inputs, timeProvider);
}


// ===============================
// 回路評価（新API内部実装）
// ===============================

/**
 * 回路評価（既存インターフェース維持）
 * 内部実装: 新APIベース
 */
export function evaluateCircuit(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): { gates: Gate[]; wires: Wire[] } {
  // 非推奨化警告を表示（開発時のみ）
  if (deprecationConfig.enableWarnings) {
    if (!warningShownMap.has('evaluateCircuit')) {
      showDeprecationWarning('evaluateCircuit', 'Use evaluateCircuitPure() for type-safe circuit evaluation');
      warningShownMap.set('evaluateCircuit', true);
    }
  }
  
  // 使用統計の記録
  trackLegacyUsage('evaluateCircuit', `${gates.length}gates_${wires.length}wires`);
  
  // 開発時のメモリとパフォーマンス監視
  if (process.env.NODE_ENV === 'development') {
    logMemoryUsage('evaluateCircuit_start');
    
    const result = measureAdapterPerformance(
      () => evaluateCircuitLegacyAdapter(gates, wires, timeProvider),
      `evaluateCircuit_${gates.length}gates_${wires.length}wires`
    );
    
    logMemoryUsage('evaluateCircuit_end');
    debug.log('Circuit evaluation completed', {
      gateCount: gates.length,
      wireCount: wires.length,
      executionTime: result.timeMs
    });
    
    return result.result;
  }
  
  // 新APIベースの実装を使用
  return evaluateCircuitLegacyAdapter(gates, wires, timeProvider);
}


/**
 * 安全な回路評価（既存インターフェース維持）
 * 内部実装: 新APIベース
 */
export function evaluateCircuitSafe(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): CircuitEvaluationResult {
  // 非推奨化警告を表示（開発時のみ）
  if (deprecationConfig.enableWarnings) {
    if (!warningShownMap.has('evaluateCircuitSafe')) {
      showDeprecationWarning('evaluateCircuitSafe', 'Use evaluateCircuitPure() with validation for safe circuit evaluation');
      warningShownMap.set('evaluateCircuitSafe', true);
    }
  }
  
  // 使用統計の記録
  trackLegacyUsage('evaluateCircuitSafe', `${gates.length}gates_${wires.length}wires`);
  
  // 開発時のパフォーマンス監視
  if (process.env.NODE_ENV === 'development') {
    logMemoryUsage('evaluateCircuitSafe_start');
    
    const result = measureAdapterPerformance(
      () => evaluateCircuitSafeLegacyAdapter(gates, wires, timeProvider),
      `evaluateCircuitSafe_${gates.length}gates_${wires.length}wires`
    );
    
    logMemoryUsage('evaluateCircuitSafe_end');
    debug.log('Safe circuit evaluation completed', {
      gateCount: gates.length,
      wireCount: wires.length,
      errorCount: result.result.errors.length,
      warningCount: result.result.warnings.length,
      executionTime: result.timeMs
    });
    
    return result.result;
  }
  
  // 新APIベースの実装を使用
  return evaluateCircuitSafeLegacyAdapter(gates, wires, timeProvider);
}


// ===============================
// 既存ユーティリティ関数（維持）
// ===============================

/**
 * 従来のsignalConversionとの互換性維持
 * これらの関数は既存のまま維持（新APIでは使用しないが、既存コードとの互換性のため）
 */

// 既存のsignalConversion関数へのパススルー
export { setGateInputValue, getGateInputValue, booleanArrayToDisplayStates };


// ===============================
// レガシー関数の非推奨化準備
// ===============================

/**
 * 将来の非推奨化に向けた準備
 * 現在は警告なし、将来的に段階的に警告を追加予定
 */

interface DeprecationConfig {
  enableWarnings: boolean;
  logUsage: boolean;
  trackMetrics: boolean;
}

const deprecationConfig: DeprecationConfig = {
  enableWarnings: process.env.NODE_ENV === 'development', // Phase C: 開発環境で警告を有効化
  logUsage: process.env.NODE_ENV === 'development',
  trackMetrics: process.env.NODE_ENV === 'development'
};

// 警告表示フラグを管理するMap
const warningShownMap = new Map<string, boolean>();

/**
 * 使用状況トラッキング（開発時のみ）
 */
function trackLegacyUsage(functionName: string, context?: string): void {
  if (deprecationConfig.trackMetrics) {
    debug.log(`Legacy API usage: ${functionName}`, { context, timestamp: Date.now() });
  }
}

/**
 * 非推奨化警告の表示
 */
function showDeprecationWarning(functionName: string, migrationGuide?: string): void {
  if (deprecationConfig.enableWarnings) {
    const message = `
⚠️  Legacy API Deprecation Warning ⚠️

The function '${functionName}' is now deprecated and will be removed in v3.0.0.
Please migrate to the new pure API for better type safety and performance.

${migrationGuide || 'Migration Guide: docs/migration-strategy.md'}

🚀 New API Benefits:
✅ Full type safety with Result<T, E> pattern
✅ Immutable operations 
✅ Better error handling
✅ Improved performance

For new code, use:
- import { evaluateGateUnified } from '@domain/simulation/pure/gateEvaluation'
- import { evaluateCircuitPure } from '@domain/simulation/pure/circuitEvaluation'
    `.trim();
    
    console.warn(message);
  }
}

// 使用状況をトラッキング（開発時のみ）
const originalEvaluateGate = evaluateGate;
const originalEvaluateCircuit = evaluateCircuit;
const originalEvaluateCircuitSafe = evaluateCircuitSafe;

// 使用統計収集のためのラッパー（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  // 統計情報を収集するが、関数の動作は変更しない
  const stats = {
    evaluateGate: 0,
    evaluateCircuit: 0,
    evaluateCircuitSafe: 0
  };
  
  // 5秒ごとに統計を出力
  setInterval(() => {
    if (stats.evaluateGate + stats.evaluateCircuit + stats.evaluateCircuitSafe > 0) {
      debug.log('Legacy API usage statistics', stats);
      // カウンターをリセット
      stats.evaluateGate = 0;
      stats.evaluateCircuit = 0;
      stats.evaluateCircuitSafe = 0;
    }
  }, 5000);
}

// ===============================
// 新旧API並行サポート情報
// ===============================

/**
 * 新旧API並行サポート状況
 */
export const API_MIGRATION_INFO = {
  version: '2.0.0-deprecation-start',
  phase: 'C - Legacy API Deprecation & New API Promotion',
  status: 'LEGACY_API_DEPRECATION_STARTED',
  compatibilityLevel: 'FULL_BACKWARD_COMPATIBILITY',
  recommendedAPI: 'pure',
  legacyAPISupported: true,
  deprecationStarted: new Date('2025-01-04').toISOString(),
  estimatedRemovalDate: new Date('2025-03-01').toISOString(),
  documentation: 'docs/migration-strategy.md'
} as const;

/**
 * API情報取得（デバッグ用）
 */
export function getApiInfo(): typeof API_MIGRATION_INFO {
  return API_MIGRATION_INFO;
}

// ===============================
// 型エクスポート（既存互換）
// ===============================

// 既存の型エクスポートを維持
export type { Gate, Wire } from '../../types/circuit';

// ===============================
// 開発者向け新API利用推奨
// ===============================

/**
 * 開発者向け: 新APIの推奨とLegacy API非推奨化通知
 * （本番環境では出力されない）
 */
if (process.env.NODE_ENV === 'development') {
  console.info(`
🚀 NEW API MIGRATION - PHASE C STARTED! 🚀

Legacy APIs are now deprecated and will be removed in v3.0.0.
Migration deadline: ${new Date(API_MIGRATION_INFO.estimatedRemovalDate!).toLocaleDateString()}

RECOMMENDED FOR ALL NEW CODE:
✅ import { evaluateGateUnified } from '@domain/simulation/pure/gateEvaluation'
✅ import { evaluateCircuitPure } from '@domain/simulation/pure/circuitEvaluation'
✅ import { validateCircuit } from '@domain/simulation/pure/validation'

🔥 NEW API BENEFITS:
✅ Complete type safety with Result<T, E> pattern
✅ Immutable operations (no side effects)
✅ Better error handling & debugging
✅ Performance improvements (O(n) vs O(n²))
✅ Tree-shakable and testable

📖 Migration Guide: ${API_MIGRATION_INFO.documentation}

Legacy APIs still work but will show deprecation warnings.
Start your migration today for best results! 🎯
  `.trim());
}