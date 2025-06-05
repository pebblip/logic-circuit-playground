import React from 'react';
import type { Content } from '../../types/lesson-content';
import { TextRenderer } from './TextRenderer';
import { HeadingRenderer } from './HeadingRenderer';
import { ListRenderer } from './ListRenderer';
import { TableRenderer } from './TableRenderer';
import { BinaryExpressionRenderer } from './BinaryExpressionRenderer';
import { ComparisonRenderer } from './ComparisonRenderer';
import { ExperimentResultRenderer } from './ExperimentResultRenderer';
import { QuizRenderer } from './QuizRenderer';
import { NoteRenderer } from './NoteRenderer';

interface ContentRendererProps {
  content: Content[];
  onQuizAnswer?: (correct: boolean) => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onQuizAnswer }) => {
  return (
    <>
      {content.map((item, index) => {
        const key = item.id || `content-${index}`;
        
        switch (item.type) {
          case 'text':
            return <TextRenderer key={key} content={item} />;
          case 'heading':
            return <HeadingRenderer key={key} content={item} />;
          case 'list':
            return <ListRenderer key={key} content={item} />;
          case 'table':
            return <TableRenderer key={key} content={item} />;
          case 'binary-expression':
            return <BinaryExpressionRenderer key={key} content={item} />;
          case 'comparison':
            return <ComparisonRenderer key={key} content={item} />;
          case 'experiment-result':
            return <ExperimentResultRenderer key={key} content={item} />;
          case 'quiz':
            return <QuizRenderer key={key} content={item} onAnswer={onQuizAnswer} />;
          case 'note':
            return <NoteRenderer key={key} content={item} />;
          default:
            return null;
        }
      })}
    </>
  );
};