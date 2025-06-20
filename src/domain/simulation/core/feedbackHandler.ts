/**
 * フィードバックループを持つ回路の特殊処理
 * LFSRなどの循環回路を正しく評価するための機能
 */

import type { Gate, Wire } from '../../../types/circuit';
import type { Circuit } from './types';
import { isLFSRCircuit, generateLFSREvaluationOrder } from './lfsrHandler';

/**
 * フィードバックループを検出し、適切な評価順序を決定
 */
export function handleFeedbackLoops(
  circuit: Circuit,
  evaluationOrder: string[]
): string[] {
  // D-FFを含む回路の場合、特別な処理が必要
  const hasDFF = circuit.gates.some(g => g.type === 'D-FF');
  if (!hasDFF) {
    return evaluationOrder;
  }

  // フィードバックループの検出
  const feedbackGates = new Set<string>();
  const gateMap = new Map<string, Gate>();
  circuit.gates.forEach(g => gateMap.set(g.id, g));

  // ワイヤー接続を解析
  const connections = new Map<string, Set<string>>();
  circuit.gates.forEach(g => connections.set(g.id, new Set()));
  
  circuit.wires.forEach(wire => {
    const from = wire.from.gateId;
    const to = wire.to.gateId;
    connections.get(from)?.add(to);
  });

  // D-FFから始まるフィードバックループを検出
  circuit.gates.filter(g => g.type === 'D-FF').forEach(dff => {
    const visited = new Set<string>();
    const path: string[] = [];
    
    function findLoop(current: string): boolean {
      if (path.includes(current)) {
        // ループを検出
        const loopStart = path.indexOf(current);
        for (let i = loopStart; i < path.length; i++) {
          feedbackGates.add(path[i]);
        }
        return true;
      }
      
      visited.add(current);
      path.push(current);
      
      const nextGates = connections.get(current) || new Set();
      for (const next of nextGates) {
        if (findLoop(next)) {
          return true;
        }
      }
      
      path.pop();
      return false;
    }
    
    findLoop(dff.id);
  });

  // フィードバックループ内のゲートは2回評価が必要
  if (feedbackGates.size === 0) {
    return evaluationOrder;
  }

  // LFSRの場合は専用の評価順序を使用
  if (isLFSRCircuit(circuit)) {
    return generateLFSREvaluationOrder(circuit, evaluationOrder);
  }
  
  // 通常のフィードバックループの場合
  const newOrder = [...evaluationOrder];
  
  // フィードバックループ内のゲートを元の順序で追加
  evaluationOrder.forEach(gateId => {
    if (feedbackGates.has(gateId)) {
      newOrder.push(gateId);
    }
  });

  return newOrder;
}

/**
 * LFSRの初期状態を保護
 * 最初のクロックサイクルでD-FFの値が失われないようにする
 */
export function protectInitialState(circuit: Circuit): void {
  // 全てのD-FFの初期状態を確実に保持
  circuit.gates.forEach(gate => {
    if (gate.type === 'D-FF') {
      // メタデータが存在しない場合は作成
      if (!gate.metadata) {
        gate.metadata = {};
      }
      
      // qOutputが設定されていない場合は、gate.outputから設定
      if (gate.metadata.qOutput === undefined) {
        gate.metadata.qOutput = gate.output;
        gate.metadata.qBarOutput = !gate.output;
      }
      
      // gate.outputをqOutputに合わせる（重要：初期値を保持）
      gate.output = gate.metadata.qOutput;
      
      // 初回評価フラグを確実に設定
      if (gate.metadata.isFirstEvaluation === undefined) {
        gate.metadata.isFirstEvaluation = true;
      }
      
      // CLOCKの初期状態に合わせてpreviousClockStateを設定
      // これにより初回の誤ったエッジ検出を防ぐ
      if (gate.metadata.previousClockState === undefined) {
        gate.metadata.previousClockState = true; // CLOCKの初期値がtrueの場合
      }
    }
  });
}