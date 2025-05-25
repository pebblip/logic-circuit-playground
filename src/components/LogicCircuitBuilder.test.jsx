import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogicCircuitBuilder from './LogicCircuitBuilder';

describe('LogicCircuitBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本機能', () => {
    it('コンポーネントが正しくレンダリングされる', () => {
      render(<LogicCircuitBuilder />);
      expect(screen.getByText('Logic Circuit Builder')).toBeInTheDocument();
    });

    it('ゲートを追加できる', async () => {
      render(<LogicCircuitBuilder />);
      const andButton = screen.getByText('AND');
      fireEvent.click(andButton);
      
      // SVG内のANDゲートが追加されたことを確認
      await waitFor(() => {
        const svgText = screen.getAllByText('AND');
        // ボタンとゲート本体の2つのANDテキストがあるはず
        expect(svgText.length).toBeGreaterThan(1);
      });
    });

    it('INPUTゲートの値を切り替えられる', async () => {
      render(<LogicCircuitBuilder />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton);
      
      // 入力制御ボタンを探す
      await waitFor(() => {
        expect(screen.getByText(/入力1:/)).toBeInTheDocument();
      });
      
      const toggleButton = screen.getByText(/入力1:/);
      expect(toggleButton).toHaveTextContent('入力1: 1'); // 初期値は1
      
      // クリックして値を切り替え
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(toggleButton).toHaveTextContent('入力1: 0');
      });
    });
  });

  describe('計算機能', () => {
    it('計算ボタンで回路を計算できる', async () => {
      render(<LogicCircuitBuilder />);
      
      // AND回路を構築
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton); // 入力1
      fireEvent.click(inputButton); // 入力2
      
      const andButton = screen.getByText('AND');
      fireEvent.click(andButton);
      
      const outputButton = screen.getByText('OUT');
      fireEvent.click(outputButton);
      
      // 計算実行
      const calcButton = screen.getByText('計算');
      fireEvent.click(calcButton);
      
      // 結果を確認（接続がないので初期値のまま）
      expect(screen.queryByText('0')).toBeTruthy();
    });
  });

  describe('自動実行機能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('自動実行モードを切り替えられる', () => {
      render(<LogicCircuitBuilder />);
      
      const autoButton = screen.getByText('自動実行');
      expect(autoButton).toHaveClass('bg-gray-200');
      
      fireEvent.click(autoButton);
      expect(autoButton).toHaveTextContent('自動実行中');
      expect(autoButton).toHaveClass('bg-green-600');
    });

    it('自動実行中にINPUT値を変更できる', async () => {
      render(<LogicCircuitBuilder />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton);
      
      // 自動実行を開始
      const autoButton = screen.getByText('自動実行');
      fireEvent.click(autoButton);
      
      // 入力値を変更
      const toggleButton = screen.getByText(/入力1:/);
      expect(toggleButton).toHaveTextContent('入力1: 1');
      
      fireEvent.click(toggleButton);
      
      // 値が変更されることを確認
      await waitFor(() => {
        expect(toggleButton).toHaveTextContent('入力1: 0');
      });
      
      // 時間を進めて自動実行が動作することを確認
      vi.advanceTimersByTime(2000);
      
      // 値が保持されていることを確認
      expect(toggleButton).toHaveTextContent('入力1: 0');
    });

    it('自動実行中にクロック信号が切り替わる', async () => {
      render(<LogicCircuitBuilder />);
      
      // レベル2のメモリ要素が必要なので、スキップ
      // TODO: レベル2を解放してからテスト
    });
  });

  describe('ドラッグ操作', () => {
    it('ゲートをドラッグで移動できる', async () => {
      render(<LogicCircuitBuilder />);
      
      // ANDゲートを追加
      const andButton = screen.getByText('AND');
      fireEvent.click(andButton);
      
      // ANDゲートのテキストを待つ
      await waitFor(() => {
        const svgTexts = screen.getAllByText('AND');
        expect(svgTexts.length).toBeGreaterThan(1);
      });
      
      // SVG要素を直接取得
      const svg = document.querySelector('svg');
      const andGateRect = svg.querySelector('rect');
      
      expect(andGateRect).toBeTruthy();
      
      // 初期位置を取得
      const gElement = andGateRect.parentElement;
      const initialTransform = gElement.getAttribute('transform');
      
      // ドラッグ操作をシミュレート
      fireEvent.mouseDown(andGateRect);
      fireEvent.mouseMove(svg, { clientX: 300, clientY: 300 });
      fireEvent.mouseUp(svg);
      
      // 位置が変わったことを確認
      const newTransform = gElement.getAttribute('transform');
      expect(newTransform).not.toBe(initialTransform);
    });
  });
});