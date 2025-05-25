// モダンな情報パネルコンポーネント

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { LEVELS, TABS, GATE_TYPES } from '../../constants/circuit';
import TruthTable from './TruthTable';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';

/**
 * モダンな情報パネル
 */
const InfoPanel = memo(({ currentLevel, selectedGate, gates, connections, height }) => {
  const [activeTab, setActiveTab] = useState('description');

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

  const renderDescription = () => {
    const gateDescriptions = {
      AND: { symbol: '∧', desc: 'すべての入力が1（真）のときのみ1を出力します。', example: '1 ∧ 1 = 1, 1 ∧ 0 = 0' },
      OR: { symbol: '∨', desc: 'いずれかの入力が1（真）のとき1を出力します。', example: '1 ∨ 0 = 1, 0 ∨ 0 = 0' },
      NOT: { symbol: '¬', desc: '入力を反転します。', example: '¬1 = 0, ¬0 = 1' },
      XOR: { symbol: '⊕', desc: '入力が異なるとき1を出力します。', example: '1 ⊕ 0 = 1, 1 ⊕ 1 = 0' },
      NAND: { symbol: '⊼', desc: 'ANDの出力を反転します。', example: '1 ⊼ 1 = 0, 1 ⊼ 0 = 1' },
      NOR: { symbol: '⊽', desc: 'ORの出力を反転します。', example: '1 ⊽ 0 = 0, 0 ⊽ 0 = 1' },
      HALF_ADDER: { symbol: 'HA', desc: '2つの1ビット数を加算し、和（S）と桁上げ（C）を出力します。', example: '1 + 1 = S:0, C:1' },
      FULL_ADDER: { symbol: 'FA', desc: '2つの1ビット数と桁上げ入力を加算します。', example: '1 + 1 + 1 = S:1, C:1' },
      SR_LATCH: { symbol: 'SR', desc: '基本的な記憶素子。S（セット）とR（リセット）で状態を制御します。' },
      D_FF: { symbol: 'D-FF', desc: 'クロックの立ち上がりでD入力の値を記憶します。' },
    };

    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.ui.text.primary }}>
            レベル {currentLevel}: {LEVELS[currentLevel].name}
          </h3>
          <p className="text-sm" style={{ color: colors.ui.text.secondary }}>
            {LEVELS[currentLevel].description}
          </p>
        </div>

        {selectedGate && gateDescriptions[selectedGate.type] && (
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: colors.ui.background,
              border: `1px solid ${colors.ui.border}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                style={{ 
                  backgroundColor: colors.ui.accent.primary + '20',
                  color: colors.ui.accent.primary,
                }}
              >
                {gateDescriptions[selectedGate.type].symbol}
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: colors.ui.text.primary }}>
                  {GATE_TYPES[selectedGate.type].name}
                </h4>
                <p className="text-xs" style={{ color: colors.ui.text.tertiary }}>
                  選択中のゲート
                </p>
              </div>
            </div>
            <p className="text-sm mb-2" style={{ color: colors.ui.text.secondary }}>
              {gateDescriptions[selectedGate.type].desc}
            </p>
            {gateDescriptions[selectedGate.type].example && (
              <p className="text-xs font-mono" style={{ color: colors.ui.text.tertiary }}>
                例: {gateDescriptions[selectedGate.type].example}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTutorial = () => {
    const tutorials = {
      1: {
        title: '基本ゲートをマスターしよう',
        steps: [
          'INPUTゲートを2つ配置します',
          'ANDゲートを配置します',
          'INPUTの出力をANDの入力に接続します',
          'OUTPUTゲートを配置してANDの出力を接続します',
          'INPUTをダブルクリックして値を変更し、動作を確認します'
        ]
      },
      2: {
        title: 'メモリ要素を理解しよう',
        steps: [
          'NANDゲートを2つ配置します',
          'それぞれの出力を相手の入力に接続してSRラッチを作ります',
          'INPUTゲートでS（セット）とR（リセット）を制御します',
          '両方0のとき前の状態を保持することを確認します'
        ]
      },
      3: {
        title: '加算器を構築しよう',
        steps: [
          'Half Adderを使って1ビットの加算を試します',
          'Full Adderを複数接続して多ビット加算器を作ります',
          'キャリー出力を次のFull Adderのキャリー入力に接続します',
          '2進数の加算を実行してみましょう'
        ]
      }
    };

    const tutorial = tutorials[currentLevel];

    return (
      <div className="p-4">
        {tutorial && (
          <>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.ui.text.primary }}>
              {tutorial.title}
            </h3>
            <div className="space-y-3">
              {tutorial.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: colors.ui.accent.primary + '20',
                      color: colors.ui.accent.primary,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.semibold,
                    }}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm pt-1" style={{ color: colors.ui.text.secondary }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ height }}>
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
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = colors.ui.text.primary;
                e.currentTarget.style.backgroundColor = colors.ui.background;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = colors.ui.text.secondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* タブコンテンツ */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'description' && renderDescription()}
        {activeTab === 'tutorial' && renderTutorial()}
        {activeTab === 'timing' && (
          <div className="p-4 text-center">
            <p className="text-sm" style={{ color: colors.ui.text.tertiary }}>
              タイミング図は今後実装予定です
            </p>
          </div>
        )}
        {activeTab === 'truth' && (
          <TruthTable gates={gates} connections={connections} />
        )}
      </div>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

InfoPanel.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  selectedGate: PropTypes.object,
  gates: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired,
  height: PropTypes.string
};

export default InfoPanel;