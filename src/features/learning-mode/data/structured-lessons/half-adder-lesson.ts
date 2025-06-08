import type { StructuredLesson } from '../../../../types/lesson-content';

export const halfAdderStructuredLesson: StructuredLesson = {
  id: 'half-adder',
  title: '半加算器 - 2進数の足し算マシン',
  description: '2つの1ビット数を足し算する基本回路を作ります',
  objective:
    'コンピュータが足し算を行う仕組みを理解し、基本ゲートを組み合わせて算術演算回路を構築できるようになる',
  difficulty: 'intermediate',
  prerequisites: ['and-gate', 'xor-gate'],
  estimatedMinutes: 20,
  availableGates: ['INPUT', 'OUTPUT', 'AND', 'XOR'],
  steps: [
    {
      id: 'intro',
      instruction: 'コンピュータはどうやって足し算をするの？',
      content: [
        {
          type: 'text',
          text: '今回は、2進数の1桁同士の足し算を行う「半加算器」を作ります！',
        },
        {
          type: 'heading',
          text: '📊 2進数の足し算の基本',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '0 + 0 = 0（答え0、繰り上がり0）',
            '0 + 1 = 1（答え1、繰り上がり0）',
            '1 + 0 = 1（答え1、繰り上がり0）',
            '1 + 1 = 10（答え0、繰り上がり1）← 注目！',
          ],
        },
        {
          type: 'note',
          text: '💡 10進数で「9 + 1 = 10」で繰り上がるように、2進数では「1 + 1 = 10」で繰り上がります！',
        },
      ],
    },
    {
      id: 'concept',
      instruction: '半加算器の仕組みを理解しよう',
      content: [
        {
          type: 'heading',
          text: '💡 重要な発見',
        },
        {
          type: 'text',
          text: '2進数の足し算を観察すると...',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '和（Sum）：入力が異なるときだけ1 → これはXOR！',
            '繰り上がり（Carry）：両方1のときだけ1 → これはAND！',
          ],
        },
        {
          type: 'note',
          text: 'つまり、XORゲートとANDゲートがあれば足し算ができる！',
        },
        {
          type: 'circuit-diagram-v2',
          circuitId: 'half-adder',
          description: '半加算器の回路構成（制作モード描画システム使用）',
          showTruthTable: false,
        },
      ],
    },
    {
      id: 'truth-table-analysis',
      instruction: '【分析】真理値表で確認してみよう',
      content: [
        {
          type: 'heading',
          text: '📊 半加算器の真理値表',
        },
        {
          type: 'table',
          headers: ['A', 'B', '和(S)', '繰上(C)', '説明'],
          rows: [
            ['0', '0', '0', '0', '0+0=00'],
            ['0', '1', '1', '0', '0+1=01'],
            ['1', '0', '1', '0', '1+0=01'],
            ['1', '1', '0', '1', '1+1=10'],
          ],
        },
        {
          type: 'text',
          text: 'よく見ると：',
        },
        {
          type: 'list',
          ordered: false,
          items: ['和(S) = A ⊕ B（XOR演算）', '繰上(C) = A ∧ B（AND演算）'],
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: '回路の構築を始めましょう！まず入力を配置',
      hint: '2つの入力を縦に並べて配置してください（数値AとBを表します）',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-xor',
      instruction: 'XORゲートを配置（和の計算用）',
      hint: '入力の右側にXORゲートを配置します',
      content: [
        {
          type: 'text',
          text: 'XORは「和」を計算します（繰り上がりなしの部分）',
        },
      ],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'place-and',
      instruction: 'ANDゲートを配置（繰り上がりの計算用）',
      hint: 'XORの下にANDゲートを配置します',
      content: [
        {
          type: 'text',
          text: 'ANDは「繰り上がり」を計算します',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-outputs',
      instruction: '出力を2つ配置',
      hint: 'XORの右に出力（和）、ANDの右に出力（繰り上がり）を配置',
      content: [
        {
          type: 'note',
          text: '上の出力が「和（Sum）」、下の出力が「繰り上がり（Carry）」です',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-to-xor',
      instruction: '配線：入力をXORに接続',
      hint: '両方の入力からXORゲートの2つの入力に接続します',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-to-and',
      instruction: '配線：入力をANDにも接続',
      hint: '同じ入力からANDゲートの2つの入力にも接続します',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：ゲートから出力へ',
      hint: 'XORの出力を上の出力へ、ANDの出力を下の出力へ接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-intro',
      instruction: '完成！動作確認をしましょう',
      content: [
        {
          type: 'text',
          text: '半加算器が完成しました！4つのパターンをすべて試してみましょう。',
        },
        {
          type: 'note',
          text: '上のランプ = 和（Sum）、下のランプ = 繰り上がり（Carry）',
        },
        {
          type: 'heading',
          text: '🔬 実験のポイント',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '入力をダブルクリックしてON/OFFを切り替え',
            '上の出力（和）と下の出力（繰り上がり）を観察',
            '実際の計算結果と比較',
          ],
        },
      ],
    },
    {
      id: 'test-00',
      instruction: 'テスト1：0 + 0 を計算',
      content: [
        {
          type: 'text',
          text: '両方の入力をOFF（0）にして結果を確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-01',
      instruction: 'テスト2：0 + 1 を計算',
      content: [
        {
          type: 'text',
          text: '片方だけON（1）にして結果を確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-11',
      instruction: 'テスト3：1 + 1 を計算',
      content: [
        {
          type: 'text',
          text: '両方の入力をON（1）にして...繰り上がりに注目！',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'results',
      instruction: '【結果分析】半加算器の真理値表',
      content: [
        {
          type: 'table',
          headers: ['入力A', '入力B', '和(S)', '繰上(C)'],
          rows: [
            ['0', '0', '0', '0'],
            ['0', '1', '1', '0'],
            ['1', '0', '1', '0'],
            ['1', '1', '0', '1'],
          ],
        },
        {
          type: 'heading',
          text: '🎉 成功！2進数の足し算ができました！',
        },
        {
          type: 'text',
          text: '1 + 1 = 10（2進数）が正しく計算されています！',
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】半加算器の使い道',
      content: [
        {
          type: 'heading',
          text: '🚀 実用例',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CPU内部の演算装置（ALU）の基本部品',
            'デジタル計算機の足し算回路',
            '全加算器（Full Adder）の構成要素',
            'バイナリカウンタの基礎',
          ],
        },
        {
          type: 'note',
          text: 'この小さな回路が、コンピュータの計算能力の基礎なのです！',
        },
      ],
    },
    {
      id: 'limitation',
      instruction: '【発展】半加算器の限界',
      content: [
        {
          type: 'text',
          text: '半加算器には1つ問題があります...',
        },
        {
          type: 'heading',
          text: '🤔 前の桁からの繰り上がりは？',
        },
        {
          type: 'text',
          text: '複数桁の計算では、前の桁からの繰り上がりも考慮する必要があります。',
        },
        {
          type: 'note',
          text: 'これを解決するのが「全加算器（Full Adder）」です！',
        },
        {
          type: 'heading',
          text: '📊 半加算器 vs 全加算器',
        },
        {
          type: 'table',
          headers: ['種類', '入力数', '出力数', '用途'],
          rows: [
            ['半加算器', '2つ', '2つ', '最下位ビットの計算'],
            ['全加算器', '3つ', '2つ', '2ビット目以降の計算'],
          ],
        },
      ],
    },
    {
      id: 'historical-note',
      instruction: '【コラム】コンピュータの歴史',
      content: [
        {
          type: 'heading',
          text: '📜 人類初のコンピュータ',
        },
        {
          type: 'text',
          text: '1940年代、世界初の電子コンピュータENIACは、約18,000本の真空管を使って加算器を実現していました。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '1秒間に5000回の加算が可能（当時としては驚異的）',
            '重さ30トン、消費電力140kW',
            '現在のスマホは1秒間に数十億回の演算が可能',
          ],
        },
        {
          type: 'note',
          text: '🚀 たった80年で、計算速度は100万倍以上に！',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '半加算器で1 + 1を計算したとき、繰り上がり出力は？',
          options: ['0', '1', '不定', 'エラー'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
