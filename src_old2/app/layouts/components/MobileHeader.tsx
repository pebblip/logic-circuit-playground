import React from 'react';
import { useCircuitStore } from '../../../features/circuit-editor/model/stores/circuitStore';

/**
 * モバイル用ヘッダー
 */
export const MobileHeader: React.FC = () => {
  const { mode } = useCircuitStore();

  return (
    <header className="bg-gradient-to-r from-green-600 to-blue-600 px-3 py-2 flex items-center justify-between z-50">
      {/* タイトル */}
      <h1 className="text-base font-semibold text-white">
        論理回路プレイグラウンド
      </h1>
      
      {/* アクションボタン */}
      <div className="flex gap-2">
        <button className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg active:scale-95 transition-transform">
          💾
        </button>
        <button className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg active:scale-95 transition-transform">
          📤
        </button>
        <button className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg active:scale-95 transition-transform">
          ⚙️
        </button>
      </div>
    </header>
  );
};