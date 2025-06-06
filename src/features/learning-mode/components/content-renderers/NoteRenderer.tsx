import React from 'react';
import type { NoteContent } from '../../../../types/lesson-content';

interface NoteRendererProps {
  content: NoteContent;
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({ content }) => {
  const variantClass = content.variant || 'info';

  return (
    <div className={`lesson-note lesson-note-${variantClass}`}>
      {content.icon && <span className="note-icon">{content.icon}</span>}
      <span className="note-text">{content.text}</span>
    </div>
  );
};
