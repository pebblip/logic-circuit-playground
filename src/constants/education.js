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