// モダンなプロパティパネル

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { GATE_TYPES } from '../../constants/circuit';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';

/**
 * モダンなプロパティパネル
 */
const PropertiesPanel = memo(({ selectedGate, savedCircuits, onLoadCircuit, onSaveCircuit }) => {
  const [circuitName, setCircuitName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const renderGateProperties = () => {
    if (!selectedGate) {
      return (
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{
              backgroundColor: colors.ui.background,
              color: colors.ui.text.tertiary,
            }}
          >
            <span className="text-2xl">🔍</span>
          </div>
          <p 
            className="text-sm"
            style={{ color: colors.ui.text.secondary }}
          >
            ゲートを選択すると
          </p>
          <p 
            className="text-sm"
            style={{ color: colors.ui.text.secondary }}
          >
            詳細が表示されます
          </p>
        </div>
      );
    }

    const gateInfo = GATE_TYPES[selectedGate.type];
    const levelColors = {
      1: colors.gates.basic,
      2: colors.gates.memory,
      3: colors.gates.arithmetic,
      4: colors.gates.cpu,
    };

    return (
      <div className="space-y-4">
        {/* ゲート情報 */}
        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.ui.background,
            border: `1px solid ${colors.ui.border}`,
          }}
        >
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
              style={{
                backgroundColor: levelColors[gateInfo.level] + '20',
                color: levelColors[gateInfo.level],
              }}
            >
              {gateInfo.symbol}
            </div>
            <div className="flex-1">
              <h4 
                className="font-semibold"
                style={{ color: colors.ui.text.primary }}
              >
                {gateInfo.name}
              </h4>
              <p 
                className="text-xs"
                style={{ color: colors.ui.text.tertiary }}
              >
                ID: {selectedGate.id}
              </p>
            </div>
          </div>

          {/* プロパティ */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.ui.text.secondary }}>タイプ:</span>
              <span style={{ color: colors.ui.text.primary }}>{selectedGate.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.ui.text.secondary }}>入力数:</span>
              <span style={{ color: colors.ui.text.primary }}>{gateInfo.inputs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.ui.text.secondary }}>出力数:</span>
              <span style={{ color: colors.ui.text.primary }}>{gateInfo.outputs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.ui.text.secondary }}>位置:</span>
              <span style={{ color: colors.ui.text.primary }}>
                ({Math.round(selectedGate.x)}, {Math.round(selectedGate.y)})
              </span>
            </div>
          </div>
        </div>

        {/* 特殊ゲートの追加情報 */}
        {selectedGate.type === 'INPUT' && (
          <div 
            className="p-3 rounded-lg"
            style={{
              backgroundColor: colors.ui.accent.success + '10',
              border: `1px solid ${colors.ui.accent.success + '30'}`,
            }}
          >
            <p className="text-xs" style={{ color: colors.ui.text.secondary }}>
              💡 ダブルクリックで値を切り替えられます
            </p>
          </div>
        )}

        {(selectedGate.type === 'SR_LATCH' || selectedGate.type === 'D_FF') && (
          <div 
            className="p-3 rounded-lg"
            style={{
              backgroundColor: colors.gates.memory + '10',
              border: `1px solid ${colors.gates.memory + '30'}`,
            }}
          >
            <p className="text-xs" style={{ color: colors.ui.text.secondary }}>
              💾 このゲートは内部状態を持ちます
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: colors.ui.border }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: colors.ui.text.primary }}
        >
          プロパティ
        </h2>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderGateProperties()}
      </div>

      {/* 回路の保存/読み込み */}
      <div 
        className="border-t p-4 space-y-3"
        style={{ borderColor: colors.ui.border }}
      >
        <h3 
          className="font-medium text-sm"
          style={{ color: colors.ui.text.primary }}
        >
          回路の管理
        </h3>

        {/* 保存ボタン */}
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: colors.ui.accent.primary,
            color: colors.ui.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = shadows.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          💾 現在の回路を保存
        </button>

        {/* 保存ダイアログ */}
        {showSaveDialog && (
          <div className="space-y-2">
            <input
              type="text"
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              placeholder="回路名を入力..."
              className="w-full px-3 py-2 text-sm rounded-lg"
              style={{
                backgroundColor: colors.ui.surface,
                border: `1px solid ${colors.ui.border}`,
                color: colors.ui.text.primary,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && circuitName.trim()) {
                  onSaveCircuit(circuitName.trim());
                  setCircuitName('');
                  setShowSaveDialog(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (circuitName.trim()) {
                    onSaveCircuit(circuitName.trim());
                    setCircuitName('');
                    setShowSaveDialog(false);
                  }
                }}
                className="flex-1 py-1 text-xs rounded"
                style={{
                  backgroundColor: colors.ui.accent.success,
                  color: colors.ui.surface,
                }}
              >
                保存
              </button>
              <button
                onClick={() => {
                  setCircuitName('');
                  setShowSaveDialog(false);
                }}
                className="flex-1 py-1 text-xs rounded"
                style={{
                  backgroundColor: colors.ui.background,
                  color: colors.ui.text.secondary,
                  border: `1px solid ${colors.ui.border}`,
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 保存済み回路リスト */}
        {savedCircuits.length > 0 && (
          <div className="space-y-2">
            <p 
              className="text-xs font-medium"
              style={{ color: colors.ui.text.secondary }}
            >
              保存済み回路:
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {savedCircuits.map((circuit, index) => (
                <button
                  key={index}
                  onClick={() => onLoadCircuit(circuit)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  style={{
                    backgroundColor: colors.ui.background,
                    border: `1px solid ${colors.ui.border}`,
                  }}
                >
                  <span style={{ color: colors.ui.text.primary }}>
                    {circuit.name}
                  </span>
                  <span 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: colors.ui.accent.primary }}
                  >
                    読込 →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {savedCircuits.length === 0 && !showSaveDialog && (
          <p 
            className="text-xs text-center py-2"
            style={{ color: colors.ui.text.tertiary }}
          >
            保存された回路はありません
          </p>
        )}
      </div>
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';

PropertiesPanel.propTypes = {
  selectedGate: PropTypes.object,
  savedCircuits: PropTypes.array.isRequired,
  onLoadCircuit: PropTypes.func.isRequired,
  onSaveCircuit: PropTypes.func.isRequired
};

export default PropertiesPanel;