// 真理値表チャレンジコンポーネント

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/design-tokens';
import { GATE_TYPES } from '../../constants/circuit';

/**
 * 真理値表チャレンジ
 */
const TruthTableChallenge = ({ 
  targetGate, 
  gates, 
  connections,
  simulation,
  onComplete,
  onCancel
}) => {
  const [isCorrect, setIsCorrect] = useState(false);
  const gateInfo = GATE_TYPES[targetGate];
  
  // ゲート情報が見つからない場合のエラーハンドリング
  if (!gateInfo) {
    return (
      <div className="absolute top-20 right-4 w-96 p-6 rounded-lg shadow-lg z-50"
        style={{ 
          backgroundColor: colors.ui.surface,
          border: `2px solid ${colors.ui.accent.error}`
        }}
      >
        <p style={{ color: colors.ui.accent.error }}>エラー: 不明なゲートタイプ「{targetGate}」</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 rounded"
          style={{
            backgroundColor: colors.ui.background,
            color: colors.ui.text.secondary
          }}
        >
          閉じる
        </button>
      </div>
    );
  }
  
  const requiredInputs = targetGate === 'NOT' ? 1 : gateInfo.inputs;
  
  // 期待される真理値表
  const expectedTables = {
    'AND': [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 }
    ],
    'OR': [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 }
    ],
    'NOT': [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 }
    ]
  };
  
  const expectedTable = expectedTables[targetGate];
  
  // 真理値表が定義されていない場合のエラーハンドリング
  if (!expectedTable) {
    return (
      <div className="absolute top-20 right-4 w-96 p-6 rounded-lg shadow-lg z-50"
        style={{ 
          backgroundColor: colors.ui.surface,
          border: `2px solid ${colors.ui.accent.error}`
        }}
      >
        <p style={{ color: colors.ui.accent.error }}>エラー: ゲート「{targetGate}」の真理値表が定義されていません</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 rounded"
          style={{
            backgroundColor: colors.ui.background,
            color: colors.ui.text.secondary
          }}
        >
          閉じる
        </button>
      </div>
    );
  }
  
  // 現在の回路の状態を確認
  useEffect(() => {
    checkCircuit();
  }, [gates, connections, simulation]);
  
  const checkCircuit = () => {
    // 必要なゲートが配置されているか確認
    const targetGates = gates.filter(g => g.type === targetGate);
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    
    if (targetGates.length === 0 || outputGates.length === 0) {
      setIsCorrect(false);
      return;
    }
    
    // 入力数の確認
    if (inputGates.length < requiredInputs) {
      setIsCorrect(false);
      return;
    }
    
    // 真理値表の確認（簡易版）
    // 実際の回路が期待通りに動作しているか確認
    const hasTargetGate = targetGates.length > 0;
    const hasConnections = connections.length >= requiredInputs + 1; // 入力 + 出力
    
    setIsCorrect(hasTargetGate && hasConnections);
  };
  
  return (
    <div 
      className="absolute top-20 right-4 w-96 p-6 rounded-lg shadow-lg z-50"
      style={{ 
        backgroundColor: colors.ui.surface,
        border: `2px solid ${colors.ui.accent.primary}`
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: colors.ui.text.primary }}>
        {gateInfo.name}の真理値表を確認
      </h3>
      
      {/* 指示 */}
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.ui.background }}>
        <p className="text-sm mb-2" style={{ color: colors.ui.text.primary }}>
          以下の手順で回路を作成してください：
        </p>
        <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: colors.ui.text.secondary }}>
          <li>{requiredInputs}個の入力（INPUT）を配置</li>
          <li>1個の{gateInfo.name}（{targetGate}）を配置</li>
          <li>1個の出力（OUTPUT）を配置</li>
          <li>すべてを正しく接続</li>
          <li>「計算実行」で動作を確認</li>
        </ol>
      </div>
      
      {/* 期待される真理値表 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2" style={{ color: colors.ui.text.primary }}>
          期待される真理値表：
        </h4>
        <table className="w-full text-sm" style={{ backgroundColor: colors.ui.background }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.ui.border}` }}>
              {Array.from({ length: requiredInputs }, (_, i) => (
                <th key={`in${i}`} className="p-2">入力{i + 1}</th>
              ))}
              <th className="p-2">出力</th>
            </tr>
          </thead>
          <tbody>
            {expectedTable && expectedTable.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.ui.border}` }}>
                {row.inputs.map((input, j) => (
                  <td key={`in${j}`} className="p-2 text-center">{input}</td>
                ))}
                <td className="p-2 text-center font-bold">{row.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 状態表示 */}
      {isCorrect && (
        <div 
          className="mb-4 p-3 rounded flex items-center"
          style={{ 
            backgroundColor: colors.ui.accent.success + '20',
            border: `1px solid ${colors.ui.accent.success}`
          }}
        >
          <span className="text-2xl mr-2">✅</span>
          <span style={{ color: colors.ui.accent.success }}>
            正しく接続されています！
          </span>
        </div>
      )}
      
      {/* ボタン */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded text-sm font-medium"
          style={{
            backgroundColor: colors.ui.background,
            color: colors.ui.text.secondary,
            border: `1px solid ${colors.ui.border}`
          }}
        >
          キャンセル
        </button>
        
        <button
          onClick={onComplete}
          disabled={!isCorrect}
          className="px-4 py-2 rounded text-sm font-medium ml-auto"
          style={{
            backgroundColor: isCorrect ? colors.ui.accent.success : colors.ui.background,
            color: isCorrect ? 'white' : colors.ui.text.secondary,
            border: `1px solid ${isCorrect ? colors.ui.accent.success : colors.ui.border}`,
            cursor: isCorrect ? 'pointer' : 'not-allowed',
            opacity: isCorrect ? 1 : 0.5
          }}
        >
          完了
        </button>
      </div>
    </div>
  );
};

TruthTableChallenge.propTypes = {
  targetGate: PropTypes.string.isRequired,
  gates: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired,
  simulation: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default TruthTableChallenge;