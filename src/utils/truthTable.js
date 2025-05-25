// 真理値表生成のユーティリティ関数

import { calculateCircuit } from './circuit';

/**
 * 回路から真理値表を生成
 * @param {Array} gates - ゲートの配列
 * @param {Array} connections - 接続の配列
 * @returns {Object} 真理値表データ
 */
export const generateTruthTable = (gates, connections) => {
  // 入力ゲートを抽出（順序を保持）
  const inputGates = gates
    .filter(g => g.type === 'INPUT')
    .sort((a, b) => a.y - b.y); // Y座標でソート（上から下）
  
  // 出力ゲートを抽出
  const outputGates = gates
    .filter(g => g.type === 'OUTPUT')
    .sort((a, b) => a.y - b.y);
  
  // 入力がない場合は空の結果を返す
  if (inputGates.length === 0) {
    return {
      inputs: [],
      outputs: [],
      rows: []
    };
  }
  
  // 入力の全組み合わせを生成
  const inputCombinations = generateInputCombinations(inputGates.length);
  
  // 各組み合わせで回路を計算
  const rows = inputCombinations.map(combination => {
    // 入力値を設定
    const modifiedGates = gates.map(gate => {
      if (gate.type === 'INPUT') {
        const inputIndex = inputGates.findIndex(g => g.id === gate.id);
        return { ...gate, value: combination[inputIndex] };
      }
      return gate;
    });
    
    // 回路を計算
    const simulation = calculateCircuit(modifiedGates, connections);
    
    // 出力値を取得
    const outputValues = outputGates.map(gate => {
      const value = simulation[gate.id];
      return value !== undefined ? value : false;
    });
    
    // その他の中間ゲートの値も取得（デバッグ用）
    const intermediateValues = {};
    gates.forEach(gate => {
      if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT' && gate.type !== 'CLOCK') {
        const value = simulation[gate.id];
        if (value !== undefined) {
          intermediateValues[gate.id] = value;
        }
        // 複数出力ゲートの場合
        if (gate.outputs > 1) {
          for (let i = 1; i < gate.outputs; i++) {
            const key = `${gate.id}_out${i}`;
            if (simulation[key] !== undefined) {
              intermediateValues[key] = simulation[key];
            }
          }
        }
      }
    });
    
    return {
      inputs: combination,
      outputs: outputValues,
      intermediates: intermediateValues
    };
  });
  
  return {
    inputs: inputGates.map((g, i) => ({
      id: g.id,
      name: `IN${i + 1}`
    })),
    outputs: outputGates.map((g, i) => ({
      id: g.id,
      name: `OUT${i + 1}`
    })),
    rows
  };
};

/**
 * 入力の全組み合わせを生成
 * @param {number} numInputs - 入力数
 * @returns {Array} 0/1の組み合わせ配列
 */
const generateInputCombinations = (numInputs) => {
  const combinations = [];
  const totalCombinations = Math.pow(2, numInputs);
  
  for (let i = 0; i < totalCombinations; i++) {
    const combination = [];
    for (let j = numInputs - 1; j >= 0; j--) {
      combination.push(Boolean((i >> j) & 1));
    }
    combinations.push(combination);
  }
  
  return combinations;
};

/**
 * 真理値表をCSV形式に変換
 * @param {Object} truthTable - 真理値表データ
 * @returns {string} CSV文字列
 */
export const truthTableToCSV = (truthTable) => {
  const { inputs, outputs, rows } = truthTable;
  
  // ヘッダー行
  const headers = [
    ...inputs.map(input => input.name),
    ...outputs.map(output => output.name)
  ];
  
  // データ行
  const dataRows = rows.map(row => [
    ...row.inputs.map(val => val ? '1' : '0'),
    ...row.outputs.map(val => val ? '1' : '0')
  ]);
  
  // CSV形式に結合
  const csv = [
    headers.join(','),
    ...dataRows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
};

/**
 * CSVファイルをダウンロード
 * @param {string} csv - CSV文字列
 * @param {string} filename - ファイル名
 */
export const downloadCSV = (csv, filename = 'truth_table.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};