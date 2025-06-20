/**
 * BINARY_COUNTERのドラッグ&ドロップ問題調査用テスト
 * 
 * 問題の詳細調査：
 * 1. ドラッグ開始処理の確認
 * 2. window._draggedGateの設定確認
 * 3. ドロップ処理の実行確認
 * 4. addGate呼び出しの確認
 * 5. ストア更新の確認
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateCard } from '@/components/tool-palette/GateCard';
import { useDragGate } from '@/components/tool-palette/hooks/useDragGate';
import type { GateType } from '@/types/circuit';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// テスト用の簡単なDragGateProvider
const TestDragProvider: React.FC<{ children: React.ReactNode; onDragStart: (type: GateType) => void }> = ({ 
  children, 
  onDragStart 
}) => {
  const { startDrag, endDrag } = useDragGate();
  
  return (
    <div>
      {children}
      <button 
        data-testid="simulate-drag-start"
        onClick={() => {
          onDragStart('BINARY_COUNTER');
          startDrag('BINARY_COUNTER');
        }}
      >
        Start Drag BINARY_COUNTER
      </button>
      <button 
        data-testid="simulate-drag-end"
        onClick={endDrag}
      >
        End Drag
      </button>
    </div>
  );
};

describe('BINARY_COUNTER Drop Debug', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateIds: [],
      viewMode: 'normal',
    });
    localStorageMock.clear();
    
    // window._draggedGateをクリア
    delete (window as any)._draggedGate;
  });

  test('DEBUG: Check drag start mechanism for BINARY_COUNTER', async () => {
    console.log('🔍 Testing BINARY_COUNTER drag start...');
    
    let dragStartCalled = false;
    const onDragStart = vi.fn((type: GateType) => {
      dragStartCalled = true;
      console.log('✅ onDragStart called with type:', type);
    });

    render(
      <TestDragProvider onDragStart={onDragStart}>
        <GateCard
          type="BINARY_COUNTER"
          label="COUNTER"
          onDragStart={onDragStart}
          onDragEnd={() => {}}
          testId="binary-counter-card"
        />
      </TestDragProvider>
    );

    // ドラッグ開始をシミュレート
    const dragStartButton = screen.getByTestId('simulate-drag-start');
    fireEvent.click(dragStartButton);

    expect(dragStartCalled).toBe(true);
    expect(onDragStart).toHaveBeenCalledWith('BINARY_COUNTER');
    
    // window._draggedGateが設定されているか確認
    await waitFor(() => {
      const draggedGate = (window as any)._draggedGate;
      console.log('🔍 window._draggedGate after drag start:', draggedGate);
      expect(draggedGate).toBeDefined();
      expect(draggedGate.type).toBe('BINARY_COUNTER');
    });
  });

  test('DEBUG: Check drop mechanism for BINARY_COUNTER', async () => {
    console.log('🔍 Testing BINARY_COUNTER drop handling...');
    
    // 初期状態確認
    const initialGates = useCircuitStore.getState().gates;
    console.log('📊 Initial gates count:', initialGates.length);
    expect(initialGates.length).toBe(0);

    // window._draggedGateを手動設定（ドラッグ状態をシミュレート）
    (window as any)._draggedGate = {
      type: 'BINARY_COUNTER',
    };
    console.log('✅ Set window._draggedGate:', (window as any)._draggedGate);

    // キャンバスをレンダー
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    const svgElement = container.querySelector('svg.unified-canvas__svg');
    expect(svgElement).toBeTruthy();

    // ドロップイベントをモック（DragEventを使わない）
    const mockDropEvent = {
      type: 'drop',
      preventDefault: vi.fn(),
      clientX: 400,
      clientY: 300,
      bubbles: true,
    };

    // getBoundingClientRectをモック
    const mockRect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    };
    vi.spyOn(svgElement!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    console.log('🎯 Firing drop event at (400, 300)...');
    fireEvent.drop(svgElement!, mockDropEvent);

    // ストア更新を待機
    await waitFor(() => {
      const updatedGates = useCircuitStore.getState().gates;
      console.log('📊 Gates after drop:', updatedGates.length);
      console.log('📋 Gates details:', updatedGates.map(g => ({ id: g.id, type: g.type, position: g.position })));
      
      expect(updatedGates.length).toBe(1);
      expect(updatedGates[0].type).toBe('BINARY_COUNTER');
      expect(updatedGates[0].position.x).toBeGreaterThan(0);
      expect(updatedGates[0].position.y).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  test('DEBUG: Compare INPUT vs BINARY_COUNTER drop behavior', async () => {
    console.log('🔍 Comparing INPUT vs BINARY_COUNTER drop behavior...');
    
    // INPUT ゲートのドロップテスト
    console.log('📝 Testing INPUT gate drop...');
    (window as any)._draggedGate = { type: 'INPUT' };
    
    const { container: inputContainer, unmount: unmountInput } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    const inputSvg = inputContainer.querySelector('svg.unified-canvas__svg');
    const mockRect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    };
    vi.spyOn(inputSvg!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    const inputDropEvent = {
      type: 'drop',
      preventDefault: vi.fn(),
      clientX: 200,
      clientY: 200,
      bubbles: true,
    };

    fireEvent.drop(inputSvg!, inputDropEvent);

    await waitFor(() => {
      const gatesAfterInput = useCircuitStore.getState().gates;
      console.log('✅ INPUT drop result - gates count:', gatesAfterInput.length);
      expect(gatesAfterInput.length).toBe(1);
      expect(gatesAfterInput[0].type).toBe('INPUT');
    });

    unmountInput();

    // ストアをリセット
    useCircuitStore.setState({ gates: [] });

    // BINARY_COUNTER ゲートのドロップテスト
    console.log('📝 Testing BINARY_COUNTER gate drop...');
    (window as any)._draggedGate = { type: 'BINARY_COUNTER' };
    
    const { container: counterContainer } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    const counterSvg = counterContainer.querySelector('svg.unified-canvas__svg');
    vi.spyOn(counterSvg!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    const counterDropEvent = {
      type: 'drop',
      preventDefault: vi.fn(),
      clientX: 400,
      clientY: 300,
      bubbles: true,
    };

    fireEvent.drop(counterSvg!, counterDropEvent);

    await waitFor(() => {
      const gatesAfterCounter = useCircuitStore.getState().gates;
      console.log('✅ BINARY_COUNTER drop result - gates count:', gatesAfterCounter.length);
      console.log('📋 Gate details:', gatesAfterCounter.map(g => ({ 
        type: g.type, 
        position: g.position,
        metadata: g.metadata 
      })));
      
      expect(gatesAfterCounter.length).toBe(1);
      expect(gatesAfterCounter[0].type).toBe('BINARY_COUNTER');
    }, { timeout: 3000 });
  });

  test('DEBUG: Check BINARY_COUNTER factory and store interaction', async () => {
    console.log('🔍 Testing BINARY_COUNTER factory and store interaction...');
    
    const { addGate } = useCircuitStore.getState();
    
    // addGate直接呼び出しテスト
    console.log('📝 Calling addGate directly...');
    const createdGate = addGate('BINARY_COUNTER', { x: 300, y: 250 });
    
    console.log('✅ Created gate:', {
      id: createdGate.id,
      type: createdGate.type,
      position: createdGate.position,
      metadata: createdGate.metadata,
    });

    // ストア状態確認
    const storeGates = useCircuitStore.getState().gates;
    console.log('📊 Store gates after addGate:', storeGates.length);
    console.log('📋 Store gate details:', storeGates.map(g => ({
      id: g.id,
      type: g.type,
      position: g.position
    })));

    expect(storeGates.length).toBe(1);
    expect(storeGates[0].type).toBe('BINARY_COUNTER');
    expect(storeGates[0].id).toBe(createdGate.id);

    // レンダリング確認
    const { container } = render(
      <UnifiedCanvas 
        config={CANVAS_MODE_PRESETS.editor}
        dataSource={{ store: true }}
        handlers={{}}
      />
    );

    // レンダリングされたSVG要素を確認
    await waitFor(() => {
      const gateElement = container.querySelector('[data-gate-type="BINARY_COUNTER"]');
      console.log('🎨 Rendered gate element found:', !!gateElement);
      expect(gateElement).toBeTruthy();
      
      const rectElement = container.querySelector('rect[width="120"]');
      console.log('🎨 Counter rect element found:', !!rectElement);
      expect(rectElement).toBeTruthy();
    });
  });
});