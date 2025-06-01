/**
 * パズルの解答判定ロジック
 */

interface Gate {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: boolean;
}

interface Connection {
  id: string;
  from: string;
  fromOutput: number;
  to: string;
  toInput: number;
}

/**
 * XORゲート作成パズルの解答判定
 * 
 * 正解条件：
 * 1. 2つの入力ゲート（INPUT）がある
 * 2. 1つの出力ゲート（OUTPUT）がある  
 * 3. AND, OR, NOT ゲートのみを使用
 * 4. 全ての入力パターンでXORの真理値表と一致する
 */
export function validateXORChallenge(gates: Gate[], connections: Connection[]): boolean {
  // 基本構造チェック
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  const logicGates = gates.filter(g => ['AND', 'OR', 'NOT'].includes(g.type));
  
  // 必要な構成要素のチェック
  if (inputGates.length !== 2) return false;
  if (outputGates.length !== 1) return false;
  if (logicGates.length === 0) return false;
  
  // 禁止ゲートの使用チェック
  const forbiddenGates = gates.filter(g => 
    !['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'].includes(g.type)
  );
  if (forbiddenGates.length > 0) return false;
  
  // 回路の動作チェック（簡易シミュレーション）
  const truthTable = [
    { a: false, b: false, expected: false },
    { a: false, b: true, expected: true },
    { a: true, b: false, expected: true },
    { a: true, b: true, expected: false }
  ];
  
  for (const testCase of truthTable) {
    const result = simulateCircuit(gates, connections, {
      [inputGates[0].id]: testCase.a,
      [inputGates[1].id]: testCase.b
    });
    
    const outputValue = result[outputGates[0].id];
    if (outputValue !== testCase.expected) {
      return false;
    }
  }
  
  return true;
}

/**
 * 半加算器パズルの解答判定
 * 
 * 正解条件：
 * 1. 2つの入力ゲート（A, B）がある
 * 2. 2つの出力ゲート（Sum, Carry）がある
 * 3. XORとANDゲートを使用
 * 4. 全ての入力パターンで半加算器の真理値表と一致する
 */
export function validateHalfAdder(gates: Gate[], connections: Connection[]): boolean {
  // 基本構造チェック
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length !== 2) return false;
  if (outputGates.length !== 2) return false;
  
  // 半加算器の真理値表
  const truthTable = [
    { a: false, b: false, sum: false, carry: false },
    { a: false, b: true, sum: true, carry: false },
    { a: true, b: false, sum: true, carry: false },
    { a: true, b: true, sum: false, carry: true }
  ];
  
  for (const testCase of truthTable) {
    const result = simulateCircuit(gates, connections, {
      [inputGates[0].id]: testCase.a,
      [inputGates[1].id]: testCase.b
    });
    
    // 出力の順序は不明なので、両パターンを試す
    const output1 = result[outputGates[0].id];
    const output2 = result[outputGates[1].id];
    
    const pattern1Valid = (output1 === testCase.sum && output2 === testCase.carry);
    const pattern2Valid = (output1 === testCase.carry && output2 === testCase.sum);
    
    if (!pattern1Valid && !pattern2Valid) {
      return false;
    }
  }
  
  return true;
}

/**
 * SRラッチパズルの解答判定
 * 
 * 正解条件：
 * 1. 2つの入力ゲート（S, R）がある
 * 2. 2つの出力ゲート（Q, Q'）がある
 * 3. NORゲートまたは同等の回路を使用
 * 4. フィードバックループが存在する
 */
export function validateSRLatch(gates: Gate[], connections: Connection[]): boolean {
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const outputGates = gates.filter(g => g.type === 'OUTPUT');
  
  if (inputGates.length !== 2) return false;
  if (outputGates.length !== 2) return false;
  
  // フィードバックループの存在チェック
  const hasLoop = checkForFeedbackLoop(gates, connections);
  if (!hasLoop) return false;
  
  // SRラッチの基本動作チェック（簡易版）
  const testCases = [
    { s: false, r: false }, // 保持状態
    { s: true, r: false },  // セット
    { s: false, r: true },  // リセット
    // S=1, R=1は未定義状態なので除外
  ];
  
  for (const testCase of testCases) {
    const result = simulateCircuit(gates, connections, {
      [inputGates[0].id]: testCase.s,
      [inputGates[1].id]: testCase.r
    });
    
    const q = result[outputGates[0].id];
    const qBar = result[outputGates[1].id];
    
    // セット状態のチェック
    if (testCase.s && !testCase.r) {
      if (q !== true || qBar !== false) return false;
    }
    
    // リセット状態のチェック
    if (!testCase.s && testCase.r) {
      if (q !== false || qBar !== true) return false;
    }
  }
  
  return true;
}

/**
 * 簡易回路シミュレーター
 * 与えられた入力値で回路をシミュレートし、各ゲートの出力を計算
 */
function simulateCircuit(
  gates: Gate[], 
  connections: Connection[], 
  inputValues: Record<string, boolean>
): Record<string, boolean> {
  const gateValues: Record<string, boolean> = { ...inputValues };
  const gatesByType = new Map<string, Gate[]>();
  
  // ゲートを種類別に分類
  gates.forEach(gate => {
    if (!gatesByType.has(gate.type)) {
      gatesByType.set(gate.type, []);
    }
    gatesByType.get(gate.type)!.push(gate);
  });
  
  // 接続マップを作成
  const inputConnections = new Map<string, Connection[]>();
  connections.forEach(conn => {
    if (!inputConnections.has(conn.to)) {
      inputConnections.set(conn.to, []);
    }
    inputConnections.get(conn.to)!.push(conn);
  });
  
  // 論理ゲートの計算（複数回の反復で収束を試行）
  for (let iteration = 0; iteration < 10; iteration++) {
    let changed = false;
    
    gates.forEach(gate => {
      if (gate.type === 'INPUT') return; // 入力ゲートはスキップ
      
      const inputs = inputConnections.get(gate.id) || [];
      const inputValues = inputs.map(conn => gateValues[conn.from] || false);
      
      let output: boolean;
      
      switch (gate.type) {
        case 'AND':
          output = inputValues.length > 0 ? inputValues.every(v => v) : false;
          break;
        case 'OR':
          output = inputValues.some(v => v);
          break;
        case 'NOT':
          output = inputValues.length > 0 ? !inputValues[0] : false;
          break;
        case 'XOR':
          output = inputValues.filter(v => v).length === 1;
          break;
        case 'NAND':
          output = inputValues.length > 0 ? !inputValues.every(v => v) : true;
          break;
        case 'NOR':
          output = !inputValues.some(v => v);
          break;
        case 'OUTPUT':
          output = inputValues.length > 0 ? inputValues[0] : false;
          break;
        default:
          output = false;
      }
      
      if (gateValues[gate.id] !== output) {
        gateValues[gate.id] = output;
        changed = true;
      }
    });
    
    if (!changed) break; // 収束した
  }
  
  return gateValues;
}

/**
 * フィードバックループの存在チェック
 */
function checkForFeedbackLoop(gates: Gate[], connections: Connection[]): boolean {
  const adjacencyList = new Map<string, string[]>();
  
  // 隣接リストを構築
  gates.forEach(gate => {
    adjacencyList.set(gate.id, []);
  });
  
  connections.forEach(conn => {
    const fromList = adjacencyList.get(conn.from);
    if (fromList) {
      fromList.push(conn.to);
    }
  });
  
  // DFS でサイクル検出
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // サイクル発見
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const gateId of adjacencyList.keys()) {
    if (!visited.has(gateId)) {
      if (dfs(gateId)) return true;
    }
  }
  
  return false;
}

/**
 * パズル解答判定のメイン関数
 */
export function validatePuzzle(
  puzzleId: string, 
  gates: Gate[], 
  connections: Connection[]
): boolean {
  switch (puzzleId) {
    case 'xor-challenge':
      return validateXORChallenge(gates, connections);
    case 'half-adder':
      return validateHalfAdder(gates, connections);
    case 'sr-latch':
      return validateSRLatch(gates, connections);
    default:
      return false;
  }
}