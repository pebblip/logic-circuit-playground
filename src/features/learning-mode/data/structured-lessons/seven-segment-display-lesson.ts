import type { Lesson } from '../lessons';

export const sevenSegmentDisplayStructuredLesson: Lesson = {
  id: 'seven-segment-display',
  title: '7セグメントディスプレイ - 数字表示の仕組み',
  description:
    '7セグメントディスプレイの仕組みを理解し、論理ゲートを使って数字を表示する回路を設計します。',
  objective: '7セグメントディスプレイの原理を理解し、簡単な表示回路を構築する',
  difficulty: 'intermediate',
  estimatedMinutes: 25,
  prerequisites: ['decoder', 'and-gate', 'or-gate'],
  category: 'combinational',
  icon: '🔢',
  steps: [
    {
      id: 'introduction',
      instruction:
        '7セグメントディスプレイは、電卓や時計などで数字を表示するために広く使われています。',
      action: {
        type: 'explanation',
        content: `
# 7セグメントディスプレイ入門

7セグメントディスプレイは、7つのLEDセグメント（a〜g）を組み合わせて数字を表示します。

## セグメント配置
\`\`\`
 aaa
f   b
 ggg
e   c
 ddd
\`\`\`

## 数字とセグメントの対応
| 数字 | a | b | c | d | e | f | g | 表示 |
|------|---|---|---|---|---|---|---|------|
| 0    | 1 | 1 | 1 | 1 | 1 | 1 | 0 | ０ |
| 1    | 0 | 1 | 1 | 0 | 0 | 0 | 0 | １ |
| 2    | 1 | 1 | 0 | 1 | 1 | 0 | 1 | ２ |
| 3    | 1 | 1 | 1 | 1 | 0 | 0 | 1 | ３ |
| ... など

各セグメントをON/OFFすることで、0〜9の数字を表現できます。
        `,
      },
    },
    {
      id: 'place-outputs',
      instruction:
        '7セグメントディスプレイの代わりに、7つのOUTPUTゲート（a〜g）を配置して、各セグメントを表現しましょう。',
      action: {
        type: 'explanation',
        content: `
# 7セグメントの表現方法

実際の回路では、7つの出力信号でセグメントを制御します。

## OUTPUT配置
- 出力a: 上部の横線
- 出力b: 右上の縦線
- 出力c: 右下の縦線
- 出力d: 下部の横線
- 出力e: 左下の縦線
- 出力f: 左上の縦線
- 出力g: 中央の横線

各OUTPUTゲートがON（1）の時、対応するセグメントが点灯します。
        `,
      },
    },
    {
      id: 'understand-inputs',
      instruction:
        'まず、簡単な例として「1」を表示する回路を作ってみましょう。',
      action: {
        type: 'explanation',
        content: `
# 数字「1」の表示回路

数字「1」を表示するには、セグメントbとcだけをONにします。

## 必要なセグメント
- a: OFF (0)
- b: ON  (1) ← 右上の縦線
- c: ON  (1) ← 右下の縦線
- d: OFF (0)
- e: OFF (0)
- f: OFF (0)
- g: OFF (0)

まず、2つのOUTPUTゲート（bとc用）を配置します。
        `,
      },
    },
    {
      id: 'place-output-b',
      instruction: 'セグメントb用のOUTPUTゲートを配置しましょう。',
      action: {
        type: 'place-gate',
        gateType: 'OUTPUT',
        position: { x: 600, y: 200 },
      },
    },
    {
      id: 'place-output-c',
      instruction: 'セグメントc用のOUTPUTゲートを配置します。',
      action: {
        type: 'place-gate',
        gateType: 'OUTPUT',
        position: { x: 600, y: 250 },
      },
    },
    {
      id: 'place-input-for-one',
      instruction: '1を常に表示するため、INPUTゲートを配置してONにします。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 400, y: 225 },
      },
    },
    {
      id: 'connect-for-one',
      instruction:
        'INPUTゲートを両方のOUTPUTゲートに接続して、セグメントb,cを点灯させましょう。',
      action: {
        type: 'observe',
        highlight: ['input-1', 'output-b', 'output-c'],
      },
    },
    {
      id: 'bcd-introduction',
      instruction:
        'より実用的な回路として、BCD（2進化10進数）から7セグメントへのデコーダを作ってみましょう。',
      action: {
        type: 'explanation',
        content: `
# BCDから7セグメントデコーダ

BCD（Binary Coded Decimal）は、10進数の各桁を4ビットの2進数で表現します。

## BCD表現
| 10進数 | BCD (D C B A) |
|--------|---------------|
| 0      | 0 0 0 0      |
| 1      | 0 0 0 1      |
| 2      | 0 0 1 0      |
| 3      | 0 0 1 1      |
| ...    | ...          |
| 9      | 1 0 0 1      |

4ビットの入力から、7つのセグメント信号を生成する回路を設計します。
        `,
      },
    },
    {
      id: 'segment-a-logic',
      instruction:
        'セグメントaの論理式を考えてみましょう。数字0,2,3,5,6,7,8,9でaがONになります。',
      action: {
        type: 'explanation',
        content: `
# セグメントaの論理設計

セグメントaがONになる条件をカルノー図で簡略化すると：

a = D + B + (C⊕A) + (¬C·¬A)

これは以下の場合にONになります：
- D=1の時（8,9）
- B=1の時（2,3,6,7）
- CとAが異なる時（2,3,5,6）
- CもAも0の時（0,8）

実際の回路では、この論理式をAND、OR、XOR、NOTゲートで実装します。
        `,
      },
    },
    {
      id: 'place-bcd-inputs',
      instruction: 'BCD入力用の4つのINPUTゲート（A,B,C,D）を配置しましょう。',
      action: {
        type: 'place-gate',
        gateType: 'INPUT',
        position: { x: 100, y: 200 },
      },
    },
    {
      id: 'quiz-segment-pattern',
      instruction:
        'クイズ：数字「8」を表示するには、どのセグメントをONにする必要がありますか？',
      action: {
        type: 'quiz',
        question: '数字「8」を表示するために必要なセグメントは？',
        options: [
          '全てのセグメント（a〜g）',
          'a,b,c,d,e,fのみ（gはOFF）',
          'a,b,c,dのみ',
        ],
        correct: 0,
      },
      validation: {
        type: 'quiz-answered',
        expected: 0,
      },
    },
    {
      id: 'decoder-complexity',
      instruction:
        '完全なBCD-7セグメントデコーダは複雑ですが、実際のICチップとして販売されています（例：74LS47）。',
      action: {
        type: 'explanation',
        content: `
# 実用的なデコーダIC

## 74LS47の特徴
- 4ビットBCD入力
- 7セグメント出力（アクティブLOW）
- ランプテスト機能
- ブランキング機能

## 応用例
1. **デジタル時計**: 時・分・秒の表示
2. **電卓**: 計算結果の表示
3. **計測器**: 測定値の表示
4. **カウンタ表示**: イベントカウントの可視化

7セグメントディスプレイは、シンプルながら非常に実用的な表示デバイスです。
        `,
      },
    },
    {
      id: 'multiplexing-intro',
      instruction:
        '複数桁の表示では、ダイナミック点灯（多重化）という技術を使って、配線数を削減します。',
      action: {
        type: 'explanation',
        content: `
# ダイナミック点灯技術

4桁の7セグメントディスプレイを考えてみましょう。

## 静的駆動の問題
- 4桁 × 7セグメント = 28本の配線が必要

## ダイナミック点灯の解決策
1. 7セグメント信号を共通化
2. 各桁を高速で順番に点灯
3. 人間の目には同時点灯に見える

## 必要な配線
- 7セグメント信号: 7本
- 桁選択信号: 4本
- 合計: 11本（大幅削減！）

この技術により、少ない配線で多桁表示が可能になります。
        `,
      },
    },
    {
      id: 'conclusion',
      instruction:
        'おめでとうございます！7セグメントディスプレイの原理と、実用的な応用について学びました。',
      action: {
        type: 'explanation',
        content: `
# レッスンのまとめ

## 学んだこと
- 7セグメントディスプレイの構造
- 数字とセグメントパターンの対応
- BCDから7セグメントへのデコード
- 実用的なデコーダICの存在
- ダイナミック点灯技術

## 次のステップ
- 完全なBCD-7セグメントデコーダの設計
- 多桁表示システムの構築
- カウンタと組み合わせた応用回路

7セグメントディスプレイは、デジタル回路の出力を人間が読める形にする重要な要素です！
        `,
      },
    },
  ],
  verification: {
    inputs: [
      { 'input-a': false, 'input-b': true, 'input-c': true, 'input-d': false },
    ],
    expectedOutputs: [
      { 'segment-b': true, 'segment-c': true }, // セグメントb,cがONで「1」を表示
    ],
  },
};
