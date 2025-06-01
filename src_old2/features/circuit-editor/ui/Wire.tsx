import React from 'react';

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDrawing?: boolean;
  isSelected?: boolean;
  value?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

const WireComponent: React.FC<WireProps> = ({ 
  x1, y1, x2, y2, 
  isDrawing = false,
  value = false,
  onHover, onLeave, onClick
}) => {
  console.log('[Wire] Rendering wire:', { x1, y1, x2, y2, isDrawing, value });
  
  const calculatePath = (): string => {
    const dx = x2 - x1;
    const controlDistance = Math.min(Math.max(Math.abs(dx) * 0.5, 50), 150);
    const cp1x = x1 + controlDistance;
    const cp2x = x2 - controlDistance;
    return `M ${x1} ${y1} Q ${cp1x} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2} Q ${cp2x} ${y2} ${x2} ${y2}`;
  };

  const path = calculatePath();

  return (
    <g onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onClick}>
      <path d={path} stroke="transparent" strokeWidth="20" fill="none" style={{ cursor: 'pointer' }} />
      
      {isDrawing && (
        <path d={path} stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="8,4" opacity="0.7" className="animate-pulse" />
      )}
      
      {!isDrawing && (
        <>
          {value && <path d={path} stroke="#00ff88" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.3" filter="blur(2px)" />}
          <path d={path} stroke={value ? "#00ff88" : "#444"} strokeWidth={value ? "1.5" : "1"} fill="none" strokeLinecap="round" style={{ transition: 'all 0.3s ease' }} />
          {value && (
            <circle r="6" fill="#00ff88" filter="drop-shadow(0 0 10px rgba(0, 255, 136, 1))">
              <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </circle>
          )}
        </>
      )}
    </g>
  );
};

export const Wire = React.memo(WireComponent, (prevProps, nextProps) => {
  return (
    prevProps.x1 === nextProps.x1 &&
    prevProps.y1 === nextProps.y1 &&
    prevProps.x2 === nextProps.x2 &&
    prevProps.y2 === nextProps.y2 &&
    prevProps.isDrawing === nextProps.isDrawing &&
    prevProps.value === nextProps.value
  );
});