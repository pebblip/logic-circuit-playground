/**
 * Learning Mode Content Renderers Tests
 * 
 * 学習モードのコンテンツレンダラーの主要機能をテストします：
 * 1. テキストレンダリング
 * 2. 見出しレンダリング
 * 3. リストレンダリング
 * 4. クイズレンダリング
 * 5. ノート・ヒントレンダリング
 * 6. テーブルレンダリング
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextRenderer } from '@features/learning-mode/components/content-renderers/TextRenderer';
import { HeadingRenderer } from '@features/learning-mode/components/content-renderers/HeadingRenderer';
import { ListRenderer } from '@features/learning-mode/components/content-renderers/ListRenderer';
import { QuizRenderer } from '@features/learning-mode/components/content-renderers/QuizRenderer';
import { NoteRenderer } from '@features/learning-mode/components/content-renderers/NoteRenderer';
import { TableRenderer } from '@features/learning-mode/components/content-renderers/TableRenderer';
import type {
  TextContent,
  HeadingContent,
  ListContent,
  QuizContent,
  NoteContent,
  TableContent,
} from '@/types/lesson-content';

describe('Learning Mode Content Renderers', () => {
  describe('TextRenderer', () => {
    it('should render text content correctly', () => {
      const content: TextContent = {
        type: 'text',
        text: 'これはテストテキストです。',
      };

      render(<TextRenderer content={content} />);
      
      expect(screen.getByText('これはテストテキストです。')).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const content: TextContent = {
        type: 'text',
        text: 'カスタムクラステキスト',
        className: 'custom-text-class',
      };

      const { container } = render(<TextRenderer content={content} />);
      
      expect(container.firstChild).toHaveClass('explanation-paragraph');
      expect(container.firstChild).toHaveClass('custom-text-class');
    });

    it('should handle empty text', () => {
      const content: TextContent = {
        type: 'text',
        text: '',
      };

      const { container } = render(<TextRenderer content={content} />);
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveTextContent('');
    });
  });

  describe('HeadingRenderer', () => {
    it('should render heading with default level h2', () => {
      const content: HeadingContent = {
        type: 'heading',
        text: 'テスト見出し',
      };

      render(<HeadingRenderer content={content} />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('テスト見出し');
      expect(heading).toHaveClass('explanation-heading');
    });

    it('should render heading with specified level', () => {
      const content: HeadingContent = {
        type: 'heading',
        text: 'H1見出し',
        level: 1,
      };

      render(<HeadingRenderer content={content} />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('H1見出し');
    });

    it('should render heading with icon', () => {
      const content: HeadingContent = {
        type: 'heading',
        text: 'アイコン付き見出し',
        icon: '🎯',
        level: 3,
      };

      render(<HeadingRenderer content={content} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('🎯アイコン付き見出し');
      
      const icon = heading.querySelector('.heading-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🎯');
    });

    it('should handle all heading levels', () => {
      const levels = [1, 2, 3, 4] as const;
      
      levels.forEach(level => {
        const content: HeadingContent = {
          type: 'heading',
          text: `Level ${level} 見出し`,
          level,
        };

        const { unmount } = render(<HeadingRenderer content={content} />);
        
        const heading = screen.getByRole('heading', { level });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(`Level ${level} 見出し`);
        
        unmount();
      });
    });
  });

  describe('ListRenderer', () => {
    it('should render unordered list correctly', () => {
      const content: ListContent = {
        type: 'list',
        ordered: false,
        items: ['項目1', '項目2', '項目3'],
      };

      render(<ListRenderer content={content} />);
      
      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');
      
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('項目1');
      expect(items[1]).toHaveTextContent('項目2');
      expect(items[2]).toHaveTextContent('項目3');
    });

    it('should render ordered list correctly', () => {
      const content: ListContent = {
        type: 'list',
        ordered: true,
        items: ['最初のステップ', '次のステップ', '最後のステップ'],
      };

      render(<ListRenderer content={content} />);
      
      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('最初のステップ');
      expect(items[1]).toHaveTextContent('次のステップ');
      expect(items[2]).toHaveTextContent('最後のステップ');
    });

    it('should handle empty list', () => {
      const content: ListContent = {
        type: 'list',
        ordered: false,
        items: [],
      };

      render(<ListRenderer content={content} />);
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      
      const items = screen.queryAllByRole('listitem');
      expect(items).toHaveLength(0);
    });
  });

  describe('QuizRenderer', () => {
    it('should render quiz with all options', () => {
      const content: QuizContent = {
        type: 'quiz',
        question: 'NOTゲートの出力は何ですか？',
        options: ['入力と同じ', '入力の逆', '常にtrue', '常にfalse'],
        correctIndex: 1,
      };

      render(<QuizRenderer content={content} />);
      
      expect(screen.getByText('NOTゲートの出力は何ですか？')).toBeInTheDocument();
      
      const options = screen.getAllByRole('button');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('入力と同じ');
      expect(options[1]).toHaveTextContent('入力の逆');
      expect(options[2]).toHaveTextContent('常にtrue');
      expect(options[3]).toHaveTextContent('常にfalse');
    });

    it('should handle correct answer selection', () => {
      const onAnswerMock = vi.fn();
      const content: QuizContent = {
        type: 'quiz',
        question: 'テスト質問',
        options: ['選択肢A', '正解B', '選択肢C'],
        correctIndex: 1,
      };

      render(<QuizRenderer content={content} onAnswer={onAnswerMock} />);
      
      const correctOption = screen.getByText('正解B');
      fireEvent.click(correctOption);
      
      expect(onAnswerMock).toHaveBeenCalledWith(true);
      expect(correctOption).toHaveClass('selected');
      expect(screen.getByText('正解です！🎉')).toBeInTheDocument();
    });

    it('should handle incorrect answer selection', () => {
      const onAnswerMock = vi.fn();
      const content: QuizContent = {
        type: 'quiz',
        question: 'テスト質問',
        options: ['不正解A', '正解B', '選択肢C'],
        correctIndex: 1,
      };

      render(<QuizRenderer content={content} onAnswer={onAnswerMock} />);
      
      const incorrectOption = screen.getByText('不正解A');
      fireEvent.click(incorrectOption);
      
      expect(onAnswerMock).toHaveBeenCalledWith(false);
      expect(incorrectOption).toHaveClass('selected');
      expect(screen.getByText('もう一度考えてみましょう！')).toBeInTheDocument();
    });

    it('should disable options after answering', () => {
      const content: QuizContent = {
        type: 'quiz',
        question: 'テスト質問',
        options: ['選択肢A', '選択肢B'],
        correctIndex: 0,
      };

      render(<QuizRenderer content={content} />);
      
      const options = screen.getAllByRole('button');
      
      // 最初はすべて有効
      options.forEach(option => {
        expect(option).not.toBeDisabled();
      });
      
      // 回答後はすべて無効
      fireEvent.click(options[0]);
      
      options.forEach(option => {
        expect(option).toBeDisabled();
      });
    });

    it('should work without onAnswer callback', () => {
      const content: QuizContent = {
        type: 'quiz',
        question: 'コールバックなしテスト',
        options: ['オプション1', 'オプション2'],
        correctIndex: 0,
      };

      render(<QuizRenderer content={content} />);
      
      const option = screen.getByText('オプション1');
      
      // エラーが発生しないことを確認
      expect(() => fireEvent.click(option)).not.toThrow();
      expect(option).toHaveClass('selected');
    });
  });

  describe('NoteRenderer', () => {
    it('should render note with default info variant', () => {
      const content: NoteContent = {
        type: 'note',
        text: 'これは重要な情報です。',
      };

      render(<NoteRenderer content={content} />);
      
      const note = screen.getByText('これは重要な情報です。').parentElement;
      expect(note).toHaveClass('lesson-note');
      expect(note).toHaveClass('lesson-note-info');
    });

    it('should render note with custom variant', () => {
      const content: NoteContent = {
        type: 'note',
        text: '警告メッセージです。',
        variant: 'warning',
      };

      render(<NoteRenderer content={content} />);
      
      const note = screen.getByText('警告メッセージです。').parentElement;
      expect(note).toHaveClass('lesson-note');
      expect(note).toHaveClass('lesson-note-warning');
    });

    it('should render note with icon', () => {
      const content: NoteContent = {
        type: 'note',
        text: 'ヒント付きメッセージ',
        icon: '💡',
        variant: 'tip',
      };

      render(<NoteRenderer content={content} />);
      
      expect(screen.getByText('💡')).toBeInTheDocument();
      expect(screen.getByText('ヒント付きメッセージ')).toBeInTheDocument();
      
      const note = screen.getByText('ヒント付きメッセージ').parentElement;
      expect(note).toHaveClass('lesson-note-tip');
    });

    it('should handle all variants correctly', () => {
      const variants = ['info', 'warning', 'success', 'tip'] as const;
      
      variants.forEach(variant => {
        const content: NoteContent = {
          type: 'note',
          text: `${variant}メッセージ`,
          variant,
        };

        const { unmount } = render(<NoteRenderer content={content} />);
        
        const note = screen.getByText(`${variant}メッセージ`).parentElement;
        expect(note).toHaveClass('lesson-note');
        expect(note).toHaveClass(`lesson-note-${variant}`);
        
        unmount();
      });
    });
  });

  describe('TableRenderer', () => {
    it('should render table with headers and rows', () => {
      const content: TableContent = {
        type: 'table',
        headers: ['入力A', '入力B', '出力'],
        rows: [
          ['false', 'false', 'false'],
          ['false', 'true', 'false'],
          ['true', 'false', 'false'],
          ['true', 'true', 'true'],
        ],
      };

      render(<TableRenderer content={content} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // ヘッダーの確認
      expect(screen.getByText('入力A')).toBeInTheDocument();
      expect(screen.getByText('入力B')).toBeInTheDocument();
      expect(screen.getByText('出力')).toBeInTheDocument();
      
      // データ行の確認
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(5); // ヘッダー + 4データ行
    });

    it('should apply custom className when provided', () => {
      const content: TableContent = {
        type: 'table',
        headers: ['列1', '列2'],
        rows: [['値1', '値2']],
        className: 'custom-table',
      };

      render(<TableRenderer content={content} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('truth-table');
      expect(table).toHaveClass('custom-table');
    });

    it('should handle empty table', () => {
      const content: TableContent = {
        type: 'table',
        headers: [],
        rows: [],
      };

      render(<TableRenderer content={content} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1); // ヘッダー行のみ（空）
    });

    it('should handle mismatched row data gracefully', () => {
      const content: TableContent = {
        type: 'table',
        headers: ['列1', '列2', '列3'],
        rows: [
          ['A', 'B'], // 列が不足
          ['C', 'D', 'E', 'F'], // 列が余剰
        ],
      };

      render(<TableRenderer content={content} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // エラーが発生しないことを確認
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });
});

/**
 * コンテンツレンダラーテストの概要:
 * 
 * ✅ TextRenderer: 基本テキスト表示とカスタムクラス対応
 * ✅ HeadingRenderer: 見出しレベル制御とアイコン表示
 * ✅ ListRenderer: 順序付き・順序なしリスト表示
 * ✅ QuizRenderer: インタラクティブクイズ機能とフィードバック
 * ✅ NoteRenderer: バリアント別ノート表示
 * ✅ TableRenderer: 真理値表等のテーブル表示
 * 
 * これらのテストにより、学習モードの主要なコンテンツレンダリング機能の
 * 動作が保証されます。
 */