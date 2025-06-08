import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * レッスン8: 全加算器の回路定義
 * 2つの半加算器とORゲートで構成
 */
export const fullAdderCircuit = {
  title: '全加算器回路（3ビット入力）',
  gates: [
    // 入力A
    {
      id: 'input-a',
      type: 'INPUT' as const,
      position: { x: 50, y: 100 },
      inputs: [],
      output: true,
      metadata: { name: 'A' },
    },
    // 入力B
    {
      id: 'input-b',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      inputs: [],
      output: true,
      metadata: { name: 'B' },
    },
    // 入力Cin（前の桁からの繰り上がり）
    {
      id: 'input-cin',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      inputs: [],
      output: false,
      metadata: { name: 'Cin' },
    },
    
    // 第1半加算器
    // XOR1（A⊕B）
    {
      id: 'xor1',
      type: 'XOR' as const,
      position: { x: 250, y: 100 },
      inputs: [],
      output: false,
    },
    // AND1（A・B）
    {
      id: 'and1',
      type: 'AND' as const,
      position: { x: 250, y: 200 },
      inputs: [],
      output: false,
    },
    
    // 第2半加算器
    // XOR2（(A⊕B)⊕Cin）= Sum
    {
      id: 'xor2',
      type: 'XOR' as const,
      position: { x: 450, y: 150 },
      inputs: [],
      output: true,
    },
    // AND2（(A⊕B)・Cin）
    {
      id: 'and2',
      type: 'AND' as const,
      position: { x: 450, y: 250 },
      inputs: [],
      output: false,
    },
    
    // ORゲート（最終的な繰り上がり）
    {
      id: 'or-gate',
      type: 'OR' as const,
      position: { x: 450, y: 350 },
      inputs: [],
      output: false,
    },
    
    // 出力Sum
    {
      id: 'output-sum',
      type: 'OUTPUT' as const,
      position: { x: 650, y: 150 },
      inputs: [],
      metadata: { name: 'Sum' },
    },
    // 出力Cout
    {
      id: 'output-cout',
      type: 'OUTPUT' as const,
      position: { x: 650, y: 350 },
      inputs: [],
      metadata: { name: 'Cout' },
    },
  ] as Gate[],
  
  wires: [
    // A → XOR1
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 0 },
      isActive: false,
    },
    // B → XOR1
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 1 },
      isActive: false,
    },
    // A → AND1
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a', pinIndex: -1 },
      to: { gateId: 'and1', pinIndex: 0 },
      isActive: false,
    },
    // B → AND1
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b', pinIndex: -1 },
      to: { gateId: 'and1', pinIndex: 1 },
      isActive: false,
    },
    
    // XOR1 → XOR2
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor1', pinIndex: -1 },
      to: { gateId: 'xor2', pinIndex: 0 },
      isActive: false,
    },
    // Cin → XOR2
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-cin', pinIndex: -1 },
      to: { gateId: 'xor2', pinIndex: 1 },
      isActive: false,
    },
    // XOR1 → AND2
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor1', pinIndex: -1 },
      to: { gateId: 'and2', pinIndex: 0 },
      isActive: false,
    },
    // Cin → AND2
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-cin', pinIndex: -1 },
      to: { gateId: 'and2', pinIndex: 1 },
      isActive: false,
    },
    
    // AND1 → OR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and1', pinIndex: -1 },
      to: { gateId: 'or-gate', pinIndex: 0 },
      isActive: false,
    },
    // AND2 → OR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and2', pinIndex: -1 },
      to: { gateId: 'or-gate', pinIndex: 1 },
      isActive: false,
    },
    
    // XOR2 → Sum出力
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor2', pinIndex: -1 },
      to: { gateId: 'output-sum', pinIndex: 0 },
      isActive: false,
    },
    // OR → Cout出力
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'or-gate', pinIndex: -1 },
      to: { gateId: 'output-cout', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    preferredWidth: 750,
    preferredHeight: 450,
    inputLabels: ['A', 'B', 'Cin'],
    outputLabels: ['Sum', 'Cout'],
  },
};