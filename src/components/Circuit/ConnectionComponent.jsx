import React from 'react';

export const ConnectionComponent = ({ from, to, value, isSelected, className, style }) => {
  // Calculate control points for smooth curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset based on distance
  const controlOffset = Math.min(distance * 0.5, 100);
  
  const path = `
    M ${from.x} ${from.y}
    C ${from.x + controlOffset} ${from.y},
      ${to.x - controlOffset} ${to.y},
      ${to.x} ${to.y}
  `;
  
  const strokeColor = value ? '#00ff88' : 'rgba(255, 255, 255, 0.3)';
  const strokeWidth = isSelected ? 3 : 2;
  
  return (
    <g className={className} style={style}>
      {/* Shadow/glow effect when selected */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke="#00ffff"
          strokeWidth={strokeWidth + 4}
          opacity="0.3"
        />
      )}
      
      {/* Main wire */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Interactive hit area (invisible but clickable) */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="10"
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
};