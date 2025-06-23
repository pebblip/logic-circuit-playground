/**
 * 🌀 セルフオシレーティングメモリ（シンプル版）
 *
 * 最もシンプルで確実な設計：
 * - 3ゲートのリングオシレータをコアに使用
 * - enable制御のみ（triggerは削除）
 * - SR-LATCHでメモリ機能を実現
 * - 8ゲート構成で実用的
 */

import type { GalleryCircuit } from './types';

export const SELF_OSCILLATING_MEMORY_SIMPLE: GalleryCircuit = {
  id: 'self-oscillating-memory-simple',
  title: '🌀 セルフオシレーティングメモリ（シンプル版）',
  description:
    '最小構成で安定動作！3ゲートリングオシレータとenable制御、SR-LATCHメモリの実用設計。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 500, // 0.5秒 - 見やすい速度
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 10,
  },
  gates: [
    // === 制御入力 ===
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      outputs: [true], // 初期値ON
      inputs: [],
    },

    // === 発振器コア（3ゲートリング） ===
    {
      id: 'not1',
      type: 'NOT' as const,
      position: { x: 300, y: 200 },
      outputs: [true], // 初期状態
      inputs: [],
    },
    {
      id: 'not2',
      type: 'NOT' as const,
      position: { x: 400, y: 200 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not3',
      type: 'NOT' as const,
      position: { x: 500, y: 200 },
      outputs: [true],
      inputs: [],
    },

    // === Enable制御ゲート ===
    {
      id: 'enable_and',
      type: 'AND' as const,
      position: { x: 200, y: 200 },
      outputs: [false],
      inputs: [],
    },

    // === メモリ（発振状態を保持） ===
    {
      id: 'memory_sr',
      type: 'SR-LATCH' as const,
      position: { x: 600, y: 200 },
      outputs: [false, true],
      inputs: [],
    },

    // === 出力 ===
    {
      id: 'output_main',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 180 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'output_inverted',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 220 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // === 発振器コアの配線（リング） ===
    // not3 → enable_and（フィードバック制御）
    {
      id: 'w_not3_to_and',
      from: { gateId: 'not3', pinIndex: -1 },
      to: { gateId: 'enable_and', pinIndex: 0 },
      isActive: true,
    },
    // enable → enable_and
    {
      id: 'w_enable_to_and',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'enable_and', pinIndex: 1 },
      isActive: true,
    },
    // enable_and → not1（制御されたフィードバック）
    {
      id: 'w_and_to_not1',
      from: { gateId: 'enable_and', pinIndex: -1 },
      to: { gateId: 'not1', pinIndex: 0 },
      isActive: true,
    },
    // not1 → not2
    {
      id: 'w_not1_to_not2',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'not2', pinIndex: 0 },
      isActive: true,
    },
    // not2 → not3
    {
      id: 'w_not2_to_not3',
      from: { gateId: 'not2', pinIndex: -1 },
      to: { gateId: 'not3', pinIndex: 0 },
      isActive: false,
    },

    // === メモリ駆動 ===
    // not1 → S入力
    {
      id: 'w_not1_to_s',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'memory_sr', pinIndex: 0 },
      isActive: true,
    },
    // not2 → R入力
    {
      id: 'w_not2_to_r',
      from: { gateId: 'not2', pinIndex: -1 },
      to: { gateId: 'memory_sr', pinIndex: 1 },
      isActive: false,
    },

    // === 出力配線 ===
    // memory Q → output_main
    {
      id: 'w_q_to_out',
      from: { gateId: 'memory_sr', pinIndex: 0 },
      to: { gateId: 'output_main', pinIndex: 0 },
      isActive: false,
    },
    // memory Q̄ → output_inverted
    {
      id: 'w_qbar_to_out',
      from: { gateId: 'memory_sr', pinIndex: 1 },
      to: { gateId: 'output_inverted', pinIndex: 0 },
      isActive: true,
    },
  ],
};
