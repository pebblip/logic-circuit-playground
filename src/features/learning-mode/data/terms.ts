/**
 * 学習モード用語辞書
 * 全レッスンで統一された用語を管理
 */

export const TERMS = {
  // ゲート名
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',

  // 基本用語
  INPUT: '入力',
  OUTPUT: '出力',
  GATE: 'ゲート',
  CIRCUIT: '回路',
  WIRE: '配線',
  PIN: 'ピン',
  TRUTH_TABLE: '真理値表',

  // 状態
  ON: 'ON',
  OFF: 'OFF',
  HIGH: '1',
  LOW: '0',

  // 操作
  DOUBLE_CLICK: 'ダブルクリック',
  CONNECT: '接続',
  PLACE: '配置',

  // 定型句
  INPUT_PIN: '入力ピン',
  OUTPUT_PIN: '出力ピン',
  LEFT_CIRCLE: '左の丸',
  RIGHT_CIRCLE: '右の丸',
} as const;

// 型安全性のための型定義
export type TermKey = keyof typeof TERMS;
