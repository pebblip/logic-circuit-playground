import React from 'react';
import { GateType } from '../../../entities/types';
import { useCircuitViewModel } from '../../../features/circuit-editor/model/useCircuitViewModel';

interface ToolItem {
  type: GateType | 'INPUT' | 'OUTPUT' | 'CLOCK';
  label: string;
  icon: string;
  category: 'basic' | 'io' | 'special';
}

const tools: ToolItem[] = [
  // 基本ゲート
  { type: 'AND', label: 'AND', icon: '🔲', category: 'basic' },
  { type: 'OR', label: 'OR', icon: '🔳', category: 'basic' },
  { type: 'NOT', label: 'NOT', icon: '⛭', category: 'basic' },
  { type: 'XOR', label: 'XOR', icon: '⬜', category: 'basic' },
  { type: 'NAND', label: 'NAND', icon: '🔘', category: 'basic' },
  { type: 'NOR', label: 'NOR', icon: '🔶', category: 'basic' },
  // 入出力
  { type: 'INPUT', label: 'INPUT', icon: '🔘', category: 'io' },
  { type: 'OUTPUT', label: 'OUTPUT', icon: '💡', category: 'io' },
  { type: 'CLOCK', label: 'CLOCK', icon: '⏰', category: 'io' },
];

/**
 * ツールパレットコンポーネント
 */
// ツールアイコンコンポーネント
const ToolIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'INPUT':
      return (
        <svg className="tool-preview" viewBox="-40 -20 80 40">
          <rect fill="#1a1a1a" stroke="#444" x="-25" y="-15" width="50" height="30" rx="15"/>
          <circle fill="#00ff88" cx="5" cy="0" r="10"/>
        </svg>
      );
    case 'OUTPUT':
      return (
        <svg className="tool-preview" viewBox="-25 -25 50 50">
          <circle fill="#1a1a1a" stroke="#444" cx="0" cy="0" r="20"/>
          <text x="0" y="2" style={{ fontSize: 20, textAnchor: 'middle' }}>💡</text>
        </svg>
      );
    case 'CLOCK':
      return (
        <svg className="tool-preview" viewBox="-45 -45 90 90">
          <circle className="clock-shape" cx="0" cy="0" r="40" fill="#1a1a1a" stroke="#444" strokeWidth="2"/>
          <text x="0" y="2" className="gate-text" style={{ fontSize: 24 }}>⏰</text>
        </svg>
      );
    default:
      // 基本ゲート
      return (
        <svg className="tool-preview" viewBox="-50 -30 100 60">
          <rect className="gate" x="-35" y="-25" width="70" height="50"/>
          <text className="gate-text" x="0" y="0">{type}</text>
        </svg>
      );
  }
};

export const ToolPalette: React.FC = () => {
  const { addGate } = useCircuitViewModel();

  const handleDragStart = (e: React.DragEvent, type: ToolItem['type']) => {
    e.dataTransfer.setData('gateType', type);
  };

  const handleDoubleClick = (type: ToolItem['type']) => {
    // キャンバス中央に配置
    addGate(type as GateType, { x: 600, y: 400 });
  };

  const renderCategory = (category: 'basic' | 'io' | 'special', title: string, categoryIcon: string) => {
    const categoryTools = tools.filter(t => t.category === category);
    
    return (
      <>
        <div className="section-title">
          <span>{categoryIcon}</span>
          <span>{title}</span>
        </div>
        <div className="tools-grid">
          {categoryTools.map(tool => (
            <div
              key={tool.type}
              className="tool-card"
              draggable
              onDragStart={(e) => handleDragStart(e, tool.type)}
              onDoubleClick={() => handleDoubleClick(tool.type)}
            >
              <ToolIcon type={tool.type} />
              <div className="tool-label">{tool.label}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {renderCategory('basic', '基本ゲート', '🔲')}
      {renderCategory('io', '入出力', '🔌')}
      {renderCategory('special', '特殊ゲート', '◆')}
    </>
  );
};