import { useState, useCallback } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';

interface TouchPin {
  gateId: string;
  pinIndex: number;
  position: { x: number; y: number };
}

export const useMobileWireConnection = () => {
  const [touchStartPin, setTouchStartPin] = useState<TouchPin | null>(null);
  const [touchPosition, setTouchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const { startWireDrawing, endWireDrawing, cancelWireDrawing } =
    useCircuitStore();

  const startTouchWire = useCallback(
    (gateId: string, pinIndex: number, svgPoint: { x: number; y: number }) => {
      setTouchStartPin({ gateId, pinIndex, position: svgPoint });
      setTouchPosition(svgPoint);
      startWireDrawing(gateId, pinIndex);
    },
    [startWireDrawing]
  );

  const updateTouchWire = useCallback(
    (svgPoint: { x: number; y: number }) => {
      if (touchStartPin) {
        setTouchPosition(svgPoint);
      }
    },
    [touchStartPin]
  );

  const endTouchWire = useCallback(
    (endGateId: string | null, endPinIndex: number | null) => {
      if (touchStartPin && endGateId !== null && endPinIndex !== null) {
        endWireDrawing(endGateId, endPinIndex);
      } else {
        cancelWireDrawing();
      }
      setTouchStartPin(null);
      setTouchPosition(null);
    },
    [touchStartPin, endWireDrawing, cancelWireDrawing]
  );

  const cancelTouchWire = useCallback(() => {
    cancelWireDrawing();
    setTouchStartPin(null);
    setTouchPosition(null);
  }, [cancelWireDrawing]);

  return {
    touchStartPin,
    touchPosition,
    startTouchWire,
    updateTouchWire,
    endTouchWire,
    cancelTouchWire,
  };
};
