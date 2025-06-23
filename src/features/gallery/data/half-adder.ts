import type { GalleryCircuit } from './types';

/**
 * 半加算器
 * 2つの1ビット数を加算する基本回路
 */
export const HALF_ADDER: GalleryCircuit = {
  id: 'half-adder',
  title: '🔗 半加算器',
  description:
    '2つの1ビット数を加算する基本回路。Sum（和）とCarry（桁上がり）を出力。',
  gates: [
    // 入力ゲート
    {
      id: 'input-a',
      type: 'INPUT',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [true], // A=1
    },
    {
      id: 'input-b',
      type: 'INPUT',
      position: { x: 100, y: 250 },
      inputs: [],
      outputs: [false], // B=0
    },

    // ロジックゲート
    {
      id: 'xor-sum',
      type: 'XOR',
      position: { x: 300, y: 150 },
      inputs: [],
      outputs: [],
    },
    {
      id: 'and-carry',
      type: 'AND',
      position: { x: 300, y: 250 },
      inputs: [],
      outputs: [],
    },

    // 出力ゲート
    {
      id: 'output-sum',
      type: 'OUTPUT',
      position: { x: 500, y: 150 },
      inputs: [],
      outputs: [],
    },
    {
      id: 'output-carry',
      type: 'OUTPUT',
      position: { x: 500, y: 250 },
      inputs: [],
      outputs: [],
    },
  ],
  wires: [
    // input-a → xor-sum
    {
      id: 'w1',
      from: { gateId: 'input-a', pinIndex: 0 },
      to: { gateId: 'xor-sum', pinIndex: 0 },
      isActive: true,
    },
    // input-b → xor-sum
    {
      id: 'w2',
      from: { gateId: 'input-b', pinIndex: 0 },
      to: { gateId: 'xor-sum', pinIndex: 1 },
      isActive: false,
    },
    // input-a → and-carry
    {
      id: 'w3',
      from: { gateId: 'input-a', pinIndex: 0 },
      to: { gateId: 'and-carry', pinIndex: 0 },
      isActive: true,
    },
    // input-b → and-carry
    {
      id: 'w4',
      from: { gateId: 'input-b', pinIndex: 0 },
      to: { gateId: 'and-carry', pinIndex: 1 },
      isActive: false,
    },
    // xor-sum → output-sum
    {
      id: 'w5',
      from: { gateId: 'xor-sum', pinIndex: 0 },
      to: { gateId: 'output-sum', pinIndex: 0 },
      isActive: true,
    },
    // and-carry → output-carry
    {
      id: 'w6',
      from: { gateId: 'and-carry', pinIndex: 0 },
      to: { gateId: 'output-carry', pinIndex: 0 },
      isActive: false,
    },
  ],
};
