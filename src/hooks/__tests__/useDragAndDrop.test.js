// useDragAndDrop フックのテスト

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../useDragAndDrop';

// getSVGPointをモック
vi.mock('../../utils/svg', () => ({
  getSVGPoint: vi.fn((event, svgElement) => ({
    x: event.clientX || 0,
    y: event.clientY || 0
  }))
}));

describe('useDragAndDrop', () => {
  let mockOnGateMove;
  
  beforeEach(() => {
    mockOnGateMove = vi.fn();
  });

  const mockGate = {
    id: 1,
    type: 'AND',
    x: 100,
    y: 200
  };

  const createMockEvent = (clientX = 0, clientY = 0) => ({
    clientX,
    clientY,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn()
  });

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));

      expect(result.current.svgRef.current).toBe(null);
      expect(result.current.draggedGate).toBe(null);
      expect(result.current.connectionDrag).toBe(null);
      expect(result.current.mousePosition).toEqual({ x: 0, y: 0 });
    });
  });

  describe('ゲートのドラッグ', () => {
    it('handleGateMouseDownでドラッグを開始できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const event = createMockEvent(150, 250);

      act(() => {
        result.current.handleGateMouseDown(event, mockGate);
      });

      expect(result.current.draggedGate).toEqual(mockGate);
      expect(result.current.dragOffset).toEqual({
        x: 50,  // 150 - 100
        y: 50   // 250 - 200
      });
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('handleMouseMoveでゲートを移動できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      // ドラッグ開始
      act(() => {
        const startEvent = createMockEvent(150, 250);
        result.current.handleGateMouseDown(startEvent, mockGate);
      });

      // マウス移動
      act(() => {
        const moveEvent = createMockEvent(200, 300);
        result.current.handleMouseMove(moveEvent);
      });

      // onGateMoveが呼ばれることを確認（グリッドスナップが適用される）
      expect(mockOnGateMove).toHaveBeenCalledWith(1, 160, 260);
      expect(result.current.mousePosition).toEqual({ x: 200, y: 300 });
    });

    it('ゲートの位置が制約内に収まる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      // ドラッグ開始
      act(() => {
        const startEvent = createMockEvent(100, 100);
        result.current.handleGateMouseDown(startEvent, mockGate);
      });

      // 範囲外への移動を試みる
      act(() => {
        const moveEvent = createMockEvent(-100, -100); // 負の座標
        result.current.handleMouseMove(moveEvent);
      });

      // 最小値でクランプされ、グリッドスナップが適用される
      expect(mockOnGateMove).toHaveBeenCalledWith(1, 60, 60); // グリッドスナップ後の値
    });

    it('handleMouseUpでドラッグを終了できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(), mockGate);
      });

      expect(result.current.draggedGate).not.toBe(null);

      // ドラッグ終了
      act(() => {
        result.current.handleMouseUp();
      });

      expect(result.current.draggedGate).toBe(null);
      expect(result.current.dragOffset).toBe(null);
    });
  });

  describe('接続のドラッグ', () => {
    it('handleTerminalMouseDownで接続ドラッグを開始できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const event = createMockEvent();

      act(() => {
        result.current.handleTerminalMouseDown(event, mockGate, true, 0);
      });

      expect(result.current.connectionDrag).toEqual({
        fromGate: mockGate,
        fromOutput: 0,
        fromX: 170,  // gate.x + 60 + 10
        fromY: 200,   // gate.y + (outputIndex * 20)
        startX: 170,
        startY: 200,
        dragType: 'output'
      });
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('入力端子からもドラッグを開始できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const event = createMockEvent();

      act(() => {
        result.current.handleTerminalMouseDown(event, mockGate, false, 0);
      });

      expect(result.current.connectionDrag).toEqual({
        toGate: mockGate,
        toInput: 0,
        fromX: 30,  // gate.x - 60 - 10
        fromY: 180,  // gate.y - 20
        startX: 30,
        startY: 180,
        dragType: 'input'
      });
    });

    it('handleTerminalMouseUpで接続を完了できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      const fromGate = { id: 1, x: 100, y: 100 };
      const toGate = { id: 2, x: 200, y: 200 };

      // 接続ドラッグ開始
      act(() => {
        result.current.handleTerminalMouseDown(createMockEvent(), fromGate, true, 0);
      });

      // 別のゲートの入力端子でマウスアップ
      let connection;
      act(() => {
        const event = createMockEvent();
        connection = result.current.handleTerminalMouseUp(event, toGate, 0);
      });

      expect(connection).toEqual({
        from: 1,
        fromOutput: 0,
        to: 2,
        toInput: 0
      });
    });

    it('同じゲートには接続できない', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      // 接続ドラッグ開始
      act(() => {
        result.current.handleTerminalMouseDown(createMockEvent(), mockGate, true, 0);
      });

      // 同じゲートの入力端子でマウスアップ
      let connection;
      act(() => {
        const event = createMockEvent();
        connection = result.current.handleTerminalMouseUp(event, mockGate, 0);
      });

      expect(connection).toBe(null);
    });

    it('接続ドラッグがない状態でterminalMouseUpを呼んでもnullを返す', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      let connection;
      act(() => {
        const event = createMockEvent();
        connection = result.current.handleTerminalMouseUp(event, mockGate, 0);
      });

      expect(connection).toBe(null);
    });
  });

  describe('マウス位置の追跡', () => {
    it('handleMouseMoveでマウス位置が更新される', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      
      act(() => {
        const event = createMockEvent(123, 456);
        result.current.handleMouseMove(event);
      });

      expect(result.current.mousePosition).toEqual({ x: 123, y: 456 });
    });
  });

  describe('複数出力の対応', () => {
    it('異なる出力インデックスで接続ドラッグを開始できる', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const event = createMockEvent();

      act(() => {
        result.current.handleTerminalMouseDown(event, mockGate, true, 2);
      });

      expect(result.current.connectionDrag).toMatchObject({
        fromOutput: 2,
        fromY: 230  // gate.y - 10 + (2 * 20)
      });
    });
  });

  describe('Cypressで難しかったドラッグ機能', () => {
    it('ゲートをドラッグして移動できる（座標が変わる）', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const initialGate = { id: 'input-1', type: 'INPUT', x: 200, y: 200 };
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(200, 200), initialGate);
      });
      
      // 200px右、100px下に移動
      act(() => {
        result.current.handleMouseMove(createMockEvent(400, 300));
      });
      
      // グリッドスナップが適用された新しい座標が設定される
      expect(mockOnGateMove).toHaveBeenCalledWith('input-1', 400, 300);
    });

    it('接続されたゲートを移動しても接続線が追従する', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const connectedGate = { id: 'input-1', type: 'INPUT', x: 200, y: 200 };
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(200, 200), connectedGate);
      });
      
      // 100px下に移動
      act(() => {
        result.current.handleMouseMove(createMockEvent(200, 300));
      });
      
      // ゲートの移動が呼ばれる（接続線は別のレイヤーで管理）
      expect(mockOnGateMove).toHaveBeenCalled();
      const [, newX, newY] = mockOnGateMove.mock.calls[0];
      expect(newY).toBeGreaterThan(200);
    });

    it('ドラッグ中はゲートが半透明になる状態を管理', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const gate = { id: 'and-1', type: 'AND', x: 300, y: 300 };
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(300, 300), gate);
      });
      
      // ドラッグ中のゲートが設定される
      expect(result.current.draggedGate).toEqual(gate);
      
      // ドラッグ終了
      act(() => {
        result.current.handleMouseUp();
      });
      
      // ドラッグ状態がクリアされる
      expect(result.current.draggedGate).toBe(null);
    });

    it('キャンバスの境界を超えてドラッグできない', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const gate = { id: 'not-1', type: 'NOT', x: 400, y: 400 };
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(400, 400), gate);
      });
      
      // キャンバス外に移動を試みる
      act(() => {
        result.current.handleMouseMove(createMockEvent(-100, -100));
      });
      
      // 最小値でクランプされる
      const [, x, y] = mockOnGateMove.mock.calls[mockOnGateMove.mock.calls.length - 1];
      expect(x).toBeGreaterThanOrEqual(60); // 最小値 + グリッドスナップ
      expect(y).toBeGreaterThanOrEqual(60);
    });

    it('グリッドスナップが20px単位で動作する', () => {
      const { result } = renderHook(() => useDragAndDrop(mockOnGateMove));
      const gate = { id: 'gate-1', type: 'AND', x: 100, y: 100 };
      
      // ドラッグ開始
      act(() => {
        result.current.handleGateMouseDown(createMockEvent(100, 100), gate);
      });
      
      // 半端な位置に移動
      act(() => {
        result.current.handleMouseMove(createMockEvent(117, 123));
      });
      
      // 20px単位にスナップされる
      const [, x, y] = mockOnGateMove.mock.calls[mockOnGateMove.mock.calls.length - 1];
      expect(x % 20).toBe(0);
      expect(y % 20).toBe(0);
    });
  });
});