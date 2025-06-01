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
    
    // 特殊ゲート（今後実装）
    case 'CLOCK':
      // CLOCKゲートは自己生成信号
      if (gate.metadata?.isRunning) {
        const frequency = gate.metadata.frequency || 1;
        const period = 1000 / frequency;
        const now = Date.now();
        const startTime = gate.metadata.startTime || now;
        const elapsed = now - startTime;
        // 周期的な切り替え
        return Math.floor(elapsed / period) % 2 === 1;
      }
      return false;
    
    case 'D-FF':
      // D-FFの実装（立ち上がりエッジでDをキャプチャ）
      if (gate.metadata && inputs.length >= 2) {
        const d = inputs[0];
        const clk = inputs[1];
        const prevClk = gate.metadata.previousClockState || false;
        
        // 立ち上がりエッジ検出
        if (!prevClk && clk) {
          gate.metadata.qOutput = d;
          gate.metadata.qBarOutput = !d;
        }
        
        // 現在のクロック状態を保存
        gate.metadata.previousClockState = clk;
        
        return gate.metadata.qOutput;
      }
      return false;
    
    case 'SR-LATCH':
      // SR-Latchの実装
      if (gate.metadata && inputs.length >= 2) {
        const s = inputs[0]; // Set
        const r = inputs[1]; // Reset
        
        // S=1, R=0 => Q=1
        if (s && !r) {
          gate.metadata.qOutput = true;
          gate.metadata.qBarOutput = false;
        }
        // S=0, R=1 => Q=0
        else if (!s && r) {
          gate.metadata.qOutput = false;
          gate.metadata.qBarOutput = true;
        }
        // S=0, R=0 => 状態保持
        // S=1, R=1 => 不定状態（避けるべき）
        
        return gate.metadata.qOutput;
      }
      return false;
    
    case 'MUX':
      // 2:1 MUXの実装
      if (inputs.length >= 3) {
        const i0 = inputs[0];    // Input 0
        const i1 = inputs[1];    // Input 1
        const select = inputs[2]; // Select
        // S=0 => Y=I0, S=1 => Y=I1
        return select ? i1 : i0;
      }
      return false;
    
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
    let inputCount = 2; // デフォルト
    if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
      inputCount = 1;
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      inputCount = 2;
    } else if (gate.type === 'MUX') {
      inputCount = 3;
    } else if (gate.type === 'CLOCK' || gate.type === 'INPUT') {
      inputCount = 0;
    }
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
    
    // CLOCKゲートの場合、開始時刻を初期化
    if (gate.type === 'CLOCK' && gate.metadata && !gate.metadata.startTime) {
      gate.metadata.startTime = Date.now();
    }
    
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