/**
 * ワイヤープレビューコンポーネント
 * ワイヤー描画中のプレビュー表示
 */

import React from 'react';

interface WirePreviewProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const WirePreview: React.FC<WirePreviewProps> = React.memo(
  ({ startX, startY, endX, endY }) => {
    return (
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#00ff88"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.6"
        pointerEvents="none"
        className="wire-preview"
      />
    );
  }
);

WirePreview.displayName = 'WirePreview';
