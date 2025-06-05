import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { Lesson } from '../data/lessons';
import { lessons, lessonCategories, getLearningStats } from '../data/lessons';
import type { GateType } from '../../../types/circuit';
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
              <div className="lesson-progress">
                <span>{currentStepIndex} / {selectedLesson.steps.length}</span>
              </div>
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
                      <p>{currentStep.action.content}</p>
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

                {/* ナビゲーション */}
                <div className="step-navigation">
                  <button
                    onClick={handlePreviousStep}
                    disabled={currentStepIndex === 0}
                    className="nav-button prev"
                  >
                    前へ
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep?.action.type === 'quiz' && quizAnswer !== currentStep.action.correct}
                    className="nav-button next"
                  >
                    {currentStepIndex === selectedLesson.steps.length - 1 ? '完了' : '次へ'}
                  </button>
                </div>
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
        </div>
      )}
    </div>
  );
};