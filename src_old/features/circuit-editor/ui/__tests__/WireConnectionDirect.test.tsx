import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

// ワイヤー接続のコア機能をテストするシンプルなコンポーネント
const WireConnectionTest: React.FC = () => {
  const [connections, setConnections] = React.useState<any[]>([]);
  const [drawingWire, setDrawingWire] = React.useState<any>(null);

  const handlePinMouseDown = (gateId: string, pinType: 'input' | 'output', pinIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`MouseDown on ${pinType} pin of gate ${gateId}`);
    setDrawingWire({
      from: gateId,
      pinType,
      pinIndex,
      startX: e.clientX,
      startY: e.clientY
    });
  };

  const handlePinMouseUp = (gateId: string, pinType: 'input' | 'output', pinIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`MouseUp on ${pinType} pin of gate ${gateId}`);
    
    if (drawingWire && drawingWire.from !== gateId) {
      // 接続を作成
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: drawingWire.pinType === 'output' ? drawingWire.from : gateId,
        fromOutput: drawingWire.pinType === 'output' ? drawingWire.pinIndex : pinIndex,
        to: drawingWire.pinType === 'input' ? drawingWire.from : gateId,
        toInput: drawingWire.pinType === 'input' ? drawingWire.pinIndex : pinIndex
      };
      
      console.log('Creating connection:', newConnection);
      setConnections([...connections, newConnection]);
    }
    
    setDrawingWire(null);
  };

  const handleCanvasMouseUp = () => {
    console.log('Canvas MouseUp - canceling wire');
    setDrawingWire(null);
  };

  return (
    <svg width="400" height="300" onMouseUp={handleCanvasMouseUp}>
      {/* Gate 1 - Input Gate */}
      <g transform="translate(100, 100)" data-testid="gate-1">
        <rect x="-25" y="-25" width="50" height="50" fill="lightblue" />
        <text x="0" y="0" textAnchor="middle">G1</text>
        {/* Output pin */}
        <circle
          cx="25"
          cy="0"
          r="5"
          fill="red"
          data-testid="gate-1-output-0"
          onMouseDown={(e) => handlePinMouseDown('gate-1', 'output', 0, e)}
          onMouseUp={(e) => handlePinMouseUp('gate-1', 'output', 0, e)}
        />
      </g>

      {/* Gate 2 - Output Gate */}
      <g transform="translate(250, 100)" data-testid="gate-2">
        <rect x="-25" y="-25" width="50" height="50" fill="lightgreen" />
        <text x="0" y="0" textAnchor="middle">G2</text>
        {/* Input pin */}
        <circle
          cx="-25"
          cy="0"
          r="5"
          fill="blue"
          data-testid="gate-2-input-0"
          onMouseDown={(e) => handlePinMouseDown('gate-2', 'input', 0, e)}
          onMouseUp={(e) => handlePinMouseUp('gate-2', 'input', 0, e)}
        />
      </g>

      {/* Drawing wire */}
      {drawingWire && (
        <line
          x1={drawingWire.startX}
          y1={drawingWire.startY}
          x2={drawingWire.startX + 50}
          y2={drawingWire.startY}
          stroke="orange"
          strokeWidth="2"
          strokeDasharray="5,5"
          data-testid="drawing-wire"
        />
      )}

      {/* Connections */}
      {connections.map((conn) => (
        <line
          key={conn.id}
          x1="125"
          y1="100"
          x2="225"
          y2="100"
          stroke="green"
          strokeWidth="2"
          data-testid={`connection-${conn.id}`}
        />
      ))}

      {/* Debug info */}
      <text x="10" y="20" fontSize="12">
        Connections: {connections.length}
      </text>
      <text x="10" y="40" fontSize="12">
        Drawing: {drawingWire ? 'Yes' : 'No'}
      </text>
    </svg>
  );
};

describe('ワイヤー接続の直接テスト', () => {
  it('現在の実装: ピンのonMouseUpが呼ばれない', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { getByTestId } = render(<WireConnectionTest />);

    const outputPin = getByTestId('gate-1-output-0');
    const inputPin = getByTestId('gate-2-input-0');

    // 出力ピンでマウスダウン
    fireEvent.mouseDown(outputPin, { clientX: 125, clientY: 100 });
    expect(consoleSpy).toHaveBeenCalledWith('MouseDown on output pin of gate gate-1');

    // 描画中のワイヤーが表示される
    expect(getByTestId('drawing-wire')).toBeTruthy();

    // 入力ピンでマウスアップ - これが問題！
    // 実際のブラウザでは、SVGのonMouseUpが先に発火してキャンセルされる
    fireEvent.mouseUp(inputPin, { clientX: 225, clientY: 100 });
    
    // テスト環境では正常に動作するが、実際のブラウザでは動作しない
    expect(consoleSpy).toHaveBeenCalledWith('MouseUp on input pin of gate gate-2');
    
    consoleSpy.mockRestore();
  });

  it('問題の再現: SVGのonMouseUpが先に発火する', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { getByTestId, container } = render(<WireConnectionTest />);

    const outputPin = getByTestId('gate-1-output-0');
    const svg = container.querySelector('svg');

    // 出力ピンでマウスダウン
    fireEvent.mouseDown(outputPin, { clientX: 125, clientY: 100 });

    // SVGでマウスアップ（実際のブラウザではこれが発生）
    fireEvent.mouseUp(svg!, { clientX: 225, clientY: 100 });
    expect(consoleSpy).toHaveBeenCalledWith('Canvas MouseUp - canceling wire');

    // 接続は作成されない
    const connections = container.querySelectorAll('[data-testid*="connection-"]');
    expect(connections.length).toBe(0);

    consoleSpy.mockRestore();
  });
});