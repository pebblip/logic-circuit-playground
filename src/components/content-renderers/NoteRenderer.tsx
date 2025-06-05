import React from 'react';
import type { NoteContent } from '../../types/lesson-content';

interface NoteRendererProps {
  content: NoteContent;
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({ content }) => {
  const icon = content.icon || '💡';
  const variantClass = content.variant || 'tip';
  
  return (
    <div className={`step-hint note-${variantClass}`}>
      <span>{icon}</span> <span>{content.text}</span>
    </div>
  );
};