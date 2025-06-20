/**
 * LFSR (Linear Feedback Shift Register) 専用の処理
 * カオス発生器などの疑似乱数生成回路を正しく評価するための機能
 */

import type { Circuit } from './types';

/**
 * LFSR回路かどうかを判定
 */
export function isLFSRCircuit(circuit: Circuit): boolean {
  // XORフィードバックとD-FFチェーンの存在を確認
  const hasXORFeedback = circuit.gates.some(g => g.id === 'xor_feedback' && g.type === 'XOR');
  const hasDFFChain = circuit.gates.filter(g => g.type === 'D-FF' && g.id.startsWith('dff')).length >= 2;
  
  if (!hasXORFeedback || !hasDFFChain) {
    return false;
  }
  
  // フィードバックループの存在を確認
  const xorGate = circuit.gates.find(g => g.id === 'xor_feedback');
  if (!xorGate) return false;
  
  // XORの出力がD-FFに接続されているか確認
  const feedbackWire = circuit.wires.find(w => 
    w.from.gateId === 'xor_feedback' && 
    w.to.gateId.startsWith('dff')
  );
  
  return !!feedbackWire;
}

/**
 * LFSR用の評価順序を生成
 * D-FFの状態を正しく伝播させるため、特別な順序で評価する
 */
export function generateLFSREvaluationOrder(
  circuit: Circuit,
  originalOrder: string[]
): string[] {
  if (!isLFSRCircuit(circuit)) {
    return originalOrder;
  }
  
  // LFSR専用の評価順序を構築
  const newOrder: string[] = [];
  const processedGates = new Set<string>();
  
  // 1. CLOCKを最初に評価
  originalOrder.forEach(gateId => {
    const gate = circuit.gates.find(g => g.id === gateId);
    if (gate && gate.type === 'CLOCK') {
      newOrder.push(gateId);
      processedGates.add(gateId);
    }
  });
  
  // 2. 現在のサイクルでのD-FF評価（クロックエッジ処理）
  // この時点でD-FFは前サイクルのD入力値をラッチ
  const dffIds = originalOrder.filter(gateId => {
    const gate = circuit.gates.find(g => g.id === gateId);
    return gate && gate.type === 'D-FF';
  });
  
  dffIds.forEach(gateId => {
    if (!processedGates.has(gateId)) {
      newOrder.push(gateId);
      processedGates.add(gateId);
    }
  });
  
  // 3. XORゲート（フィードバック計算）
  // D-FFの新しい出力値を使用してフィードバックを計算
  originalOrder.forEach(gateId => {
    const gate = circuit.gates.find(g => g.id === gateId);
    if (gate && gate.type === 'XOR' && !processedGates.has(gateId)) {
      newOrder.push(gateId);
      processedGates.add(gateId);
    }
  });
  
  // 4. その他のゲート（OUTPUT等）
  originalOrder.forEach(gateId => {
    if (!processedGates.has(gateId)) {
      newOrder.push(gateId);
      processedGates.add(gateId);
    }
  });
  
  // 5. D入力の更新を確実にするため、XORのみ再評価
  // D-FFは再評価しない（状態が変わってしまうため）
  if (newOrder.includes('xor_feedback')) {
    newOrder.push('xor_feedback');
  }
  
  return newOrder;
}

/**
 * LFSR初期状態の検証
 * 全て0の状態を避けるため、少なくとも1つのD-FFが1である必要がある
 */
export function validateLFSRInitialState(circuit: Circuit): boolean {
  const dffGates = circuit.gates.filter(g => g.type === 'D-FF' && g.id.startsWith('dff'));
  const hasNonZero = dffGates.some(g => g.output === true || g.metadata?.qOutput === true);
  
  if (!hasNonZero) {
    console.warn('[LFSR] Warning: All D-FFs are initialized to 0. LFSR will not function properly.');
    return false;
  }
  
  return true;
}