import React, { useState } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '../../design-system/ThemeProvider';
import type { GateType } from '../../types/gate';

interface SidebarProps {
  availableGates: GateType[];
  lockedGates?: GateType[];
  customGates?: Array<{ id: string; name: string; icon?: string }>;
  onGateSelect?: (gateType: GateType | string) => void;
  onCreateCustomGate?: () => void;
}

interface GateCategory {
  id: string;
  title: string;
  gates: Array<{
    type: GateType | string;
    label: string;
    icon: string;
    locked?: boolean;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  availableGates,
  lockedGates = [],
  customGates = [],
  onGateSelect,
  onCreateCustomGate,
}) => {
  const theme = useTheme();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const sidebarStyles = css`
    width: 280px;
    background: ${theme.colors.background.secondary};
    border-right: 1px solid ${theme.colors.neutral[800]};
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
  `;

  const sectionStyles = css`
    padding: ${theme.spacing[5]};
    border-bottom: 1px solid ${theme.colors.neutral[800]};
  `;

  const sectionTitleStyles = css`
    font-size: ${theme.typography.ui.label.fontSize};
    font-weight: ${theme.typography.ui.label.fontWeight};
    color: ${theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: ${theme.typography.ui.label.letterSpacing};
    margin-bottom: ${theme.spacing[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  `;

  const collapseIconStyles = (isCollapsed: boolean) => css`
    font-size: 12px;
    transform: rotate(${isCollapsed ? -90 : 0}deg);
    transition: transform ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};
  `;

  const gateGridStyles = css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing[2]};
  `;

  const gateItemStyles = (locked: boolean) => css`
    aspect-ratio: 1;
    background: ${theme.colors.surface.primary};
    border: 2px solid transparent;
    border-radius: ${theme.borderRadius.lg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: ${locked ? 'not-allowed' : 'grab'};
    transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};
    position: relative;
    opacity: ${locked ? 0.5 : 1};

    &:hover:not(:disabled) {
      border-color: ${locked ? 'transparent' : theme.colors.primary[500]};
      transform: ${locked ? 'none' : 'translateY(-2px)'};
      background: ${locked ? theme.colors.surface.primary : theme.colors.surface.elevated};
    }

    &:active:not(:disabled) {
      cursor: ${locked ? 'not-allowed' : 'grabbing'};
      transform: ${locked ? 'none' : 'scale(0.95)'};
    }
  `;

  const gateIconStyles = css`
    font-size: 24px;
    margin-bottom: ${theme.spacing[1]};
  `;

  const gateLabelStyles = css`
    font-size: ${theme.typography.ui.caption.fontSize};
    color: ${theme.colors.text.secondary};
  `;

  const lockIconStyles = css`
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 12px;
  `;

  const customGateStyles = css`
    background: linear-gradient(135deg, ${theme.colors.surface.primary}, ${theme.colors.surface.elevated});
    border-color: ${theme.colors.secondary[700]};
  `;

  const createButtonStyles = css`
    width: 100%;
    margin-top: ${theme.spacing[3]};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    background: transparent;
    border: 1px dashed ${theme.colors.neutral[700]};
    border-radius: ${theme.borderRadius.lg};
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.ui.caption.fontSize};
    cursor: pointer;
    transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};

    &:hover {
      border-color: ${theme.colors.secondary[500]};
      color: ${theme.colors.secondary[400]};
      background: ${theme.colors.secondary[500]}10;
    }
  `;

  const categories: GateCategory[] = [
    {
      id: 'basic',
      title: '基本ゲート',
      gates: [
        { type: 'INPUT', label: '入力', icon: '⭕' },
        { type: 'OUTPUT', label: '出力', icon: '⬜' },
        { type: 'AND', label: 'AND', icon: '🔵', locked: !availableGates.includes('AND') },
        { type: 'OR', label: 'OR', icon: '🟢', locked: !availableGates.includes('OR') },
        { type: 'NOT', label: 'NOT', icon: '🔴', locked: !availableGates.includes('NOT') },
        { type: 'XOR', label: 'XOR', icon: '🟡', locked: !availableGates.includes('XOR') },
      ],
    },
    {
      id: 'advanced',
      title: '演算ゲート',
      gates: [
        { type: 'NAND', label: 'NAND', icon: '🟣', locked: !availableGates.includes('NAND') },
        { type: 'NOR', label: 'NOR', icon: '🟠', locked: !availableGates.includes('NOR') },
        { type: 'XNOR', label: 'XNOR', icon: '🟤', locked: !availableGates.includes('XNOR') },
        { type: 'MUX', label: 'MUX', icon: '🔀', locked: !availableGates.includes('MUX') },
        { type: 'DEMUX', label: 'DEMUX', icon: '🔁', locked: !availableGates.includes('DEMUX') },
        { type: 'DECODER', label: 'DEC', icon: '📊', locked: !availableGates.includes('DECODER') },
      ],
    },
    {
      id: 'memory',
      title: '記憶素子',
      gates: [
        { type: 'SR_LATCH', label: 'SR', icon: '💾', locked: !availableGates.includes('SR_LATCH') },
        { type: 'D_FLIP_FLOP', label: 'D-FF', icon: '📦', locked: !availableGates.includes('D_FLIP_FLOP') },
        { type: 'JK_FLIP_FLOP', label: 'JK-FF', icon: '📋', locked: !availableGates.includes('JK_FLIP_FLOP') },
        { type: 'T_FLIP_FLOP', label: 'T-FF', icon: '🔄', locked: !availableGates.includes('T_FLIP_FLOP') },
        { type: 'REGISTER', label: 'REG', icon: '📝', locked: !availableGates.includes('REGISTER') },
        { type: 'CLOCK', label: 'CLK', icon: '⏰', locked: !availableGates.includes('CLOCK') },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleGateDragStart = (gateType: GateType | string, event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('gateType', gateType);
  };

  return (
    <aside css={sidebarStyles}>
      {categories.map((category) => (
        <div key={category.id} css={sectionStyles}>
          <h3
            css={sectionTitleStyles}
            onClick={() => toggleCategory(category.id)}
          >
            {category.title}
            <span css={collapseIconStyles(collapsedCategories.has(category.id))}>
              ▼
            </span>
          </h3>
          
          {!collapsedCategories.has(category.id) && (
            <div css={gateGridStyles}>
              {category.gates.map((gate) => (
                <div
                  key={gate.type}
                  css={gateItemStyles(gate.locked || false)}
                  draggable={!gate.locked}
                  onDragStart={(e) => !gate.locked && handleGateDragStart(gate.type, e)}
                  onClick={() => !gate.locked && onGateSelect?.(gate.type)}
                  title={gate.locked ? 'このゲートはロックされています' : gate.label}
                >
                  <div css={gateIconStyles}>{gate.icon}</div>
                  <div css={gateLabelStyles}>{gate.label}</div>
                  {gate.locked && <span css={lockIconStyles}>🔒</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* カスタムゲートセクション */}
      <div css={sectionStyles}>
        <h3
          css={sectionTitleStyles}
          onClick={() => toggleCategory('custom')}
        >
          カスタムゲート
          <span css={collapseIconStyles(collapsedCategories.has('custom'))}>
            ▼
          </span>
        </h3>
        
        {!collapsedCategories.has('custom') && (
          <>
            <div css={gateGridStyles}>
              {customGates.map((gate) => (
                <div
                  key={gate.id}
                  css={[gateItemStyles(false), customGateStyles]}
                  draggable
                  onDragStart={(e) => handleGateDragStart(gate.id, e)}
                  onClick={() => onGateSelect?.(gate.id)}
                >
                  <div css={gateIconStyles}>{gate.icon || '📦'}</div>
                  <div css={gateLabelStyles}>{gate.name}</div>
                </div>
              ))}
            </div>
            
            <button
              css={createButtonStyles}
              onClick={onCreateCustomGate}
            >
              + カスタムゲートを作成
            </button>
          </>
        )}
      </div>
    </aside>
  );
};