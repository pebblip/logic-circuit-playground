import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

describe('StableLogicCircuit', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('ゲートの追加と削除', () => {
    it('ゲートをキャンバスに追加できる', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // INPUTゲートを選択
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      await user.click(inputButton);
      
      // キャンバスをクリック
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // ゲートが追加されたことを確認（SVG内のテキスト要素を検索）
      const gateTexts = screen.getAllByText('INPUT');
      expect(gateTexts.length).toBeGreaterThan(1); // ボタンとゲートの2つ
    });

    it('右クリックでゲートを削除できる', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // ゲートを追加
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // ゲートを右クリックで削除
      const gate = container.querySelector('rect');
      fireEvent.contextMenu(gate);
      
      // ゲートが削除されたことを確認
      expect(screen.queryByText('INPUT')).not.toBeInTheDocument();
    });
  });

  describe('ワイヤー接続', () => {
    it('ゲート間でワイヤーを接続できる', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      await user.click(inputButton);
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 100, clientY: 100 });
      
      // OUTPUTゲートを追加
      const outputButton = screen.getByRole('button', { name: 'OUTPUT' });
      await user.click(outputButton);
      fireEvent.click(svg, { clientX: 300, clientY: 100 });
      
      // ワイヤー接続
      const circles = container.querySelectorAll('circle');
      const outputTerminal = circles[0]; // INPUTの出力端子
      const inputTerminal = circles[1];  // OUTPUTの入力端子
      
      fireEvent.mouseDown(outputTerminal);
      fireEvent.mouseUp(inputTerminal);
      
      // 接続線が作成されたことを確認
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('同じゲートには接続できない', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // ANDゲートを追加
      const andButton = screen.getByRole('button', { name: 'AND' });
      await user.click(andButton);
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // 同じゲートの端子間で接続を試みる
      const circles = container.querySelectorAll('circle');
      fireEvent.mouseDown(circles[0]);
      fireEvent.mouseUp(circles[1]);
      
      // 接続線が作成されていないことを確認
      const lines = container.querySelectorAll('line[stroke="#000"]');
      expect(lines.length).toBe(0);
    });
  });

  describe('シミュレーション', () => {
    it('INPUTゲートの値を切り替えられる', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // INPUTゲートを追加
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      await user.click(inputButton);
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 100, clientY: 100 });
      
      // ゲートをクリックして値を切り替え
      const gate = container.querySelector('rect');
      fireEvent.click(gate);
      
      // 色が変わったことを確認（アクティブ = 緑色）
      expect(gate).toHaveAttribute('fill', '#10b981');
    });

    it('ANDゲートが正しく動作する', async () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // INPUT1を追加
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      await user.click(inputButton);
      fireEvent.click(svg, { clientX: 100, clientY: 100 });
      
      // INPUT2を追加
      fireEvent.click(svg, { clientX: 100, clientY: 200 });
      
      // ANDゲートを追加
      const andButton = screen.getByRole('button', { name: 'AND' });
      await user.click(andButton);
      fireEvent.click(svg, { clientX: 300, clientY: 150 });
      
      // OUTPUTを追加
      const outputButton = screen.getByRole('button', { name: 'OUTPUT' });
      await user.click(outputButton);
      fireEvent.click(svg, { clientX: 500, clientY: 150 });
      
      // 接続を作成
      const circles = container.querySelectorAll('circle');
      // INPUT1 -> AND
      fireEvent.mouseDown(circles[0]);
      fireEvent.mouseUp(circles[2]);
      // INPUT2 -> AND
      fireEvent.mouseDown(circles[1]);
      fireEvent.mouseUp(circles[2]);
      // AND -> OUTPUT
      fireEvent.mouseDown(circles[3]);
      fireEvent.mouseUp(circles[4]);
      
      // 両方のINPUTをONにする
      const gates = container.querySelectorAll('rect');
      fireEvent.click(gates[0]); // INPUT1 ON
      fireEvent.click(gates[1]); // INPUT2 ON
      
      // OUTPUTがONになることを確認
      expect(gates[3]).toHaveAttribute('fill', '#10b981');
    });
  });

  describe('履歴管理', () => {
    it('元に戻す/やり直しが動作する', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // ゲートを追加
      const svg = container.querySelector('svg');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // 元に戻すボタンをクリック
      const undoButton = screen.getByRole('button', { name: '元に戻す' });
      await user.click(undoButton);
      
      // ゲートが削除されたことを確認
      expect(screen.queryByText('INPUT')).not.toBeInTheDocument();
      
      // やり直しボタンをクリック
      const redoButton = screen.getByRole('button', { name: 'やり直す' });
      await user.click(redoButton);
      
      // ゲートが復元されたことを確認
      expect(screen.getByText('INPUT')).toBeInTheDocument();
    });
  });
});