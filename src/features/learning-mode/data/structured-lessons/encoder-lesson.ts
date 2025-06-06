import type { StructuredLesson } from '../../../../types/lesson-content';

export const encoderStructuredLesson: StructuredLesson = {
  id: 'encoder',
  title: 'エンコーダ - 信号の暗号化装置',
  description: '複数の入力から対応するコードを生成する回路を作ります',
  icon: '🔐',
  difficulty: 'intermediate',
  prerequisites: ['comparator'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: '情報を効率的にコード化しよう！',
      content: [
        {
          type: 'text',
          text: '10個のボタンがあるキーボードから、4ビットのコードを生成するには？',
        },
        {
          type: 'heading',
          text: '🤔 エンコーダとは？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: '「どのボタンが押されたか」を「バイナリコード」に変換する装置です。',
        },
        {
          type: 'note',
          text: '例：0〜9の数字キー → 4ビット（0000〜1001）に変換',
          icon: '📱',
        },
      ],
    },
    {
      id: 'concept',
      instruction: 'エンコーダの基本原理',
      content: [
        {
          type: 'heading',
          text: '🎯 4-to-2エンコーダ',
          icon: '🎯',
        },
        {
          type: 'text',
          text: '4つの入力（I0〜I3）から2ビットのコード（Y1,Y0）を生成',
        },
        {
          type: 'table',
          headers: ['入力', 'I3', 'I2', 'I1', 'I0', '出力Y1', '出力Y0'],
          rows: [
            ['ボタン0', '0', '0', '0', '1', '0', '0'],
            ['ボタン1', '0', '0', '1', '0', '0', '1'],
            ['ボタン2', '0', '1', '0', '0', '1', '0'],
            ['ボタン3', '1', '0', '0', '0', '1', '1'],
          ],
        },
        {
          type: 'note',
          text: '一度に1つの入力だけがアクティブ（ワンホット）',
          icon: '⚠️',
        },
      ],
    },
    {
      id: 'logic-design',
      instruction: '論理設計を理解しよう',
      content: [
        {
          type: 'heading',
          text: '🔧 出力の論理式',
          icon: '🔧',
        },
        {
          type: 'list',
          ordered: false,
          items: ['Y0 = I1 OR I3（奇数番号で1）', 'Y1 = I2 OR I3（2以上で1）'],
        },
        {
          type: 'heading',
          text: '💡 パターンの発見',
          icon: '💡',
        },
        {
          type: 'text',
          text: '各出力ビットは、特定の入力の組み合わせでオンになります。',
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: '4つの入力スイッチを配置',
      hint: 'I0, I1, I2, I3 の4つのINPUTを縦に配置',
      content: [
        {
          type: 'text',
          text: '各入力は「ボタン0」「ボタン1」「ボタン2」「ボタン3」を表します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-or-gates',
      instruction: 'ORゲートを2つ配置',
      hint: 'Y0とY1の生成用に2つのORゲート',
      content: [
        {
          type: 'text',
          text: '複数の入力をまとめるORゲートが必要です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'place-outputs',
      instruction: '2ビット出力を配置',
      hint: 'Y1（上位ビット）とY0（下位ビット）の2つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '2ビットで00〜11（0〜3）を表現します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-y0',
      instruction: '配線：Y0（下位ビット）',
      hint: 'I1とI3を下のORゲートに接続し、OUTPUT Y0へ',
      content: [
        {
          type: 'text',
          text: 'ボタン1またはボタン3が押されたときY0=1',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-y1',
      instruction: '配線：Y1（上位ビット）',
      hint: 'I2とI3を上のORゲートに接続し、OUTPUT Y1へ',
      content: [
        {
          type: 'text',
          text: 'ボタン2またはボタン3が押されたときY1=1',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-button0',
      instruction: 'テスト1：ボタン0（I0=1）',
      content: [
        {
          type: 'text',
          text: 'I0だけをONにして、出力が00になることを確認',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: 'I0=1',
              operator: '→',
              right: '',
              result: '00',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-button1',
      instruction: 'テスト2：ボタン1（I1=1）',
      content: [
        {
          type: 'text',
          text: 'I1だけをONにして、出力が01になることを確認',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: 'I1=1',
              operator: '→',
              right: '',
              result: '01',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-button2',
      instruction: 'テスト3：ボタン2（I2=1）',
      content: [
        {
          type: 'text',
          text: 'I2だけをONにして、出力が10になることを確認',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: 'I2=1',
              operator: '→',
              right: '',
              result: '10',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-button3',
      instruction: 'テスト4：ボタン3（I3=1）',
      content: [
        {
          type: 'text',
          text: 'I3だけをONにして、出力が11になることを確認',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: 'I3=1',
              operator: '→',
              right: '',
              result: '11',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'priority-encoder',
      instruction: '【発展】優先エンコーダ',
      content: [
        {
          type: 'heading',
          text: '🎯 複数入力への対応',
          icon: '🎯',
        },
        {
          type: 'text',
          text: '複数のボタンが同時に押された場合は？',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '優先順位を決める（例：大きい番号優先）',
            '最高優先度の入力だけをエンコード',
            'エラー信号を追加で出力',
          ],
        },
        {
          type: 'note',
          text: '実用的なエンコーダは優先順位付きが一般的',
          icon: '💡',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】エンコーダの活用例',
      content: [
        {
          type: 'heading',
          text: '💻 実世界での使用例',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '⌨️ キーボード：キー入力をスキャンコードに変換',
            '🎮 ゲームコントローラ：ボタン入力をデジタル信号に',
            '🏧 ATM：テンキー入力を数値コードに',
            '🚪 セキュリティ：ドアセンサーの状態をコード化',
            '🏭 工場：センサー群の状態を効率的に伝送',
          ],
        },
      ],
    },
    {
      id: 'decimal-encoder',
      instruction: '10進エンコーダの仕組み',
      content: [
        {
          type: 'heading',
          text: '🔢 10-to-4エンコーダ',
          icon: '🔢',
        },
        {
          type: 'text',
          text: '0〜9の10個の入力を4ビット（BCD）に変換',
        },
        {
          type: 'table',
          headers: ['数字', 'D3', 'D2', 'D1', 'D0'],
          rows: [
            ['0', '0', '0', '0', '0'],
            ['1', '0', '0', '0', '1'],
            ['5', '0', '1', '0', '1'],
            ['9', '1', '0', '0', '1'],
          ],
        },
        {
          type: 'note',
          text: '電卓やデジタル時計で広く使用されています',
          icon: '🧮',
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 エンコーダマスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ スイッチ入力のバイナリ変換',
            '✅ 効率的な情報圧縮',
            '✅ ORゲートの活用法',
            '✅ デジタル入力システムの基礎',
          ],
        },
        {
          type: 'note',
          text: '次はこの逆、デコーダを学びましょう！',
          icon: '➡️',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '4-to-2エンコーダで、I2=1のとき出力は？',
          options: ['00', '01', '10', '11'],
          correctIndex: 2,
        },
      ],
    },
  ],
};
