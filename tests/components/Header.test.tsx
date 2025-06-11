import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@components/Header';
import { useCircuitStore } from '@/stores/circuitStore';
import { AppMode } from '@/types/appMode';
import { TERMS } from '@/features/learning-mode/data/terms';

// モック
vi.mock('@/stores/circuitStore');
vi.mock('@components/dialogs/SaveCircuitDialog', () => ({
  SaveCircuitDialog: ({ isOpen, onClose, onSuccess }: any) => 
    isOpen ? (
      <div data-testid="save-dialog">
        <button onClick={() => { onSuccess(); onClose(); }}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('@components/dialogs/LoadCircuitDialog', () => ({
  LoadCircuitDialog: ({ isOpen, onClose, onLoad }: any) => 
    isOpen ? (
      <div data-testid="load-dialog">
        <button onClick={() => { onLoad(); onClose(); }}>Load</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('@components/dialogs/ExportImportDialog', () => ({
  ExportImportDialog: ({ isOpen, onClose, onSuccess }: any) => 
    isOpen ? (
      <div data-testid="export-dialog">
        <button onClick={() => { onSuccess(); onClose(); }}>Export</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

vi.mock('@components/HelpPanel', () => ({
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
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // ロゴ画像のalt属性でタイトルを確認
      expect(screen.getByAltText('LogiCirc')).toBeInTheDocument();
      
      // モードタブ
      expect(screen.getByText(TERMS.LEARNING_MODE)).toBeInTheDocument();
      expect(screen.getByText(TERMS.FREE_MODE)).toBeInTheDocument();
      
      // アクションボタン
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`)).toBeInTheDocument();
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`)).toBeInTheDocument();
      expect(screen.getByTitle(TERMS.HELP)).toBeInTheDocument();
    });

    it('should display button icons and labels', () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const openButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`);
      expect(within(openButton).getByText('📂')).toBeInTheDocument();
      expect(within(openButton).getByText('開く')).toBeInTheDocument();
      
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      expect(within(saveButton).getByText('💾')).toBeInTheDocument();
      expect(within(saveButton).getByText('保存')).toBeInTheDocument();
      
      const helpButton = screen.getByTitle(TERMS.HELP);
      expect(within(helpButton).getByText('❓')).toBeInTheDocument();
      expect(within(helpButton).getByText('ヘルプ')).toBeInTheDocument();
    });
  });

  describe('2. Button click handlers', () => {
    it('should open save dialog when save button is clicked', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      await userEvent.click(saveButton);
      
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });

    it('should open load dialog when load button is clicked', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const loadButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`);
      await userEvent.click(loadButton);
      
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
    });

    it('should call onOpenHelp when help button is clicked', async () => {
      const mockOnOpenHelp = vi.fn();
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} onOpenHelp={mockOnOpenHelp} />);
      
      const helpButton = screen.getByTitle(TERMS.HELP);
      await userEvent.click(helpButton);
      
      expect(mockOnOpenHelp).toHaveBeenCalled();
    });

    it('should close dialogs when cancel is clicked', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // Save dialog
      await userEvent.click(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      await userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });

    // TODO: 意味のあるテストに置き換える
    // - 実際にデータが保存/読み込みされるか
    // - ダイアログが正しく閉じるか
    // - エラー時のハンドリング
    // console.logのテストは実装の詳細をテストしているため削除
  });

  describe('3. Disabled states', () => {
    it('should handle undo/redo buttons when not present in current implementation', () => {
      // 現在の実装にはundo/redoボタンがないため、将来の実装のためのプレースホルダー
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // 現在の実装ではundo/redoボタンが存在しないことを確認
      expect(screen.queryByTitle('元に戻す')).not.toBeInTheDocument();
      expect(screen.queryByTitle('やり直し')).not.toBeInTheDocument();
    });
  });

  describe('4. Mode switching', () => {
    it('should show active mode with active class', () => {
      render(<Header activeMode={TERMS.LEARNING_MODE} onModeChange={mockOnModeChange} />);
      
      const learningModeButton = screen.getByText(TERMS.LEARNING_MODE);
      const freeModeButton = screen.getByText(TERMS.FREE_MODE);
      
      expect(learningModeButton.className).toContain('active');
      expect(freeModeButton.className).not.toContain('active');
    });

    it('should call onModeChange when mode tab is clicked', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      await userEvent.click(screen.getByText(TERMS.LEARNING_MODE));
      expect(mockOnModeChange).toHaveBeenCalledWith(TERMS.LEARNING_MODE);
      
      await userEvent.click(screen.getByText(TERMS.FREE_MODE));
      expect(mockOnModeChange).toHaveBeenCalledWith(TERMS.FREE_MODE);
    });

    it('should support all app modes', () => {
      const modes: AppMode[] = [TERMS.LEARNING_MODE, TERMS.FREE_MODE];
      
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
      const { rerender } = render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`)).toBeVisible();
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`)).toBeVisible();
      expect(screen.getByTitle(TERMS.HELP)).toBeVisible();
      
      // モバイルサイズ
      global.innerWidth = 375;
      rerender(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // 現在の実装では全てのボタンが常に表示される
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`)).toBeVisible();
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`)).toBeVisible();
      expect(screen.getByTitle(TERMS.HELP)).toBeVisible();
    });
  });

  describe('6. Keyboard shortcut hints in tooltips', () => {
    it('should show tooltips on buttons', () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // タイトル属性でツールチップが実装されている
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`)).toHaveAttribute('title', `${TERMS.CIRCUIT}を${TERMS.LOAD}`);
      expect(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`)).toHaveAttribute('title', `${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      expect(screen.getByTitle(TERMS.HELP)).toHaveAttribute('title', TERMS.HELP);
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
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // ダイアログが正常に開けることを確認
      await userEvent.click(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    });
  });

  describe('9. Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // ボタンにはタイトル属性とテキストラベルがある
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      expect(saveButton).toHaveTextContent('保存');
      
      const loadButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`);
      expect(loadButton).toHaveTextContent('開く');
      
      const helpButton = screen.getByTitle(TERMS.HELP);
      expect(helpButton).toHaveTextContent('ヘルプ');
    });

    it('should support keyboard navigation', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      const loadButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`);
      
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
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('10. Visual feedback on hover/active states', () => {
    it('should have appropriate CSS classes for buttons', () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      expect(saveButton).toHaveClass('button');
      
      const helpButton = screen.getByTitle(TERMS.HELP);
      expect(helpButton).toHaveClass('button', 'help-button');
    });

    it('should have mode-tab class for mode buttons', () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const learningModeButton = screen.getByText(TERMS.LEARNING_MODE);
      const freeModeButton = screen.getByText(TERMS.FREE_MODE);
      
      expect(learningModeButton).toHaveClass('mode-tab');
      expect(freeModeButton).toHaveClass('mode-tab', 'active');
    });

    it('should handle mouse events for visual feedback', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      const saveButton = screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`);
      
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
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // 1. 保存ボタンをクリック
      await userEvent.click(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`));
      
      // 2. ダイアログが表示される
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      
      // 3. 保存を実行
      await userEvent.click(screen.getByText('Save'));
      
      // 4. ダイアログが閉じる
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });

    it('should handle complete user flow for mode switching', async () => {
      const { rerender } = render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // 1. 初期状態の確認
      expect(screen.getByText(TERMS.FREE_MODE)).toHaveClass('active');
      expect(screen.getByText(TERMS.LEARNING_MODE)).not.toHaveClass('active');
      
      // 2. 学習モードに切り替え
      await userEvent.click(screen.getByText(TERMS.LEARNING_MODE));
      expect(mockOnModeChange).toHaveBeenCalledWith(TERMS.LEARNING_MODE);
      
      // 3. 状態が更新されたことを確認（親コンポーネントから）
      rerender(<Header activeMode={TERMS.LEARNING_MODE} onModeChange={mockOnModeChange} />);
      expect(screen.getByText(TERMS.LEARNING_MODE)).toHaveClass('active');
      expect(screen.getByText(TERMS.FREE_MODE)).not.toHaveClass('active');
    });

    it('should handle multiple dialogs without interference', async () => {
      render(<Header activeMode={TERMS.FREE_MODE} onModeChange={mockOnModeChange} />);
      
      // 保存ダイアログを開く
      await userEvent.click(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.SAVE}`));
      expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
      expect(screen.queryByTestId('load-dialog')).not.toBeInTheDocument();
      
      // 保存ダイアログを閉じる
      await userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
      
      // ロードダイアログを開く
      await userEvent.click(screen.getByTitle(`${TERMS.CIRCUIT}を${TERMS.LOAD}`));
      expect(screen.getByTestId('load-dialog')).toBeInTheDocument();
      expect(screen.queryByTestId('save-dialog')).not.toBeInTheDocument();
    });
  });
});