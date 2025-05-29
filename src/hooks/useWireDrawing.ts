import { useState, useCallback } from 'react';
import { DrawingWire } from '../types/circuit';

interface UseWireDrawingProps {
  viewModel: any; // UltraModernCircuitViewModel
}

interface UseWireDrawingReturn {
  drawingWire: DrawingWire | null;
  startWireConnection: (gateId: string, pinIndex: number, isOutput: boolean, startX?: number, startY?: number) => void;
  updateWirePosition: (x: number, y: number) => void;
  completeWireConnection: (gateId: string, pinIndex: number, isOutput: boolean) => void;
  cancelWireConnection: () => void;
}

export function useWireDrawing({ viewModel }: UseWireDrawingProps): UseWireDrawingReturn {
  const [drawingWire, setDrawingWire] = useState<DrawingWire | null>(null);

  const startWireConnection = useCallback((gateId: string, pinIndex: number, isOutput: boolean, startX: number = 0, startY: number = 0) => {
    // DrawingWire型に合わせた構造
    setDrawingWire({
      from: gateId,
      fromOutput: isOutput ? pinIndex : undefined,
      fromInput: !isOutput ? pinIndex : undefined,
      pinType: isOutput ? 'output' : 'input',
      startX,
      startY,
      endX: startX,
      endY: startY
    });
  }, []);

  const updateWirePosition = useCallback((x: number, y: number) => {
    setDrawingWire(prev => prev ? {
      ...prev,
      endX: x,
      endY: y
    } : null);
  }, []);

  const completeWireConnection = useCallback((gateId: string, pinIndex: number, isOutput: boolean) => {
    if (drawingWire) {
      const { from, fromOutput, fromInput, pinType } = drawingWire;
      
      if (pinType === 'output' && !isOutput) {
        // 出力から入力へ
        viewModel.addConnection(from, fromOutput || 0, gateId, pinIndex);
      } else if (pinType === 'input' && isOutput) {
        // 入力から出力へ
        viewModel.addConnection(gateId, pinIndex, from, fromInput || 0);
      }
    }
    
    setDrawingWire(null);
  }, [drawingWire, viewModel]);

  const cancelWireConnection = useCallback(() => {
    setDrawingWire(null);
  }, []);

  return {
    drawingWire,
    startWireConnection,
    updateWirePosition,
    completeWireConnection,
    cancelWireConnection
  };
}