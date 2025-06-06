import type { StructuredLesson } from '../../../../types/lesson-content';

export const xorGateStructuredLesson: StructuredLesson = {
  id: 'xor-gate',
  title: 'XORゲート - 違いを見つける探偵',
  description: '2つの入力が「異なる」ときだけONになる特殊なゲートを学びます',
  objective:
    'XORゲートの動作原理を理解し、排他的論理和の概念を習得。加算器や暗号化などの実用的な応用を学びます',
  icon: '🔍',
  difficulty: 'beginner',
  prerequisites: ['and-gate', 'or-gate'],
  estimatedMinutes: 15,
  steps: [
    {
      id: 'intro',
      instruction: 'XORゲートは「違い」を見つける探偵です！',
      content: [
        {
          type: 'text',
          text: '2つの入力が違うときだけ「見つけた！」と反応します。',
        },
        {
          type: 'heading',
          text: '🎮 ゲームで例えると',
          icon: '🎮',
        },
        {
          type: 'text',
          text: '「2人プレイで、違うボタンを押したらポイントゲット！」みたいなルールです。',
        },
      ],
    },
    {
      id: 'place-components',
      instruction: '回路を組み立てましょう。',
      hint: '入力 x2、XORゲート、出力を配置して接続してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'experiment-intro',
      instruction: '実験を始める前に予想してみましょう！',
      content: [
        {
          type: 'text',
          text: 'XORは「eXclusive OR（排他的論理和）」の略です。',
        },
        {
          type: 'note',
          text: '「どちらか片方だけ」という意味です。両方ONはダメ！',
          icon: '🚨',
        },
      ],
    },
    {
      id: 'experiment',
      instruction: '実験開始！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'note',
          text: '特に「両方ON」のときに注目してください！',
          icon: '👀',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'results',
      instruction: '【パターン分析】実験結果を整理しましょう。',
      content: [
        {
          type: 'experiment-result',
          title: '🔬 実験結果まとめ',
          results: [
            { left: '0', operator: 'XOR', right: '0', result: '0' },
            { left: '0', operator: 'XOR', right: '1', result: '1' },
            { left: '1', operator: 'XOR', right: '0', result: '1' },
            { left: '1', operator: 'XOR', right: '1', result: '0' },
          ],
          note: '「XOR」は排他的論理和を表します。記号では「⊕」と表記されます。',
        },
        {
          type: 'heading',
          text: '💡 発見：入力が「異なる」ときだけ1を出力！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'comparison',
      instruction: '【比較】OR、AND、XORの違いを理解しよう',
      content: [
        {
          type: 'heading',
          text: '🎯 3つのゲートを比較',
          icon: '🎯',
        },
        {
          type: 'comparison',
          items: [
            {
              gateType: 'OR',
              values: [
                { left: '0', operator: 'OR', right: '0', result: '0' },
                { left: '0', operator: 'OR', right: '1', result: '1' },
                { left: '1', operator: 'OR', right: '0', result: '1' },
                { left: '1', operator: 'OR', right: '1', result: '1' },
              ],
            },
            {
              gateType: 'XOR',
              values: [
                { left: '0', operator: 'XOR', right: '0', result: '0' },
                { left: '0', operator: 'XOR', right: '1', result: '1' },
                { left: '1', operator: 'XOR', right: '0', result: '1' },
                { left: '1', operator: 'XOR', right: '1', result: '0' },
              ],
            },
            {
              gateType: 'AND',
              values: [
                { left: '0', operator: 'AND', right: '0', result: '0' },
                { left: '0', operator: 'AND', right: '1', result: '0' },
                { left: '1', operator: 'AND', right: '0', result: '0' },
                { left: '1', operator: 'AND', right: '1', result: '1' },
              ],
            },
          ],
        },
        {
          type: 'text',
          text: '違いは「1と1」の結果だけ！ORは1、XORは0、ANDは1です。',
        },
      ],
    },
    {
      id: 'real-world',
      instruction: '【実用例】XORゲートはどこで使われる？',
      content: [
        {
          type: 'heading',
          text: '🌟 実世界での活用',
          icon: '🌟',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🧮 加算器：2進数の足し算の基本部品',
            '🔐 暗号化：データの暗号化・復号化',
            '🎮 ゲーム：同時押し禁止の実装',
            '🚦 エラー検出：データの整合性チェック',
          ],
        },
      ],
    },
    {
      id: 'encryption-demo',
      instruction: '【応用】XORで簡単な暗号を作ろう！',
      content: [
        {
          type: 'heading',
          text: '🔐 XOR暗号の仕組み',
          icon: '🔐',
        },
        {
          type: 'text',
          text: 'データ XOR 鍵 = 暗号文',
        },
        {
          type: 'text',
          text: '暗号文 XOR 鍵 = データ（元に戻る！）',
        },
        {
          type: 'note',
          text: 'XORを2回適用すると元に戻る性質を使っています',
          icon: '✨',
        },
      ],
    },
    {
      id: 'truth-table',
      instruction: '【理論】XORゲートの真理値表',
      content: [
        {
          type: 'table',
          headers: ['入力A', '入力B', '出力'],
          rows: [
            ['0', '0', '0'],
            ['0', '1', '1'],
            ['1', '0', '1'],
            ['1', '1', '0'],
          ],
        },
        {
          type: 'text',
          text: '覚え方：「同じなら0、違えば1」',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'XORゲートで、両方の入力が1のとき出力は？',
          options: ['0', '1', '不定', 'エラー'],
          correctIndex: 0,
        },
      ],
    },
    {
      id: 'challenge',
      instruction: '【チャレンジ】XORを他のゲートで作れる？',
      content: [
        {
          type: 'text',
          text: 'XORは実は、AND、OR、NOTを組み合わせて作ることができます！',
        },
        {
          type: 'note',
          text: 'ヒント：(A AND NOT B) OR (NOT A AND B)',
          icon: '🤔',
        },
        {
          type: 'text',
          text: '時間があれば、この組み合わせを実際に作ってみましょう！',
        },
      ],
    },
  ],
};
