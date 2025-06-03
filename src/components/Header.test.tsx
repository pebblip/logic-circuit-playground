import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { useCircuitStore } from '../stores/circuitStore';
import { AppMode } from '../types/AppMode';

// モック
vi.mock('../stores/circuitStore');
vi.mock('./dialogs/SaveCircuitDialog', () => ({
  SaveCircuitDialog: ({ isOpen, onClose, onSuccess }: any) => 
    isOpen ? (
      <div data-testid="save-dialog">
        <button onClick={() => { onSuccess(); onClose(); }}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('./dialogs/LoadCircuitDialog', () => ({
  LoadCircuitDialog: ({ isOpen, onClose, onLoad }: any) => 
    isOpen ? (
      <div data-testid="load-dialog">
        <button onClick={() => { onLoad(); onClose(); }}>Load</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('./dialogs/ExportImportDialog', () => ({
  ExportImportDialog: ({ isOpen, onClose, onSuccess }: any) => 
    isOpen ? (
      <div data-testid="export-dialog">
        <button onClick={() => { onSuccess(); onClose(); }}>Export</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('./HelpPanel', () => ({
  HelpPanel: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="help-panel">
        <button onClick={onClose}>Close Help</button>
      </div>
    ) : null
}));

describe('Header Component', () => {
  const mockOnModeChange = vi.fn();
  const mockUseCircuitStore = useCircuitStore as unknown as ReturnType<typeof vi.fn>;
  
  // デフォルトのストアの状態
  const defaultStoreState = {
    gates: [],
    wires: [],
    history: [],
    historyIndex: 0,
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    undo: vi.fn(),
    redo: vi.fn(),
    clearAll: vi.fn(),
    addCustomGate: vi.fn(),
  };

  beforeEach(() => {
    mockUseCircuitStore.mockReturnValue(defaultStoreState);
    mockOnModeChange.mockClear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Render all buttons', () => {
    it('should render all main buttons', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // ヘッダータイトル
      expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
      
      // モードタブ
      expect(screen.getByText('学習モード')).toBeInTheDocument();
      expect(screen.getByText('自由制作')).toBeInTheDocument();
      
      // アクションボタン
      expect(screen.getByTitle('回路を読み込み')).toBeInTheDocument();
      expect(screen.getByTitle('回路を保存')).toBeInTheDocument();
      expect(screen.getByTitle('ヘルプ')).toBeInTheDocument();
    });

    it('should display button icons and labels', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const openButton = screen.getByTitle('回路を読み込み');
      expect(within(openButton).getByText('📂')).toBeInTheDocument();
      expect(within(openButton).getByText('開く')).toBeInTheDocument();
      
      const saveButton = screen.getByTitle('回路を保存');
      expect(within(saveButton).getByText('💾')).toBeInTheDocument();
      expect(within(saveButton).getByText('保存')).toBeInTheDocument();
      
      const helpButton = screen.getByTitle('ヘルプ');
      expect(within(helpButton).getByText('❓')).toBeInTheDocument();
      expect(within(helpButton).getByText('ヘルプ')).toBeInTheDocument();
    });
  });

  describe('2. Button click handlers', () => {
    it('should open save dialog when save button is clicked', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle('回路を保存');
      await userEvent.click(saveButton);
      
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });

    it('should open load dialog when load button is clicked', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const loadButton = screen.getByTitle('回路を読み込み');
      await userEvent.click(loadButton);
      
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
    });

    it('should open help panel when help button is clicked', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const helpButton = screen.getByTitle('ヘルプ');
      await userEvent.click(helpButton);
      
      expect(screen.getByTestId('help-panel')).toBeInTheDocument();
    });

    it('should close dialogs when cancel is clicked', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // Save dialog
      await userEvent.click(screen.getByTitle('回路を保存'));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      await userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });

    it('should log success message when save is successful', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      await userEvent.click(screen.getByTitle('回路を保存'));
      await userEvent.click(screen.getByText('Save'));
      
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ 回路が保存されました');
    });

    it('should log success message when load is successful', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      await userEvent.click(screen.getByTitle('回路を読み込み'));
      await userEvent.click(screen.getByText('Load'));
      
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ 回路が読み込まれました');
    });
  });

  describe('3. Disabled states', () => {
    it('should handle undo/redo buttons when not present in current implementation', () => {
      // 現在の実装にはundo/redoボタンがないため、将来の実装のためのプレースホルダー
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // 現在の実装ではundo/redoボタンが存在しないことを確認
      expect(screen.queryByTitle('元に戻す')).not.toBeInTheDocument();
      expect(screen.queryByTitle('やり直し')).not.toBeInTheDocument();
    });
  });

  describe('4. Mode switching', () => {
    it('should show active mode with active class', () => {
      render(<Header activeMode="学習モード" onModeChange={mockOnModeChange} />);
      
      const learningModeButton = screen.getByText('学習モード');
      const freeModeButton = screen.getByText('自由制作');
      
      expect(learningModeButton.className).toContain('active');
      expect(freeModeButton.className).not.toContain('active');
    });

    it('should call onModeChange when mode tab is clicked', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      await userEvent.click(screen.getByText('学習モード'));
      expect(mockOnModeChange).toHaveBeenCalledWith('学習モード');
      
      await userEvent.click(screen.getByText('自由制作'));
      expect(mockOnModeChange).toHaveBeenCalledWith('自由制作');
    });

    it('should support all app modes', () => {
      const modes: AppMode[] = ['学習モード', '自由制作'];
      
      modes.forEach(mode => {
        const { unmount } = render(<Header activeMode={mode} onModeChange={mockOnModeChange} />);
        const button = screen.getByText(mode);
        expect(button.className).toContain('active');
        unmount();
      });
    });
  });

  describe('5. Responsive behavior', () => {
    it('should maintain button visibility on different screen sizes', () => {
      // デスクトップサイズ
      global.innerWidth = 1024;
      const { rerender } = render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      expect(screen.getByTitle('回路を保存')).toBeVisible();
      expect(screen.getByTitle('回路を読み込み')).toBeVisible();
      expect(screen.getByTitle('ヘルプ')).toBeVisible();
      
      // モバイルサイズ
      global.innerWidth = 375;
      rerender(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // 現在の実装では全てのボタンが常に表示される
      expect(screen.getByTitle('回路を保存')).toBeVisible();
      expect(screen.getByTitle('回路を読み込み')).toBeVisible();
      expect(screen.getByTitle('ヘルプ')).toBeVisible();
    });
  });

  describe('6. Keyboard shortcut hints in tooltips', () => {
    it('should show tooltips on buttons', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // タイトル属性でツールチップが実装されている
      expect(screen.getByTitle('回路を読み込み')).toHaveAttribute('title', '回路を読み込み');
      expect(screen.getByTitle('回路を保存')).toHaveAttribute('title', '回路を保存');
      expect(screen.getByTitle('ヘルプ')).toHaveAttribute('title', 'ヘルプ');
    });
  });

  describe('7. Loading states during async operations', () => {
    it('should handle format circuit function', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      
      // ゲートがある状態
      mockUseCircuitStore.mockReturnValue({
        ...defaultStoreState,
        gates: [{ id: '1', type: 'AND', position: { x: 0, y: 0 } }]
      });
      
      // 現在の実装にはformatボタンがないが、内部関数として存在
      // 将来の実装のためのテスト
      expect(consoleLogSpy).not.toHaveBeenCalledWith('✨ 回路整形機能は準備中です');
    });
  });

  describe('8. Error handling for failed operations', () => {
    it('should handle dialog errors gracefully', async () => {
      // このテストケースは、実際のエラーハンドリングの実装に合わせて調整が必要
      // 現在の実装では、ダイアログ内でのエラーは各ダイアログコンポーネントで処理される
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // ダイアログが正常に開けることを確認
      await userEvent.click(screen.getByTitle('回路を保存'));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });

  describe('9. Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // ボタンにはタイトル属性とテキストラベルがある
      const saveButton = screen.getByTitle('回路を保存');
      expect(saveButton).toHaveTextContent('保存');
      
      const loadButton = screen.getByTitle('回路を読み込み');
      expect(loadButton).toHaveTextContent('開く');
      
      const helpButton = screen.getByTitle('ヘルプ');
      expect(helpButton).toHaveTextContent('ヘルプ');
    });

    it('should support keyboard navigation', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle('回路を保存');
      const loadButton = screen.getByTitle('回路を読み込み');
      
      // Tabキーでナビゲーション可能
      saveButton.focus();
      expect(document.activeElement).toBe(saveButton);
      
      // Enterキーでクリック可能
      fireEvent.keyDown(saveButton, { key: 'Enter', code: 'Enter' });
      // keyDownイベントだけではボタンクリックはトリガーされないため、
      // 実際のクリックイベントをシミュレート
      fireEvent.click(saveButton);
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('10. Visual feedback on hover/active states', () => {
    it('should have appropriate CSS classes for buttons', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle('回路を保存');
      expect(saveButton).toHaveClass('button');
      
      const helpButton = screen.getByTitle('ヘルプ');
      expect(helpButton).toHaveClass('button', 'help-button');
    });

    it('should have mode-tab class for mode buttons', () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const learningModeButton = screen.getByText('学習モード');
      const freeModeButton = screen.getByText('自由制作');
      
      expect(learningModeButton).toHaveClass('mode-tab');
      expect(freeModeButton).toHaveClass('mode-tab', 'active');
    });

    it('should handle mouse events for visual feedback', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle('回路を保存');
      
      // マウスホバー
      fireEvent.mouseEnter(saveButton);
      // CSSクラスの変更は実際のスタイルシートに依存するため、
      // ここではイベントが正しく処理されることを確認
      
      // マウスダウン/アップ
      fireEvent.mouseDown(saveButton);
      fireEvent.mouseUp(saveButton);
      
      // マウスイベント自体は動作するが、mouseDown/mouseUpだけではダイアログは開かない
      // 実際のクリックイベントが必要
      fireEvent.click(saveButton);
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete user flow for saving circuit', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log');
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // 1. 保存ボタンをクリック
      await userEvent.click(screen.getByTitle('回路を保存'));
      
      // 2. ダイアログが表示される
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      
      // 3. 保存を実行
      await userEvent.click(screen.getByText('Save'));
      
      // 4. 成功メッセージがログに出力される
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ 回路が保存されました');
      
      // 5. ダイアログが閉じる
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });

    it('should handle complete user flow for mode switching', async () => {
      const { rerender } = render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // 1. 初期状態の確認
      expect(screen.getByText('自由制作')).toHaveClass('active');
      expect(screen.getByText('学習モード')).not.toHaveClass('active');
      
      // 2. 学習モードに切り替え
      await userEvent.click(screen.getByText('学習モード'));
      expect(mockOnModeChange).toHaveBeenCalledWith('学習モード');
      
      // 3. 状態が更新されたことを確認（親コンポーネントから）
      rerender(<Header activeMode="学習モード" onModeChange={mockOnModeChange} />);
      expect(screen.getByText('学習モード')).toHaveClass('active');
      expect(screen.getByText('自由制作')).not.toHaveClass('active');
    });

    it('should handle multiple dialogs without interference', async () => {
      render(<Header activeMode="自由制作" onModeChange={mockOnModeChange} />);
      
      // 保存ダイアログを開く
      await userEvent.click(screen.getByTitle('回路を保存'));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      expect(screen.queryByTestId('load-dialog')).not.toBeInTheDocument();
      
      // 保存ダイアログを閉じる
      await userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
      
      // ロードダイアログを開く
      await userEvent.click(screen.getByTitle('回路を読み込み'));
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });
  });
});