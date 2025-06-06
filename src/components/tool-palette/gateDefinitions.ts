import type { GateType, CustomGateDefinition } from '@/types/circuit';

export const BASIC_GATES: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'XOR', label: 'XOR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
];

export const IO_GATES: { type: GateType; label: string }[] = [
  { type: 'INPUT', label: '入力' },
  { type: 'OUTPUT', label: '出力' },
  { type: 'CLOCK', label: 'クロック' },
];

// 特殊ゲート
export const SPECIAL_GATES: { type: GateType; label: string }[] = [
  { type: 'D-FF', label: 'D-FF' },
  { type: 'SR-LATCH', label: 'SR-LATCH' },
  { type: 'MUX', label: 'MUX' },
];

// デモ用カスタムゲート定義（教育的価値の高いもののみ）
export const DEMO_CUSTOM_GATES: CustomGateDefinition[] = [
  {
    id: 'demo-half-adder',
    name: 'HalfAdder',
    displayName: '半加算器',
    description: '2進数の1桁加算を実現。A + B = Sum(S) + Carry(C)',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
    ],
    outputs: [
      { name: 'S', index: 0 }, // Sum（和）
      { name: 'C', index: 1 }, // Carry（桁上がり）
    ],
    truthTable: {
      '00': '00', // 0+0 = 0 (carry=0)
      '01': '10', // 0+1 = 1 (carry=0)
      '10': '10', // 1+0 = 1 (carry=0)
      '11': '01', // 1+1 = 0 (carry=1)
    },
    icon: '➕',
    category: 'arithmetic',
    width: 100,
    height: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
