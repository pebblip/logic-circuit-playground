// 回路計算関連のユーティリティ関数

import { GATE_TYPES, SIMULATION } from '../constants/circuit';

/**
 * 回路の計算を実行
 * @param {Array} gates - ゲートの配列
 * @param {Array} connections - 接続の配列
 * @returns {Object} 計算結果のシミュレーション状態
 */
export const calculateCircuit = (gates, connections) => {
  const simulation = {};
  
  // 入力とクロックの初期値設定
  gates.forEach(gate => {
    if (gate.type === 'INPUT' || gate.type === 'CLOCK') {
      simulation[gate.id] = gate.value;
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
        
        if (inputConnections.length === gateInfo.inputs && gateInfo.func) {
          const inputValues = inputConnections
            .sort((a, b) => a.toInput - b.toInput)
            .map(c => simulation[c.from]);
          
          if (inputValues.every(v => v !== undefined)) {
            const result = gateInfo.func(...inputValues);
            if (simulation[gate.id] !== result) {
              simulation[gate.id] = result;
              changed = true;
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

  return {
    id: Date.now() + Math.random(), // より確実なユニークID
    type,
    x,
    y,
    inputs: Array(gateInfo.inputs).fill(null),
    outputs: Array(gateInfo.outputs).fill(null),
    value: type === 'INPUT' ? true : type === 'CLOCK' ? clockSignal : null,
    memory: gateInfo.hasMemory ? {} : null
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