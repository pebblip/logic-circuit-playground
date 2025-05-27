// 課題データの定義

export const CHALLENGES = {
  level1: [
    {
      id: '1-1',
      title: 'ANDゲートを理解しよう',
      description: '2つの入力が両方ONの時だけ出力がONになる回路を作ろう',
      difficulty: 'easy',
      requiredGates: ['AND'],
      truthTable: [
        { inputs: [0, 0], output: 0 },
        { inputs: [0, 1], output: 0 },
        { inputs: [1, 0], output: 0 },
        { inputs: [1, 1], output: 1 }
      ],
      hints: {
        placement: 'ANDゲートを1つ、入力を2つ、出力を1つ配置しましょう',
        wiring: '入力をANDゲートの左側に、ANDゲートの出力を右側の出力LEDに接続しましょう',
        answer: '入力1→ANDの上側、入力2→ANDの下側、AND→出力'
      }
    },
    {
      id: '1-2',
      title: 'ORゲートを理解しよう',
      description: 'どちらか一方でもONなら出力がONになる回路を作ろう',
      difficulty: 'easy',
      requiredGates: ['OR'],
      truthTable: [
        { inputs: [0, 0], output: 0 },
        { inputs: [0, 1], output: 1 },
        { inputs: [1, 0], output: 1 },
        { inputs: [1, 1], output: 1 }
      ],
      hints: {
        placement: 'ORゲートを1つ、入力を2つ、出力を1つ配置しましょう',
        wiring: '入力をORゲートに接続し、ORゲートの出力を出力LEDに接続しましょう',
        answer: '入力1→ORの上側、入力2→ORの下側、OR→出力'
      }
    },
    {
      id: '1-3',
      title: 'NOTゲートで反転',
      description: '入力を反転する回路を作ろう（ONならOFF、OFFならON）',
      difficulty: 'easy',
      requiredGates: ['NOT'],
      truthTable: [
        { inputs: [0], output: 1 },
        { inputs: [1], output: 0 }
      ],
      hints: {
        placement: 'NOTゲートを1つ、入力を1つ、出力を1つ配置しましょう',
        wiring: '入力→NOTゲート→出力の順に接続しましょう',
        answer: '入力→NOT→出力'
      }
    },
    {
      id: '1-4',
      title: '組み合わせ回路に挑戦',
      description: '最初の入力がONで、2番目の入力がOFFの時だけONになる回路',
      difficulty: 'medium',
      requiredGates: ['AND', 'NOT'],
      truthTable: [
        { inputs: [0, 0], output: 0 },
        { inputs: [0, 1], output: 0 },
        { inputs: [1, 0], output: 1 },
        { inputs: [1, 1], output: 0 }
      ],
      hints: {
        placement: 'ANDゲート1つ、NOTゲート1つが必要です',
        wiring: '2番目の入力をNOTで反転してからANDに入力しましょう',
        answer: '入力1→ANDの上、入力2→NOT→ANDの下、AND→出力'
      }
    }
  ],
  
  level2: [
    {
      id: '2-1',
      title: 'XORゲートを作ろう',
      description: '基本ゲートを組み合わせて、入力が異なる時だけONになる回路を作ろう',
      difficulty: 'medium',
      requiredGates: ['AND', 'OR', 'NOT'],
      truthTable: [
        { inputs: [0, 0], output: 0 },
        { inputs: [0, 1], output: 1 },
        { inputs: [1, 0], output: 1 },
        { inputs: [1, 1], output: 0 }
      ],
      hints: {
        placement: 'AND×2、OR×1、NOT×2が必要です',
        wiring: '(A AND NOT B) OR (NOT A AND B)の形を作りましょう',
        answer: 'XORは複雑ですが、2つの条件のORで表現できます'
      }
    },
    {
      id: '2-2',
      title: '3入力AND',
      description: '3つすべての入力がONの時だけONになる回路',
      difficulty: 'medium',
      requiredGates: ['AND'],
      truthTable: [
        { inputs: [0, 0, 0], output: 0 },
        { inputs: [0, 0, 1], output: 0 },
        { inputs: [0, 1, 0], output: 0 },
        { inputs: [0, 1, 1], output: 0 },
        { inputs: [1, 0, 0], output: 0 },
        { inputs: [1, 0, 1], output: 0 },
        { inputs: [1, 1, 0], output: 0 },
        { inputs: [1, 1, 1], output: 1 }
      ],
      hints: {
        placement: 'ANDゲートを2つ使います',
        wiring: '最初の2つをANDでまとめ、その結果と3つ目をANDします',
        answer: '(入力1 AND 入力2) AND 入力3'
      }
    }
  ],
  
  level3: [
    {
      id: '3-1',
      title: 'SRラッチを理解しよう',
      description: '2つのNORゲートで記憶回路を作ろう',
      difficulty: 'hard',
      requiredGates: ['NOR'],
      specialType: 'sr-latch',
      hints: {
        placement: 'NORゲートを2つ配置します',
        wiring: '出力を相手の入力にクロスして接続します',
        answer: 'フィードバックループを作ることで状態を保持します'
      }
    },
    {
      id: '3-2',
      title: 'Dフリップフロップ',
      description: 'クロック信号に同期してデータを記憶する回路',
      difficulty: 'hard',
      requiredGates: ['D_FF'],
      specialType: 'd-flipflop',
      hints: {
        placement: 'D-FFを配置し、データ入力とクロック入力を接続',
        wiring: 'D端子にデータ、CLK端子にクロック信号を接続',
        answer: 'クロックの立ち上がりでデータをラッチします'
      }
    }
  ],
  
  level4: [
    {
      id: '4-1',
      title: '半加算器を作ろう',
      description: '2つの1ビット数を足し算する回路（0+0=0, 0+1=1, 1+0=1, 1+1=10）',
      difficulty: 'hard',
      requiredGates: ['AND', 'XOR'],
      outputs: 2, // Sum と Carry
      truthTable: [
        { inputs: [0, 0], outputs: [0, 0] }, // Sum=0, Carry=0
        { inputs: [0, 1], outputs: [1, 0] }, // Sum=1, Carry=0
        { inputs: [1, 0], outputs: [1, 0] }, // Sum=1, Carry=0
        { inputs: [1, 1], outputs: [0, 1] }  // Sum=0, Carry=1
      ],
      hints: {
        placement: 'XORゲート（和）とANDゲート（キャリー）が必要',
        wiring: '両方の入力をXORとANDの両方に接続',
        answer: 'Sum = A XOR B, Carry = A AND B'
      }
    }
  ]
};

// レベルごとの説明
export const LEVEL_INFO = {
  1: {
    title: '基本ゲート',
    description: 'AND、OR、NOTの基本的な論理ゲートを学びます',
    icon: '🔌',
    color: 'blue'
  },
  2: {
    title: '組み合わせ回路',
    description: '複数のゲートを組み合わせて複雑な論理を実現します',
    icon: '🔗',
    color: 'purple'
  },
  3: {
    title: '記憶回路',
    description: 'フリップフロップやラッチで状態を記憶する方法を学びます',
    icon: '💾',
    color: 'pink'
  },
  4: {
    title: '演算回路',
    description: '加算器など、計算を行う回路を作ります',
    icon: '🧮',
    color: 'orange'
  },
  5: {
    title: '制御回路',
    description: 'マルチプレクサやデコーダで信号を制御します',
    icon: '🎛️',
    color: 'green'
  },
  6: {
    title: 'CPU設計',
    description: '学んだ知識を総動員して簡単なCPUを作ります',
    icon: '🖥️',
    color: 'red'
  }
};