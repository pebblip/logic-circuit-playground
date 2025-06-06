import type { StructuredLesson } from '../../../../types/lesson-content';

export const decoderStructuredLesson: StructuredLesson = {
  id: 'decoder',
  title: 'デコーダ - 信号の解読装置',
  description: 'バイナリコードから特定の出力を選択する回路を作ります',
  difficulty: 'intermediate',
  prerequisites: ['encoder'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: 'コードを解読して正しい出力を選ぼう！',
      content: [
        {
          type: 'text',
          text: '2ビットのコードから、4つのLEDのうち1つだけを光らせるには？',
        },
        {
          type: 'heading',
          text: '🤔 デコーダとは？',
        },
        {
          type: 'text',
          text: 'エンコーダの逆！バイナリコードを「どれか1つの出力」に変換します。',
        },
        {
          type: 'note',
          text: '例：2ビット（00〜11） → 4つの出力のうち1つがON',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '2-to-4デコーダの仕組み',
      content: [
        {
          type: 'heading',
          text: '📊 真理値表',
        },
        {
          type: 'table',
          headers: ['A1', 'A0', 'Y0', 'Y1', 'Y2', 'Y3'],
          rows: [
            ['0', '0', '1', '0', '0', '0'],
            ['0', '1', '0', '1', '0', '0'],
            ['1', '0', '0', '0', '1', '0'],
            ['1', '1', '0', '0', '0', '1'],
          ],
        },
        {
          type: 'text',
          text: '入力コードに対応する出力だけが1になります。',
        },
      ],
    },
    {
      id: 'logic-analysis',
      instruction: '論理回路の分析',
      content: [
        {
          type: 'heading',
          text: '🔧 各出力の条件',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Y0 = NOT(A1) AND NOT(A0)（00のとき）',
            'Y1 = NOT(A1) AND A0（01のとき）',
            'Y2 = A1 AND NOT(A0)（10のとき）',
            'Y3 = A1 AND A0（11のとき）',
          ],
        },
        {
          type: 'note',
          text: '各出力は特定の入力パターンを検出するAND回路！',
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: '2ビット入力を配置',
      hint: 'A1（上位）とA0（下位）の2つのINPUT',
      content: [
        {
          type: 'text',
          text: '2ビットで4つの状態（00, 01, 10, 11）を表現します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-not-gates',
      instruction: 'NOTゲートを配置',
      hint: 'A1とA0の反転信号用に2つのNOT',
      content: [
        {
          type: 'text',
          text: '各入力の反転信号も必要です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-and-gates',
      instruction: 'ANDゲートを4つ配置',
      hint: '各出力の条件検出用に4つのAND',
      content: [
        {
          type: 'text',
          text: '各ANDゲートが特定のパターンを検出します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-outputs',
      instruction: '4つの出力を配置',
      hint: 'Y0, Y1, Y2, Y3の4つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '一度に1つだけが点灯します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-inverters',
      instruction: '配線：反転信号の生成',
      hint: 'A1とA0をそれぞれNOTゲートに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-y0',
      instruction: '配線：Y0（00検出）',
      hint: 'NOT(A1)とNOT(A0)を1つ目のANDに接続',
      content: [
        {
          type: 'text',
          text: 'A1=0かつA0=0のときだけY0=1',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-y1',
      instruction: '配線：Y1（01検出）',
      hint: 'NOT(A1)とA0を2つ目のANDに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-y2',
      instruction: '配線：Y2（10検出）',
      hint: 'A1とNOT(A0)を3つ目のANDに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-y3',
      instruction: '配線：Y3（11検出）',
      hint: 'A1とA0を4つ目のANDに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-00',
      instruction: 'テスト1：入力00',
      content: [
        {
          type: 'text',
          text: 'A1=0, A0=0で、Y0だけが点灯することを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-01',
      instruction: 'テスト2：入力01',
      content: [
        {
          type: 'text',
          text: 'A1=0, A0=1で、Y1だけが点灯することを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-10',
      instruction: 'テスト3：入力10',
      content: [
        {
          type: 'text',
          text: 'A1=1, A0=0で、Y2だけが点灯することを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-11',
      instruction: 'テスト4：入力11',
      content: [
        {
          type: 'text',
          text: 'A1=1, A0=1で、Y3だけが点灯することを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'enable-signal',
      instruction: '【発展】イネーブル信号',
      content: [
        {
          type: 'heading',
          text: '🎛️ デコーダのON/OFF制御',
        },
        {
          type: 'text',
          text: 'Enable（イネーブル）信号を追加すると...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Enable=1：通常動作',
            'Enable=0：全出力OFF',
            '複数デコーダの切り替えが可能',
          ],
        },
        {
          type: 'note',
          text: 'メモリチップの選択などに使用されます',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】デコーダの実用例',
      content: [
        {
          type: 'heading',
          text: '💻 身近な使用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📟 7セグメントディスプレイ：数字の表示',
            '💾 メモリアドレスデコーダ：特定のメモリセル選択',
            '🚦 信号制御：複数の信号から1つを選択',
            '🎮 ゲーム機：コントローラ入力の解釈',
            '🏢 エレベータ：階数ボタンの処理',
          ],
        },
      ],
    },
    {
      id: 'seven-segment',
      instruction: '7セグメントデコーダ',
      content: [
        {
          type: 'heading',
          text: '🔢 数字表示の仕組み',
        },
        {
          type: 'text',
          text: '4ビット入力 → 7つのLEDセグメントを制御',
        },
        {
          type: 'table',
          headers: ['数字', '入力', 'a', 'b', 'c', 'd', 'e', 'f', 'g'],
          rows: [
            ['0', '0000', '1', '1', '1', '1', '1', '1', '0'],
            ['1', '0001', '0', '1', '1', '0', '0', '0', '0'],
            ['8', '1000', '1', '1', '1', '1', '1', '1', '1'],
          ],
        },
        {
          type: 'note',
          text: '電卓や時計の数字表示はこの原理です！',
        },
      ],
    },
    {
      id: 'multiplexing',
      instruction: 'マルチプレクシング',
      content: [
        {
          type: 'heading',
          text: '🔄 時分割制御',
        },
        {
          type: 'text',
          text: 'デコーダを高速で切り替えることで...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '複数の表示を少ない配線で制御',
            '人間の目には同時点灯に見える',
            '省エネ・省配線を実現',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 デコーダマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ バイナリコードの解読',
            '✅ 選択的出力制御',
            '✅ パターン検出回路の構築',
            '✅ デジタル表示システムの基礎',
          ],
        },
        {
          type: 'note',
          text: 'エンコーダとデコーダで双方向変換が可能に！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '3-to-8デコーダの出力数は？',
          options: ['3個', '6個', '8個', '16個'],
          correctIndex: 2,
        },
      ],
    },
  ],
};
