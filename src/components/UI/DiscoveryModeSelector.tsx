import React, { useState } from 'react';
import { CircuitMode, MODE_CONFIGS } from '../../types/mode';
import { useDiscovery } from '../../hooks/useDiscovery';

interface DiscoveryModeSelectorProps {
  currentMode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  className?: string;
}

export const DiscoveryModeSelector: React.FC<DiscoveryModeSelectorProps> = ({
  currentMode,
  onModeChange,
  className = ''
}) => {
  const { progress, milestones } = useDiscovery();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // モードが解放されているかチェック
  const isModeUnlocked = (modeId: CircuitMode): boolean => {
    if (modeId === 'learning') return true; // 最初から利用可能
    
    // 自由モードの解放条件
    if (modeId === 'free') {
      return milestones.find(m => m.id === 'memory_architect')?.achieved || false;
    }
    
    // パズルモードの解放条件
    if (modeId === 'puzzle') {
      return milestones.find(m => m.id === 'cpu_builder')?.achieved || false;
    }
    
    return false;
  };

  // 発見数を取得
  const getDiscoveryCount = (): number => {
    return Object.values(progress.discoveries).filter(d => d).length;
  };

  return (
    <div className={className}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        background: '#f9fafb',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* 発見カウンター */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: '#fef3c7',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✨</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#92400e'
          }}>
            発見: {getDiscoveryCount()}
          </span>
        </div>

        {/* モードセレクター */}
        <div style={{
          display: 'flex',
          background: '#e5e7eb',
          borderRadius: '10px',
          padding: '4px',
          position: 'relative'
        }}>
          {Object.values(MODE_CONFIGS).map((mode) => {
            const isUnlocked = isModeUnlocked(mode.id);
            const isActive = currentMode === mode.id;

            return (
              <div
                key={mode.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => !isUnlocked && setShowTooltip(mode.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <button
                  onClick={() => isUnlocked && onModeChange(mode.id)}
                  disabled={!isUnlocked}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    background: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? 'white' : isUnlocked ? '#374151' : '#9ca3af',
                    opacity: isUnlocked ? 1 : 0.5,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  <span style={{ 
                    fontSize: '20px',
                    filter: !isUnlocked ? 'grayscale(1)' : 'none'
                  }}>
                    {mode.icon}
                  </span>
                  <span>{mode.name}</span>
                  {!isUnlocked && (
                    <span style={{ fontSize: '16px' }}>🔒</span>
                  )}
                </button>

                {/* ツールチップ */}
                {showTooltip === mode.id && !isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1f2937',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <div>{mode.description}</div>
                    <div style={{ 
                      marginTop: '4px',
                      color: '#fbbf24',
                      fontSize: '11px'
                    }}>
                      {mode.id === 'free' && 'メモリーアーキテクトを達成で解放'}
                      {mode.id === 'puzzle' && 'CPUビルダーを達成で解放'}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      width: '8px',
                      height: '8px',
                      background: '#1f2937',
                      transform: 'translateX(-50%) rotate(45deg)'
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 実験カウンター */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: 'auto',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          <span>🧪</span>
          <span>実験: {progress.totalExperiments}回</span>
        </div>
      </div>
    </div>
  );
};