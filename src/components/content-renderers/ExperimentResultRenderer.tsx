import React from 'react';
import type { ExperimentResultContent } from '../../types/lesson-content';
import { renderBinaryExpression } from './BinaryExpressionRenderer';

interface ExperimentResultRendererProps {
  content: ExperimentResultContent;
}

export const ExperimentResultRenderer: React.FC<ExperimentResultRendererProps> = ({ content }) => {
  return (
    <div className="experiment-results-section">
      <h4 className="explanation-heading">{content.title}</h4>
      <div className="experiment-results-grid">
        {content.results.map((result, index) => (
          <div key={index}>
            {renderBinaryExpression(result, 'experiment-result')}
          </div>
        ))}
      </div>
      {content.note && (
        <div className="expression-note">
          <span className="note-icon">💡</span>
          <span>{content.note}</span>
        </div>
      )}
    </div>
  );
};