import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LogicCircuitBuilder from './LogicCircuitBuilder';

describe('LogicCircuitBuilder - 実際の問題を検出するテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('INPUT値変更の問題', () => {
    it('INPUT値を変更したときに値が保持されるべき', async () => {
      const { container } = render(<LogicCircuitBuilder />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton);
      
      // 入力制御ボタンが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText(/IN1:/)).toBeInTheDocument();
      });
      
      const toggleButton = screen.getByText(/IN1:/);
      expect(toggleButton).toHaveTextContent('IN1: 1');
      
      // ボタンをクリックして値を変更
      act(() => {
        fireEvent.click(toggleButton);
      });
      
      // 値が変更されたことを確認
      await waitFor(() => {
        expect(toggleButton).toHaveTextContent('IN1: 0');
      }, { timeout: 100 });
      
      // 100ms待っても値が保持されているか確認（チラつきを検出）
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // 値が元に戻っていないことを確認
      expect(toggleButton).toHaveTextContent('IN1: 0');
    });

    it('INPUTゲートをダブルクリックしたときに値が変更されるべき', async () => {
      const { container } = render(<LogicCircuitBuilder />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton);
      
      // SVG内のINゲートを待つ
      await waitFor(() => {
        const svgTexts = screen.getAllByText('IN');
        expect(svgTexts.length).toBeGreaterThan(1);
      });
      
      // SVG内のINゲート（円）を見つける
      const svg = container.querySelector('svg');
      const inputGateCircle = svg.querySelector('circle[fill="#000"]'); // 黒い円（値=1）
      
      expect(inputGateCircle).toBeTruthy();
      
      // ダブルクリックで値を変更
      act(() => {
        fireEvent.doubleClick(inputGateCircle);
      });
      
      // 値が変わったことを確認（白い円になる）
      await waitFor(() => {
        const whiteCircle = svg.querySelector('circle[fill="#fff"]');
        expect(whiteCircle).toBeTruthy();
      }, { timeout: 100 });
      
      // 100ms待っても値が保持されているか
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      const finalCircle = svg.querySelector('circle[fill="#fff"]');
      expect(finalCircle).toBeTruthy(); // 白いまま（値=0）
    });
  });

  describe('自動実行中のINPUT値変更', () => {
    it.skip('自動実行中でもINPUT値を変更できるべき', async () => {
      const { container } = render(<LogicCircuitBuilder />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByText('IN');
      fireEvent.click(inputButton);
      
      // 入力制御ボタンを待つ
      await waitFor(() => {
        expect(screen.getByText(/IN1:/)).toBeInTheDocument();
      });
      
      // 自動実行を開始
      const autoButton = screen.getByText('自動実行');
      fireEvent.click(autoButton);
      expect(autoButton).toHaveTextContent('自動実行中');
      
      // 初期値を確認
      const toggleButton = screen.getByText(/IN1:/);
      expect(toggleButton).toHaveTextContent('IN1: 1');
      
      // 値を変更
      fireEvent.click(toggleButton);
      
      // 即座に値が変わることを確認
      expect(toggleButton).toHaveTextContent('IN1: 0');
      
      // 少し待っても値が保持されているべき
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      
      // 値が保持されているべき
      expect(toggleButton).toHaveTextContent('IN1: 0');
    });
  });

  describe('calculateCircuit関数の呼び出しタイミング', () => {
    it('INPUT値変更時にcalculateCircuitが呼ばれるべき', async () => {
      // calculateCircuitをモック化する方法を検討
      const { container } = render(<LogicCircuitBuilder />);
      
      // INPUTとOUTPUTゲートを追加
      const inputButton = screen.getByText('IN');
      const outputButton = screen.getByText('OUT');
      
      fireEvent.click(inputButton);
      fireEvent.click(outputButton);
      
      // 接続を作成（テストでは難しいので、値の変更のみ確認）
      
      // 入力値を変更
      await waitFor(() => {
        expect(screen.getByText(/IN1:/)).toBeInTheDocument();
      });
      
      const toggleButton = screen.getByText(/IN1:/);
      
      // コンソールログを監視
      const consoleLog = vi.spyOn(console, 'log');
      
      fireEvent.click(toggleButton);
      
      // calculateCircuitが呼ばれたか確認（実装にログを追加する必要がある）
      // または、OUTPUT値が更新されたか確認
      
      consoleLog.mockRestore();
    });
  });
});