import React, { useState } from 'react';

// 配線接続の最小実装とテスト可能な設計
export const WireConnection = ({ 
  startPoint, 
  endPoint, 
  onConnectionComplete,
  isActive = false 
}) => {
  if (!startPoint) return null;

  const pathData = endPoint
    ? `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
    : '';

  return (
    <path
      d={pathData}
      stroke={isActive ? '#3b82f6' : '#6b7280'}
      strokeWidth="3"
      fill="none"
      pointerEvents="none"
      strokeDasharray={isActive ? '5,5' : 'none'}
    />
  );
};

// 接続ポイントコンポーネント
export const ConnectionPoint = ({ 
  x, 
  y, 
  type, // 'input' | 'output'
  onMouseDown,
  onMouseUp,
  isHighlighted = false
}) => {
  return (
    <circle
      cx={x}
      cy={y}
      r="6"
      fill={isHighlighted ? '#3b82f6' : '#6b7280'}
      stroke="#1f2937"
      strokeWidth="2"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{ cursor: type === 'output' ? 'crosshair' : 'pointer' }}
    />
  );
};

// 配線管理フック
export const useWireConnections = () => {
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);

  const startConnection = (fromId, fromPoint) => {
    setActiveConnection({
      fromId,
      fromPoint,
      id: `temp_${Date.now()}`
    });
  };

  const completeConnection = (toId, toPoint, toIndex) => {
    if (!activeConnection || activeConnection.fromId === toId) {
      setActiveConnection(null);
      return false;
    }

    // 既存の接続を確認
    const existingIndex = connections.findIndex(
      conn => conn.toId === toId && conn.toIndex === toIndex
    );

    const newConnection = {
      id: `conn_${Date.now()}`,
      fromId: activeConnection.fromId,
      fromPoint: activeConnection.fromPoint,
      toId,
      toPoint,
      toIndex
    };

    if (existingIndex !== -1) {
      // 既存の接続を置き換え
      setConnections(prev => {
        const updated = [...prev];
        updated[existingIndex] = newConnection;
        return updated;
      });
    } else {
      // 新しい接続を追加
      setConnections(prev => [...prev, newConnection]);
    }

    setActiveConnection(null);
    return true;
  };

  const cancelConnection = () => {
    setActiveConnection(null);
  };

  const removeConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  return {
    connections,
    activeConnection,
    startConnection,
    completeConnection,
    cancelConnection,
    removeConnection
  };
};