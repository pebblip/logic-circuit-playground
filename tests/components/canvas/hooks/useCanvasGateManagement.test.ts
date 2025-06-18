/**
 * useCanvasGateManagement フックのテスト
 * ドラッグ&ドロップによるゲート配置の動作確認
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasGateManagement } from '@/components/canvas/hooks/useCanvasGateManagement';
import { useCircuitStore } from '@/stores/circuitStore';
import type { GateType, CustomGateDefinition } from '@/types/gates';

// モックの設定
vi.mock('@/stores/circuitStore');
vi.mock('@infrastructure/ui/svgCoordinates', () => ({
  reactEventToSVGCoordinates: vi.fn((event, svg) => ({ x: 150, y: 250 }))
}));

// DragEventのモック（jsdomでは利用不可のため）
class MockDragEvent extends Event {
  dataTransfer: DataTransfer | null;
  
  constructor(type: string, options?: any) {
    super(type, options);
    this.dataTransfer = options?.dataTransfer || null;
  }
}
global.DragEvent = MockDragEvent as any;

describe('useCanvasGateManagement', () => {
  const mockAddGate = vi.fn();
  const mockAddCustomGateInstance = vi.fn();
  const mockSvgRef = { current: document.createElementNS('http://www.w3.org/2000/svg', 'svg') };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // useCircuitStoreのモック
    (useCircuitStore as any).mockReturnValue({
      addGate: mockAddGate,
      addCustomGateInstance: mockAddCustomGateInstance
    });
    
    // window._draggedGateをクリア
    delete (window as any)._draggedGate;
  });

  describe('handleDrop', () => {
    it('読み取り専用モードでは何もしない', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: true })
      );
      
      const event = new DragEvent('drop');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      (window as any)._draggedGate = { type: 'AND' };
      
      act(() => {
        result.current.handleDrop(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockAddGate).not.toHaveBeenCalled();
    });

    it('標準ゲートをドロップして配置する', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const event = new DragEvent('drop');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      (window as any)._draggedGate = { type: 'AND' as GateType };
      
      act(() => {
        result.current.handleDrop(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockAddGate).toHaveBeenCalledWith('AND', { x: 150, y: 250 });
      expect(mockAddCustomGateInstance).not.toHaveBeenCalled();
    });

    it('カスタムゲートをドロップして配置する', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const customDefinition: CustomGateDefinition = {
        id: 'custom-1',
        name: 'CustomGate',
        displayName: 'カスタムゲート',
        inputs: [{ name: 'A', index: 0 }, { name: 'B', index: 1 }],
        outputs: [{ name: 'Y', index: 0 }],
        width: 100,
        height: 60,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const event = new DragEvent('drop');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      (window as any)._draggedGate = { 
        type: 'CUSTOM' as GateType,
        customDefinition 
      };
      
      act(() => {
        result.current.handleDrop(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockAddCustomGateInstance).toHaveBeenCalledWith(
        customDefinition,
        { x: 150, y: 250 }
      );
      expect(mockAddGate).not.toHaveBeenCalled();
    });

    it('ドラッグデータがない場合は何もしない', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const event = new DragEvent('drop');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      // window._draggedGateを設定しない
      
      act(() => {
        result.current.handleDrop(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockAddGate).not.toHaveBeenCalled();
      expect(mockAddCustomGateInstance).not.toHaveBeenCalled();
    });

    it('SVG参照がない場合は何もしない', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: { current: null }, isReadOnly: false })
      );
      
      const event = new DragEvent('drop');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      
      (window as any)._draggedGate = { type: 'AND' };
      
      act(() => {
        result.current.handleDrop(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(mockAddGate).not.toHaveBeenCalled();
    });

    it('異なるゲートタイプを正しく処理する', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const gateTypes: GateType[] = ['OR', 'NOT', 'XOR', 'NAND', 'NOR', 'INPUT', 'OUTPUT', 'CLOCK'];
      
      gateTypes.forEach(type => {
        vi.clearAllMocks();
        
        const event = new DragEvent('drop');
        const preventDefault = vi.fn();
        Object.defineProperty(event, 'preventDefault', { value: preventDefault });
        
        (window as any)._draggedGate = { type };
        
        act(() => {
          result.current.handleDrop(event as any);
        });
        
        expect(mockAddGate).toHaveBeenCalledWith(type, { x: 150, y: 250 });
      });
    });
  });

  describe('handleDragOver', () => {
    it('ドラッグオーバーイベントをハンドリングする', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const event = new DragEvent('dragover');
      const preventDefault = vi.fn();
      const dataTransfer = { dropEffect: '' };
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
      
      act(() => {
        result.current.handleDragOver(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
      expect(dataTransfer.dropEffect).toBe('copy');
    });

    it('dataTransferがない場合でもエラーにならない', () => {
      const { result } = renderHook(() => 
        useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
      );
      
      const event = new DragEvent('dragover');
      const preventDefault = vi.fn();
      Object.defineProperty(event, 'preventDefault', { value: preventDefault });
      Object.defineProperty(event, 'dataTransfer', { value: null });
      
      act(() => {
        result.current.handleDragOver(event as any);
      });
      
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  it('複数回のドロップを正しく処理する', () => {
    const { result } = renderHook(() => 
      useCanvasGateManagement({ svgRef: mockSvgRef, isReadOnly: false })
    );
    
    // 1回目のドロップ
    const event1 = new DragEvent('drop');
    const preventDefault1 = vi.fn();
    Object.defineProperty(event1, 'preventDefault', { value: preventDefault1 });
    (window as any)._draggedGate = { type: 'AND' };
    
    act(() => {
      result.current.handleDrop(event1 as any);
    });
    
    expect(mockAddGate).toHaveBeenCalledTimes(1);
    expect(mockAddGate).toHaveBeenLastCalledWith('AND', { x: 150, y: 250 });
    
    // 2回目のドロップ
    const event2 = new DragEvent('drop');
    const preventDefault2 = vi.fn();
    Object.defineProperty(event2, 'preventDefault', { value: preventDefault2 });
    (window as any)._draggedGate = { type: 'OR' };
    
    act(() => {
      result.current.handleDrop(event2 as any);
    });
    
    expect(mockAddGate).toHaveBeenCalledTimes(2);
    expect(mockAddGate).toHaveBeenLastCalledWith('OR', { x: 150, y: 250 });
  });
});