import React from 'react';
import { GateType } from '../../types/gate';
import { CircuitViewModel } from '../../viewmodels/CircuitViewModel';


const GATE_CATEGORIES = [
  {
    name: '基本ゲート',
    gates: [
      { type: GateType.AND, label: 'AND', icon: '&' },
      { type: GateType.OR, label: 'OR', icon: '≥1' },
      { type: GateType.NOT, label: 'NOT', icon: '¬' },
      { type: GateType.XOR, label: 'XOR', icon: '⊕' },
    ],
  },
  {
    name: '入出力',
    gates: [
      { type: GateType.INPUT, label: '入力', icon: 'IN' },
      { type: GateType.OUTPUT, label: '出力', icon: 'OUT' },
      { type: 'CLOCK', label: 'クロック', icon: 'CLK' },
    ],
  },
  {
    name: '高度なゲート',
    gates: [
      { type: GateType.NAND, label: 'NAND', icon: '⊼' },
      { type: GateType.NOR, label: 'NOR', icon: '⊽' },
      { type: GateType.XNOR, label: 'XNOR', icon: '⊙' },
    ],
  },
];

export const ToolPalette = ({ viewModel, className = '' }) => {
  const handleDragStart = (e, gateType) => {
    e.dataTransfer.setData('gateType', gateType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddGate = (gateType) => {
    // Add gate at center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    viewModel.addGate(gateType, { x: centerX, y: centerY });
  };

  return (
    <div className={`bg-[#0f1441] shadow-lg rounded-lg p-4 ${className}`}>
      <h2 className="text-lg font-bold mb-4 text-white">ゲート</h2>
      <div className="space-y-4">
        {GATE_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{category.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {category.gates.map((gate) => (
                <button
                  key={gate.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, gate.type)}
                  onClick={() => handleAddGate(gate.type)}
                  className="flex flex-col items-center justify-center p-3 border-2 border-gray-700 bg-gray-800 rounded-lg hover:border-[#00ff88] hover:bg-gray-700 cursor-move transition-colors"
                  title={`${gate.label}をドラッグまたはクリックで追加`}
                >
                  <span className="text-2xl font-mono text-white">{gate.icon}</span>
                  <span className="text-xs mt-1 text-gray-300">{gate.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};