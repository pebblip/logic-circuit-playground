import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { StructuredLesson } from '../../../types/lesson-content';
import { lessons, lessonCategories, getLearningStats } from '../data/lessons';
import { LessonStepRenderer } from '../components/LessonStepRenderer';
import type { GateType } from '../../../types/circuit';
import { TERMS } from '../data/terms';
import {
  getAvailableLessons,
  getQualityStats,
  getLessonQuality,
} from '../data/lesson-quality';
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
  onOpenHelp?: () => void;
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
  onOpenHelp,
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
  const availableLessonIds = getAvailableLessons(isDebugMode, 'beta'); // beta以上を本番表示
  const qualityStats = getQualityStats();

  const lockedLessonsCount = isDebugMode
    ? lessons.filter(lesson =>
        lesson.prerequisites.some(prereq => !completedLessons.has(prereq))
      ).length
    : qualityStats.needsWork; // 本番では未完成レッスン数を表示

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
  }, [selectedLesson, setAllowedGates, currentStepIndex]);

  // パネル閉じた時のクリーンアップ
  useEffect(() => {
    if (!isOpen && selectedLesson) {
      setSelectedLesson(null);
      setCurrentStepIndex(0);
      setQuizAnswered(false);
    }
  }, [isOpen, selectedLesson]);

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

      // 自動遷移を削除（ユーザーが手動で戻るように）
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
          window.confirm(
            `現在の${TERMS.CIRCUIT}を${TERMS.CLEAR}して、${TERMS.LESSON}を開始しますか？`
          )
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
            {selectedLesson ? selectedLesson.title : TERMS.LEARNING_MODE}
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
            title={`パネルを${TERMS.EXPAND}`}
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
              {onOpenHelp && (
                <button
                  onClick={onOpenHelp}
                  className="help-button"
                  title={TERMS.HELP}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    marginRight: '8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor =
                      'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#00ff88';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  ❓
                </button>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="minimize-button"
                title={TERMS.MINIMIZE}
              >
                ―
              </button>
              <button
                onClick={onClose}
                className="close-button"
                title={TERMS.CLOSE}
              >
                ×
              </button>
            </div>

            <div className="learning-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">{TERMS.COMPLETED_LESSONS}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.progress}%</div>
                <div className="stat-label">{TERMS.PROGRESS_RATE}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {Math.round(stats.estimatedTime / 60)}h
                </div>
                <div className="stat-label">{TERMS.REMAINING_TIME}</div>
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
                    // 品質チェック：本番環境では低品質レッスンを非表示
                    if (
                      !isDebugMode &&
                      !availableLessonIds.includes(lessonId)
                    ) {
                      return null;
                    }

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
                    const qualityInfo = getLessonQuality(lessonId);

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
                            {/* 品質バッジ（デバッグモードのみ） */}
                            {isDebugMode && qualityInfo && (
                              <span
                                className={`quality-badge quality-${qualityInfo.level}`}
                                title={`品質: ${qualityInfo.level} (${qualityInfo.completionScore}%)`}
                              >
                                {qualityInfo.level === 'production'
                                  ? '✨'
                                  : qualityInfo.level === 'beta'
                                    ? '🔧'
                                    : qualityInfo.level === 'draft'
                                      ? '📝'
                                      : '💭'}
                              </span>
                            )}
                          </h3>
                          <p className="lesson-description">
                            {lesson.description}
                            {/* 品質情報（デバッグモードのみ） */}
                            {isDebugMode &&
                              qualityInfo &&
                              qualityInfo.issues.length > 0 && (
                                <span className="quality-issues">
                                  <br />
                                  🔧 {qualityInfo.issues.join(', ')}
                                </span>
                              )}
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
                            {/* 品質スコア（デバッグモードのみ） */}
                            {isDebugMode && qualityInfo && (
                              <span className="lesson-quality-score">
                                品質: {qualityInfo.completionScore}%
                              </span>
                            )}
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
          <div className="lesson-fixed-header">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentStepIndex(0);
              }}
              className="header-nav-button"
              title={`${TERMS.LESSON_LIST}に${TERMS.BACK}`}
            >
              ←
            </button>
            <h3 className="header-title">{selectedLesson.title}</h3>
            <div className="header-actions">
              {onOpenHelp && (
                <button
                  onClick={onOpenHelp}
                  className="header-nav-button"
                  title={TERMS.HELP}
                >
                  ❓
                </button>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="header-nav-button"
                title={TERMS.MINIMIZE}
              >
                ―
              </button>
              <button
                onClick={onClose}
                className="header-nav-button"
                title={TERMS.CLOSE}
              >
                ×
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
              </>
            ) : (
              // レッスン完了画面
              <div className="lesson-complete">
                <div className="completion-content">
                  <div className="completion-icon-wrapper">
                    <div className="completion-icon">✨</div>
                    <div className="completion-icon-bg"></div>
                  </div>
                  <h2 className="completion-title">素晴らしい！</h2>
                  <p className="completion-subtitle">
                    「{selectedLesson.title}」を完全マスター
                  </p>
                  <div className="completion-stats">
                    <div className="completion-stat">
                      <div className="stat-icon">⏱️</div>
                      <span className="stat-value">
                        {selectedLesson.estimatedMinutes}分
                      </span>
                      <span className="stat-label">{TERMS.LEARNING_TIME}</span>
                    </div>
                    <div className="completion-stat">
                      <div className="stat-icon">📝</div>
                      <span className="stat-value">
                        {selectedLesson.steps.length}
                      </span>
                      <span className="stat-label">{TERMS.STEP_COUNT}</span>
                    </div>
                    <div className="completion-stat">
                      <div className="stat-icon">🏆</div>
                      <span className="stat-value">
                        {Math.round(
                          ((completedLessons.size + 1) / lessons.length) * 100
                        )}
                        %
                      </span>
                      <span className="stat-label">
                        {TERMS.OVERALL_PROGRESS}
                      </span>
                    </div>
                  </div>
                  <div className="completion-actions">
                    <button
                      onClick={() => {
                        setSelectedLesson(null);
                        setCurrentStepIndex(0);
                      }}
                      className="completion-button primary"
                    >
                      {TERMS.LESSON_LIST}へ
                    </button>
                    {selectedLesson.id === 'half-adder' && (
                      <button
                        onClick={() => handleStartLesson('full-adder')}
                        className="completion-button secondary"
                      >
                        {TERMS.NEXT_LESSON}へ →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 固定フッターナビゲーション */}
          {selectedLesson && currentStepIndex < selectedLesson.steps.length && (
            <div className="lesson-fixed-footer">
              <button
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0}
                className="footer-nav-button prev"
                title={TERMS.PREVIOUS_STEP}
              >
                ◀ {TERMS.PREVIOUS}
              </button>
              <div className="nav-dots">
                {selectedLesson.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`nav-dot ${index === currentStepIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
              <button
                onClick={handleNextStep}
                disabled={
                  currentStep?.content?.some(c => c.type === 'quiz') &&
                  !quizAnswered
                }
                className="footer-nav-button next"
                title={
                  currentStepIndex === selectedLesson.steps.length - 1
                    ? TERMS.COMPLETE
                    : TERMS.NEXT_STEP
                }
              >
                {currentStepIndex === selectedLesson.steps.length - 1
                  ? `${TERMS.COMPLETE} ✓`
                  : `${TERMS.NEXT} ▶`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
