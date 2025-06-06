import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';

interface UseWireConnectionResult {
  handlePinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
}

export function useGateWireConnection(gate: Gate): UseWireConnectionResult {
  const { startWireDrawing, endWireDrawing } = useCircuitStore();

  const handlePinClick = (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => {
    event.stopPropagation();
    event.preventDefault();

    // カスタムゲートの場合、pinIndexは既に正しい値（出力:負、入力:正）
    // 通常ゲートの場合、出力ピンは-1、入力ピンはインデックスをそのまま使用
    let actualPinIndex: number;

    if (gate.type === 'CUSTOM') {
      // カスタムゲートは既に正しいインデックスが渡されている
      actualPinIndex = pinIndex;
    } else {
      // 通常ゲートは出力ピンの場合のみ-1を使用
      actualPinIndex = isOutput ? -1 : pinIndex;
    }

    if (useCircuitStore.getState().isDrawingWire) {
      endWireDrawing(gate.id, actualPinIndex);
    } else {
      startWireDrawing(gate.id, actualPinIndex);
    }
  };

  return {
    handlePinClick,
  };
}
