import React, { useState, useEffect } from 'react';
import type { Puzzle } from '../data/puzzles';
import { getPuzzlesByDifficulty } from '../data/puzzles';
import { PuzzleValidator } from '../model/PuzzleValidator';
import { useCircuitStore } from '../../../stores/circuitStore';
import './PuzzlePanel.css';

interface PuzzlePanelProps {
  isVisible: boolean;
}

export const PuzzlePanel: React.FC<PuzzlePanelProps> = ({ isVisible }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [currentTest, setCurrentTest] = useState(0);
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    message: string;
    testResults: boolean[];
  } | null>(null);
  const [showHints, setShowHints] = useState(false);

  const { gates, wires, clearAll, setAllowedGates } = useCircuitStore();

  // パズル選択時の初期化
  useEffect(() => {
    if (selectedPuzzle) {
      clearAll();
      setAllowedGates(selectedPuzzle.constraints.allowedGates);
      setValidationResult(null);
      setCurrentTest(0);
      setShowHints(false);
    }
  }, [selectedPuzzle, clearAll, setAllowedGates]);

  // 回路変更時の自動検証
  useEffect(() => {
    if (selectedPuzzle && gates.length > 0) {
      const validator = new PuzzleValidator(selectedPuzzle);
      const result = validator.validateCircuit(gates, wires);
      setValidationResult(result);
    }
  }, [gates, wires, selectedPuzzle]);

  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
  };

  const handleTestInput = (testIndex: number) => {
    if (!selectedPuzzle) return;

    const testCase = selectedPuzzle.testCases[testIndex];
    if (!testCase) return;

    // 入力ゲートの値を設定
    const inputGates = gates.filter(g => g.type === 'INPUT');
    testCase.inputs.forEach((value, index) => {
      if (inputGates[index]) {
        useCircuitStore
          .getState()
          .updateGateOutput(inputGates[index].id, value);
      }
    });

    setCurrentTest(testIndex);
  };

  const renderPuzzleList = () => {
    const difficulties: Array<Puzzle['difficulty']> = [
      'beginner',
      'intermediate',
      'advanced',
      'expert',
    ];
    const difficultyLabels = {
      beginner: '🟢 初級',
      intermediate: '🟡 中級',
      advanced: '🟠 上級',
      expert: '🔴 エキスパート',
    };

    return (
      <div className="puzzle-list">
        <h3 data-testid="puzzle-panel-title">🧩 パズル・チャレンジ</h3>
        <p className="puzzle-intro" data-testid="puzzle-panel-description">
          制約条件の中で目標回路を作成してください
        </p>

        {difficulties.map(difficulty => {
          const puzzles = getPuzzlesByDifficulty(difficulty);
          if (puzzles.length === 0) return null;

          return (
            <div key={difficulty} className="difficulty-section">
              <h4 data-testid={`difficulty-label-${difficulty}`}>
                {difficultyLabels[difficulty]}
              </h4>
              <div className="puzzle-grid">
                {puzzles.map(puzzle => (
                  <button
                    key={puzzle.id}
                    className="puzzle-card"
                    data-testid={`puzzle-card-${puzzle.id}`}
                    onClick={() => handlePuzzleSelect(puzzle)}
                  >
                    <div className="puzzle-title">{puzzle.title}</div>
                    <div className="puzzle-category">{puzzle.category}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPuzzleDetail = () => {
    if (!selectedPuzzle) return null;

    return (
      <div className="puzzle-detail">
        <div className="puzzle-header">
          <button
            className="back-button"
            data-testid="puzzle-back-button"
            onClick={() => setSelectedPuzzle(null)}
          >
            ← 戻る
          </button>
          <h3>{selectedPuzzle.title}</h3>
        </div>

        <div className="puzzle-description">
          <p>{selectedPuzzle.description}</p>
        </div>

        {/* 制約条件 */}
        <div className="constraints">
          <h4 data-testid="constraints-title">📋 制約条件</h4>
          <ul>
            {selectedPuzzle.constraints.maxGates && (
              <li>最大ゲート数: {selectedPuzzle.constraints.maxGates}個</li>
            )}
            {selectedPuzzle.constraints.maxWires && (
              <li>最大ワイヤー数: {selectedPuzzle.constraints.maxWires}本</li>
            )}
            <li>
              使用可能ゲート:{' '}
              {selectedPuzzle.constraints.allowedGates.join(', ')}
            </li>
          </ul>
        </div>

        {/* テストケース */}
        <div className="test-cases">
          <h4 data-testid="test-cases-title">🧪 テストケース</h4>
          <div className="test-grid">
            {selectedPuzzle.testCases.map((testCase, index) => (
              <button
                key={index}
                className={`test-case ${index === currentTest ? 'active' : ''} ${
                  validationResult?.testResults[index] === true
                    ? 'passed'
                    : validationResult?.testResults[index] === false
                      ? 'failed'
                      : ''
                }`}
                onClick={() => handleTestInput(index)}
              >
                <div className="test-inputs">
                  入力: {testCase.inputs.map(i => (i ? '1' : '0')).join(', ')}
                </div>
                <div className="test-output">
                  期待: {testCase.expectedOutput ? '1' : '0'}
                </div>
                {testCase.description && (
                  <div className="test-description">{testCase.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 検証結果 */}
        {validationResult && (
          <div
            className={`validation-result ${validationResult.passed ? 'success' : 'error'}`}
          >
            <div className="result-icon">
              {validationResult.passed ? '✅' : '❌'}
            </div>
            <div className="result-message">{validationResult.message}</div>
            {validationResult.passed && (
              <div className="celebration">
                🎉 パズル完成！美しい解答です！ 🎉
              </div>
            )}
          </div>
        )}

        {/* ヒント */}
        <div className="hints-section">
          <button
            className="hints-toggle"
            onClick={() => setShowHints(!showHints)}
          >
            💡 ヒント {showHints ? '非表示' : '表示'}
          </button>

          {showHints && selectedPuzzle.hints && (
            <div className="hints">
              {selectedPuzzle.hints.map((hint, index) => (
                <div key={index} className="hint">
                  {index + 1}. {hint}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 学習目標 */}
        <div className="learning-objectives">
          <h4 data-testid="learning-objectives-title">🎯 学習目標</h4>
          <ul>
            {selectedPuzzle.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="puzzle-panel">
      {selectedPuzzle ? renderPuzzleDetail() : renderPuzzleList()}
    </div>
  );
};
