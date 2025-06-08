import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * レッスン: NOTゲートの回路定義
 * 制作モードと同じデータ構造を使用
 */
export const notGateCircuit = {
  title: '',
  gates: [
    // 入力
    {
      id: 'input-1',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: false,
      metadata: { name: '入力' },
    },
    // NOTゲート
    {
      id: 'not-gate',
      type: 'NOT' as const,
      position: { x: 300, y: 150 },
      inputs: [],
      output: false,
    },
    // 出力
    {
      id: 'output-1',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 150 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],

  wires: [
    // INPUT → NOT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-1', pinIndex: -1 },
      to: { gateId: 'not-gate', pinIndex: 0 },
      isActive: false,
    },
    // NOT → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not-gate', pinIndex: -1 },
      to: { gateId: 'output-1', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],

  layout: {
    width: 600,
    height: 300,
    inputLabels: [''],
    outputLabels: [''],
  },
};

/**
 * トランジスタによるNOT回路の詳細実装
 * （電子工学的な説明用）
 */
export const notGateTransistorCircuit = {
  title: 'トランジスタによるNOT回路',
  gates: [
    // 入力
    {
      id: 'input-transistor',
      type: 'INPUT' as const,
      position: { x: 100, y: 200 },
      inputs: [],
      output: false,
      metadata: { name: '入力' },
    },
    // NOTゲート（トランジスタシンボル付き）
    {
      id: 'not-transistor',
      type: 'NOT' as const,
      position: { x: 350, y: 200 },
      inputs: [],
      output: false,
      metadata: { visualStyle: 'transistor' },
    },
    // 出力
    {
      id: 'output-transistor',
      type: 'OUTPUT' as const,
      position: { x: 600, y: 200 },
      inputs: [],
      metadata: { name: '出力' },
    },
  ] as Gate[],

  wires: [
    // INPUT → NOT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-transistor', pinIndex: -1 },
      to: { gateId: 'not-transistor', pinIndex: 0 },
      isActive: false,
    },
    // NOT → OUTPUT
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not-transistor', pinIndex: -1 },
      to: { gateId: 'output-transistor', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],

  layout: {
    width: 700,
    height: 400,
    inputLabels: ['入力'],
    outputLabels: ['出力'],
  },
};
