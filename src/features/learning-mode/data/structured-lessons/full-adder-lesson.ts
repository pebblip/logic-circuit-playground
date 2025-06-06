import type { StructuredLesson } from '../../../../types/lesson-content';

export const fullAdderStructuredLesson: StructuredLesson = {
  id: 'full-adder',
  title: '全加算器 - 完全な足し算マシン',
  description: '前の桁からの繰り上がりも考慮する本格的な加算回路を作ります',
  difficulty: 'intermediate',
  prerequisites: ['half-adder'],
  estimatedMinutes: 20,
  availableGates: ['INPUT', 'OUTPUT', 'OR', 'XOR', 'AND'],
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
        },
      ],
    },
    {
      id: 'circuit-diagram',
      instruction: '全加算器の詳細回路図',
      content: [
        {
          type: 'heading',
          text: '📋 回路構成図',
        },
        {
          type: 'text',
          text: '半加算器2つとORゲートで構成：',
        },
        {
          type: 'ascii-art',
          art: `         ┌──────────────┐
    A ───┤  半加算器1   ├─── S1
         │ (HA1)       │   │
    B ───┤              ├─── C1
         └──────────────┘   │
                         │   │
         ┌──────────────┐   │
    S1 ──┤  半加算器2   ├─── Sum
         │ (HA2)       │   │
   Cin ──┤              ├─── C2
         └──────────────┘   │
                             │
         ┌──────────────┐   │
    C1 ──┤     OR      ├─── Cout
         │              │
    C2 ──┤              │
         └──────────────┘`,
        },
        {
          type: 'note',
          text: '半加算器 = XORゲート（和）+ ANDゲート（繰り上がり）',
        },
        {
          type: 'heading',
          text: '🔍 半加算器の内部構造',
        },
        {
          type: 'ascii-art',
          art: `半加算器（HA）の内部：
┌─────────────────────────┐
│      半加算器（HA）      │
│  A ──┬─[XOR]─── Sum    │
│      │                 │
│      └─[AND]─── Carry  │
│      │                 │
│  B ──┴─────────        │
└─────────────────────────┘`,
        },
        {
          type: 'text',
          text: 'つまり、全加算器は次のような構成になります：',
        },
        {
          type: 'ascii-art',
          art: `完全なゲートレベル展開図：
     ┌─────┐      ┌─────┐
A ───┤ XOR ├──S1──┤ XOR ├─── Sum
     └──┬──┘      └──┬──┘
        │            │
B ──────┴────────────┼──── Cin
        │            │
     ┌──┴──┐      ┌──┴──┐
     │ AND ├──C1  │ AND ├─── C2
     └─────┘  │   └─────┘     │
              │                │
              └───┌─────┐─────┘
                  │  OR  ├───── Cout
                  └─────┘`,
        },
      ],
    },
    {
      id: 'gate-level-circuit',
      instruction: 'ゲートレベルの信号フロー',
      content: [
        {
          type: 'heading',
          text: '🔌 ゲートレベル回路',
        },
        {
          type: 'text',
          text: '各ゲートの役割：',
        },
        {
          type: 'ascii-art',
          art: `A ──┬─────┐
    │     │
    │  ┌──┴──┐
    │  │ XOR │─── S1 ─┬─────┐
    │  └──┬──┘        │     │
    │     │            │  ┌──┴──┐
    │     │            │  │ XOR │─── Sum
    │     │            │  └──┬──┘
    │     │            │     │
B ──┼─────┘           Cin ──┼─────┐
    │                        │     │
    │  ┌─────┐              │  ┌──┴──┐
    │  │ AND │─── C1       │  │ AND │─── C2
    │  └─────┘  │          │  └─────┘  │
    │            │          │            │
    └───────────┘          └───────────┘
                 │                       │
                 │    ┌─────┐           │
                 └────┤  OR ├───────────┘
                      │     │─── Cout
                      └─────┘`,
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
        {
          type: 'heading',
          text: '🔍 信号の流れ（例：A=1, B=1, Cin=1）',
        },
        {
          type: 'table',
          headers: ['段階', '計算', '結果'],
          rows: [
            [
              '1. 半加算器1',
              'A(1) XOR B(1) = S1(0), A(1) AND B(1) = C1(1)',
              'S1=0, C1=1',
            ],
            [
              '2. 半加算器2',
              'S1(0) XOR Cin(1) = Sum(1), S1(0) AND Cin(1) = C2(0)',
              'Sum=1, C2=0',
            ],
            ['3. ORゲート', 'C1(1) OR C2(0) = Cout(1)', 'Cout=1'],
            ['最終結果', '1 + 1 + 1 = 11 (2進数)', 'Sum=1, Cout=1'],
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
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'carry-propagation',
      instruction: 'キャリー伝播の動作解説',
      content: [
        {
          type: 'heading',
          text: '🌊 キャリー伝播の流れ',
        },
        {
          type: 'text',
          text: 'A=1, B=1, Cin=1 の場合の信号の流れ：',
        },
        {
          type: 'table',
          headers: ['ステップ', '動作', 'S1', 'C1', 'Sum', 'C2', 'Cout'],
          rows: [
            ['1', 'A⊕B = 1⊕1', '0', '-', '-', '-', '-'],
            ['2', 'A∧B = 1∧1', '0', '1', '-', '-', '-'],
            ['3', 'S1⊕Cin = 0⊕1', '0', '1', '1', '-', '-'],
            ['4', 'S1∧Cin = 0∧1', '0', '1', '1', '0', '-'],
            ['5', 'C1∨C2 = 1∨0', '0', '1', '1', '0', '1'],
          ],
        },
        {
          type: 'note',
          text: '繰り上がりは2つの経路から発生します',
        },
      ],
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
        },
      ],
    },
    {
      id: 'optimized-design',
      instruction: '【発展】最適化された5ゲート版',
      content: [
        {
          type: 'heading',
          text: '🚀 より少ないゲートで実現',
        },
        {
          type: 'text',
          text: '実は5つのゲートでも全加算器が作れます：',
        },
        {
          type: 'table',
          headers: ['方式', 'ゲート数', '構成'],
          rows: [
            ['半加算器ベース', '5ゲート', 'XOR×2 + AND×2 + OR×1'],
            ['最適化版', '5ゲート', 'XOR×2 + AND×3'],
            ['直接実装', '9ゲート', '全部のNANDゲート'],
          ],
        },
        {
          type: 'text',
          text: `最適化版の回路：
Sum = A ⊕ B ⊕ Cin
Cout = AB + BCin + ACin

これは「多数決回路」とも呼ばれます。`,
        },
        {
          type: 'note',
          text: '実際のICではさらに最適化された回路が使われます',
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
        },
        {
          type: 'text',
          text: `4ビットリップルキャリー加算器の構成：

     A3 B3      A2 B2      A1 B1      A0 B0
      │ │        │ │        │ │        │ │
    ┌─┴─┴─┐    ┌─┴─┴─┐    ┌─┴─┴─┐    ┌─┴─┴─┐
C4◀─┤ FA3 ├◀─C3─┤ FA2 ├◀─C2─┤ FA1 ├◀─C1─┤ FA0 ├◀─▐0
    └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘
       │           │           │           │
       S3          S2          S1          S0`,
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '繰り上がりが順番に伝播（リップル）',
            '遅延時間 = ゲート数 × ゲート遅延',
            '32ビットではかなり遅くなる問題あり',
          ],
        },
        {
          type: 'note',
          text: 'この問題を解決するためにキャリールックアヘッド方式が開発されました',
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
        {
          type: 'quiz',
          question: '半加算器ベースの全加算器に必要なゲート数は？',
          options: ['3個', '5個', '7個', '9個'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
