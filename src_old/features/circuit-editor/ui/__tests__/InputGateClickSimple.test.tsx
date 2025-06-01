import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';

// シンプルなゲートコンポーネントのモック
const MockGateComponent: React.FC<{ 
  gate: any, 
  onGateClick: (gateId: string) => void,
  isDragging: boolean 
}> = ({ gate, onGateClick, isDragging }) => {
  const [hasDragged, setHasDragged] = React.useState(false);
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartPos.current) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.current.x, 2) + 
        Math.pow(e.clientY - dragStartPos.current.y, 2)
      );
      if (distance > 5) {
        setHasDragged(true);
      }
    }
  };

  const handleMouseUp = () => {
    dragStartPos.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Gate clicked:', { 
      gateId: gate.id, 
      gateType: gate.type, 
      hasDragged 
    });
    
    if (!hasDragged && gate.type === 'INPUT') {
      console.log('Calling onGateClick for INPUT gate');
      onGateClick(gate.id);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      data-testid={`gate-${gate.id}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        width: 50,
        height: 50,
        backgroundColor: gate.type === 'INPUT' ? (gate.value ? 'blue' : 'gray') : 'green',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {gate.type} - {gate.value ? 'ON' : 'OFF'}
    </div>
  );
};

describe('入力ゲートクリック機能の単体テスト', () => {
  test('hasDraggedフラグが正しく動作する', async () => {
    const mockOnClick = vi.fn();
    const gate = { id: 'test-1', type: 'INPUT', value: false };
    
    const { getByTestId } = render(
      <MockGateComponent 
        gate={gate} 
        onGateClick={mockOnClick}
        isDragging={false}
      />
    );

    const gateElement = getByTestId('gate-test-1');

    // ケース1: クリックのみ（ドラッグなし）
    fireEvent.mouseDown(gateElement);
    fireEvent.mouseUp(gateElement);
    fireEvent.click(gateElement);

    expect(mockOnClick).toHaveBeenCalledWith('test-1');
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // ケース2: ドラッグ後のクリック
    mockOnClick.mockClear();
    
    fireEvent.mouseDown(gateElement, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 }); // 50px移動
    fireEvent.mouseUp(document);
    fireEvent.click(gateElement);

    // ドラッグ後はクリックが無視される
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('ViewModelのtoggleInputが呼ばれる', () => {
    const viewModel = new UltraModernCircuitViewModel();
    const toggleSpy = vi.spyOn(viewModel, 'toggleInput');
    
    // INPUTゲートを追加
    const gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    
    // 初期状態
    expect(viewModel.getSimulationResults()[gate.id]).toBe(false);
    
    // toggleInputを呼ぶ
    viewModel.toggleInput(gate.id);
    
    expect(toggleSpy).toHaveBeenCalledWith(gate.id);
    expect(viewModel.getSimulationResults()[gate.id]).toBe(true);
  });

  test('実際のコンポーネント構造でのクリックイベント伝播', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const handleClick = vi.fn((e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('onClick fired');
    });

    const { container } = render(
      <svg width="800" height="600">
        <g transform="translate(100, 100)">
          <g onClick={handleClick} style={{ cursor: 'pointer' }}>
            <circle cx={0} cy={0} r={25} fill="red" />
          </g>
        </g>
      </svg>
    );

    const circle = container.querySelector('circle');
    expect(circle).toBeTruthy();
    
    // circleをクリック
    fireEvent.click(circle!);
    
    expect(handleClick).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('onClick fired');
    
    consoleSpy.mockRestore();
  });
});