import type { StructuredLesson } from '../../../../types/lesson-content';

export const fourBitAdderStructuredLesson: StructuredLesson = {
  id: '4bit-adder',
  title: '4ビット加算器 - 本格的な計算機',
  description: '4ビットの数同士を足し算できる実用的な回路を作ります',
  icon: '🔢',
  difficulty: 'intermediate',
  prerequisites: ['full-adder'],
  estimatedMinutes: 25,
  steps: [
    {
      id: 'intro',
      instruction: '実用的な計算機を作ろう！',
      content: [
        {
          type: 'text',
          text: '今回は0〜15までの数を足し算できる本格的な回路を作ります！',
        },
        {
          type: 'heading',
          text: '🎯 目標',
          icon: '🎯',
        },
        {
          type: 'text',
          text: '例：1010 + 0110 = 10000（10 + 6 = 16）',
        },
        {
          type: 'note',
          text: '4ビットで表せるのは0〜15まで。16以上は5ビット目（繰り上がり）が必要！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'binary-review',
      instruction: '4ビット2進数の復習',
      content: [
        {
          type: 'heading',
          text: '📊 4ビットで表せる数',
          icon: '📊',
        },
        {
          type: 'table',
          headers: ['10進数', '2進数', '計算式'],
          rows: [
            ['0', '0000', '0×8 + 0×4 + 0×2 + 0×1'],
            ['5', '0101', '0×8 + 1×4 + 0×2 + 1×1'],
            ['10', '1010', '1×8 + 0×4 + 1×2 + 0×1'],
            ['15', '1111', '1×8 + 1×4 + 1×2 + 1×1'],
          ],
        },
        {
          type: 'text',
          text: '各桁の重みは右から 1, 2, 4, 8 です。',
        },
      ],
    },
    {
      id: 'design-concept',
      instruction: '設計コンセプト：リップルキャリー',
      content: [
        {
          type: 'heading',
          text: '🔗 全加算器を4つ連結！',
          icon: '🔗',
        },
        {
          type: 'text',
          text: '各桁の計算を全加算器が担当し、繰り上がりが次の桁に伝わります。',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '1桁目：A0 + B0 → S0, C1',
            '2桁目：A1 + B1 + C1 → S1, C2',
            '3桁目：A2 + B2 + C2 → S2, C3',
            '4桁目：A3 + B3 + C3 → S3, C4',
          ],
        },
        {
          type: 'note',
          text: '繰り上がりが波のように伝わるので「リップル（波紋）」キャリー',
          icon: '🌊',
        },
      ],
    },
    {
      id: 'simplified-design',
      instruction: '今回の簡略化バージョン',
      content: [
        {
          type: 'text',
          text: '実際に4つの全加算器を配置すると複雑すぎるので...',
        },
        {
          type: 'heading',
          text: '💡 カスタムゲートを活用！',
          icon: '💡',
        },
        {
          type: 'text',
          text: '前回作った全加算器をカスタムゲートとして保存し、それを4つ使います。',
        },
        {
          type: 'note',
          text: 'まだ全加算器を保存していない場合は、先に作成して保存してください',
          icon: '⚠️',
        },
      ],
    },
    {
      id: 'place-number-a',
      instruction: '数値A（4ビット）の入力を配置',
      hint: '4つのINPUTを縦に並べて配置（A3, A2, A1, A0）',
      content: [
        {
          type: 'text',
          text: '上から順に8の位、4の位、2の位、1の位です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-number-b',
      instruction: '数値B（4ビット）の入力を配置',
      hint: 'Aの右側に、同じく4つのINPUTを配置（B3, B2, B1, B0）',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-adders',
      instruction: '全加算器（またはその代替）を配置',
      hint: 'カスタムゲートの全加算器を4つ、または基本ゲートで構成',
      content: [
        {
          type: 'text',
          text: '各桁の計算を行う全加算器を配置します。',
        },
        {
          type: 'note',
          text: '最下位ビット（1の位）は半加算器でもOK（Cin=0だから）',
          icon: '💡',
        },
      ],
      action: { type: 'place-gate', gateType: 'CUSTOM' },
    },
    {
      id: 'place-outputs',
      instruction: '出力（5ビット）を配置',
      hint: '4つの和（S3〜S0）と最終繰り上がり（C4）の計5つのOUTPUT',
      content: [
        {
          type: 'text',
          text: '結果は最大5ビット（0〜31）になる可能性があります。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-inputs',
      instruction: '配線：入力を各加算器へ',
      hint: '各桁のAとBを対応する加算器に接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-carries',
      instruction: '配線：繰り上がりの連鎖',
      hint: '各加算器のCoutを次の加算器のCinに接続',
      content: [
        {
          type: 'text',
          text: '繰り上がりが桁から桁へと伝わっていきます。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-outputs',
      instruction: '配線：結果の出力',
      hint: '各加算器のSumを対応するOUTPUTに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-simple',
      instruction: 'テスト1：簡単な計算（2 + 3）',
      content: [
        {
          type: 'text',
          text: 'A = 0010（2）、B = 0011（3）をセット',
        },
        {
          type: 'note',
          text: '結果は 00101（5）になるはずです',
          icon: '🎯',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-carry',
      instruction: 'テスト2：繰り上がりあり（7 + 9）',
      content: [
        {
          type: 'text',
          text: 'A = 0111（7）、B = 1001（9）をセット',
        },
        {
          type: 'note',
          text: '結果は 10000（16）- 5ビット目に繰り上がり！',
          icon: '🎯',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-max',
      instruction: 'テスト3：最大値（15 + 15）',
      content: [
        {
          type: 'text',
          text: 'A = 1111（15）、B = 1111（15）をセット',
        },
        {
          type: 'note',
          text: '結果は 11110（30）になります',
          icon: '🎯',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'ripple-effect',
      instruction: '【観察】リップル効果を見よう',
      content: [
        {
          type: 'heading',
          text: '🌊 繰り上がりの波',
          icon: '🌊',
        },
        {
          type: 'text',
          text: '1111 + 0001 を計算すると...',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '1桁目：1+1=10 → 繰り上がり発生',
            '2桁目：1+0+1=10 → また繰り上がり',
            '3桁目：1+0+1=10 → さらに繰り上がり',
            '4桁目：1+0+1=10 → 最後も繰り上がり',
            '結果：10000（16）',
          ],
        },
        {
          type: 'note',
          text: '繰り上がりが連鎖的に伝わる様子が「波紋」のよう！',
          icon: '💫',
        },
      ],
    },
    {
      id: 'real-world',
      instruction: '【応用】実際のコンピュータでは',
      content: [
        {
          type: 'heading',
          text: '💻 現代のCPU',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '32ビット加算器：約42億までの数を計算',
            '64ビット加算器：約1844京までの数を計算',
            '並列処理：複数の加算を同時実行',
          ],
        },
        {
          type: 'heading',
          text: '⚡ 高速化の工夫',
          icon: '⚡',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'キャリールックアヘッド：繰り上がりを予測',
            'パイプライン：複数の計算を流れ作業',
            'SIMD：複数のデータを一度に計算',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 4ビット加算器完成！',
      content: [
        {
          type: 'heading',
          text: '🏆 できるようになったこと',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 0〜15の数同士の足し算',
            '✅ 繰り上がりの連鎖処理',
            '✅ 5ビット（0〜31）の結果出力',
            '✅ 実用的な計算回路の構築',
          ],
        },
        {
          type: 'note',
          text: 'これがコンピュータの計算の基礎です！',
          icon: '✨',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: '4ビット加算器で 1111 + 0001 を計算した結果は？',
          options: ['1111（15）', '0000（0）', '10000（16）', 'エラー'],
          correctIndex: 2,
        },
      ],
    },
  ],
};
