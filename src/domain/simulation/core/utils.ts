// 信号型変換ユーティリティ
// boolean ↔ string の変換を統一的に管理

import { debug } from '@/shared/debug';

/**
 * boolean値をUI表示用の文字列に変換
 * @param value boolean値
 * @returns '1' (true) または '' (false)
 */
export function booleanToDisplayState(value: boolean): string {
  return value ? '1' : '';
}

/**
 * UI表示用の文字列をboolean値に変換
 * @param state '1', 'true' または '' (false)
 * @returns boolean値
 */
export function displayStateToBoolean(state: string): boolean {
  return state === '1' || state === 'true';
}

/**
 * boolean配列をUI表示用の文字列配列に変換
 * @param values boolean配列
 * @returns 文字列配列
 */
export function booleanArrayToDisplayStates(values: boolean[]): string[] {
  return values.map(booleanToDisplayState);
}

/**
 * UI表示用の文字列配列をboolean配列に変換
 * @param states 文字列配列
 * @returns boolean配列
 */
export function displayStatesToBooleanArray(states: string[]): boolean[] {
  return states.map(displayStateToBoolean);
}

/**
 * 型安全なゲート入力の取得
 * @param gate ゲート
 * @param index 入力インデックス
 * @returns boolean値
 */
export function getGateInputValue(
  gate: { inputs: readonly boolean[] },
  index: number
): boolean {
  return gate.inputs[index] ?? false;
}

/**
 * 型安全なゲート入力の設定（不変性版）
 * @param gate ゲート
 * @param index 入力インデックス
 * @param value boolean値
 * @returns 新しい入力配列
 */
export function setGateInputValue(
  gate: { inputs: readonly boolean[] },
  index: number,
  value: boolean
): readonly boolean[] {
  const newInputs = [...gate.inputs];
  newInputs[index] = value;
  return newInputs;
}

/**
 * ゲートの全入力をboolean配列として取得
 * @param gate ゲート
 * @returns boolean配列
 */
export function getGateInputsAsBoolean(gate: {
  inputs: readonly boolean[];
}): readonly boolean[] {
  return [...gate.inputs];
}

/**
 * Debug用: 信号の型と値を出力
 * @param signal 信号値
 * @param context デバッグコンテキスト
 */
export function debugSignal(
  signal: string | boolean | unknown,
  context: string
): void {
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    debug.log(`[Signal Debug] ${context}:`, {
      value: signal,
      type: typeof signal,
      isBoolean: typeof signal === 'boolean',
      isString: typeof signal === 'string',
      booleanValue:
        typeof signal === 'string' ? displayStateToBoolean(signal) : signal,
    });
  }
}
