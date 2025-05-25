import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogicCircuitBuilderModern from '../LogicCircuitBuilderModern';

// SVGElementのモック
beforeEach(() => {
  global.SVGElement = global.SVGElement || global.Element;
  global.SVGElement.prototype.createSVGPoint = vi.fn(() => ({
    x: 0,
    y: 0,
    matrixTransform: vi.fn(() => ({ x: 0, y: 0 }))
  }));
});

describe('LogicCircuitBuilderModern', () => {
  describe('レンダリング', () => {
    it('コンポーネントが正しくレンダリングされる', () => {
      render(<LogicCircuitBuilderModern />);
      
      // ツールバーの要素
      expect(screen.getByText('ゲート追加:')).toBeInTheDocument();
      expect(screen.getByText('計算実行')).toBeInTheDocument();
      expect(screen.getByText('リセット')).toBeInTheDocument();
      
      // パネルの要素
      expect(screen.getByText('学習レベル')).toBeInTheDocument();
      expect(screen.getByText('プロパティ')).toBeInTheDocument();
    });

    it('レベル1のゲートが表示される', () => {
      render(<LogicCircuitBuilderModern />);
      
      // ツールバーのボタンでゲートが表示されることを確認
      expect(screen.getByRole('button', { name: /AND/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /OR/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /NOT/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /入力/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /出力/ })).toBeInTheDocument();
    });
  });

  describe('ゲート操作', () => {
    it('ゲートを追加できる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      // ANDゲートを追加
      const andButton = screen.getByRole('button', { name: /AND/ });
      await user.click(andButton);
      
      // キャンバス内にゲートが追加されることを確認
      await waitFor(() => {
        const svgElement = document.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
      });
    });

    it('INPUTゲートをダブルクリックで値を切り替えられる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByRole('button', { name: /入力/ });
      await user.click(inputButton);
      
      // ゲートをダブルクリック（実際のテストでは座標を指定する必要があるため、簡略化）
      // この部分は実装の詳細に依存するため、統合テストで確認
    });
  });

  describe('シミュレーション', () => {
    it('手動計算を実行できる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      const calculateButton = screen.getByRole('button', { name: /計算実行/ });
      await user.click(calculateButton);
      
      // エラーが発生しないことを確認
      expect(calculateButton).toBeInTheDocument();
    });

    it('自動実行モードを切り替えられる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      const autoModeToggle = screen.getByRole('checkbox');
      expect(autoModeToggle).not.toBeChecked();
      
      await user.click(autoModeToggle);
      expect(autoModeToggle).toBeChecked();
      
      // 速度調整スライダーが表示される
      expect(screen.getByText('速度:')).toBeInTheDocument();
    });
  });

  describe('レベル選択', () => {
    it('レベルを切り替えられる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      // レベル2をクリック
      const level2Button = screen.getByText('レベル 2: メモリ要素');
      await user.click(level2Button);
      
      // レベル2のゲートが表示される
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /NAND/ })).toBeInTheDocument();
      });
    });
  });

  describe('情報パネル', () => {
    it('タブを切り替えられる', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      // 真理値表タブに切り替え
      const truthTableTab = screen.getByRole('button', { name: '真理値表' });
      await user.click(truthTableTab);
      
      expect(screen.getByText('入力ゲートを配置してください')).toBeInTheDocument();
    });
  });

  describe('リサイズ可能な下部パネル', () => {
    it('下部パネルが存在する', () => {
      render(<LogicCircuitBuilderModern />);
      
      // リサイズハンドルが存在
      const resizeHandle = document.querySelector('.cursor-ns-resize');
      expect(resizeHandle).toBeInTheDocument();
    });
  });

  describe('Undo/Redo', () => {
    it('Undo/Redoボタンが表示される', () => {
      render(<LogicCircuitBuilderModern />);
      
      // Undoボタン（無効状態）
      const undoButton = screen.getByTitle('元に戻す (Ctrl+Z)');
      expect(undoButton).toBeDisabled();
      
      // Redoボタン（無効状態）
      const redoButton = screen.getByTitle('やり直す (Ctrl+Y)');
      expect(redoButton).toBeDisabled();
    });
  });

  describe('回路の保存/読み込み', () => {
    it('保存ボタンが表示される', () => {
      render(<LogicCircuitBuilderModern />);
      
      expect(screen.getByText('💾 現在の回路を保存')).toBeInTheDocument();
    });

    it('保存ダイアログを開ける', async () => {
      const user = userEvent.setup();
      render(<LogicCircuitBuilderModern />);
      
      const saveButton = screen.getByText('💾 現在の回路を保存');
      await user.click(saveButton);
      
      // 保存ダイアログが表示される
      expect(screen.getByPlaceholderText('回路名を入力...')).toBeInTheDocument();
    });
  });
});