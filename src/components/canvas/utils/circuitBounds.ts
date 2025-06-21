/**
 * 回路の境界計算ユーティリティ
 * ギャラリーモード自動フィット機能用
 */

import type { Gate } from '../../../types/circuit';

export interface CircuitBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * ゲートサイズ定数（ゲートレンダラーと同じ値）
 */
const GATE_SIZES = {
  default: { width: 70, height: 50 },
  CLOCK: { width: 60, height: 60 },
  INPUT: { width: 50, height: 40 },
  OUTPUT: { width: 50, height: 40 },
  BINARY_COUNTER: { width: 90, height: 80 },
  'D-FF': { width: 80, height: 60 },
  MUX: { width: 80, height: 80 },
  COMPARATOR: { width: 80, height: 60 },
};

/**
 * ゲートのサイズを取得
 */
function getGateSize(gate: Gate): { width: number; height: number } {
  return GATE_SIZES[gate.type as keyof typeof GATE_SIZES] || GATE_SIZES.default;
}

/**
 * 回路の境界を計算
 */
export function calculateCircuitBounds(gates: Gate[]): CircuitBounds {
  if (gates.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  gates.forEach(gate => {
    const size = getGateSize(gate);
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    // ゲートの境界を計算
    const left = gate.position.x - halfWidth;
    const right = gate.position.x + halfWidth;
    const top = gate.position.y - halfHeight;
    const bottom = gate.position.y + halfHeight;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX,
    centerY,
  };
}

/**
 * 最適なスケール値を計算
 * @param bounds 回路の境界
 * @param containerSize コンテナのサイズ
 * @param padding 余白（ピクセル）
 * @returns 最適なスケール値
 */
export function calculateOptimalScale(
  bounds: CircuitBounds,
  containerSize: { width: number; height: number },
  padding: number = 100
): number {
  if (bounds.width === 0 || bounds.height === 0) {
    return 1;
  }

  // パディングを考慮したスケール計算
  const scaleX = (containerSize.width - padding * 2) / bounds.width;
  const scaleY = (containerSize.height - padding * 2) / bounds.height;
  
  // 最小のスケールを選択（全体が収まるように）
  const scale = Math.min(scaleX, scaleY);
  
  // スケールの範囲を制限（0.2～1.5倍）
  return Math.max(0.2, Math.min(1.5, scale));
}

/**
 * 回路を中央に配置するための変換を計算
 * @param bounds 回路の境界
 * @param containerSize コンテナのサイズ
 * @param scale 適用するスケール
 * @returns パン（移動）値
 */
export function calculateCenteringPan(
  bounds: CircuitBounds,
  containerSize: { width: number; height: number },
  scale: number
): { x: number; y: number } {
  // スケール適用後の回路のサイズ
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  
  // 中央配置のための移動量を計算
  const x = (containerSize.width - scaledWidth) / 2 - bounds.minX * scale;
  const y = (containerSize.height - scaledHeight) / 2 - bounds.minY * scale;
  
  return { x, y };
}