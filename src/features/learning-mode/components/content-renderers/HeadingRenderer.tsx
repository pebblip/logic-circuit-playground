import React from 'react';
import type { HeadingContent } from '../../types/lesson-content';

interface HeadingRendererProps {
  content: HeadingContent;
}

export const HeadingRenderer: React.FC<HeadingRendererProps> = ({ content }) => {
  const Tag = `h${content.level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className="explanation-heading">
      {content.icon && <span className="heading-icon">{content.icon}</span>}
      {content.text}
    </Tag>
  );
};