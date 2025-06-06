import type { StructuredLesson } from '../../../../types/lesson-content';

export const trafficLightStructuredLesson: StructuredLesson = {
  id: 'traffic-light',
  title: '信号機 - 実用的な制御回路',
  description: '赤・黄・青の信号を自動制御する回路を作ります',
  difficulty: 'advanced',
  prerequisites: ['clock-sync'],
  estimatedMinutes: 30,
  steps: [
    {
      id: 'intro',
      instruction: '街の安全を守る信号機を作ろう！',
      content: [
        {
          type: 'text',
          text: '毎日見ている信号機。その制御回路はどうなっているのでしょうか？',
        },
        {
          type: 'heading',
          text: '🤔 信号機の要件',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🔴 赤：停止',
            '🟡 黄：注意',
            '🟢 青：進行',
            '♻️ 自動的に繰り返し',
          ],
        },
        {
          type: 'text',
          text: '実際の信号機では赤30秒、青27秒、黄3秒などの時間配分がありますが、',
        },
        {
          type: 'note',
          text: '実際の信号機はもっと複雑ですが、基本原理は同じです',
        },
      ],
    },
    {
      id: 'state-machine',
      instruction: '状態遷移の設計',
      content: [
        {
          type: 'heading',
          text: '🔄 3つの状態',
        },
        {
          type: 'text',
          text: '信号機は3つの状態を順番に遷移します：',
        },
        {
          type: 'table',
          headers: ['現在の状態', '次の状態', '条件'],
          rows: [
            ['赤（RED）', '青（GREEN）', '30秒経過'],
            ['青（GREEN）', '黄（YELLOW）', '27秒経過'],
            ['黄（YELLOW）', '赤（RED）', '3秒経過'],
          ],
        },
        {
          type: 'note',
          text: 'これを「有限状態機械（FSM）」と呼びます',
        },
      ],
    },
    {
      id: 'state-encoding',
      instruction: '状態のエンコード',
      content: [
        {
          type: 'heading',
          text: '🔢 2ビットで表現',
        },
        {
          type: 'table',
          headers: ['状態', 'Q1', 'Q0', '赤', '黄', '青'],
          rows: [
            ['RED', '0', '0', '1', '0', '0'],
            ['GREEN', '0', '1', '0', '0', '1'],
            ['YELLOW', '1', '0', '0', '1', '0'],
            ['未使用', '1', '1', '-', '-', '-'],
          ],
        },
        {
          type: 'text',
          text: '2ビットカウンタとデコーダで実現できます！',
        },
      ],
    },
    {
      id: 'timing-design',
      instruction: 'タイミング設計',
      content: [
        {
          type: 'heading',
          text: '⏱️ 時間管理',
        },
        {
          type: 'text',
          text: '異なる点灯時間をどう実現するか？',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '基本クロック：1Hz（1秒）',
            'カウンタで秒数を数える',
            '各状態で異なるカウント値',
            'カウント完了で状態遷移',
          ],
        },
        {
          type: 'note',
          text: '今回は簡略化して、全て同じ時間にします',
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の実装方針',
      content: [
        {
          type: 'text',
          text: '基本動作を理解するための簡易版：',
        },
        {
          type: 'heading',
          text: '📐 構成',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CLOCKゲート（低速）',
            '2ビットカウンタ（状態管理）',
            'デコーダ（LED制御）',
            '3つのOUTPUT（赤・黄・青）',
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: '状態遷移のタイミング',
      content: [
        {
          type: 'text',
          text: 'ゆっくりとした周期で動作します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-counter-dffs',
      instruction: 'カウンタ用D-FFを2個配置',
      hint: '2ビットの状態カウンタ',
      content: [
        {
          type: 'text',
          text: '00→01→10→00を繰り返します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-logic-gates',
      instruction: 'カウンタロジックを配置',
      hint: 'NOT、AND、XORゲートなど',
      content: [
        {
          type: 'text',
          text: 'モジュロ3カウンタを構成します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-decoder-gates',
      instruction: 'デコーダ部分を配置',
      hint: 'AND、NOTゲートで状態デコード',
      content: [
        {
          type: 'text',
          text: '各状態を検出して対応するLEDを点灯。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-outputs',
      instruction: '信号出力を配置',
      hint: '赤・黄・青の3つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '上から赤、黄、青の順に配置。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-counter',
      instruction: '配線：カウンタ部分',
      hint: 'モジュロ3カウンタの配線',
      content: [
        {
          type: 'text',
          text: '11の次は00に戻るよう設計。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-decoder',
      instruction: '配線：デコーダ部分',
      hint: '状態に応じてLEDを選択',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-sequence',
      instruction: 'テスト：信号の順序',
      content: [
        {
          type: 'text',
          text: '赤→青→黄→赤の順に切り替わることを確認',
        },
        {
          type: 'note',
          text: '各色が1つずつ順番に点灯します',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'pedestrian-button',
      instruction: '【発展】歩行者ボタン',
      content: [
        {
          type: 'heading',
          text: '🚶 押しボタン式信号',
        },
        {
          type: 'text',
          text: '歩行者ボタンを追加すると：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'ボタン押下を記憶（SRラッチ）',
            '青信号の時だけ反応',
            '黄→赤→歩行者青の順序',
            '一定時間後に通常サイクルへ',
          ],
        },
      ],
    },
    {
      id: 'sensor-integration',
      instruction: '車両センサー連動',
      content: [
        {
          type: 'heading',
          text: '🚗 感応式信号機',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '車両検知センサー入力',
            '交通量に応じて時間調整',
            '深夜は点滅モード',
            '緊急車両優先制御',
          ],
        },
      ],
    },
    {
      id: 'intersection-control',
      instruction: '交差点制御',
      content: [
        {
          type: 'heading',
          text: '🔀 複雑な交差点',
        },
        {
          type: 'text',
          text: '実際の交差点では：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '東西・南北の協調制御',
            '右折専用信号',
            '歩行者信号の同期',
            'すべて赤の安全時間',
          ],
        },
        {
          type: 'note',
          text: '複数の状態機械が協調動作します',
        },
      ],
    },
    {
      id: 'network-control',
      instruction: 'ネットワーク制御',
      content: [
        {
          type: 'heading',
          text: '🌐 広域交通管制',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '中央管制センター',
            'グリーンウェーブ（連続青信号）',
            '渋滞検知と動的制御',
            'AI による最適化',
          ],
        },
      ],
    },
    {
      id: 'safety-features',
      instruction: '安全機能',
      content: [
        {
          type: 'heading',
          text: '🛡️ フェイルセーフ',
        },
        {
          type: 'text',
          text: '故障時の安全確保：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '競合防止（同時青を回避）',
            '故障検知で全赤点滅',
            'バックアップ電源',
            'ウォッチドッグタイマー',
          ],
        },
      ],
    },
    {
      id: 'led-technology',
      instruction: 'LED信号機の利点',
      content: [
        {
          type: 'heading',
          text: '💡 最新技術',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🔋 省電力（90%削減）',
            '⏳ 長寿命（10年以上）',
            '☀️ 高視認性',
            '❄️ 発熱が少ない（雪が積もらない）',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】信号制御の応用',
      content: [
        {
          type: 'heading',
          text: '💻 他の制御システム',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🚂 鉄道信号システム',
            '✈️ 空港の誘導灯',
            '🏭 工場の工程管理',
            '🎢 遊園地のアトラクション',
            '🚨 緊急避難誘導',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 信号機マスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 状態機械の設計',
            '✅ タイミング制御',
            '✅ 安全性を考慮した設計',
            '✅ 実用システムの構築',
          ],
        },
        {
          type: 'note',
          text: '身近な機器の仕組みが理解できました！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '信号機で最も重要な安全機能は？',
          options: [
            'LEDの明るさ',
            '同時に青にならない制御',
            '消費電力の削減',
            'デザイン性',
          ],
          correctIndex: 1,
        },
      ],
    },
  ],
};
