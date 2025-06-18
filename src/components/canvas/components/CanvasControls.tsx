/**
 * Canvasコントロールコンポーネント
 * ズームイン/アウト、リセット機能を提供
 */

import React from 'react';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';

interface CanvasControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = React.memo(({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div
      className="zoom-controls canvas-overlay"
      style={{
        position: 'absolute',
        top: `${CANVAS_CONSTANTS.ZOOM_CONTROLS_OFFSET}px`,
        right: `${CANVAS_CONSTANTS.ZOOM_CONTROLS_OFFSET}px`,
        zIndex: 10,
      }}
    >
      {/* ズームアウトボタン */}
      <button
        className="zoom-button"
        onClick={onZoomOut}
        title="ズームアウト（マウスホイール下）"
        aria-label="ズームアウト"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </button>

      {/* ズームリセットボタン */}
      <button
        className="zoom-button zoom-reset"
        onClick={onResetZoom}
        title="ズームリセット（ダブルクリック）"
        aria-label={`ズーム率 ${Math.round(scale * 100)}%`}
      >
        {Math.round(scale * 100)}%
      </button>

      {/* ズームインボタン */}
      <button
        className="zoom-button"
        onClick={onZoomIn}
        title="ズームイン（マウスホイール上）"
        aria-label="ズームイン"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
});

CanvasControls.displayName = 'CanvasControls';