import type { Gate, Wire } from '../../../types';

export const MANDALA_CIRCUIT = {
  id: 'mandala-circuit',
  title: '🌸 マンダラ回路',
  description: '複数の循環回路が創り出す神秘的な幾何学パターン。3つのリングオシレーターの協調と競合が生み出す美しいマンダラ模様！',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 1000,
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 10
  },
  gates: [
    // 第1リング（3個のNOT、中心から120度）
    {
      id: 'ring1_not1',
      type: 'NOT' as const,
      position: { x: 300, y: 150 },
      output: true,
      inputs: [''],
    },
    {
      id: 'ring1_not2',
      type: 'NOT' as const,
      position: { x: 350, y: 120 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring1_not3',
      type: 'NOT' as const,
      position: { x: 400, y: 150 },
      output: false,
      inputs: [''],
    },
    
    // 第2リング（5個のNOT、中心から72度）
    {
      id: 'ring2_not1',
      type: 'NOT' as const,
      position: { x: 250, y: 200 },
      output: true,
      inputs: [''],
    },
    {
      id: 'ring2_not2',
      type: 'NOT' as const,
      position: { x: 200, y: 250 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring2_not3',
      type: 'NOT' as const,
      position: { x: 250, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring2_not4',
      type: 'NOT' as const,
      position: { x: 350, y: 350 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring2_not5',
      type: 'NOT' as const,
      position: { x: 450, y: 300 },
      output: false,
      inputs: [''],
    },
    
    // 第3リング（7個のNOT、外周）
    {
      id: 'ring3_not1',
      type: 'NOT' as const,
      position: { x: 150, y: 150 },
      output: true,
      inputs: [''],
    },
    {
      id: 'ring3_not2',
      type: 'NOT' as const,
      position: { x: 100, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring3_not3',
      type: 'NOT' as const,
      position: { x: 100, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring3_not4',
      type: 'NOT' as const,
      position: { x: 200, y: 380 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring3_not5',
      type: 'NOT' as const,
      position: { x: 350, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring3_not6',
      type: 'NOT' as const,
      position: { x: 500, y: 350 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring3_not7',
      type: 'NOT' as const,
      position: { x: 550, y: 200 },
      output: false,
      inputs: [''],
    },
    
    // リング間相互作用ゲート
    {
      id: 'interact_12_xor',
      type: 'XOR' as const,
      position: { x: 280, y: 180 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'interact_23_and',
      type: 'AND' as const,
      position: { x: 180, y: 280 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'interact_13_or',
      type: 'OR' as const,
      position: { x: 320, y: 320 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'interact_all_nand',
      type: 'NAND' as const,
      position: { x: 380, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    
    // パターン生成用のゲート
    {
      id: 'pattern_gen1',
      type: 'XOR' as const,
      position: { x: 500, y: 150 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'pattern_gen2',
      type: 'AND' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'pattern_gen3',
      type: 'OR' as const,
      position: { x: 500, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'pattern_gen4',
      type: 'NOR' as const,
      position: { x: 500, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    
    // マンダラ出力（8方向）
    {
      id: 'mandala_n',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_ne',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_e',
      type: 'OUTPUT' as const,
      position: { x: 650, y: 250 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_se',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_s',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 450 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_sw',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_w',
      type: 'OUTPUT' as const,
      position: { x: 50, y: 250 },
      output: false,
      inputs: [''],
    },
    {
      id: 'mandala_nw',
      type: 'OUTPUT' as const,
      position: { x: 150, y: 100 },
      output: false,
      inputs: [''],
    },
    
    // リング状態観測
    {
      id: 'ring1_sum',
      type: 'XOR' as const,
      position: { x: 600, y: 100 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'ring2_sum',
      type: 'XOR' as const,
      position: { x: 600, y: 150 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'ring3_sum',
      type: 'XOR' as const,
      position: { x: 600, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    
    {
      id: 'out_ring1',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_ring2',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 150 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_ring3',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 200 },
      output: false,
      inputs: [''],
    },
    
    // 中央パターン
    {
      id: 'mandala_center',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 300 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // 第1リング（3個のNOTチェーン）
    {
      id: 'ring1_1_2',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'ring1_not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring1_2_3',
      from: { gateId: 'ring1_not2', pinIndex: -1 },
      to: { gateId: 'ring1_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring1_3_1',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'ring1_not1', pinIndex: 0 },
      isActive: false,
    },
    
    // 第2リング（5個のNOTチェーン）
    {
      id: 'ring2_1_2',
      from: { gateId: 'ring2_not1', pinIndex: -1 },
      to: { gateId: 'ring2_not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_2_3',
      from: { gateId: 'ring2_not2', pinIndex: -1 },
      to: { gateId: 'ring2_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_3_4',
      from: { gateId: 'ring2_not3', pinIndex: -1 },
      to: { gateId: 'ring2_not4', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_4_5',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'ring2_not5', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_5_1',
      from: { gateId: 'ring2_not5', pinIndex: -1 },
      to: { gateId: 'ring2_not1', pinIndex: 0 },
      isActive: false,
    },
    
    // 第3リング（7個のNOTチェーン）
    {
      id: 'ring3_1_2',
      from: { gateId: 'ring3_not1', pinIndex: -1 },
      to: { gateId: 'ring3_not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_2_3',
      from: { gateId: 'ring3_not2', pinIndex: -1 },
      to: { gateId: 'ring3_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_3_4',
      from: { gateId: 'ring3_not3', pinIndex: -1 },
      to: { gateId: 'ring3_not4', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_4_5',
      from: { gateId: 'ring3_not4', pinIndex: -1 },
      to: { gateId: 'ring3_not5', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_5_6',
      from: { gateId: 'ring3_not5', pinIndex: -1 },
      to: { gateId: 'ring3_not6', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_6_7',
      from: { gateId: 'ring3_not6', pinIndex: -1 },
      to: { gateId: 'ring3_not7', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_7_1',
      from: { gateId: 'ring3_not7', pinIndex: -1 },
      to: { gateId: 'ring3_not1', pinIndex: 0 },
      isActive: false,
    },
    
    // リング間相互作用
    {
      id: 'ring1_to_interact12',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'interact_12_xor', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_to_interact12',
      from: { gateId: 'ring2_not1', pinIndex: -1 },
      to: { gateId: 'interact_12_xor', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring2_to_interact23',
      from: { gateId: 'ring2_not3', pinIndex: -1 },
      to: { gateId: 'interact_23_and', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_interact23',
      from: { gateId: 'ring3_not3', pinIndex: -1 },
      to: { gateId: 'interact_23_and', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring1_to_interact13',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'interact_13_or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_interact13',
      from: { gateId: 'ring3_not1', pinIndex: -1 },
      to: { gateId: 'interact_13_or', pinIndex: 1 },
      isActive: false,
    },
    
    // 全リング相互作用
    {
      id: 'interact12_to_all',
      from: { gateId: 'interact_12_xor', pinIndex: -1 },
      to: { gateId: 'interact_all_nand', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'interact23_to_all',
      from: { gateId: 'interact_23_and', pinIndex: -1 },
      to: { gateId: 'interact_all_nand', pinIndex: 1 },
      isActive: false,
    },
    
    // パターン生成
    {
      id: 'ring1_to_pattern1',
      from: { gateId: 'ring1_not2', pinIndex: -1 },
      to: { gateId: 'pattern_gen1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_pattern1',
      from: { gateId: 'ring3_not5', pinIndex: -1 },
      to: { gateId: 'pattern_gen1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring2_to_pattern2',
      from: { gateId: 'ring2_not2', pinIndex: -1 },
      to: { gateId: 'pattern_gen2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_pattern2',
      from: { gateId: 'ring3_not6', pinIndex: -1 },
      to: { gateId: 'pattern_gen2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring1_to_pattern3',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'pattern_gen3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_to_pattern3',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'pattern_gen3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring2_to_pattern4',
      from: { gateId: 'ring2_not5', pinIndex: -1 },
      to: { gateId: 'pattern_gen4', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_pattern4',
      from: { gateId: 'ring3_not7', pinIndex: -1 },
      to: { gateId: 'pattern_gen4', pinIndex: 1 },
      isActive: false,
    },
    
    // マンダラ出力（8方向）
    {
      id: 'pattern1_to_n',
      from: { gateId: 'pattern_gen1', pinIndex: -1 },
      to: { gateId: 'mandala_n', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern2_to_ne',
      from: { gateId: 'pattern_gen2', pinIndex: -1 },
      to: { gateId: 'mandala_ne', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring1_to_e',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'mandala_e', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern3_to_se',
      from: { gateId: 'pattern_gen3', pinIndex: -1 },
      to: { gateId: 'mandala_se', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern4_to_s',
      from: { gateId: 'pattern_gen4', pinIndex: -1 },
      to: { gateId: 'mandala_s', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_to_sw',
      from: { gateId: 'ring2_not3', pinIndex: -1 },
      to: { gateId: 'mandala_sw', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_w',
      from: { gateId: 'ring3_not3', pinIndex: -1 },
      to: { gateId: 'mandala_w', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'interact12_to_nw',
      from: { gateId: 'interact_12_xor', pinIndex: -1 },
      to: { gateId: 'mandala_nw', pinIndex: 0 },
      isActive: false,
    },
    
    // リング状態観測
    {
      id: 'ring1_n1_to_sum',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'ring1_sum', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring1_n3_to_sum',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'ring1_sum', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring2_n1_to_sum',
      from: { gateId: 'ring2_not1', pinIndex: -1 },
      to: { gateId: 'ring2_sum', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_n4_to_sum',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'ring2_sum', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'ring3_n1_to_sum',
      from: { gateId: 'ring3_not1', pinIndex: -1 },
      to: { gateId: 'ring3_sum', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_n5_to_sum',
      from: { gateId: 'ring3_not5', pinIndex: -1 },
      to: { gateId: 'ring3_sum', pinIndex: 1 },
      isActive: false,
    },
    
    {
      id: 'ring1_sum_out',
      from: { gateId: 'ring1_sum', pinIndex: -1 },
      to: { gateId: 'out_ring1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_sum_out',
      from: { gateId: 'ring2_sum', pinIndex: -1 },
      to: { gateId: 'out_ring2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_sum_out',
      from: { gateId: 'ring3_sum', pinIndex: -1 },
      to: { gateId: 'out_ring3', pinIndex: 0 },
      isActive: false,
    },
    
    // 中央パターン
    {
      id: 'interact_all_to_center',
      from: { gateId: 'interact_all_nand', pinIndex: -1 },
      to: { gateId: 'mandala_center', pinIndex: 0 },
      isActive: false,
    },
  ],
};