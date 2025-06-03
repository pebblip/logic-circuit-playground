import type { RefObject } from 'react';
import { useState, useCallback } from 'react';

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export const useCanvasZoom = (
  svgRef: RefObject<SVGSVGElement>,
  viewBox: ViewBox,
  setViewBox: (viewBox: ViewBox) => void
) => {
  const [scale, setScale] = useState(1);

  const handleZoom = useCallback(
    (delta: number, clientX: number, clientY: number) => {
      if (!svgRef.current) return;

      const scaleFactor = delta > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scale * scaleFactor)
      );

      if (newScale === scale) return;

      // マウス位置を中心にズーム
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // SVG座標系でのマウス位置
      const svgX = viewBox.x + (x / rect.width) * viewBox.width;
      const svgY = viewBox.y + (y / rect.height) * viewBox.height;

      // 新しいビューボックスサイズ
      const newWidth = 1200 / newScale;
      const newHeight = 800 / newScale;

      // マウス位置が同じ場所に留まるように調整
      const newX = svgX - (x / rect.width) * newWidth;
      const newY = svgY - (y / rect.height) * newHeight;

      setViewBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });

      setScale(newScale);
    },
    [scale, svgRef, viewBox, setViewBox]
  );

  const resetZoom = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
    setScale(1);
  }, [setViewBox]);

  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    handleZoom(-1, rect.width / 2, rect.height / 2);
  }, [svgRef, handleZoom]);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    handleZoom(1, rect.width / 2, rect.height / 2);
  }, [svgRef, handleZoom]);

  return {
    scale,
    handleZoom,
    resetZoom,
    zoomIn,
    zoomOut,
  };
};
