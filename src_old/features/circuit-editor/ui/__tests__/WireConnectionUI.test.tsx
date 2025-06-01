import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UltraModernCircuitWithViewModel from '../../../../app/UltraModernCircuitWithViewModel';

describe('ワイヤー接続のUIテスト', () => {
  beforeEach(() => {
    // LocalStorageのモック
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('出力ピンから入力ピンへドラッグして接続できる', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // 学習モードを選択
    const learningModeButton = container.querySelector('[data-testid="mode-btn-learning"]');
    if (learningModeButton) {
      fireEvent.click(learningModeButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // INPUTゲートを追加
    const inputButton = container.querySelector('[data-testid="gate-button-INPUT"]') ||
                       Array.from(container.querySelectorAll('button')).find(btn => 
                         btn.textContent?.includes('INPUT') || btn.textContent?.includes('入力')
                       );
    
    if (inputButton) {
      fireEvent.click(inputButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // OUTPUTゲートを追加
    const outputButton = container.querySelector('[data-testid="gate-button-OUTPUT"]') ||
                        Array.from(container.querySelectorAll('button')).find(btn => 
                          btn.textContent?.includes('OUTPUT') || btn.textContent?.includes('出力')
                        );
    
    if (outputButton) {
      fireEvent.click(outputButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ゲートが描画されたことを確認
    const gates = container.querySelectorAll('g[data-testid*="gate-"]');
    console.log('描画されたゲート数:', gates.length);
    expect(gates.length).toBeGreaterThanOrEqual(2);
    
    // 出力ピンと入力ピンを探す
    const circles = container.querySelectorAll('circle');
    let outputPin: Element | null = null;
    let inputPin: Element | null = null;
    
    // 出力ピン（右側）と入力ピン（左側）を位置で判別
    circles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute('cx') || '0');
      const r = parseFloat(circle.getAttribute('r') || '0');
      
      // 半径が12（クリック領域）のものを探す
      if (r === 12) {
        if (cx > 0 && !outputPin) {
          outputPin = circle as Element; // 右側は出力
        } else if (cx < 0 && !inputPin) {
          inputPin = circle as Element; // 左側は入力
        }
      }
    });
    
    console.log('出力ピン:', outputPin);
    console.log('入力ピン:', inputPin);
    
    expect(outputPin).toBeTruthy();
    expect(inputPin).toBeTruthy();
    
    if (outputPin && inputPin) {
      // 出力ピンでマウスダウン
      fireEvent.mouseDown(outputPin, { clientX: 150, clientY: 100 });
      
      // ドラッグ中の線が描画されることを確認
      await waitFor(() => {
        const lines = container.querySelectorAll('line');
        const drawingLine = Array.from(lines).find(line => 
          line.getAttribute('stroke-dasharray') === '5,5'
        );
        expect(drawingLine).toBeTruthy();
      });
      
      // マウスを動かす
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      
      // 入力ピンでマウスアップ
      fireEvent.mouseUp(inputPin);
      
      // 接続線が作成されたことを確認
      await waitFor(() => {
        const paths = container.querySelectorAll('path');
        console.log('パスの数:', paths.length);
        expect(paths.length).toBeGreaterThan(0);
      });
    }
  });

  it('入力ピンから出力ピンへドラッグして接続できる（逆方向）', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // 学習モードを選択
    const learningModeButton = container.querySelector('[data-testid="mode-btn-learning"]');
    if (learningModeButton) {
      fireEvent.click(learningModeButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 2つのINPUTゲートを追加
    const inputButton = container.querySelector('[data-testid="gate-button-INPUT"]') ||
                       Array.from(container.querySelectorAll('button')).find(btn => 
                         btn.textContent?.includes('INPUT')
                       );
    
    if (inputButton) {
      fireEvent.click(inputButton);
      await new Promise(resolve => setTimeout(resolve, 50));
      fireEvent.click(inputButton); // 2つ目
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ゲートの入力ピンと出力ピンを探す
    const circles = container.querySelectorAll('circle[r="12"]'); // クリック領域
    
    let inputPin: Element | null = null;
    let outputPin: Element | null = null;
    
    circles.forEach((circle, index) => {
      const cx = parseFloat(circle.getAttribute('cx') || '0');
      if (cx < 0 && !inputPin) {
        inputPin = circle as Element; // 左側の入力ピン
      } else if (cx > 0 && !outputPin) {
        outputPin = circle as Element; // 右側の出力ピン
      }
    });
    
    expect(inputPin).toBeTruthy();
    expect(outputPin).toBeTruthy();
    
    if (inputPin && outputPin) {
      // 入力ピンでマウスダウン（逆方向）
      fireEvent.mouseDown(inputPin);
      
      // ドラッグ
      fireEvent.mouseMove(document, { clientX: 300, clientY: 200 });
      
      // 出力ピンでマウスアップ
      fireEvent.mouseUp(outputPin);
      
      // 接続が作成されたことを確認
      await waitFor(() => {
        const paths = container.querySelectorAll('path');
        expect(paths.length).toBeGreaterThan(0);
      });
    }
  });

  it('同じゲートのピン同士は接続できない', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // 学習モードを選択
    const learningModeButton = container.querySelector('[data-testid="mode-btn-learning"]');
    if (learningModeButton) {
      fireEvent.click(learningModeButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ANDゲートを追加（複数の入出力ピンがある）
    const andButton = container.querySelector('[data-testid="gate-button-AND"]') ||
                     Array.from(container.querySelectorAll('button')).find(btn => 
                       btn.textContent === 'AND'
                     );
    
    if (andButton) {
      fireEvent.click(andButton);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 同じゲートの出力ピンと入力ピンを取得
    const gateGroup = container.querySelector('g[data-testid*="gate-"]');
    const circles = gateGroup?.querySelectorAll('circle[r="12"]') || [];
    
    expect(circles.length).toBeGreaterThanOrEqual(3); // 2入力 + 1出力
    
    if (circles.length >= 3) {
      const outputPin = Array.from(circles).find(c => 
        parseFloat(c.getAttribute('cx') || '0') > 0
      );
      const inputPin = Array.from(circles).find(c => 
        parseFloat(c.getAttribute('cx') || '0') < 0
      );
      
      if (outputPin && inputPin) {
        // 同じゲートの出力から入力へ接続を試みる
        fireEvent.mouseDown(outputPin);
        fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
        fireEvent.mouseUp(inputPin);
        
        // 接続が作成されないことを確認
        await new Promise(resolve => setTimeout(resolve, 100));
        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(0);
      }
    }
  });
});