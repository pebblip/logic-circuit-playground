import type { StructuredLesson } from '../../../../types/lesson-content';

export const comparatorStructuredLesson: StructuredLesson = {
  id: 'comparator',
  title: '比較器 - 数の大小判定マシン',
  description: '2つの数値を比較して大小関係を判定する回路を作ります',
  icon: '⚖️',
  difficulty: 'intermediate',
  prerequisites: ['xor-gate'],
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      instruction: '数の大小を判定する回路を作ろう！',
      content: [
        {
          type: 'text',
          text: 'コンピュータはどうやって「5 > 3」を判定するのでしょうか？',
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
          icon: '🎯',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'A > B を判定する回路',
            'A = B を判定する回路',
            'A < B を判定する回路',
          ],
        },
        {
          type: 'note',
          text: 'まずは1ビット比較器から始めて、段階的に拡張します',
          icon: '📈',
        },
      ],
    },
    {
      id: 'one-bit-concept',
      instruction: '1ビット比較の基本',
      content: [
        {
          type: 'heading',
          text: '📊 1ビット比較の真理値表',
          icon: '📊',
        },
        {
          type: 'table',
          headers: ['A', 'B', 'A>B', 'A=B', 'A<B'],
          rows: [
            ['0', '0', '0', '1', '0'],
            ['0', '1', '0', '0', '1'],
            ['1', '0', '1', '0', '0'],
            ['1', '1', '0', '1', '0'],
          ],
        },
        {
          type: 'heading',
          text: '💡 パターンを見つけよう',
          icon: '💡',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'A = B：両方同じとき1 → XNORゲート！',
            'A > B：Aが1でBが0のとき → A AND (NOT B)',
            'A < B：Aが0でBが1のとき → (NOT A) AND B',
          ],
        },
      ],
    },
    {
      id: 'equality-circuit',
      instruction: 'まず「等しい」を判定する回路を作ろう',
      content: [
        {
          type: 'heading',
          text: '🔍 XNORゲートの活用',
          icon: '🔍',
        },
        {
          type: 'text',
          text: 'XNORは「同じなら1、違えば0」を出力します。',
        },
        {
          type: 'note',
          text: 'XNORがない場合は、XORの出力をNOTで反転！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'place-inputs',
      instruction: '入力AとBを配置',
      hint: '2つのINPUTを縦に並べて配置',
      content: [
        {
          type: 'text',
          text: '上がA、下がBです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-xor-not',
      instruction: 'XORとNOTで等値判定回路を作成',
      hint: 'XORゲートとNOTゲートを配置（XNORの代わり）',
      content: [
        {
          type: 'text',
          text: 'A XOR B の結果をNOTで反転すると、A = B の判定ができます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'place-greater-than',
      instruction: '「A > B」判定回路を追加',
      hint: 'NOTゲート（B用）とANDゲートを配置',
      content: [
        {
          type: 'text',
          text: 'A AND (NOT B) で「Aが1でBが0」を検出します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-less-than',
      instruction: '「A < B」判定回路を追加',
      hint: 'もう1つのNOTゲート（A用）とANDゲートを配置',
      content: [
        {
          type: 'text',
          text: '(NOT A) AND B で「Aが0でBが1」を検出します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-outputs',
      instruction: '3つの出力を配置',
      hint: '「A=B」「A>B」「A<B」の3つのOUTPUT',
      content: [
        {
          type: 'note',
          text: '上から順に「等しい」「より大きい」「より小さい」です',
          icon: '📍',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-equality',
      instruction: '配線：等値判定部分',
      hint: 'A,B → XOR → NOT → 「A=B」OUTPUT',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-greater',
      instruction: '配線：A > B 判定部分',
      hint: 'A → AND、B → NOT → AND → 「A>B」OUTPUT',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-less',
      instruction: '配線：A < B 判定部分',
      hint: 'A → NOT → AND、B → AND → 「A<B」OUTPUT',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-equal',
      instruction: 'テスト1：A = B（両方0または両方1）',
      content: [
        {
          type: 'text',
          text: '両方0、または両方1にして、「A=B」だけが点灯することを確認。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-greater',
      instruction: 'テスト2：A > B（A=1, B=0）',
      content: [
        {
          type: 'text',
          text: 'A=1、B=0にして、「A>B」だけが点灯することを確認。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-less',
      instruction: 'テスト3：A < B（A=0, B=1）',
      content: [
        {
          type: 'text',
          text: 'A=0、B=1にして、「A<B」だけが点灯することを確認。',
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'multi-bit-intro',
      instruction: '【発展】複数ビットの比較',
      content: [
        {
          type: 'heading',
          text: '🔢 2ビット以上の比較',
          icon: '🔢',
        },
        {
          type: 'text',
          text: '例：11 vs 10（3 vs 2）を比較するには？',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '最上位ビットから比較開始',
            '同じなら次のビットへ',
            '違いが見つかったらそこで決定',
          ],
        },
        {
          type: 'note',
          text: '人間が数字を比較するのと同じ方法です！',
          icon: '💡',
        },
      ],
    },
    {
      id: 'cascading',
      instruction: 'カスケード接続の仕組み',
      content: [
        {
          type: 'heading',
          text: '🔗 比較器の連結',
          icon: '🔗',
        },
        {
          type: 'text',
          text: '複数の1ビット比較器を接続して、多ビット比較器を作れます。',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '上位ビットの結果を優先',
            '等しい場合のみ下位ビットを参照',
            'カスケード（階段状）に接続',
          ],
        },
      ],
    },
    {
      id: 'applications',
      instruction: '【応用】比較器の使い道',
      content: [
        {
          type: 'heading',
          text: '💻 実用例',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '📊 ソート処理：数値の並び替え',
            '🎮 ゲーム：スコアの比較',
            '🔍 検索：条件分岐（if文）の実装',
            '📈 統計：最大値・最小値の検出',
            '🏦 金融：価格の比較判定',
          ],
        },
      ],
    },
    {
      id: 'cpu-usage',
      instruction: 'CPUでの活用',
      content: [
        {
          type: 'heading',
          text: '🖥️ プロセッサ内部',
          icon: '🖥️',
        },
        {
          type: 'text',
          text: '比較器はCPUの重要な部品です：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'ALU（演算装置）の一部',
            '条件分岐命令の実行',
            'ループカウンタの判定',
            'メモリアドレスの範囲チェック',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 比較器マスター！',
      content: [
        {
          type: 'heading',
          text: '🏆 習得したスキル',
          icon: '🏆',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '✅ 1ビット数値の大小比較',
            '✅ 等値判定回路の構築',
            '✅ 3つの出力を同時制御',
            '✅ 論理ゲートの組み合わせ応用',
          ],
        },
        {
          type: 'note',
          text: 'これでコンピュータの「判断力」の基礎が理解できました！',
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
          question: '1ビット比較器で A=1, B=0 のとき、どの出力が1になる？',
          options: ['A = B', 'A > B', 'A < B', 'すべて0'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
