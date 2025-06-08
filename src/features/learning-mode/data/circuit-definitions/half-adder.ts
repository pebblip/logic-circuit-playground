import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * レッスン7: 半加算器の回路定義
 * 制作モードと同じデータ構造を使用
 */
export const halfAdderCircuit = {
  title: '半加算器回路（改善版）',
  gates: [
    // 入力A
    {
      id: 'input-a',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: true,
      metadata: { name: 'A' },
    },
    // 入力B  
    {
      id: 'input-b',
      type: 'INPUT' as const,
      position: { x: 100, y: 250 },
      inputs: [],
      output: true,
      metadata: { name: 'B' },
    },
    // XORゲート（Sum用）
    {
      id: 'xor-gate',
      type: 'XOR' as const,
      position: { x: 350, y: 120 },
      inputs: [],
      output: false,
    },
    // ANDゲート（Carry用）
    {
      id: 'and-gate', 
      type: 'AND' as const,
      position: { x: 350, y: 280 },
      inputs: [],
      output: false,
    },
    // 出力Sum
    {
      id: 'output-sum',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 120 },
      inputs: [],
      metadata: { name: 'Sum' },
    },
    // 出力Carry
    {
      id: 'output-carry',
      type: 'OUTPUT' as const, 
      position: { x: 550, y: 280 },
      inputs: [],
      metadata: { name: 'Carry' },
    },
  ] as Gate[],
  
  wires: [
    // A → XOR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a', pinIndex: -1 },
      to: { gateId: 'xor-gate', pinIndex: 0 },
      isActive: false,
    },
    // B → XOR  
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b', pinIndex: -1 },
      to: { gateId: 'xor-gate', pinIndex: 1 },
      isActive: false,
    },
    // A → AND
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a', pinIndex: -1 },
      to: { gateId: 'and-gate', pinIndex: 0 },
      isActive: false,
    },
    // B → AND
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b', pinIndex: -1 },
      to: { gateId: 'and-gate', pinIndex: 1 },
      isActive: false,
    },
    // XOR → Sum
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor-gate', pinIndex: -1 },
      to: { gateId: 'output-sum', pinIndex: 0 },
      isActive: false,
    },
    // AND → Carry
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and-gate', pinIndex: -1 },
      to: { gateId: 'output-carry', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 700,
    height: 400,
    inputLabels: ['A', 'B'],
    outputLabels: ['Sum', 'Carry'],
  },
};