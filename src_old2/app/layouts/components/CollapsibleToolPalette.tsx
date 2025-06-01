import React from 'react';
import { ToolPalette } from './ToolPalette';

interface CollapsibleToolPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * タブレット用折り畳み可能ツールパレット
 */
export const CollapsibleToolPalette: React.FC<CollapsibleToolPaletteProps> = ({ isOpen, onToggle }) => {
  if (!isOpen) {
    return (
      <div className="h-full flex flex-col items-center py-5">
        <button
          onClick={onToggle}
          className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          ➡️
        </button>
        
        {/* 縦向きアイコン */}
        <div className="flex flex-col gap-3 mt-8">
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
            🔲
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
            🔌
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
            ⚙️
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="absolute top-5 right-3 z-10 w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
      >
        ⬅️
      </button>
      <ToolPalette />
    </div>
  );
};