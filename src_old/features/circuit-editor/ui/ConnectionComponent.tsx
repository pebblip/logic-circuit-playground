/**
 * 接続（ワイヤー）を描画するコンポーネント
 */

import React from 'react';
import { ConnectionViewModel } from '@/features/circuit-editor/model/ConnectionViewModel';

interface ConnectionComponentProps {
  connection: ConnectionViewModel;
  onClick?: (e: React.MouseEvent) => void;
}

export const ConnectionComponent: React.FC<ConnectionComponentProps> = ({
  connection,
  onClick
}) => {
  const isActive = connection.isActive();
  const path = connection.getSVGPath();

  return (
    <g>
      {/* アクティブ時のグロー効果 */}
      {isActive && (
        <path
          d={path}
          fill="none"
          stroke="#00ff88"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          filter="blur(4px)"
          pointerEvents="none"
        />
      )}

      {/* メインのワイヤー */}
      <path
        d={path}
        fill="none"
        stroke={isActive ? '#00ff88' : 'rgba(255, 255, 255, 0.3)'}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />

      {/* 信号フローアニメーション */}
      {isActive && (
        <circle r="4" fill="#00ffff">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </g>
  );
};