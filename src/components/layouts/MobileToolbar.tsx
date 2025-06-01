import React from 'react';
import { GateType } from '../../types/circuit';
import { useCircuitStore } from '../../stores/circuitStore';

interface MobileToolbarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: 'basic' | 'special' | 'io' | 'custom';
  onCategoryChange: (category: 'basic' | 'special' | 'io' | 'custom') => void;
}

const TOOL_CATEGORIES = {
  basic: {
    label: '基本',
    gates: [
      { type: 'AND' as GateType, label: 'AND', icon: '🔲' },
      { type: 'OR' as GateType, label: 'OR', icon: '🔳' },
      { type: 'NOT' as GateType, label: 'NOT', icon: '⭕' },
      { type: 'XOR' as GateType, label: 'XOR', icon: '⬜' },
      { type: 'NAND' as GateType, label: 'NAND', icon: '🔲' },
      { type: 'NOR' as GateType, label: 'NOR', icon: '🔳' },
    ],
  },
  special: {
    label: '特殊',
    gates: [
      { type: 'CLOCK' as GateType, label: 'CLOCK', icon: '⏰' },
      { type: 'D-FF' as GateType, label: 'D-FF', icon: '📦' },
      { type: 'SR-LATCH' as GateType, label: 'SR-LATCH', icon: '🔒' },
      { type: 'MUX' as GateType, label: 'MUX', icon: '🔀' },
    ],
  },
  io: {
    label: '入出力',
    gates: [
      { type: 'INPUT' as GateType, label: 'INPUT', icon: '🔘' },
      { type: 'OUTPUT' as GateType, label: 'OUTPUT', icon: '💡' },
    ],
  },
  custom: {
    label: 'カスタム',
    gates: [],
  },
};

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  isOpen,
  onToggle,
  selectedCategory,
  onCategoryChange,
}) => {
  const { addGate, gates } = useCircuitStore();

  const handleToolClick = (type: GateType) => {
    // キャンバスの中央付近に配置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 200; // ツールバーの高さを考慮
    
    const baseX = viewportWidth / 2;
    const baseY = viewportHeight / 2;
    
    // 既存のゲートと重ならない位置を計算
    let x = baseX;
    let y = baseY;
    let offset = 0;
    
    while (gates.some(g => 
      Math.abs(g.position.x - x) < 70 && 
      Math.abs(g.position.y - y) < 50
    )) {
      offset += 50;
      x = baseX + (offset % 200) - 100;
      y = baseY + Math.floor(offset / 200) * 60;
    }
    
    addGate(type, { x, y });
  };

  return (
    <div className={`mobile-toolbar ${isOpen ? 'open' : ''}`}>
      {/* スワイプハンドル */}
      <div className="swipe-handle" onClick={onToggle} />
      
      {/* カテゴリータブ */}
      <div className="tool-categories">
        {Object.entries(TOOL_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            className={`category-chip ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => onCategoryChange(key as any)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* ツールグリッド */}
      <div className="tools-grid">
        {TOOL_CATEGORIES[selectedCategory].gates.map((tool) => (
          <button
            key={tool.type}
            className="tool-item"
            onClick={() => handleToolClick(tool.type)}
          >
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-name">{tool.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};