import React, { useState, useEffect } from 'react';

/**
 * チャレンジシステム
 * 段階的な問題で論理回路を学習
 */
const ChallengeSystem = ({ gates, connections, onComplete }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // チャレンジ問題の定義
  const challenges = [
    {
      id: 'simple-connection',
      title: 'シンプルな接続',
      description: '入力と出力を接続して、信号を伝えてみましょう。',
      truthTable: [
        { input: [0], output: 0 },
        { input: [1], output: 1 }
      ],
      hint: '入力ゲートの出力端子から出力ゲートの入力端子へドラッグして接続します。',
      requiredGates: ['INPUT', 'OUTPUT'],
      maxGates: 2
    },
    {
      id: 'not-gate',
      title: 'NOT回路',
      description: '入力を反転させる回路を作ってください。',
      truthTable: [
        { input: [0], output: 1 },
        { input: [1], output: 0 }
      ],
      hint: 'NOTゲートは入力を反転させます。0→1、1→0になります。',
      requiredGates: ['INPUT', 'NOT', 'OUTPUT'],
      maxGates: 3
    },
    {
      id: 'and-gate',
      title: 'AND回路',
      description: '2つの入力が両方とも1の時だけ出力が1になる回路を作ってください。',
      truthTable: [
        { input: [0, 0], output: 0 },
        { input: [0, 1], output: 0 },
        { input: [1, 0], output: 0 },
        { input: [1, 1], output: 1 }
      ],
      hint: 'ANDゲートは全ての入力が1の時だけ出力が1になります。',
      requiredGates: ['INPUT', 'INPUT', 'AND', 'OUTPUT'],
      maxGates: 4
    },
    {
      id: 'or-gate',
      title: 'OR回路',
      description: '少なくとも1つの入力が1の時に出力が1になる回路を作ってください。',
      truthTable: [
        { input: [0, 0], output: 0 },
        { input: [0, 1], output: 1 },
        { input: [1, 0], output: 1 },
        { input: [1, 1], output: 1 }
      ],
      hint: 'ORゲートは入力のうち1つでも1なら出力が1になります。',
      requiredGates: ['INPUT', 'INPUT', 'OR', 'OUTPUT'],
      maxGates: 4
    },
    {
      id: 'xor-gate',
      title: 'XOR回路（排他的論理和）',
      description: '2つの入力が異なる時に出力が1になる回路を作ってください。',
      truthTable: [
        { input: [0, 0], output: 0 },
        { input: [0, 1], output: 1 },
        { input: [1, 0], output: 1 },
        { input: [1, 1], output: 0 }
      ],
      hint: 'XORは (A AND NOT B) OR (NOT A AND B) で実現できます。',
      requiredGates: null, // 自由に使える
      maxGates: 10
    }
  ];

  const challenge = challenges[currentChallenge];

  // 回路の検証
  const verifyCircuit = () => {
    // 入力ゲートと出力ゲートを見つける
    const inputGates = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y);
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length !== challenge.truthTable[0].input.length) {
      return { success: false, message: `入力ゲートは${challenge.truthTable[0].input.length}個必要です` };
    }

    if (outputGates.length !== 1) {
      return { success: false, message: '出力ゲートは1個必要です' };
    }

    // 真理値表の全パターンをテスト
    for (const row of challenge.truthTable) {
      // 入力値を設定（シミュレーションを模擬）
      const testGates = gates.map(g => ({
        ...g,
        value: g.type === 'INPUT' ? 
          row.input[inputGates.findIndex(ig => ig.id === g.id)] === 1 : 
          g.value
      }));

      // シミュレーション実行（簡易版）
      const result = simulateCircuit(testGates, connections);
      
      const outputValue = result[outputGates[0].id] ? 1 : 0;
      if (outputValue !== row.output) {
        return { 
          success: false, 
          message: `入力 ${row.input.join(', ')} の時、出力は ${row.output} であるべきですが、${outputValue} になっています` 
        };
      }
    }

    return { success: true, message: '正解です！' };
  };

  // 簡易シミュレーション
  const simulateCircuit = (testGates, testConnections) => {
    const results = {};
    
    // 入力ゲートの値を設定
    testGates.forEach(gate => {
      if (gate.type === 'INPUT') {
        results[gate.id] = gate.value;
      }
    });

    // 反復計算
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      testGates.forEach(gate => {
        if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
        
        const inputs = testConnections
          .filter(c => c.to === gate.id)
          .map(c => results[c.from])
          .filter(v => v !== undefined);

        let newValue = undefined;
        
        switch (gate.type) {
          case 'AND':
            if (inputs.length >= 2) newValue = inputs.every(v => v);
            break;
          case 'OR':
            if (inputs.length >= 1) newValue = inputs.some(v => v);
            break;
          case 'NOT':
            if (inputs.length >= 1) newValue = !inputs[0];
            break;
          case 'OUTPUT':
            if (inputs.length >= 1) newValue = inputs[0];
            break;
        }
        
        if (newValue !== undefined) {
          results[gate.id] = newValue;
          changed = true;
        }
      });
    }
    
    return results;
  };

  // チェックボタンクリック時
  const handleCheck = () => {
    const result = verifyCircuit();
    if (result.success) {
      setIsCompleted(true);
      setCompletedChallenges([...completedChallenges, challenge.id]);
      
      // 成功エフェクト
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setIsCompleted(false);
          setShowHint(false);
        } else {
          onComplete(completedChallenges.length + 1);
        }
      }, 2000);
    } else {
      // エラーメッセージ表示（実装は別途）
      alert(result.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '350px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid rgba(0, 255, 136, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      zIndex: 100
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#00ff88'
        }}>
          チャレンジ {currentChallenge + 1} / {challenges.length}
        </h3>
        
        {/* 進捗バー */}
        <div style={{
          width: '100px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(completedChallenges.length / challenges.length) * 100}%`,
            height: '100%',
            backgroundColor: '#00ff88',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* 問題タイトル */}
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        {challenge.title}
      </h4>

      {/* 問題説明 */}
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        {challenge.description}
      </p>

      {/* 真理値表 */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          真理値表
        </h5>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr>
              {challenge.truthTable[0].input.map((_, i) => (
                <th key={i} style={{
                  padding: '4px 8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center'
                }}>
                  入力{i + 1}
                </th>
              ))}
              <th style={{
                padding: '4px 8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                出力
              </th>
            </tr>
          </thead>
          <tbody>
            {challenge.truthTable.map((row, i) => (
              <tr key={i}>
                {row.input.map((val, j) => (
                  <td key={j} style={{
                    padding: '4px 8px',
                    textAlign: 'center',
                    color: val ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {val}
                  </td>
                ))}
                <td style={{
                  padding: '4px 8px',
                  textAlign: 'center',
                  color: row.output ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: '600'
                }}>
                  {row.output}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ヒント */}
      {showHint && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            💡 {challenge.hint}
          </p>
        </div>
      )}

      {/* ボタン */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setShowHint(!showHint)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showHint ? 'ヒントを隠す' : 'ヒント'}
        </button>
        
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: isCompleted ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            color: isCompleted ? '#000' : '#00ff88',
            border: `1px solid ${isCompleted ? '#00ff88' : 'rgba(0, 255, 136, 0.5)'}`,
            borderRadius: '6px',
            cursor: isCompleted ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          {isCompleted ? '✓ 正解！' : 'チェック'}
        </button>
      </div>
    </div>
  );
};

export default ChallengeSystem;