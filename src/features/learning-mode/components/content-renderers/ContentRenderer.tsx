import React from 'react';
import type { ContentElement } from '../../types/lesson-content';
import { TextRenderer } from './TextRenderer';
import { HeadingRenderer } from './HeadingRenderer';
import { ListRenderer } from './ListRenderer';
import { TableRenderer } from './TableRenderer';
import { BinaryExpressionRenderer } from './BinaryExpressionRenderer';
import { ComparisonRenderer } from './ComparisonRenderer';
import { ExperimentResultRenderer } from './ExperimentResultRenderer';
import { QuizRenderer } from './QuizRenderer';

interface ContentRendererProps {
  content: ContentElement;
  onQuizAnswer?: (isCorrect: boolean) => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onQuizAnswer }) => {
  switch (content.type) {
    case 'text':
      return <TextRenderer content={content} />;
      
    case 'heading':
      return <HeadingRenderer content={content} />;
      
    case 'list':
      return <ListRenderer content={content} />;
      
    case 'table':
      return <TableRenderer content={content} />;
      
    case 'binary-expression':
      return <BinaryExpressionRenderer content={content} />;
      
    case 'comparison':
      return <ComparisonRenderer content={content} />;
      
    case 'experiment-result':
      return <ExperimentResultRenderer content={content} />;
      
    case 'quiz':
      return <QuizRenderer content={content} onAnswer={onQuizAnswer} />;
      
    case 'code':
      return (
        <pre className="code-block">
          <code className={`language-${content.language}`}>
            {content.code}
          </code>
        </pre>
      );
      
    case 'image':
      return (
        <figure className="lesson-image">
          <img src={content.src} alt={content.alt} />
          {content.caption && <figcaption>{content.caption}</figcaption>}
        </figure>
      );
      
    default:
      console.warn('Unknown content type:', (content as any).type);
      return null;
  }
};