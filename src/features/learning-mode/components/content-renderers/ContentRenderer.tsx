import React from 'react';
import type { Content } from '../../../../types/lesson-content';
import { TextRenderer } from './TextRenderer';
import { RichTextRenderer } from './RichTextRenderer';
import { HeadingRenderer } from './HeadingRenderer';
import { ListRenderer } from './ListRenderer';
import { TableRenderer } from './TableRenderer';
import { BinaryExpressionRenderer } from './BinaryExpressionRenderer';
import { ComparisonRenderer } from './ComparisonRenderer';
import { ExperimentResultRenderer } from './ExperimentResultRenderer';
import { QuizRenderer } from './QuizRenderer';
import { NoteRenderer } from './NoteRenderer';
import { AsciiArtRenderer } from './AsciiArtRenderer';
import { CircuitDiagramRenderer } from './CircuitDiagramRenderer';
import { CircuitDiagramRendererV2 } from './CircuitDiagramRendererV2';
import { DigitalSignalRenderer, VoltageSignalRenderer, BitPatternTable } from './DigitalSignalRenderer';
import { SvgDiagramRenderer } from './SvgDiagramRenderer';

interface ContentRendererProps {
  content: Content;
  onQuizAnswer?: (isCorrect: boolean) => void;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  onQuizAnswer,
}) => {
  switch (content.type) {
    case 'text':
      return <TextRenderer content={content} />;

    case 'rich-text':
      return <RichTextRenderer content={content} />;

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

    case 'note':
      return <NoteRenderer content={content} />;

    case 'ascii-art':
      return <AsciiArtRenderer content={content} />;

    case 'diagram':
      return <CircuitDiagramRenderer content={content} />;

    case 'circuit-diagram-v2':
      return <CircuitDiagramRendererV2 content={content} />;

    case 'digital-signal':
      return <DigitalSignalRenderer {...content} />;

    case 'voltage-signal':
      return <VoltageSignalRenderer />;

    case 'bit-pattern':
      return <BitPatternTable />;

    case 'svg-diagram':
      return <SvgDiagramRenderer content={content} />;

    default:
      console.warn(
        'Unknown content type:',
        (content as { type: unknown }).type
      );
      return null;
  }
};
