/**
 * カスタムゲートの遅延計算ユーティリティ
 */

import type { CustomGateDefinition, Gate, Wire } from '../../../types/circuit';
import { DEFAULT_GATE_DELAYS } from '../../../constants/gateDelays';

/**
 * クリティカルパス情報
 */
export interface CriticalPath {
  path: string[]; // ゲートIDのリスト
  totalDelay: number; // 合計遅延（ns）
  inputPin: number; // 開始入力ピン
  outputPin: number; // 終了出力ピン
}

/**
 * カスタムゲートの遅延情報
 */
export interface CustomGateDelayInfo {
  criticalPaths: CriticalPath[]; // 各入力から各出力へのクリティカルパス
  maxDelay: number; // 最大遅延
  avgDelay: number; // 平均遅延
  minDelay: number; // 最小遅延
}

/**
 * カスタムゲートの遅延を計算
 */
export function calculateCustomGateDelay(
  definition: CustomGateDefinition
): CustomGateDelayInfo | null {
  if (!definition.internalCircuit) {
    return null;
  }

  const { gates, wires, inputMappings, outputMappings } =
    definition.internalCircuit;
  const criticalPaths: CriticalPath[] = [];

  // 各入力から各出力へのパスを計算
  for (const [inputPinStr, inputMapping] of Object.entries(inputMappings)) {
    const inputPin = parseInt(inputPinStr);

    for (const [outputPinStr, outputMapping] of Object.entries(
      outputMappings
    )) {
      const outputPin = parseInt(outputPinStr);

      const path = findCriticalPath(
        gates,
        wires,
        inputMapping.gateId,
        outputMapping.gateId
      );

      if (path) {
        criticalPaths.push({
          path: path.gateIds,
          totalDelay: path.delay,
          inputPin,
          outputPin,
        });
      }
    }
  }

  if (criticalPaths.length === 0) {
    return null;
  }

  const delays = criticalPaths.map(p => p.totalDelay);

  return {
    criticalPaths,
    maxDelay: Math.max(...delays),
    avgDelay: delays.reduce((sum, d) => sum + d, 0) / delays.length,
    minDelay: Math.min(...delays),
  };
}

/**
 * グラフ探索によるクリティカルパスの検出
 */
function findCriticalPath(
  gates: Gate[],
  wires: Wire[],
  startGateId: string,
  endGateId: string
): { gateIds: string[]; delay: number } | null {
  // ゲートIDからゲートへのマップ
  const gateMap = new Map<string, Gate>();
  gates.forEach(g => gateMap.set(g.id, g));

  // ゲート間の接続情報を構築
  const connections = new Map<string, Set<string>>();
  wires.forEach(wire => {
    if (!connections.has(wire.from.gateId)) {
      connections.set(wire.from.gateId, new Set());
    }
    connections.get(wire.from.gateId)!.add(wire.to.gateId);
  });

  // ダイクストラ法で最長パス（クリティカルパス）を探索
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const unvisited = new Set(gates.map(g => g.id));

  // 初期化
  gates.forEach(g => {
    distances.set(g.id, g.id === startGateId ? 0 : -Infinity);
  });

  while (unvisited.size > 0) {
    // 未訪問ノードの中で最大距離を持つノードを選択
    let maxNode: string | null = null;
    let maxDist = -Infinity;

    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId)!;
      if (dist > maxDist) {
        maxDist = dist;
        maxNode = nodeId;
      }
    });

    if (!maxNode || maxDist === -Infinity) break;

    unvisited.delete(maxNode);

    // 隣接ノードの距離を更新
    const neighbors = connections.get(maxNode) || new Set();
    neighbors.forEach(neighborId => {
      if (!unvisited.has(neighborId)) return;

      const gate = gateMap.get(maxNode!);
      if (!gate) return;

      const delay = getGateDelay(gate);
      const altDist = distances.get(maxNode!)! + delay;

      if (altDist > distances.get(neighborId)!) {
        distances.set(neighborId, altDist);
        previous.set(neighborId, maxNode!);
      }
    });
  }

  // 終点に到達していない場合
  if (!previous.has(endGateId) && startGateId !== endGateId) {
    return null;
  }

  // パスを再構築
  const path: string[] = [];
  let current = endGateId;

  while (current !== startGateId) {
    path.unshift(current);
    current = previous.get(current)!;
  }
  path.unshift(startGateId);

  // 合計遅延を計算（最後のゲートは除外）
  let totalDelay = 0;
  for (let i = 0; i < path.length; i++) {
    const gate = gateMap.get(path[i])!;
    // 入力ゲートと出力ゲートは遅延に含めない
    if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
      totalDelay += getGateDelay(gate);
    }
  }

  return { gateIds: path, delay: totalDelay };
}

/**
 * ゲートの遅延時間を取得
 */
function getGateDelay(gate: Gate): number {
  // カスタムゲート内のゲートは入力/出力ゲートを含む可能性がある
  if (gate.type === 'INPUT' || gate.type === 'OUTPUT') {
    return 0; // 入出力ゲートは遅延なし
  }

  // タイミング情報がある場合はそれを使用
  if (gate.timing?.propagationDelay !== undefined) {
    return gate.timing.propagationDelay;
  }

  // デフォルト遅延を使用
  return DEFAULT_GATE_DELAYS[gate.type] || 0;
}

/**
 * カスタムゲート定義に推奨遅延を設定
 */
export function setRecommendedDelay(
  definition: CustomGateDefinition
): CustomGateDefinition {
  const delayInfo = calculateCustomGateDelay(definition);

  if (!delayInfo) {
    return definition;
  }

  // Note: CustomGateDefinitionにはtimingプロパティがないため、
  // 実際の使用時はGate型として使用する必要がある
  return definition;
}
