import type { Lesson } from '../lessons';

export const nandGateStructuredLesson: Lesson = {
  id: 'nand-gate',
  title: 'NANDゲート - 万能の論理ゲート',
  description: 'NANDゲートの動作原理と、なぜこれが「万能ゲート」と呼ばれるのかを学びます。',
  objective: 'NANDゲートの動作を理解し、他の論理ゲートをNANDゲートだけで構築できることを体験する',
  difficulty: 'intermediate',
  estimatedMinutes: 20,
  prerequisites: ['and-gate', 'not-gate'],
  category: 'basics',
  icon: '🔄',
  steps: [
    {
      id: 'introduction',
      instruction: 'NANDゲートは「NOT AND」の略で、ANDゲートの出力を反転したものです。実は、このゲートだけで全ての論理回路を構築できる「万能ゲート」なのです！',
      action: {
        type: 'explanation',
        content: `
# NANDゲート入門

NANDゲートは、コンピュータの基礎となる最も重要なゲートの一つです。

## なぜNANDゲートが重要なのか？

1. **万能性**: NANDゲートだけで、AND、OR、NOT、XORなど全ての論理ゲートを作れる
2. **効率性**: 半導体では、NANDゲートが最も簡単に製造できる
3. **実用性**: メモリ回路（NANDフラッシュメモリ）の基本構成要素

## 真理値表
| 入力A | 入力B | 出力 |
|-------|-------|------|
| 0     | 0     | 1    |
| 0     | 1     | 1    |
| 1     | 0     | 1    |
| 1     | 1     | 0    |

つまり、「両方が1の時だけ0を出力」します。
        `,
      },
    },
    {
      id: 'place-nand',
      instruction: 'まず、NANDゲートを配置してみましょう。',
      hint: 'NANDゲートは基本ゲートの中にあります',
      action: {
        type: 'place-gate',
        gateType: 'NAND',
        position: { x: 400, y: 300 },
      },
      validation: {
        type: 'gate-placed',
        expected: 'NAND',
      },
    },
    {
      id: 'place-inputs',
      instruction: '2つの入力ゲートを配置して、NANDゲートに接続しましょう。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 200, y: 250 },
      },
    },
    {
      id: 'place-input-2',
      instruction: 'もう1つの入力ゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 200, y: 350 },
      },
    },
    {
      id: 'place-output',
      instruction: '出力ゲートを配置して、結果を確認できるようにしましょう。',
      action: {
        type: 'place-gate',
        gateType: 'OUTPUT',
        position: { x: 600, y: 300 },
      },
    },
    {
      id: 'test-nand',
      instruction: '入力を切り替えて、NANDゲートの動作を確認しましょう。両方の入力が1の時だけ、出力が0になることを確認してください。',
      action: {
        type: 'observe',
        highlight: ['input-1', 'input-2', 'output-1'],
      },
    },
    {
      id: 'quiz-nand-output',
      instruction: 'クイズ：入力A=1、入力B=0の時、NANDゲートの出力は？',
      action: {
        type: 'quiz',
        question: 'A=1、B=0の時のNANDゲート出力は？',
        options: ['0', '1', '不定'],
        correct: 1,
      },
      validation: {
        type: 'quiz-answered',
        expected: 1,
      },
    },
    {
      id: 'nand-as-not',
      instruction: 'NANDゲートを使ってNOTゲートを作ってみましょう！両方の入力を同じ信号に接続すると...',
      action: {
        type: 'explanation',
        content: `
# NANDゲートでNOTゲートを作る

NANDゲートの両方の入力に同じ信号を入れると、NOTゲートとして動作します！

## 仕組み
- 入力が0の時: NAND(0,0) = 1
- 入力が1の時: NAND(1,1) = 0

これはまさにNOTゲートの動作そのものです！
        `,
      },
    },
    {
      id: 'build-not-with-nand',
      instruction: '新しいNANDゲートを配置して、両方の入力を同じINPUTゲートに接続してみましょう。',
      action: {
        type: 'place-gate',
        gateType: 'NAND',
        position: { x: 400, y: 450 },
      },
    },
    {
      id: 'verify-not-behavior',
      instruction: '作成したNOTゲート（NANDで実装）の動作を確認しましょう。入力を切り替えて、正しく反転していることを確認してください。',
      action: {
        type: 'observe',
        highlight: ['nand-2'],
      },
    },
    {
      id: 'nand-as-and',
      instruction: 'NANDゲートを2つ使ってANDゲートを作ることもできます。NANDの出力をもう一度反転（NANDでNOT）すればANDになります。',
      action: {
        type: 'explanation',
        content: `
# NANDゲートでANDゲートを作る

NANDゲートの出力をNOTゲート（NANDで実装）で反転すると、ANDゲートになります。

## 構成
1. 最初のNANDゲート: 通常のNAND動作
2. 2番目のNANDゲート: NOTゲートとして使用（出力を反転）

NAND → NOT = AND

これで、NANDゲートだけでANDゲートを実現できました！
        `,
      },
    },
    {
      id: 'advanced-challenge',
      instruction: 'チャレンジ：NANDゲートだけを使って、ORゲートを作ることができますか？ヒント：ド・モルガンの法則を思い出してください。',
      action: {
        type: 'explanation',
        content: `
# 上級チャレンジ：NANDでORゲートを作る

ド・モルガンの法則により：
A OR B = NOT(NOT A AND NOT B)

NANDゲートで実装すると：
1. 入力AをNANDでNOT → NOT A
2. 入力BをNANDでNOT → NOT B
3. NOT AとNOT BをNANDゲートに入力 → A OR B

3つのNANDゲートでORゲートが実現できます！
        `,
      },
    },
    {
      id: 'conclusion',
      instruction: 'おめでとうございます！NANDゲートの万能性を理解できました。実際のコンピュータチップでは、このNANDゲートが基本構成要素として使われています。',
      action: {
        type: 'explanation',
        content: `
# レッスンのまとめ

## 学んだこと
✅ NANDゲートの基本動作
✅ NANDゲートでNOTゲートを作る方法
✅ NANDゲートでANDゲートを作る方法
✅ NANDゲートの万能性

## 次のステップ
NANDゲートの知識を活かして、より複雑な回路の設計に挑戦してみましょう！
        `,
      },
    },
  ],
  verification: {
    inputs: [
      { 'input-1': false, 'input-2': false },
      { 'input-1': false, 'input-2': true },
      { 'input-1': true, 'input-2': false },
      { 'input-1': true, 'input-2': true },
    ],
    expectedOutputs: [
      { 'output-1': true },
      { 'output-1': true },
      { 'output-1': true },
      { 'output-1': false },
    ],
  },
};