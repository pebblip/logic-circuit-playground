import React, { useState } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateInfo } from './GateInfo';
import { ClockControls } from './ClockControls';
import { DetailModal } from './DetailModal';
import { TruthTableModal } from './TruthTableModal';
import { gateDescriptions } from '@/data/gateDescriptions';
import { DEMO_CUSTOM_GATES } from '@/components/tool-palette/gateDefinitions';

export const PropertyPanel: React.FC = () => {
  const {
    gates,
    selectedGateId,
    updateClockFrequency,
    selectedToolGateType,
    selectedToolCustomGateId,
    customGates,
  } = useCircuitStore();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTruthTableModal, setShowTruthTableModal] = useState(false);

  const selectedGate = gates.find(g => g.id === selectedGateId);

  // ツールパレットでゲートが選択されているかチェック
  const isToolPaletteSelection = selectedToolGateType !== null && !selectedGate;

  // 選択対象に応じたタイトルを取得
  const getTitle = () => {
    if (isToolPaletteSelection) {
      if (selectedToolGateType === 'CUSTOM' && selectedToolCustomGateId) {
        // デモカスタムゲートから検索
        let customGate = DEMO_CUSTOM_GATES.find(
          g => g.id === selectedToolCustomGateId
        );
        // ユーザー作成のカスタムゲートからも検索
        if (!customGate) {
          customGate = customGates.find(g => g.id === selectedToolCustomGateId);
        }
        return customGate?.displayName || 'カスタムゲート';
      }
      return `${selectedToolGateType}${selectedToolGateType.match(/^(INPUT|OUTPUT|CLOCK)$/) ? '' : 'ゲート'}`;
    }
    if (selectedGate) {
      return 'インスタンス状態';
    }
    return 'プロパティ';
  };

  // 何も選択されていない場合
  if (!selectedGate && !isToolPaletteSelection) {
    return (
      <aside className="property-panel">
        <div className="property-group">
          <div className="section-title">
            <span>📝</span>
            <span>プロパティ</span>
          </div>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              lineHeight: '1.6',
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            ゲートを選択すると
            <br />
            詳細が表示されます
          </p>
        </div>
      </aside>
    );
  }

  // ツールパレットのゲートが選択されている場合
  if (isToolPaletteSelection) {
    const hasDescription =
      selectedToolGateType &&
      (selectedToolGateType === 'CUSTOM' ||
        gateDescriptions[selectedToolGateType]);
    const hasTruthTable =
      selectedToolGateType === 'CUSTOM' ||
      ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(
        selectedToolGateType || ''
      );

    return (
      <aside className="property-panel">
        <div className="property-group">
          <div className="section-title">
            <span>📋</span>
            <span>選択中: {getTitle()}</span>
          </div>
        </div>

        {(hasDescription || hasTruthTable) && (
          <div className="property-group">
            <div className="section-title">
              <span>📚</span>
              <span>学習リソース</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {hasDescription && (
                <button
                  onClick={() => setShowDetailModal(true)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid #00ff88',
                    borderRadius: '8px',
                    color: '#00ff88',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  📖 詳細説明を表示
                </button>
              )}

              {hasTruthTable && (
                <button
                  onClick={() => setShowTruthTableModal(true)}
                  title="入力と出力の関係を表で確認できます"
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 102, 153, 0.1)',
                    border: '1px solid #ff6699',
                    borderRadius: '8px',
                    color: '#ff6699',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  📊 真理値表を表示
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    （入出力の関係表）
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ツールパレット選択時の詳細モーダル */}
        {showDetailModal && selectedToolGateType && (
          <DetailModal
            gateType={selectedToolGateType}
            customGateDefinition={
              selectedToolGateType === 'CUSTOM' && selectedToolCustomGateId
                ? (() => {
                    // デモカスタムゲートから検索
                    let customGate = DEMO_CUSTOM_GATES.find(
                      g => g.id === selectedToolCustomGateId
                    );
                    // ユーザー作成のカスタムゲートからも検索
                    if (!customGate) {
                      customGate = customGates.find(
                        g => g.id === selectedToolCustomGateId
                      );
                    }
                    return customGate;
                  })()
                : undefined
            }
            showDetailModal={showDetailModal}
            onClose={() => setShowDetailModal(false)}
          />
        )}

        {/* ツールパレット選択時の真理値表モーダル */}
        {showTruthTableModal && selectedToolGateType && (
          <TruthTableModal
            gateType={selectedToolGateType}
            customGateId={selectedToolCustomGateId}
            showTruthTableModal={showTruthTableModal}
            onClose={() => setShowTruthTableModal(false)}
          />
        )}
      </aside>
    );
  }

  // 配置済みゲートが選択されている場合（従来の動作）
  if (selectedGate) {
    return (
      <aside className="property-panel">
        <GateInfo selectedGate={selectedGate} />
        <ClockControls
          selectedGate={selectedGate}
          updateClockFrequency={updateClockFrequency}
        />
        {/* 配置済みゲートには学習リソースボタンを表示しない */}
      </aside>
    );
  }

  // フォールバック（到達しないはず）
  return null;
};
