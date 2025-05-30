import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { TOUCH_TARGET, SPACING } from '../../constants/responsive';
import { GateType } from '../../types/gate';
import { getGatesForMode } from '../../constants/modeGates';
import { CircuitMode } from '../../types/mode';

interface ResponsiveToolPaletteProps {
  currentMode: CircuitMode;
  selectedTool: string | null;
  onToolSelect: (tool: string | null) => void;
  onGateAdd: (type: GateType) => void;
}

export const ResponsiveToolPalette: React.FC<ResponsiveToolPaletteProps> = ({
  currentMode,
  selectedTool,
  onToolSelect,
  onGateAdd
}) => {
  const { isMobile } = useResponsive();
  const availableGates = getGatesForMode(currentMode);

  const gateCategories = [
    {
      name: '基本ゲート',
      gates: availableGates.filter(g => ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'].includes(g))
    },
    {
      name: 'カスタムゲート',
      gates: availableGates.filter(g => ['XOR', 'NAND', 'NOR', 'XNOR'].includes(g))
    },
    {
      name: 'キーボードショートカット',
      gates: [] // モバイルでは非表示
    },
    {
      name: '保存と共有',
      gates: [] // モバイルでは非表示
    }
  ].filter(cat => cat.gates.length > 0 || !isMobile);

  const getGateIcon = (type: string): string => {
    const icons: Record<string, string> = {
      INPUT: '⚡',
      OUTPUT: '💡',
      AND: '⊗',
      OR: '⊕',
      NOT: '⊖',
      XOR: '⊻',
      NAND: '⊼',
      NOR: '⊽',
      XNOR: '⊙',
      CLOCK: '⏰',
      D_FLIP_FLOP: 'D-FF',
      SR_LATCH: 'SR',
      CUSTOM: '📦',
      HALF_ADDER: '½+',
      FULL_ADDER: '+',
      ADDER_4BIT: '4+',
      NUMBER_4BIT_INPUT: '4#',
      NUMBER_4BIT_DISPLAY: '◻',
      REGISTER_4BIT: 'R4',
      MUX_2TO1: 'MX'
    };
    return icons[type] || type;
  };

  if (isMobile) {
    // モバイル用グリッドレイアウト
    return (
      <div style={{
        padding: SPACING.md
      }}>
        {gateCategories.map((category, idx) => (
          <div key={idx} style={{ marginBottom: SPACING.lg }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: SPACING.sm
            }}>
              {category.name}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: SPACING.sm
            }}>
              {category.gates.map(gateType => (
                <button
                  key={gateType}
                  onClick={() => {
                    onToolSelect(gateType);
                    onGateAdd(gateType as GateType);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: SPACING.sm,
                    minHeight: TOUCH_TARGET.recommended,
                    background: selectedTool === gateType ? '#3b82f6' : '#f3f4f6',
                    color: selectedTool === gateType ? '#ffffff' : '#374151',
                    border: '2px solid transparent',
                    borderColor: selectedTool === gateType ? '#2563eb' : '#e5e7eb',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  <span style={{ fontSize: 24 }}>{getGateIcon(gateType)}</span>
                  <span>{gateType}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // デスクトップ用縦型レイアウト
  return (
    <div style={{
      padding: SPACING.sm,
      background: '#1f2937',
      height: '100%',
      color: '#ffffff'
    }}>
      {availableGates.map(gateType => (
        <button
          key={gateType}
          onClick={() => {
            onToolSelect(gateType);
            onGateAdd(gateType as GateType);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '100%',
            padding: `${SPACING.sm}px ${SPACING.xs}px`,
            marginBottom: SPACING.xs,
            background: selectedTool === gateType ? '#3b82f6' : 'transparent',
            color: '#ffffff',
            border: '2px solid transparent',
            borderColor: selectedTool === gateType ? '#60a5fa' : 'transparent',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedTool !== gateType) {
              e.currentTarget.style.background = '#374151';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTool !== gateType) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span style={{ fontSize: 20 }}>{getGateIcon(gateType)}</span>
          <span style={{ fontSize: 11 }}>{gateType}</span>
        </button>
      ))}
    </div>
  );
};