import React from 'react';
import type { ComparisonContent } from '../../types/lesson-content';
import { BinaryExpressionRenderer } from './BinaryExpressionRenderer';

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
            {item.values.map((value, vIdx) => (
              <React.Fragment key={vIdx}>
                <span className="value-item">
                  <BinaryExpressionRenderer content={value} />
                </span>
                {vIdx < item.values.length - 1 && <span className="separator">, </span>}
              </React.Fragment>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};