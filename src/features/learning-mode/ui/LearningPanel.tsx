import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { Lesson } from '../data/lessons';
import { lessons, lessonCategories, getLearningStats } from '../data/lessons';
import type { GateType } from '../../../types/circuit';
import { ContentRenderer } from '../../../components/content-renderers/ContentRenderer';
import { parseExistingStep } from '../utils/contentParser';
import './LearningPanel.css';

interface LearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningPanel: React.FC<LearningPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]'))
  );
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const { gates, wires, clearAll, setAllowedGates } = useCircuitStore();
  
  // デバッグモードでは全レッスンのロックを解除
  const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  
  // デバッグモード用：通常時にロックされているレッスン数を計算
  const lockedLessonsCount = isDebugMode ? 
    lessons.filter(lesson => lesson.prerequisites.some(prereq => !completedLessons.has(prereq))).length : 0;
  
  // デバッグモード情報をコンソールに出力
  useEffect(() => {
    if (isDebugMode) {
      console.log('🔓 学習モード：デバッグモードが有効です');
      console.log(`📚 通常時ロックされているレッスン数: ${lockedLessonsCount}個`);
      console.log('📖 全27レッスンにアクセス可能です');
    }
  }, [isDebugMode, lockedLessonsCount]);

  const currentStep = selectedLesson?.steps[currentStepIndex];
  const stats = getLearningStats(completedLessons);

  // 2進数表現をフォーマットする関数
  const formatBinaryExpression = (expr: string, isExperimentResult: boolean = false) => {
    // 「0+0=0」のような表現を検出して整形
    const match = expr.match(/(\d)\s*\+\s*(\d)\s*=\s*(\d+)/);
    if (match) {
      const className = isExperimentResult ? "experiment-result" : "binary-expression";
      const inputClass = isExperimentResult ? "exp-input" : "input";
      const operatorClass = isExperimentResult ? "exp-operator" : "operator";
      const equalsClass = isExperimentResult ? "exp-equals" : "equals";
      const outputClass = isExperimentResult ? "exp-output" : "output";
      
      return (
        <span className={className}>
          <span className={inputClass}>{match[1]}</span>
          <span className={operatorClass}> + </span>
          <span className={inputClass}>{match[2]}</span>
          <span className={equalsClass}> = </span>
          <span className={outputClass}>{match[3]}</span>
        </span>
      );
    }
    return expr;
  };

  // Explanation内容をレンダリングする関数
  const renderExplanationContent = (content: string) => {
    // 改行で分割
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // 真理値表のヘッダーを検出（パイプ記号を含む行）
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
        // 真理値表を構築
        const tableLines = [];
        let j = i;
        
        // ヘッダー行から開始して、パイプを含む行を収集
        while (j < lines.length && (lines[j].includes('|') || lines[j].includes('---'))) {
          tableLines.push(lines[j]);
          j++;
        }
        
        if (tableLines.length >= 2) {
          // 真理値表をレンダリング
          const headerLine = tableLines[0];
          const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
          const dataLines = tableLines.slice(2); // セパレータ行をスキップ
          
          elements.push(
            <table key={`table-${i}`} className="truth-table">
              <thead>
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataLines.map((dataLine, rowIdx) => {
                  const cells = dataLine.split('|').map(c => c.trim()).filter(c => c);
                  return (
                    <tr key={rowIdx}>
                      {cells.map((cell, cellIdx) => (
                        <td key={cellIdx}>{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
          
          i = j;
          continue;
        }
      }
      
      // 比較表の検出（AND: OR: などのパターン）
      if (line.includes('AND:') || line.includes('OR:') || line.includes('XOR:') || line.includes('NOT:')) {
        const comparisonLines = [];
        let j = i;
        
        // 比較行を収集
        while (j < lines.length && (lines[j].includes(':') && (lines[j].includes('AND') || lines[j].includes('OR') || lines[j].includes('XOR') || lines[j].includes('NOT')))) {
          comparisonLines.push(lines[j]);
          j++;
        }
        
        if (comparisonLines.length > 0) {
          elements.push(
            <div key={`comparison-${i}`} className="comparison-table">
              {comparisonLines.map((compLine, idx) => {
                const [gateType, values] = compLine.split(':').map(s => s.trim());
                return (
                  <div key={idx} className="comparison-row">
                    <span className={`gate-label gate-label-${gateType.toLowerCase()}`}>
                      {gateType}
                    </span>
                    <span className="gate-values">
                      {(() => {
                        const items = values
                          .split(',')
                          .map(v => v.trim())
                          .filter(v => v.length > 0); // Remove empty strings
                        
                        return items.map((v, vIdx) => {
                          const isLast = vIdx === items.length - 1;
                          return (
                            <React.Fragment key={vIdx}>
                              <span className="value-item">
                                {formatBinaryExpression(v)}
                              </span>
                              {!isLast && <span className="separator">, </span>}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </span>
                  </div>
                );
              })}
            </div>
          );
          
          i = j;
          continue;
        }
      }
      
      // 箇条書きの検出
      if (line.trim().startsWith('・') || line.trim().startsWith('•')) {
        const listItems = [];
        let j = i;
        
        while (j < lines.length && (lines[j].trim().startsWith('・') || lines[j].trim().startsWith('•'))) {
          listItems.push(lines[j].trim().substring(1).trim());
          j++;
        }
        
        elements.push(
          <ul key={`list-${i}`} className="explanation-list">
            {listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
        
        i = j;
        continue;
      }
      
      // 番号付きリストの検出
      if (/^\d+\./.test(line.trim())) {
        const listItems = [];
        let j = i;
        
        while (j < lines.length && /^\d+\./.test(lines[j].trim())) {
          listItems.push(lines[j].trim().replace(/^\d+\.\s*/, ''));
          j++;
        }
        
        elements.push(
          <ol key={`ol-${i}`} className="explanation-ordered-list">
            {listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        );
        
        i = j;
        continue;
      }
      
      // 見出しの検出（絵文字で始まる行）
      if (line.trim() && /^[🔧🎯📊💡🤔🔍🌟📝🔗🧮📐💻🚗🏠🛑💳🚨🚪🔄🔐✅➕🎮]/u.test(line.trim())) {
        elements.push(
          <h4 key={`heading-${i}`} className="explanation-heading">
            {line.trim()}
          </h4>
        );
        i++;
        continue;
      }
      
      // 空行
      if (!line.trim()) {
        elements.push(<br key={`br-${i}`} />);
        i++;
        continue;
      }
      
      // 通常の段落
      // 実験結果まとめの場合は特別な処理
      if (line.includes('実験結果') && line.includes('🔬')) {
        // アイコンを分離して処理
        const parts = line.split('：');
        if (parts.length >= 2) {
          const title = parts[0].trim();
          const content = parts.slice(1).join('：').trim();
          
          // 実験結果を分割
          const results = content.split(/[\u3001,]/).map(r => r.trim()).filter(r => r);
          
          elements.push(
            <div key={`exp-${i}`} className="experiment-results-section">
              <h4 className="explanation-heading">{title}：</h4>
              <div className="experiment-results-grid">
                {results.map((result, idx) => (
                  <div key={idx}>{formatBinaryExpression(result, true)}</div>
                ))}
              </div>
              {i === 0 && (
                <div className="expression-note">
                  <span className="note-icon">💡</span>
                  <span>ここでの「+」は論理演算を表します。入力1 + 入力2 = 出力 という意味です。</span>
                </div>
              )}
            </div>
          );
          i++;
          continue;
        }
      }
      
      // 「+」記号を含む行の場合
      if (line.includes('+') && line.match(/\d\s*\+\s*\d/)) {
        const parts = line.split(/[\u3001,]/).map(p => p.trim()).filter(p => p);
        elements.push(
          <div key={`p-${i}`} className="explanation-paragraph">
            {parts.map((part, idx) => (
              <span key={idx}>
                {part.match(/\d\s*\+\s*\d\s*=\s*\d+/) ? formatBinaryExpression(part, false) : part}
                {idx < parts.length - 1 && '、'}
              </span>
            ))}
          </div>
        );
      } else {
        elements.push(
          <p key={`p-${i}`} className="explanation-paragraph">
            {line}
          </p>
        );
      }
      i++;
    }
    
    return elements;
  };

  // ゲート制限の設定
  useEffect(() => {
    if (!selectedLesson) {
      setAllowedGates(null);
      return;
    }

    const requiredGates: Set<GateType> = new Set();
    const currentStep = selectedLesson.steps[currentStepIndex];
    
    // デバッグ情報
    console.log('📍 現在のレッスン:', selectedLesson.id);
    console.log('📍 現在のステップ:', currentStep?.id);
    console.log('📍 ステップインデックス:', currentStepIndex);
    
    // 半加算器レッスンでは必要な全ゲートを最初から解放
    if (selectedLesson.id === 'half-adder') {
      console.log('🔧 半加算器レッスン：必要な全ゲート解放');
      requiredGates.add('INPUT' as GateType);
      requiredGates.add('XOR' as GateType);
      requiredGates.add('AND' as GateType);
      requiredGates.add('OUTPUT' as GateType);
    } else {
      // 通常のロジック
      for (let i = 0; i <= Math.min(currentStepIndex + 2, selectedLesson.steps.length - 1); i++) {
        const step = selectedLesson.steps[i];
        if (step?.action.type === 'place-gate') {
          requiredGates.add(step.action.gateType as GateType);
        }
      }
    }

    const allowedGatesList = requiredGates.size > 0 ? Array.from(requiredGates) : null;
    console.log('🎯 設定されるゲート:', allowedGatesList);
    setAllowedGates(allowedGatesList);
  }, [selectedLesson, currentStepIndex, setAllowedGates]);

  // レッスン完了処理
  useEffect(() => {
    if (selectedLesson && currentStepIndex >= selectedLesson.steps.length) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(selectedLesson.id);
      setCompletedLessons(newCompleted);
      localStorage.setItem('completedLessons', JSON.stringify([...newCompleted]));
      
      setTimeout(() => {
        setSelectedLesson(null);
        setCurrentStepIndex(0);
      }, 3000);
    }
  }, [currentStepIndex, selectedLesson, completedLessons]);

  const handleStartLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      if (gates.length > 0 || wires.length > 0) {
        if (window.confirm('現在の回路をクリアして、レッスンを開始しますか？')) {
          clearAll();
        } else {
          return;
        }
      }
      setSelectedLesson(lesson);
      setCurrentStepIndex(0);
      setQuizAnswer(null);
    }
  };

  const handleNextStep = () => {
    if (currentStep?.action.type === 'quiz' && quizAnswer !== null) {
      if (quizAnswer === currentStep.action.correct) {
        setCurrentStepIndex(prev => prev + 1);
        setQuizAnswer(null);
      } else {
        return; // 不正解の場合は進まない
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setQuizAnswer(null);
    }
  };

  if (!isOpen) return null;

  // 最小化時の表示
  if (isMinimized) {
    return (
      <div className="learning-panel-minimized">
        <div className="minimized-content">
          <span className="minimized-icon">🎓</span>
          <span className="minimized-title">
            {selectedLesson ? selectedLesson.title : '学習モード'}
          </span>
          {selectedLesson && (
            <div className="minimized-progress">
              <div 
                className="minimized-progress-bar"
                style={{ width: `${(currentStepIndex / selectedLesson.steps.length) * 100}%` }}
              />
            </div>
          )}
          <button 
            className="expand-button"
            onClick={() => setIsMinimized(false)}
            title="パネルを展開"
          >
            ▼
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`learning-panel ${selectedLesson ? 'lesson-active' : ''}`}>
      {!selectedLesson ? (
        // 🎓 メイン学習画面
        <div className="learning-home">
          {/* ヘッダー */}
          <div className="learning-header">
            <div className="header-content">
              <h1 className="learning-title">
                <span className="title-icon">🎓</span>
                論理回路マスターへの道
              </h1>
              <p className="learning-subtitle">
                初学者から実用レベルまで、27レッスンで完全習得
                {isDebugMode && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '8px', 
                    color: '#ff6699', 
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    🔓 デバッグモード：全レッスンアクセス可能 ({lockedLessonsCount}個のロック解除)
                  </span>
                )}
              </p>
              <button onClick={() => setIsMinimized(true)} className="minimize-button" title="最小化">―</button>
              <button onClick={onClose} className="close-button">×</button>
            </div>

            {/* 学習統計 */}
            <div className="learning-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">完了レッスン</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.progress}%</div>
                <div className="stat-label">進捗率</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Math.round(stats.estimatedTime / 60)}h</div>
                <div className="stat-label">残り時間</div>
              </div>
            </div>
          </div>

          {/* フェーズ別レッスン */}
          <div className="learning-content">
            {Object.entries(lessonCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="phase-section">
                <div className="phase-header" style={{ '--phase-color': category.color } as React.CSSProperties}>
                  <h2 className="phase-title">{category.title}</h2>
                  <p className="phase-description">{category.description}</p>
                  <div className="phase-progress">
                    <div 
                      className="phase-progress-bar"
                      style={{ 
                        width: `${(category.lessons.filter(id => completedLessons.has(id)).length / category.lessons.length) * 100}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>

                <div className="lessons-grid">
                  {category.lessons.map(lessonId => {
                    const lesson = lessons.find(l => l.id === lessonId);
                    if (!lesson) return null;

                    const isCompleted = completedLessons.has(lessonId);
                    const isLocked = !isDebugMode && lesson.prerequisites.some(prereq => !completedLessons.has(prereq));

                    return (
                      <div
                        key={lessonId}
                        className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isDebugMode && isLocked ? 'debug-unlocked' : ''}`}
                        onClick={() => !isLocked && handleStartLesson(lessonId)}
                        style={{ '--lesson-color': category.color } as React.CSSProperties}
                      >
                        <div className="lesson-icon">
                          {isCompleted ? '✅' : (isLocked && !isDebugMode) ? '🔒' : lesson.icon}
                        </div>
                        <div className="lesson-content">
                          <h3 className="lesson-title">{lesson.title}</h3>
                          <p className="lesson-description">{lesson.description}</p>
                          <div className="lesson-meta">
                            <span className="lesson-difficulty">{
                              lesson.difficulty === 'beginner' ? '初級' :
                              lesson.difficulty === 'intermediate' ? '中級' : '上級'
                            }</span>
                            <span className="lesson-duration">{lesson.estimatedMinutes}分</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 📖 レッスン実行画面
        <div className="lesson-player">
          <div className="lesson-player-header">
            <button onClick={() => setSelectedLesson(null)} className="back-button">
              ← 戻る
            </button>
            <div className="lesson-info">
              <h2 className="lesson-title">{selectedLesson.title}</h2>
            </div>
            <div className="header-buttons">
              <button onClick={() => setIsMinimized(true)} className="minimize-button" title="最小化">―</button>
            </div>
          </div>

          <div className="lesson-player-content">
            {currentStepIndex < selectedLesson.steps.length ? (
              <>
                {/* ステップ内容 */}
                <div className="step-content">
                  <div className="step-instruction">
                    {currentStep?.instruction}
                  </div>
                  
                  {currentStep?.hint && (
                    <div className="step-hint">
                      💡 <span>{currentStep.hint}</span>
                    </div>
                  )}

                  {currentStep?.action.type === 'explanation' && (
                    <div className="step-explanation">
                      <div className="explanation-icon">🧠</div>
                      <div className="explanation-content">
                        <ContentRenderer content={parseExistingStep(currentStep)} />
                      </div>
                    </div>
                  )}

                  {currentStep?.action.type === 'quiz' && (
                    <div className="quiz-section">
                      <h3 className="quiz-question">{currentStep.action.question}</h3>
                      <div className="quiz-options">
                        {currentStep.action.options.map((option, index) => (
                          <button
                            key={index}
                            className={`quiz-option ${quizAnswer === index ? 'selected' : ''}`}
                            onClick={() => setQuizAnswer(index)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {quizAnswer !== null && quizAnswer !== currentStep.action.correct && (
                        <div className="quiz-feedback incorrect">
                          もう一度考えてみましょう！
                        </div>
                      )}
                      {quizAnswer === currentStep.action.correct && (
                        <div className="quiz-feedback correct">
                          正解です！🎉
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 進捗バー */}
                <div className="step-progress">
                  <div 
                    className="step-progress-bar"
                    style={{ width: `${(currentStepIndex / selectedLesson.steps.length) * 100}%` }}
                  />
                </div>

                {/* ナビゲーションはlesson-player-contentの外に移動 */}
              </>
            ) : (
              // レッスン完了画面
              <div className="lesson-complete">
                <div className="completion-animation">🎉</div>
                <h2>レッスン完了！</h2>
                <p>「{selectedLesson.title}」をマスターしました！</p>
                <div className="completion-stats">
                  <div className="completion-stat">
                    <span className="stat-value">{selectedLesson.estimatedMinutes}分</span>
                    <span className="stat-label">学習時間</span>
                  </div>
                  <div className="completion-stat">
                    <span className="stat-value">{selectedLesson.steps.length}</span>
                    <span className="stat-label">ステップ数</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* フローティングナビゲーション */}
          {selectedLesson && currentStepIndex < selectedLesson.steps.length && (
            <div className="floating-navigation">
              <button
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0}
                className="nav-button prev"
                title="前のステップ"
              >
                <span className="nav-icon">◀</span>
                <span className="nav-text">前へ</span>
              </button>
              <div className="nav-indicator">
                <span className="current-step">{currentStepIndex + 1}</span>
                <span className="separator">/</span>
                <span className="total-steps">{selectedLesson.steps.length}</span>
              </div>
              <button
                onClick={handleNextStep}
                disabled={currentStep?.action.type === 'quiz' && quizAnswer !== currentStep.action.correct}
                className="nav-button next"
                title="次のステップ"
              >
                <span className="nav-text">{currentStepIndex === selectedLesson.steps.length - 1 ? '完了' : '次へ'}</span>
                <span className="nav-icon">▶</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};