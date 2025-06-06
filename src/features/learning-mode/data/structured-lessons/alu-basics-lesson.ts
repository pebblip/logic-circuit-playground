import type { StructuredLesson } from '../../../../types/lesson-content';

export const aluBasicsStructuredLesson: StructuredLesson = {
  id: 'alu-basics',
  title: 'ALU基礎 - CPUの計算エンジン',
  description: '算術論理演算装置（ALU）の基本を理解し簡易版を作ります',
  icon: '🧠',
  difficulty: 'advanced',
  prerequisites: ['multiplexer'],
  estimatedMinutes: 30,
  steps: [
    {
      id: 'intro',
      instruction: 'CPUの心臓部、ALUを理解しよう！',
      content: [
        {
          type: 'text',
          text: 'コンピュータはどうやって計算や比較を行っているのでしょうか？',
        },
        {
          type: 'heading',
          text: '🤔 ALUとは？',
          icon: '🤔',
        },
        {
          type: 'text',
          text: 'Arithmetic Logic Unit（算術論理演算装置）- CPUの中で実際の計算を行う部分です。',
        },
        {
          type: 'note',
          text: '全ての計算、比較、論理演算はここで行われます！',
          icon: '💫',
        },
      ],
    },
    {
      id: 'alu-functions',
      instruction: 'ALUの基本機能',
      content: [
        {
          type: 'heading',
          text: '🔧 主な演算',
          icon: '🔧',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '➕ 算術演算：加算、減算、インクリメント',
            '🔀 論理演算：AND、OR、XOR、NOT',
            '↔️ シフト演算：左シフト、右シフト',
            '⚖️ 比較演算：等しい、大きい、小さい',
          ],
        },
        {
          type: 'heading',
          text: '🎯 今回作るもの',
          icon: '🎯',
        },
        {
          type: 'text',
          text: '2ビット簡易ALU：ADD（加算）とAND（論理積）を切り替え可能',
        },
      ],
    },
    {
      id: 'design-concept',
      instruction: 'ALUの設計思想',
      content: [
        {
          type: 'heading',
          text: '📐 基本構造',
          icon: '📐',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '複数の演算回路を並列に配置',
            'MUXで結果を選択',
            '制御信号で演算を切り替え',
          ],
        },
        {
          type: 'table',
          headers: ['制御信号', '選択される演算', '出力'],
          rows: [
            ['0', 'AND演算', 'A AND B'],
            ['1', 'ADD演算', 'A + B'],
          ],
        },
      ],
    },
    {
      id: 'place-inputs-a',
      instruction: '入力A（1ビット）を配置',
      hint: '演算対象の1つ目',
      content: [
        {
          type: 'text',
          text: '今回は1ビットALUから始めます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-inputs-b',
      instruction: '入力B（1ビット）を配置',
      hint: '演算対象の2つ目',
      content: [],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-control',
      instruction: '制御信号を配置',
      hint: 'OP（オペレーション）選択用INPUT',
      content: [
        {
          type: 'text',
          text: 'OP=0でAND、OP=1でADDを選択',
        },
      ],
      action: { type: 'place-gate', gateType: 'INPUT' },
    },
    {
      id: 'place-and-unit',
      instruction: 'AND演算部を配置',
      hint: 'ANDゲートを1つ',
      content: [
        {
          type: 'text',
          text: '論理演算ユニットです。',
        },
      ],
      action: { type: 'place-gate', gateType: 'AND' },
    },
    {
      id: 'place-add-unit',
      instruction: '加算演算部を配置',
      hint: 'XORゲート（和）とANDゲート（キャリー）',
      content: [
        {
          type: 'text',
          text: '半加算器と同じ構成です。',
        },
      ],
      action: { type: 'place-gate', gateType: 'XOR' },
    },
    {
      id: 'place-mux-gates',
      instruction: 'MUX部分のゲートを配置',
      hint: 'NOT、AND×2、ORを配置',
      content: [
        {
          type: 'text',
          text: '2つの演算結果から1つを選択します。',
        },
      ],
      action: { type: 'place-gate', gateType: 'NOT' },
    },
    {
      id: 'place-outputs',
      instruction: '出力を配置',
      hint: 'Result（結果）とCarry（キャリー）の2つ',
      content: [
        {
          type: 'text',
          text: 'Carryは加算時のみ意味を持ちます。',
        },
      ],
      action: { type: 'place-gate', gateType: 'OUTPUT' },
    },
    {
      id: 'connect-and-unit',
      instruction: '配線：AND演算部',
      hint: 'AとBをANDゲートに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-add-unit',
      instruction: '配線：加算演算部',
      hint: 'AとBをXORとANDに接続',
      content: [],
      action: { type: 'connect-wire' },
    },
    {
      id: 'connect-mux',
      instruction: '配線：MUX部分',
      hint: '制御信号に応じて演算結果を選択',
      content: [
        {
          type: 'text',
          text: '各演算結果をMUXの入力に接続します。',
        },
      ],
      action: { type: 'connect-wire' },
    },
    {
      id: 'test-and-mode',
      instruction: 'テスト1：AND演算（OP=0）',
      content: [
        {
          type: 'text',
          text: 'A=1, B=1, OP=0で、Result=1（AND演算）',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: '1',
              operator: 'AND',
              right: '1',
              result: '1',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'test-add-mode',
      instruction: 'テスト2：ADD演算（OP=1）',
      content: [
        {
          type: 'text',
          text: 'A=1, B=1, OP=1で、Result=0, Carry=1（加算）',
        },
        {
          type: 'binary-expression',
          expressions: [
            {
              left: '1',
              operator: '+',
              right: '1',
              result: '10',
            },
          ],
        },
      ],
      action: { type: 'toggle-input' },
    },
    {
      id: 'status-flags',
      instruction: '【発展】ステータスフラグ',
      content: [
        {
          type: 'heading',
          text: '🚩 演算結果の状態',
          icon: '🚩',
        },
        {
          type: 'text',
          text: '実際のALUは演算結果に関する情報も出力します：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Z（Zero）：結果が0',
            'N（Negative）：結果が負',
            'C（Carry）：繰り上がり発生',
            'V（Overflow）：オーバーフロー',
          ],
        },
        {
          type: 'note',
          text: 'これらのフラグで条件分岐が可能になります',
          icon: '🔀',
        },
      ],
    },
    {
      id: 'multi-bit-alu',
      instruction: '複数ビットALU',
      content: [
        {
          type: 'heading',
          text: '🔢 32ビットALU',
          icon: '🔢',
        },
        {
          type: 'text',
          text: '実際のCPUでは32個や64個の1ビットALUを連結：',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '各ビット位置で同じ演算',
            'キャリーは連鎖的に伝播',
            '全ビット同時並列処理',
          ],
        },
      ],
    },
    {
      id: 'advanced-operations',
      instruction: '高度な演算機能',
      content: [
        {
          type: 'heading',
          text: '🚀 現代のALU',
          icon: '🚀',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            '🔢 乗算・除算：専用回路で高速化',
            '📊 浮動小数点演算：科学計算用',
            '🔄 ローテート：ビット回転',
            '🎮 SIMD：複数データ同時処理',
          ],
        },
      ],
    },
    {
      id: 'cpu-integration',
      instruction: 'CPUでの役割',
      content: [
        {
          type: 'heading',
          text: '💻 命令実行サイクル',
          icon: '💻',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'フェッチ：命令をメモリから取得',
            'デコード：命令を解釈',
            '実行：ALUで演算実行',
            'ライトバック：結果を保存',
          ],
        },
        {
          type: 'note',
          text: 'ALUは「実行」段階の主役です！',
          icon: '⭐',
        },
      ],
    },
    {
      id: 'practical-example',
      instruction: '実例：簡単なプログラム',
      content: [
        {
          type: 'heading',
          text: '📝 A = B + C の実行',
          icon: '📝',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'レジスタBの値をALUへ',
            'レジスタCの値をALUへ',
            'ALU制御信号を「ADD」に',
            'ALUが加算を実行',
            '結果をレジスタAに格納',
          ],
        },
      ],
    },
    {
      id: 'achievement',
      instruction: '🎉 ALU基礎マスター！',
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
            '✅ ALUの基本構造を理解',
            '✅ 演算切り替えの仕組み',
            '✅ CPUの計算原理',
            '✅ デジタル演算器の設計',
          ],
        },
        {
          type: 'note',
          text: 'これでCPUの心臓部が理解できました！',
          icon: '🎊',
        },
      ],
    },
    {
      id: 'quiz',
      instruction: '理解度チェック！',
      content: [
        {
          type: 'quiz',
          question: 'ALUの主な役割は？',
          options: ['データの保存', '演算の実行', '命令の取得', '画面表示'],
          correctIndex: 1,
        },
      ],
    },
  ],
};
