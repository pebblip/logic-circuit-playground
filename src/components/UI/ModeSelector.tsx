import React from 'react';
import { CircuitMode, MODE_CONFIGS } from '../../types/mode';

interface ModeSelectorProps {
  currentMode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  className?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  className = ''
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}
      className={className}
    >
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '500', 
        color: '#374151' 
      }}>
        モード:
      </span>
      <div style={{
        display: 'flex',
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '4px'
      }}>
        {Object.values(MODE_CONFIGS).map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: currentMode === mode.id ? '#3b82f6' : 'transparent',
              color: currentMode === mode.id ? 'white' : '#6b7280',
              boxShadow: currentMode === mode.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
            title={mode.description}
            onMouseEnter={(e) => {
              if (currentMode !== mode.id) {
                (e.target as HTMLElement).style.background = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              if (currentMode !== mode.id) {
                (e.target as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{mode.icon}</span>
            <span>{mode.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};