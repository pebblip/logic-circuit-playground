import { useState, useCallback } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';

interface SelectedPin {
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

export const useMobileTapWireConnection = () => {
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const { startWireDrawing, endWireDrawing, cancelWireDrawing } =
    useCircuitStore();

  const handlePinTap = useCallback(
    (gateId: string, pinIndex: number, isOutput: boolean) => {
      if (!selectedPin) {
        // 最初のピンを選択
        setSelectedPin({ gateId, pinIndex, isOutput });
        startWireDrawing(gateId, isOutput ? -1 : pinIndex);
      } else {
        // 2番目のピンを選択して接続
        if (
          selectedPin.gateId === gateId &&
          selectedPin.pinIndex === pinIndex &&
          selectedPin.isOutput === isOutput
        ) {
          // 同じピンをタップした場合はキャンセル
          cancelWireDrawing();
          setSelectedPin(null);
        } else {
          // 異なるピンをタップした場合は接続
          endWireDrawing(gateId, isOutput ? -1 : pinIndex);
          setSelectedPin(null);
        }
      }
    },
    [selectedPin, startWireDrawing, endWireDrawing, cancelWireDrawing]
  );

  const cancelConnection = useCallback(() => {
    cancelWireDrawing();
    setSelectedPin(null);
  }, [cancelWireDrawing]);

  return {
    selectedPin,
    handlePinTap,
    cancelConnection,
    isSelectingPin: !!selectedPin,
  };
};
