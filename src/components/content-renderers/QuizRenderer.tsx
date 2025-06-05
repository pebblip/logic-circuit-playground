import React, { useState } from 'react';
import type { QuizContent } from '../../types/lesson-content';

interface QuizRendererProps {
  content: QuizContent;
  onAnswer?: (correct: boolean) => void;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({ content, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (onAnswer) {
      onAnswer(index === content.correct);
    }
  };
  
  return (
    <div className="quiz-section">
      <h3 className="quiz-question">{content.question}</h3>
      <div className="quiz-options">
        {content.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => handleAnswer(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedAnswer !== null && selectedAnswer !== content.correct && (
        <div className="quiz-feedback incorrect">
          もう一度考えてみましょう！
        </div>
      )}
      {selectedAnswer === content.correct && (
        <div className="quiz-feedback correct">
          正解です！🎉
        </div>
      )}
    </div>
  );
};