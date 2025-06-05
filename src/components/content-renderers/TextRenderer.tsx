import React from 'react';
import type { TextContent } from '../../types/lesson-content';

interface TextRendererProps {
  content: TextContent;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ content }) => {
  return <p className="explanation-paragraph">{content.text}</p>;
};