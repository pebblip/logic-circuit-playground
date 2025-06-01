import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

describe('接続ロジックのテスト', () => {
  // シンプルな接続フックをテスト
  const useConnectionTest = () => {
    const [connections, setConnections] = React.useState<any[]>([]);
    const [drawingWire, setDrawingWire] = React.useState<any>(null);
    
    const startWireConnection = (gateId: string, outputIndex: number, x: number, y: number) => {
      setDrawingWire({ from: gateId, fromOutput: outputIndex, startX: x, startY: y, endX: x, endY: y });
    };
    
    const completeWireConnection = (toGateId: string, inputIndex: number) => {
      if (drawingWire && drawingWire.from !== toGateId) {
        const newConnection = {
          id: `conn_${Date.now()}`,
          from: drawingWire.from,
          fromOutput: drawingWire.fromOutput || 0,
          to: toGateId,
          toInput: inputIndex
        };
        setConnections([...connections, newConnection]);
      }
      setDrawingWire(null);
    };
    
    const canStartConnectionFromInput = () => {
      // 問題: 入力ピンからは接続を開始できない現在の実装
      return false;
    };
    
    const canCompleteConnectionToOutput = () => {
      // 問題: 出力ピンへは接続を完了できない現在の実装
      return false;
    };
    
    return {
      connections,
      drawingWire,
      startWireConnection,
      completeWireConnection,
      canStartConnectionFromInput,
      canCompleteConnectionToOutput
    };
  };

  it('出力ピンから接続を開始できる', () => {
    const { result } = renderHook(() => useConnectionTest());
    
    act(() => {
      result.current.startWireConnection('gate1', 0, 100, 100);
    });
    
    expect(result.current.drawingWire).toEqual({
      from: 'gate1',
      fromOutput: 0,
      startX: 100,
      startY: 100,
      endX: 100,
      endY: 100
    });
  });

  it('入力ピンへ接続を完了できる', () => {
    const { result } = renderHook(() => useConnectionTest());
    
    // まず接続を開始
    act(() => {
      result.current.startWireConnection('gate1', 0, 100, 100);
    });
    
    // 別のゲートの入力ピンに接続
    act(() => {
      result.current.completeWireConnection('gate2', 0);
    });
    
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toMatchObject({
      from: 'gate1',
      fromOutput: 0,
      to: 'gate2',
      toInput: 0
    });
    expect(result.current.drawingWire).toBeNull();
  });

  it('同じゲートへの自己接続はできない', () => {
    const { result } = renderHook(() => useConnectionTest());
    
    act(() => {
      result.current.startWireConnection('gate1', 0, 100, 100);
    });
    
    act(() => {
      result.current.completeWireConnection('gate1', 1);
    });
    
    expect(result.current.connections).toHaveLength(0);
    expect(result.current.drawingWire).toBeNull();
  });

  it('現在の実装では入力ピンから接続を開始できない（バグ）', () => {
    const { result } = renderHook(() => useConnectionTest());
    
    // これが問題：入力ピンからの接続開始ができない
    expect(result.current.canStartConnectionFromInput()).toBe(false);
    
    // 本来はtrueであるべき
    // expect(result.current.canStartConnectionFromInput()).toBe(true);
  });

  it('現在の実装では出力ピンへ接続を完了できない（バグ）', () => {
    const { result } = renderHook(() => useConnectionTest());
    
    // これが問題：出力ピンへの接続完了ができない
    expect(result.current.canCompleteConnectionToOutput()).toBe(false);
    
    // 本来はtrueであるべき
    // expect(result.current.canCompleteConnectionToOutput()).toBe(true);
  });
});

// 正しい実装の例
describe('接続ロジックの改善案', () => {
  const useImprovedConnection = () => {
    const [connections, setConnections] = React.useState<any[]>([]);
    const [drawingWire, setDrawingWire] = React.useState<any>(null);
    
    // 汎用的な接続開始関数
    const startConnection = (gateId: string, pinType: 'input' | 'output', pinIndex: number, x: number, y: number) => {
      setDrawingWire({ 
        gateId, 
        pinType, 
        pinIndex, 
        startX: x, 
        startY: y, 
        endX: x, 
        endY: y 
      });
    };
    
    // 汎用的な接続完了関数
    const completeConnection = (gateId: string, pinType: 'input' | 'output', pinIndex: number) => {
      if (!drawingWire || drawingWire.gateId === gateId) {
        setDrawingWire(null);
        return;
      }
      
      // 接続の方向を判定
      let from, fromOutput, to, toInput;
      
      if (drawingWire.pinType === 'output' && pinType === 'input') {
        // 出力から入力へ
        from = drawingWire.gateId;
        fromOutput = drawingWire.pinIndex;
        to = gateId;
        toInput = pinIndex;
      } else if (drawingWire.pinType === 'input' && pinType === 'output') {
        // 入力から出力へ（逆方向）
        from = gateId;
        fromOutput = pinIndex;
        to = drawingWire.gateId;
        toInput = drawingWire.pinIndex;
      } else {
        // 不正な接続（同じタイプのピン同士）
        setDrawingWire(null);
        return;
      }
      
      const newConnection = {
        id: `conn_${Date.now()}`,
        from,
        fromOutput,
        to,
        toInput
      };
      
      setConnections([...connections, newConnection]);
      setDrawingWire(null);
    };
    
    return {
      connections,
      drawingWire,
      startConnection,
      completeConnection
    };
  };

  it('出力ピンから入力ピンへの接続', () => {
    const { result } = renderHook(() => useImprovedConnection());
    
    act(() => {
      result.current.startConnection('gate1', 'output', 0, 100, 100);
    });
    
    act(() => {
      result.current.completeConnection('gate2', 'input', 0);
    });
    
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toMatchObject({
      from: 'gate1',
      fromOutput: 0,
      to: 'gate2',
      toInput: 0
    });
  });

  it('入力ピンから出力ピンへの接続（逆方向）', () => {
    const { result } = renderHook(() => useImprovedConnection());
    
    act(() => {
      result.current.startConnection('gate1', 'input', 0, 100, 100);
    });
    
    act(() => {
      result.current.completeConnection('gate2', 'output', 0);
    });
    
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toMatchObject({
      from: 'gate2',  // 出力側が from になる
      fromOutput: 0,
      to: 'gate1',    // 入力側が to になる
      toInput: 0
    });
  });

  it('同じタイプのピン同士は接続できない', () => {
    const { result } = renderHook(() => useImprovedConnection());
    
    // 出力同士
    act(() => {
      result.current.startConnection('gate1', 'output', 0, 100, 100);
    });
    
    act(() => {
      result.current.completeConnection('gate2', 'output', 0);
    });
    
    expect(result.current.connections).toHaveLength(0);
    
    // 入力同士
    act(() => {
      result.current.startConnection('gate1', 'input', 0, 100, 100);
    });
    
    act(() => {
      result.current.completeConnection('gate2', 'input', 0);
    });
    
    expect(result.current.connections).toHaveLength(0);
  });
});