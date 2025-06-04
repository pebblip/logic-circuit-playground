import React, { useState } from 'react';
import './HelpPanel.css';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId =
  | 'quickstart'
  | 'getting-started'
  | 'troubleshooting'
  | 'features'
  | 'modes';

interface HelpContent {
  question: string;
  answer: string;
}

const helpContents: Record<TabId, HelpContent[]> = {
  quickstart: [
    {
      question: 'ステップ 1: INPUTゲートを配置',
      answer:
        '左のツールパレットからINPUTゲートをドラッグしてキャンバスに配置してください。赤い四角のゲートです。',
    },
    {
      question: 'ステップ 2: OUTPUTゲートを配置',
      answer:
        '同じようにOUTPUTゲートを配置しましょう。緑色の丸いゲートです。INPUTより少し右に置くと良いでしょう。',
    },
    {
      question: 'ステップ 3: ワイヤーで接続',
      answer:
        'INPUTゲートの右側のピン（出力）をクリックし、次にOUTPUTゲートの左側のピン（入力）をクリックして接続しましょう。',
    },
    {
      question: 'ステップ 4: INPUTをテスト',
      answer:
        'INPUTゲートをクリックするとON/OFFが切り替わります。OUTPUTゲートの色が連動して変わることを確認してください。',
    },
    {
      question: 'ステップ 5: ANDゲートで実験',
      answer:
        '今度はANDゲートを追加してみましょう。INPUTを2つ、ANDゲートを1つ、OUTPUTを1つ配置して接続し、両方のINPUTがONの時だけOUTPUTがONになることを確認してください。',
    },
    {
      question: 'おめでとうございます！',
      answer:
        '基本操作をマスターしました！これでさらに複雑な回路を作成できます。学習モードでさらに詳しく学ぶこともできます。',
    },
  ],
  'getting-started': [
    {
      question: '基本的な使い方は？',
      answer:
        '左のツールパレットからゲートをドラッグ&ドロップしてキャンバスに配置します。ゲートのピンをクリックしてワイヤーで接続し、論理回路を構築します。',
    },
    {
      question: 'ゲートの配置方法は？',
      answer:
        'ツールパレットからゲートをドラッグしてキャンバスにドロップします。配置後はゲートをクリックして選択し、ドラッグで移動できます。',
    },
    {
      question: 'ワイヤーの接続方法は？',
      answer:
        'ゲートの出力ピン（右側）をクリックしてから、別のゲートの入力ピン（左側）をクリックします。Escキーで接続をキャンセルできます。',
    },
    {
      question: 'ゲートの削除方法は？',
      answer:
        'ゲートを選択してDeleteキーまたはBackspaceキーを押します。複数選択の場合はまとめて削除できます。',
    },
    {
      question: '入力の切り替え方法は？',
      answer:
        'INPUTゲートをクリックすると、ON/OFFが切り替わります。緑色がON、赤色がOFFを表します。',
    },
    {
      question: 'キャンバスの移動（パン）方法は？',
      answer:
        'スペースキーを押しながらドラッグ、中クリックでドラッグ、またはCtrl+左クリックでドラッグすることでキャンバスを移動できます。',
    },
    {
      question: '範囲選択と移動方法は？',
      answer:
        'キャンバスの背景をドラッグして範囲選択できます。選択されたゲート群は、選択範囲内のゲートをドラッグすることでまとめて移動できます。',
    },
  ],
  troubleshooting: [
    {
      question: 'ワイヤーが接続できない',
      answer:
        '出力ピンから入力ピンへの接続のみ可能です。また、1つの入力ピンには1本のワイヤーしか接続できません。',
    },
    {
      question: 'ゲートが動かない',
      answer:
        'ゲートが選択されていることを確認してください。選択されたゲートは枠線が表示されます。',
    },
    {
      question: '回路が正しく動作しない',
      answer:
        '全ての必要な接続が完了しているか確認してください。接続されていないピンがある場合、回路は正しく動作しません。',
    },
    {
      question: 'キャンバスが動かない',
      answer:
        'スペースキーを押しながらドラッグするか、マウスの中ボタンでパンできます。タッチデバイスでは指でドラッグします。',
    },
    {
      question: '保存した回路が見つからない',
      answer:
        '「開く」ボタンから保存した回路の一覧を確認できます。ブラウザのローカルストレージに保存されています。',
    },
  ],
  features: [
    {
      question: 'コピー&ペースト',
      answer:
        'ゲートを選択してCtrl+C（Mac: Cmd+C）でコピー、Ctrl+V（Mac: Cmd+V）でペーストできます。複数選択も可能です。',
    },
    {
      question: '複数選択',
      answer:
        'Shiftキーを押しながらゲートをクリックするか、ドラッグで矩形選択できます。選択したゲートはまとめて移動・削除できます。',
    },
    {
      question: 'ズーム機能',
      answer:
        'マウスホイールでズーム、右下のズームボタンでも調整可能です。100%ボタンでリセットできます。',
    },
    {
      question: 'カスタムゲート',
      answer:
        '作成した回路を新しいゲートとして保存し、再利用できます。プロパティパネルから「カスタムゲートとして保存」を選択してください。',
    },
    {
      question: 'クロックゲート',
      answer:
        'CLOCKゲートは一定間隔でON/OFFを繰り返します。周波数はプロパティパネルで調整できます。',
    },
  ],
  modes: [
    {
      question: '学習モードとは？',
      answer:
        '基本的な論理ゲートの使い方から複雑な回路まで、段階的に学べるモードです。レッスンに従って進めましょう。',
    },
    {
      question: '自由制作モードとは？',
      answer:
        '自由に回路を設計できるモードです。全てのゲートが使用可能で、カスタムゲートの作成もできます。',
    },
    {
      question: 'パズルモード（準備中）',
      answer:
        '与えられた条件を満たす回路を作成するチャレンジモードです。論理的思考力を鍛えることができます。',
    },
    {
      question: 'モードの切り替え',
      answer:
        'ヘッダーのタブから学習モードと自由制作モードを切り替えられます。作業中の回路は保存してから切り替えることをお勧めします。',
    },
  ],
};

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('getting-started');
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
          <h2>❓ ヘルプ</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
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
              className={`help-tab ${activeTab === 'quickstart' ? 'active' : ''}`}
              onClick={() => setActiveTab('quickstart')}
            >
              🚀 クイックスタート
            </button>
            <button
              className={`help-tab ${activeTab === 'getting-started' ? 'active' : ''}`}
              onClick={() => setActiveTab('getting-started')}
            >
              始め方
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
            <button
              className={`help-tab ${activeTab === 'modes' ? 'active' : ''}`}
              onClick={() => setActiveTab('modes')}
            >
              モード
            </button>
          </div>
        )}

        <div className="help-content">
          {/* クイックスタート専用の進行状況バー */}
          {!searchQuery && activeTab === 'quickstart' && (
            <div className="quickstart-progress">
              <div
                className="quickstart-progress-bar"
                style={{
                  width: `${(expandedItems.size / helpContents.quickstart.length) * 100}%`,
                }}
              />
            </div>
          )}

          {searchQuery && filteredContent.length === 0 && (
            <div className="no-results">
              「{searchQuery}」に関する項目が見つかりませんでした
            </div>
          )}

          {filteredContent.map((item, index) => (
            <div
              key={index}
              className={`help-item ${!searchQuery && activeTab === 'quickstart' ? 'quickstart-step' : ''}`}
              data-step={
                !searchQuery && activeTab === 'quickstart'
                  ? index + 1
                  : undefined
              }
            >
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
                      {item.tabId === 'quickstart'
                        ? 'クイックスタート'
                        : item.tabId === 'getting-started'
                          ? '始め方'
                          : item.tabId === 'troubleshooting'
                            ? '困ったとき'
                            : item.tabId === 'features'
                              ? '便利機能'
                              : 'モード'}
                      )
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="help-footer">
          <p>
            さらに詳しい情報は
            <a
              href="https://github.com/your-repo/logic-circuit-playground/wiki"
              target="_blank"
              rel="noopener noreferrer"
            >
              オンラインドキュメント
            </a>
            をご覧ください
          </p>
        </div>
      </div>
    </div>
  );
};
