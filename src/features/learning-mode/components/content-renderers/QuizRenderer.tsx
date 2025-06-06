import React, { useState } from 'react';
import type { QuizContent } from '../../../../types/lesson-content';

interface QuizRendererProps {
  content: QuizContent;
  onAnswer?: (isCorrect: boolean) => void;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  content,
  onAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (onAnswer) {
      onAnswer(index === content.correctIndex);
    }
  };

  const isCorrect = selectedAnswer === content.correctIndex;
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="quiz-section">
      <h3 className="quiz-question">{content.question}</h3>
      <div className="quiz-options">
        {content.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => handleAnswer(index)}
            disabled={hasAnswered}
          >
            {option}
          </button>
        ))}
      </div>
      {hasAnswered && !isCorrect && (
        <div className="quiz-feedback incorrect">
          もう一度考えてみましょう！
        </div>
      )}
      {isCorrect && <div className="quiz-feedback correct">正解です！🎉</div>}
    </div>
  );
};
