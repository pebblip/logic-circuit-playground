import { Gate, Wire, GateType } from '../types/circuit';

// ゲートのロジックを評価
export function evaluateGate(gate: Gate, inputs: boolean[]): boolean {
  switch (gate.type) {
    case 'INPUT':
      return gate.output;
    
    case 'OUTPUT':
      return inputs[0] || false;
    
    case 'AND':
      return inputs.length === 2 && inputs[0] && inputs[1];
    
    case 'OR':
      return inputs.some(input => input);
    
    case 'NOT':
      return !inputs[0];
    
    case 'XOR':
      return inputs.length === 2 && inputs[0] !== inputs[1];
    
    case 'NAND':
      return !(inputs.length === 2 && inputs[0] && inputs[1]);
    
    case 'NOR':
      return !inputs.some(input => input);
    
    default:
      return false;
  }
}

// 回路全体を評価
export function evaluateCircuit(gates: Gate[], wires: Wire[]): { gates: Gate[], wires: Wire[] } {
  // ゲートをコピー（immutability）
  const updatedGates = gates.map(gate => ({ ...gate }));
  const updatedWires = wires.map(wire => ({ ...wire }));
  
  // ゲートの出力を計算するための依存関係グラフを構築
  const gateInputs = new Map<string, boolean[]>();
  const gateOutputConnections = new Map<string, { wireId: string, toGateId: string, toPinIndex: number }[]>();
  
  // 各ゲートの入力配列を初期化
  updatedGates.forEach(gate => {
    const inputCount = gate.type === 'NOT' || gate.type === 'OUTPUT' ? 1 : 2;
    gateInputs.set(gate.id, new Array(inputCount).fill(false));
    gateOutputConnections.set(gate.id, []);
  });
  
  // ワイヤーの接続情報を解析
  updatedWires.forEach(wire => {
    const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
    const toGate = updatedGates.find(g => g.id === wire.to.gateId);
    
    if (fromGate && toGate) {
      // 出力側のゲートに接続情報を追加
      const connections = gateOutputConnections.get(fromGate.id) || [];
      connections.push({
        wireId: wire.id,
        toGateId: toGate.id,
        toPinIndex: wire.to.pinIndex
      });
      gateOutputConnections.set(fromGate.id, connections);
    }
  });
  
  // トポロジカルソートで評価順序を決定
  const visited = new Set<string>();
  const evaluationOrder: string[] = [];
  
  function visit(gateId: string) {
    if (visited.has(gateId)) return;
    visited.add(gateId);
    
    // このゲートに入力を提供するゲートを先に訪問
    updatedWires.forEach(wire => {
      if (wire.to.gateId === gateId) {
        visit(wire.from.gateId);
      }
    });
    
    evaluationOrder.push(gateId);
  }
  
  // すべてのゲートを訪問
  updatedGates.forEach(gate => visit(gate.id));
  
  // 評価順序に従ってゲートを評価
  evaluationOrder.forEach(gateId => {
    const gate = updatedGates.find(g => g.id === gateId);
    if (!gate) return;
    
    // このゲートへの入力を収集
    const inputs = gateInputs.get(gateId) || [];
    updatedWires.forEach(wire => {
      if (wire.to.gateId === gateId) {
        const fromGate = updatedGates.find(g => g.id === wire.from.gateId);
        if (fromGate) {
          inputs[wire.to.pinIndex] = fromGate.output;
        }
      }
    });
    
    // ゲートを評価
    if (gate.type !== 'INPUT') {
      gate.output = evaluateGate(gate, inputs);
    }
    
    // すべてのゲートで入力状態を保存（表示用）
    if (gate.type !== 'INPUT') {
      gate.inputs = inputs.map(input => input ? '1' : '');
    }
    
    // このゲートから出ているワイヤーの状態を更新
    const connections = gateOutputConnections.get(gateId) || [];
    connections.forEach(conn => {
      const wire = updatedWires.find(w => w.id === conn.wireId);
      if (wire) {
        wire.isActive = gate.output;
      }
    });
  });
  
  return { gates: updatedGates, wires: updatedWires };
}