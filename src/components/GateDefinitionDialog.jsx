import React, { useState, useEffect } from 'react';

/**
 * カスタムゲートの入出力定義ダイアログ
 */
const GateDefinitionDialog = ({ gates, connections, onSave, onClose }) => {
  const [gateName, setGateName] = useState('');
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [category, setCategory] = useState('custom');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    // 現在の回路から入力・出力ゲートを自動検出
    const inputGates = gates.filter(g => g.type === 'INPUT').sort((a, b) => a.y - b.y || a.x - b.x);
    const outputGates = gates.filter(g => g.type === 'OUTPUT').sort((a, b) => a.y - b.y || a.x - b.x);
    
    // 入力ピンの初期化
    setInputs(inputGates.map((gate, index) => ({
      id: gate.id,
      name: `IN${index + 1}`,
      position: index
    })));
    
    // 出力ピンの初期化
    setOutputs(outputGates.map((gate, index) => ({
      id: gate.id,
      name: `OUT${index + 1}`,
      position: index
    })));
  }, [gates]);
  
  const handleInputNameChange = (index, name) => {
    const newInputs = [...inputs];
    newInputs[index].name = name;
    setInputs(newInputs);
  };
  
  const handleOutputNameChange = (index, name) => {
    const newOutputs = [...outputs];
    newOutputs[index].name = name;
    setOutputs(newOutputs);
  };
  
  const handleSave = () => {
    if (!gateName.trim()) {
      alert('ゲート名を入力してください');
      return;
    }
    
    if (inputs.length === 0) {
      alert('少なくとも1つの入力が必要です');
      return;
    }
    
    if (outputs.length === 0) {
      alert('少なくとも1つの出力が必要です');
      return;
    }
    
    // 入力・出力名の重複チェック
    const allPinNames = [...inputs.map(i => i.name), ...outputs.map(o => o.name)];
    const uniqueNames = new Set(allPinNames);
    if (uniqueNames.size !== allPinNames.length) {
      alert('ピン名が重複しています');
      return;
    }
    
    onSave({
      name: gateName,
      inputs,
      outputs,
      category,
      description,
      gates, // Include all gates (including INPUT and OUTPUT)
      connections
    });
  };
  
  const categories = [
    { value: 'custom', label: 'カスタム', color: '#00b4d8' },
    { value: 'arithmetic', label: '算術', color: '#ff006e' },
    { value: 'memory', label: 'メモリ', color: '#8338ec' },
    { value: 'control', label: '制御', color: '#fb5607' },
    { value: 'other', label: 'その他', color: '#666' }
  ];
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        backgroundColor: '#0f1441',
        border: '1px solid rgba(0, 255, 136, 0.5)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        overflow: 'auto'
      }}>
        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: '#00ff88'
        }}>
          カスタムゲートの作成
        </h2>
        
        {/* 基本情報 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            ゲート名 <span style={{ color: '#ff6666' }}>*</span>
          </label>
          <input
            type="text"
            value={gateName}
            onChange={(e) => setGateName(e.target.value)}
            placeholder="例: 半加算器、4to1MUX"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>
        
        {/* カテゴリ */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px'
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* 説明 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            説明（オプション）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このゲートの機能を説明..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
        
        {/* 入力ピン */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '500',
            color: '#00ff88'
          }}>
            入力ピン ({inputs.length})
          </h3>
          {inputs.length === 0 ? (
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px'
            }}>
              回路に入力ゲートがありません
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {inputs.map((input, index) => (
                <div
                  key={input.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{
                    width: '30px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px'
                  }}>
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={input.name}
                    onChange={(e) => handleInputNameChange(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#00ff88',
                    opacity: 0.5
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 出力ピン */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '500',
            color: '#00ff88'
          }}>
            出力ピン ({outputs.length})
          </h3>
          {outputs.length === 0 ? (
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px'
            }}>
              回路に出力ゲートがありません
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {outputs.map((output, index) => (
                <div
                  key={output.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6666',
                    opacity: 0.5
                  }} />
                  <input
                    type="text"
                    value={output.name}
                    onChange={(e) => handleOutputNameChange(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <span style={{
                    width: '30px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px'
                  }}>
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* アクションボタン */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              backgroundColor: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateDefinitionDialog;