import React from 'react';
import { CircuitMode } from '../../entities/types/mode';
import { TOUCH_TARGET } from '../../shared/config/responsive';

interface MobileBottomNavProps {
  currentMode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  onMenuClick: () => void;
  onToolsClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onModeChange,
  onMenuClick,
  onToolsClick
}) => {
  const navItems = [
    {
      id: 'menu',
      icon: '☰',
      label: 'メニュー',
      onClick: onMenuClick
    },
    {
      id: 'learning',
      icon: '📚',
      label: '学習',
      onClick: () => onModeChange('learning'),
      isActive: currentMode === 'learning'
    },
    {
      id: 'free',
      icon: '🎨',
      label: '自由',
      onClick: () => onModeChange('free'),
      isActive: currentMode === 'free'
    },
    {
      id: 'puzzle',
      icon: '🧩',
      label: 'パズル',
      onClick: () => onModeChange('puzzle'),
      isActive: currentMode === 'puzzle'
    },
    {
      id: 'tools',
      icon: '🔧',
      label: 'ツール',
      onClick: onToolsClick
    }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '100%',
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb'
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={item.onClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            minWidth: TOUCH_TARGET.recommended,
            minHeight: TOUCH_TARGET.recommended,
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: item.isActive ? '#3b82f6' : '#6b7280',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{
            fontSize: 20,
            lineHeight: 1
          }}>
            {item.icon}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: item.isActive ? 600 : 400
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};