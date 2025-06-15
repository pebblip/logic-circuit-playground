import React, { useState } from 'react';
import './HelpPanel.css';
import { TERMS } from '../features/learning-mode/data/terms';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLearningMode?: () => void;
  onStartTutorial?: () => void;
}

type TabId = 'quick-help' | 'troubleshooting' | 'features';

interface HelpContent {
  question: string;
  answer: string | { label: string; content: string }[];
}

const helpContents: Record<TabId, HelpContent[]> = {
  'quick-help': [
    {
      question: `🏗️ ${TERMS.CIRCUIT}を作る基本手順`,
      answer: `【手順1】ツールパレットから${TERMS.GATE}を選択して${TERMS.DRAG_AND_DROP}【手順2】${TERMS.GATE}の${TERMS.PIN}を${TERMS.CLICK}して${TERMS.CONNECTION}（${TERMS.OUTPUT}→${TERMS.INPUT}の順）【手順3】${TERMS.INPUT_GATE}で${TERMS.SIGNAL}を制御し、${TERMS.OUTPUT_GATE}で結果を確認【手順4】複雑な${TERMS.CIRCUIT}は小さな部分から段階的に構築【${TERMS.WIRE}削除】右クリック（macOS: Ctrl+${TERMS.CLICK}）`,
    },
    {
      question: `⌨️ キーボードショートカット`,
      answer: `【${TERMS.COPY}&${TERMS.PASTE}】Ctrl+C/V（Mac: Cmd+C/V）【${TERMS.UNDO}/${TERMS.REDO}】Ctrl+Z/Y（Mac: Cmd+Z/Y）【${TERMS.DELETE}】Delete/Backspace【${TERMS.SAVE}】Ctrl+S（Mac: Cmd+S）【${TERMS.MULTI_SELECT}】Shift+${TERMS.CLICK}または${TERMS.DRAG}【パンモード】スペースキー長押し【キャンセル】Escキー（${TERMS.WIRE}描画・プレビュー終了）`,
    },
    {
      question: `🔍 表示操作`,
      answer: `【${TERMS.ZOOM}】マウスホイール（マウス位置中心）【${TERMS.PAN}】スペース+${TERMS.DRAG}【${TERMS.RANGE_SELECT}】${TERMS.DRAG}で範囲選択【${TERMS.MULTI_SELECT}】Shift+${TERMS.CLICK}で複数選択`,
    },
    {
      question: `📱 タッチ操作`,
      answer: `【基本操作】短いタップで選択【${TERMS.ZOOM}】2本指でピンチ【${TERMS.PAN}】1本指で${TERMS.DRAG}【${TERMS.CONNECTION}】${TERMS.PIN}を正確にタップ【${TERMS.WIRE}削除】二本指タップまたは設定でCtrl+タップ【推奨】横向き表示での使用`,
    },
    {
      question: `🎓 さらに学ぶには`,
      answer: `【${TERMS.LEARNING_MODE}】体系的な${TERMS.LOGIC_CIRCUIT}学習【${TERMS.TUTORIAL}】基本操作の復習【${TERMS.CUSTOM_GATE}】複雑な${TERMS.CIRCUIT}の部品化【${TERMS.TRUTH_TABLE}】${TERMS.CIRCUIT}の動作確認【タイミングチャート】時間的な${TERMS.SIGNAL}変化の可視化`,
    },
  ],
  troubleshooting: [
    {
      question: `🔌 ${TERMS.WIRE}が${TERMS.CONNECTION}できない`,
      answer: `【原因1】方向性エラー: ${TERMS.SIGNAL}は「${TERMS.OUTPUT}→${TERMS.INPUT}」の方向にのみ流れます【原因2】重複${TERMS.CONNECTION}: 1つの${TERMS.INPUT_PIN}には1本の${TERMS.WIRE}のみ${TERMS.CONNECTION}可能【原因3】同一${TERMS.GATE}内${TERMS.CONNECTION}: 同じ${TERMS.GATE}の${TERMS.OUTPUT}と${TERMS.INPUT}は${TERMS.CONNECTION}不可`,
    },
    {
      question: `🔧 ${TERMS.CIRCUIT}が期待通りに動作しない`,
      answer: `【チェック1】未${TERMS.CONNECTION}の${TERMS.PIN}: すべての${TERMS.INPUT_PIN}に${TERMS.SIGNAL}が供給されているか確認【チェック2】${TERMS.LOGIC_OPERATION}の理解: ${TERMS.AND}は「すべて${TERMS.ON}」、${TERMS.OR}は「一つでも${TERMS.ON}」【チェック3】${TERMS.SIGNAL}の流れ: ${TERMS.INPUT}から順序立てて${TERMS.SIGNAL}が流れているか色で確認【チェック4】フィードバックループ: 循環${TERMS.CIRCUIT}になっていないか`,
    },
    {
      question: `🎯 ${TERMS.GATE}を${TERMS.SELECT}・${TERMS.MOVE}できない`,
      answer: `【解決法1】正確な${TERMS.CLICK}: ${TERMS.GATE}の中央部分を${TERMS.CLICK}（${TERMS.PIN}や${TERMS.WIRE}ではなく）【解決法2】重なり問題: 複数の${TERMS.GATE}が重なっている場合は${TERMS.ZOOM}して分離【解決法3】${TERMS.RANGE_SELECT}: ${TERMS.DRAG}で${TERMS.RANGE_SELECT}してからまとめて${TERMS.MOVE}`,
    },
    {
      question: `💾 データの${TERMS.SAVE}・${TERMS.LOAD}問題`,
      answer: `【${TERMS.SAVE}先】ブラウザのローカルストレージ（プライベートモードでは${TERMS.SAVE}されない）【データ消失】ブラウザのキャッシュクリアで消える場合あり。重要な${TERMS.CIRCUIT}は${TERMS.EXPORT}機能でファイル${TERMS.SAVE}を推奨【互換性】異なるブラウザ間ではデータは共有されない`,
    },
    {
      question: `⚡ パフォーマンスが重い`,
      answer: [
        { label: `原因1`, content: `大規模${TERMS.CIRCUIT}: ${TERMS.GATE}数が多すぎる場合は${TERMS.CUSTOM_GATE}で階層化` },
        { label: `原因2`, content: `${TERMS.CLOCK}${TERMS.GATE}多用: 高頻度の${TERMS.CLOCK_SIGNAL}は処理負荷大` },
        { label: `原因3`, content: `無限ループ: フィードバック${TERMS.CIRCUIT}が無限実行` },
        { label: `対策`, content: `ブラウザの再読み込み、または段階的な${TERMS.CIRCUIT}構築` },
      ],
    },
  ],
  features: [
    {
      question: `⚙️ ${TERMS.CUSTOM_GATE}機能`,
      answer: `【${TERMS.CREATE}方法】${TERMS.CREATE}した${TERMS.CIRCUIT}を${TERMS.SELECT}して「${TERMS.CUSTOM_GATE}として${TERMS.SAVE}」【再利用】ツールパレットから通常の${TERMS.GATE}と同様に${TERMS.PLACE}可能【内部回路表示】ツールパレットの${TERMS.CUSTOM_GATE}を${TERMS.DOUBLE_CLICK}で内部回路を表示【${TERMS.TRUTH_TABLE}】ツールパレットで右クリック（macOS: Ctrl+${TERMS.CLICK}）して${TERMS.TRUTH_TABLE}を表示【階層化】複雑な${TERMS.CIRCUIT}を整理し、見通しを向上`,
    },
    {
      question: `⏰ タイミング制御`,
      answer: `【${TERMS.CLOCK}${TERMS.GATE}】1Hz〜20Hzの周波数で定期的に${TERMS.ON}/${TERMS.OFF}【${TERMS.D_FF}${TERMS.GATE}】${TERMS.CLOCK_SIGNAL}の立ち上がりで${TERMS.INPUT}を記憶【${TERMS.SR_LATCH}${TERMS.GATE}】Set/Reset${TERMS.SIGNAL}で状態を制御【シーケンシャル${TERMS.CIRCUIT}】時間的な動作を持つ${TERMS.CIRCUIT}設計が可能`,
    },
    {
      question: `🔄 データの入出力`,
      answer: `【${TERMS.SAVE}/${TERMS.LOAD}】ブラウザローカルストレージに自動${TERMS.SAVE}【${TERMS.EXPORT}】JSONファイルとして${TERMS.CIRCUIT}データを出力【${TERMS.IMPORT}】他の環境で${TERMS.CREATE}した${TERMS.CIRCUIT}を${TERMS.LOAD}【URL共有】${TERMS.CIRCUIT}をURLとして共有可能`,
    },
    {
      question: `📊 解析・検証機能`,
      answer: `【${TERMS.TRUTH_TABLE}】任意の${TERMS.CIRCUIT}の完全な${TERMS.TRUTH_TABLE}を自動生成【${TERMS.SIGNAL}フロー】リアルタイムで${TERMS.SIGNAL}の流れを視覚化【タイミングチャート】時間的な${TERMS.SIGNAL}変化の記録と表示【ビジュアライザー】${TERMS.CIRCUIT}統計とパターン認識`,
    },
    {
      question: `🎓 ${TERMS.LEARNING_MODE}パネル操作`,
      answer: `【移動】ヘッダーを${TERMS.DRAG}【リサイズ】右下角を${TERMS.DRAG}【最小化】―ボタン【復元】▼ボタン【閉じる】×ボタン【Picture-in-Picture】${TERMS.FREE_MODE}と並行学習が可能`,
    },
    {
      question: `📊 ビジュアライザー機能`,
      answer: `【回路統計】${TERMS.GATE}数・${TERMS.WIRE}数・アクティブ${TERMS.GATE}数の表示【パターン認識】回路パターンの自動認識【リアルタイム更新】回路変更に連動した表示更新【${TERMS.GATE}ハイライト】マウスオーバーで${TERMS.GATE}強調【デスクトップ専用】画面右側パネルで利用可能`,
    },
    {
      question: `🚀 今後の実装予定`,
      answer: `【${TERMS.PUZZLE_MODE}】制約付き問題解決モード（開発中）【${TERMS.GALLERY_MODE}】サンプル${TERMS.CIRCUIT}ライブラリ（開発中）【画像エクスポート】PNG・PDF形式での${TERMS.CIRCUIT}図出力（準備中）【コラボレーション】リアルタイム共同編集（計画中）【AI支援】${TERMS.CIRCUIT}設計アシスタント（研究中）`,
    },
  ],
};

export const HelpPanel: React.FC<HelpPanelProps> = ({
  isOpen,
  onClose,
  onOpenLearningMode: _onOpenLearningMode,
  onStartTutorial,
}) => {
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
          .filter(item => {
            const query = searchQuery.toLowerCase();
            const questionMatch = item.question.toLowerCase().includes(query);
            
            let answerMatch = false;
            if (typeof item.answer === 'string') {
              answerMatch = item.answer.toLowerCase().includes(query);
            } else if (Array.isArray(item.answer)) {
              answerMatch = item.answer.some(
                section => 
                  section.label.toLowerCase().includes(query) ||
                  section.content.toLowerCase().includes(query)
              );
            }
            
            return questionMatch || answerMatch;
          })
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
                  {Array.isArray(item.answer) ? (
                    <div className="help-answer-list">
                      {item.answer.map((section, idx) => (
                        <div key={idx} className="help-answer-item">
                          <span className="help-answer-label">【{section.label}】</span>
                          <span className="help-answer-content">{section.content}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    item.answer
                  )}
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
            <p>
              <strong>💡 さらに学ぶには</strong>
            </p>
            <p>
              • <strong>{TERMS.LEARNING_MODE}</strong>：体系的な
              {TERMS.LOGIC_CIRCUIT}学習
            </p>
            <p>
              • <strong>{TERMS.TUTORIAL}</strong>：基本操作の復習
            </p>
            {onStartTutorial && (
              <button
                className="tutorial-start-button"
                onClick={() => {
                  onClose();
                  onStartTutorial();
                }}
              >
                🎯 クイックチュートリアルを開始
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
