import type { StructuredLesson } from '../../../../types/lesson-content';

export const fullAdderStructuredLesson: StructuredLesson = {
  id: 'full-adder',
  title: '全加算器 - 完全な足し算マシン',
  description: '前の桁からの繰り上がりも考慮する本格的な加算回路を作ります',
  icon: '🧮',
  difficulty: 'intermediate',
  prerequisites: ['half-adder'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: '半加算器の限界を超えろ！',
      content: [
        {
          type: 'text',
          text: '前回作った半加算器には1つ問題がありました...',
        },
        {
          type: 'heading',
          text: '🤔 複数桁の計算はどうする？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: '例：11 + 01 = 100（2進数）',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '1桁目：1 + 1 = 10（0を書いて1繰り上げ）',
            '2桁目：1 + 0 + 繰り上がり1 = 10',
          ],
        },
        {
          type: 'note',
          text: '2桁目では「前の桁からの繰り上がり」も足す必要がある！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '全加算器の仕組み',
      content: [
        {
          type: 'heading',
          text: '📥 3つの入力',
          icon: '📥',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'A：1つ目の数',
            'B：2つ目の数',
            'Cin：前の桁からの繰り上がり',
          ],
        },
        {
          type: 'heading',
          text: '📤 2つの出力',
          icon: '📤',
        },
        {
          type: 'list',
          ordered: false,
          items: ['Sum：和（その桁の答え）', 'Cout：次の桁への繰り上がり'],
        },
      ],
    },
    {
      id: 'truth-table-intro',
      instruction: '全加算器の真理値表を見てみよう',
      content: [
        {
          type: 'table',
          headers: ['A', 'B', 'Cin', 'Sum', 'Cout'],
          rows: [
            ['0', '0', '0', '0', '0'],
            ['0', '0', '1', '1', '0'],
            ['0', '1', '0', '1', '0'],
            ['0', '1', '1', '0', '1'],
            ['1', '0', '0', '1', '0'],
            ['1', '0', '1', '0', '1'],
            ['1', '1', '0', '0', '1'],
            ['1', '1', '1', '1', '1'],
          ],
        },
        {
          type: 'note',
          text: '8パターンすべてを確認！3つの1を足すと11（2進数）になります',
          icon: '📊',
        },
      ],
    },
    {
      id: 'design-strategy',
      instruction: '設計戦略：半加算器を使おう！',
      content: [
        {
          type: 'heading',
          text: '💡 賢いアイデア',
          icon: '💡',
        },
        {
          type: 'text',
          text: '全加算器は2つの半加算器を組み合わせて作れます！',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '1つ目の半加算器：A + B を計算',
            '2つ目の半加算器：(A + B) + Cin を計算',
            'ORゲート：2つの繰り上がりをまとめる',
          ],
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: '3つの入力を配置しよう',
      hint: 'A、B、Cin の3つのINPUTを縦に並べて配置',
      content: [
        {
          type: 'text',
          text: '上から順に A、B、Cin（繰り上がり入力）です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'first-half-adder',
      instruction: '1つ目の半加算器部分を作成',
      hint: 'XORゲート（和）とANDゲート（繰り上がり）を配置',
      content: [
        {
          type: 'text',
          text: 'まずA + Bを計算する部分を作ります。',
        },
        {
          type: 'note',
          text: 'XORはA⊕B（和）、ANDはA・B（繰り上がり）を計算',
          icon: '🔧',
        },
      ],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'second-half-adder',
      instruction: '2つ目の半加算器部分を作成',
      hint: 'もう1セットのXORとANDを配置',
      content: [
        {
          type: 'text',
          text: '(A⊕B) + Cin を計算する部分です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'or-gate',
      instruction: 'ORゲートで繰り上がりをまとめる',
      hint: '2つのANDの出力をORでまとめます',
      content: [
        {
          type: 'text',
          text: '2つの半加算器のどちらかで繰り上がりが発生したらCout=1',
        },
      ],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'outputs',
      instruction: '出力を配置',
      hint: 'Sum（和）とCout（繰り上がり）の2つのOUTPUT',
      content: [],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-first-stage',
      instruction: '配線：第1段階（A + B）',
      hint: 'AとBを1つ目のXORとANDに接続',
      content: [
        {
          type: 'text',
          text: '基本的な A + B の計算部分を配線します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-second-stage',
      instruction: '配線：第2段階（+ Cin）',
      hint: '1つ目のXORの出力とCinを2つ目のXORとANDに接続',
      content: [
        {
          type: 'text',
          text: '中間結果に繰り上がり入力を加える部分です。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-carry-logic',
      instruction: '配線：繰り上がりロジック',
      hint: '2つのANDの出力をORに接続し、ORの出力をCoutへ',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-sum',
      instruction: '配線：和の出力',
      hint: '2つ目のXORの出力をSumへ接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-000',
      instruction: 'テスト1：0 + 0 + 0',
      content: [
        {
          type: 'text',
          text: 'すべて0の場合。出力もすべて0になるはず。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-111',
      instruction: 'テスト2：1 + 1 + 1',
      content: [
        {
          type: 'text',
          text: '3つの1を足すと...11（2進数）！',
        },
        {
          type: 'note',
          text: 'Sum = 1、Cout = 1 になるはずです',
          icon: '🎯',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-all',
      instruction: 'すべてのパターンをテスト',
      content: [
        {
          type: 'text',
          text: '8パターンすべてを試して、真理値表と一致することを確認しましょう。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'achievement',
      instruction: '🎉 完成！全加算器マスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 達成したこと',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '3入力2出力の複雑な回路を構築',
            '半加算器を部品として再利用',
            '繰り上がりを正しく処理',
          ],
        },
        {
          type: 'note',
          text: 'これで複数桁の加算が可能になりました！',
          icon: '✨',
        },
      ],
    },
    {
      id: 'ripple-carry',
      instruction: '【発展】リップルキャリー加算器',
      content: [
        {
          type: 'heading',
          text: '🔗 全加算器をつなげると...',
          icon: '🔗',
        },
        {
          type: 'text',
          text: '全加算器を横に並べて、CoutをCinにつなげると...',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '4個つなげる → 4ビット加算器',
            '8個つなげる → 8ビット加算器',
            '32個つなげる → 32ビット加算器（実際のCPU）',
          ],
        },
        {
          type: 'note',
          text: '繰り上がりが波のように伝わるので「リップル（波紋）キャリー」と呼ばれます',
          icon: '🌊',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question:
            '全加算器で 1 + 1 + 1 を計算したとき、Cout（繰り上がり）は？',
          options: ['0', '1', '不定', 'エラー'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
