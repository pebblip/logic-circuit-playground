import type { Lesson } from '../lessons';

export const jkFlipFlopStructuredLesson: Lesson = {
  id: 'jk-flip-flop',
  title: 'JKフリップフロップ - 高機能な記憶素子',
  description:
    'JKフリップフロップの動作原理と、その優れた機能性について学びます。',
  objective:
    'JKフリップフロップの4つの動作モード（保持、セット、リセット、トグル）を理解し、実用的な応用例を学ぶ',
  difficulty: 'advanced',
  estimatedMinutes: 25,
  prerequisites: ['d-flip-flop', 'sr-latch'],
  category: 'sequential',
  icon: '🔀',
  steps: [
    {
      id: 'introduction',
      instruction:
        'JKフリップフロップは、SRラッチの欠点を解消し、より多機能な記憶素子として開発されました。',
      action: {
        type: 'explanation',
        content: `
# JKフリップフロップ入門

JKフリップフロップは、デジタル回路で最も多用される記憶素子の一つです。

## 特徴
1. **無効状態の解消**: SRラッチのS=R=1の無効状態がない
2. **トグル機能**: J=K=1でクロックごとに出力が反転
3. **完全な制御**: 4つの動作モードを持つ

## 動作モード
| J | K | 動作 |
|---|---|------|
| 0 | 0 | 保持（現在の状態を維持） |
| 0 | 1 | リセット（Q=0） |
| 1 | 0 | セット（Q=1） |
| 1 | 1 | トグル（出力反転） |

※クロックの立ち上がりエッジで動作
        `,
      },
    },
    {
      id: 'place-jk-ff',
      instruction: 'JKフリップフロップを配置しましょう。',
      hint: 'JKフリップフロップは順序回路カテゴリにあります',
      action: {
        type: 'place-gate',
        gateType: 'JK-FF',
        position: { x: 400, y: 300 },
      },
      validation: {
        type: 'gate-placed',
        expected: 'JK-FF',
      },
    },
    {
      id: 'place-clock',
      instruction: 'クロック信号を供給するCLOCKゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'CLOCK',
        position: { x: 200, y: 300 },
      },
    },
    {
      id: 'place-j-input',
      instruction: 'J入力用のINPUTゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 200, y: 200 },
      },
    },
    {
      id: 'place-k-input',
      instruction: 'K入力用のINPUTゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 200, y: 400 },
      },
    },
    {
      id: 'place-outputs',
      instruction:
        'Q出力とQ̄（Qバー）出力を確認するためのOUTPUTゲートを2つ配置します。',
      action: {
        type: 'place-gate',
        gateType: 'OUTPUT',
        position: { x: 600, y: 250 },
      },
    },
    {
      id: 'place-output-qbar',
      instruction: 'Q̄出力用のOUTPUTゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'OUTPUT',
        position: { x: 600, y: 350 },
      },
    },
    {
      id: 'test-hold-mode',
      instruction:
        'まず、保持モード（J=0, K=0）を確認します。CLOCKを動作させても出力が変化しないことを確認してください。',
      action: {
        type: 'observe',
        highlight: ['jk-ff-1', 'clock-1'],
      },
    },
    {
      id: 'test-set-mode',
      instruction:
        'セットモード（J=1, K=0）を試してみましょう。J入力をONにして、クロックパルスで出力Qが1になることを確認します。',
      action: {
        type: 'toggle-input',
        gateId: 'input-j',
        value: true,
      },
    },
    {
      id: 'test-reset-mode',
      instruction:
        'リセットモード（J=0, K=1）を試します。J入力をOFF、K入力をONにして、クロックパルスで出力Qが0になることを確認します。',
      action: {
        type: 'toggle-input',
        gateId: 'input-j',
        value: false,
      },
    },
    {
      id: 'test-toggle-mode',
      instruction:
        'トグルモード（J=1, K=1）を試しましょう！両方の入力をONにすると、クロックパルスごとに出力が反転します。',
      action: {
        type: 'toggle-input',
        gateId: 'input-j',
        value: true,
      },
    },
    {
      id: 'quiz-toggle-output',
      instruction:
        'クイズ：現在Q=0の状態で、J=1, K=1でクロックパルスを2回入力したら、Qの値は？',
      action: {
        type: 'quiz',
        question: 'Q=0から始めて、J=K=1で2回クロックパルスを入力した後のQは？',
        options: ['0', '1', '不定'],
        correct: 0,
      },
      validation: {
        type: 'quiz-answered',
        expected: 0,
      },
    },
    {
      id: 'toggle-counter-intro',
      instruction:
        'JKフリップフロップのトグル機能を使って、簡単な2進カウンタを作ることができます。',
      action: {
        type: 'explanation',
        content: `
# トグルカウンタの作成

JKフリップフロップのJ=K=1のトグルモードを使うと、簡単に分周器やカウンタを作れます。

## 2ビットカウンタの構成
1. 1段目のJK-FF: クロック入力で0→1→0→1を繰り返す
2. 2段目のJK-FF: 1段目の出力をクロックとして使用
3. 結果: 00→01→10→11→00の4進カウンタ

このように、JKフリップフロップを直列に接続することで、任意のビット数のカウンタを構築できます。
        `,
      },
    },
    {
      id: 'build-toggle-counter',
      instruction:
        '2つ目のJKフリップフロップを配置して、2ビットカウンタを作ってみましょう。',
      action: {
        type: 'place-gate',
        gateType: 'JK-FF',
        position: { x: 400, y: 500 },
      },
    },
    {
      id: 'connect-cascade',
      instruction:
        '1段目のJK-FFのQ出力を2段目のCLOCK入力に接続します。両方のJK-FFのJ,K入力は1（HIGH）に固定します。',
      action: {
        type: 'observe',
        highlight: ['jk-ff-1', 'jk-ff-2'],
      },
    },
    {
      id: 'practical-applications',
      instruction:
        'JKフリップフロップは、カウンタ、シフトレジスタ、ステートマシンなど、様々な応用回路で使用されています。',
      action: {
        type: 'explanation',
        content: `
# JKフリップフロップの応用

## 実用例
1. **周波数分周器**: クロック周波数を1/2、1/4などに分周
2. **リップルカウンタ**: 複数段接続で任意進数のカウンタ
3. **シフトレジスタ**: データの並列/直列変換
4. **ステートマシン**: 複雑な制御回路の状態管理

## 利点
- 完全な機能性（4つの動作モード）
- 無効状態がない
- トグル機能による簡単なカウンタ構築
- マスタースレーブ構造による安定動作

JKフリップフロップは、その汎用性から「万能フリップフロップ」とも呼ばれています。
        `,
      },
    },
    {
      id: 'conclusion',
      instruction:
        'おめでとうございます！JKフリップフロップの動作を理解し、実用的な応用例も学びました。',
      action: {
        type: 'explanation',
        content: `
# レッスンのまとめ

## 学んだこと
- JKフリップフロップの4つの動作モード
- トグル機能の仕組みと応用
- 2ビットカウンタの構築方法
- 実用的な応用例

## 次のステップ
JKフリップフロップを使って、より複雑なカウンタやステートマシンの設計に挑戦してみましょう！
        `,
      },
    },
  ],
  verification: {
    inputs: [
      { 'input-j': false, 'input-k': false, clock: true },
      { 'input-j': true, 'input-k': false, clock: true },
      { 'input-j': false, 'input-k': true, clock: true },
      { 'input-j': true, 'input-k': true, clock: true },
    ],
    expectedOutputs: [
      { 'output-q': false }, // 保持（前の状態に依存）
      { 'output-q': true }, // セット
      { 'output-q': false }, // リセット
      { 'output-q': true }, // トグル（前の状態の反転）
    ],
  },
};
