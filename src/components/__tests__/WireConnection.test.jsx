import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, fireEvent } from '@testing-library/react';
import { WireConnection, ConnectionPoint, useWireConnections } from '../WireConnection';

describe('WireConnection', () => {
  it('線が正しく描画される', () => {
    const { container } = render(
      <svg>
        <WireConnection 
          startPoint={{ x: 10, y: 20 }}
          endPoint={{ x: 50, y: 60 }}
          isActive={false}
        />
      </svg>
    );
    
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')).toBe('M 10 20 L 50 60');
    expect(path.getAttribute('stroke')).toBe('#6b7280');
  });

  it('アクティブ状態で点線になる', () => {
    const { container } = render(
      <svg>
        <WireConnection 
          startPoint={{ x: 10, y: 20 }}
          endPoint={{ x: 50, y: 60 }}
          isActive={true}
        />
      </svg>
    );
    
    const path = container.querySelector('path');
    expect(path.getAttribute('stroke')).toBe('#3b82f6');
    expect(path.getAttribute('stroke-dasharray')).toBe('5,5');
  });
});

describe('ConnectionPoint', () => {
  it('クリック可能な接続ポイントが描画される', () => {
    const handleMouseDown = vi.fn();
    const handleMouseUp = vi.fn();
    
    const { container } = render(
      <svg>
        <ConnectionPoint
          x={10}
          y={20}
          type="output"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </svg>
    );
    
    const circle = container.querySelector('circle');
    expect(circle).toBeTruthy();
    expect(circle.getAttribute('cx')).toBe('10');
    expect(circle.getAttribute('cy')).toBe('20');
    
    fireEvent.mouseDown(circle);
    expect(handleMouseDown).toHaveBeenCalled();
    
    fireEvent.mouseUp(circle);
    expect(handleMouseUp).toHaveBeenCalled();
  });
});

describe('useWireConnections', () => {
  it('接続を開始できる', () => {
    const { result } = renderHook(() => useWireConnections());
    
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
    });
    
    expect(result.current.activeConnection).toEqual({
      fromId: 'gate1',
      fromPoint: { x: 10, y: 20 },
      id: expect.stringMatching(/^temp_/)
    });
  });

  it('接続を完了できる', () => {
    const { result } = renderHook(() => useWireConnections());
    
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
    });
    
    act(() => {
      const success = result.current.completeConnection('gate2', { x: 50, y: 60 }, 0);
      expect(success).toBe(true);
    });
    
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toEqual({
      id: expect.stringMatching(/^conn_/),
      fromId: 'gate1',
      fromPoint: { x: 10, y: 20 },
      toId: 'gate2',
      toPoint: { x: 50, y: 60 },
      toIndex: 0
    });
    expect(result.current.activeConnection).toBeNull();
  });

  it('同じ入力への既存接続を置き換える', () => {
    const { result } = renderHook(() => useWireConnections());
    
    // 最初の接続
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
    });
    
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 100 }, 0);
    });
    
    expect(result.current.connections).toHaveLength(1);
    const firstConnId = result.current.connections[0].id;
    
    // 同じ入力への新しい接続
    act(() => {
      result.current.startConnection('gate2', { x: 30, y: 40 });
    });
    
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 100 }, 0);
    });
    
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0].fromId).toBe('gate2');
    expect(result.current.connections[0].id).not.toBe(firstConnId);
  });

  it('異なる入力への接続は追加される', () => {
    const { result } = renderHook(() => useWireConnections());
    
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
    });
    
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 100 }, 0);
    });
    
    act(() => {
      result.current.startConnection('gate2', { x: 30, y: 40 });
    });
    
    act(() => {
      result.current.completeConnection('gate3', { x: 100, y: 120 }, 1);
    });
    
    expect(result.current.connections).toHaveLength(2);
    expect(result.current.connections[0].toIndex).toBe(0);
    expect(result.current.connections[1].toIndex).toBe(1);
  });

  it('自己接続は拒否される', () => {
    const { result } = renderHook(() => useWireConnections());
    
    act(() => {
      result.current.startConnection('gate1', { x: 10, y: 20 });
      const success = result.current.completeConnection('gate1', { x: 10, y: 40 }, 0);
      expect(success).toBe(false);
    });
    
    expect(result.current.connections).toHaveLength(0);
    expect(result.current.activeConnection).toBeNull();
  });
});