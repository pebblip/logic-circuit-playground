import type { StructuredLesson } from '../../../../types/lesson-content';
import { TERMS } from '../terms';

export const digitalBasicsStructuredLesson: StructuredLesson = {
  id: 'digital-basics',
  title: 'デジタルの基礎！0と1で動く世界',
  description: '電子回路とデジタルの基礎を体験しよう！',
  objective:
    '電子回路の基本とデジタル技術の基礎を理解し、0と1で表現する仕組みを体験的に学びます',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 10,
  availableGates: ['INPUT', 'OUTPUT'],
  steps: [
    {
      id: 'what-is-circuit',
      instruction: '電子回路プレイグラウンドへようこそ！',
      content: [
        {
          type: 'text',
          text: 'このアプリは「電子回路」を作って遊ぶ場所です。',
        },
        {
          type: 'heading',
          text: '💡 電子回路って？',
        },
        {
          type: 'rich-text',
          elements: [
            'スマホもパソコンもAIも、すべて',
            { text: '電子回路', emphasis: true },
            'という電気の通り道でできています。今から、その基本を一緒に作ってみましょう！'
          ]
        },
        {
          type: 'note',
          text: '🎮 このアプリでできること：スイッチやランプをつなげて、本物の電子回路のように動かせます',
        },
        {
          type: 'rich-text',
          elements: [
            { text: '【電子回路のイメージ】', bold: true }
          ]
        },
        {
          type: 'rich-text',
          elements: [
            '📱 スマホの中身 = 何億個もの小さなスイッチ'
          ]
        },
        {
          type: 'rich-text',
          elements: [
            '💻 パソコンの頭脳 = 超高速で動くスイッチの集まり'
          ]
        },
        {
          type: 'rich-text',
          elements: [
            '🤖 AIの仕組み = スイッチの組み合わせで計算'
          ]
        },
      ],
    },
    {
      id: 'digital-world',
      instruction: '0と1の世界',
      content: [
        {
          type: 'heading',
          text: '🤖 デジタルとは？',
        },
        {
          type: 'rich-text',
          elements: [
            { text: 'デジタル', emphasis: true },
            'とは、すべてを',
            { text: '0', bold: true },
            'と',
            { text: '1', bold: true },
            'の2つの状態で表現する方法です。'
          ]
        },
        {
          type: 'text',
          text: 'なぜ2つだけ？それは「確実」で「シンプル」だからです！',
        },
      ],
    },
    {
      id: 'why-binary',
      instruction: 'なぜ0と1だけ？',
      content: [
        {
          type: 'heading',
          text: '🔌 スイッチで考えよう',
        },
        {
          type: 'rich-text',
          elements: [
            '部屋の電気のスイッチを想像してください。',
            { text: 'ON', bold: true },
            'か',
            { text: 'OFF', bold: true },
            'しかないですよね？'  
          ]
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'ON = 電気が流れる = 1',
            'OFF = 電気が流れない = 0',
          ],
        },
        {
          type: 'note',
          text: '💡 この「確実に区別できる2つの状態」がデジタルの基本です！',
        },
        {
          type: 'heading',
          text: '📌 このアプリでの信号の見分け方'
        },
        {
          type: 'text',
          text: 'このアプリケーションでは、配線の色で0と1を見分けます。'
        },
        {
          type: 'circuit-diagram-v2',
          circuitId: 'signal-comparison',
          showTruthTable: false
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'グレーの配線 = 電気が流れていない',
            '緑色の配線 = 電気が流れている',
          ],
        },
      ],
    },
    {
      id: 'first-circuit',
      instruction: '初めての回路を作ろう！',
      hint: 'ツールパレットから「入力」をドラッグして配置',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.INPUT, emphasis: true },
            '（スイッチの役割）を配置してみましょう。'
          ]
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'add-output',
      instruction: '出力を追加！',
      hint: '入力の右側に出力を配置',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.OUTPUT, emphasis: true },
            '（ランプの役割）を配置します。'
          ]
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-wire',
      instruction: `${TERMS.WIRE}してみよう！`,
      hint: `${TERMS.INPUT}の${TERMS.RIGHT_CIRCLE}と${TERMS.OUTPUT}の${TERMS.LEFT_CIRCLE}をクリックして${TERMS.CONNECT}`,
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.INPUT, bold: true },
            'の',
            { text: TERMS.OUTPUT_PIN, bold: true },
            '（',
            TERMS.RIGHT_CIRCLE,
            '）を',
            { text: TERMS.OUTPUT, bold: true },
            'の',
            { text: TERMS.INPUT_PIN, bold: true },
            '（',
            TERMS.LEFT_CIRCLE,
            '）に',
            TERMS.CONNECT,
            'します。'
          ]
        },
        {
          type: 'note',
          text: `🔗 配線のポイント：${TERMS.INPUT}の${TERMS.OUTPUT_PIN}（${TERMS.RIGHT_CIRCLE}）を${TERMS.OUTPUT}の${TERMS.INPUT_PIN}（${TERMS.LEFT_CIRCLE}）に${TERMS.CONNECT}します。`,
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'experiment',
      instruction: '実験：0と1を体験！',
      content: [
        {
          type: 'rich-text',
          elements: [
            { text: TERMS.INPUT, bold: true },
            'を',
            { text: TERMS.DOUBLE_CLICK, emphasis: true },
            'して、0（OFF）と1（ON）を切り替えてみましょう。'
          ]
        },
        {
          type: 'note',
          text: '💡 0はOFF、1はONを表します',
        },
        {
          type: 'heading',
          text: '🔍 実際の回路で確認'
        },
        {
          type: 'circuit-diagram-v2',
          circuitId: 'simple-connection',
          description: '回答',
          showTruthTable: false
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'bit-patterns',
      instruction: 'ビットの組み合わせ',
      content: [
        {
          type: 'heading',
          text: '🎆 複数のビットで表現力がUP！',
        },
        {
          type: 'table',
          headers: ['ビット数', '表現できる数'],
          rows: [
            ['1ビット', '2通り'],
            ['2ビット', '4通り'],
            ['3ビット', '8通り'],
            ['4ビット', '16通り'],
            ['8ビット', '256通り'],
          ],
        },
        {
          type: 'note',
          text: '📱 スマホの写真1枚（3MB）は約240万個の0と1でできています！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'コンピュータが使う数字は？',
          options: [
            '0〜9の10種類',
            '0と1の2種類だけ',
            '無限の種類',
            'アルファベットも使う',
          ],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'summary',
      instruction: '【まとめ】今日学んだこと',
      content: [
        {
          type: 'heading',
          text: '🎆 今日学んだこと',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '電子回路は電気の通り道',
            'デジタルは0と1の2つの状態で表現',
            'スイッチのON/OFFが基本',
            '複数のビットで表現力が増える',
          ],
        },
        {
          type: 'note',
          text: '🚀 次は「NOTゲート」で0と1を反転させる魔法を学びましょう！',
        },
      ],
    },
  ],
};
