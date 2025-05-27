import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StableLogicCircuit from '../StableLogicCircuit';

describe('StableLogicCircuit モード切り替えテスト', () => {
  it('配置モードでゲートを配置でき、接続モードでは配置されない', async () => {
    const { container, getByText } = render(<StableLogicCircuit />);
    const svg = container.querySelector('svg');
    
    // 配置モードがデフォルトで選択されていることを確認
    const placeButton = getByText('🔨 配置モード');
    expect(placeButton.className).toContain('bg-blue-500');
    
    // キャンバスをクリックしてゲートを配置
    fireEvent.click(svg, { clientX: 100, clientY: 100 });
    
    // ゲートが配置されたことを確認
    await waitFor(() => {
      const gates = container.querySelectorAll('rect');
      expect(gates.length).toBeGreaterThan(1); // グリッドの rect + ゲートの rect
    });
    
    // 接続モードに切り替え
    const connectButton = getByText('🔌 接続モード');
    fireEvent.click(connectButton);
    expect(connectButton.className).toContain('bg-blue-500');
    
    // 接続モードでキャンバスをクリック
    fireEvent.click(svg, { clientX: 200, clientY: 200 });
    
    // 新しいゲートが配置されていないことを確認
    const gatesAfterConnect = container.querySelectorAll('text');
    const gateCount = Array.from(gatesAfterConnect).filter(
      text => ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'].includes(text.textContent)
    ).length;
    expect(gateCount).toBe(1); // 最初に配置したゲートのみ
  });

  it('接続モードでのみワイヤー接続が可能', async () => {
    const { container, getByText } = render(<StableLogicCircuit />);
    const svg = container.querySelector('svg');
    
    // ANDゲートを選択
    fireEvent.click(getByText('AND'));
    
    // 2つのINPUTゲートと1つのANDゲートを配置
    fireEvent.click(svg, { clientX: 100, clientY: 100 });
    fireEvent.click(getByText('INPUT'));
    fireEvent.click(svg, { clientX: 100, clientY: 200 });
    fireEvent.click(svg, { clientX: 300, clientY: 150 });
    
    // 端子を見つける
    await waitFor(() => {
      const allCircles = container.querySelectorAll('circle');
      expect(allCircles.length).toBeGreaterThan(0);
    });
    
    // 配置モードで接続を試みる（失敗するはず）
    const circles = container.querySelectorAll('circle');
    // INPUTゲートの出力端子（右側）を探す
    let outputTerminal = null;
    let inputTerminal = null;
    
    for (let circle of circles) {
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      // 最初のINPUTの出力端子（x=135, y=100付近）
      if (cx > 130 && cx < 140 && cy > 95 && cy < 105) {
        outputTerminal = circle;
      }
      // ANDの入力端子（x=65, y=100付近）
      if (cx > 60 && cx < 70 && cy > 95 && cy < 105) {
        inputTerminal = circle;
      }
    }
    
    expect(outputTerminal).not.toBeNull();
    expect(inputTerminal).not.toBeNull();
    
    fireEvent.mouseDown(outputTerminal);
    fireEvent.mouseUp(inputTerminal);
    
    // 接続線が作成されていないことを確認
    let lines = container.querySelectorAll('line');
    expect(lines.length).toBe(0);
    
    // 接続モードに切り替え
    fireEvent.click(getByText('🔌 接続モード'));
    
    // 接続を再度試みる（成功するはず）
    fireEvent.mouseDown(outputTerminal);
    fireEvent.mouseUp(inputTerminal);
    
    // 接続線が作成されたことを確認
    await waitFor(() => {
      const newLines = container.querySelectorAll('line');
      expect(newLines.length).toBeGreaterThan(0);
    });
  });
});