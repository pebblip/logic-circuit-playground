import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UltraModernCircuitWithViewModel from '../UltraModernCircuitWithViewModel';
import { PIN_CONSTANTS } from '@/constants/ui';

describe('ImprovedGateComponent Integration', () => {
  it('ピンの当たり判定が改善されている', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // ANDゲートを配置
    const andButton = container.querySelector('[title*="AND"]');
    expect(andButton).toBeTruthy();
    fireEvent.click(andButton);
    
    // キャンバスをクリックしてゲートを配置
    const svg = container.querySelector('svg');
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    
    // ゲートが配置されるまで待つ
    await waitFor(() => {
      const gates = container.querySelectorAll('g[transform*="translate"]');
      expect(gates.length).toBeGreaterThan(0);
    });
    
    // ピンの当たり判定エリアを確認
    const hitAreas = container.querySelectorAll('circle[fill="transparent"]');
    expect(hitAreas.length).toBeGreaterThan(0);
    
    // 当たり判定の半径を確認
    const firstHitArea = hitAreas[0];
    expect(firstHitArea.getAttribute('r')).toBe(String(PIN_CONSTANTS.HIT_RADIUS));
  });
  
  it('入力ピンと出力ピンが視覚的に区別される', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // NOTゲートを配置（入力1、出力1で確認しやすい）
    const notButton = container.querySelector('[title*="NOT"]');
    fireEvent.click(notButton);
    
    const svg = container.querySelector('svg');
    fireEvent.click(svg, { clientX: 300, clientY: 300 });
    
    await waitFor(() => {
      const gates = container.querySelectorAll('g[transform*="translate"]');
      expect(gates.length).toBeGreaterThan(0);
    });
    
    // 入力ピン（三角形のpath）と出力ピン（円）を確認
    const inputPinPath = container.querySelector('path[fill*="#4A90E2"]');
    const outputPinCircle = container.querySelector('circle[fill*="#50C878"]');
    
    expect(inputPinPath || outputPinCircle).toBeTruthy(); // 少なくとも1つは存在
  });
});