// 信号型変換ユーティリティ
// boolean ↔ string の変換を統一的に管理

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
 * @param state '1' または ''
 * @returns boolean値
 */
export function displayStateToBoolean(state: string): boolean {
  return state === '1';
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
 * 安全なゲート入力の取得（型不整合を吸収）
 * @param gate ゲート
 * @param index 入力インデックス
 * @returns boolean値
 */
export function getGateInputValue(gate: { inputs: (string | boolean)[] }, index: number): boolean {
  const input = gate.inputs[index];
  if (typeof input === 'boolean') {
    return input;
  }
  return displayStateToBoolean(input as string);
}

/**
 * 安全なゲート入力の設定（型不整合を吸収）
 * @param gate ゲート
 * @param index 入力インデックス
 * @param value boolean値
 */
export function setGateInputValue(gate: { inputs: (string | boolean)[] }, index: number, value: boolean): void {
  // 現在の実装に合わせて文字列として保存
  gate.inputs[index] = booleanToDisplayState(value);
}

/**
 * ゲートの全入力をboolean配列として取得
 * @param gate ゲート
 * @returns boolean配列
 */
export function getGateInputsAsBoolean(gate: { inputs: (string | boolean)[] }): boolean[] {
  return gate.inputs.map(input => 
    typeof input === 'boolean' ? input : displayStateToBoolean(input as string)
  );
}

/**
 * Debug用: 信号の型と値を出力
 * @param signal 信号値
 * @param context デバッグコンテキスト
 */
export function debugSignal(signal: any, context: string): void {
  console.log(`[Signal Debug] ${context}:`, {
    value: signal,
    type: typeof signal,
    isBoolean: typeof signal === 'boolean',
    isString: typeof signal === 'string',
    booleanValue: typeof signal === 'string' ? displayStateToBoolean(signal) : signal
  });
}