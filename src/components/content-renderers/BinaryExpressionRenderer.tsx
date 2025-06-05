import React from 'react';
import type { BinaryExpressionContent, BinaryExpression } from '../../types/lesson-content';

interface BinaryExpressionRendererProps {
  content: BinaryExpressionContent;
  className?: string;
}

// 単一の2進数式をレンダリング
export const renderBinaryExpression = (expr: BinaryExpression, className: string = 'binary-expression') => {
  return (
    <span className={className}>
      <span className="input">{expr.input1}</span>
      <span className="operator"> {expr.operator} </span>
      <span className="input">{expr.input2}</span>
      <span className="equals"> = </span>
      <span className="output">{expr.output}</span>
    </span>
  );
};

export const BinaryExpressionRenderer: React.FC<BinaryExpressionRendererProps> = ({ content, className }) => {
  return renderBinaryExpression(content.expression, className);
};