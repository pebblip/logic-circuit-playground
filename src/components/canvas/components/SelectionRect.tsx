/**
 * 選択矩形コンポーネント
 * ドラッグ選択時の矩形表示
 */

import React from 'react';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';

interface SelectionRectProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isSelecting: boolean;
}

export const SelectionRect: React.FC<SelectionRectProps> = React.memo(({
  startX,
  startY,
  endX,
  endY,
  isSelecting,
}) => {
  // 選択中は動的に位置を計算、選択完了後は正規化された値を使用
  const x = isSelecting ? Math.min(startX, endX) : startX;
  const y = isSelecting ? Math.min(startY, endY) : startY;
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={`rgba(0, 255, 136, ${CANVAS_CONSTANTS.SELECTION_RECT_OPACITY})`}
      stroke={CANVAS_CONSTANTS.SELECTION_RECT_COLOR}
      strokeWidth={CANVAS_CONSTANTS.SELECTION_RECT_STROKE_WIDTH}
      strokeDasharray="5,5"
      pointerEvents="none"
      className="selection-rect"
    />
  );
});

SelectionRect.displayName = 'SelectionRect';