import React, { useState } from 'react';
import { CircuitMode } from '../../../entities/types/mode';
import { validatePuzzle } from '../../../shared/lib/utils/puzzleValidators';

interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  goal: string;
  hints: string[];
  checkCondition: (gates: any[], connections: any[]) => boolean;
  initialCircuit?: () => { gates: any[], connections: any[] };
}

interface PuzzleModeManagerProps {
  currentMode: CircuitMode;
  onLoadCircuit: (circuitData: any) => void;
  gates?: any[];
  connections?: any[];
}

// パズル定義
const PUZZLES: Puzzle[] = [
  {
    id: 'xor-challenge',
    title: 'XORゲートを作ろう',
    description: '基本ゲート（AND, OR, NOT）を使ってXORゲートの動作を再現してください',
    difficulty: 'medium',
    category: '論理回路の基礎',
    goal: 'A XOR B = (A AND (NOT B)) OR ((NOT A) AND B)',
    hints: [
      'XORは「排他的論理和」です',
      '入力が異なるときだけ出力が1になります',
      'AND, OR, NOTゲートを組み合わせて作れます'
    ],
    checkCondition: (gates, connections) => {
      return validatePuzzle('xor-challenge', gates, connections);
    }
  },
  {
    id: 'half-adder',
    title: '半加算器',
    description: '2つの1ビット数を加算する回路を作成してください',
    difficulty: 'medium',
    category: '算術回路',
    goal: '和(Sum)と桁上げ(Carry)を出力する',
    hints: [
      '和はXORで計算できます',
      '桁上げはANDで計算できます',
      '2つの出力が必要です'
    ],
    checkCondition: (gates, connections) => {
      return validatePuzzle('half-adder', gates, connections);
    }
  },
  {
    id: 'sr-latch',
    title: 'SRラッチ',
    description: 'Set/Resetラッチを作成してください',
    difficulty: 'hard',
    category: 'メモリ素子',
    goal: '状態を保持する回路を作る',
    hints: [
      '2つのNORゲートを使います',
      'フィードバックループが必要です',
      'SetとResetの両方が0のとき、前の状態を保持します'
    ],
    checkCondition: (gates, connections) => {
      return validatePuzzle('sr-latch', gates, connections);
    }
  }
];

export const PuzzleModeManager: React.FC<PuzzleModeManagerProps> = ({
  currentMode,
  onLoadCircuit,
  gates = [],
  connections = []
}) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<string | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const handleSelectPuzzle = (puzzleId: string) => {
    setSelectedPuzzle(puzzleId);
    setShowHint(false);
    setCurrentHintIndex(0);
    
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (puzzle?.initialCircuit) {
      onLoadCircuit(puzzle.initialCircuit());
    } else {
      // 空の回路をロード
      onLoadCircuit({ gates: [], connections: [] });
    }
  };

  const checkSolution = () => {
    if (!selectedPuzzle) return;
    
    const puzzle = PUZZLES.find(p => p.id === selectedPuzzle);
    if (!puzzle) return;
    
    const isCorrect = puzzle.checkCondition(gates, connections);
    
    if (isCorrect) {
      alert('正解です！おめでとうございます！🎉');
      setCompletedPuzzles([...completedPuzzles, selectedPuzzle]);
      setSelectedPuzzle(null);
    } else {
      alert('まだ正解ではありません。もう一度試してみてください。');
    }
  };

  const showNextHint = () => {
    const puzzle = PUZZLES.find(p => p.id === selectedPuzzle);
    if (!puzzle) return;
    
    if (!showHint) {
      // 初回はインデックス0（最初のヒント）を表示
      setShowHint(true);
    } else if (currentHintIndex < puzzle.hints.length - 1) {
      // 次のヒントに進む
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🧩 パズルモード
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          論理回路の問題に挑戦しましょう
        </p>
      </div>

      {!selectedPuzzle ? (
        <div>
          <h3 style={{ marginBottom: '16px' }}>パズル一覧</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {PUZZLES.map(puzzle => (
              <div
                key={puzzle.id}
                style={{
                  background: completedPuzzles.includes(puzzle.id) ? '#dcfce7' : 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleSelectPuzzle(puzzle.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{puzzle.title}</h4>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: puzzle.difficulty === 'easy' ? '#dbeafe' :
                               puzzle.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                    color: puzzle.difficulty === 'easy' ? '#1e40af' :
                          puzzle.difficulty === 'medium' ? '#92400e' : '#991b1b'
                  }}>
                    {puzzle.difficulty === 'easy' ? '簡単' :
                     puzzle.difficulty === 'medium' ? '中級' : '上級'}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                  {puzzle.description}
                </p>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  カテゴリ: {puzzle.category}
                  {completedPuzzles.includes(puzzle.id) && ' ✅'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {(() => {
            const puzzle = PUZZLES.find(p => p.id === selectedPuzzle);
            if (!puzzle) return null;
            
            return (
              <>
                <button
                  onClick={() => setSelectedPuzzle(null)}
                  style={{
                    marginBottom: '16px',
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ← パズル一覧に戻る
                </button>

                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ margin: '0 0 12px 0' }}>{puzzle.title}</h3>
                  <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                    {puzzle.description}
                  </p>
                  <div style={{
                    background: '#f9fafb',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <strong>目標:</strong> {puzzle.goal}
                  </div>

                  {showHint && (
                    <div style={{
                      background: '#fef3c7',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      color: '#92400e'
                    }}>
                      <strong>ヒント {currentHintIndex + 1}:</strong> {puzzle.hints[currentHintIndex]}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={showNextHint}
                      disabled={currentHintIndex >= puzzle.hints.length - 1 && showHint}
                      style={{
                        padding: '10px 20px',
                        background: '#fbbf24',
                        color: '#78350f',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        opacity: currentHintIndex >= puzzle.hints.length - 1 && showHint ? 0.5 : 1
                      }}
                    >
                      {showHint && currentHintIndex < puzzle.hints.length - 1 ? '次のヒント' : 'ヒントを見る'}
                    </button>
                    <button
                      onClick={checkSolution}
                      style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      答えを確認
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>進捗状況</h4>
        <div style={{ fontSize: '14px' }}>
          完了: {completedPuzzles.length} / {PUZZLES.length}
        </div>
        <div style={{
          marginTop: '8px',
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(completedPuzzles.length / PUZZLES.length) * 100}%`,
            height: '100%',
            background: '#10b981',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>
    </div>
  );
};