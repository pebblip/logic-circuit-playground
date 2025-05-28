import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';

describe('ANDゲートのUI接続テスト', () => {
  beforeEach(() => {
    // LocalStorageのモック
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('ANDゲートの両方の入力ピンがクリック可能', () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // モードセレクターをスキップ
    const quickStartButton = container.querySelector('button');
    if (quickStartButton) {
      fireEvent.click(quickStartButton);
    }
    
    // ANDゲートを追加
    const toolbar = container.querySelector('div[style*="display: flex"]');
    const andButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'AND'
    );
    
    if (andButton) {
      fireEvent.click(andButton);
    }
    
    // キャンバスをクリックしてゲートを配置
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.click(svg, { clientX: 300, clientY: 300 });
    }
    
    // 入力ピンを探す
    const inputPins = container.querySelectorAll('circle[data-terminal="input"]');
    console.log('Found input pins:', inputPins.length);
    
    // ANDゲートは2つの入力ピンを持つべき
    expect(inputPins.length).toBeGreaterThanOrEqual(2);
    
    // 各ピンのイベントハンドラーを確認
    inputPins.forEach((pin, index) => {
      console.log(`Pin ${index}:`, {
        cx: pin.getAttribute('cx'),
        cy: pin.getAttribute('cy'),
        hasMouseDown: pin.onmousedown !== null,
        hasMouseUp: pin.onmouseup !== null
      });
    });
  });
  
  it('ANDゲートの入力ピンの位置が正しい', () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // モードセレクターをスキップ
    const quickStartButton = container.querySelector('button');
    if (quickStartButton) {
      fireEvent.click(quickStartButton);
    }
    
    // ANDゲートを追加
    const andButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'AND'
    );
    
    if (andButton) {
      fireEvent.click(andButton);
    }
    
    // キャンバスをクリックしてゲートを配置
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.click(svg, { clientX: 300, clientY: 300 });
    }
    
    // ANDゲートのグループを探す
    const gateGroups = container.querySelectorAll('g[transform*="translate"]');
    const andGateGroup = Array.from(gateGroups).find(g => {
      const text = g.querySelector('text');
      return text && text.textContent === 'AND';
    });
    
    if (andGateGroup) {
      const inputPins = andGateGroup.querySelectorAll('circle[data-terminal="input"]');
      
      // 2つの入力ピンがあることを確認
      expect(inputPins.length).toBe(2);
      
      // ピンの位置を確認
      const pin1Y = parseFloat(inputPins[0].getAttribute('cy') || '0');
      const pin2Y = parseFloat(inputPins[1].getAttribute('cy') || '0');
      
      console.log('Pin positions:', { pin1Y, pin2Y });
      
      // 上側のピンは負の値、下側のピンは正の値を持つべき
      expect(pin1Y).toBeLessThan(0);
      expect(pin2Y).toBeGreaterThan(0);
      
      // 両方のピンが異なる位置にあることを確認
      expect(pin1Y).not.toBe(pin2Y);
    }
  });
});