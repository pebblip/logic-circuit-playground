import React from 'react';
import type { ListContent } from '../../types/lesson-content';

interface ListRendererProps {
  content: ListContent;
}

export const ListRenderer: React.FC<ListRendererProps> = ({ content }) => {
  const Tag = content.ordered ? 'ol' : 'ul';
  const className = content.ordered ? 'explanation-ordered-list' : 'explanation-list';
  
  return (
    <Tag className={className}>
      {content.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
};