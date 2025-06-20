/**
 * D-FFの2フェーズ評価
 * 実際のハードウェアのように、全てのD-FFが同時に入力をサンプリングし、
 * その後で出力を更新する
 */

import type { Gate } from '../../../types/circuit';
import type { Circuit, EvaluationConfig } from './types';

interface DFFSnapshot {
  gateId: string;
  dInput: boolean;
  clkInput: boolean;
  previousClockState: boolean;
  willLatch: boolean;
  newQOutput: boolean;
}

/**
 * 全てのD-FFの入力をスナップショット
 */
export function snapshotDFFInputs(
  circuit: Circuit,
  gateInputValues: Map<string, boolean[]>
): DFFSnapshot[] {
  const snapshots: DFFSnapshot[] = [];
  
  circuit.gates.forEach(gate => {
    if (gate.type === 'D-FF') {
      const inputs = gateInputValues.get(gate.id) || [false, false];
      const d = inputs[0];
      const clk = inputs[1];
      const prevClk = gate.metadata?.previousClockState || false;
      const isFirstEvaluation = gate.metadata?.isFirstEvaluation !== false;
      
      // 立ち上がりエッジ検出
      const isRisingEdge = !prevClk && clk && !isFirstEvaluation;
      
      // 現在のQ出力
      const currentQ = gate.metadata?.qOutput ?? gate.output;
      
      // 新しいQ出力（エッジがあればDをラッチ、なければ現在値を保持）
      const newQ = isRisingEdge ? d : currentQ;
      
      snapshots.push({
        gateId: gate.id,
        dInput: d,
        clkInput: clk,
        previousClockState: prevClk,
        willLatch: isRisingEdge,
        newQOutput: newQ
      });
    }
  });
  
  return snapshots;
}

/**
 * スナップショットに基づいてD-FFを更新
 */
export function updateDFFsFromSnapshots(
  gates: Gate[],
  snapshots: DFFSnapshot[]
): void {
  const snapshotMap = new Map(snapshots.map(s => [s.gateId, s]));
  
  gates.forEach(gate => {
    if (gate.type === 'D-FF') {
      const snapshot = snapshotMap.get(gate.id);
      if (snapshot) {
        // メタデータを更新
        gate.metadata = {
          ...gate.metadata,
          qOutput: snapshot.newQOutput,
          qBarOutput: !snapshot.newQOutput,
          previousClockState: snapshot.clkInput,
          isFirstEvaluation: false
        };
        
        // 出力を更新
        gate.output = snapshot.newQOutput;
        gate.outputs = [snapshot.newQOutput, !snapshot.newQOutput];
        
        // 入力表示を更新
        gate.inputs = [
          snapshot.dInput ? '1' : '',
          snapshot.clkInput ? '1' : ''
        ];
      }
    }
  });
}

/**
 * LFSR回路でD-FFの2フェーズ評価が必要かどうかを判定
 */
export function needsTwoPhaseEvaluation(circuit: Circuit): boolean {
  // D-FFが複数あり、相互に接続されている場合
  const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
  if (dffGates.length < 2) return false;
  
  // D-FF間の接続を確認
  const dffIds = new Set(dffGates.map(g => g.id));
  const hasDFFConnections = circuit.wires.some(wire => 
    dffIds.has(wire.from.gateId) && dffIds.has(wire.to.gateId)
  );
  
  return hasDFFConnections;
}