import type { RefObject } from 'react';
import { useState, useCallback } from 'react';

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanState {
  isPanning: boolean;
  panStart: { x: number; y: number };
}

export const useCanvasPan = (
  svgRef: RefObject<SVGSVGElement>,
  viewBox: ViewBox,
  setViewBox: (viewBox: ViewBox) => void,
  scale: number
) => {
  const [panState, setPanState] = useState<PanState>({
    isPanning: false,
    panStart: { x: 0, y: 0 },
  });

  const handlePanStart = useCallback(
    (clientX: number, clientY: number) => {
      setPanState({
        isPanning: true,
        panStart: { x: clientX, y: clientY },
      });
      if (svgRef.current) {
        svgRef.current.style.cursor = 'grabbing';
      }
    },
    [svgRef]
  );

  const handlePan = useCallback(
    (clientX: number, clientY: number) => {
      if (!panState.isPanning) return;

      const dx = (clientX - panState.panStart.x) / scale;
      const dy = (clientY - panState.panStart.y) / scale;

      setViewBox({
        x: viewBox.x - dx,
        y: viewBox.y - dy,
        width: viewBox.width,
        height: viewBox.height,
      });

      setPanState({
        ...panState,
        panStart: { x: clientX, y: clientY },
      });
    },
    [panState, scale, viewBox, setViewBox]
  );

  const handlePanEnd = useCallback(() => {
    setPanState({
      ...panState,
      isPanning: false,
    });
    if (svgRef.current) {
      svgRef.current.style.cursor = 'default';
    }
  }, [panState, svgRef]);

  return {
    isPanning: panState.isPanning,
    handlePanStart,
    handlePan,
    handlePanEnd,
  };
};
