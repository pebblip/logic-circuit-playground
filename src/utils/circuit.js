// 回路計算関連のユーティリティ関数

import { GATE_TYPES, SIMULATION } from '../constants/circuit';

/**
 * SR Latchの計算
 * @param {boolean} S - Set入力
 * @param {boolean} R - Reset入力
 * @param {Object} memory - 現在のメモリ状態
 * @returns {Array} [Q, Q']の出力
 */
const calculateSRLatch = (S, R, memory = {}) => {
  // 初期状態
  let Q = memory.Q !== undefined ? memory.Q : false;
  let Qbar = memory.Qbar !== undefined ? memory.Qbar : true;
  
  // SR Latchのロジック
  if (S && !R) {
    // Set
    Q = true;
    Qbar = false;
  } else if (!S && R) {
    // Reset
    Q = false;
    Qbar = true;
  } else if (S && R) {
    // 禁止状態（両方true）
    Q = true;
    Qbar = true;
  }
  // S=0, R=0の場合は前の状態を保持
  
  // メモリ更新
  memory.Q = Q;
  memory.Qbar = Qbar;
  
  return [Q, Qbar];
};

/**
 * D Flip-Flopの計算
 * @param {boolean} D - Data入力
 * @param {boolean} CLK - Clock入力
 * @param {Object} memory - 現在のメモリ状態
 * @returns {Array} [Q, Q']の出力
 */
const calculateDFlipFlop = (D, CLK, memory = {}) => {
  // 初期状態
  let Q = memory.Q !== undefined ? memory.Q : false;
  let Qbar = memory.Qbar !== undefined ? memory.Qbar : true;
  let prevCLK = memory.prevCLK !== undefined ? memory.prevCLK : false;
  
  // 立ち上がりエッジ検出
  if (!prevCLK && CLK) {
    // クロックの立ち上がりでDの値をラッチ
    Q = D;
    Qbar = !D;
  }
  
  // メモリ更新
  memory.Q = Q;
  memory.Qbar = Qbar;
  memory.prevCLK = CLK;
  
  return [Q, Qbar];
};

/**
 * Half Adderの計算
 * @param {boolean} A - 入力A
 * @param {boolean} B - 入力B
 * @returns {Array} [Sum, Carry]の出力
 */
const calculateHalfAdder = (A, B) => {
  // Sum = A XOR B
  const sum = A !== B;
  // Carry = A AND B
  const carry = A && B;
  
  return [sum, carry];
};

/**
 * Full Adderの計算
 * @param {boolean} A - 入力A
 * @param {boolean} B - 入力B
 * @param {boolean} Cin - キャリー入力
 * @returns {Array} [Sum, Cout]の出力
 */
const calculateFullAdder = (A, B, Cin) => {
  // Sum = A XOR B XOR Cin
  const sum = (A !== B) !== Cin;
  // Cout = (A AND B) OR (B AND Cin) OR (A AND Cin)
  const cout = (A && B) || (B && Cin) || (A && Cin);
  
  return [sum, cout];
};

/**
 * 回路の計算を実行
 * @param {Array} gates - ゲートの配列
 * @param {Array} connections - 接続の配列
 * @returns {Object} 計算結果のシミュレーション状態
 */
export const calculateCircuit = (gates, connections) => {
  const simulation = {};
  const gateMemory = {};
  
  // 入力とクロックの初期値設定、メモリの初期化
  gates.forEach(gate => {
    if (gate.type === 'INPUT' || gate.type === 'CLOCK') {
      simulation[gate.id] = gate.value;
    }
    if (gate.memory) {
      gateMemory[gate.id] = gate.memory;
    }
  });

  // 組み合わせ回路のシミュレーション
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < SIMULATION.MAX_ITERATIONS) {
    changed = false;
    iterations++;

    gates.forEach(gate => {
      if (gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
        const gateInfo = GATE_TYPES[gate.type];
        const inputConnections = connections.filter(c => c.to === gate.id);
        
        if (inputConnections.length === gateInfo.inputs) {
          const inputValues = inputConnections
            .sort((a, b) => a.toInput - b.toInput)
            .map(c => simulation[c.from]);
          
          if (inputValues.every(v => v !== undefined)) {
            let results = [];
            
            // 特殊なゲートの処理
            if (gate.type === 'SR_LATCH') {
              results = calculateSRLatch(inputValues[0], inputValues[1], gateMemory[gate.id]);
            } else if (gate.type === 'D_FF') {
              results = calculateDFlipFlop(inputValues[0], inputValues[1], gateMemory[gate.id]);
            } else if (gate.type === 'HALF_ADDER') {
              results = calculateHalfAdder(inputValues[0], inputValues[1]);
            } else if (gate.type === 'FULL_ADDER') {
              results = calculateFullAdder(inputValues[0], inputValues[1], inputValues[2]);
            } else if (gateInfo.func) {
              // 通常のゲート
              const result = gateInfo.func(...inputValues);
              results = [result];
            }
            
            // 出力値の更新
            if (results.length > 0) {
              if (simulation[gate.id] !== results[0]) {
                simulation[gate.id] = results[0];
                changed = true;
              }
              
              // 複数出力の場合
              for (let i = 1; i < results.length; i++) {
                const outputKey = `${gate.id}_out${i}`;
                if (simulation[outputKey] !== results[i]) {
                  simulation[outputKey] = results[i];
                  changed = true;
                }
              }
            }
          }
        }
      }
    });
  }

  return simulation;
};

/**
 * 新しいゲートオブジェクトを作成
 * @param {string} type - ゲートタイプ
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {boolean} clockSignal - クロック信号の状態
 * @returns {Object} 新しいゲートオブジェクト
 */
export const createGate = (type, x, y, clockSignal = false) => {
  const gateInfo = GATE_TYPES[type];
  if (!gateInfo) return null;

  // メモリの初期化
  let memory = null;
  if (gateInfo.hasMemory) {
    if (type === 'SR_LATCH') {
      memory = { Q: false, Qbar: true };
    } else if (type === 'D_FF') {
      memory = { Q: false, Qbar: true, prevCLK: false };
    } else {
      memory = {};
    }
  }

  return {
    id: Date.now() + Math.random(), // より確実なユニークID
    type,
    x,
    y,
    inputs: Array(gateInfo.inputs).fill(null),
    outputs: Array(gateInfo.outputs).fill(null),
    value: type === 'INPUT' ? true : type === 'CLOCK' ? clockSignal : null,
    memory
  };
};

/**
 * 接続パスのSVGパス文字列を生成
 * @param {number} fromX - 開始X座標
 * @param {number} fromY - 開始Y座標
 * @param {number} toX - 終了X座標
 * @param {number} toY - 終了Y座標
 * @returns {string} SVGパス文字列
 */
export const getConnectionPath = (fromX, fromY, toX, toY) => {
  const midX = (fromX + toX) / 2;
  return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
};

/**
 * ゲートの出力端子のX座標を取得
 * @param {Object} gate - ゲートオブジェクト
 * @param {number} outputIndex - 出力インデックス
 * @returns {number} X座標
 */
export const getGateOutputX = (gate) => {
  return gate.x + 60;
};

/**
 * ゲートの出力端子のY座標を取得
 * @param {Object} gate - ゲートオブジェクト
 * @param {number} outputIndex - 出力インデックス
 * @returns {number} Y座標
 */
export const getGateOutputY = (gate, outputIndex = 0) => {
  const gateInfo = GATE_TYPES[gate.type];
  if (gateInfo.outputs === 1) {
    return gate.y;
  }
  return gate.y - 10 + (outputIndex * 20);
};

/**
 * ゲートの入力端子のX座標を取得
 * @param {Object} gate - ゲートオブジェクト
 * @returns {number} X座標
 */
export const getGateInputX = (gate) => {
  return gate.x - 60;
};

/**
 * ゲートの入力端子のY座標を取得
 * @param {Object} gate - ゲートオブジェクト
 * @param {number} inputIndex - 入力インデックス
 * @returns {number} Y座標
 */
export const getGateInputY = (gate, inputIndex = 0) => {
  const gateInfo = GATE_TYPES[gate.type];
  
  // 3入力のゲート（Full Adder）の場合
  if (gateInfo.inputs === 3) {
    return gate.y - 25 + (inputIndex * 25);
  }
  
  // 通常のゲート
  return gate.y - 20 + (inputIndex * 25);
};

/**
 * ゲート位置の制約を適用
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {Object} canvas - キャンバス設定
 * @returns {Object} 制約適用後の座標
 */
export const constrainGatePosition = (x, y, canvas) => {
  return {
    x: Math.max(canvas.MIN_X, Math.min(canvas.MAX_X, x)),
    y: Math.max(canvas.MIN_Y, Math.min(canvas.MAX_Y, y))
  };
};

/**
 * 利用可能なゲートタイプを取得
 * @param {number} currentLevel - 現在のレベル
 * @param {Object} unlockedLevels - アンロック済みレベル
 * @returns {Array} 利用可能なゲートタイプの配列
 */
export const getAvailableGateTypes = (currentLevel, unlockedLevels) => {
  return Object.entries(GATE_TYPES).filter(([_, info]) => 
    info.level <= currentLevel && unlockedLevels[info.level]
  );
};