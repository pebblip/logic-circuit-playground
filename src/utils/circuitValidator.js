// 回路検証ユーティリティ

import { calculateCircuit } from './circuit';
import { GATE_TYPES } from '../constants/circuit';

/**
 * 回路が期待される動作をするか検証
 * @param {Array} gates - ゲートの配列
 * @param {Array} connections - 接続の配列
 * @param {string} targetBehavior - 期待される動作（'NAND', 'NOR', 'XOR'など）
 * @returns {Object} 検証結果
 */
export const validateCircuitBehavior = (gates, connections, targetBehavior) => {
  const inputs = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y);
  const outputs = gates.filter(g => g.type === 'OUTPUT');
  
  // 入出力数の確認
  const expectedIO = getExpectedIO(targetBehavior);
  if (inputs.length !== expectedIO.inputs || outputs.length !== expectedIO.outputs) {
    return {
      isValid: false,
      message: `入力${expectedIO.inputs}個、出力${expectedIO.outputs}個が必要です`
    };
  }
  
  // 真理値表の生成と比較
  const truthTable = generateTruthTable(gates, connections, inputs, outputs);
  const expectedTable = getExpectedTruthTable(targetBehavior);
  
  const isValid = compareTruthTables(truthTable, expectedTable);
  
  return {
    isValid,
    message: isValid ? '正しく動作しています！' : '期待される動作と異なります',
    actualTable: truthTable,
    expectedTable
  };
};

/**
 * 真理値表を生成
 */
const generateTruthTable = (gates, connections, inputs, outputs) => {
  const table = [];
  const inputCount = inputs.length;
  const rowCount = Math.pow(2, inputCount);
  
  for (let i = 0; i < rowCount; i++) {
    // 入力値を設定
    const inputValues = [];
    for (let j = 0; j < inputCount; j++) {
      const value = Boolean((i >> (inputCount - 1 - j)) & 1);
      inputs[j].value = value;
      inputValues.push(value);
    }
    
    // 回路を計算
    const simulation = calculateCircuit(gates, connections);
    
    // 出力値を取得
    const outputValues = outputs.map(output => simulation[output.id] || false);
    
    table.push({
      inputs: inputValues,
      outputs: outputValues
    });
  }
  
  return table;
};

/**
 * 期待される入出力数を取得
 */
const getExpectedIO = (targetBehavior) => {
  const ioMap = {
    'NAND': { inputs: 2, outputs: 1 },
    'NOR': { inputs: 2, outputs: 1 },
    'XOR': { inputs: 2, outputs: 1 },
    'SR_LATCH': { inputs: 2, outputs: 2 },
    'D_FF': { inputs: 2, outputs: 2 },
    'HALF_ADDER': { inputs: 2, outputs: 2 },
    'FULL_ADDER': { inputs: 3, outputs: 2 }
  };
  
  return ioMap[targetBehavior] || { inputs: 2, outputs: 1 };
};

/**
 * 期待される真理値表を取得
 */
const getExpectedTruthTable = (targetBehavior) => {
  const tables = {
    'NAND': [
      { inputs: [false, false], outputs: [true] },
      { inputs: [false, true], outputs: [true] },
      { inputs: [true, false], outputs: [true] },
      { inputs: [true, true], outputs: [false] }
    ],
    'NOR': [
      { inputs: [false, false], outputs: [true] },
      { inputs: [false, true], outputs: [false] },
      { inputs: [true, false], outputs: [false] },
      { inputs: [true, true], outputs: [false] }
    ],
    'XOR': [
      { inputs: [false, false], outputs: [false] },
      { inputs: [false, true], outputs: [true] },
      { inputs: [true, false], outputs: [true] },
      { inputs: [true, true], outputs: [false] }
    ],
    'HALF_ADDER': [
      { inputs: [false, false], outputs: [false, false] }, // Sum, Carry
      { inputs: [false, true], outputs: [true, false] },
      { inputs: [true, false], outputs: [true, false] },
      { inputs: [true, true], outputs: [false, true] }
    ],
    'FULL_ADDER': [
      { inputs: [false, false, false], outputs: [false, false] }, // A, B, Cin -> Sum, Cout
      { inputs: [false, false, true], outputs: [true, false] },
      { inputs: [false, true, false], outputs: [true, false] },
      { inputs: [false, true, true], outputs: [false, true] },
      { inputs: [true, false, false], outputs: [true, false] },
      { inputs: [true, false, true], outputs: [false, true] },
      { inputs: [true, true, false], outputs: [false, true] },
      { inputs: [true, true, true], outputs: [true, true] }
    ]
  };
  
  return tables[targetBehavior] || [];
};

/**
 * 真理値表を比較
 */
const compareTruthTables = (actual, expected) => {
  if (actual.length !== expected.length) return false;
  
  return actual.every((row, i) => {
    const expectedRow = expected[i];
    
    // 入力値が一致するか確認
    const inputsMatch = row.inputs.every((val, j) => val === expectedRow.inputs[j]);
    if (!inputsMatch) return false;
    
    // 出力値が一致するか確認
    return row.outputs.every((val, j) => val === expectedRow.outputs[j]);
  });
};

/**
 * SR Latchの動作を検証（状態保持を考慮）
 */
export const validateSRLatch = (gates, connections) => {
  const inputs = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y);
  const outputs = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.y - b.y);
  
  if (inputs.length !== 2 || outputs.length !== 2) {
    return {
      isValid: false,
      message: 'SRラッチには2つの入力（S, R）と2つの出力（Q, Q̄）が必要です'
    };
  }
  
  // テストケース
  const testCases = [
    { S: false, R: false, description: '保持状態' },
    { S: true, R: false, description: 'セット' },
    { S: false, R: false, description: 'セット後の保持' },
    { S: false, R: true, description: 'リセット' },
    { S: false, R: false, description: 'リセット後の保持' }
  ];
  
  let previousQ = null;
  let isValid = true;
  const results = [];
  
  for (const testCase of testCases) {
    inputs[0].value = testCase.S; // S入力
    inputs[1].value = testCase.R; // R入力
    
    const simulation = calculateCircuit(gates, connections);
    const Q = simulation[outputs[0].id];
    const Qbar = simulation[outputs[1].id];
    
    // 検証
    if (testCase.S && !testCase.R) {
      // セット時: Q=1, Q̄=0
      if (Q !== true || Qbar !== false) isValid = false;
    } else if (!testCase.S && testCase.R) {
      // リセット時: Q=0, Q̄=1
      if (Q !== false || Qbar !== true) isValid = false;
    } else if (!testCase.S && !testCase.R && previousQ !== null) {
      // 保持時: 前の状態を維持
      if (Q !== previousQ) isValid = false;
    }
    
    // Q と Q̄ が相補的であることを確認
    if (Q === Qbar) isValid = false;
    
    results.push({
      ...testCase,
      Q,
      Qbar,
      valid: Q !== Qbar
    });
    
    previousQ = Q;
  }
  
  return {
    isValid,
    message: isValid ? 'SRラッチが正しく動作しています！' : 'SRラッチの動作が正しくありません',
    testResults: results
  };
};