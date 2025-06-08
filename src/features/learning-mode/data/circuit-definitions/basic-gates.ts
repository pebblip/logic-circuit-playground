import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * 基本ゲートのシンプルな回路定義
 * 学習モードのデモ用
 */

// ANDゲート基本回路
export const andGateCircuit = {
  title: '',
  gates: [
    // 入力A
    {
      id: 'and-input-a',
      type: 'INPUT' as const,
      position: { x: 100, y: 120 },
      inputs: [],
      output: false,
      metadata: { name: 'A' },
    },
    // 入力B
    {
      id: 'and-input-b',
      type: 'INPUT' as const,
      position: { x: 100, y: 180 },
      inputs: [],
      output: false,
      metadata: { name: 'B' },
    },
    // ANDゲート
    {
      id: 'and-gate',
      type: 'AND' as const,
      position: { x: 300, y: 150 },
      inputs: [],
      output: false,
    },
    // 出力
    {
      id: 'and-output',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 150 },
      inputs: [],
      metadata: { name: 'Y' },
    },
  ] as Gate[],
  
  wires: [
    // A → AND
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and-input-a', pinIndex: -1 },
      to: { gateId: 'and-gate', pinIndex: 0 },
      isActive: false,
    },
    // B → AND
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and-input-b', pinIndex: -1 },
      to: { gateId: 'and-gate', pinIndex: 1 },
      isActive: false,
    },
    // AND → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and-gate', pinIndex: -1 },
      to: { gateId: 'and-output', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 600,
    height: 300,
    inputLabels: ['', ''],
    outputLabels: [''],
  },
};

// ORゲート基本回路
export const orGateCircuit = {
  title: '',
  gates: [
    // 入力A
    {
      id: 'or-input-a',
      type: 'INPUT' as const,
      position: { x: 100, y: 120 },
      inputs: [],
      output: false,
      metadata: { name: 'A' },
    },
    // 入力B
    {
      id: 'or-input-b',
      type: 'INPUT' as const,
      position: { x: 100, y: 180 },
      inputs: [],
      output: false,
      metadata: { name: 'B' },
    },
    // ORゲート
    {
      id: 'or-gate',
      type: 'OR' as const,
      position: { x: 300, y: 150 },
      inputs: [],
      output: false,
    },
    // 出力
    {
      id: 'or-output',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 150 },
      inputs: [],
      metadata: { name: 'Y' },
    },
  ] as Gate[],
  
  wires: [
    // A → OR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'or-input-a', pinIndex: -1 },
      to: { gateId: 'or-gate', pinIndex: 0 },
      isActive: false,
    },
    // B → OR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'or-input-b', pinIndex: -1 },
      to: { gateId: 'or-gate', pinIndex: 1 },
      isActive: false,
    },
    // OR → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'or-gate', pinIndex: -1 },
      to: { gateId: 'or-output', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 600,
    height: 300,
    inputLabels: ['', ''],
    outputLabels: [''],
  },
};

// XORゲート基本回路
export const xorGateCircuit = {
  title: '',
  gates: [
    // 入力A
    {
      id: 'xor-input-a',
      type: 'INPUT' as const,
      position: { x: 100, y: 120 },
      inputs: [],
      output: false,
      metadata: { name: 'A' },
    },
    // 入力B
    {
      id: 'xor-input-b',
      type: 'INPUT' as const,
      position: { x: 100, y: 180 },
      inputs: [],
      output: false,
      metadata: { name: 'B' },
    },
    // XORゲート
    {
      id: 'xor-gate',
      type: 'XOR' as const,
      position: { x: 300, y: 150 },
      inputs: [],
      output: false,
    },
    // 出力
    {
      id: 'xor-output',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 150 },
      inputs: [],
      metadata: { name: 'Y' },
    },
  ] as Gate[],
  
  wires: [
    // A → XOR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor-input-a', pinIndex: -1 },
      to: { gateId: 'xor-gate', pinIndex: 0 },
      isActive: false,
    },
    // B → XOR
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor-input-b', pinIndex: -1 },
      to: { gateId: 'xor-gate', pinIndex: 1 },
      isActive: false,
    },
    // XOR → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor-gate', pinIndex: -1 },
      to: { gateId: 'xor-output', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 600,
    height: 300,
    inputLabels: ['', ''],
    outputLabels: [''],
  },
};

// シンプルな接続（INPUT → OUTPUT）
export const simpleConnectionCircuit = {
  title: 'シンプルな接続',
  gates: [
    // 入力
    {
      id: 'simple-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: false,
      metadata: { name: '入力' },
    },
    // 出力
    {
      id: 'simple-output',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 150 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],
  
  wires: [
    // INPUT → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'simple-input', pinIndex: -1 },
      to: { gateId: 'simple-output', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 500,
    height: 300,
    inputLabels: ['入力（0か1を切り替える）'],
    outputLabels: ['出力（信号を表示）'],
  },
};

// ダブルNOT回路（バッファ）
export const doubleNotCircuit = {
  title: 'ダブルNOT回路',
  gates: [
    // 入力
    {
      id: 'double-not-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: false,
      metadata: { name: '入力' },
    },
    // 1つ目のNOT
    {
      id: 'not1',
      type: 'NOT' as const,
      position: { x: 250, y: 150 },
      inputs: [],
      output: false,
    },
    // 2つ目のNOT
    {
      id: 'not2',
      type: 'NOT' as const,
      position: { x: 400, y: 150 },
      inputs: [],
      output: false,
    },
    // 出力
    {
      id: 'double-not-output',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 150 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],
  
  wires: [
    // INPUT → NOT1
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'double-not-input', pinIndex: -1 },
      to: { gateId: 'not1', pinIndex: 0 },
      isActive: false,
    },
    // NOT1 → NOT2
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'not2', pinIndex: 0 },
      isActive: false,
    },
    // NOT2 → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not2', pinIndex: -1 },
      to: { gateId: 'double-not-output', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],
  
  layout: {
    width: 650,
    height: 300,
    inputLabels: ['入力'],
    outputLabels: ['出力（入力と同じ）'],
  },
};

// OFF状態の配線を示す回路
export const signalOffStateCircuit = {
  title: 'OFF（0）の状態',
  gates: [
    // 入力（OFF状態）
    {
      id: 'off-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: false, // OFF状態
      metadata: { name: '入力' },
    },
    // 出力
    {
      id: 'off-output',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 150 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],
  
  wires: [
    // INPUT → OUTPUT（グレーの配線）
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'off-input', pinIndex: -1 },
      to: { gateId: 'off-output', pinIndex: 0 },
      isActive: false, // グレーの配線
    },
  ] as Wire[],
  
  layout: {
    width: 500,
    height: 300,
    inputLabels: ['0（OFF）'],
    outputLabels: ['0（OFF）'],
  },
};

// ON状態の配線を示す回路
export const signalOnStateCircuit = {
  title: 'ON（1）の状態',
  gates: [
    // 入力（ON状態）
    {
      id: 'on-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: true, // ON状態
      metadata: { name: '入力' },
    },
    // 出力
    {
      id: 'on-output',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 150 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],
  
  wires: [
    // INPUT → OUTPUT（緑の配線）
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'on-input', pinIndex: -1 },
      to: { gateId: 'on-output', pinIndex: 0 },
      isActive: true, // 緑の配線
    },
  ] as Wire[],
  
  layout: {
    width: 500,
    height: 300,
    inputLabels: ['1（ON）'],
    outputLabels: ['1（ON）'],
  },
};

// OFF状態とON状態を同時に表示する回路
export const signalComparisonCircuit = {
  title: '',
  gates: [
    // OFF状態の入力
    {
      id: 'off-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 100 },
      inputs: [],
      output: false, // OFF状態
      metadata: { name: '入力' },
    },
    // OFF状態の出力
    {
      id: 'off-output',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 100 },
      inputs: [],
      metadata: { name: '出力' },
    },
    // ON状態の入力
    {
      id: 'on-input',
      type: 'INPUT' as const,
      position: { x: 100, y: 200 },
      inputs: [],
      output: true, // ON状態
      metadata: { name: '入力' },
    },
    // ON状態の出力
    {
      id: 'on-output',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 200 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],
  
  wires: [
    // OFF状態の配線（グレー）
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'off-input', pinIndex: -1 },
      to: { gateId: 'off-output', pinIndex: 0 },
      isActive: false, // グレーの配線
    },
    // ON状態の配線（緑）
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'on-input', pinIndex: -1 },
      to: { gateId: 'on-output', pinIndex: 0 },
      isActive: true, // 緑の配線
    },
  ] as Wire[],
  
  layout: {
    width: 500,
    height: 350,
    inputLabels: [''],
    outputLabels: [''],
  },
};