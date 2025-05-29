import { CircuitMode } from '../types/mode';
import { GateType } from '../types/gate';

export const MODE_GATE_SETS: Record<CircuitMode, (GateType | string)[]> = {
  discovery: [
    'INPUT',
    'OUTPUT', 
    'AND',
    'OR',
    'NOT',
    // 発見によってアンロックされるゲートは動的に追加
  ],
  
  sandbox: [
    // すべてのゲートが利用可能
    'INPUT',
    'OUTPUT',
    'AND',
    'OR', 
    'NOT',
    'NAND',
    'NOR',
    'XOR',
    'XNOR',
    'CLOCK',
    'D_FLIP_FLOP',
    'SR_LATCH',
    'REGISTER_4BIT',
    'MUX_2TO1',
    'HALF_ADDER',
    'FULL_ADDER',
    'ADDER_4BIT',
    'NUMBER_4BIT_INPUT',
    'NUMBER_4BIT_DISPLAY',
    'CUSTOM'
  ],
  
  challenge: [
    // チャレンジごとに異なるゲートセット
    'INPUT',
    'OUTPUT',
    'AND',
    'OR',
    'NOT',
    'NAND', 
    'NOR',
    'XOR',
    'XNOR',
  ]
};

export function getGatesForMode(mode: CircuitMode, unlockedGates?: string[]): (GateType | string)[] {
  const baseGates = MODE_GATE_SETS[mode] || MODE_GATE_SETS.discovery;
  
  // discoveryモードの場合、アンロックされたゲートを追加
  if (mode === 'discovery' && unlockedGates) {
    const allGates = [...baseGates];
    unlockedGates.forEach(gate => {
      if (!allGates.includes(gate)) {
        allGates.push(gate);
      }
    });
    return allGates;
  }
  
  return baseGates;
}

export function isGateAvailableInMode(gateType: GateType | string, mode: CircuitMode): boolean {
  return MODE_GATE_SETS[mode].includes(gateType);
}