import type { StructuredLesson } from '../../../../types/lesson-content';

export const counterStructuredLesson: StructuredLesson = {
  id: 'counter',
  title: 'カウンタ - 数を数える回路',
  description: 'クロックに同期して自動的にカウントアップする回路を作ります',
  difficulty: 'advanced',
  prerequisites: ['sr-latch'],
  estimatedMinutes: 25,
  availableGates: ['OUTPUT', 'CLOCK', 'D-FF'],
  steps: [
    {
      id: 'intro',
      instruction: '自動的に数を数える回路を作ろう！',
      content: [
        {
          type: 'text',
          text: '時計、タイマー、ゲームのスコア...どれも「数を数える」必要があります。',
        },
        {
          type: 'heading',
          text: '🤔 カウンタとは？',
        },
        {
          type: 'text',
          text: 'クロックパルスを数えて、その数を2進数で出力する順序回路です。',
        },
        {
          type: 'note',
          text: '0→1→2→3→0... と自動的に繰り返します',
        },
      ],
    },
    {
      id: 'counter-types',
      instruction: 'カウンタの種類',
      content: [
        {
          type: 'heading',
          text: '📊 基本的な分類',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🔢 バイナリカウンタ：2進数で数える（0,1,10,11...）',
            '🔟 デケードカウンタ：10進数で数える（0〜9）',
            '⬆️ アップカウンタ：増加方向',
            '⬇️ ダウンカウンタ：減少方向',
          ],
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
        },
        {
          type: 'text',
          text: '2ビットバイナリアップカウンタ（0→1→2→3→0）',
        },
      ],
    },
    {
      id: 'ripple-counter',
      instruction: 'リップルカウンタの原理',
      content: [
        {
          type: 'heading',
          text: '🌊 波及的な動作',
        },
        {
          type: 'text',
          text: 'T型フリップフロップ（Toggle FF）を連結：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '1段目：CLKで毎回反転（÷2）',
            '2段目：1段目の出力で反転（÷4）',
            '3段目：2段目の出力で反転（÷8）',
          ],
        },
        {
          type: 'note',
          text: '各段が前段の半分の速度で動作します',
        },
      ],
    },
    {
      id: 't-flip-flop',
      instruction: 'T型フリップフロップ',
      content: [
        {
          type: 'heading',
          text: '🔀 トグル動作',
        },
        {
          type: 'text',
          text: 'T-FFはクロックの立ち上がりで出力が反転します：',
        },
        {
          type: 'table',
          headers: ['CLK', 'Q（前）', 'Q（後）'],
          rows: [
            ['↑', '0', '1'],
            ['↑', '1', '0'],
            ['0', 'Q', 'Q（保持）'],
          ],
        },
        {
          type: 'note',
          text: "D-FFでT-FFを作る：DにQ'を接続！",
        },
      ],
    },
    {
      id: 'counting-sequence',
      instruction: 'カウント動作の流れ',
      content: [
        {
          type: 'heading',
          text: '📈 2ビットカウンタの動作',
        },
        {
          type: 'table',
          headers: ['CLK', 'Q1', 'Q0', '10進数'],
          rows: [
            ['0', '0', '0', '0'],
            ['1↑', '0', '1', '1'],
            ['2↑', '1', '0', '2'],
            ['3↑', '1', '1', '3'],
            ['4↑', '0', '0', '0（リセット）'],
          ],
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の実装方針',
      content: [
        {
          type: 'text',
          text: 'T-FFの代わりにD-FFを使って構築します。',
        },
        {
          type: 'heading',
          text: '🔧 必要な接続',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            "各D-FFのDにQ'を接続（トグル動作）",
            '1段目のCLKに外部クロック',
            "2段目のCLKに1段目のQ'",
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: 'カウントの基準となるクロック信号',
      content: [
        {
          type: 'text',
          text: 'これがカウントのペースメーカーです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-first-dff',
      instruction: '1段目のD-FFを配置',
      hint: '最下位ビット（Q0）用',
      content: [
        {
          type: 'text',
          text: 'CLKごとに0と1を交互に出力します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-second-dff',
      instruction: '2段目のD-FFを配置',
      hint: '上位ビット（Q1）用',
      content: [
        {
          type: 'text',
          text: 'Q0が1→0になるたびに反転します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: '出力表示を配置',
      hint: 'Q1（上位）とQ0（下位）の2つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '2ビットで00〜11（0〜3）を表示します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-toggle-1',
      instruction: '配線：1段目のトグル接続',
      hint: "1段目D-FFのQ'をDに接続（自己反転）",
      content: [
        {
          type: 'text',
          text: 'これでT-FFと同じ動作になります。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-clock-1',
      instruction: '配線：1段目のクロック',
      hint: 'CLOCKを1段目D-FFのCLKに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-toggle-2',
      instruction: '配線：2段目のトグル接続',
      hint: "2段目D-FFのQ'をDに接続",
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-cascade',
      instruction: '配線：段間の接続',
      hint: "1段目のQ'を2段目のCLKに接続",
      content: [
        {
          type: 'text',
          text: 'Q0が1→0になるときQ1が反転します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：出力表示',
      hint: '各D-FFのQを対応するOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-counting',
      instruction: 'テスト：カウント動作',
      content: [
        {
          type: 'text',
          text: 'CLOCKの動作を観察して、00→01→10→11→00の順に変化することを確認',
        },
        {
          type: 'note',
          text: '上位ビットは下位ビットの半分の速度で変化します',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'frequency-division',
      instruction: '【応用】分周器として',
      content: [
        {
          type: 'heading',
          text: '🎛️ 周波数分割',
        },
        {
          type: 'text',
          text: 'カウンタは周波数を分割する用途にも使えます：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Q0：CLKの1/2の周波数',
            'Q1：CLKの1/4の周波数',
            'Q2：CLKの1/8の周波数',
          ],
        },
        {
          type: 'note',
          text: '時計の1秒を作るのに使われます（32.768kHz÷32768=1Hz）',
        },
      ],
    },
    {
      id: 'synchronous-counter',
      instruction: '【発展】同期式カウンタ',
      content: [
        {
          type: 'heading',
          text: '⚡ より高速な設計',
        },
        {
          type: 'text',
          text: 'リップルカウンタの欠点：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['遅延が累積する', '高速動作に不向き', '一時的に誤った値'],
        },
        {
          type: 'text',
          text: '同期式なら全ビット同時更新！',
        },
      ],
    },
    {
      id: 'modulo-counter',
      instruction: 'モジュロカウンタ',
      content: [
        {
          type: 'heading',
          text: '🔟 10進カウンタ',
        },
        {
          type: 'text',
          text: '0〜9でリセットするカウンタ：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['1010（10）を検出', 'リセット信号を生成', '0000に戻る'],
        },
        {
          type: 'note',
          text: 'デジタル時計の各桁はこの原理です',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】カウンタの活用例',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '⏱️ タイマー・ストップウォッチ',
            '🎮 ゲームのスコア表示',
            '📊 イベントカウント（人数、車両）',
            '🎵 音楽のテンポ生成',
            '💾 メモリアドレス生成',
            '🚦 信号機のタイミング制御',
          ],
        },
      ],
    },
    {
      id: 'prescaler',
      instruction: 'プリスケーラ',
      content: [
        {
          type: 'heading',
          text: '🎚️ 大きな分周比',
        },
        {
          type: 'text',
          text: '高速クロックから低速信号を作る：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['16MHzクロック', '÷16000000', '1Hz（1秒）信号'],
        },
        {
          type: 'note',
          text: '24ビットカウンタで実現可能',
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 カウンタマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 自動カウント回路の構築',
            '✅ FFの連鎖接続',
            '✅ 分周器の原理',
            '✅ デジタル計数システム',
          ],
        },
        {
          type: 'note',
          text: 'これで時間や回数を数えられます！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '3ビットバイナリカウンタの最大値は？',
          options: ['3', '7', '8', '15'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
