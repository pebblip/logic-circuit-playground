// 情報パネルコンポーネント

import React, { memo, useState } from 'react';
import { LEVELS, TABS, GATE_TYPES } from '../../constants/circuit';

/**
 * 情報パネルコンポーネント
 */
const InfoPanel = memo(({ currentLevel, selectedGate }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="flex border-b border-gray-200">
        {Object.values(TABS).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="p-4 h-32 overflow-y-auto">
        {activeTab === 'description' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              レベル {currentLevel}: {LEVELS[currentLevel].name}
            </h3>
            <p className="text-sm text-gray-600">
              {LEVELS[currentLevel].description}
            </p>
            {selectedGate && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-900">
                  選択中: {GATE_TYPES[selectedGate.type].name}
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'tutorial' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">次のステップ</h3>
            {currentLevel === 1 && (
              <p className="text-sm text-gray-600">
                基本的なAND、OR、NOT回路を組み合わせて、XOR回路を作ってみましょう。
                すべての基本回路をマスターしたら、レベル2のメモリ要素が解放されます。
              </p>
            )}
            {currentLevel === 2 && (
              <p className="text-sm text-gray-600">
                NANDゲートを使ってSRラッチを構築してみましょう。
                クロック信号と組み合わせることで、Dフリップフロップも作れます。
              </p>
            )}
          </div>
        )}
        
        {/* 今後実装予定のタブ */}
        {activeTab === 'timing' && (
          <p className="text-sm text-gray-500">タイミング図は今後実装予定です。</p>
        )}
        
        {activeTab === 'truth' && (
          <p className="text-sm text-gray-500">真理値表は今後実装予定です。</p>
        )}
      </div>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

export default InfoPanel;