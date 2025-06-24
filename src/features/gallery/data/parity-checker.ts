import type { GalleryCircuit } from './types';

/**
 * 4ビット偶数パリティチェッカー
 * 入力ビット中の1の個数が偶数なら0、奇数なら1を出力
 * XORゲートの美しいカスケード接続例
 */
export const PARITY_CHECKER: GalleryCircuit = {
  id: 'parity-checker',
  title: 'パリティチェッカー',
  description:
    'データの誤り検出に使われるパリティチェック回路。XORゲートの連鎖で「1の個数が奇数か偶数か」を判定！',
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // === Layer 0: 4ビット入力 ===
    {
      id: 'input_d3',
      type: 'INPUT',
      position: { x: 100, y: 325 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'input_d2',
      type: 'INPUT',
      position: { x: 100, y: 375 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'input_d1',
      type: 'INPUT',
      position: { x: 100, y: 425 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'input_d0',
      type: 'INPUT',
      position: { x: 100, y: 475 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 1: XORのカスケード接続 ===
    {
      id: 'xor_32',
      type: 'XOR',
      position: { x: 250, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'xor_10',
      type: 'XOR',
      position: { x: 250, y: 450 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 2: 最終XOR ===
    {
      id: 'xor_final',
      type: 'XOR',
      position: { x: 400, y: 400 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 3: 出力群 ===
    {
      id: 'debug_32',
      type: 'OUTPUT',
      position: { x: 550, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'parity_out',
      type: 'OUTPUT',
      position: { x: 550, y: 400 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'debug_10',
      type: 'OUTPUT',
      position: { x: 550, y: 450 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // D3 XOR D2
    {
      id: 'w_d3_xor32',
      from: { gateId: 'input_d3', pinIndex: -1 },
      to: { gateId: 'xor_32', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_d2_xor32',
      from: { gateId: 'input_d2', pinIndex: -1 },
      to: { gateId: 'xor_32', pinIndex: 1 },
      isActive: false,
    },
    // D1 XOR D0
    {
      id: 'w_d1_xor10',
      from: { gateId: 'input_d1', pinIndex: -1 },
      to: { gateId: 'xor_10', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_d0_xor10',
      from: { gateId: 'input_d0', pinIndex: -1 },
      to: { gateId: 'xor_10', pinIndex: 1 },
      isActive: false,
    },
    // (D3 XOR D2) XOR (D1 XOR D0)
    {
      id: 'w_xor32_final',
      from: { gateId: 'xor_32', pinIndex: -1 },
      to: { gateId: 'xor_final', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_xor10_final',
      from: { gateId: 'xor_10', pinIndex: -1 },
      to: { gateId: 'xor_final', pinIndex: 1 },
      isActive: false,
    },
    // 最終出力
    {
      id: 'w_final_out',
      from: { gateId: 'xor_final', pinIndex: -1 },
      to: { gateId: 'parity_out', pinIndex: 0 },
      isActive: false,
    },
    // デバッグ出力
    {
      id: 'w_debug32',
      from: { gateId: 'xor_32', pinIndex: -1 },
      to: { gateId: 'debug_32', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_debug10',
      from: { gateId: 'xor_10', pinIndex: -1 },
      to: { gateId: 'debug_10', pinIndex: 0 },
      isActive: false,
    },
  ],
};
