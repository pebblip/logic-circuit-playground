import React from 'react';
import type { CustomGatePin } from '@/types/circuit';

interface PinEditorProps {
  inputs: CustomGatePin[];
  outputs: CustomGatePin[];
  onAddInput: () => void;
  onRemoveInput: (index: number) => void;
  onUpdateInputName: (index: number, name: string) => void;
  onAddOutput: () => void;
  onRemoveOutput: (index: number) => void;
  onUpdateOutputName: (index: number, name: string) => void;
  isReadOnly?: boolean;
}

export const PinEditor: React.FC<PinEditorProps> = ({
  inputs,
  outputs,
  onAddInput,
  onRemoveInput,
  onUpdateInputName,
  onAddOutput,
  onRemoveOutput,
  onUpdateOutputName,
  isReadOnly = false,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px',
      }}
    >
      {/* 入力ピン設定 */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              color: '#00ff88',
            }}
          >
            入力ピン ({inputs.length})
          </h3>
          {!isReadOnly && (
            <button
              onClick={onAddInput}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: '#00ff88',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              + 追加
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          {inputs.map((input, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: 'rgba(102, 153, 255, 0.05)',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  minWidth: '20px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                #{index + 1}
              </span>
              <input
                type="text"
                value={input.name}
                onChange={e => onUpdateInputName(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
              {inputs.length > 1 && !isReadOnly && (
                <button
                  onClick={() => onRemoveInput(index)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'rgba(255, 102, 102, 0.2)',
                    border: '1px solid #ff6666',
                    borderRadius: '4px',
                    color: '#ff6666',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 出力ピン設定 */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              color: '#00ff88',
            }}
          >
            出力ピン ({outputs.length})
          </h3>
          {!isReadOnly && (
            <button
              onClick={onAddOutput}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: '#00ff88',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              + 追加
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          {outputs.map((output, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: 'rgba(255, 102, 102, 0.05)',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  minWidth: '20px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                #{index + 1}
              </span>
              <input
                type="text"
                value={output.name}
                onChange={e => onUpdateOutputName(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
              {outputs.length > 1 && !isReadOnly && (
                <button
                  onClick={() => onRemoveOutput(index)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'rgba(255, 102, 102, 0.2)',
                    border: '1px solid #ff6666',
                    borderRadius: '4px',
                    color: '#ff6666',
                    fontSize: '12px',
                    cursor: 'pointer',
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
  );
};
