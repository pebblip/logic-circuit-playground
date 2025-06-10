import React, { useState } from 'react';
import './HelpPanel.css';
import { TERMS } from '../features/learning-mode/data/terms';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLearningMode?: () => void;
}

type TabId = 'quick-help' | 'troubleshooting' | 'features';

interface HelpContent {
  question: string;
  answer: string;
}

const helpContents: Record<TabId, HelpContent[]> = {
  'quick-help': [
    {
      question: `🏗️ ${TERMS.CIRCUIT}を作る基本手順`,
      answer:
        `1. ツールパレットから${TERMS.GATE}を選択して${TERMS.DRAG_AND_DROP}\n2. ${TERMS.GATE}の${TERMS.PIN}を${TERMS.CLICK}して${TERMS.CONNECTION}（${TERMS.OUTPUT}→${TERMS.INPUT}の順）\n3. ${TERMS.INPUT_GATE}で${TERMS.SIGNAL}を制御し、${TERMS.OUTPUT_GATE}で結果を確認\n4. 複雑な${TERMS.CIRCUIT}は小さな部分から段階的に構築`,
    },
    {
      question: `⌨️ キーボードショートカット`,
      answer:
        `【${TERMS.COPY}&${TERMS.PASTE}】Ctrl+C/V（Mac: Cmd+C/V）\n【${TERMS.UNDO}/${TERMS.REDO}】Ctrl+Z/Y（Mac: Cmd+Z/Y）\n【${TERMS.DELETE}】Delete/Backspace\n【${TERMS.SAVE}】Ctrl+S（Mac: Cmd+S）\n【${TERMS.MULTI_SELECT}】Shift+${TERMS.CLICK}または${TERMS.DRAG}`,
    },
    {
      question: `🔍 表示操作`,
      answer:
        `【${TERMS.ZOOM}】マウスホイール、+/-キー\n【${TERMS.PAN}】スペース+${TERMS.DRAG}、中クリック${TERMS.DRAG}\n【${TERMS.RANGE_SELECT}】${TERMS.DRAG}で範囲選択\n【${TERMS.MULTI_SELECT}】Shift+${TERMS.CLICK}で複数選択`,
    },
    {
      question: `📱 タッチ操作`,
      answer:
        `【基本操作】短いタップで選択、長押しでメニュー\n【${TERMS.ZOOM}】2本指でピンチ\n【${TERMS.PAN}】1本指で${TERMS.DRAG}\n【${TERMS.CONNECTION}】${TERMS.PIN}を正確にタップ\n【推奨】横向き表示での使用`,
    },
    {
      question: `🎓 さらに学ぶには`,
      answer:
        `【${TERMS.LEARNING_MODE}】体系的な${TERMS.LOGIC_CIRCUIT}学習\n【${TERMS.TUTORIAL}】基本操作の復習\n【${TERMS.CUSTOM_GATE}】複雑な${TERMS.CIRCUIT}の部品化\n【${TERMS.TRUTH_TABLE}】${TERMS.CIRCUIT}の動作確認`,
    },
  ],
  troubleshooting: [
    {
      question: `🔌 ${TERMS.WIRE}が${TERMS.CONNECTION}できない`,
      answer:
        `【原因1】方向性エラー: ${TERMS.SIGNAL}は「${TERMS.OUTPUT}→${TERMS.INPUT}」の方向にのみ流れます\n【原因2】重複${TERMS.CONNECTION}: 1つの${TERMS.INPUT_PIN}には1本の${TERMS.WIRE}のみ${TERMS.CONNECTION}可能\n【原因3】同一${TERMS.GATE}内${TERMS.CONNECTION}: 同じ${TERMS.GATE}の${TERMS.OUTPUT}と${TERMS.INPUT}は${TERMS.CONNECTION}不可`,
    },
    {
      question: `🔧 ${TERMS.CIRCUIT}が期待通りに動作しない`,
      answer:
        `【チェック1】未${TERMS.CONNECTION}の${TERMS.PIN}: すべての${TERMS.INPUT_PIN}に${TERMS.SIGNAL}が供給されているか確認\n【チェック2】${TERMS.LOGIC_OPERATION}の理解: ${TERMS.AND}は「すべて${TERMS.ON}」、${TERMS.OR}は「一つでも${TERMS.ON}」\n【チェック3】${TERMS.SIGNAL}の流れ: ${TERMS.INPUT}から順序立てて${TERMS.SIGNAL}が流れているか色で確認\n【チェック4】フィードバックループ: 循環${TERMS.CIRCUIT}になっていないか`,
    },
    {
      question: `🎯 ${TERMS.GATE}を${TERMS.SELECT}・${TERMS.MOVE}できない`,
      answer:
        `【解決法1】正確な${TERMS.CLICK}: ${TERMS.GATE}の中央部分を${TERMS.CLICK}（${TERMS.PIN}や${TERMS.WIRE}ではなく）\n【解決法2】重なり問題: 複数の${TERMS.GATE}が重なっている場合は${TERMS.ZOOM}して分離\n【解決法3】${TERMS.RANGE_SELECT}: ${TERMS.DRAG}で${TERMS.RANGE_SELECT}してからまとめて${TERMS.MOVE}`,
    },
    {
      question: `💾 データの${TERMS.SAVE}・${TERMS.LOAD}問題`,
      answer:
        `【${TERMS.SAVE}先】ブラウザのローカルストレージ（プライベートモードでは${TERMS.SAVE}されない）\n【データ消失】ブラウザのキャッシュクリアで消える場合あり。重要な${TERMS.CIRCUIT}は${TERMS.EXPORT}機能でファイル${TERMS.SAVE}を推奨\n【互換性】異なるブラウザ間ではデータは共有されない`,
    },
    {
      question: `⚡ パフォーマンスが重い`,
      answer:
        `【原因1】大規模${TERMS.CIRCUIT}: ${TERMS.GATE}数が多すぎる場合は${TERMS.CUSTOM_GATE}で階層化\n【原因2】${TERMS.CLOCK}${TERMS.GATE}多用: 高頻度の${TERMS.CLOCK_SIGNAL}は処理負荷大\n【原因3】無限ループ: フィードバック${TERMS.CIRCUIT}が無限実行\n【対策】ブラウザの再読み込み、または段階的な${TERMS.CIRCUIT}構築`,
    },
  ],
  features: [
    {
      question: `⚙️ ${TERMS.CUSTOM_GATE}機能`,
      answer:
        `【${TERMS.CREATE}方法】${TERMS.CREATE}した${TERMS.CIRCUIT}を${TERMS.SELECT}して「${TERMS.CUSTOM_GATE}として${TERMS.SAVE}」\n【再利用】ツールパレットから通常の${TERMS.GATE}と同様に${TERMS.PLACE}可能\n【階層化】複雑な${TERMS.CIRCUIT}を整理し、見通しを向上\n【${TERMS.TRUTH_TABLE}】${TERMS.CUSTOM_GATE}も自動的に${TERMS.TRUTH_TABLE}を生成`,
    },
    {
      question: `⏰ タイミング制御`,
      answer:
        `【${TERMS.CLOCK}${TERMS.GATE}】1Hz〜10Hzの周波数で定期的に${TERMS.ON}/${TERMS.OFF}\n【${TERMS.D_FF}${TERMS.GATE}】${TERMS.CLOCK_SIGNAL}の立ち上がりで${TERMS.INPUT}を記憶\n【${TERMS.SR_LATCH}${TERMS.GATE}】Set/Reset${TERMS.SIGNAL}で状態を制御\n【シーケンシャル${TERMS.CIRCUIT}】時間的な動作を持つ${TERMS.CIRCUIT}設計が可能`,
    },
    {
      question: `🔄 データの入出力`,
      answer:
        `【${TERMS.SAVE}/${TERMS.LOAD}】ブラウザローカルストレージに自動${TERMS.SAVE}\n【${TERMS.EXPORT}】JSONファイルとして${TERMS.CIRCUIT}データを出力\n【${TERMS.IMPORT}】他の環境で${TERMS.CREATE}した${TERMS.CIRCUIT}を${TERMS.LOAD}\n【URL共有】${TERMS.CIRCUIT}をURLとして共有（準備中）\n【画像出力】${TERMS.CIRCUIT}図をPNG画像として出力（準備中）`,
    },
    {
      question: `📊 解析・検証機能`,
      answer:
        `【${TERMS.TRUTH_TABLE}】任意の${TERMS.CIRCUIT}の完全な${TERMS.TRUTH_TABLE}を自動生成\n【${TERMS.SIGNAL}フロー】リアルタイムで${TERMS.SIGNAL}の流れを視覚化\n【${TERMS.CIRCUIT}検証】${TERMS.LOGIC_OPERATION}エラーや${TERMS.CONNECTION}問題を自動チェック（準備中）\n【パフォーマンス計測】${TERMS.GATE}数、遅延時間等の${TERMS.CIRCUIT}特性を表示（準備中）`,
    },
  ],
};

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, onOpenLearningMode }) => {
  const [activeTab, setActiveTab] = useState<TabId>('quick-help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleExpanded = (question: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  const filteredContent = searchQuery
    ? Object.entries(helpContents).flatMap(([tabId, contents]) =>
        contents
          .filter(
            item =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(item => ({ ...item, tabId }))
      )
    : helpContents[activeTab].map(item => ({ ...item, tabId: activeTab }));

  return (
    <div className="help-panel-overlay">
      <div className="help-panel">
        <div className="help-panel-header">
          <h2>❓ {TERMS.HELP}</h2>
          <div className="header-actions">
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="help-search">
          <input
            type="text"
            placeholder="検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {!searchQuery && (
          <div className="help-tabs">
            <button
              className={`help-tab ${activeTab === 'quick-help' ? 'active' : ''}`}
              onClick={() => setActiveTab('quick-help')}
            >
              クイックヘルプ
            </button>
            <button
              className={`help-tab ${activeTab === 'troubleshooting' ? 'active' : ''}`}
              onClick={() => setActiveTab('troubleshooting')}
            >
              困ったとき
            </button>
            <button
              className={`help-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              便利機能
            </button>
          </div>
        )}

        <div className="help-content">
          {searchQuery && filteredContent.length === 0 && (
            <div className="no-results">
              「{searchQuery}」に関する項目が見つかりませんでした
            </div>
          )}

          {filteredContent.map((item, index) => (
            <div key={index} className="help-item">
              <div
                className="help-question"
                onClick={() => toggleExpanded(item.question)}
              >
                <span className="expand-icon">
                  {expandedItems.has(item.question) ? '▼' : '▶'}
                </span>
                {item.question}
              </div>
              {expandedItems.has(item.question) && (
                <div className="help-answer">
                  {item.answer}
                  {searchQuery && (
                    <div className="search-context">
                      (
                      {item.tabId === 'quick-help'
                        ? 'クイックヘルプ'
                        : item.tabId === 'troubleshooting'
                          ? '困ったとき'
                          : '便利機能'}
                      )
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="help-footer">
          <div className="help-suggestions">
            <p><strong>💡 さらに学ぶには</strong></p>
            <p>• <strong>{TERMS.LEARNING_MODE}</strong>：体系的な{TERMS.LOGIC_CIRCUIT}学習</p>
            <p>• <strong>{TERMS.TUTORIAL}</strong>：基本操作の復習</p>
          </div>
        </div>
      </div>
    </div>
  );
};
