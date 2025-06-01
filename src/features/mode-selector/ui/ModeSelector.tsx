import React from 'react';
import { AppMode, MODE_CONFIGS } from '../../../entities/types/mode';

interface ModeSelectorProps {
  onSelectMode: (mode: AppMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            論理回路プレイグラウンド
          </h1>
          <p className="text-xl text-gray-300">
            学習スタイルを選んでください
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(MODE_CONFIGS).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-green-400 rounded-lg p-8 transition-all duration-200 group"
            >
              <div className="text-6xl mb-4">{mode.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400">
                {mode.name}
              </h2>
              <p className="text-gray-400">
                {mode.description}
              </p>
              
              {mode.features && (
                <div className="mt-6 text-left space-y-2">
                  {mode.features.showHints && (
                    <div className="text-sm text-gray-500">
                      ✓ ヒント機能あり
                    </div>
                  )}
                  {mode.features.trackDiscoveries && (
                    <div className="text-sm text-gray-500">
                      ✓ 発見を記録
                    </div>
                  )}
                  {mode.features.allowCustomGates && (
                    <div className="text-sm text-gray-500">
                      ✓ カスタムゲート作成可能
                    </div>
                  )}
                  {mode.features.availableGates.length > 0 && (
                    <div className="text-sm text-gray-500">
                      ✓ 段階的に学習
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          ※ あとで設定から変更できます
        </div>
      </div>
    </div>
  );
};