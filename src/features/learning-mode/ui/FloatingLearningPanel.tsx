import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import type { StructuredLesson } from '../../../types/lesson-content';
import { lessons, lessonCategories, getLearningStats } from '../data/lessons';
import { LessonStepRenderer } from '../components/LessonStepRenderer';
import type { GateType } from '../../../types/circuit';
import { TERMS } from '../data/terms';
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

interface FloatingLearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp?: () => void;
}

// Picture-in-Picture用の初期設定
const DEFAULT_POSITION = { x: 100, y: 100 };
const DEFAULT_SIZE = { width: 400, height: 600 };
const MIN_SIZE = { width: 300, height: 400 };

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

export const FloatingLearningPanel: React.FC<FloatingLearningPanelProps> = ({
  isOpen,
  onClose,
  onOpenHelp: _onOpenHelp,
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

  // Picture-in-Picture 状態
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const { gates, wires, clearAll, setAllowedGates } = useCircuitStore();

  const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

  const stats = getLearningStats(completedLessons);

  // ドラッグ開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).classList.contains('floating-panel-header')
      ) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position]
  );

  // ドラッグ処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)
        );
        const newY = Math.max(
          0,
          Math.min(window.innerHeight - size.height, e.clientY - dragStart.y)
        );
        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging, dragStart, size]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // マウスイベント登録
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // リサイズハンドル
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      setDragStart({
        x: e.clientX - size.width,
        y: e.clientY - size.height,
      });
    },
    [size]
  );

  // リサイズ処理
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(MIN_SIZE.width, e.clientX - position.x);
        const newHeight = Math.max(MIN_SIZE.height, e.clientY - position.y);
        setSize({ width: newWidth, height: newHeight });
      }
    },
    [isResizing, position]
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isResizing, handleResizeMove, handleMouseUp]);

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

  // 最小化時の表示（Picture-in-Picture風）
  if (isMinimized) {
    return (
      <div
        className="floating-learning-panel minimized"
        style={{
          left: position.x,
          top: position.y,
          position: 'fixed',
          zIndex: 1000,
          width: 'auto',
          height: 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
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
            onClick={e => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            title={`パネルを${TERMS.EXPAND}`}
          >
            ▼
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="floating-learning-panel"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        position: 'fixed',
        zIndex: 1000,
        background: 'rgba(10, 10, 10, 0.95)',
        border: '2px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ドラッグ可能なヘッダー */}
      <div
        className="floating-panel-header"
        style={{
          padding: '12px 16px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎓</span>
          <span
            style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '14px' }}
          >
            {selectedLesson ? selectedLesson.title : TERMS.LEARNING_MODE}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="header-control-button"
            title={TERMS.MINIMIZE}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            ―
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="header-control-button"
            title={TERMS.CLOSE}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {!selectedLesson ? (
          // メイン学習画面（コンパクト版）
          <div className="floating-learning-home">
            <div className="floating-learning-stats">
              <div className="compact-stat-card">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">{TERMS.COMPLETED_LESSONS}</div>
              </div>
              <div className="compact-stat-card">
                <div className="stat-number">{stats.progress}%</div>
                <div className="stat-label">{TERMS.PROGRESS_RATE}</div>
              </div>
            </div>

            <div className="floating-learning-content">
              {Object.entries(lessonCategories).map(
                ([categoryKey, category]) => (
                  <div key={categoryKey} className="compact-phase-section">
                    <div className="compact-phase-header">
                      <h3 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>
                        {category.title}
                      </h3>
                      <div className="compact-phase-progress">
                        <div
                          className="compact-phase-progress-bar"
                          style={{
                            width: `${(category.lessons.filter(id => completedLessons.has(id)).length / category.lessons.length) * 100}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="compact-lessons-grid">
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
                            className={`compact-lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() =>
                              !isLocked && handleStartLesson(lessonId)
                            }
                            style={{
                              padding: '8px',
                              margin: '4px 0',
                              borderRadius: '6px',
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              background: isCompleted
                                ? 'rgba(0, 255, 136, 0.1)'
                                : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${isCompleted ? category.color : 'rgba(255, 255, 255, 0.1)'}`,
                              opacity: isLocked ? 0.5 : 1,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>
                                {isCompleted
                                  ? '✅'
                                  : isLocked && !isDebugMode
                                    ? '🔒'
                                    : lesson.icon}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    marginBottom: '2px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {lesson.title}
                                  {isNewFormat && (
                                    <span
                                      style={{
                                        marginLeft: '4px',
                                        fontSize: '10px',
                                        background: '#00ff88',
                                        color: '#000',
                                        padding: '1px 4px',
                                        borderRadius: '2px',
                                      }}
                                    >
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    display: 'flex',
                                    gap: '8px',
                                  }}
                                >
                                  <span>
                                    {lesson.difficulty === 'beginner'
                                      ? '初級'
                                      : lesson.difficulty === 'intermediate'
                                        ? '中級'
                                        : '上級'}
                                  </span>
                                  <span>{lesson.estimatedMinutes}分</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          // レッスン実行画面（コンパクト版）
          <div className="floating-lesson-player">
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => {
                  setSelectedLesson(null);
                  setCurrentStepIndex(0);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                title={`${TERMS.LESSON_LIST}に${TERMS.BACK}`}
              >
                ← {TERMS.LESSON_LIST}
              </button>
            </div>

            <div className="floating-lesson-content">
              {currentStepIndex < selectedLesson.steps.length && currentStep ? (
                <LessonStepRenderer
                  step={currentStep}
                  onQuizAnswer={handleQuizAnswer}
                />
              ) : (
                // レッスン完了画面（コンパクト版）
                <div className="compact-lesson-complete">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                      ✨
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      素晴らしい！
                    </h3>
                    <p
                      style={{
                        margin: '0 0 16px 0',
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      「{selectedLesson.title}」を完全マスター
                    </p>
                    <button
                      onClick={() => {
                        setSelectedLesson(null);
                        setCurrentStepIndex(0);
                      }}
                      style={{
                        background: '#00ff88',
                        color: '#000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {TERMS.LESSON_LIST}へ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* コンパクトナビゲーション */}
            {selectedLesson &&
              currentStepIndex < selectedLesson.steps.length && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={handlePreviousStep}
                    disabled={currentStepIndex === 0}
                    style={{
                      background:
                        currentStepIndex === 0
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 255, 136, 0.2)',
                      border: 'none',
                      color:
                        currentStepIndex === 0
                          ? 'rgba(255, 255, 255, 0.3)'
                          : '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor:
                        currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                    }}
                    title={TERMS.PREVIOUS_STEP}
                  >
                    ◀ {TERMS.PREVIOUS}
                  </button>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      textAlign: 'center',
                    }}
                  >
                    {currentStepIndex + 1} / {selectedLesson.steps.length}
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={
                      currentStep?.content?.some(c => c.type === 'quiz') &&
                      !quizAnswered
                    }
                    style={{
                      background:
                        currentStep?.content?.some(c => c.type === 'quiz') &&
                        !quizAnswered
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 255, 136, 0.2)',
                      border: 'none',
                      color:
                        currentStep?.content?.some(c => c.type === 'quiz') &&
                        !quizAnswered
                          ? 'rgba(255, 255, 255, 0.3)'
                          : '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor:
                        currentStep?.content?.some(c => c.type === 'quiz') &&
                        !quizAnswered
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '11px',
                    }}
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

      {/* リサイズハンドル */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          cursor: 'se-resize',
          background: 'rgba(0, 255, 136, 0.3)',
          borderRadius: '12px 0 12px 0',
        }}
        onMouseDown={handleResizeStart}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderBottom: '8px solid rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>
    </div>
  );
};
