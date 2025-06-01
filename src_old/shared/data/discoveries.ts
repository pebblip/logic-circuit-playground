import { Discovery, DiscoveryCategory, Milestone } from '../../entities/types/discovery';

export const DISCOVERIES: DiscoveryCategory[] = [
  {
    id: 'basic_gates',
    name: '基本ゲートの発見',
    icon: '⚡',
    discoveries: [
      {
        id: 'first_and',
        name: 'はじめてのANDゲート',
        description: '2つの入力が両方ONのときだけONになる！',
        type: 'gate_combination',
        icon: '🔵',
        discovered: false,
        hint: '2つのスイッチを両方ONにしてみよう'
      },
      {
        id: 'or_discovery',
        name: 'ORゲートの発見',
        description: 'どちらか1つでもONならONになる！',
        type: 'gate_combination',
        icon: '🟢',
        discovered: false,
        hint: 'どちらか片方だけONにしてみよう'
      },
      {
        id: 'not_magic',
        name: 'NOTゲートの魔法',
        description: '信号を反転させる不思議なゲート',
        type: 'gate_combination',
        icon: '🔴',
        discovered: false,
        hint: 'ONをOFFに、OFFをONに'
      },
    ]
  },
  {
    id: 'combinations',
    name: '組み合わせの発見',
    icon: '🔗',
    discoveries: [
      {
        id: 'nand_creation',
        name: 'NANDゲートの作り方',
        description: 'ANDとNOTを組み合わせると...',
        type: 'gate_combination',
        requiredGates: ['AND', 'NOT'],
        unlocksGates: ['NAND'],
        icon: '🟣',
        discovered: false,
        hint: 'ANDの出力をNOTに繋げてみよう'
      },
      {
        id: 'xor_puzzle',
        name: 'XORパズル',
        description: '排他的論理和の秘密を解き明かそう',
        type: 'circuit_pattern',
        requiredGates: ['AND', 'OR', 'NOT'],
        icon: '🟡',
        discovered: false,
        hint: '違うときだけONになる回路を作れるかな？'
      },
      {
        id: 'universal_gate',
        name: 'ユニバーサルゲート',
        description: 'NANDだけですべてが作れる！？',
        type: 'logic_principle',
        requiredGates: ['NAND'],
        icon: '🌟',
        discovered: false,
        hint: 'NANDゲートだけで他のゲートを再現してみよう'
      },
    ]
  },
  {
    id: 'memory',
    name: 'メモリーの発見',
    icon: '💾',
    discoveries: [
      {
        id: 'feedback_loop',
        name: 'フィードバックループ',
        description: '出力を入力に戻すと...',
        type: 'circuit_pattern',
        icon: '🔄',
        discovered: false,
        hint: 'ゲートの出力を自分の入力に繋げてみよう'
      },
      {
        id: 'sr_latch_discovery',
        name: 'SRラッチの発見',
        description: '状態を記憶できる回路！',
        type: 'circuit_pattern',
        requiredGates: ['NOR'],
        unlocksGates: ['SR_LATCH'],
        icon: '📝',
        discovered: false,
        hint: '2つのNORゲートをクロスに接続してみよう'
      },
      {
        id: 'clock_sync',
        name: 'クロック同期',
        description: 'タイミングを制御する方法',
        type: 'logic_principle',
        unlocksGates: ['CLOCK'],
        icon: '⏰',
        discovered: false,
        hint: '定期的にON/OFFを繰り返す信号が必要だ'
      },
    ]
  },
  {
    id: 'advanced',
    name: '上級の発見',
    icon: '🚀',
    discoveries: [
      {
        id: 'half_adder',
        name: 'ハーフアダー',
        description: '1ビットの足し算回路',
        type: 'circuit_pattern',
        requiredGates: ['XOR', 'AND'],
        unlocksGates: ['HALF_ADDER'],
        icon: '➕',
        discovered: false,
        hint: 'XORで和を、ANDで桁上がりを'
      },
      {
        id: 'multiplexer',
        name: 'マルチプレクサー',
        description: 'データの通り道を切り替える',
        type: 'circuit_pattern',
        requiredGates: ['AND', 'OR', 'NOT'],
        unlocksGates: ['MUX_2TO1'],
        icon: '🔀',
        discovered: false,
        hint: '選択信号で2つの入力を切り替える'
      },
      {
        id: 'register_bank',
        name: 'レジスタバンク',
        description: '複数の値を記憶する',
        type: 'circuit_pattern',
        requiredGates: ['D_FLIP_FLOP', 'MUX_2TO1'],
        unlocksGates: ['REGISTER_4BIT'],
        icon: '🗄️',
        discovered: false,
        hint: 'D-FFを並べて、選択的に読み書き'
      },
    ]
  }
];

export const MILESTONES: Milestone[] = [
  {
    id: 'first_steps',
    name: '最初の一歩',
    description: '基本ゲートをすべて発見した！',
    requiredDiscoveries: ['first_and', 'or_discovery', 'not_magic'],
    reward: {
      type: 'badge',
      value: 'basic_explorer'
    },
    achieved: false
  },
  {
    id: 'combination_master',
    name: 'コンビネーションマスター',
    description: 'ゲートの組み合わせを5つ発見',
    requiredDiscoveries: ['nand_creation', 'xor_puzzle'],
    reward: {
      type: 'gate',
      value: 'CUSTOM_GATE'
    },
    achieved: false
  },
  {
    id: 'memory_architect',
    name: 'メモリーアーキテクト',
    description: '記憶回路の基礎をマスター',
    requiredDiscoveries: ['feedback_loop', 'sr_latch_discovery', 'clock_sync'],
    reward: {
      type: 'mode',
      value: 'sandbox'
    },
    achieved: false
  },
  {
    id: 'cpu_builder',
    name: 'CPUビルダー',
    description: 'CPU構築の準備完了！',
    requiredDiscoveries: ['half_adder', 'multiplexer', 'register_bank'],
    reward: {
      type: 'mode',
      value: 'challenge'
    },
    achieved: false
  }
];

// 発見のヒントを段階的に表示
export function getProgressiveHint(discoveryId: string, progress: number): string | undefined {
  const discovery = DISCOVERIES.flatMap(cat => cat.discoveries).find(d => d.id === discoveryId);
  if (!discovery?.hint) return undefined;
  
  // 進捗に応じてヒントを段階的に表示
  if (progress < 0.3) return '？？？';
  if (progress < 0.6) return discovery.hint.substring(0, Math.floor(discovery.hint.length * 0.5)) + '...';
  return discovery.hint;
}