// ピン位置計算の統一化
// Gate.tsxの実際の描画位置と完全に一致させる

import type { Gate, Position } from '../../types/circuit';
import { PIN_CONFIGS } from '../../types/gates';

export interface PinPosition {
  x: number;
  y: number;
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

/**
 * ゲートの入力ピン位置を計算 (Gate.tsxの実際の描画位置に合わせて修正)
 */
export function getInputPinPosition(gate: Gate, pinIndex: number): Position {
  const { x, y } = gate.position;

  // カスタムゲートの場合を最初に処理
  if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
    const definition = gate.customGateDefinition;
    const width = definition.width || 100;
    const height =
      definition.height ||
      Math.max(
        60,
        Math.max(definition.inputs.length, definition.outputs.length) * 30 + 20
      );
    const halfWidth = width / 2;

    // CustomGateRendererと同じ計算式を使用
    const getInputPinY = (index: number) => {
      const inputCount = definition.inputs.length;
      if (inputCount === 1) return 0;
      const spacing = Math.min(30, (height - 20) / (inputCount - 1));
      return -((inputCount - 1) * spacing) / 2 + index * spacing;
    };

    const pinY = getInputPinY(pinIndex);

    return {
      x: x - halfWidth - 10,
      y: y + pinY,
    };
  }

  // Gate.tsxでの実際の相対座標に基づく計算
  switch (gate.type) {
    case 'OUTPUT':
      // OUTPUT: cx="-30" cy="0"
      return {
        x: x - 30,
        y: y,
      };

    case 'D-FF':
      // D入力: cx="-60" cy="-20", CLK入力: cx="-60" cy="20"
      return {
        x: x - 60,
        y: y + (pinIndex === 0 ? -20 : 20),
      };

    case 'SR-LATCH':
      // S入力とR入力（D-FFと同様の位置）
      return {
        x: x - 60,
        y: y + (pinIndex === 0 ? -20 : 20),
      };

    case 'MUX': {
      // MUXの入力ピン位置（Gate.tsxの実装と一致）
      // A: cx="-60" cy="-25"
      // B: cx="-60" cy="0"
      // S: cx="-60" cy="25"
      const muxPinY = pinIndex === 0 ? -25 : pinIndex === 1 ? 0 : 25;
      return {
        x: x - 60,
        y: y + muxPinY,
      };
    }

    case 'BINARY_COUNTER':
      // CLK入力: 左側中央
      return {
        x: x - 60,
        y: y,
      };

    default: {
      // AND、OR、XOR、NAND、NOR: Gate.tsxの実際のピン位置
      // 入力ピン: cx="-45" cy="-10" (ピン0), cy="10" (ピン1)
      const inputY = gate.type === 'NOT' ? 0 : pinIndex === 0 ? -10 : 10;
      return {
        x: x - 45, // Gate.tsxの実際の入力ピン位置
        y: y + inputY,
      };
    }
  }
}

/**
 * ゲートの出力ピン位置を計算 (Gate.tsxの実際の描画位置に合わせて修正)
 */
export function getOutputPinPosition(
  gate: Gate,
  pinIndex: number = 0
): Position {
  const { x, y } = gate.position;

  // カスタムゲートの場合を最初に処理
  if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
    const definition = gate.customGateDefinition;
    const width = definition.width || 100;
    const height =
      definition.height ||
      Math.max(
        60,
        Math.max(definition.inputs.length, definition.outputs.length) * 30 + 20
      );
    const halfWidth = width / 2;

    // CustomGateRendererと同じ計算式を使用
    const getOutputPinY = (index: number) => {
      const outputCount = definition.outputs.length;
      if (outputCount === 1) return 0;
      const spacing = Math.min(30, (height - 20) / (outputCount - 1));
      return -((outputCount - 1) * spacing) / 2 + index * spacing;
    };

    const pinY = getOutputPinY(pinIndex);

    return {
      x: x + halfWidth + 10,
      y: y + pinY,
    };
  }

  // Gate.tsxでの実際の相対座標に基づく計算
  switch (gate.type) {
    case 'INPUT':
      // INPUT: cx="35" cy="0"
      return {
        x: x + 35,
        y: y,
      };

    case 'CLOCK':
      // CLOCK: cx="55" cy="0"
      return {
        x: x + 55,
        y: y,
      };

    case 'D-FF':
      // Q出力とQ̄出力（実際の位置確認後に修正）
      return {
        x: x + 60, // Gate.tsxの実際の出力ピン位置
        y: y + (pinIndex === 0 ? -20 : 20),
      };

    case 'SR-LATCH': {
      // Q出力とQ̄出力（D-FFと同様）
      return {
        x: x + 60,
        y: y + (pinIndex === 0 ? -20 : 20),
      };
    }

    case 'MUX': {
      // MUX出力 Y: cx="60" cy="0"
      return {
        x: x + 60,
        y: y,
      };
    }

    case 'BINARY_COUNTER': {
      // ビット数に応じて出力ピンを配置
      const bitCount = gate.metadata?.bitCount || 2;
      const spacing = 30;
      const startY = -((bitCount - 1) * spacing) / 2;
      return {
        x: x + 60,
        y: y + startY + pinIndex * spacing,
      };
    }

    default:
      // AND、OR、XOR、NAND、NOR: Gate.tsxの実際の出力ピン位置
      // 出力ピン: cx="45" cy="0"
      return {
        x: x + 45, // Gate.tsxの実際の出力ピン位置
        y: y,
      };
  }
}

/**
 * ピンインデックスから実際のピン位置を取得
 * @param gate ゲート
 * @param pinIndex ピンインデックス（負の値は出力ピン）
 * @returns ピン位置とメタデータ
 */
export function getPinPosition(gate: Gate, pinIndex: number): PinPosition {
  const isOutput = pinIndex < 0;
  const actualIndex = isOutput ? Math.abs(pinIndex) - 1 : pinIndex;

  const position = isOutput
    ? getOutputPinPosition(gate, actualIndex)
    : getInputPinPosition(gate, actualIndex);

  return {
    ...position,
    gateId: gate.id,
    pinIndex,
    isOutput,
  };
}

/**
 * ゲートの全ピン位置を取得
 */
export function getAllPinPositions(gate: Gate): PinPosition[] {
  const positions: PinPosition[] = [];

  // 入力ピン
  const inputCount =
    gate.type === 'CUSTOM' && gate.customGateDefinition
      ? gate.customGateDefinition.inputs.length
      : PIN_CONFIGS[gate.type as keyof typeof PIN_CONFIGS]?.inputs || 0;

  for (let i = 0; i < inputCount; i++) {
    positions.push(getPinPosition(gate, i));
  }

  // 出力ピン
  const outputCount =
    gate.type === 'CUSTOM' && gate.customGateDefinition
      ? gate.customGateDefinition.outputs.length
      : PIN_CONFIGS[gate.type as keyof typeof PIN_CONFIGS]?.outputs || 0;

  for (let i = 0; i < outputCount; i++) {
    positions.push(getPinPosition(gate, -(i + 1)));
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
  let nearestPin: PinPosition | null = null;
  let minDistance = options?.maxDistance ?? Infinity;

  for (const gate of gates) {
    if (options?.excludeGateId && gate.id === options.excludeGateId) {
      continue;
    }

    const pins = getAllPinPositions(gate);

    for (const pin of pins) {
      if (options?.onlyInputs && pin.isOutput) continue;
      if (options?.onlyOutputs && !pin.isOutput) continue;

      const distance = Math.sqrt(
        Math.pow(position.x - pin.x, 2) + Math.pow(position.y - pin.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPin = pin;
      }
    }
  }

  return nearestPin;
}
