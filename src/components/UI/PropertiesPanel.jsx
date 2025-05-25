// プロパティパネルコンポーネント

import React, { memo } from 'react';
import { GATE_TYPES } from '../../constants/circuit';

/**
 * プロパティパネルコンポーネント
 */
const PropertiesPanel = memo(({ 
  selectedGate, 
  savedCircuits, 
  onLoadCircuit, 
  onSaveCircuit 
}) => {
  const handleSaveClick = () => {
    const name = prompt('回路名を入力してください:');
    if (name) {
      onSaveCircuit(name);
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 transition-all w-64 overflow-hidden">
      <div className="p-4">
        <h2 className="font-medium text-gray-900 mb-4">プロパティ</h2>
        
        {selectedGate ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">種類</p>
              <p className="font-medium">{GATE_TYPES[selectedGate.type].name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">入力数</p>
              <p className="font-medium">{GATE_TYPES[selectedGate.type].inputs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">出力数</p>
              <p className="font-medium">{GATE_TYPES[selectedGate.type].outputs}</p>
            </div>
            {selectedGate.value !== null && (
              <div>
                <p className="text-sm text-gray-600">現在の値</p>
                <p className="font-medium">{selectedGate.value ? '1' : '0'}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">ゲートを選択してください</p>
        )}

        <div className="mt-8">
          <h3 className="font-medium text-gray-900 mb-3">保存済み回路</h3>
          {savedCircuits.length > 0 ? (
            <div className="space-y-2">
              {savedCircuits.map(circuit => (
                <button
                  key={circuit.id}
                  onClick={() => onLoadCircuit(circuit)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="font-medium">{circuit.name}</div>
                  <div className="text-xs text-gray-500">Lv{circuit.level}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">保存された回路はありません</p>
          )}
          
          <button
            onClick={handleSaveClick}
            className="mt-3 w-full px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
          >
            現在の回路を保存
          </button>
        </div>
      </div>
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';

export default PropertiesPanel;