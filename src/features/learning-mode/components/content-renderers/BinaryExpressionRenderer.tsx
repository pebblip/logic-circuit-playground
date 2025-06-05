import React from 'react';
import type { BinaryExpression, BinaryExpressionContent } from '../../types/lesson-content';

interface BinaryExpressionRendererProps {
  content: BinaryExpressionContent | BinaryExpression;
}

export const BinaryExpressionRenderer: React.FC<BinaryExpressionRendererProps> = ({ content }) => {
  // 単一の式か複数の式かを判定
  const expressions = 'expressions' in content ? content.expressions : [content];
  
  const renderExpression = (expr: BinaryExpression, isExperimentResult = false) => {
    const className = isExperimentResult ? "experiment-result" : "binary-expression";
    const inputClass = isExperimentResult ? "exp-input" : "input";
    const operatorClass = isExperimentResult ? "exp-operator" : "operator";
    const equalsClass = isExperimentResult ? "exp-equals" : "equals";
    const outputClass = isExperimentResult ? "exp-output" : "output";
    
    return (
      <span className={className}>
        <span className={inputClass}>{expr.left}</span>
        <span className={operatorClass}> {expr.operator} </span>
        <span className={inputClass}>{expr.right}</span>
        {expr.result !== undefined && (
          <>
            <span className={equalsClass}> = </span>
            <span className={outputClass}>{expr.result}</span>
          </>
        )}
      </span>
    );
  };
  
  if (expressions.length === 1) {
    return renderExpression(expressions[0]);
  }
  
  return (
    <div className="binary-expressions">
      {expressions.map((expr, index) => (
        <React.Fragment key={index}>
          {renderExpression(expr)}
          {index < expressions.length - 1 && <span className="separator">, </span>}
        </React.Fragment>
      ))}
    </div>
  );
};