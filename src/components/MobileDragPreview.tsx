import React from 'react';
import type { GateType } from '@/types/circuit';

interface MobileDragPreviewProps {
  type: GateType;
  x: number;
  y: number;
}

export const MobileDragPreview: React.FC<MobileDragPreviewProps> = ({
  type,
  x,
  y,
}) => {
  return (
    <div
      className="mobile-drag-preview"
      style={{
        position: 'fixed',
        left: x - 35,
        top: y - 25,
        width: 70,
        height: 50,
        backgroundColor: '#1a1a1a',
        border: '2px solid #00ff88',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00ff88',
        fontSize: 14,
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: 0.9,
        boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
      }}
    >
      {type}
    </div>
  );
};
