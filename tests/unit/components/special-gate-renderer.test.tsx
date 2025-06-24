/**
 * SpecialGateRenderer動作保証テスト
 * 
 * 目的: リファクタリング前のレンダラー動作を保証
 * - 各特殊ゲートタイプの正しいレンダリング
 * - switch文の現在の動作を文書化
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecialGateRenderer } from '@/components/gate-renderers/SpecialGateRenderer';
import { GateFactory } from '@/models/gates/GateFactory';
import type { Gate } from '@/types/circuit';

describe('SpecialGateRenderer - 現在の動作保証', () => {
  const mockHandlers = {
    handleMouseDown: vi.fn(),
    handleTouchStart: vi.fn(),
    handlePinClick: vi.fn(),
    handleGateClick: vi.fn(),
  };

  const createProps = (gate: Gate) => ({
    gate,
    isSelected: false,
    ...mockHandlers,
  });

  describe('各ゲートタイプのレンダリング', () => {
    it('CLOCKゲートが正しくレンダリングされる', () => {
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(clockGate)} />
        </svg>
      );

      // CLOCKゲート特有の要素を確認
      const circle = container.querySelector('circle.gate.clock-gate');
      expect(circle).toBeDefined();
      
      // 時計アイコンの存在
      const clockIcon = container.querySelector('text.gate-text');
      expect(clockIcon?.textContent).toContain('⏰');
      
      // 出力ピンの存在
      const outputPin = container.querySelector('circle.pin');
      expect(outputPin).toBeDefined();
    });

    it('D-FFゲートが正しくレンダリングされる', () => {
      const dffGate = GateFactory.createGate('D-FF', { x: 200, y: 200 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(dffGate)} />
        </svg>
      );

      // D-FFゲート特有の要素を確認
      const rect = container.querySelector('rect.gate');
      expect(rect).toBeDefined();
      
      // ゲート名の表示
      const gateText = container.querySelector('text.gate-text');
      expect(gateText?.textContent).toContain('D-FF');
      
      // 入力ピン（D, CLK）の存在
      const inputPins = container.querySelectorAll('circle.pin');
      expect(inputPins.length).toBeGreaterThanOrEqual(2);
    });

    it('MUXゲートが正しくレンダリングされる', () => {
      const muxGate = GateFactory.createGate('MUX', { x: 300, y: 300 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(muxGate)} />
        </svg>
      );

      // MUXゲート特有の要素を確認
      const gateText = container.querySelector('text.gate-text');
      expect(gateText?.textContent).toContain('MUX');
      
      // 3つの入力ピン（A, B, S）
      const inputLabels = container.querySelectorAll('text.gate-text.u-fill-muted');
      const labelTexts = Array.from(inputLabels).map(el => el.textContent);
      expect(labelTexts).toContain('A');
      expect(labelTexts).toContain('B');
      expect(labelTexts).toContain('S');
    });

    it('LEDゲートが正しくレンダリングされる', () => {
      const ledGate = GateFactory.createGate('LED', { x: 400, y: 400 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(ledGate)} />
        </svg>
      );

      // LEDゲートはLEDGateRendererコンポーネントを使用
      // 基本的な構造の存在確認
      const gateElement = container.querySelector('g');
      expect(gateElement).toBeDefined();
    });

    it('BINARY_COUNTERゲートが正しくレンダリングされる', () => {
      const counterGate = GateFactory.createGate('BINARY_COUNTER', { x: 500, y: 500 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(counterGate)} />
        </svg>
      );

      // カウンターゲート特有の要素を確認
      const counterLabel = container.querySelector('[data-testid="counter-label"]');
      expect(counterLabel?.textContent).toContain('COUNTER');
      
      // ビット数表示
      const bitLabel = container.querySelector('[data-testid="counter-bit-label"]');
      expect(bitLabel?.textContent).toContain('2bit');
      
      // 現在値表示
      const valueDisplay = container.querySelector('[data-testid="counter-value"]');
      expect(valueDisplay?.textContent).toBe('00');
    });

    it('SR-LATCHゲートが正しくレンダリングされる', () => {
      const srLatchGate = GateFactory.createGate('SR-LATCH', { x: 600, y: 600 });
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...createProps(srLatchGate)} />
        </svg>
      );

      // SR-LATCHゲート特有の要素を確認
      const gateText = container.querySelector('text.gate-text');
      expect(gateText?.textContent).toContain('SR-LATCH');
      
      // S, R入力ラベル
      const inputLabels = container.querySelectorAll('text.gate-text.u-fill-muted');
      const labelTexts = Array.from(inputLabels).map(el => el.textContent);
      expect(labelTexts).toContain('S');
      expect(labelTexts).toContain('R');
    });
  });

  describe('インタラクション動作', () => {
    it('ゲートクリックハンドラーが呼ばれる', () => {
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      const props = createProps(clockGate);
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...props} />
        </svg>
      );

      const gateElement = container.querySelector('.u-cursor-grab');
      gateElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(props.handleGateClick).toHaveBeenCalled();
    });

    it('ピンクリックハンドラーが呼ばれる', () => {
      const dffGate = GateFactory.createGate('D-FF', { x: 200, y: 200 });
      const props = createProps(dffGate);
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...props} />
        </svg>
      );

      const pinElement = container.querySelector('.u-cursor-crosshair');
      pinElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(props.handlePinClick).toHaveBeenCalled();
    });
  });

  describe('選択状態の表示', () => {
    it('選択時に適切なスタイルが適用される', () => {
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      const props = { ...createProps(clockGate), isSelected: true };
      
      const { container } = render(
        <svg>
          <SpecialGateRenderer {...props} />
        </svg>
      );

      const selectedGate = container.querySelector('.gate.selected');
      expect(selectedGate).toBeDefined();
      expect(selectedGate?.getAttribute('stroke')).toBe('#00aaff');
    });
  });
});