import React from 'react';
import { motion } from 'framer-motion';
import { GATE_TYPES } from '../../constants/circuit';

const PartsPanel = ({ currentLevel, onDragStart }) => {
  // レベルに応じて利用可能なゲートを決定
  const getAvailableGates = () => {
    const gates = ['INPUT', 'OUTPUT'];
    
    if (currentLevel >= 1) {
      gates.push('AND', 'OR', 'NOT');
    }
    if (currentLevel >= 2) {
      gates.push('XOR', 'NAND', 'NOR');
    }
    if (currentLevel >= 3) {
      gates.push('SR_LATCH', 'D_FF', 'CLOCK');
    }
    if (currentLevel >= 4) {
      gates.push('HALF_ADDER', 'FULL_ADDER');
    }
    
    return gates;
  };

  const availableGates = getAvailableGates();

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('gateType', type);
    if (onDragStart) {
      onDragStart(type);
    }
  };

  const getGateIcon = (type) => {
    const icons = {
      INPUT: '📥',
      OUTPUT: '📤',
      AND: '&',
      OR: '≥1',
      NOT: '¬',
      XOR: '⊕',
      NAND: '⊼',
      NOR: '⊽',
      CLOCK: '⏰',
      SR_LATCH: '🔐',
      D_FF: '📦',
      HALF_ADDER: '➕',
      FULL_ADDER: '➕²'
    };
    return icons[type] || '?';
  };

  const getGateColor = (type) => {
    const colors = {
      INPUT: 'bg-green-500',
      OUTPUT: 'bg-red-500',
      AND: 'bg-blue-500',
      OR: 'bg-purple-500',
      NOT: 'bg-yellow-500',
      XOR: 'bg-pink-500',
      NAND: 'bg-indigo-500',
      NOR: 'bg-orange-500',
      CLOCK: 'bg-teal-500',
      SR_LATCH: 'bg-cyan-500',
      D_FF: 'bg-gray-500',
      HALF_ADDER: 'bg-rose-500',
      FULL_ADDER: 'bg-amber-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">パーツボックス</h3>
        <p className="text-sm text-gray-600 mt-1">ドラッグして配置</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {availableGates.map((type) => {
            const gateInfo = GATE_TYPES[type];
            return (
              <motion.div
                key={type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                className={`${getGateColor(type)} text-white rounded-lg p-4 cursor-move shadow-md hover:shadow-lg transition-shadow`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{getGateIcon(type)}</span>
                  <span className="text-sm font-medium">{gateInfo?.label || type}</span>
                  {gateInfo?.description && (
                    <span className="text-xs mt-1 opacity-80 text-center">
                      {gateInfo.description}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">レベル {currentLevel}</span>
          <span className="text-xs text-gray-500">
            {availableGates.length} 個のパーツ
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartsPanel;