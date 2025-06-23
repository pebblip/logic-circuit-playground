import type { StructuredLesson } from '../../../../types/lesson-content';

export const counterStructuredLesson: StructuredLesson = {
  id: 'counter',
  title: 'カウンタ - 数を数える回路',
  description: '2ビットバイナリカウンタを段階的に構築します',
  difficulty: 'advanced',
  prerequisites: ['d-flip-flop'],
  estimatedMinutes: 20,
  availableGates: ['OUTPUT', 'CLOCK', 'D-FF', 'NOT', 'OR'],
  steps: [
    {
      id: 'intro',
      instruction: '2ビットカウンタを作ろう！',
      content: [
        {
          type: 'text',
          text: 'クロック信号に合わせて自動的に数える回路を作ります。',
        },
        {
          type: 'heading',
          text: '今回の目標',
        },
        {
          type: 'table',
          headers: ['クロック', 'Q1', 'Q0', '10進数'],
          rows: [
            ['初期', '0', '0', '0'],
            ['1回目', '0', '1', '1'],
            ['2回目', '1', '0', '2'],
            ['3回目', '1', '1', '3'],
            ['4回目', '0', '0', '0（リセット）'],
          ],
        },
        {
          type: 'note',
          text: '00→01→10→11→00... と繰り返します',
        },
      ],
    },
    {
      id: 'circuit-design',
      instruction: '回路の設計',
      content: [
        {
          type: 'heading',
          text: '必要な部品',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'CLOCK：カウントのタイミング',
            '2つのD-FF：状態記憶（Q1, Q0）',
            'NOT・OR：次状態の計算',
            '2つのOUTPUT：カウント値表示',
          ],
        },
        {
          type: 'text',
          text: '各D-FFの次状態を計算してD入力に接続します。',
        },
      ],
    },
    {
      id: 'logic-design',
      instruction: 'カウンタロジックの設計',
      content: [
        {
          type: 'heading',
          text: '次状態の計算',
        },
        {
          type: 'text',
          text: '現在の値から次の値を決めるロジック：',
        },
        {
          type: 'table',
          headers: ['現在 Q1Q0', '次 Q1Q0', 'D1入力', 'D0入力'],
          rows: [
            ['00', '01', '0', '1'],
            ['01', '10', '1', '0'],
            ['10', '11', '1', '1'],
            ['11', '00', '0', '0'],
          ],
        },
        {
          type: 'text',
          text: 'D1 = Q0、D0 = NOT Q0 というシンプルな式で実現できます！',
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の実装方針',
      content: [
        {
          type: 'text',
          text: 'T-FFの代わりにD-FFを使って構築します。',
        },
        {
          type: 'heading',
          text: '必要な接続',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            "各D-FFのDにQ'を接続（トグル動作）",
            '1段目のCLKに外部クロック',
            "2段目のCLKに1段目のQ'",
          ],
        },
      ],
    },
    {
      id: 'place-clock',
      instruction: 'CLOCKゲートを配置',
      hint: 'カウントの基準となるクロック信号',
      content: [
        {
          type: 'text',
          text: 'これがカウントのペースメーカーです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'CLOCK' },
    },
    {
      id: 'place-first-dff',
      instruction: '1段目のD-FFを配置',
      hint: '最下位ビット（Q0）用',
      content: [
        {
          type: 'text',
          text: 'CLKごとに0と1を交互に出力します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-second-dff',
      instruction: '2段目のD-FFを配置',
      hint: '上位ビット（Q1）用',
      content: [
        {
          type: 'text',
          text: 'Q0が1→0になるたびに反転します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'D-FF' },
    },
    {
      id: 'place-outputs',
      instruction: 'STEP4: 出力表示を配置',
      hint: 'カウント値表示用の2つのOUTPUT',
      content: [
        {
          type: 'text',
          text: 'キャンバスの右端に2つのOUTPUTを縦に配置します。',
        },
        {
          type: 'list',
          ordered: true,
          items: ['上：Q1（上位ビット）', '下：Q0（下位ビット）'],
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-clock',
      instruction: 'STEP5: クロック配線',
      hint: 'CLOCKを両方のD-FFのCLKピンに接続',
      content: [
        {
          type: 'text',
          text: 'CLOCKゲートの出力を両方のD-FFのCLKピンに接続します。',
        },
        {
          type: 'note',
          text: '同期式カウンタでは全てのFFが同時に更新されます',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-d0-logic',
      instruction: 'STEP6: Q0の次状態計算',
      hint: 'NOTゲートでQ0を反転してD0入力へ',
      content: [
        {
          type: 'text',
          text: '下位ビットの次状態を計算：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Q0の出力をNOTゲートに接続',
            'NOTゲートの出力をQ0のD入力に接続',
          ],
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-d1-logic',
      instruction: 'STEP7: Q1の次状態計算',
      hint: 'Q0の値をQ1のD入力に直接接続',
      content: [
        {
          type: 'text',
          text: '上位ビットの次状態を計算：',
        },
        {
          type: 'text',
          text: 'Q0の出力をQ1のD入力に直接接続します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: 'STEP8: 出力表示配線',
      hint: '各D-FFのQ出力を対応するOUTPUTに接続',
      content: [
        {
          type: 'text',
          text: 'カウント値を表示する配線：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Q0の出力→下のOUTPUT（下位ビット）',
            'Q1の出力→上のOUTPUT（上位ビット）',
          ],
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-counting',
      instruction: 'STEP9: 動作テスト',
      content: [
        {
          type: 'heading',
          text: 'カウントテスト',
        },
        {
          type: 'text',
          text: 'CLOCKゲートを動かして、次の順序でカウントされることを確認します：',
        },
        {
          type: 'table',
          headers: ['クロック', 'Q1', 'Q0', '10進数'],
          rows: [
            ['初期', '0', '0', '0'],
            ['1回目', '0', '1', '1'],
            ['2回目', '1', '0', '2'],
            ['3回目', '1', '1', '3'],
            ['4回目', '0', '0', '0 (リセット)'],
          ],
        },
        {
          type: 'note',
          text: '各クロックで正しくカウントアップし、4回目でリセットされることを確認',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'mid-quiz',
      instruction: '理解度チェック',
      content: [
        {
          type: 'quiz',
          question: '2ビットカウンタで、状態　10」の次は何になる？',
          options: ['00', '01', '10', '11'],
          correctIndex: 3,
        },
      ],
    },
    {
      id: 'practical-applications',
      instruction: '【応用】カウンタの世界',
      content: [
        {
          type: 'heading',
          text: '身近なカウンタシステム',
        },
        {
          type: 'text',
          text: '今作ったカウンタの原理は、様々な場所で使われています：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'デジタル時計の秒・分・時間表示',
            'ゲームのスコアやタイマー',
            'CPUの周波数分割器',
            '車のスピードメーター',
            '電気メーターの使用量計測',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: 'カウンタマスター！',
      content: [
        {
          type: 'heading',
          text: 'おめでとうございます！',
        },
        {
          type: 'text',
          text: 'あなたは以下の重要なスキルを習得しました：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '同期式バイナリカウンタの設計',
            '組み合わせ回路による次状態計算',
            'クロック同期制御システム',
            'デジタル計数回路の構築',
            '実用カウンタシステムの理解',
          ],
        },
        {
          type: 'note',
          text: 'これで時間や回数を自動で数えるシステムが作れます！',
        },
      ],
    },
    {
      id: 'final-quiz',
      instruction: '最終理解度チェック',
      content: [
        {
          type: 'quiz',
          question: '2ビットカウンタで、最大カウント値はいくつ？',
          options: ['2', '3', '4', '7'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
