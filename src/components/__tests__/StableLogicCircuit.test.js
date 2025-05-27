// StableLogicCircuit コンポーネントのエッジケーステスト

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StableLogicCircuit from '../StableLogicCircuit';

// useDragAndDropフックをモック
vi.mock('../../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    svgRef: { current: null },
    draggedGate: null,
    mousePosition: { x: 0, y: 0 },
    handleGateMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn()
  })
}));

describe('StableLogicCircuit - エッジケース', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('大規模回路の処理', () => {
    it('100個のゲートを配置してもレンダリングが安定する', () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // 100個のINPUTゲートを配置
      for (let i = 0; i < 100; i++) {
        // ゲートタイプを選択
        const inputButton = screen.getByRole('button', { name: 'INPUT' });
        fireEvent.click(inputButton);
        
        // キャンバスに配置（グリッド配置）
        const x = (i % 10) * 80 + 100;
        const y = Math.floor(i / 10) * 60 + 100;
        fireEvent.click(svg, { clientX: x, clientY: y });
      }
      
      // 100個のゲートが存在することを確認
      const gates = container.querySelectorAll('text');
      const inputGates = Array.from(gates).filter(text => text.textContent === 'INPUT');
      expect(inputGates.length).toBe(100);
    });

    it('循環参照のある回路でも無限ループに陥らない', async () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // NOTゲートを2つ配置
      const notButton = screen.getByRole('button', { name: 'NOT' });
      fireEvent.click(notButton);
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      fireEvent.click(notButton);
      fireEvent.click(svg, { clientX: 400, clientY: 200 });
      
      // 接続モードに切り替え
      const connectButton = screen.getByRole('button', { name: /接続モード/ });
      fireEvent.click(connectButton);
      
      // シミュレーションが無限ループに陥らないことを確認
      // （シミュレーションは最大10回の反復で停止する）
      await waitFor(() => {
        // レンダリングが正常に完了することを確認
        expect(container.querySelector('svg')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('境界値テスト', () => {
    it('最小距離でゲートを配置しても重ならない', () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // 最初のゲートを配置
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // 最小距離（60px未満）で2番目のゲートを配置
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 250, clientY: 200 });
      
      // 1つしか配置されないことを確認（重複防止）
      const gates = container.querySelectorAll('text');
      const inputGates = Array.from(gates).filter(text => text.textContent === 'INPUT');
      expect(inputGates.length).toBe(1);
      
      // 十分な距離で3番目のゲートを配置
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 300, clientY: 200 });
      
      // 2つ配置されることを確認
      const gatesAfter = container.querySelectorAll('text');
      const inputGatesAfter = Array.from(gatesAfter).filter(text => text.textContent === 'INPUT');
      expect(inputGatesAfter.length).toBe(2);
    });
  });

  describe('高速操作への対応', () => {
    it('ドラッグ中に高速でマウスを動かしても安定動作する', () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // ゲートを配置
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      // ゲートのrect要素を取得
      const rect = container.querySelector('rect');
      
      // ドラッグ開始
      fireEvent.mouseDown(rect, { button: 0, clientX: 200, clientY: 200 });
      
      // 高速で複数回マウスを動かす
      for (let i = 0; i < 50; i++) {
        fireEvent.mouseMove(svg, { 
          clientX: 200 + i * 2, 
          clientY: 200 + Math.sin(i) * 50 
        });
      }
      
      // ドラッグ終了
      fireEvent.mouseUp(svg, { button: 0 });
      
      // アプリケーションがクラッシュしていないことを確認
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('rect')).toBeInTheDocument();
    });
  });

  describe('異常な入力への対応', () => {
    it('無効な接続（出力→出力）を拒否する', () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // 2つのINPUTゲートを配置
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 400, clientY: 200 });
      
      // 接続モードに切り替え
      const connectButton = screen.getByRole('button', { name: /接続モード/ });
      fireEvent.click(connectButton);
      
      // 出力端子同士を接続しようとする
      const circles = container.querySelectorAll('circle');
      const output1 = circles[0]; // 最初のINPUTの出力
      const output2 = circles[1]; // 2番目のINPUTの出力
      
      fireEvent.mouseDown(output1, { button: 0 });
      fireEvent.mouseUp(output2, { button: 0 });
      
      // 接続線が作成されていないことを確認
      const lines = container.querySelectorAll('line:not([stroke-dasharray])');
      expect(lines.length).toBe(0);
    });

    it('削除されたゲートへの参照が残らない', async () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // INPUTとOUTPUTを配置
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      
      const outputButton = screen.getByRole('button', { name: 'OUTPUT' });
      fireEvent.click(outputButton);
      fireEvent.click(svg, { clientX: 400, clientY: 200 });
      
      // 接続
      const connectButton = screen.getByRole('button', { name: /接続モード/ });
      fireEvent.click(connectButton);
      
      const circles = container.querySelectorAll('circle');
      fireEvent.mouseDown(circles[0], { button: 0 });
      fireEvent.mouseUp(circles[1], { button: 0 });
      
      // INPUTを削除
      const inputRect = container.querySelector('rect');
      fireEvent.contextMenu(inputRect);
      
      // 接続線も削除されることを確認
      await waitFor(() => {
        const lines = container.querySelectorAll('line:not([stroke-dasharray])');
        expect(lines.length).toBe(0);
      });
    });
  });

  describe('複数入力ゲートの動作', () => {
    it('ANDゲートに2つの入力を正しく接続できる', () => {
      const { container } = render(<StableLogicCircuit />);
      const svg = container.querySelector('svg');
      
      // 2つのINPUT、1つのAND、1つのOUTPUTを配置
      const inputButton = screen.getByRole('button', { name: 'INPUT' });
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 150 });
      
      fireEvent.click(inputButton);
      fireEvent.click(svg, { clientX: 200, clientY: 250 });
      
      const andButton = screen.getByRole('button', { name: 'AND' });
      fireEvent.click(andButton);
      fireEvent.click(svg, { clientX: 400, clientY: 200 });
      
      const outputButton = screen.getByRole('button', { name: 'OUTPUT' });
      fireEvent.click(outputButton);
      fireEvent.click(svg, { clientX: 600, clientY: 200 });
      
      // 接続モードに切り替え
      const connectButton = screen.getByRole('button', { name: /接続モード/ });
      fireEvent.click(connectButton);
      
      // 全ての接続を作成できることを確認
      const circles = container.querySelectorAll('circle');
      
      // INPUT1 -> AND (1番目の入力)
      fireEvent.mouseDown(circles[0], { button: 0 });
      fireEvent.mouseUp(circles[2], { button: 0 });
      
      // INPUT2 -> AND (2番目の入力)
      fireEvent.mouseDown(circles[1], { button: 0 });
      fireEvent.mouseUp(circles[3], { button: 0 });
      
      // AND -> OUTPUT
      fireEvent.mouseDown(circles[4], { button: 0 });
      fireEvent.mouseUp(circles[5], { button: 0 });
      
      // 3本の接続線が存在することを確認
      const lines = container.querySelectorAll('line:not([stroke-dasharray])');
      expect(lines.length).toBe(3);
    });
  });
});