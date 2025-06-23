/**
 * ゲートタイプごとのデフォルト伝播遅延値（ns単位）
 *
 * これらの値は教育目的で設定されており、実際のハードウェアより大きめの値になっています。
 * 実際のCMOS技術では0.01-0.1ns程度ですが、視覚的に分かりやすくするため1-5nsに設定。
 *
 * 相対的な速度関係は実際のハードウェアに基づいています：
 * - NOTが最速（トランジスタ数が最少）
 * - NAND/NORが次に速い（基本ゲート）
 * - AND/ORはNAND/NOR+NOT相当
 * - XORは最も遅い（複雑な内部構造）
 */

import type { GateType } from '../types/circuit';

export const DEFAULT_GATE_DELAYS: Record<GateType, number> = {
  // 基本ゲート
  NOT: 1.0, // 最速：2トランジスタ
  NAND: 1.5, // 4トランジスタ
  NOR: 1.5, // 4トランジスタ
  AND: 2.0, // NAND + NOT
  OR: 2.0, // NOR + NOT
  XOR: 3.0, // 最も複雑
  XNOR: 3.0, // XORと同等の複雑さ

  // 入出力（遅延なし）
  INPUT: 0,
  OUTPUT: 0,

  // シーケンシャル素子
  'D-FF': 5.0, // フリップフロップは複雑
  'SR-LATCH': 4.0, // ラッチは少し速い
  CLOCK: 0, // クロックは特殊処理

  // その他
  MUX: 2.5, // 中程度の複雑さ
  BINARY_COUNTER: 10.0, // 内部に複数のFFを含む
  CUSTOM: 5.0, // デフォルト値（実際は内部回路から計算）
};

/**
 * 遅延モードの設定プリセット
 */
export const DELAY_PRESETS = {
  // 教育用標準（デフォルト）
  educational: DEFAULT_GATE_DELAYS,

  // 高速プリセット（半分の遅延）
  highSpeed: Object.fromEntries(
    Object.entries(DEFAULT_GATE_DELAYS).map(([gate, delay]) => [
      gate,
      delay * 0.5,
    ])
  ) as Record<GateType, number>,

  // 低速プリセット（2倍の遅延）
  lowSpeed: Object.fromEntries(
    Object.entries(DEFAULT_GATE_DELAYS).map(([gate, delay]) => [
      gate,
      delay * 2.0,
    ])
  ) as Record<GateType, number>,
};

/**
 * 時間単位の定義
 */
export const TIME_UNITS = {
  ps: 0.001, // ピコ秒
  ns: 1, // ナノ秒（デフォルト）
  us: 1000, // マイクロ秒
  ms: 1000000, // ミリ秒
} as const;

export type TimeUnit = keyof typeof TIME_UNITS;
