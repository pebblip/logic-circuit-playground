import React from 'react';
import type { ComparisonContent } from '../../types/lesson-content';
import { renderBinaryExpression } from './BinaryExpressionRenderer';

interface ComparisonRendererProps {
  content: ComparisonContent;
}

export const ComparisonRenderer: React.FC<ComparisonRendererProps> = ({ content }) => {
  return (
    <div className="comparison-table">
      {content.items.map((item, index) => (
        <div key={index} className="comparison-row">
          <span className={`gate-label gate-label-${item.gateType.toLowerCase()}`}>
            {item.gateType}
          </span>
          <span className="gate-values">
            {item.expressions.map((expr, exprIndex) => (
              <span key={exprIndex} className="value-item">
                {renderBinaryExpression(expr)}
                {/* カンマは最後の要素には付けない */}
                {exprIndex < item.expressions.length - 1 && (
                  <span className="separator">, </span>
                )}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};