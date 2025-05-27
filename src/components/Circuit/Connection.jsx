// モダンな接続線コンポーネント

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { getConnectionPath, getGateOutputX, getGateOutputY, getGateInputX, getGateInputY } from '../../utils/circuit';
import { colors } from '../../styles/design-tokens';

/**
 * モダンな接続線コンポーネント
 */
const Connection = memo(({ connection, gates, simulation, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const fromGate = gates.find(g => g.id === connection.from);
  const toGate = gates.find(g => g.id === connection.to);
  
  if (!fromGate || !toGate) return null;
  
  // 出力インデックスの計算
  const outputIndex = connection.fromOutput || 0;
  const fromX = getGateOutputX(fromGate);
  const fromY = getGateOutputY(fromGate, outputIndex);
  const toX = getGateInputX(toGate);
  // toTerminalから数値を抽出（例: 'in0' -> 0, 'in1' -> 1）
  const toInputIndex = connection.toTerminal ? 
    parseInt(connection.toTerminal.replace('in', '')) : 
    (connection.toInput || 0);
  
  const toY = getGateInputY(toGate, toInputIndex);
  
  const path = getConnectionPath(fromX, fromY, toX, toY);
  
  // 信号の状態を取得
  const signalKey = outputIndex === 0 ? fromGate.id : `${fromGate.id}_out${outputIndex}`;
  const isActive = simulation[signalKey] === true;
  
  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="connection-group"
    >
      {/* 接続線の背景（クリック判定用） */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="10"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (isHovered) onDelete();
        }}
      />
      
      {/* メインの接続線 */}
      <path
        d={path}
        fill="none"
        stroke={isActive ? colors.signal.on : colors.signal.wire}
        strokeWidth={isHovered ? "3" : "2"}
        className="transition-all pointer-events-none"
      />
      
      {/* アクティブ時の輝きエフェクト */}
      {isActive && (
        <path
          d={path}
          fill="none"
          stroke={colors.signal.onGlow}
          strokeWidth="4"
          opacity="0.4"
          className="pointer-events-none"
        />
      )}
      
      {/* 削除ボタン（ホバー時のみ表示） */}
      {isHovered && (
        <g transform={`translate(${(fromX + toX) / 2}, ${(fromY + toY) / 2})`}>
          {/* 背景 */}
          <circle
            r="12"
            fill={colors.ui.accent.error}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
          {/* ×マーク */}
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            className="pointer-events-none"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
});

Connection.displayName = 'Connection';

Connection.propTypes = {
  connection: PropTypes.object.isRequired,
  gates: PropTypes.array.isRequired,
  simulation: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default Connection;