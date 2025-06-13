/**
 * ユーザーフレンドリーなエラーメッセージ定義
 * 技術用語を避け、分かりやすい日本語で説明
 */

// エラーメッセージの国際化対応
export const ERROR_MESSAGES = {
  // ゲート関連のエラー
  GATE_INVALID_ID: 'ゲートの名前が正しくありません。',
  GATE_EMPTY_ID: 'ゲートに名前を付けてください。',
  GATE_ID_TOO_LONG: 'ゲートの名前が長すぎます（100文字以内にしてください）。',
  GATE_ID_INVALID_CHARS:
    'ゲートの名前に使用できない文字が含まれています。英数字、アンダースコア、ハイフンのみ使用可能です。',
  GATE_INVALID_TYPE: '対応していないゲートの種類です。',
  GATE_INVALID_POSITION: 'ゲートの位置情報が正しくありません。',
  GATE_POSITION_NOT_NUMBER: 'ゲートの位置は数値で指定してください。',
  GATE_POSITION_NOT_FINITE: 'ゲートの位置に無限大の値は使用できません。',
  GATE_INPUTS_NOT_ARRAY: 'ゲートの入力情報が正しくありません。',
  GATE_OUTPUT_NOT_BOOLEAN: 'ゲートの出力情報が正しくありません。',
  GATE_MISSING_CUSTOM_DEFINITION: 'カスタムゲートの定義が見つかりません。',
  GATE_DUPLICATE_ID: '同じ名前のゲートが既に存在します。',

  // 入力関連のエラー
  INPUT_COUNT_MISMATCH: (expected: number, actual: number) =>
    `入力数が正しくありません。${expected}個の入力が必要ですが、${actual}個の入力があります。`,
  INPUT_TYPE_INVALID: (index: number) =>
    `${index + 1}番目の入力値が正しくありません。`,
  INPUT_PROVIDE_CORRECT_COUNT: (count: number, gateType: string) =>
    `${gateType}ゲートには${count}個の入力が必要です。`,

  // カスタムゲート関連のエラー
  CUSTOM_GATE_INVALID_DEFINITION: 'カスタムゲートの設定が正しくありません。',
  CUSTOM_GATE_MISSING_ID: 'カスタムゲートにIDを設定してください。',
  CUSTOM_GATE_MISSING_NAME: 'カスタムゲートに名前を設定してください。',
  CUSTOM_GATE_INPUTS_NOT_ARRAY: 'カスタムゲートの入力設定が正しくありません。',
  CUSTOM_GATE_NO_INPUTS: 'カスタムゲートには少なくとも1つの入力が必要です。',
  CUSTOM_GATE_OUTPUTS_NOT_ARRAY: 'カスタムゲートの出力設定が正しくありません。',
  CUSTOM_GATE_NO_OUTPUTS: 'カスタムゲートには少なくとも1つの出力が必要です。',
  CUSTOM_GATE_NO_IMPLEMENTATION:
    'カスタムゲートの動作を定義してください（真理値表または内部回路）。',

  // ワイヤー関連のエラー
  WIRE_INVALID_ID: '配線の識別情報が正しくありません。',
  WIRE_EMPTY_ID: '配線に識別情報を設定してください。',
  WIRE_INVALID_FROM: '配線の開始点が正しく設定されていません。',
  WIRE_INVALID_TO: '配線の終了点が正しく設定されていません。',
  WIRE_FROM_GATE_MISSING: '配線の開始点となるゲートが見つかりません。',
  WIRE_TO_GATE_MISSING: '配線の終了点となるゲートが見つかりません。',
  WIRE_INVALID_PIN_INDEX: '配線の接続位置が正しくありません。',
  WIRE_STATE_INVALID: '配線の状態情報が正しくありません。',
  WIRE_DUPLICATE_ID: '同じ識別子の配線が既に存在します。',

  // 回路全体のエラー
  CIRCUIT_TOO_LARGE: (count: number, max: number) =>
    `回路が複雑すぎます。ゲート数を${max}個以下にしてください（現在：${count}個）。`,
  CIRCUIT_TOO_COMPLEX: (count: number, max: number) =>
    `配線が多すぎます。配線数を${max}本以下にしてください（現在：${count}本）。`,
  CIRCUIT_CIRCULAR_DEPENDENCY: (cycle: string[]) =>
    `回路に無限ループが発生しています：${cycle.join(' → ')}`,
  CIRCUIT_INVALID_STRUCTURE: '回路の構造が正しくありません。',
  CIRCUIT_GATES_NOT_ARRAY: 'ゲート情報が正しくありません。',
  CIRCUIT_WIRES_NOT_ARRAY: '配線情報が正しくありません。',

  // ピン関連のエラー
  PIN_INDEX_TOO_HIGH: (gateId: string, pinIndex: number, maxOutputs: number) =>
    `ゲート「${gateId}」の出力ピン${Math.abs(pinIndex)}番は存在しません（出力数：${maxOutputs}個）。`,
  PIN_INDEX_INVALID_STANDARD: (gateId: string, pinIndex: number) =>
    `ゲート「${gateId}」のピン番号${pinIndex}は無効です。標準ゲートは出力ピン番号-1のみ使用可能です。`,

  // 一般的なエラー
  OPERATION_FAILED: '操作に失敗しました。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
  VALIDATION_FAILED: '入力内容に問題があります。',

  // 成功メッセージ
  VALIDATION_SUCCESS: '検証が完了しました。',
  OPERATION_SUCCESS: '操作が完了しました。',
} as const;

// 提案メッセージ
export const SUGGESTION_MESSAGES = {
  ADD_INPUT_GATES:
    '入力ゲート（INPUT）を追加して、外部からの信号を受け取れるようにしましょう。',
  ADD_OUTPUT_GATES:
    '出力ゲート（OUTPUT）を追加して、回路の結果を確認できるようにしましょう。',
  USE_CUSTOM_GATES:
    '回路が大きくなっています。カスタムゲートを使って整理することをお勧めします。',
  CHECK_CONNECTIONS: '接続を確認してください。',
  SIMPLIFY_CIRCUIT: '回路を簡単にしてみてください。',
  VERIFY_GATE_SETTINGS: 'ゲートの設定を確認してください。',
} as const;

// エラーレベル
export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

// ユーザーフレンドリーなエラー変換関数
export function humanizeError(
  error: unknown,
  defaultMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR
): string {
  if (!error) {
    return defaultMessage;
  }

  // Error オブジェクトの場合
  if (error instanceof Error) {
    const message = error.message;

    // 技術的なメッセージを人間が理解しやすいメッセージに変換
    if (message.includes('must be a string')) {
      return ERROR_MESSAGES.GATE_INVALID_ID;
    }
    if (message.includes('cannot be empty')) {
      return ERROR_MESSAGES.GATE_EMPTY_ID;
    }
    if (message.includes('too long')) {
      return ERROR_MESSAGES.GATE_ID_TOO_LONG;
    }
    if (message.includes('invalid characters')) {
      return ERROR_MESSAGES.GATE_ID_INVALID_CHARS;
    }
    if (message.includes('Invalid gate type')) {
      return ERROR_MESSAGES.GATE_INVALID_TYPE;
    }
    if (message.includes('Custom gate must have definition')) {
      return ERROR_MESSAGES.GATE_MISSING_CUSTOM_DEFINITION;
    }
    if (message.includes('Duplicate gate ID')) {
      return ERROR_MESSAGES.GATE_DUPLICATE_ID;
    }
    if (message.includes('Gate position')) {
      return ERROR_MESSAGES.GATE_INVALID_POSITION;
    }
    if (message.includes('inputs must be')) {
      return ERROR_MESSAGES.GATE_INPUTS_NOT_ARRAY;
    }
    if (message.includes('output must be boolean')) {
      return ERROR_MESSAGES.GATE_OUTPUT_NOT_BOOLEAN;
    }
    if (message.includes('Wire') && message.includes('must be')) {
      return ERROR_MESSAGES.WIRE_INVALID_ID;
    }
    if (message.includes('Circular dependency')) {
      return ERROR_MESSAGES.CIRCUIT_CIRCULAR_DEPENDENCY(['複数のゲート']);
    }
    if (message.includes('too many gates')) {
      return ERROR_MESSAGES.CIRCUIT_TOO_LARGE(0, 1000);
    }
    if (message.includes('too many wires')) {
      return ERROR_MESSAGES.CIRCUIT_TOO_COMPLEX(0, 5000);
    }

    // 既に人間が理解しやすいメッセージの場合はそのまま返す
    // 関数でない文字列値のみをチェック
    const allValues = Object.values(ERROR_MESSAGES);
    const stringValues = allValues.filter(
      value => typeof value === 'string'
    ) as string[];
    if (stringValues.includes(message)) {
      return message;
    }

    // 認識できないエラーメッセージの場合はデフォルトメッセージを返す
    return defaultMessage;
  }

  // 文字列の場合
  if (typeof error === 'string') {
    return humanizeError(new Error(error), defaultMessage);
  }

  // オブジェクトで message プロパティがある場合
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { message?: unknown };
    if (typeof errorObj.message === 'string') {
      return humanizeError(new Error(errorObj.message), defaultMessage);
    }
  }

  return defaultMessage;
}

// 操作コンテキスト別のエラーメッセージ
export const CONTEXT_MESSAGES = {
  CIRCUIT_SAVE: {
    LOADING: '回路を保存しています...',
    SUCCESS: '回路が保存されました',
    ERROR: '回路の保存に失敗しました',
  },
  CIRCUIT_LOAD: {
    LOADING: '回路を読み込んでいます...',
    SUCCESS: '回路が読み込まれました',
    ERROR: '回路の読み込みに失敗しました',
  },
  CIRCUIT_DELETE: {
    LOADING: '回路を削除しています...',
    SUCCESS: '回路が削除されました',
    ERROR: '回路の削除に失敗しました',
  },
  CIRCUIT_EXPORT: {
    LOADING: '回路をエクスポートしています...',
    SUCCESS: '回路がエクスポートされました',
    ERROR: '回路のエクスポートに失敗しました',
  },
  CIRCUIT_IMPORT: {
    LOADING: '回路をインポートしています...',
    SUCCESS: '回路がインポートされました',
    ERROR: '回路のインポートに失敗しました',
  },
  CUSTOM_GATE_CREATE: {
    LOADING: 'カスタムゲートを作成しています...',
    SUCCESS: 'カスタムゲートが作成されました',
    ERROR: 'カスタムゲートの作成に失敗しました',
  },
  SIMULATION: {
    LOADING: '回路をシミュレーションしています...',
    SUCCESS: 'シミュレーションが完了しました',
    ERROR: 'シミュレーションでエラーが発生しました',
  },
} as const;
