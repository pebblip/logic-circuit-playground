import React from 'react';
import { GateType } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';

const BASIC_GATES: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'XOR', label: 'XOR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
];

const IO_GATES: { type: GateType; label: string }[] = [
  { type: 'INPUT', label: 'INPUT' },
  { type: 'OUTPUT', label: 'OUTPUT' },
  { type: 'CLOCK', label: 'CLOCK' },
];

// 特殊ゲート
const SPECIAL_GATES: { type: GateType; label: string }[] = [
  { type: 'D-FF', label: 'D-FF' },
  { type: 'SR-LATCH', label: 'SR-LATCH' },
  { type: 'MUX', label: 'MUX' },
];

export const ToolPalette: React.FC = () => {
  const { addGate, gates } = useCircuitStore();

  const handleToolClick = (type: GateType) => {
    // 既存のゲートの位置を確認して、重ならない位置を計算
    const baseX = 100;
    const baseY = 100;
    const spacing = 100;
    
    let x = baseX;
    let y = baseY;
    let row = 0;
    let col = 0;
    
    // 空いている位置を探す
    while (gates.some(g => 
      Math.abs(g.position.x - x) < 70 && 
      Math.abs(g.position.y - y) < 50
    )) {
      col++;
      if (col > 5) {
        col = 0;
        row++;
      }
      x = baseX + (col * spacing);
      y = baseY + (row * spacing);
    }
    
    addGate(type, { x, y });
  };

  const renderGatePreview = (type: GateType) => {
    if (type === 'INPUT') {
      return (
        <svg className="tool-preview" viewBox="-40 -20 80 40">
          <rect fill="#1a1a1a" stroke="#444" x="-25" y="-15" width="50" height="30" rx="15"/>
          <circle fill="#666" cx="0" cy="0" r="10"/>
        </svg>
      );
    }
    if (type === 'OUTPUT') {
      return (
        <svg className="tool-preview" viewBox="-25 -25 50 50">
          <circle fill="#1a1a1a" stroke="#444" cx="0" cy="0" r="20"/>
          <text x="0" y="5" style={{ fontSize: '20px', textAnchor: 'middle' }}>💡</text>
        </svg>
      );
    }
    
    // 特殊ゲートのプレビュー
    if (type === 'CLOCK') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <path 
            d="M -15 -10 L -15 0 L -5 0 M 5 0 L 15 0 L 15 -10" 
            stroke="#0ff" 
            strokeWidth="2" 
            fill="none"
          />
          <text className="gate-text" x="0" y="20" style={{ fontSize: '12px' }}>CLK</text>
        </svg>
      );
    }
    if (type === 'D-FF') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '10px' }}>D</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '10px' }}>CLK</text>
          <text className="gate-text" x="20" y="-10" style={{ fontSize: '10px' }}>Q</text>
          <text className="gate-text" x="20" y="10" style={{ fontSize: '10px' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'SR-LATCH') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <rect className="gate" x="-40" y="-30" width="80" height="60" rx="8"/>
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '10px' }}>S</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '10px' }}>R</text>
          <text className="gate-text" x="20" y="-10" style={{ fontSize: '10px' }}>Q</text>
          <text className="gate-text" x="20" y="10" style={{ fontSize: '10px' }}>Q̄</text>
        </svg>
      );
    }
    if (type === 'MUX') {
      return (
        <svg className="tool-preview" viewBox="-50 -40 100 80">
          <polygon 
            className="gate" 
            points="-30,-25 30,-25 30,25 -30,25" 
          />
          <text className="gate-text" x="-20" y="-10" style={{ fontSize: '8px' }}>I0</text>
          <text className="gate-text" x="-20" y="0" style={{ fontSize: '8px' }}>I1</text>
          <text className="gate-text" x="-20" y="10" style={{ fontSize: '8px' }}>S</text>
          <text className="gate-text" x="20" y="0" style={{ fontSize: '8px' }}>Y</text>
        </svg>
      );
    }
    
    return (
      <svg className="tool-preview" viewBox="-50 -30 100 60">
        <rect className="gate" x="-35" y="-25" width="70" height="50" rx="8"/>
        <text className="gate-text" x="0" y="0">{type}</text>
      </svg>
    );
  };

  return (
    <aside className="tool-palette">
      <div className="section-title">
        <span>🔲</span>
        <span>基本ゲート</span>
      </div>
      <div className="tools-grid">
        {BASIC_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>🔌</span>
        <span>入出力</span>
      </div>
      <div className="tools-grid">
        {IO_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="section-title">
        <span>⚙️</span>
        <span>特殊ゲート</span>
      </div>
      <div className="tools-grid">
        {SPECIAL_GATES.map(({ type, label }) => (
          <div
            key={type}
            className="tool-card"
            onClick={() => handleToolClick(type)}
          >
            {renderGatePreview(type)}
            <div className="tool-label">{label}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};