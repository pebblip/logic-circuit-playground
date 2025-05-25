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
  if (!fromGate || !toGate) return null;

  const fromX = getGateOutputX(fromGate);
  const fromY = getGateOutputY(fromGate, connection.fromOutput || 0);
  const toX = getGateInputX(toGate);
  const toY = getGateInputY(toGate, connection.toInput);

  return (
    <path
      d={getConnectionPath(fromX, fromY, toX, toY)}
      stroke={isActive ? '#000' : '#999'}
      strokeWidth={isActive ? '3' : '2'}
      fill="none"
      className="cursor-pointer hover:stroke-red-500"
      onClick={onDelete}
    />
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