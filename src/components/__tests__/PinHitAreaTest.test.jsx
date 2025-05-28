import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';

describe('Pin Hit Area Test', () => {
  it('ピンの当たり判定が拡大されている', () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // ANDゲートを配置するボタンを探す
    const buttons = container.querySelectorAll('button');
    const andButton = Array.from(buttons).find(btn => 
      btn.querySelector('svg') && btn.textContent && btn.textContent.includes('AND')
    );
    
    if (andButton) {
      fireEvent.click(andButton);
      
      // キャンバスをクリックしてゲートを配置
      const svg = container.querySelector('svg[width="100%"]');
      if (svg) {
        fireEvent.click(svg, { clientX: 300, clientY: 300 });
        
        // 透明な当たり判定エリアを確認
        const transparentCircles = container.querySelectorAll('circle[fill="transparent"]');
        expect(transparentCircles.length).toBeGreaterThan(0);
        
        // 当たり判定の半径が12であることを確認
        const firstHitArea = transparentCircles[0];
        expect(firstHitArea.getAttribute('r')).toBe('12');
      }
    }
  });
});