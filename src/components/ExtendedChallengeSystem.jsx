import React, { useState, useEffect } from 'react';

/**
 * 拡張チャレンジシステム（レベル2）
 * - 複合ゲートのチャレンジ
 * - 基本的な組み合わせ回路
 * - デバッグモード付き
 */
const ExtendedChallengeSystem = ({ gates, connections, onComplete, debugMode = false }) => {
  const [currentChallenge, setCurrentChallenge] = useState(debugMode ? 5 : 0);
  const [showHint, setShowHint] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // レベル2のチャレンジ定義
  const challenges = [
    // レベル1（復習）
    {
      id: 'review-xor',
      level: 1,
      title: 'XORゲート（復習）',
      description: '入力が異なる時だけONになる回路を作ってください。',
      truthTable: [
        { inputs: [false, false], output: false },
        { inputs: [false, true], output: true },
        { inputs: [true, false], output: true },
        { inputs: [true, true], output: false },
      ],
      hint: 'AND、OR、NOTゲートを組み合わせて作ることができます。'
    },
    
    // レベル2開始
    {
      id: 'nand-only',
      level: 2,
      title: 'NANDゲートでNOTゲート',
      description: 'NANDゲートだけを使ってNOTゲートと同じ動作をする回路を作ってください。',
      truthTable: [
        { inputs: [false], output: true },
        { inputs: [true], output: false },
      ],
      hint: 'NANDゲートの2つの入力に同じ信号を入れると...',
      requiredGates: ['NAND']
    },
    
    {
      id: 'demorgan-and',
      level: 2,
      title: 'ド・モルガンの法則（AND）',
      description: 'NORゲートとNOTゲートを使ってANDゲートと同じ動作をする回路を作ってください。',
      truthTable: [
        { inputs: [false, false], output: false },
        { inputs: [false, true], output: false },
        { inputs: [true, false], output: false },
        { inputs: [true, true], output: true },
      ],
      hint: 'ド・モルガンの法則: NOT(A OR B) = (NOT A) AND (NOT B)',
      requiredGates: ['NOR', 'NOT']
    },
    
    {
      id: 'half-equality',
      level: 2,
      title: '等価判定回路',
      description: 'XNORゲートを使って、2つの入力が同じ値の時にONになる回路を作ってください。',
      truthTable: [
        { inputs: [false, false], output: true },
        { inputs: [false, true], output: false },
        { inputs: [true, false], output: false },
        { inputs: [true, true], output: true },
      ],
      hint: 'XNORゲートはまさにこの機能を持っています！'
    },
    
    {
      id: 'two-bit-comparator',
      level: 2,
      title: '2ビット比較器（A>B）',
      description: '入力Aが入力Bより大きい時だけONになる回路を作ってください。',
      truthTable: [
        { inputs: [false, false], output: false },
        { inputs: [false, true], output: false },
        { inputs: [true, false], output: true },
        { inputs: [true, true], output: false },
      ],
      hint: 'AがONでBがOFFの時だけONになります。ANDゲートとNOTゲートで作れます。'
    },
    
    {
      id: 'simple-mux',
      level: 2,
      title: '2-to-1マルチプレクサ',
      description: 'S=0の時はA、S=1の時はBを出力する回路を作ってください。\n入力順：A, B, S',
      truthTable: [
        { inputs: [false, false, false], output: false },
        { inputs: [false, true, false], output: false },
        { inputs: [true, false, false], output: true },
        { inputs: [true, true, false], output: true },
        { inputs: [false, false, true], output: false },
        { inputs: [false, true, true], output: true },
        { inputs: [true, false, true], output: false },
        { inputs: [true, true, true], output: true },
      ],
      hint: '(A AND NOT S) OR (B AND S) の形で実現できます。'
    },
    
    {
      id: 'priority-encoder',
      level: 2,
      title: 'プライオリティエンコーダ（2入力）',
      description: '優先度の高い入力（B>A）がONの時、その位置を出力します。\nどちらもOFFなら出力OFF、AのみONなら出力OFF、BがONなら出力ON。',
      truthTable: [
        { inputs: [false, false], output: false },
        { inputs: [true, false], output: false },
        { inputs: [false, true], output: true },
        { inputs: [true, true], output: true },
      ],
      hint: 'Bの値をそのまま出力すれば良いですね。'
    },
    
    {
      id: 'parity-checker',
      level: 2,
      title: 'パリティチェッカー（3入力）',
      description: 'ONの入力が奇数個の時にONを出力する回路を作ってください。',
      truthTable: [
        { inputs: [false, false, false], output: false },
        { inputs: [false, false, true], output: true },
        { inputs: [false, true, false], output: true },
        { inputs: [false, true, true], output: false },
        { inputs: [true, false, false], output: true },
        { inputs: [true, false, true], output: false },
        { inputs: [true, true, false], output: false },
        { inputs: [true, true, true], output: true },
      ],
      hint: 'XORゲートを連鎖させると奇数パリティチェッカーになります。'
    }
  ];

  const currentChallengeData = challenges[currentChallenge];

  // 回路の検証
  const validateCircuit = () => {
    // シミュレーション結果を計算
    const simulationResults = {};
    
    // INPUTゲートの値を設定
    gates.forEach(gate => {
      if (gate.type === 'INPUT') {
        simulationResults[gate.id] = gate.value;
      }
    });
    
    // 反復的に計算
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      gates.forEach(gate => {
        if (gate.type === 'INPUT' || simulationResults[gate.id] !== undefined) return;
        
        const inputConnections = connections.filter(c => c.to === gate.id);
        const inputValues = inputConnections
          .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
          .map(c => {
            const fromGate = gates.find(g => g.id === c.from);
            return fromGate ? simulationResults[fromGate.id] : undefined;
          })
          .filter(v => v !== undefined);

        let newValue = undefined;
        
        switch (gate.type) {
          case 'AND':
            if (inputValues.length >= 2) {
              newValue = inputValues.every(v => v === true);
            }
            break;
          case 'OR':
            if (inputValues.length >= 1) {
              newValue = inputValues.some(v => v === true);
            }
            break;
          case 'NOT':
            if (inputValues.length >= 1) {
              newValue = !inputValues[0];
            }
            break;
          case 'NAND':
            if (inputValues.length >= 2) {
              newValue = !inputValues.every(v => v === true);
            }
            break;
          case 'NOR':
            if (inputValues.length >= 1) {
              newValue = !inputValues.some(v => v === true);
            }
            break;
          case 'XNOR':
            if (inputValues.length >= 2) {
              newValue = inputValues[0] === inputValues[1];
            }
            break;
          case 'OUTPUT':
            if (inputValues.length >= 1) {
              newValue = inputValues[0];
            }
            break;
        }
        
        if (newValue !== undefined && simulationResults[gate.id] !== newValue) {
          simulationResults[gate.id] = newValue;
          changed = true;
        }
      });
    }

    // 入力ゲートと出力ゲートを取得
    const inputGates = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.x - b.x);
    const outputGate = gates.find(g => g.type === 'OUTPUT');
    
    if (!outputGate || inputGates.length !== currentChallengeData.truthTable[0].inputs.length) {
      setValidationResult({
        success: false,
        message: `${currentChallengeData.truthTable[0].inputs.length}個の入力と1個の出力が必要です。`
      });
      return;
    }

    // 真理値表の検証
    let allCorrect = true;
    const results = [];
    
    for (const row of currentChallengeData.truthTable) {
      // 入力値を設定
      inputGates.forEach((gate, index) => {
        gate.value = row.inputs[index];
      });
      
      // 再計算
      const testResults = {};
      gates.forEach(gate => {
        if (gate.type === 'INPUT') {
          testResults[gate.id] = gate.value;
        }
      });
      
      changed = true;
      iterations = 0;
      
      while (changed && iterations < 10) {
        changed = false;
        iterations++;
        
        gates.forEach(gate => {
          if (gate.type === 'INPUT' || testResults[gate.id] !== undefined) return;
          
          const inputConnections = connections.filter(c => c.to === gate.id);
          const inputValues = inputConnections
            .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
            .map(c => {
              const fromGate = gates.find(g => g.id === c.from);
              return fromGate ? testResults[fromGate.id] : undefined;
            })
            .filter(v => v !== undefined);

          let newValue = undefined;
          
          switch (gate.type) {
            case 'AND':
              if (inputValues.length >= 2) {
                newValue = inputValues.every(v => v === true);
              }
              break;
            case 'OR':
              if (inputValues.length >= 1) {
                newValue = inputValues.some(v => v === true);
              }
              break;
            case 'NOT':
              if (inputValues.length >= 1) {
                newValue = !inputValues[0];
              }
              break;
            case 'NAND':
              if (inputValues.length >= 2) {
                newValue = !inputValues.every(v => v === true);
              }
              break;
            case 'NOR':
              if (inputValues.length >= 1) {
                newValue = !inputValues.some(v => v === true);
              }
              break;
            case 'XNOR':
              if (inputValues.length >= 2) {
                newValue = inputValues[0] === inputValues[1];
              }
              break;
            case 'OUTPUT':
              if (inputValues.length >= 1) {
                newValue = inputValues[0];
              }
              break;
          }
          
          if (newValue !== undefined && testResults[gate.id] !== newValue) {
            testResults[gate.id] = newValue;
            changed = true;
          }
        });
      }
      
      const actualOutput = testResults[outputGate.id];
      const isCorrect = actualOutput === row.output;
      
      results.push({
        inputs: row.inputs,
        expected: row.output,
        actual: actualOutput,
        correct: isCorrect
      });
      
      if (!isCorrect) {
        allCorrect = false;
      }
    }
    
    if (allCorrect) {
      setValidationResult({
        success: true,
        message: '素晴らしい！正解です！🎉'
      });
      
      // 完了したチャレンジを記録
      if (!completedChallenges.includes(currentChallenge)) {
        const newCompleted = [...completedChallenges, currentChallenge];
        setCompletedChallenges(newCompleted);
        onComplete(newCompleted.length);
      }
      
      // 3秒後に次のチャレンジへ
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setValidationResult(null);
          setShowHint(false);
        }
      }, 3000);
    } else {
      setValidationResult({
        success: false,
        message: '正しくありません。真理値表を確認してください。',
        results
      });
    }
  };

  // デバッグモード用のチャレンジジャンプ
  const jumpToChallenge = (index) => {
    if (debugMode) {
      setCurrentChallenge(index);
      setValidationResult(null);
      setShowHint(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 255, 136, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      backdropFilter: 'blur(10px)',
      zIndex: 100
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#00ff88',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        チャレンジ {currentChallenge + 1}/{challenges.length}
        {currentChallengeData.level === 2 && (
          <span style={{
            background: 'rgba(255, 204, 0, 0.2)',
            color: '#ffcc00',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            レベル2
          </span>
        )}
      </h3>
      
      {/* デバッグモード用のチャレンジセレクター */}
      {debugMode && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#ff6666', marginBottom: '8px' }}>
            🔧 デバッグモード
          </div>
          <select
            value={currentChallenge}
            onChange={(e) => jumpToChallenge(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {challenges.map((ch, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {ch.title} {completedChallenges.includes(idx) && '✓'}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h4 style={{
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        {currentChallengeData.title}
      </h4>
      
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        lineHeight: '1.6',
        opacity: 0.9,
        whiteSpace: 'pre-line'
      }}>
        {currentChallengeData.description}
      </p>
      
      {/* 必要なゲートの表示 */}
      {currentChallengeData.requiredGates && (
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          background: 'rgba(0, 100, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          使用可能なゲート: {currentChallengeData.requiredGates.join(', ')}
        </div>
      )}
      
      {/* 真理値表 */}
      <div style={{
        marginBottom: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {currentChallengeData.truthTable[0].inputs.map((_, i) => (
                <th key={i} style={{ padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  入力{String.fromCharCode(65 + i)}
                </th>
              ))}
              <th style={{ padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                出力
              </th>
            </tr>
          </thead>
          <tbody>
            {currentChallengeData.truthTable.map((row, idx) => (
              <tr key={idx}>
                {row.inputs.map((input, i) => (
                  <td key={i} style={{ padding: '4px 8px', textAlign: 'center' }}>
                    {input ? '1' : '0'}
                  </td>
                ))}
                <td style={{ 
                  padding: '4px 8px', 
                  textAlign: 'center',
                  fontWeight: '600',
                  color: row.output ? '#00ff88' : '#666'
                }}>
                  {row.output ? '1' : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ヒント */}
      <button
        onClick={() => setShowHint(!showHint)}
        style={{
          marginBottom: '12px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%'
        }}
      >
        {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
      </button>
      
      {showHint && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(255, 204, 0, 0.1)',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#ffcc00'
        }}>
          💡 {currentChallengeData.hint}
        </div>
      )}
      
      {/* 検証結果 */}
      {validationResult && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: validationResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          color: validationResult.success ? '#00ff88' : '#ff6666'
        }}>
          {validationResult.message}
          
          {validationResult.results && (
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              {validationResult.results.filter(r => !r.correct).map((r, idx) => (
                <div key={idx}>
                  入力: {r.inputs.map(i => i ? '1' : '0').join(', ')} → 
                  期待: {r.expected ? '1' : '0'}, 
                  実際: {r.actual ? '1' : '0'} ❌
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* チェックボタン */}
      <button
        onClick={validateCircuit}
        style={{
          width: '100%',
          padding: '12px',
          background: '#00ff88',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        回路をチェック
      </button>
      
      {/* 進捗 */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        gap: '4px'
      }}>
        {challenges.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '4px',
              background: completedChallenges.includes(idx) ? '#00ff88' : 
                         idx === currentChallenge ? 'rgba(0, 255, 136, 0.5)' : 
                         'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              transition: 'background 0.3s',
              cursor: debugMode ? 'pointer' : 'default'
            }}
            onClick={() => debugMode && jumpToChallenge(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExtendedChallengeSystem;