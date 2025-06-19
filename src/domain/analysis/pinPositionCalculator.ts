/**
 * ピン位置計算の統一化
 *
 * CLAUDE.md準拠: 段階的移行によるリスク軽減
 * - 新しいPinConnectionManagerを使用
 * - 既存インターフェースとの後方互換性を保持
 * - Gate.tsxの実際の描画位置と完全に一致
 */

import type { Gate, Position } from '../../types/circuit';
import { getGlobalPinConnectionManager } from '../connection/PinConnectionManager';

// 後方互換性のための型定義（既存コードとの互換性維持）
export interface PinPosition {
  x: number;
  y: number;
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

// グローバルマネージャーインスタンス（遅延初期化）
let manager: ReturnType<typeof getGlobalPinConnectionManager> | null = null;

function getManager() {
  if (!manager) {
    manager = getGlobalPinConnectionManager();
  }
  return manager;
}

/**
 * ゲートの入力ピン位置を計算
 *
 * 新しい統一システムを使用して計算を簡素化
 * CLAUDE.md準拠: 既存機能との互換性を保持
 */
export function getInputPinPosition(gate: Gate, pinIndex: number): Position {
  // 統一システムを使用して計算
  const pinPos = getManager().calculatePinPosition(gate, pinIndex, false);

  // 既存インターフェースに合わせたPosition型で返却
  return {
    x: pinPos.x,
    y: pinPos.y,
  };
}

/**
 * ゲートの出力ピン位置を計算
 *
 * 新しい統一システムを使用して計算を簡素化
 * CLAUDE.md準拠: 既存機能との互換性を保持
 */
export function getOutputPinPosition(
  gate: Gate,
  pinIndex: number = 0
): Position {
  // 統一システムを使用して計算
  const pinPos = getManager().calculatePinPosition(gate, pinIndex, true);

  // 既存インターフェースに合わせたPosition型で返却
  return {
    x: pinPos.x,
    y: pinPos.y,
  };
}

/**
 * ピンインデックスから実際のピン位置を取得
 *
 * 統一システムを使用して直接計算
 * @param gate ゲート
 * @param pinIndex ピンインデックス（負の値は出力ピン）
 * @returns ピン位置とメタデータ
 */
export function getPinPosition(gate: Gate, pinIndex: number): PinPosition {
  const isOutput = pinIndex < 0;
  const actualIndex = isOutput ? Math.abs(pinIndex) - 1 : pinIndex;

  // 統一システムで直接計算（中間関数を省略して効率化）
  return getManager().calculatePinPosition(gate, actualIndex, isOutput);
}

/**
 * ゲートの全ピン位置を取得
 *
 * 統一システムを使用して効率的に計算
 */
export function getAllPinPositions(gate: Gate): PinPosition[] {
  const positions: PinPosition[] = [];
  const mgr = getManager();

  // 入力ピン数を取得
  const inputCount = mgr.getInputPinCount(gate);
  for (let i = 0; i < inputCount; i++) {
    positions.push(mgr.calculatePinPosition(gate, i, false));
  }

  // 出力ピン数を取得
  const outputCount = mgr.getOutputPinCount(gate);
  for (let i = 0; i < outputCount; i++) {
    positions.push(mgr.calculatePinPosition(gate, i, true));
  }

  return positions;
}

/**
 * 2つのピン間の距離を計算
 */
export function getPinDistance(pin1: PinPosition, pin2: PinPosition): number {
  const dx = pin2.x - pin1.x;
  const dy = pin2.y - pin1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 最も近いピンを検索
 *
 * 統一システムを使用して最適化された検索を実行
 */
export function findNearestPin(
  position: Position,
  gates: Gate[],
  options?: {
    excludeGateId?: string;
    onlyInputs?: boolean;
    onlyOutputs?: boolean;
    maxDistance?: number;
  }
): PinPosition | null {
  const mgr = getManager();

  // 統一システムにゲートデータを更新
  mgr.updateGates(gates);

  // オプションを統一システムのフォーマットに変換
  const pinType = options?.onlyInputs
    ? 'input'
    : options?.onlyOutputs
      ? 'output'
      : 'both';

  return mgr.findNearestPin(position, {
    maxDistance: options?.maxDistance,
    excludeGateId: options?.excludeGateId,
    pinType,
  });
}
