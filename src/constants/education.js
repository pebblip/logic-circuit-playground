// 教育機能関連の定数定義

/**
 * 学習目標の定義
 */
export const LEARNING_OBJECTIVES = {
  level1: {
    basics: [
      {
        id: 'and_gate',
        name: 'ANDゲートの理解',
        description: 'ANDゲートの真理値表を完成させる',
        type: 'truth_table',
        targetGate: 'AND',
        completed: false
      },
      {
        id: 'or_gate',
        name: 'ORゲートの理解', 
        description: 'ORゲートの真理値表を完成させる',
        type: 'truth_table',
        targetGate: 'OR',
        completed: false
      },
      {
        id: 'not_gate',
        name: 'NOTゲートの理解',
        description: 'NOTゲートの動作を確認する',
        type: 'truth_table',
        targetGate: 'NOT',
        completed: false
      }
    ],
    constructions: [
      {
        id: 'nand_from_basic',
        name: 'NANDゲートを作る',
        description: 'ANDゲートとNOTゲートを使ってNANDゲートを構築',
        type: 'construction',
        allowedGates: ['AND', 'NOT'],
        targetBehavior: 'NAND',
        hint: 'NANDは「NOT AND」の意味です',
        completed: false
      },
      {
        id: 'nor_from_basic',
        name: 'NORゲートを作る',
        description: 'ORゲートとNOTゲートを使ってNORゲートを構築',
        type: 'construction',
        allowedGates: ['OR', 'NOT'],
        targetBehavior: 'NOR',
        hint: 'NORは「NOT OR」の意味です',
        completed: false
      },
      {
        id: 'xor_from_basic',
        name: 'XORゲートを作る',
        description: '基本ゲートを使ってXORゲートを構築',
        type: 'construction',
        allowedGates: ['AND', 'OR', 'NOT'],
        targetBehavior: 'XOR',
        hint: 'XORは「どちらか一方が1のとき1」です',
        completed: false
      }
    ],
    advanced: [
      {
        id: 'sr_latch_nor',
        name: 'SRラッチを作る（NOR版）',
        description: '2つのNORゲートでSRラッチを構築',
        type: 'construction',
        allowedGates: ['NOR'],
        targetBehavior: 'SR_LATCH',
        hint: 'フィードバックループを作ることで状態を保持できます',
        completed: false
      },
      {
        id: 'universal_nand',
        name: 'NANDゲートの万能性',
        description: 'NANDゲートのみでAND, OR, NOTを構築',
        type: 'construction',
        allowedGates: ['NAND'],
        targetBehavior: 'BASIC_GATES',
        hint: 'NANDゲートは万能ゲートと呼ばれます',
        completed: false
      }
    ]
  },
  level2: {
    basics: [
      {
        id: 'understand_nand',
        name: 'NANDゲートの理解',
        description: 'NANDゲートの動作を確認',
        type: 'verification',
        completed: false
      },
      {
        id: 'understand_sr_latch',
        name: 'SRラッチの理解',
        description: 'SRラッチの状態保持を確認',
        type: 'verification',
        completed: false
      }
    ]
  },
  level3: {
    basics: [
      {
        id: 'half_adder',
        name: '半加算器の理解',
        description: '半加算器の動作原理を学習',
        type: 'truth_table',
        targetGate: 'HALF_ADDER',
        completed: false
      },
      {
        id: 'full_adder',
        name: '全加算器の理解',
        description: '全加算器の動作原理を学習',
        type: 'truth_table',
        targetGate: 'FULL_ADDER',
        completed: false
      }
    ],
    constructions: [
      {
        id: 'build_half_adder',
        name: '半加算器を作る',
        description: 'XORゲートとANDゲートで半加算器を構築',
        type: 'construction',
        allowedGates: ['XOR', 'AND'],
        targetBehavior: 'HALF_ADDER',
        hint: '半加算器は1ビットの加算を行います',
        completed: false
      },
      {
        id: 'build_full_adder',
        name: '全加算器を作る',
        description: '2つの半加算器とORゲートで全加算器を構築',
        type: 'construction',
        allowedGates: ['XOR', 'AND', 'OR'],
        targetBehavior: 'FULL_ADDER',
        hint: '全加算器は桁上がり入力も考慮します',
        completed: false
      },
      {
        id: 'build_4bit_adder',
        name: '4ビット加算器を作る',
        description: '4つの全加算器を連結して4ビット加算器を構築',
        type: 'construction',
        allowedGates: ['XOR', 'AND', 'OR'],
        targetBehavior: '4BIT_ADDER',
        hint: '桁上がりを次の全加算器に伝播させます',
        completed: false
      }
    ],
    advanced: [
      {
        id: 'build_comparator',
        name: '比較器を作る',
        description: '2つの数値を比較する回路を構築',
        type: 'construction',
        allowedGates: ['AND', 'OR', 'NOT', 'XOR'],
        targetBehavior: 'COMPARATOR',
        hint: 'A=B, A>B, A<Bを判定します',
        completed: false
      },
      {
        id: 'build_multiplexer',
        name: 'マルチプレクサを作る',
        description: '選択信号により入力を切り替える回路を構築',
        type: 'construction',
        allowedGates: ['AND', 'OR', 'NOT'],
        targetBehavior: 'MULTIPLEXER',
        hint: '選択信号で複数の入力から1つを選びます',
        completed: false
      }
    ]
  }
};

/**
 * チュートリアルステップの定義
 */
export const TUTORIAL_STEPS = {
  nand_from_basic: [
    {
      step: 1,
      instruction: 'ANDゲートを配置してください',
      validation: (state) => state.gates.some(g => g.type === 'AND'),
      hint: 'ツールバーからANDゲートを選択してキャンバスに配置します'
    },
    {
      step: 2,
      instruction: 'NOTゲートを配置してください',
      validation: (state) => state.gates.some(g => g.type === 'NOT'),
      hint: 'ANDゲートの出力を反転させます'
    },
    {
      step: 3,
      instruction: 'ANDゲートの出力をNOTゲートの入力に接続',
      validation: (state) => {
        const andGate = state.gates.find(g => g.type === 'AND');
        const notGate = state.gates.find(g => g.type === 'NOT');
        return state.connections.some(c => 
          c.from === andGate?.id && c.to === notGate?.id
        );
      },
      hint: 'ゲートの端子をドラッグして接続します'
    },
    {
      step: 4,
      instruction: '入力と出力を追加して動作を確認',
      validation: (state) => {
        const hasInputs = state.gates.filter(g => g.type === 'INPUT').length >= 2;
        const hasOutput = state.gates.some(g => g.type === 'OUTPUT');
        return hasInputs && hasOutput;
      },
      hint: '2つの入力と1つの出力が必要です'
    }
  ],
  
  sr_latch_nor: [
    {
      step: 1,
      instruction: '2つのNORゲートを配置してください',
      validation: (state) => state.gates.filter(g => g.type === 'NOR').length >= 2,
      hint: 'SRラッチには2つのNORゲートが必要です'
    },
    {
      step: 2,
      instruction: '1つ目のNORの出力を2つ目のNORの下側入力に接続',
      validation: (state) => {
        const norGates = state.gates.filter(g => g.type === 'NOR');
        if (norGates.length < 2) return false;
        return state.connections.some(c => 
          c.from === norGates[0].id && 
          c.to === norGates[1].id && 
          c.toInput === 1
        );
      },
      hint: 'これがフィードバックループの始まりです'
    },
    {
      step: 3,
      instruction: '2つ目のNORの出力を1つ目のNORの下側入力に接続',
      validation: (state) => {
        const norGates = state.gates.filter(g => g.type === 'NOR');
        if (norGates.length < 2) return false;
        return state.connections.some(c => 
          c.from === norGates[1].id && 
          c.to === norGates[0].id && 
          c.toInput === 1
        );
      },
      hint: 'フィードバックループが完成します'
    },
    {
      step: 4,
      instruction: 'S入力とR入力を追加してSRラッチを完成',
      validation: (state) => {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const norGates = state.gates.filter(g => g.type === 'NOR');
        return inputs.length >= 2 && norGates.length >= 2;
      },
      hint: 'Set(S)とReset(R)の入力を追加します'
    }
  ],
  
  build_half_adder: [
    {
      step: 1,
      instruction: 'XORゲートを配置してください',
      validation: (state) => state.gates.some(g => g.type === 'XOR'),
      hint: 'XORゲートは2つの入力が異なるときに1を出力します'
    },
    {
      step: 2,
      instruction: 'ANDゲートを配置してください',
      validation: (state) => state.gates.some(g => g.type === 'AND'),
      hint: 'ANDゲートは桁上がり（Carry）を計算します'
    },
    {
      step: 3,
      instruction: '2つの入力（INPUT）を追加してください',
      validation: (state) => state.gates.filter(g => g.type === 'INPUT').length >= 2,
      hint: '加算する2つのビットを入力します'
    },
    {
      step: 4,
      instruction: '2つの出力（OUTPUT）を追加してください',
      validation: (state) => state.gates.filter(g => g.type === 'OUTPUT').length >= 2,
      hint: '和（Sum）と桁上がり（Carry）の出力が必要です'
    },
    {
      step: 5,
      instruction: '入力をXORゲートとANDゲートの両方に接続してください',
      validation: (state) => {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const xorGate = state.gates.find(g => g.type === 'XOR');
        const andGate = state.gates.find(g => g.type === 'AND');
        if (!xorGate || !andGate || inputs.length < 2) return false;
        
        // 各入力がXORとANDの両方に接続されているか確認
        return inputs.every(input => 
          state.connections.some(c => c.from === input.id && c.to === xorGate.id) &&
          state.connections.some(c => c.from === input.id && c.to === andGate.id)
        );
      },
      hint: '両方の入力を各ゲートに接続します'
    },
    {
      step: 6,
      instruction: 'XORゲートの出力を和（Sum）出力に、ANDゲートの出力を桁上がり（Carry）出力に接続',
      validation: (state) => {
        const xorGate = state.gates.find(g => g.type === 'XOR');
        const andGate = state.gates.find(g => g.type === 'AND');
        const outputs = state.gates.filter(g => g.type === 'OUTPUT');
        if (!xorGate || !andGate || outputs.length < 2) return false;
        
        return state.connections.some(c => c.from === xorGate.id && c.toType === 'OUTPUT') &&
               state.connections.some(c => c.from === andGate.id && c.toType === 'OUTPUT');
      },
      hint: 'XOR出力→和、AND出力→桁上がり'
    }
  ],

  build_full_adder: [
    {
      step: 1,
      instruction: '2つのXORゲートを配置してください',
      validation: (state) => state.gates.filter(g => g.type === 'XOR').length >= 2,
      hint: '全加算器では2段階のXOR演算が必要です'
    },
    {
      step: 2,
      instruction: '2つのANDゲートを配置してください',
      validation: (state) => state.gates.filter(g => g.type === 'AND').length >= 2,
      hint: '2つの桁上がりを計算するために必要です'
    },
    {
      step: 3,
      instruction: '1つのORゲートを配置してください',
      validation: (state) => state.gates.some(g => g.type === 'OR'),
      hint: '最終的な桁上がりを計算します'
    },
    {
      step: 4,
      instruction: '3つの入力を追加（A, B, 桁上がり入力）',
      validation: (state) => state.gates.filter(g => g.type === 'INPUT').length >= 3,
      hint: 'A + B + 前の桁からの桁上がりを計算します'
    },
    {
      step: 5,
      instruction: 'AとBを1つ目のXORゲートに接続',
      validation: (state) => {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const xorGates = state.gates.filter(g => g.type === 'XOR');
        if (inputs.length < 2 || xorGates.length < 1) return false;
        
        // 最初の2つの入力が最初のXORに接続されているか
        return state.connections.filter(c => 
          c.to === xorGates[0].id && 
          (c.from === inputs[0].id || c.from === inputs[1].id)
        ).length >= 2;
      },
      hint: 'まずAとBのXORを計算します'
    },
    {
      step: 6,
      instruction: '回路を完成させて全加算器の動作を確認',
      validation: (state) => {
        // 簡易的な検証：必要なゲートと接続が存在するか
        const hasRequiredGates = 
          state.gates.filter(g => g.type === 'XOR').length >= 2 &&
          state.gates.filter(g => g.type === 'AND').length >= 2 &&
          state.gates.some(g => g.type === 'OR') &&
          state.gates.filter(g => g.type === 'INPUT').length >= 3 &&
          state.gates.filter(g => g.type === 'OUTPUT').length >= 2;
        
        return hasRequiredGates && state.connections.length >= 10;
      },
      hint: '1つ目のXOR出力と桁上がり入力を2つ目のXORへ、桁上がり計算にはANDとORを使用'
    }
  ]
};

/**
 * 達成度のレベル定義
 */
export const ACHIEVEMENT_LEVELS = {
  beginner: { threshold: 0, name: '初心者', icon: '🌱' },
  intermediate: { threshold: 30, name: '中級者', icon: '🌿' },
  advanced: { threshold: 60, name: '上級者', icon: '🌳' },
  expert: { threshold: 90, name: 'エキスパート', icon: '🏆' }
};

/**
 * バッジの定義
 */
export const BADGES = {
  first_circuit: {
    id: 'first_circuit',
    name: '初めての回路',
    description: '最初の回路を完成させた',
    icon: '⚡'
  },
  truth_master: {
    id: 'truth_master',
    name: '真理値表マスター',
    description: 'すべての基本ゲートの真理値表を完成',
    icon: '📊'
  },
  feedback_loop: {
    id: 'feedback_loop',
    name: 'フィードバックループ',
    description: '初めてのメモリ素子を構築',
    icon: '🔄'
  },
  universal_gate: {
    id: 'universal_gate',
    name: '万能ゲート',
    description: 'NANDゲートで他のゲートを構築',
    icon: '🎯'
  }
};