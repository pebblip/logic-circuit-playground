// レベル選択パネルコンポーネント

import React, { memo } from 'react';
import { LEVELS, GATE_TYPES } from '../../constants/circuit';

/**
 * レベル選択パネルコンポーネント
 */
const LevelPanel = memo(({ currentLevel, unlockedLevels, onLevelSelect }) => {
  return (
    <div className="bg-white border-r border-gray-200 transition-all w-64 overflow-hidden">
      <div className="p-4">
        <h2 className="font-medium text-gray-900 mb-4">レベル選択</h2>
        {Object.entries(LEVELS).map(([levelNum, levelInfo]) => {
          const isUnlocked = unlockedLevels[levelNum];
          const isActive = currentLevel === parseInt(levelNum);
          
          return (
            <div key={levelNum} className="mb-4">
              <button
                onClick={() => isUnlocked && onLevelSelect(parseInt(levelNum))}
                className={`w-full text-left p-2 rounded ${
                  isActive ? 'bg-blue-50 border border-blue-300' : 
                  isUnlocked ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isUnlocked}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                    Lv{levelNum} {levelInfo.name}
                  </span>
                  {isUnlocked && <span className="text-green-500">✓</span>}
                </div>
              </button>
              {isActive && (
                <div className="mt-2 ml-4 text-sm text-gray-600">
                  {levelInfo.gates.map(gateType => {
                    const gateInfo = GATE_TYPES[gateType];
                    return gateInfo ? (
                      <div key={gateType} className="py-1">
                        • {gateInfo.name}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

LevelPanel.displayName = 'LevelPanel';

export default LevelPanel;