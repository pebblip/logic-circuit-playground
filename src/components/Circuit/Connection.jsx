// 接続線コンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { getConnectionPath, getGateOutputX, getGateOutputY, getGateInputX, getGateInputY } from '../../utils/circuit';

/**
 * 接続線コンポーネント
 */
const Connection = memo(({ 
  connection, 
  fromGate, 
  toGate, 
  isActive,
  onDelete 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  if (!fromGate || !toGate) return null;

  const fromX = getGateOutputX(fromGate);
  const fromY = getGateOutputY(fromGate, connection.fromOutput || 0);
  const toX = getGateInputX(toGate);
  const toY = getGateInputY(toGate, connection.toInput);

  return (
    <g>
      {/* 太い透明な線でクリック範囲を拡大 */}
      <path
        d={getConnectionPath(fromX, fromY, toX, toY)}
        stroke="transparent"
        strokeWidth="10"
        fill="none"
        className="cursor-pointer"
        onClick={onDelete}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* 実際の線 */}
      <path
        d={getConnectionPath(fromX, fromY, toX, toY)}
        stroke={
          isHovered ? '#ef4444' : 
          isActive ? '#059669' : '#d1d5db'
        }
        strokeWidth={isHovered ? '3' : isActive ? '3' : '2'}
        fill="none"
        className="pointer-events-none transition-all"
      />
      {/* ホバー時の削除ヒント */}
      {isHovered && (
        <text
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2 - 10}
          textAnchor="middle"
          fill="#ef4444"
          fontSize="12"
          className="pointer-events-none"
        >
          クリックで削除
        </text>
      )}
    </g>
  );
});

Connection.displayName = 'Connection';

Connection.propTypes = {
  connection: PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fromOutput: PropTypes.number,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    toInput: PropTypes.number.isRequired
  }).isRequired,
  fromGate: PropTypes.object,
  toGate: PropTypes.object,
  isActive: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default Connection;