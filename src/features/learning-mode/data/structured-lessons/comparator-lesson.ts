import type { StructuredLesson } from '../../../../types/lesson-content';

export const comparatorStructuredLesson: StructuredLesson = {
  id: 'comparator',
  title: '比較器 - 数の大小判定マシン',
  description: '2つの数値を比較して大小関係を判定する回路を作ります',
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
      id: 'logic-circuit-diagram',
      instruction: '比較器の回路構成',
      content: [
        {
          type: 'heading',
          text: '🔌 1ビット比較器の回路図',
        },
        {
          type: 'text',
          text: '各出力の論理回路：',
        },
        {
          type: 'ascii-art',
          art: `A ─┬────────────────┐
   │               │
   │  ┌─────┐     │  ┌─────┐
   │  │ XOR │─────┼──┤ NOT ├─── A=B
   │  └──┬──┘     │  └─────┘
   │     │        │
   │     │        │  ┌─────┐
   │     │        └──┤ AND ├─── A>B
   │     │           └──┬──┘
   │     │              │
B ─┼─────┴─────┬───────┴───┬─────┐
   │            │         │  ┌──┴──┐
   │  ┌─────┐  │         │  │ NOT │
   │  │ NOT │  │         │  └──┬──┘
   │  └──┬──┘  │         │     │
   │     │     │  ┌─────┐ │     │
   └─────┴─────┴──┤ AND ├─┴─────┘
                    └─────┘─── A<B`,
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
        },
        {
          type: 'text',
          text: 'XNORは「同じなら1、違えば0」を出力します。',
        },
        {
          type: 'note',
          text: 'XNORがない場合は、XORの出力をNOTで反転！',
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
      id: 'multi-bit-extension',
      instruction: '多ビット比較器への拡張',
      content: [
        {
          type: 'heading',
          text: '🔢 4ビット比較器の構成',
        },
        {
          type: 'text',
          text: '4ビット比較器の構成図：',
        },
        {
          type: 'ascii-art',
          art: `    A3 B3     A2 B2     A1 B1     A0 B0
     │ │       │ │       │ │       │ │
   ┌─┴─┴─┐   ┌─┴─┴─┐   ┌─┴─┴─┐   ┌─┴─┴─┐
   │CMP3 │   │CMP2 │   │CMP1 │   │CMP0 │
   └┬┬┬─┘   └┬┬┬─┘   └┬┬┬─┘   └┬┬┬─┘
    │││      │││      │││      │││
   ┌┴┴┴──────┴┴┴──────┴┴┴──────┴┴┴┐
   │      プライオリティエンコーダ       │
   └─────────┬───┬───┬──────────┘
            A>B   A=B   A<B`,
        },
        {
          type: 'note',
          text: '最上位ビットから順に比較し、最初に差が出た結果を採用',
        },
        {
          type: 'heading',
          text: '🔍 多ビット比較の動作例',
        },
        {
          type: 'text',
          text: '4ビット数値の比較過程（例：1011 vs 1001）：',
        },
        {
          type: 'ascii-art',
          art: `A: 1011 (11)  B: 1001 (9)を比較

ビット3: A[3]=1, B[3]=1 → 等しい（次へ）
         ↓
ビット2: A[2]=0, B[2]=0 → 等しい（次へ）
         ↓
ビット1: A[1]=1, B[1]=0 → A > B ✓（決定！）
         ↓
ビット0: 確認不要（既に決定済み）

結果: A > B (11 > 9)`,
        },
        {
          type: 'heading',
          text: '📊 比較器の真理値表（2ビット版）',
        },
        {
          type: 'table',
          headers: ['A1', 'A0', 'B1', 'B0', 'A値', 'B値', 'A>B', 'A=B', 'A<B'],
          rows: [
            ['0', '0', '0', '0', '0', '0', '0', '1', '0'],
            ['0', '1', '0', '0', '1', '0', '1', '0', '0'],
            ['1', '0', '0', '1', '2', '1', '1', '0', '0'],
            ['1', '1', '1', '1', '3', '3', '0', '1', '0'],
          ],
        },
      ],
    },
    {
      id: 'multi-bit-intro',
      instruction: '【発展】複数ビットの比較',
      content: [
        {
          type: 'heading',
          text: '🔢 2ビット以上の比較',
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
      id: 'signed-comparison',
      instruction: '符号付き数値の比較',
      content: [
        {
          type: 'heading',
          text: '± 符号付き数の扱い',
        },
        {
          type: 'text',
          text: '2の補数表現での符号付き4ビット数：',
        },
        {
          type: 'table',
          headers: ['ビットパターン', '符号なし', '符号付き', '特徴'],
          rows: [
            ['0111', '7', '+7', '最大正数'],
            ['0000', '0', '0', 'ゼロ'],
            ['1000', '8', '-8', '最小負数'],
            ['1111', '15', '-1', '負数'],
          ],
        },
        {
          type: 'note',
          text: '符号付き比較ではMSB（符号ビット）の扱いが異なる',
        },
        {
          type: 'text',
          text: `符号付き比較のロジック：
1. 符号ビットが異なる場合：
   - Aが正(0)、Bが負(1) → A > B
   - Aが負(1)、Bが正(0) → A < B

2. 符号ビットが同じ場合：
   - 両方正：通常の符号なし比較
   - 両方負：絶対値が小さい方が大きい`,
        },
      ],
    },
    {
      id: 'practical-applications',
      instruction: '実用的な応用例',
      content: [
        {
          type: 'heading',
          text: '🛠️ ソート回路の実装',
        },
        {
          type: 'text',
          text: 'バブルソートの基本要素：',
        },
        {
          type: 'ascii-art',
          art: `     A       B
     │       │
   ┌─┴───────┴─┐
   │ 比較器   │
   └─┬─┬─┬───┘
     │ │ │
     │ │ └────── A<B時：交換
     │ └──────── A=B時：維持
     └───────── A>B時：維持

結果：常に小さい方が上に来る`,
        },
        {
          type: 'heading',
          text: '🎮 範囲チェック回路',
        },
        {
          type: 'text',
          text: 'ゲームでの応用例：0 ≤ X ≤ 100 のチェック',
        },
        {
          type: 'ascii-art',
          art: `範囲チェック回路の構成：
     X ────┬──[比較器1]── (X≥0)
           │    下限0     │
           │              │
           │              ▼
           │           ┌─────┐
           └──[比較器2]─┤ AND ├── 範囲内？
               上限100  └─────┘
                          ▲
                          │
                       (X≤100)`,
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'X ≥ 0：符号ビットで0かチェック',
            'X ≤ 100：100との比較',
            '両方をANDで結合',
            '画面外判定や衝突判定に使用',
          ],
        },
        {
          type: 'heading',
          text: '🔄 バブルソートの基本単位',
        },
        {
          type: 'text',
          text: '2つの数を比較して並び替える回路：',
        },
        {
          type: 'ascii-art',
          art: `コンペアスワップ（Compare-Swap）モジュール：
┌────────────────────────┐
│    A ──┬──[比較器]     │
│        │     │         │
│        │     ▼         │
│        │  [MUX選択]    │
│        │   /    \\      │
│    B ──┴──●      ●──── Min（小）
│            \\    /      │
│             ×××        │
│            /    \\      │
│           ●      ●──── Max（大）
└────────────────────────┘`,
        },
        {
          type: 'note',
          text: '比較結果に基づいてMUXが値を入れ替えます',
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
      id: 'cpu-branch-instructions',
      instruction: 'CPUの分岐命令での使用',
      content: [
        {
          type: 'heading',
          text: '🖥️ CPU分岐命令の実装',
        },
        {
          type: 'text',
          text: '主要な条件分岐命令と比較器の関係：',
        },
        {
          type: 'table',
          headers: ['命令', '条件', '比較器出力', '用途'],
          rows: [
            ['BEQ', 'Branch if Equal', 'A=B', 'ループ終了判定'],
            ['BNE', 'Branch if Not Equal', 'NOT(A=B)', 'ループ継続'],
            ['BLT', 'Branch if Less Than', 'A<B', '範囲チェック'],
            ['BGT', 'Branch if Greater', 'A>B', '最大値検索'],
            ['BLE', 'Branch if Less or Equal', 'A<B OR A=B', 'ソート'],
            ['BGE', 'Branch if Greater or Equal', 'A>B OR A=B', '最小値検索'],
          ],
        },
        {
          type: 'text',
          text: `アセンブリ言語の例：

    CMP  R1, R2      ; R1とR2を比較
    BLT  LESS_THAN   ; R1 < R2ならLESS_THANへジャンプ
    BGT  GREATER     ; R1 > R2ならGREATERへジャンプ
    ; R1 = R2の場合は次の命令へ`,
        },
        {
          type: 'note',
          text: '比較器はCPUの“判断力”の中核を担っています',
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
        {
          type: 'quiz',
          question: '符号付き4ビットで 1111(-1) と 0001(+1) を比較すると？',
          options: [
            '1111 > 0001',
            '1111 = 0001',
            '1111 < 0001',
            '比較できない',
          ],
          correctIndex: 2,
        },
      ],
    },
  ],
};
