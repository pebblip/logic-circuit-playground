/**
 * 回路の境界計算ユーティリティ
 */

import type { Gate } from '../../../types/circuit';
import { GateFactory } from '../../../models/gates/GateFactory';

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
    const size = GateFactory.getGateSize(gate);
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
