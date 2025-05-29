import React, { useState, useEffect, CSSProperties } from 'react';
import { GateDefinitionDialogProps } from '../types/ComponentProps';
import { Gate, Connection } from '../types/CircuitTypes';

interface PinDefinition {
  id: string;
  name: string;
  position: number;
}

interface Category {
  value: string;
  label: string;
  color: string;
}

/**
 * カスタムゲートの入出力定義ダイアログ
 */
const GateDefinitionDialog: React.FC<GateDefinitionDialogProps> = ({ gates, connections, onSave, onClose }) => {
  const [gateName, setGateName] = useState('');
  const [inputs, setInputs] = useState<PinDefinition[]>([]);
  const [outputs, setOutputs] = useState<PinDefinition[]>([]);
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
  
  const handleInputNameChange = (index: number, name: string): void => {
    const newInputs = [...inputs];
    newInputs[index].name = name;
    setInputs(newInputs);
  };
  
  const handleOutputNameChange = (index: number, name: string): void => {
    const newOutputs = [...outputs];
    newOutputs[index].name = name;
    setOutputs(newOutputs);
  };
  
  const handleSave = (): void => {
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
      inputs: inputs.map(i => ({ id: i.id, label: i.name })),
      outputs: outputs.map(o => ({ id: o.id, label: o.name })),
      gates, // Include all gates (including INPUT and OUTPUT)
      connections
    });
  };
  
  const categories: Category[] = [
    { value: 'custom', label: 'カスタム', color: '#00b4d8' },
    { value: 'arithmetic', label: '算術', color: '#ff006e' },
    { value: 'memory', label: 'メモリ', color: '#8338ec' },
    { value: 'control', label: '制御', color: '#fb5607' },
    { value: 'other', label: 'その他', color: '#666' }
  ];

  const overlayStyle: CSSProperties = {
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
  };

  const dialogStyle: CSSProperties = {
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    backgroundColor: '#0f1441',
    border: '1px solid rgba(0, 255, 136, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    overflow: 'auto'
  };

  const titleStyle: CSSProperties = {
    margin: '0 0 24px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#00ff88'
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)'
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px'
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    fontSize: '14px',
    resize: 'vertical' as const
  };

  const sectionTitleStyle: CSSProperties = {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '500',
    color: '#00ff88'
  };
  
  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>
          カスタムゲートの作成
        </h2>
        
        {/* 基本情報 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>
            ゲート名 <span style={{ color: '#ff6666' }}>*</span>
          </label>
          <input
            type="text"
            value={gateName}
            onChange={(e) => setGateName(e.target.value)}
            placeholder="例: 半加算器、4to1MUX"
            style={inputStyle}
          />
        </div>
        
        {/* カテゴリ */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
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
          <label style={labelStyle}>
            説明（オプション）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このゲートの機能を説明..."
            rows={3}
            style={textareaStyle}
          />
        </div>
        
        {/* 入力ピン */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={sectionTitleStyle}>
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
                <PinDefinitionRow
                  key={input.id}
                  pin={input}
                  index={index}
                  type="input"
                  onChange={(name) => handleInputNameChange(index, name)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* 出力ピン */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={sectionTitleStyle}>
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
                <PinDefinitionRow
                  key={output.id}
                  pin={output}
                  index={index}
                  type="output"
                  onChange={(name) => handleOutputNameChange(index, name)}
                />
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

// Pin Definition Row Component
interface PinDefinitionRowProps {
  pin: PinDefinition;
  index: number;
  type: 'input' | 'output';
  onChange: (name: string) => void;
}

const PinDefinitionRow: React.FC<PinDefinitionRowProps> = ({ pin, index, type, onChange }) => {
  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px'
  };

  const indexStyle: CSSProperties = {
    width: '30px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px'
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px'
  };

  const indicatorStyle: CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: type === 'input' ? '#00ff88' : '#ff6666',
    opacity: 0.5
  };

  return (
    <div style={rowStyle}>
      {type === 'input' && (
        <span style={indexStyle}>
          #{index + 1}
        </span>
      )}
      {type === 'output' && (
        <div style={indicatorStyle} />
      )}
      <input
        type="text"
        value={pin.name}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
      {type === 'input' && (
        <div style={indicatorStyle} />
      )}
      {type === 'output' && (
        <span style={indexStyle}>
          #{index + 1}
        </span>
      )}
    </div>
  );
};

export default GateDefinitionDialog;