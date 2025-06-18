/**
 * 最小限のイベント駆動シミュレーション型定義
 */

import type { Gate, Wire } from '../../../types/circuit';

/**
 * シミュレーション時刻
 * - 整数部: 実時間
 * - 小数部: デルタサイクル
 */
export type SimTime = number;

/**
 * ゲート出力変更イベント
 */
export interface GateEvent {
  time: SimTime;
  gateId: string;
  outputIndex: number; // 複数出力対応
  newValue: boolean;
  causeGateId?: string; // デバッグ用
}

/**
 * ゲートの内部状態
 */
export interface GateState {
  inputs: boolean[];
  outputs: boolean[];
  previousInputs?: boolean[]; // エッジ検出用
  metadata?: Record<string, unknown>;
}

/**
 * 回路の完全な状態
 */
export interface CircuitState {
  gateStates: Map<string, GateState>;
  currentTime: SimTime;
  deltaCount: number;
}

/**
 * シミュレーション設定
 */
export interface SimulationConfig {
  maxDeltaCycles: number; // 無限ループ防止
  convergenceThreshold: number; // 収束判定
  enableDebug: boolean;
  continueOnOscillation?: boolean; // 発振検出後も継続
  oscillationCyclesAfterDetection?: number; // 発振検出後の継続サイクル数
}

/**
 * シミュレーション結果
 */
export interface SimulationResult {
  success: boolean;
  finalState: CircuitState;
  cycleCount: number;
  hasOscillation: boolean;
  oscillationInfo?: {
    detectedAt: number; // 発振検出時のサイクル
    period?: number; // 発振周期
    pattern?: string[]; // 発振パターン
  };
  debugTrace?: DebugTrace[];
}

/**
 * デバッグトレース
 */
export interface DebugTrace {
  time: SimTime;
  event: string;
  details: Record<string, unknown>;
}

/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG: SimulationConfig = {
  maxDeltaCycles: 100,
  convergenceThreshold: 0.001,
  enableDebug: false,
  continueOnOscillation: false,
  oscillationCyclesAfterDetection: 0,
};