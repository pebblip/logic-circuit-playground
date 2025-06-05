import type { StructuredLesson } from '../../../../types/lesson-content';

export const orGateStructuredLesson: StructuredLesson = {
  id: 'or-gate-structured',
  title: 'ORゲート - 寛容な選択肢',
  description: '少なくとも1つの入力がONなら出力がONになる「OR」の動作を学びます',
  icon: '🎯',
  difficulty: 'beginner',
  prerequisites: ['and-gate-structured'],
  estimatedMinutes: 10,
  steps: [
    {
      id: 'intro',
      instruction: 'ORゲートは「どれか1つでも条件が満たされたとき」に動作します。',
      content: [
        {
          type: 'text',
          text: '日常生活で例えると、「現金」または「クレジットカード」で支払いができるお店のようなものです。',
        },
      ],
    },
    {
      id: 'place-components',
      instruction: '回路を組み立てましょう。',
      hint: 'INPUT x2、ORゲート、OUTPUTを配置して接続してください。',
      content: [],
      action: { type: 'place-gate', gateType: 'OR' },
    },
    {
      id: 'experiment',
      instruction: '実験開始！4つのパターンをすべて試してみましょう。',
      content: [
        {
          type: 'note',
          text: 'INPUTをダブルクリックして、すべての組み合わせを試してください。',
          icon: '💡',
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
          title: '🔬 実験結果まとめ：',
          results: [
            { input1: '0', operator: '+', input2: '0', output: '0' },
            { input1: '0', operator: '+', input2: '1', output: '1' },
            { input1: '1', operator: '+', input2: '0', output: '1' },
            { input1: '1', operator: '+', input2: '1', output: '1' },
          ],
          note: 'ここでの「+」は論理演算を表します。入力1 + 入力2 = 出力 という意味です。',
        },
        {
          type: 'heading',
          text: '💡 発見：ORゲートが0を出力するのは「両方とも0」の時だけ！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'comparison',
      instruction: '【理論】ANDゲートとORゲートを比較してみましょう。',
      content: [
        {
          type: 'heading',
          text: '🎯 ANDとORの比較',
          icon: '🎯',
        },
        {
          type: 'comparison',
          items: [
            {
              gateType: 'AND',
              expressions: [
                { input1: '0', operator: '+', input2: '0', output: '0' },
                { input1: '0', operator: '+', input2: '1', output: '0' },
                { input1: '1', operator: '+', input2: '0', output: '0' },
                { input1: '1', operator: '+', input2: '1', output: '1' },
              ],
            },
            {
              gateType: 'OR',
              expressions: [
                { input1: '0', operator: '+', input2: '0', output: '0' },
                { input1: '0', operator: '+', input2: '1', output: '1' },
                { input1: '1', operator: '+', input2: '0', output: '1' },
                { input1: '1', operator: '+', input2: '1', output: '1' },
              ],
            },
          ],
        },
        {
          type: 'text',
          text: 'ANDは「厳格」（すべて必要）、ORは「寛容」（1つでOK）という性格の違いがあります。',
        },
      ],
    },
  ],
};