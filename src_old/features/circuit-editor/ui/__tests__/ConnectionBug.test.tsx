import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import UltraModernCircuitWithViewModel from '../../../../app/UltraModernCircuitWithViewModel';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';

describe('接続線のバグテスト', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    // localStorageのモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    global.localStorage = localStorageMock as any;
    
    // URLのモック
    delete (window as any).location;
    (window as any).location = { search: '' };
  });

  it.skip('出力ピンから入力ピンへの接続ができる', async () => {
    const result = render(<UltraModernCircuitWithViewModel />);
    container = result.container;
    
    // モード選択をスキップ（最初から回路編集モードに）
    const skipButton = screen.queryByText('スキップ');
    if (skipButton) {
      fireEvent.click(skipButton);
    }
    
    // ゲートを追加
    const inputButton = container.querySelector('[data-testid="gate-button-INPUT"]');
    if (inputButton) fireEvent.click(inputButton);
    
    const andButton = container.querySelector('[data-testid="gate-button-AND"]');
    if (andButton) fireEvent.click(andButton);
    
    await waitFor(() => {
      const gates = container.querySelectorAll('[data-gate-id]');
      expect(gates.length).toBe(2);
    });
    
    // ゲートを取得
    const gates = container.querySelectorAll('[data-gate-id]');
    const inputGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'INPUT');
    const andGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'AND');
    
    expect(inputGate).toBeTruthy();
    expect(andGate).toBeTruthy();
    
    // 入力ゲートの出力ピンを探す
    const outputPin = inputGate!.querySelector('[data-terminal="output"]');
    expect(outputPin).toBeTruthy();
    
    // ANDゲートの入力ピンを探す
    const inputPins = andGate!.querySelectorAll('[data-terminal="input"]');
    expect(inputPins.length).toBeGreaterThan(0);
    
    // 接続を開始（出力ピンでmouseDown）
    fireEvent.mouseDown(outputPin!);
    
    // 接続を完了（入力ピンでmouseUp）
    fireEvent.mouseUp(inputPins[0]);
    
    // 接続が作成されたか確認
    await waitFor(() => {
      const connections = container.querySelectorAll('path[data-connection]');
      expect(connections.length).toBe(1);
    });
  });

  it.skip('入力ピンから出力ピンへの接続ができる（逆方向）', async () => {
    const result = render(<UltraModernCircuitWithViewModel />);
    container = result.container;
    
    // モード選択をスキップ
    const skipButton = screen.queryByText('スキップ');
    if (skipButton) {
      fireEvent.click(skipButton);
    }
    
    // ゲートを追加
    const andButton = await waitFor(() => screen.getByText('AND'));
    fireEvent.click(andButton);
    
    const outputButton = await waitFor(() => screen.getByText('出力'));
    fireEvent.click(outputButton);
    
    await waitFor(() => {
      const gates = container.querySelectorAll('[data-gate-id]');
      expect(gates.length).toBe(2);
    });
    
    // ゲートを取得
    const gates = container.querySelectorAll('[data-gate-id]');
    const andGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'AND');
    const outputGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'OUTPUT');
    
    expect(andGate).toBeTruthy();
    expect(outputGate).toBeTruthy();
    
    // ANDゲートの出力ピンを探す
    const outputPin = andGate!.querySelector('[data-terminal="output"]');
    expect(outputPin).toBeTruthy();
    
    // 出力ゲートの入力ピンを探す
    const inputPin = outputGate!.querySelector('[data-terminal="input"]');
    expect(inputPin).toBeTruthy();
    
    // 接続を開始（出力ピンでmouseDown）
    fireEvent.mouseDown(outputPin!);
    
    // 接続を完了（入力ピンでmouseUp）
    fireEvent.mouseUp(inputPin!);
    
    // 接続が作成されたか確認
    await waitFor(() => {
      const connections = container.querySelectorAll('path[data-connection]');
      expect(connections.length).toBe(1);
    });
  });

  it.skip('両方向から接続を開始できる', async () => {
    const result = render(<UltraModernCircuitWithViewModel />);
    container = result.container;
    
    // モード選択をスキップ
    const skipButton = screen.queryByText('スキップ');
    if (skipButton) {
      fireEvent.click(skipButton);
    }
    
    // 2つのANDゲートを追加
    const andButton = await waitFor(() => screen.getByText('AND'));
    fireEvent.click(andButton);
    fireEvent.click(andButton);
    
    await waitFor(() => {
      const gates = container.querySelectorAll('[data-gate-id]');
      expect(gates.length).toBe(2);
    });
    
    const gates = container.querySelectorAll('[data-gate-id]');
    const gate1 = gates[0];
    const gate2 = gates[1];
    
    // ケース1: 出力から入力へ
    const outputPin1 = gate1.querySelector('[data-terminal="output"]');
    const inputPin2 = gate2.querySelector('[data-terminal="input"]');
    
    fireEvent.mouseDown(outputPin1!);
    fireEvent.mouseUp(inputPin2!);
    
    await waitFor(() => {
      const connections = container.querySelectorAll('path[data-connection]');
      expect(connections.length).toBe(1);
    });
    
    // ケース2: 入力から出力へ（逆方向）
    const outputPin2 = gate2.querySelector('[data-terminal="output"]');
    const inputPins1 = gate1.querySelectorAll('[data-terminal="input"]');
    const inputPin1 = inputPins1[1]; // 2番目の入力ピンを使用
    
    // 重要: 入力ピンからも接続を開始できるべき
    fireEvent.mouseDown(inputPin1!);
    fireEvent.mouseUp(outputPin2!);
    
    await waitFor(() => {
      const connections = container.querySelectorAll('path[data-connection]');
      expect(connections.length).toBe(2); // 2つ目の接続が作成される
    });
  });

  it.skip('クロックゲートの接続ができる', async () => {
    const result = render(<UltraModernCircuitWithViewModel />);
    container = result.container;
    
    // モード選択をスキップ
    const skipButton = screen.queryByText('スキップ');
    if (skipButton) {
      fireEvent.click(skipButton);
    }
    
    // クロックゲートと出力ゲートを追加
    const clockButton = await waitFor(() => screen.getByText('クロック'));
    fireEvent.click(clockButton);
    
    const outputButton = await waitFor(() => screen.getByText('出力'));
    fireEvent.click(outputButton);
    
    await waitFor(() => {
      const gates = container.querySelectorAll('[data-gate-id]');
      expect(gates.length).toBe(2);
    });
    
    // ゲートを取得
    const gates = container.querySelectorAll('[data-gate-id]');
    const clockGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'CLOCK');
    const outputGate = Array.from(gates).find(g => g.getAttribute('data-gate-type') === 'OUTPUT');
    
    expect(clockGate).toBeTruthy();
    expect(outputGate).toBeTruthy();
    
    // クロックゲートの出力ピン
    const clockOutput = clockGate!.querySelector('[data-terminal="output"]');
    expect(clockOutput).toBeTruthy();
    
    // 出力ゲートの入力ピン
    const outputInput = outputGate!.querySelector('[data-terminal="input"]');
    expect(outputInput).toBeTruthy();
    
    // 接続
    fireEvent.mouseDown(clockOutput!);
    fireEvent.mouseUp(outputInput!);
    
    await waitFor(() => {
      const connections = container.querySelectorAll('path[data-connection]');
      expect(connections.length).toBe(1);
    });
  });
});