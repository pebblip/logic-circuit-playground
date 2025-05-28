import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';
import { Pin } from '@/models/Pin';

describe('PinComponent Integration Test', () => {
  it('PinComponentがPinモデルの定数を使用している', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // NOTゲートを配置（単一入力・出力で確認しやすい）
    const buttons = container.querySelectorAll('button');
    const notButton = Array.from(buttons).find(btn => 
      btn.querySelector('svg') && btn.textContent && btn.textContent.includes('NOT')
    );
    
    if (notButton) {
      fireEvent.click(notButton);
      
      // キャンバスをクリックしてゲートを配置
      const svg = container.querySelector('svg[width="100%"]');
      if (svg) {
        fireEvent.click(svg, { clientX: 300, clientY: 300 });
        
        // ゲートが配置されるまで待つ
        await waitFor(() => {
          const gates = container.querySelectorAll('g[transform*="translate"]');
          expect(gates.length).toBeGreaterThan(0);
        });
        
        // 透明な当たり判定エリアを確認
        const transparentCircles = container.querySelectorAll('circle[fill="transparent"]');
        expect(transparentCircles.length).toBeGreaterThanOrEqual(2); // 入力1つ、出力1つ
        
        // 全ての当たり判定がPin.HIT_RADIUSを使用していることを確認
        transparentCircles.forEach(circle => {
          expect(circle.getAttribute('r')).toBe(String(Pin.HIT_RADIUS));
        });
        
        // 表示用のピンを確認
        const visualPins = container.querySelectorAll('circle[data-terminal]');
        expect(visualPins.length).toBeGreaterThanOrEqual(2);
        
        // 全ての表示ピンがPin.VISUAL_RADIUSを使用していることを確認
        visualPins.forEach(pin => {
          expect(pin.getAttribute('r')).toBe(String(Pin.VISUAL_RADIUS));
        });
      }
    }
  });
  
  it('複数入力ゲートでもPinComponentが正しく使用される', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // ANDゲートを配置（2入力）
    const buttons = container.querySelectorAll('button');
    const andButton = Array.from(buttons).find(btn => 
      btn.querySelector('svg') && btn.textContent && btn.textContent.includes('AND')
    );
    
    if (andButton) {
      fireEvent.click(andButton);
      
      const svg = container.querySelector('svg[width="100%"]');
      if (svg) {
        fireEvent.click(svg, { clientX: 400, clientY: 400 });
        
        await waitFor(() => {
          const gates = container.querySelectorAll('g[transform*="translate"]');
          expect(gates.length).toBeGreaterThan(0);
        });
        
        // ANDゲートは入力2つ、出力1つ = 合計3つのピン
        const transparentCircles = container.querySelectorAll('circle[fill="transparent"]');
        expect(transparentCircles.length).toBeGreaterThanOrEqual(3);
        
        // 全てPin.HIT_RADIUSを使用
        transparentCircles.forEach(circle => {
          expect(circle.getAttribute('r')).toBe(String(Pin.HIT_RADIUS));
        });
      }
    }
  });
});