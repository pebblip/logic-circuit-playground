import React from 'react';
import type { AsciiArtContent } from '../../../../types/lesson-content';

interface AsciiArtRendererProps {
  content: AsciiArtContent;
}

export const AsciiArtRenderer: React.FC<AsciiArtRendererProps> = ({
  content,
}) => {
  return (
    <div className={`ascii-art-container ${content.className || ''}`}>
      {content.title && (
        <div className="ascii-art-title">{content.title}</div>
      )}
      <pre className="ascii-art">
        <code>{content.art}</code>
      </pre>
    </div>
  );
};