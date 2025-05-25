// 再設計された情報パネルコンポーネント

import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LEVELS, TABS, GATE_TYPES } from '../../constants/circuit';
import TruthTable from './TruthTable';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';

/**
 * 再設計された情報パネル
 * 学習モードとは独立した、リファレンスとデバッグのためのパネル
 */
const InfoPanelRedesigned = memo(({ 
  currentLevel, 
  selectedGate, 
  gates, 
  connections, 
  simulation,
  autoMode,
  height 
}) => {
  const [activeTab, setActiveTab] = useState('reference');
  const [consoleMessages, setConsoleMessages] = useState([]);

  // シミュレーション実行時のログを追加
  useEffect(() => {
    if (Object.keys(simulation).length > 0) {
      const timestamp = new Date().toLocaleTimeString('ja-JP');
      const message = {
        time: timestamp,
        type: 'info',
        text: `計算実行: ${Object.keys(simulation).length}個のゲートを評価`
      };
      setConsoleMessages(prev => [...prev.slice(-99), message]);
    }
  }, [simulation]);

  const tabStyle = (isActive) => ({
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.size.sm,
    fontWeight: isActive ? typography.weight.semibold : typography.weight.medium,
    color: isActive ? colors.ui.accent.primary : colors.ui.text.secondary,
    borderBottom: isActive ? `2px solid ${colors.ui.accent.primary}` : 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  // リファレンスタブ: ゲートの詳細情報
  const renderReference = () => {
    const gateGroups = {
      'レベル1: 基本ゲート': ['AND', 'OR', 'NOT', 'INPUT', 'OUTPUT'],
      'レベル2: 高度なゲート': ['NAND', 'NOR', 'XOR', 'SR_LATCH', 'D_FF', 'CLOCK'],
      'レベル3: 演算回路': ['HALF_ADDER', 'FULL_ADDER']
    };

    return (
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 48px)' }}>
        {/* 選択中のゲート情報 */}
        {selectedGate && (
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: colors.ui.accent.primary + '10',
              border: `1px solid ${colors.ui.accent.primary}30`
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: colors.ui.text.primary }}>
              選択中: {GATE_TYPES[selectedGate.type]?.name || selectedGate.type}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span style={{ color: colors.ui.text.secondary }}>入力: </span>
                <span style={{ color: colors.ui.text.primary }}>
                  {GATE_TYPES[selectedGate.type]?.inputs || 0}
                </span>
              </div>
              <div>
                <span style={{ color: colors.ui.text.secondary }}>出力: </span>
                <span style={{ color: colors.ui.text.primary }}>
                  {GATE_TYPES[selectedGate.type]?.outputs || 0}
                </span>
              </div>
              <div>
                <span style={{ color: colors.ui.text.secondary }}>ID: </span>
                <span className="font-mono" style={{ color: colors.ui.text.primary }}>
                  {selectedGate.id}
                </span>
              </div>
              <div>
                <span style={{ color: colors.ui.text.secondary }}>座標: </span>
                <span className="font-mono" style={{ color: colors.ui.text.primary }}>
                  ({selectedGate.x}, {selectedGate.y})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ゲートリファレンス */}
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.ui.text.primary }}>
          ゲートリファレンス
        </h3>
        {Object.entries(gateGroups).map(([groupName, gateTypes]) => (
          <div key={groupName} className="mb-6">
            <h4 className="text-sm font-medium mb-2" style={{ color: colors.ui.text.secondary }}>
              {groupName}
            </h4>
            <div className="space-y-2">
              {gateTypes.map(type => {
                const gate = GATE_TYPES[type];
                if (!gate) return null;
                
                return (
                  <div 
                    key={type}
                    className="p-3 rounded"
                    style={{ backgroundColor: colors.ui.background }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium" style={{ color: colors.ui.text.primary }}>
                        {gate.name}
                      </span>
                      <span className="font-mono text-sm" style={{ color: colors.ui.text.tertiary }}>
                        {gate.symbol}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: colors.ui.text.secondary }}>
                      入力: {gate.inputs} | 出力: {gate.outputs}
                      {gate.hasMemory && ' | メモリ素子'}
                      {gate.isComposite && ' | 複合ゲート'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // コンソールタブ: 実行ログとデバッグ情報
  const renderConsole = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm" 
             style={{ backgroundColor: colors.ui.background }}>
          {consoleMessages.length === 0 ? (
            <p style={{ color: colors.ui.text.tertiary }}>
              コンソールメッセージはありません
            </p>
          ) : (
            <div className="space-y-1">
              {consoleMessages.map((msg, index) => (
                <div key={index} className="flex gap-2">
                  <span style={{ color: colors.ui.text.tertiary }}>{msg.time}</span>
                  <span style={{ 
                    color: msg.type === 'error' ? colors.ui.accent.error : 
                           msg.type === 'warning' ? colors.ui.accent.warning : 
                           colors.ui.text.secondary 
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* コンソールコントロール */}
        <div className="p-2 border-t" style={{ borderColor: colors.ui.border }}>
          <button
            onClick={() => setConsoleMessages([])}
            className="text-xs px-3 py-1 rounded"
            style={{
              backgroundColor: colors.ui.background,
              color: colors.ui.text.secondary,
              border: `1px solid ${colors.ui.border}`
            }}
          >
            クリア
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height }} className="flex flex-col">
      {/* タブヘッダー */}
      <div 
        className="flex border-b"
        style={{ borderColor: colors.ui.border }}
      >
        {Object.values(TABS).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={tabStyle(activeTab === tab.id)}
          >
            {tab.label}
            {tab.id === 'console' && consoleMessages.length > 0 && (
              <span 
                className="ml-2 px-2 py-0.5 text-xs rounded-full"
                style={{ 
                  backgroundColor: colors.ui.accent.primary + '20',
                  color: colors.ui.accent.primary 
                }}
              >
                {consoleMessages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'reference' && renderReference()}
        {activeTab === 'console' && renderConsole()}
        {activeTab === 'truth' && (
          <div className="p-4">
            <TruthTable gates={gates} connections={connections} />
          </div>
        )}
      </div>
    </div>
  );
});

InfoPanelRedesigned.displayName = 'InfoPanelRedesigned';

InfoPanelRedesigned.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  selectedGate: PropTypes.object,
  gates: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired,
  simulation: PropTypes.object.isRequired,
  autoMode: PropTypes.bool.isRequired,
  height: PropTypes.string.isRequired
};

export default InfoPanelRedesigned;