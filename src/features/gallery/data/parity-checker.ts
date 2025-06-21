import type { CircuitMetadata } from './gallery';

/**
 * 4ビット偶数パリティチェッカー
 * 入力ビット中の1の個数が偶数なら0、奇数なら1を出力
 * XORゲートの美しいカスケード接続例
 */
export const PARITY_CHECKER: CircuitMetadata = {
  id: 'parity-checker',
  title: 'パリティチェッカー',
  description:
    'データの誤り検出に使われるパリティチェック回路。XORゲートの連鎖で「1の個数が奇数か偶数か」を判定！',
  gates: [
    // 4ビット入力
    {
      id: 'input_d3',
      type: 'INPUT',
      position: { x: 100, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'input_d2',
      type: 'INPUT',
      position: { x: 100, y: 200 },
      output: false,
      inputs: [],
    },
    {
      id: 'input_d1',
      type: 'INPUT',
      position: { x: 100, y: 300 },
      output: false,
      inputs: [],
    },
    {
      id: 'input_d0',
      type: 'INPUT',
      position: { x: 100, y: 400 },
      output: false,
      inputs: [],
    },
    // XORのカスケード接続
    {
      id: 'xor_32',
      type: 'XOR',
      position: { x: 300, y: 150 },
      output: false,
      inputs: [],
    },
    {
      id: 'xor_10',
      type: 'XOR',
      position: { x: 300, y: 350 },
      output: false,
      inputs: [],
    },
    {
      id: 'xor_final',
      type: 'XOR',
      position: { x: 500, y: 250 },
      output: false,
      inputs: [],
    },
    // パリティ出力
    {
      id: 'parity_out',
      type: 'OUTPUT',
      position: { x: 700, y: 250 },
      output: false,
      inputs: [],
    },
    // デバッグ用：各段階の出力表示
    {
      id: 'debug_32',
      type: 'OUTPUT',
      position: { x: 450, y: 150 },
      output: false,
      inputs: [],
    },
    {
      id: 'debug_10',
      type: 'OUTPUT',
      position: { x: 450, y: 350 },
      output: false,
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
