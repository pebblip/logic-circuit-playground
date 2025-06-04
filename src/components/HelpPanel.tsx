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
      question: '📌 ステップ 1: 基本操作を理解する',
      answer:
        '左のツールパレットからゲートをドラッグ&ドロップでキャンバスに配置します。ゲートは論理回路の基本構成要素で、入力に応じて出力を決定する「判断装置」です。まずはINPUT（スイッチ）とOUTPUT（LED）を配置してみましょう。',
    },
    {
      question: '🔌 ステップ 2: 信号の流れを作る',
      answer:
        'ゲートのピン（接続点）をクリックして接続を開始し、別のピンをクリックして完了します。信号は必ず「出力ピン→入力ピン」の方向に流れます。右側が出力、左側が入力という基本ルールを覚えましょう。',
    },
    {
      question: '🧪 ステップ 3: 論理動作を体験する',
      answer:
        'ANDゲート（論理積）を配置し、2つのINPUTを接続してみましょう。ANDは「すべての入力がONの時だけON」という厳格な判断をします。これは「条件A かつ 条件B」という日常的な判断と同じです。',
    },
    {
      question: '🔄 ステップ 4: 組み合わせを試す',
      answer:
        'ORゲート（論理和）は「どれか一つでもONならON」という寛容な判断をします。NOTゲート（否定）は「逆転」の魔法です。これらを組み合わせることで、複雑な判断ロジックを構築できます。',
    },
    {
      question: '⚡ ステップ 5: 特殊ゲートを活用する',
      answer:
        'CLOCKゲートは一定間隔でON/OFFを繰り返す「心臓」です。D-FFやSR-LATCHは「記憶」を持つゲートで、過去の状態を覚えています。これらを使うと、カウンタや信号機のような動的な回路が作れます。',
    },
    {
      question: '🎯 次のステップへ',
      answer:
        '基本がわかったら、学習モードで体系的に学ぶか、自由制作モードで創造性を発揮しましょう。論理回路は現代のコンピュータの基礎です。ここから始まる冒険を楽しんでください！',
    },
  ],
  'getting-started': [
    {
      question: '🎓 論理回路とは何か？',
      answer:
        '論理回路は「0」と「1」（OFF/ON）の2つの状態を使って情報を処理する電子回路です。コンピュータのCPUから家電製品まで、あらゆるデジタル機器の基礎となっています。このツールでは、視覚的に論理回路を構築し、その動作原理を直感的に学べます。',
    },
    {
      question: '🏗️ 回路を構築する基本手順',
      answer:
        '1. ツールパレットからゲートを選択してドラッグ&ドロップ\n2. 配置したゲートのピンをクリックして接続（出力→入力の順）\n3. INPUTゲートで信号を制御し、OUTPUTゲートで結果を確認\n4. 複雑な回路は小さな部分から組み立て、段階的に拡張していく',
    },
    {
      question: '🔍 ゲートの種類と役割',
      answer:
        '• 基本ゲート（AND/OR/NOT）: 論理演算の基礎\n• 複合ゲート（XOR/NAND/NOR）: 効率的な回路設計\n• 記憶素子（D-FF/SR-LATCH）: 状態を保持する機能\n• 特殊ゲート（CLOCK/MUX）: タイミング制御や信号選択\n• カスタムゲート: 自作回路を部品化して再利用',
    },
    {
      question: '⚡ 信号の流れを理解する',
      answer:
        '信号は「源流」から「下流」へ流れます。INPUTが源流、OUTPUTが終点です。信号の色で状態を表現：緑＝ON（1）、グレー＝OFF（0）。接続線も同様に色が変化し、リアルタイムで信号の伝播を視覚化します。',
    },
    {
      question: '🎨 効率的な操作テクニック',
      answer:
        '• Shift+クリック: 複数選択\n• ドラッグ: 範囲選択\n• Delete/Backspace: 削除\n• スペース+ドラッグ: キャンバス移動\n• マウスホイール: ズーム\n• Ctrl+C/V: コピー&ペースト',
    },
    {
      question: '📐 きれいな回路を作るコツ',
      answer:
        '1. 信号の流れを左から右へ統一\n2. ゲートを整列させて配置\n3. 交差する配線を最小限に\n4. 機能ごとにグループ化\n5. 適切な間隔を保つ\n6. カスタムゲートで階層化',
    },
    {
      question: '🚀 次のレベルへ',
      answer:
        '基本操作に慣れたら、より高度な回路に挑戦しましょう。加算器、カウンタ、信号機制御、そして最終的にはCPUの基本構造まで。論理回路の世界は奥深く、創造性次第で無限の可能性があります。',
    },
  ],
  troubleshooting: [
    {
      question: '🔌 ワイヤーが接続できない問題',
      answer:
        '【原因1】方向性エラー: 信号は「出力→入力」の方向にしか流れません。右側のピン（出力）から左側のピン（入力）へ接続してください。\n【原因2】重複接続: 1つの入力ピンには1本のワイヤーしか接続できません。既存の接続を削除してから再接続してください。\n【原因3】同じゲート内接続: 同じゲートの出力と入力は接続できません。',
    },
    {
      question: '🔧 回路が期待通りに動作しない',
      answer:
        '【チェック1】未接続のピン: すべての入力ピンに信号が供給されているか確認\n【チェック2】論理の理解: ANDは「すべてON」、ORは「一つでもON」など、各ゲートの動作を再確認\n【チェック3】信号の伝播: INPUTから始まって、順序立てて信号が流れているか色で確認\n【チェック4】フィードバックループ: 循環回路になっていないか',
    },
    {
      question: '🎯 ゲートを選択・移動できない',
      answer:
        '【解決法1】正確なクリック: ゲートの中央部分をクリックしてください。ピンやワイヤーではなく、ゲート本体を狙います。\n【解決法2】重なり問題: 複数のゲートが重なっている場合は、一度ズームして分離してください。\n【解決法3】範囲選択: ドラッグで範囲選択してから、選択されたゲートをまとめて移動できます。',
    },
    {
      question: '📱 タッチデバイスでの操作問題',
      answer:
        '【タップ操作】短いタップでゲート選択、長押しでコンテキストメニュー\n【ピンチ操作】2本指でズーム、1本指ドラッグでパン\n【接続操作】ピンを正確にタップ、画面が小さい場合はズームしてから操作\n【推奨設定】縦向きより横向きでの使用がお勧めです。',
    },
    {
      question: '💾 データの保存・読み込み問題',
      answer:
        '【保存先】ブラウザのローカルストレージに保存されます。プライベートモードでは保存されません。\n【データ消失】ブラウザのキャッシュクリアで消える場合があります。重要な回路はエクスポート機能でファイル保存を推奨。\n【互換性】異なるブラウザ間ではデータは共有されません。',
    },
    {
      question: '⚡ パフォーマンスが重い場合',
      answer:
        '【原因1】大規模回路: ゲート数が多すぎる場合は、カスタムゲートで階層化\n【原因2】CLOCKゲート多用: 高頻度のクロック信号は処理負荷大。周波数を下げる\n【原因3】無限ループ: フィードバック回路が無限実行されている可能性\n【対策】ブラウザの再読み込み、または段階的な回路構築',
    },
  ],
  features: [
    {
      question: '🎨 高度な編集機能',
      answer:
        '【コピー&ペースト】Ctrl+C/V（Mac: Cmd+C/V）で回路の一部を複製\n【複数選択】Shift+クリックまたはドラッグで範囲選択\n【整列機能】選択したゲートを自動的に整列（準備中）\n【元に戻す/やり直し】Ctrl+Z/Y（Mac: Cmd+Z/Y）で操作履歴を管理',
    },
    {
      question: '🔍 表示とナビゲーション',
      answer:
        '【ズーム機能】マウスホイール、+/-キー、ズームボタンで拡大縮小\n【パン機能】スペース+ドラッグ、中クリックドラッグでキャンバス移動\n【全体表示】回路全体を画面内に収める表示機能\n【グリッド表示】整列を助けるグリッド線（設定で切り替え可能）',
    },
    {
      question: '⚙️ カスタムゲート機能',
      answer:
        '【作成方法】作成した回路を選択して「カスタムゲートとして保存」\n【再利用】ツールパレットから通常のゲートと同様に配置可能\n【階層化】複雑な回路を整理し、見通しを良くする\n【真理値表】カスタムゲートも自動的に真理値表を生成\n【アイコン設定】絵文字でカスタムゲートを分かりやすく表示',
    },
    {
      question: '⏰ タイミング制御',
      answer:
        '【CLOCKゲート】1Hz〜10Hzの周波数で定期的にON/OFF\n【D-FFゲート】クロック信号の立ち上がりで入力を記憶\n【SR-LATCHゲート】Set/Reset信号で状態を制御\n【シーケンシャル回路】時間的な動作を持つ回路設計が可能',
    },
    {
      question: '🔄 データの入出力',
      answer:
        '【保存/読み込み】ブラウザローカルストレージに自動保存\n【エクスポート】JSONファイルとして回路データを出力\n【インポート】他の環境で作成した回路を読み込み\n【URL共有】回路をURLとして共有（準備中）\n【画像出力】回路図をPNG画像として出力（準備中）',
    },
    {
      question: '📊 解析・検証機能',
      answer:
        '【真理値表】任意の回路の完全な真理値表を自動生成\n【信号フロー】リアルタイムで信号の流れを視覚化\n【回路検証】論理エラーや接続問題を自動チェック（準備中）\n【パフォーマンス計測】ゲート数、遅延時間等の回路特性を表示（準備中）',
    },
  ],
  modes: [
    {
      question: '🎓 学習モード：体系的な学習',
      answer:
        '【対象】論理回路初心者から中級者\n【内容】基本的な論理ゲートから始まり、フリップフロップ、カウンタ、最終的にはCPUの基本構造まで\n【特徴】段階的なカリキュラム、インタラクティブな説明、進捗管理\n【レッスン例】AND/ORの理解→半加算器→全加算器→カウンタ→簡易CPU\n【推奨】論理回路を体系的に学びたい方、基礎を固めたい方',
    },
    {
      question: '🎨 自由制作モード：創造的な実験',
      answer:
        '【対象】創造性を発揮したい方、独自のアイデアを試したい方\n【制限】なし（全ゲート利用可能、カスタムゲート作成可能）\n【用途】オリジナル回路の設計、課題の解決、アイデアの検証\n【活用例】信号機制御システム、電卓回路、ゲーム機の論理部分\n【推奨】基本を理解した方、実際の問題解決に挑戦したい方',
    },
    {
      question: '🧩 パズルモード：挑戦と成長（準備中）',
      answer:
        '【対象】論理的思考力を鍛えたい方、ゲーム感覚で学習したい方\n【内容】与えられた条件（入出力関係）を満たす最小回路を設計\n【レベル】初級（基本ゲートのみ）→中級（記憶素子使用）→上級（効率性重視）\n【評価基準】ゲート数、配線数、実行速度での最適化競争\n【予定機能】ランキング、ヒント機能、解法解説',
    },
    {
      question: '📚 ギャラリーモード：作品鑑賞と学習（準備中）',
      answer:
        '【目的】他の人の作品から学習、インスピレーション獲得\n【コンテンツ】教育的な回路例、美しい回路デザイン、実用的なサンプル\n【カテゴリ】基本回路、応用回路、アート作品、実用回路\n【機能】作品のダウンロード、改造、コメント投稿\n【将来性】コミュニティ機能、作品投稿、評価システム',
    },
    {
      question: '🔄 モード切り替えのベストプラクティス',
      answer:
        '【保存必須】モード切り替え前に必ず回路を保存\n【学習順序】学習モード→自由制作モード→パズルモードの順がお勧め\n【データ共有】各モードで作成した回路は相互に活用可能\n【組み合わせ】学習で得た知識を自由制作で実践、パズルで洗練\n【長期計画】各モードを行き来しながら、継続的にスキルアップ',
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
