import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import { lessons, lessonCategories, Lesson, LessonStep } from '../data/lessons';
import './LearningPanel.css';

interface LearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningPanel: React.FC<LearningPanelProps> = ({ isOpen, onClose }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('completedLessons') || '[]'))
  );

  const { gates, wires, selectedGateId } = useCircuitStore();

  // 現在のステップ
  const currentStep = selectedLesson?.steps[currentStepIndex];

  // レッスン完了時の処理
  useEffect(() => {
    if (selectedLesson && currentStepIndex >= selectedLesson.steps.length) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(selectedLesson.id);
      setCompletedLessons(newCompleted);
      localStorage.setItem('completedLessons', JSON.stringify([...newCompleted]));
      
      // 完了画面を表示
      setTimeout(() => {
        setSelectedLesson(null);
        setCurrentStepIndex(0);
        setCompletedSteps(new Set());
      }, 3000);
    }
  }, [currentStepIndex, selectedLesson, completedLessons]);

  // ステップの進行
  const handleNextStep = () => {
    if (currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      
      // 回路をクリア（オプション）
      // clearCircuit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="learning-panel">
      <div className="panel-header">
        <h2>
          <span className="icon">🎓</span>
          学習モード
        </h2>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      {!selectedLesson ? (
        // レッスン選択画面
        <div className="lesson-categories">
          {Object.entries(lessonCategories).map(([key, category]) => (
            <div key={key} className="lesson-category">
              <h3>{category.title}</h3>
              <div className="lesson-grid">
                {category.lessons.map(lessonId => {
                  const lesson = lessons.find(l => l.id === lessonId);
                  if (!lesson) return null;
                  
                  const isCompleted = completedLessons.has(lessonId);
                  const isLocked = lesson.prerequisites.some(
                    prereq => !completedLessons.has(prereq)
                  );
                  
                  return (
                    <button
                      key={lessonId}
                      className={`lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => !isLocked && handleStartLesson(lessonId)}
                      disabled={isLocked}
                    >
                      <div className="lesson-icon">
                        {isCompleted ? '✅' : isLocked ? '🔒' : '📚'}
                      </div>
                      <h4>{lesson.title}</h4>
                      <p>{lesson.description}</p>
                      <div className="lesson-meta">
                        <span className="difficulty">{lesson.difficulty}</span>
                        <span className="duration">{lesson.estimatedMinutes}分</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // レッスン実行画面
        <div className="lesson-player">
          <div className="lesson-header">
            <button onClick={() => setSelectedLesson(null)} className="back-button">
              ← 戻る
            </button>
            <h3>{selectedLesson.title}</h3>
            <div className="progress">
              {currentStepIndex + 1} / {selectedLesson.steps.length}
            </div>
          </div>

          <div className="lesson-content">
            {currentStepIndex < selectedLesson.steps.length ? (
              <>
                <div className="step-instruction">
                  <p>{currentStep?.instruction}</p>
                  {currentStep?.hint && (
                    <div className="hint">
                      💡 ヒント: {currentStep.hint}
                    </div>
                  )}
                </div>

                {currentStep?.action.type === 'quiz' && (
                  <div className="quiz">
                    <h4>{currentStep.action.question}</h4>
                    <div className="quiz-options">
                      {currentStep.action.options.map((option, index) => (
                        <button
                          key={index}
                          className="quiz-option"
                          onClick={() => {
                            if (index === currentStep.action.correct) {
                              handleNextStep();
                            } else {
                              // 不正解のフィードバック
                            }
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="step-controls">
                  <button
                    onClick={handlePreviousStep}
                    disabled={currentStepIndex === 0}
                    className="prev-button"
                  >
                    前へ
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="next-button"
                  >
                    {currentStep?.action.type === 'observe' ? '次へ' : 'スキップ'}
                  </button>
                </div>
              </>
            ) : (
              // レッスン完了画面
              <div className="lesson-complete">
                <div className="celebration">🎉</div>
                <h3>おめでとうございます！</h3>
                <p>{selectedLesson.title}を完了しました！</p>
                <div className="completion-stats">
                  <div>学習時間: {selectedLesson.estimatedMinutes}分</div>
                  <div>完了ステップ: {selectedLesson.steps.length}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};