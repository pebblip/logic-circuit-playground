import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { StructuredLesson } from '../../../types/lesson-content';
import { lessons, lessonCategories, getLearningStats } from '../data/lessons';
import { LessonStepRenderer } from '../components/LessonStepRenderer';
import type { GateType } from '../../../types/circuit';
import './LearningPanel.css';

// 全ての構造化レッスンをインポート
import { andGateStructuredLesson } from '../data/structured-lessons/and-gate-lesson';
import { orGateStructuredLesson } from '../data/structured-lessons/or-gate-lesson';
import { notGateStructuredLesson } from '../data/structured-lessons/not-gate-lesson';
import { xorGateStructuredLesson } from '../data/structured-lessons/xor-gate-lesson';
import { halfAdderStructuredLesson } from '../data/structured-lessons/half-adder-lesson';
import { digitalBasicsStructuredLesson } from '../data/structured-lessons/digital-basics-lesson';
import { fullAdderStructuredLesson } from '../data/structured-lessons/full-adder-lesson';
import { fourBitAdderStructuredLesson } from '../data/structured-lessons/4bit-adder-lesson';
import { comparatorStructuredLesson } from '../data/structured-lessons/comparator-lesson';
import { encoderStructuredLesson } from '../data/structured-lessons/encoder-lesson';
import { decoderStructuredLesson } from '../data/structured-lessons/decoder-lesson';
import { multiplexerStructuredLesson } from '../data/structured-lessons/multiplexer-lesson';
import { aluBasicsStructuredLesson } from '../data/structured-lessons/alu-basics-lesson';
import { dFlipFlopStructuredLesson } from '../data/structured-lessons/d-flip-flop-lesson';
import { srLatchStructuredLesson } from '../data/structured-lessons/sr-latch-lesson';
import { counterStructuredLesson } from '../data/structured-lessons/counter-lesson';
import { registerStructuredLesson } from '../data/structured-lessons/register-lesson';
import { shiftRegisterStructuredLesson } from '../data/structured-lessons/shift-register-lesson';
import { clockSyncStructuredLesson } from '../data/structured-lessons/clock-sync-lesson';
import { trafficLightStructuredLesson } from '../data/structured-lessons/traffic-light-lesson';
import { digitalClockStructuredLesson } from '../data/structured-lessons/digital-clock-lesson';

interface LearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 全ての構造化レッスンを登録
const structuredLessons: { [key: string]: StructuredLesson } = {
  // 基本ゲート
  'digital-basics': digitalBasicsStructuredLesson,
  'and-gate': andGateStructuredLesson,
  'or-gate': orGateStructuredLesson,
  'not-gate': notGateStructuredLesson,
  'xor-gate': xorGateStructuredLesson,

  // 基本回路
  'half-adder': halfAdderStructuredLesson,
  'full-adder': fullAdderStructuredLesson,
  '4bit-adder': fourBitAdderStructuredLesson,
  comparator: comparatorStructuredLesson,

  // データ処理
  encoder: encoderStructuredLesson,
  decoder: decoderStructuredLesson,
  multiplexer: multiplexerStructuredLesson,

  // 順序回路
  'sr-latch': srLatchStructuredLesson,
  'd-flip-flop': dFlipFlopStructuredLesson,
  counter: counterStructuredLesson,
  register: registerStructuredLesson,
  'shift-register': shiftRegisterStructuredLesson,

  // 高度な応用
  'alu-basics': aluBasicsStructuredLesson,
  'clock-sync': clockSyncStructuredLesson,
  'traffic-light': trafficLightStructuredLesson,
  'digital-clock': digitalClockStructuredLesson,
};

export const LearningPanel: React.FC<LearningPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<StructuredLesson | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]'))
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const { gates, wires, clearAll, setAllowedGates } = useCircuitStore();

  const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  const lockedLessonsCount = isDebugMode
    ? lessons.filter(lesson =>
        lesson.prerequisites.some(prereq => !completedLessons.has(prereq))
      ).length
    : 0;

  const stats = getLearningStats(completedLessons);

  // 現在のステップを取得
  const getCurrentStep = () => {
    if (
      !selectedLesson ||
      !selectedLesson.steps ||
      currentStepIndex >= selectedLesson.steps.length
    ) {
      return null;
    }

    return selectedLesson.steps[currentStepIndex];
  };

  const currentStep = getCurrentStep();

  // ゲート制限の設定
  useEffect(() => {
    if (!selectedLesson) {
      setAllowedGates(null);
      return;
    }

    // レッスンに明示的に定義されたavailableGatesを使用
    if (selectedLesson.availableGates) {
      setAllowedGates(selectedLesson.availableGates as GateType[]);
    } else {
      // フォールバック: ステップから動的に計算（後方互換性のため）
      const requiredGates: Set<GateType> = new Set();

      const stepsToCheck = Math.min(
        currentStepIndex + 2,
        selectedLesson.steps.length - 1
      );
      for (let i = 0; i <= stepsToCheck; i++) {
        const step = selectedLesson.steps[i];
        if (step?.action?.type === 'place-gate') {
          requiredGates.add(
            (step.action as { type: 'place-gate'; gateType: string })
              .gateType as GateType
          );
        }
      }

      const allowedGatesList =
        requiredGates.size > 0 ? Array.from(requiredGates) : null;
      setAllowedGates(allowedGatesList);
    }
  }, [selectedLesson, setAllowedGates]);

  // レッスン完了処理
  useEffect(() => {
    if (selectedLesson && currentStepIndex >= selectedLesson.steps.length) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(selectedLesson.id);
      setCompletedLessons(newCompleted);
      localStorage.setItem(
        'completedLessons',
        JSON.stringify([...newCompleted])
      );

      setTimeout(() => {
        setSelectedLesson(null);
        setCurrentStepIndex(0);
      }, 3000);
    }
  }, [currentStepIndex, selectedLesson, completedLessons]);

  const handleStartLesson = (lessonId: string) => {
    // 新しい構造化レッスンが存在する場合はそれを使用
    const structuredLesson = structuredLessons[lessonId];
    const oldLesson = lessons.find(l => l.id === lessonId);
    const lesson = structuredLesson || oldLesson;

    if (lesson) {
      if (gates.length > 0 || wires.length > 0) {
        if (
          window.confirm('現在の回路をクリアして、レッスンを開始しますか？')
        ) {
          clearAll();
        } else {
          return;
        }
      }
      setSelectedLesson(lesson);
      setCurrentStepIndex(0);
      setQuizAnswered(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep?.content?.some(c => c.type === 'quiz') && !quizAnswered) {
      return; // クイズに答えていない場合は進まない
    }
    setCurrentStepIndex(prev => prev + 1);
    setQuizAnswered(false);
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setQuizAnswered(false);
    }
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setQuizAnswered(true);
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
                style={{
                  width: `${(currentStepIndex / selectedLesson.steps.length) * 100}%`,
                }}
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
        // メイン学習画面
        <div className="learning-home">
          <div className="learning-header">
            <div className="header-content">
              <h1 className="learning-title">
                <span className="title-icon">🎓</span>
                論理回路マスターへの道
              </h1>
              <p className="learning-subtitle">
                初学者から実用レベルまで、27レッスンで完全習得
                {isDebugMode && (
                  <span
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      color: '#ff6699',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    🔓 デバッグモード：全レッスンアクセス可能 (
                    {lockedLessonsCount}個のロック解除)
                  </span>
                )}
              </p>
              <button
                onClick={() => setIsMinimized(true)}
                className="minimize-button"
                title="最小化"
              >
                ―
              </button>
              <button onClick={onClose} className="close-button">
                ×
              </button>
            </div>

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
                <div className="stat-number">
                  {Math.round(stats.estimatedTime / 60)}h
                </div>
                <div className="stat-label">残り時間</div>
              </div>
            </div>
          </div>

          <div className="learning-content">
            {Object.entries(lessonCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="phase-section">
                <div
                  className="phase-header"
                  style={
                    { '--phase-color': category.color } as React.CSSProperties
                  }
                >
                  <h2 className="phase-title">{category.title}</h2>
                  <p className="phase-description">{category.description}</p>
                  <div className="phase-progress">
                    <div
                      className="phase-progress-bar"
                      style={{
                        width: `${(category.lessons.filter(id => completedLessons.has(id)).length / category.lessons.length) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>

                <div className="lessons-grid">
                  {category.lessons.map(lessonId => {
                    const lesson =
                      structuredLessons[lessonId] ||
                      lessons.find(l => l.id === lessonId);
                    if (!lesson) return null;

                    const isCompleted = completedLessons.has(lessonId);
                    const isLocked =
                      !isDebugMode &&
                      lesson.prerequisites.some(
                        (prereq: string) => !completedLessons.has(prereq)
                      );
                    const isNewFormat = lessonId in structuredLessons;

                    return (
                      <div
                        key={lessonId}
                        className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isDebugMode && isLocked ? 'debug-unlocked' : ''} ${isNewFormat ? 'new-format' : ''}`}
                        onClick={() => !isLocked && handleStartLesson(lessonId)}
                        style={
                          {
                            '--lesson-color': category.color,
                          } as React.CSSProperties
                        }
                      >
                        <div className="lesson-icon">
                          {isCompleted
                            ? '✅'
                            : isLocked && !isDebugMode
                              ? '🔒'
                              : lesson.icon}
                        </div>
                        <div className="lesson-content">
                          <h3 className="lesson-title">
                            {lesson.title}
                            {isNewFormat && (
                              <span className="new-badge">NEW</span>
                            )}
                          </h3>
                          <p className="lesson-description">
                            {lesson.description}
                          </p>
                          <div className="lesson-meta">
                            <span className="lesson-difficulty">
                              {lesson.difficulty === 'beginner'
                                ? '初級'
                                : lesson.difficulty === 'intermediate'
                                  ? '中級'
                                  : '上級'}
                            </span>
                            <span className="lesson-duration">
                              {lesson.estimatedMinutes}分
                            </span>
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
        // レッスン実行画面
        <div className="lesson-player">
          <div className="lesson-player-header">
            <button
              onClick={() => setSelectedLesson(null)}
              className="back-button"
            >
              ← 戻る
            </button>
            <div className="lesson-info">
              <h2 className="lesson-title">{selectedLesson.title}</h2>
            </div>
            <div className="header-buttons">
              <button
                onClick={() => setIsMinimized(true)}
                className="minimize-button"
                title="最小化"
              >
                ―
              </button>
            </div>
          </div>

          <div className="lesson-player-content">
            {currentStepIndex < selectedLesson.steps.length && currentStep ? (
              <>
                <LessonStepRenderer
                  step={currentStep}
                  onQuizAnswer={handleQuizAnswer}
                />

                <div className="step-progress">
                  <div
                    className="step-progress-bar"
                    style={{
                      width: `${(currentStepIndex / selectedLesson.steps.length) * 100}%`,
                    }}
                  />
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
                    <span className="stat-value">
                      {selectedLesson.estimatedMinutes}分
                    </span>
                    <span className="stat-label">学習時間</span>
                  </div>
                  <div className="completion-stat">
                    <span className="stat-value">
                      {selectedLesson.steps.length}
                    </span>
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
                <span className="total-steps">
                  {selectedLesson.steps.length}
                </span>
              </div>
              <button
                onClick={handleNextStep}
                disabled={
                  currentStep?.content?.some(c => c.type === 'quiz') &&
                  !quizAnswered
                }
                className="nav-button next"
                title="次のステップ"
              >
                <span className="nav-text">
                  {currentStepIndex === selectedLesson.steps.length - 1
                    ? '完了'
                    : '次へ'}
                </span>
                <span className="nav-icon">▶</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
