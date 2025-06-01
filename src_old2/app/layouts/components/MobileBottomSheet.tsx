import React, { useState } from 'react';
import { GateType } from '../../../entities/types';
import { useCircuitViewModel } from '../../../features/circuit-editor/model/useCircuitViewModel';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToolItem {
  type: GateType | 'INPUT' | 'OUTPUT' | 'CLOCK';
  label: string;
  icon: string;
  category: 'basic' | 'io' | 'special' | 'custom';
}

const tools: ToolItem[] = [
  // 基本ゲート
  { type: 'AND', label: 'AND', icon: '🔲', category: 'basic' },
  { type: 'OR', label: 'OR', icon: '🔳', category: 'basic' },
  { type: 'NOT', label: 'NOT', icon: '⛭', category: 'basic' },
  { type: 'XOR', label: 'XOR', icon: '⬜', category: 'basic' },
  // 入出力
  { type: 'INPUT', label: 'INPUT', icon: '🔘', category: 'io' },
  { type: 'OUTPUT', label: 'OUTPUT', icon: '💡', category: 'io' },
  { type: 'CLOCK', label: 'CLOCK', icon: '⏰', category: 'io' },
  // 特殊
  { type: 'NAND', label: 'NAND', icon: '🔘', category: 'special' },
  { type: 'NOR', label: 'NOR', icon: '🔶', category: 'special' },
];

/**
 * モバイル用ボトムシート
 */
export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'io' | 'special' | 'custom'>('basic');
  const { addGate } = useCircuitViewModel();

  const handleAddGate = (type: ToolItem['type']) => {
    // キャンバス中央に配置
    addGate(type as GateType, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    onClose();
  };

  const categoryTools = tools.filter(t => t.category === selectedCategory);

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* ボトムシート */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 rounded-t-2xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* ハンドル */}
        <div className="flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>
        
        {/* カテゴリタブ */}
        <div className="flex gap-2 px-3 py-3 overflow-x-auto">
          <CategoryChip 
            label="基本" 
            isActive={selectedCategory === 'basic'}
            onClick={() => setSelectedCategory('basic')}
          />
          <CategoryChip 
            label="特殊" 
            isActive={selectedCategory === 'special'}
            onClick={() => setSelectedCategory('special')}
          />
          <CategoryChip 
            label="入出力" 
            isActive={selectedCategory === 'io'}
            onClick={() => setSelectedCategory('io')}
          />
          <CategoryChip 
            label="カスタム" 
            isActive={selectedCategory === 'custom'}
            onClick={() => setSelectedCategory('custom')}
          />
        </div>
        
        {/* ツールグリッド */}
        <div className="grid grid-cols-4 gap-2 p-3 max-h-40 overflow-y-auto">
          {categoryTools.map(tool => (
            <button
              key={tool.type}
              onClick={() => handleAddGate(tool.type)}
              className="aspect-square bg-gray-800 border border-gray-700 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <span className="text-2xl">{tool.icon}</span>
              <span className="text-xs text-gray-400">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
        isActive 
          ? 'bg-green-900 bg-opacity-30 border border-green-700 text-green-400' 
          : 'bg-gray-800 border border-gray-700 text-gray-400'
      }`}
    >
      {label}
    </button>
  );
};