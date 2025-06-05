import React from 'react';
import type { StructuredLessonStep } from '../types/lesson-content';
import { ContentRenderer } from './content-renderers';

interface LessonStepRendererProps {
  step: StructuredLessonStep;
  onQuizAnswer?: (isCorrect: boolean) => void;
}

export const LessonStepRenderer: React.FC<LessonStepRendererProps> = ({ 
  step, 
  onQuizAnswer 
}) => {
  return (
    <div className="step-content">
      {/* 基本の指示文 */}
      <div className="step-instruction">
        {step.instruction}
      </div>
      
      {/* ヒント */}
      {step.hint && (
        <div className="step-hint">
          💡 <span>{step.hint}</span>
        </div>
      )}
      
      {/* 構造化されたコンテンツ */}
      {step.content && step.content.length > 0 && (
        <div className="step-structured-content">
          {step.action.type === 'explanation' ? (
            <div className="step-explanation">
              <div className="explanation-icon">🧠</div>
              <div className="explanation-content">
                {step.content.map((content, index) => (
                  <ContentRenderer 
                    key={index} 
                    content={content} 
                    onQuizAnswer={onQuizAnswer}
                  />
                ))}
              </div>
            </div>
          ) : (
            // クイズや他のコンテンツは直接レンダリング
            step.content.map((content, index) => (
              <ContentRenderer 
                key={index} 
                content={content} 
                onQuizAnswer={onQuizAnswer}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};