/**
 * アプリケーション全体用語辞書
 * 全コンポーネント・モジュールで統一された用語を管理
 */

export const TERMS = {
  // ゲート名
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  CLOCK: 'CLOCK',
  D_FF: 'D-FF',
  SR_LATCH: 'SR-LATCH',
  MUX: 'MUX',

  // 基本用語
  INPUT: '入力',
  OUTPUT: '出力',
  GATE: 'ゲート',
  LOGIC_GATE: '論理ゲート',
  CIRCUIT: '回路',
  LOGIC_CIRCUIT: '論理回路',
  DIGITAL_CIRCUIT: 'デジタル回路',
  ELECTRONIC_CIRCUIT: '電子回路',
  WIRE: '配線',
  CONNECTION: '接続',
  PIN: 'ピン',
  TERMINAL: '端子',
  CONNECTION_POINT: '接続点',
  TRUTH_TABLE: '真理値表',
  SIGNAL: '信号',
  DATA: 'データ',
  VALUE: '値',

  // 状態・プロパティ
  ON: 'ON',
  OFF: 'OFF',
  HIGH: '1',
  LOW: '0',
  ACTIVE: 'アクティブ',
  INACTIVE: '非アクティブ',
  SELECTED: '選択中',
  DESELECTED: '選択解除',
  RUNNING: '動作中',
  STOPPED: '停止中',
  ENABLED: '有効',
  DISABLED: '無効',
  AVAILABLE: '利用可能',
  UNAVAILABLE: '利用不可',

  // UI操作
  CLICK: 'クリック',
  DOUBLE_CLICK: 'ダブルクリック',
  DRAG: 'ドラッグ',
  DROP: 'ドロップ',
  DRAG_AND_DROP: 'ドラッグ&ドロップ',
  SELECT: '選択',
  RANGE_SELECT: '範囲選択',
  MULTI_SELECT: '複数選択',
  DELETE: '削除',
  REMOVE: '削除',
  ERASE: '消去',
  PLACE: '配置',
  CONNECT: '接続',
  DISCONNECT: '切断',
  MOVE: '移動',
  COPY: 'コピー',
  PASTE: '貼り付け',
  UNDO: '元に戻す',
  REDO: 'やり直し',

  // ファイル操作
  SAVE: '保存',
  LOAD: '読み込み',
  OPEN: '開く',
  IMPORT: 'インポート',
  EXPORT: 'エクスポート',
  NEW: '新規',
  CREATE: '作成',

  // 特殊機能
  CUSTOM_GATE: 'カスタムゲート',
  USER_DEFINED_GATE: 'ユーザー定義ゲート',
  SIMULATION: 'シミュレーション',
  ZOOM: 'ズーム',
  PAN: 'パン',
  GRID: 'グリッド',
  SNAP: 'スナップ',

  // レイアウト・位置
  LEFT: '左',
  RIGHT: '右',
  TOP: '上',
  BOTTOM: '下',
  CENTER: '中央',
  POSITION: '位置',
  SIZE: 'サイズ',
  WIDTH: '幅',
  HEIGHT: '高さ',

  // 定型句・複合語
  INPUT_PIN: '入力ピン',
  OUTPUT_PIN: '出力ピン',
  INPUT_GATE: '入力ゲート',
  OUTPUT_GATE: '出力ゲート',
  LEFT_CIRCLE: '左の丸',
  RIGHT_CIRCLE: '右の丸',
  CONNECTION_LINE: '接続線',
  CIRCUIT_NAME: '回路名',
  GATE_TYPE: 'ゲート種別',
  GATE_NAME: 'ゲート名',
  CLOCK_SIGNAL: 'クロック信号',
  LOGIC_OPERATION: '論理演算',
  BOOLEAN_OPERATION: 'ブール演算',
  TRUTH_VALUE: '真理値',
  BINARY_VALUE: '2進値',

  // モード・画面
  FREE_MODE: 'フリーモード',
  LEARNING_MODE: '学習モード',
  PUZZLE_MODE: 'パズルモード',
  GALLERY_MODE: 'ギャラリーモード',
  HELP: 'ヘルプ',
  TUTORIAL: 'チュートリアル',
  LESSON: 'レッスン',
  EXERCISE: '演習',
  QUIZ: 'クイズ',

  // エラー・警告
  ERROR: 'エラー',
  WARNING: '警告',
  INFO: '情報',
  SUCCESS: '成功',
  FAILED: '失敗',
  INVALID: '無効',
  VALID: '有効',
  REQUIRED: '必須',
  OPTIONAL: '省略可能',

  // 数値・単位
  BIT: 'ビット',
  BYTE: 'バイト',
  BINARY: '2進数',
  DECIMAL: '10進数',
  HEXADECIMAL: '16進数',
  MILLISECOND: 'ミリ秒',
  SECOND: '秒',
  MINUTE: '分',
  PIXEL: 'ピクセル',
  PERCENT: 'パーセント',
} as const;

// 型安全性のための型定義
export type TermKey = keyof typeof TERMS;
