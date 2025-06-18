/**
 * Canvas背景コンポーネント
 * グリッドパターンとエフェクトを管理
 */

import React from 'react';
import type { ViewBox } from '../utils/canvasConstants';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';

interface CanvasBackgroundProps {
  viewBox: ViewBox;
  scale?: number;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = React.memo(({ 
  viewBox, 
  scale = 1 
}) => {
  return (
    <>
      <defs>
        {/* グリッドパターン */}
        <pattern
          id="grid"
          width={`${CANVAS_CONSTANTS.GRID_SIZE}`}
          height={`${CANVAS_CONSTANTS.GRID_SIZE}`}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          <circle 
            cx="10" 
            cy="10" 
            r="0.5" 
            fill={CANVAS_CONSTANTS.GRID_COLOR} 
          />
        </pattern>

        {/* パーティクルのグロー効果 */}
        <filter id="particleGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ゲートのグロー効果 */}
        <filter id="gateGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* 背景矩形 */}
      <rect
        id="canvas-background"
        x={viewBox.x - 5000}
        y={viewBox.y - 5000}
        width={viewBox.width + 10000}
        height={viewBox.height + 10000}
        fill="url(#grid)"
      />
    </>
  );
});

CanvasBackground.displayName = 'CanvasBackground';