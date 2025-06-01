import { useState, useCallback } from 'react';

interface PinHoverState {
  gateId: string;
  pinIndex: number;
  isOutput: boolean;
}

export const usePinState = () => {
  const [hoveredPin, setHoveredPin] = useState<PinHoverState | null>(null);
  const [activePin, setActivePin] = useState<PinHoverState | null>(null);
  
  const handlePinHover = useCallback((
    gateId: string,
    pinIndex: number,
    isOutput: boolean,
    isHovering: boolean
  ) => {
    if (isHovering) {
      setHoveredPin({ gateId, pinIndex, isOutput });
    } else {
      setHoveredPin(null);
    }
  }, []);
  
  const handlePinClick = useCallback((
    gateId: string,
    pinIndex: number,
    isOutput: boolean
  ) => {
    setActivePin({ gateId, pinIndex, isOutput });
  }, []);
  
  const clearActivePin = useCallback(() => {
    setActivePin(null);
  }, []);
  
  const isPinHovered = useCallback((
    gateId: string,
    pinIndex: number,
    isOutput: boolean
  ): boolean => {
    return hoveredPin !== null &&
      hoveredPin.gateId === gateId &&
      hoveredPin.pinIndex === pinIndex &&
      hoveredPin.isOutput === isOutput;
  }, [hoveredPin]);
  
  const isPinActive = useCallback((
    gateId: string,
    pinIndex: number,
    isOutput: boolean
  ): boolean => {
    return activePin !== null &&
      activePin.gateId === gateId &&
      activePin.pinIndex === pinIndex &&
      activePin.isOutput === isOutput;
  }, [activePin]);
  
  return {
    hoveredPin,
    activePin,
    handlePinHover,
    handlePinClick,
    clearActivePin,
    isPinHovered,
    isPinActive
  };
};