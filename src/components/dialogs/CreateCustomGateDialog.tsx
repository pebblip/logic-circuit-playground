import React, { useState, useEffect } from 'react';
import { CustomGateDefinition, CustomGatePin } from '../../types/circuit';
import { IdGenerator } from '../../utils/idGenerator';

interface CreateCustomGateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (definition: CustomGateDefinition) => void;
  initialInputs?: CustomGatePin[];
  initialOutputs?: CustomGatePin[];
  isReadOnly?: boolean; // ピンの追加削除を無効化
}

const ICON_OPTIONS = ['🔧', '➕', '✖️', '⚙️', '🔀', '🔄', '⚡', '🎯', '📊', '🎲'];
const CATEGORY_OPTIONS = [
  { value: 'custom', label: 'カスタム' },
  { value: 'arithmetic', label: '算術' },
  { value: 'memory', label: 'メモリ' },
  { value: 'control', label: '制御' },
  { value: 'logic', label: '論理' },
  { value: 'other', label: 'その他' }
];

export const CreateCustomGateDialog: React.FC<CreateCustomGateDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialInputs = [{ name: 'A', index: 0 }, { name: 'B', index: 1 }],
  initialOutputs = [{ name: 'Y', index: 0 }],
  isReadOnly = false
}) => {
  const [gateName, setGateName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔧');
  const [selectedCategory, setSelectedCategory] = useState('custom');
  // useEffectで初期化されるまで空配列
  const [inputs, setInputs] = useState<CustomGatePin[]>([]);
  const [outputs, setOutputs] = useState<CustomGatePin[]>([]);
  const [gateWidth, setGateWidth] = useState(100);
  const [gateHeight, setGateHeight] = useState(80);

  // 真理値表を自動生成
  const generateTruthTable = (): Record<string, string> => {
    const truthTable: Record<string, string> = {};
    const inputCount = inputs.length;
    const outputCount = outputs.length;
    
    // 全ての入力パターンを生成
    for (let i = 0; i < Math.pow(2, inputCount); i++) {
      const inputPattern = i.toString(2).padStart(inputCount, '0');
      // デフォルトでは全て0（ユーザーが後で編集）
      const outputPattern = '0'.repeat(outputCount);
      truthTable[inputPattern] = outputPattern;
    }
    
    return truthTable;
  };

  // ダイアログが開かれた時に初期値を設定
  useEffect(() => {
    if (isOpen) {
      setInputs(initialInputs);
      setOutputs(initialOutputs);
    }
  }, [isOpen, initialInputs, initialOutputs]);

  // ゲート高さを入力/出力数に応じて調整
  useEffect(() => {
    const maxPins = Math.max(inputs.length, outputs.length);
    // ピンラベルが重ならないよう十分な高さを確保
    const newHeight = Math.max(120, 60 + maxPins * 25);
    setGateHeight(newHeight);
  }, [inputs.length, outputs.length]);

  // ダイアログが閉じられたときに状態をリセット
  useEffect(() => {
    if (!isOpen) {
      // ダイアログが閉じられたら状態をリセット
      setGateName('');
      setDisplayName('');
      setDescription('');
      setSelectedIcon('🔧');
      setSelectedCategory('custom');
      // デフォルト値を直接設定（無限ループ回避）
      setInputs([{ name: 'A', index: 0 }, { name: 'B', index: 1 }]);
      setOutputs([{ name: 'Y', index: 0 }]);
      setGateWidth(100);
      setGateHeight(80);
    }
  }, [isOpen]); // initialInputs, initialOutputsを依存配列から削除

  const handleAddInput = () => {
    const newInput: CustomGatePin = {
      name: String.fromCharCode(65 + inputs.length), // A, B, C, ...
      index: inputs.length
    };
    setInputs([...inputs, newInput]);
  };

  const handleRemoveInput = (index: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const handleUpdateInputName = (index: number, name: string) => {
    const updatedInputs = inputs.map((input, i) => 
      i === index ? { ...input, name } : input
    );
    setInputs(updatedInputs);
  };

  const handleAddOutput = () => {
    console.log('handleAddOutput called, current outputs:', outputs);
    let name;
    if (outputs.length === 0) {
      name = 'Y';
    } else if (outputs.length === 1) {
      name = 'Z';
    } else {
      name = `O${outputs.length - 1}`; // O1, O2, O3...
    }
    
    const newOutput: CustomGatePin = {
      name,
      index: outputs.length
    };
    
    setOutputs(prevOutputs => {
      const updatedOutputs = [...prevOutputs, newOutput];
      console.log('Updated outputs:', updatedOutputs);
      return updatedOutputs;
    });
  };

  const handleRemoveOutput = (index: number) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter((_, i) => i !== index));
    }
  };

  const handleUpdateOutputName = (index: number, name: string) => {
    const updatedOutputs = outputs.map((output, i) => 
      i === index ? { ...output, name } : output
    );
    setOutputs(updatedOutputs);
  };

  const handleSave = () => {
    if (!gateName.trim() || !displayName.trim()) {
      alert('ゲート名と表示名を入力してください');
      return;
    }

    const definition: CustomGateDefinition = {
      id: IdGenerator.generateCustomGateId(),
      name: gateName.trim(),
      displayName: displayName.trim(),
      description: description.trim(),
      inputs: inputs.map((input, index) => ({ ...input, index })),
      outputs: outputs.map((output, index) => ({ ...output, index })),
      truthTable: generateTruthTable(),
      icon: selectedIcon,
      category: selectedCategory,
      width: gateWidth,
      height: gateHeight,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(definition);
    
    // 保存後に状態をリセット
    setGateName('');
    setDisplayName('');
    setDescription('');
    setSelectedIcon('🔧');
    setSelectedCategory('custom');
    setInputs([{ name: 'A', index: 0 }, { name: 'B', index: 1 }]);
    setOutputs([{ name: 'Y', index: 0 }]);
    
    onClose();
  };

  const handleCancel = () => {
    // リセット
    setGateName('');
    setDisplayName('');
    setDescription('');
    setSelectedIcon('🔧');
    setSelectedCategory('custom');
    setInputs([{ name: 'A', index: 0 }, { name: 'B', index: 1 }]);
    setOutputs([{ name: 'Y', index: 0 }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="dialog-content" style={{
        width: '700px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        backgroundColor: '#0f1441',
        border: '1px solid rgba(0, 255, 136, 0.5)',
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column' as const
      }}>
        {/* ヘッダーバー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: 'rgba(0, 255, 136, 0.05)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#00ff88'
          }}>
            カスタムゲートの作成
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        
        {/* コンテンツエリア */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto'
        }}>

        {/* 基本情報 */}
        <div style={{ marginBottom: '24px' }}>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
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
                  placeholder="例: HalfAdder"
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
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  表示名 <span style={{ color: '#ff6666' }}>*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例: 半加算器"
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
            </div>

            <div>
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
                  resize: 'vertical' as const
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  アイコン
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}>
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      style={{
                        padding: '8px',
                        backgroundColor: selectedIcon === icon ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${selectedIcon === icon ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'}`,
                        borderRadius: '6px',
                        fontSize: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  カテゴリ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value} style={{ backgroundColor: '#0f1441' }}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 入出力ピン設定 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 入力ピン */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                color: '#00ff88'
              }}>
                入力ピン ({inputs.length})
              </h3>
              {!isReadOnly && (
                <button
                  onClick={handleAddInput}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    border: '1px solid #00ff88',
                    borderRadius: '4px',
                    color: '#00ff88',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + 追加
                </button>
              )}
            </div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              {inputs.map((input, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderRadius: '6px'
                }}>
                  <span style={{
                    minWidth: '20px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={input.name}
                    onChange={(e) => handleUpdateInputName(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  {inputs.length > 1 && !isReadOnly && (
                    <button
                      onClick={() => handleRemoveInput(index)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'rgba(255, 102, 102, 0.2)',
                        border: '1px solid #ff6666',
                        borderRadius: '4px',
                        color: '#ff6666',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 出力ピン */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                color: '#00ff88'
              }}>
                出力ピン ({outputs.length})
              </h3>
              {!isReadOnly && (
                <button
                  onClick={handleAddOutput}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    border: '1px solid #00ff88',
                    borderRadius: '4px',
                    color: '#00ff88',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + 追加
                </button>
              )}
            </div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              {outputs.map((output, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 102, 102, 0.05)',
                  borderRadius: '6px'
                }}>
                  <span style={{
                    minWidth: '20px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={output.name}
                    onChange={(e) => handleUpdateOutputName(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  {outputs.length > 1 && !isReadOnly && (
                    <button
                      onClick={() => handleRemoveOutput(index)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'rgba(255, 102, 102, 0.2)',
                        border: '1px solid #ff6666',
                        borderRadius: '4px',
                        color: '#ff6666',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            color: '#00ff88'
          }}>
            プレビュー
          </h3>
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <svg width={gateWidth + 80} height={gateHeight + 60} viewBox={`0 0 ${gateWidth + 80} ${gateHeight + 60}`}>
              {/* カスタムゲートプレビュー */}
              <g transform={`translate(${(gateWidth + 80) / 2}, ${(gateHeight + 60) / 2})`}>
                {/* 外側境界 */}
                <rect 
                  x={-gateWidth/2 - 2} y={-gateHeight/2 - 2} 
                  width={gateWidth + 4} height={gateHeight + 4} 
                  rx="10" fill="none" stroke="#6633cc" strokeWidth="3" opacity="0.3"
                />
                
                {/* 本体 */}
                <rect 
                  x={-gateWidth/2} y={-gateHeight/2} 
                  width={gateWidth} height={gateHeight} 
                  rx="8" fill="rgba(102, 51, 153, 0.1)" stroke="#6633cc" strokeWidth="2"
                />
                
                {/* 表示名（外側上部） */}
                <text x="0" y={-gateHeight/2 - 15} style={{
                  fontSize: '12px',
                  textAnchor: 'middle',
                  fill: '#00ff88',
                  fontWeight: 600
                }}>
                  {(displayName || 'MyGate').length > 12 ? (displayName || 'MyGate').substring(0, 12) + '...' : (displayName || 'MyGate')}
                </text>
                
                {/* アイコン */}
                <text x="0" y="0" style={{
                  fontSize: '18px',
                  textAnchor: 'middle'
                }}>
                  {selectedIcon}
                </text>
                
                {/* 入力ピン */}
                {inputs.map((input, index) => {
                  const pinCount = inputs.length;
                  const availableHeight = Math.max(40, gateHeight - 80); // より大きなマージン
                  const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
                  const y = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (index * spacing);
                  
                  return (
                    <g key={`input-${index}`}>
                      <circle cx={-gateWidth/2 - 10} cy={y} r="4" fill="#6633cc" />
                      <line x1={-gateWidth/2} y1={y} x2={-gateWidth/2 - 10} y2={y} stroke="#6633cc" strokeWidth="2" />
                      <text x={-gateWidth/2 + 15} y={y + 4} style={{
                        fontSize: '8px',
                        fill: '#999',
                        textAnchor: 'start'
                      }}>
                        {input.name}
                      </text>
                    </g>
                  );
                })}
                
                {/* 出力ピン */}
                {outputs.map((output, index) => {
                  const pinCount = outputs.length;
                  const availableHeight = Math.max(40, gateHeight - 80); // より大きなマージン
                  const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
                  const y = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (index * spacing);
                  
                  return (
                    <g key={`output-${index}`}>
                      <circle cx={gateWidth/2 + 10} cy={y} r="4" fill="#6633cc" />
                      <line x1={gateWidth/2} y1={y} x2={gateWidth/2 + 10} y2={y} stroke="#6633cc" strokeWidth="2" />
                      <text x={gateWidth/2 - 15} y={y + 4} style={{
                        fontSize: '8px',
                        fill: '#999',
                        textAnchor: 'end'
                      }}>
                        {output.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            キャンセル
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            作成
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};