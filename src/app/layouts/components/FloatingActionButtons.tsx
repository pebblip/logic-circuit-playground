import React from 'react';

interface FloatingActionButtonsProps {
  onToolsClick: () => void;
}

/**
 * モバイル用FAB（フローティングアクションボタン）
 */
export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ onToolsClick }) => {
  return (
    <div className="fixed bottom-52 right-4 flex flex-col gap-3 z-30">
      {/* リセットボタン */}
      <button className="w-12 h-12 rounded-full bg-gray-800 bg-opacity-90 backdrop-blur border border-gray-700 flex items-center justify-center text-xl shadow-lg active:scale-95 transition-transform">
        🔄
      </button>
      
      {/* ズームボタン */}
      <button className="w-12 h-12 rounded-full bg-gray-800 bg-opacity-90 backdrop-blur border border-gray-700 flex items-center justify-center text-xl shadow-lg active:scale-95 transition-transform">
        🔍
      </button>
      
      {/* 実行ボタン */}
      <button className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl shadow-lg shadow-green-900/50 active:scale-95 transition-transform">
        ▶️
      </button>
      
      {/* ツールボタン */}
      <button 
        onClick={onToolsClick}
        className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-900/50 active:scale-95 transition-transform"
      >
        ➕
      </button>
    </div>
  );
};