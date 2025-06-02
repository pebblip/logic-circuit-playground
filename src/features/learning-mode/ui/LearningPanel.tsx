import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../../stores/circuitStore';
import { lessons, lessonCategories, Lesson, LessonStep } from '../data/lessons';

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

      <style jsx>{`
        .learning-panel {
          position: fixed;
          top: 60px;
          right: 20px;
          width: 400px;
          max-height: calc(100vh - 100px);
          background: #0f1441;
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(0, 255, 136, 0.05);
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 18px;
          color: #00ff88;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .lesson-categories {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .lesson-category {
          margin-bottom: 24px;
        }

        .lesson-category h3 {
          color: #00ff88;
          font-size: 14px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .lesson-grid {
          display: grid;
          gap: 12px;
        }

        .lesson-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .lesson-card:hover:not(:disabled) {
          background: rgba(0, 255, 136, 0.05);
          border-color: rgba(0, 255, 136, 0.3);
          transform: translateY(-2px);
        }

        .lesson-card.completed {
          border-color: rgba(0, 255, 136, 0.5);
          background: rgba(0, 255, 136, 0.05);
        }

        .lesson-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lesson-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .lesson-card h4 {
          color: white;
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .lesson-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .lesson-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
        }

        .difficulty {
          color: #ff6699;
          text-transform: uppercase;
        }

        .duration {
          color: #00ff88;
        }

        .lesson-player {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .lesson-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(0, 255, 136, 0.05);
          border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .back-button {
          background: transparent;
          border: none;
          color: #00ff88;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(0, 255, 136, 0.1);
        }

        .progress {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .lesson-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .step-instruction {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .step-instruction p {
          color: white;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .hint {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 6px;
          color: #ffd700;
          font-size: 13px;
        }

        .quiz {
          margin-bottom: 20px;
        }

        .quiz h4 {
          color: white;
          margin: 0 0 16px 0;
        }

        .quiz-options {
          display: grid;
          gap: 8px;
        }

        .quiz-option {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 12px 16px;
          color: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .quiz-option:hover {
          background: rgba(0, 255, 136, 0.1);
          border-color: rgba(0, 255, 136, 0.3);
        }

        .step-controls {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 20px;
        }

        .prev-button, .next-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .prev-button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
        }

        .prev-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
        }

        .prev-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .next-button {
          background: #00ff88;
          border: none;
          color: #000;
        }

        .next-button:hover {
          background: #00cc6a;
          transform: translateY(-1px);
        }

        .lesson-complete {
          text-align: center;
          padding: 40px;
        }

        .celebration {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .lesson-complete h3 {
          color: #00ff88;
          margin: 0 0 12px 0;
          font-size: 24px;
        }

        .lesson-complete p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .completion-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .learning-panel {
            position: fixed;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            width: 100%;
            max-height: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};