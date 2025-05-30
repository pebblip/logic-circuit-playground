import React, { useState } from 'react';
import { CircuitMode } from '../../types/mode';

interface DemoCircuit {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  loadCircuit: () => void;
}

interface DemoCircuitsProps {
  currentMode: CircuitMode;
  onLoadCircuit: (circuitData: any) => void;
  className?: string;
}

// デモ回路の定義
const DEMO_CIRCUITS: DemoCircuit[] = [
  {
    id: 'basic-and',
    name: 'AND ゲートの基本',
    description: '2つの入力とANDゲートを使った最も簡単な回路です',
    difficulty: 'easy',
    tags: ['基本', 'AND'],
    loadCircuit: () => ({
      gates: [
        { id: 'input1', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'input2', type: 'INPUT', x: 100, y: 200, value: false },
        { id: 'and1', type: 'AND', x: 250, y: 150 },
        { id: 'output1', type: 'OUTPUT', x: 400, y: 150 }
      ],
      connections: [
        { from: 'input1', fromOutput: 0, to: 'and1', toInput: 0 },
        { from: 'input2', fromOutput: 0, to: 'and1', toInput: 1 },
        { from: 'and1', fromOutput: 0, to: 'output1', toInput: 0 }
      ]
    })
  },
  {
    id: 'or-not-combo',
    name: 'OR と NOT の組み合わせ',
    description: 'ORゲートの出力をNOTゲートで反転する回路です',
    difficulty: 'easy',
    tags: ['基本', 'OR', 'NOT'],
    loadCircuit: () => ({
      gates: [
        { id: 'input1', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'input2', type: 'INPUT', x: 100, y: 200, value: false },
        { id: 'or1', type: 'OR', x: 250, y: 150 },
        { id: 'not1', type: 'NOT', x: 350, y: 150 },
        { id: 'output1', type: 'OUTPUT', x: 450, y: 150 }
      ],
      connections: [
        { from: 'input1', fromOutput: 0, to: 'or1', toInput: 0 },
        { from: 'input2', fromOutput: 0, to: 'or1', toInput: 1 },
        { from: 'or1', fromOutput: 0, to: 'not1', toInput: 0 },
        { from: 'not1', fromOutput: 0, to: 'output1', toInput: 0 }
      ]
    })
  },
  {
    id: 'xor-from-basic',
    name: 'XOR を基本ゲートで作る',
    description: 'AND, OR, NOT を組み合わせてXORゲートを実現します',
    difficulty: 'medium',
    tags: ['応用', 'XOR', 'パズル'],
    loadCircuit: () => ({
      gates: [
        { id: 'input1', type: 'INPUT', x: 50, y: 100, value: false },
        { id: 'input2', type: 'INPUT', x: 50, y: 250, value: false },
        { id: 'and1', type: 'AND', x: 200, y: 80 },
        { id: 'and2', type: 'AND', x: 200, y: 270 },
        { id: 'not1', type: 'NOT', x: 150, y: 130 },
        { id: 'not2', type: 'NOT', x: 150, y: 220 },
        { id: 'or1', type: 'OR', x: 350, y: 175 },
        { id: 'output1', type: 'OUTPUT', x: 500, y: 175 }
      ],
      connections: [
        // 省略 - 実装時に詳細な接続を追加
      ]
    })
  },
  {
    id: 'half-adder',
    name: '半加算器',
    description: '2つの1ビット数を加算する基本的な算術回路です',
    difficulty: 'medium',
    tags: ['算術', '加算器'],
    loadCircuit: () => ({
      gates: [
        { id: 'a', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'b', type: 'INPUT', x: 100, y: 200, value: false },
        { id: 'xor1', type: 'XOR', x: 250, y: 120 },
        { id: 'and1', type: 'AND', x: 250, y: 200 },
        { id: 'sum', type: 'OUTPUT', x: 400, y: 120 },
        { id: 'carry', type: 'OUTPUT', x: 400, y: 200 }
      ],
      connections: [
        { from: 'a', fromOutput: 0, to: 'xor1', toInput: 0 },
        { from: 'b', fromOutput: 0, to: 'xor1', toInput: 1 },
        { from: 'a', fromOutput: 0, to: 'and1', toInput: 0 },
        { from: 'b', fromOutput: 0, to: 'and1', toInput: 1 },
        { from: 'xor1', fromOutput: 0, to: 'sum', toInput: 0 },
        { from: 'and1', fromOutput: 0, to: 'carry', toInput: 0 }
      ]
    })
  },
  {
    id: 'clock-divider',
    name: 'クロック分周器',
    description: 'Dフリップフロップを使ってクロック信号を半分の速度に分周します',
    difficulty: 'hard',
    tags: ['順序回路', 'クロック', 'フリップフロップ'],
    loadCircuit: () => ({
      gates: [
        { id: 'clock', type: 'CLOCK', x: 100, y: 150, value: false },
        { id: 'dff', type: 'D_FLIP_FLOP', x: 250, y: 150 },
        { id: 'not', type: 'NOT', x: 350, y: 200 },
        { id: 'output', type: 'OUTPUT', x: 450, y: 150 }
      ],
      connections: [
        { from: 'clock', fromOutput: 0, to: 'dff', toInput: 1 }, // CLK
        { from: 'dff', fromOutput: 1, to: 'not', toInput: 0 }, // Q' to NOT
        { from: 'not', fromOutput: 0, to: 'dff', toInput: 0 }, // NOT to D
        { from: 'dff', fromOutput: 0, to: 'output', toInput: 0 } // Q to OUTPUT
      ]
    })
  }
];

export const DemoCircuits: React.FC<DemoCircuitsProps> = ({
  currentMode,
  onLoadCircuit,
  className = ''
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [expandedDemo, setExpandedDemo] = useState<string | null>(null);

  // タグ一覧を取得
  const allTags = Array.from(new Set(DEMO_CIRCUITS.flatMap(circuit => circuit.tags)));
  
  // フィルタリング
  const filteredCircuits = selectedTag === 'all' 
    ? DEMO_CIRCUITS 
    : DEMO_CIRCUITS.filter(circuit => circuit.tags.includes(selectedTag));

  const handleLoadCircuit = (circuit: DemoCircuit) => {
    // 確認ダイアログを表示
    const confirmMessage = `「${circuit.name}」を読み込みますか？\n\n現在の回路はクリアされます。`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // デモ回路データを取得
        const circuitData = circuit.loadCircuit();
        
        // ViewModelに回路データを読み込む
        onLoadCircuit(circuitData);
        
        // 成功メッセージ（開発環境でのみ表示）
        if (process.env.NODE_ENV === 'development') {
          console.log(`デモ回路「${circuit.name}」を読み込みました`, circuitData);
        }
        
        // 回路を折りたたむ
        setExpandedDemo(null);
      } catch (error) {
        console.error('デモ回路の読み込みに失敗しました:', error);
        alert('デモ回路の読み込みに失敗しました。');
      }
    }
  };

  return (
    <div className={`demo-circuits ${className}`}>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          color: 'white'
        }}>
          <span style={{ fontSize: '24px' }}>🎮</span>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            margin: 0 
          }}>
            デモ回路集
          </h3>
        </div>

        {/* タグフィルター */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedTag('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              background: selectedTag === 'all' ? 'white' : 'rgba(255, 255, 255, 0.2)',
              color: selectedTag === 'all' ? '#7c3aed' : 'white',
              transition: 'all 0.2s ease'
            }}
          >
            すべて
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                background: selectedTag === tag ? 'white' : 'rgba(255, 255, 255, 0.2)',
                color: selectedTag === tag ? '#7c3aed' : 'white',
                transition: 'all 0.2s ease'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* デモ回路リスト */}
      <div style={{
        display: 'grid',
        gap: '12px'
      }}>
        {filteredCircuits.map(circuit => (
          <div
            key={circuit.id}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              boxShadow: expandedDemo === circuit.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div
              onClick={() => setExpandedDemo(expandedDemo === circuit.id ? null : circuit.id)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                background: expandedDemo === circuit.id ? '#f9fafb' : 'white'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {circuit.name}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: circuit.difficulty === 'easy' ? '#dcfce7' :
                                 circuit.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                      color: circuit.difficulty === 'easy' ? '#166534' :
                            circuit.difficulty === 'medium' ? '#92400e' : '#991b1b'
                    }}>
                      {circuit.difficulty === 'easy' ? '簡単' :
                       circuit.difficulty === 'medium' ? '中級' : '上級'}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  color: '#9ca3af',
                  transform: expandedDemo === circuit.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </div>
              </div>
            </div>

            {expandedDemo === circuit.id && (
              <div style={{
                padding: '0 16px 16px 16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '12px',
                  marginTop: '12px'
                }}>
                  {circuit.description}
                </p>
                <button
                  onClick={() => handleLoadCircuit(circuit)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  この回路を読み込む
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};