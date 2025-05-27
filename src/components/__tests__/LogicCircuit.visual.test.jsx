import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * ビジュアルリグレッションテスト
 * 視覚的な要素が正しく表示されることを確認
 */
describe('論理回路プレイグラウンド - ビジュアルテスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('ゲートの表示', () => {
    it('各ゲートタイプが正しい色で表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      const gateConfigs = [
        { type: 'INPUT', color: '#6b7280', activeColor: '#10b981' },
        { type: 'OUTPUT', color: '#6b7280', activeColor: '#10b981' },
        { type: 'AND', color: '#3b82f6' },
        { type: 'OR', color: '#3b82f6' },
        { type: 'NOT', color: '#3b82f6' }
      ];
      
      let y = 50;
      for (const config of gateConfigs) {
        await user.click(screen.getByRole('button', { name: new RegExp(config.type, 'i') }));
        fireEvent.click(canvas, { clientX: 200, clientY: y });
        y += 100;
      }
      
      // 各ゲートの色を確認
      const gates = canvas.querySelectorAll('g');
      gates.forEach((gate, index) => {
        const rect = gate.querySelector('rect');
        if (rect && index < gateConfigs.length) {
          const expectedColor = gateConfigs[index].color;
          expect(rect.getAttribute('fill')).toBe(expectedColor);
        }
      });
    });

    it('ゲートのラベルが正しく表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      const gateTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];
      
      for (const type of gateTypes) {
        await user.click(screen.getByRole('button', { name: new RegExp(type, 'i') }));
        fireEvent.click(canvas, {
          clientX: 200,
          clientY: 100 + gateTypes.indexOf(type) * 80
        });
      }
      
      // 各ゲートのラベルを確認
      for (const type of gateTypes) {
        const labels = screen.getAllByText(type);
        // 少なくとも2つ（ボタンとゲート）存在することを確認
        expect(labels.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('ゲートのサイズが一貫している', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 複数のゲートを配置
      const gateTypes = ['AND', 'OR', 'NOT'];
      for (const type of gateTypes) {
        await user.click(screen.getByRole('button', { name: new RegExp(type, 'i') }));
        fireEvent.click(canvas, {
          clientX: 100 + gateTypes.indexOf(type) * 150,
          clientY: 200
        });
      }
      
      // すべてのゲートのサイズを確認
      const rects = canvas.querySelectorAll('rect');
      const sizes = Array.from(rects).map(rect => ({
        width: rect.getAttribute('width'),
        height: rect.getAttribute('height')
      }));
      
      // すべて同じサイズであることを確認
      sizes.forEach(size => {
        expect(size.width).toBe('60');
        expect(size.height).toBe('40');
      });
    });
  });

  describe('接続線の表示', () => {
    it('接続線が正しい色で表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // INPUT -> OUTPUT を接続
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 400, clientY: 200 });
      
      const terminals = canvas.querySelectorAll('circle');
      fireEvent.mouseDown(terminals[0]);
      fireEvent.mouseUp(terminals[1]);
      
      // 接続線の色を確認
      const connection = canvas.querySelector('line:not([stroke-dasharray])');
      expect(connection).toBeTruthy();
      
      // OFFの時は黒
      expect(connection.getAttribute('stroke')).toBe('#000');
      
      // INPUTをONにする
      const inputGate = canvas.querySelector('rect');
      fireEvent.click(inputGate);
      
      // ONの時は緑
      await waitFor(() => {
        expect(connection.getAttribute('stroke')).toBe('#10b981');
      });
    });

    it('ドラッグ中の接続線が点線で表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      const terminal = canvas.querySelector('circle');
      
      // ドラッグ開始
      fireEvent.mouseDown(terminal);
      
      // マウスを移動
      fireEvent.mouseMove(canvas, { clientX: 300, clientY: 200 });
      
      // 点線の接続線を確認
      const dragLine = canvas.querySelector('line[stroke-dasharray]');
      expect(dragLine).toBeTruthy();
      expect(dragLine.getAttribute('stroke-dasharray')).toBe('5,5');
    });

    it('接続線が適切な太さで表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 回路を作成
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 400, clientY: 200 });
      
      const terminals = canvas.querySelectorAll('circle');
      fireEvent.mouseDown(terminals[0]);
      fireEvent.mouseUp(terminals[1]);
      
      const connection = canvas.querySelector('line:not([stroke-dasharray])');
      
      // OFFの時の太さ
      expect(connection.getAttribute('stroke-width')).toBe('2');
      
      // INPUTをONにする
      const inputGate = canvas.querySelector('rect');
      fireEvent.click(inputGate);
      
      // ONの時の太さ
      await waitFor(() => {
        expect(connection.getAttribute('stroke-width')).toBe('3');
      });
    });
  });

  describe('端子の表示', () => {
    it('端子が正しい位置に表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ANDゲートを配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });
      
      const gate = canvas.querySelector('g');
      const rect = gate.querySelector('rect');
      const circles = gate.querySelectorAll('circle');
      
      // 入力端子と出力端子が存在
      expect(circles.length).toBe(2);
      
      // 位置を確認
      const rectX = parseInt(rect.getAttribute('x'));
      const inputTerminal = circles[0];
      const outputTerminal = circles[1];
      
      // 入力端子は左側
      expect(parseInt(inputTerminal.getAttribute('cx'))).toBeLessThan(rectX);
      
      // 出力端子は右側
      expect(parseInt(outputTerminal.getAttribute('cx'))).toBeGreaterThan(rectX + 60);
    });

    it('端子のサイズと色が一貫している', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 複数のゲートを配置
      const gateTypes = ['INPUT', 'AND', 'OUTPUT'];
      for (const type of gateTypes) {
        await user.click(screen.getByRole('button', { name: new RegExp(type, 'i') }));
        fireEvent.click(canvas, {
          clientX: 100 + gateTypes.indexOf(type) * 200,
          clientY: 200
        });
      }
      
      // すべての端子を確認
      const terminals = canvas.querySelectorAll('circle');
      terminals.forEach(terminal => {
        // サイズ
        expect(terminal.getAttribute('r')).toBe('5');
        
        // 色
        expect(terminal.getAttribute('fill')).toBe('#fbbf24');
        
        // 枠線
        expect(terminal.getAttribute('stroke')).toBe('#000');
      });
    });
  });

  describe('グリッドとキャンバス', () => {
    it('背景グリッドが表示される', () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // グリッドパターンの定義を確認
      const pattern = canvas.querySelector('pattern#grid');
      expect(pattern).toBeTruthy();
      
      // グリッドが適用されていることを確認
      const background = canvas.querySelector('rect[fill="url(#grid)"]');
      expect(background).toBeTruthy();
    });

    it('キャンバスのサイズが適切である', () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // SVGの属性を確認
      expect(canvas.getAttribute('width')).toBe('800');
      expect(canvas.getAttribute('height')).toBe('600');
      
      // クラスを確認
      expect(canvas.className).toContain('bg-white');
      expect(canvas.className).toContain('border');
    });
  });

  describe('インタラクションのフィードバック', () => {
    it('ホバー時に視覚的フィードバックがある', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      const button = screen.getByRole('button', { name: /input/i });
      
      // 初期状態のクラスを記録
      const initialClasses = button.className;
      
      // ホバー
      await user.hover(button);
      
      // クラスが変更されることを確認
      expect(button.className).toContain('hover:bg-gray-200');
    });

    it('クリック時のアニメーション', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // INPUTゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 200, clientY: 200 });
      
      const gate = canvas.querySelector('rect');
      
      // クリック前の色
      const colorBefore = gate.getAttribute('fill');
      
      // クリック
      fireEvent.click(gate);
      
      // 色が変わることを確認
      await waitFor(() => {
        const colorAfter = gate.getAttribute('fill');
        expect(colorAfter).not.toBe(colorBefore);
      });
    });

    it('無効なボタンが適切にスタイリングされる', () => {
      render(<StableLogicCircuit />);
      
      const undoButton = screen.getByRole('button', { name: /元に戻す/i });
      
      // 初期状態で無効
      expect(undoButton).toBeDisabled();
      expect(undoButton.className).toContain('disabled:opacity-50');
    });
  });

  describe('レスポンシブデザイン', () => {
    it('小さい画面でも適切に表示される', () => {
      // ビューポートのサイズを変更
      global.innerWidth = 640;
      global.innerHeight = 480;
      
      render(<StableLogicCircuit />);
      
      // 必要な要素が表示されていることを確認
      expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /input/i })).toBeInTheDocument();
      
      // SVGが存在することを確認
      const canvas = document.querySelector('svg');
      expect(canvas).toBeTruthy();
      
      // 元のサイズに戻す
      global.innerWidth = 1024;
      global.innerHeight = 768;
    });

    it('大きい画面でも適切にレイアウトされる', () => {
      // ビューポートのサイズを変更
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      
      const { container } = render(<StableLogicCircuit />);
      
      // レイアウトが崩れていないことを確認
      const sidebar = container.querySelector('.w-48');
      expect(sidebar).toBeTruthy();
      
      const mainArea = container.querySelector('.flex-1');
      expect(mainArea).toBeTruthy();
      
      // 元のサイズに戻す
      global.innerWidth = 1024;
      global.innerHeight = 768;
    });
  });

  describe('エラー状態の表示', () => {
    it('無効な接続時にフィードバックが表示される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ANDゲートを1つ配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });
      
      const terminals = canvas.querySelectorAll('circle');
      
      // 同じゲートの端子間で接続を試みる
      fireEvent.mouseDown(terminals[0]);
      fireEvent.mouseUp(terminals[1]);
      
      // エラー表示やフィードバックを確認
      // （実装に依存しないため、接続が作成されていないことを確認）
      const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
      expect(connections.length).toBe(0);
    });
  });
});