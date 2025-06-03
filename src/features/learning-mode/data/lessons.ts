// ultrathink - シンプルで段階的な学習体験
import React from 'react';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[]; // lesson IDs
  steps: LessonStep[];
  verification?: CircuitVerification;
}

export interface LessonStep {
  id: string;
  instruction: string;
  hint?: string;
  action: StepAction;
  validation?: StepValidation;
}

export type StepAction =
  | {
      type: 'place-gate';
      gateType: string;
      position?: { x: number; y: number };
    }
  | { type: 'connect-wire'; from: string; to: string }
  | { type: 'toggle-input'; gateId: string; value: boolean }
  | { type: 'observe'; highlight?: string[] }
  | { type: 'quiz'; question: string; options: string[]; correct: number };

export interface StepValidation {
  type: 'gate-placed' | 'wire-connected' | 'output-matches' | 'quiz-answered';
  expected?: any;
}

export interface CircuitVerification {
  inputs: { [key: string]: boolean }[];
  expectedOutputs: { [key: string]: boolean }[];
}

// ultrathink - 最初のレッスンは超シンプルに
export const lessons: Lesson[] = [
  {
    id: 'intro-not-gate',
    title: 'はじめてのNOTゲート',
    description: '信号を反転させる魔法を学ぼう！',
    objective: 'NOTゲートの動作を理解し、入力と出力の関係を確認する',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    prerequisites: [],
    steps: [
      {
        id: 'welcome',
        instruction:
          'ようこそ！今日は「NOTゲート」という、信号を逆転させる部品について学びます。',
        action: { type: 'observe' },
      },
      {
        id: 'place-input',
        instruction:
          'まず、INPUTゲート（スイッチ）を配置してみましょう。左のパレットから「INPUT」をクリックしてください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-not',
        instruction:
          '次に、NOTゲートを配置します。「NOT」をクリックしてください。',
        action: { type: 'place-gate', gateType: 'NOT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-output',
        instruction:
          '最後に、結果を見るためのOUTPUTゲート（LED）を配置しましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'connect-input-to-not',
        instruction:
          'INPUTの出力ピン（右側の点）をクリックして、NOTゲートの入力ピン（左側の点）に接続してください。',
        hint: 'ピンをクリックすると緑の線が出ます。もう一方のピンをクリックすると接続完了！',
        action: { type: 'connect-wire', from: 'INPUT', to: 'NOT' },
        validation: { type: 'wire-connected' },
      },
      {
        id: 'connect-not-to-output',
        instruction: 'NOTゲートの出力をOUTPUTゲートに接続しましょう。',
        action: { type: 'connect-wire', from: 'NOT', to: 'OUTPUT' },
        validation: { type: 'wire-connected' },
      },
      {
        id: 'test-off',
        instruction:
          'INPUTをダブルクリックしてOFFの状態を確認してください。OUTPUTはどうなりましたか？',
        action: { type: 'toggle-input', gateId: 'INPUT', value: false },
        validation: { type: 'output-matches', expected: { OUTPUT: true } },
      },
      {
        id: 'test-on',
        instruction:
          'もう一度INPUTをダブルクリックしてONにしてみましょう。今度はどうなりましたか？',
        action: { type: 'toggle-input', gateId: 'INPUT', value: true },
        validation: { type: 'output-matches', expected: { OUTPUT: false } },
      },
      {
        id: 'quiz',
        instruction: 'NOTゲートの動作を理解できましたか？',
        action: {
          type: 'quiz',
          question: 'NOTゲートに「1」を入力すると、出力は何になりますか？',
          options: ['0', '1', '変わらない', 'エラーになる'],
          correct: 0,
        },
        validation: { type: 'quiz-answered' },
      },
      {
        id: 'complete',
        instruction:
          '素晴らしい！NOTゲートは入力を反転させることが分かりました。0→1、1→0に変換する、デジタル世界の「反対言葉」です！',
        action: { type: 'observe' },
      },
    ],
  },

  {
    id: 'intro-and-gate',
    title: 'ANDゲート - 両方必要！',
    description: '2つの条件が両方満たされた時だけ動作する仕組みを学ぼう',
    objective: 'ANDゲートの「両方ON」の条件を理解する',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    prerequisites: ['intro-not-gate'],
    steps: [
      {
        id: 'intro',
        instruction:
          'ANDゲートは「両方の入力がONの時だけ」出力がONになります。エレベーターのドアのように、「ドアが閉まっている」AND「ボタンが押された」時だけ動きます。',
        action: { type: 'observe' },
      },
      {
        id: 'place-input-1',
        instruction: '1つ目のINPUTゲートを配置してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-input-2',
        instruction: '2つ目のINPUTゲートを配置してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-and',
        instruction: 'ANDゲートを配置しましょう。',
        action: { type: 'place-gate', gateType: 'AND' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-output',
        instruction:
          'OUTPUTゲートを配置して、結果を確認できるようにしましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'connect-wires',
        instruction:
          '2つのINPUTをANDゲートの入力に、ANDゲートの出力をOUTPUTに接続してください。',
        hint: '上のINPUT→ANDの上入力、下のINPUT→ANDの下入力のように接続します。',
        action: { type: 'observe' },
      },
      {
        id: 'test-00',
        instruction:
          '両方のINPUTをOFF（0）にしてみましょう。OUTPUTはどうなりますか？',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: false } },
      },
      {
        id: 'test-01',
        instruction:
          '下のINPUTだけONにしてみましょう。OUTPUTは変わりましたか？',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: false } },
      },
      {
        id: 'test-10',
        instruction: '今度は上のINPUTだけONにしてみましょう。',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: false } },
      },
      {
        id: 'test-11',
        instruction: '最後に、両方のINPUTをONにしてみましょう！',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: true } },
      },
      {
        id: 'quiz',
        instruction: 'ANDゲートの動作を理解できましたか？',
        action: {
          type: 'quiz',
          question: 'ANDゲートが「1」を出力するのはどんな時？',
          options: [
            'どちらか一方が1の時',
            '両方が1の時',
            '両方が0の時',
            'いつでも1',
          ],
          correct: 1,
        },
        validation: { type: 'quiz-answered' },
      },
      {
        id: 'complete',
        instruction:
          '完璧です！ANDゲートは「両方の条件が満たされた時」だけ動作します。まるで「パスワード」AND「指紋」の両方が必要なセキュリティシステムのようですね！',
        action: { type: 'observe' },
      },
    ],
    verification: {
      inputs: [
        { A: false, B: false },
        { A: false, B: true },
        { A: true, B: false },
        { A: true, B: true },
      ],
      expectedOutputs: [{ Y: false }, { Y: false }, { Y: false }, { Y: true }],
    },
  },

  {
    id: 'intro-or-gate',
    title: 'ORゲート - どちらかでOK！',
    description: 'どちらか一方でも条件を満たせば動作する仕組みを学ぼう',
    objective: 'ORゲートの「少なくとも1つON」の条件を理解する',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    prerequisites: ['intro-not-gate'],
    steps: [
      {
        id: 'intro',
        instruction:
          'ORゲートは「どちらか一方でもON」なら出力がONになります。「電車」OR「バス」どちらでも目的地に行けるような感じです！',
        action: { type: 'observe' },
      },
      {
        id: 'place-input-1',
        instruction: '1つ目のINPUTゲートを配置してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-input-2',
        instruction: '2つ目のINPUTゲートを配置してください。',
        action: { type: 'place-gate', gateType: 'INPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-or',
        instruction: 'ORゲートを配置しましょう。',
        action: { type: 'place-gate', gateType: 'OR' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'place-output',
        instruction:
          'OUTPUTゲートを配置して、結果を確認できるようにしましょう。',
        action: { type: 'place-gate', gateType: 'OUTPUT' },
        validation: { type: 'gate-placed' },
      },
      {
        id: 'connect-wires',
        instruction:
          '2つのINPUTをORゲートの入力に、ORゲートの出力をOUTPUTに接続してください。',
        action: { type: 'observe' },
      },
      {
        id: 'test-00',
        instruction:
          '両方のINPUTをOFF（0）にしてみましょう。OUTPUTはどうなりますか？',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: false } },
      },
      {
        id: 'test-01',
        instruction: '下のINPUTだけONにしてみましょう。今度はどうなりますか？',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: true } },
      },
      {
        id: 'test-10',
        instruction: '上のINPUTだけONにしてみましょう。',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: true } },
      },
      {
        id: 'test-11',
        instruction: '両方のINPUTをONにしてみましょう！',
        action: { type: 'observe' },
        validation: { type: 'output-matches', expected: { OUTPUT: true } },
      },
      {
        id: 'compare',
        instruction:
          'ANDゲートとの違いに気づきましたか？ORは「どちらか一方でも」ONならOKです！',
        action: { type: 'observe' },
      },
      {
        id: 'quiz',
        instruction: 'ORゲートの動作を理解できましたか？',
        action: {
          type: 'quiz',
          question: 'ORゲートが「0」を出力するのはどんな時？',
          options: [
            'どちらか一方が0の時',
            '両方が0の時',
            '両方が1の時',
            'いつでも0',
          ],
          correct: 1,
        },
        validation: { type: 'quiz-answered' },
      },
      {
        id: 'complete',
        instruction:
          '素晴らしい！ORゲートは「どちらか一方でも条件を満たせばOK」です。まるで「現金」OR「クレジットカード」どちらでも支払いOKなお店のようですね！',
        action: { type: 'observe' },
      },
    ],
    verification: {
      inputs: [
        { A: false, B: false },
        { A: false, B: true },
        { A: true, B: false },
        { A: true, B: true },
      ],
      expectedOutputs: [{ Y: false }, { Y: true }, { Y: true }, { Y: true }],
    },
  },

  {
    id: 'first-circuit',
    title: '初めての回路 - 警報システム',
    description: '複数のゲートを組み合わせて、実用的な回路を作ろう！',
    objective:
      '「ドアが開いている」OR「窓が開いている」AND「警報がON」の時に警報を鳴らす',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    prerequisites: ['intro-not-gate', 'intro-and-gate', 'intro-or-gate'],
    steps: [
      // 実践的な回路構築のステップ
    ],
  },
];

// カテゴリー別のレッスン整理
export const lessonCategories = {
  basics: {
    title: '基本ゲート',
    lessons: ['intro-not-gate', 'intro-and-gate', 'intro-or-gate'],
  },
  combinations: {
    title: '組み合わせ回路',
    lessons: ['first-circuit'],
  },
};
