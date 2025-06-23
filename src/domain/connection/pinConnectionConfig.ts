/**
 * ピン接続システム統一設定
 *
 * CLAUDE.md準拠: データ・ロジック統合原則
 * - 分散していた設定値を単一ファイルに統合
 * - 型安全性を保証した設定定義
 * - 自動フォールバック機能付き
 */

import type { GateType } from '@/types/circuit';

// ピンクリック範囲設定
export const PIN_CLICK_AREA = {
  rx: 25,
  ry: 10,
} as const;

// ピン視覚設定
export const PIN_VISUAL = {
  radius: 6,
  strokeWidth: {
    normal: 2,
    hovered: 3,
  },
  colors: {
    active: '#00ff88',
    inactive: 'none',
    stroke: '#00ff88',
  },
  opacity: {
    normal: 0.8,
    hovered: 1.0,
    active: 1.0,
    inactive: 0.4,
  },
} as const;

// ゲートタイプ別ピン座標オフセット設定
export const PIN_OFFSETS = {
  // 基本ゲート (AND, OR, XOR, NAND, NOR)
  BASIC_GATES: {
    input: {
      x: -45,
      y: [
        { index: 0, offset: -10 }, // 上の入力ピン
        { index: 1, offset: 10 }, // 下の入力ピン
      ],
    },
    output: {
      x: 45,
      y: 0,
    },
  },

  // NOTゲート
  NOT: {
    input: {
      x: -45,
      y: 0, // 単一入力なので中央
    },
    output: {
      x: 45,
      y: 0,
    },
  },

  // 入出力ゲート
  INPUT: {
    output: {
      x: 35,
      y: 0,
    },
  },

  OUTPUT: {
    input: {
      x: -30,
      y: 0,
    },
  },

  // CLOCKゲート
  CLOCK: {
    output: {
      x: 55,
      y: 0,
    },
  },

  // D型フリップフロップ
  'D-FF': {
    input: {
      x: -60,
      y: [
        { index: 0, offset: -20, label: 'D' }, // Data入力
        { index: 1, offset: 20, label: 'CLK' }, // Clock入力
      ],
    },
    output: {
      x: 60,
      y: [
        { index: 0, offset: -15, label: 'Q' }, // Q出力
        { index: 1, offset: 15, label: 'Q̄' }, // Q̄出力
      ],
    },
  },

  // SRラッチ
  'SR-LATCH': {
    input: {
      x: -60,
      y: [
        { index: 0, offset: -20, label: 'S' }, // Set入力
        { index: 1, offset: 20, label: 'R' }, // Reset入力
      ],
    },
    output: {
      x: 60,
      y: [
        { index: 0, offset: -15, label: 'Q' }, // Q出力
        { index: 1, offset: 15, label: 'Q̄' }, // Q̄出力
      ],
    },
  },

  // マルチプレクサ
  MUX: {
    input: {
      x: -60,
      y: [
        { index: 0, offset: -25, label: 'A' }, // 入力A
        { index: 1, offset: 0, label: 'B' }, // 入力B
        { index: 2, offset: 25, label: 'S' }, // セレクト入力
      ],
    },
    output: {
      x: 60,
      y: 0,
    },
  },

  // バイナリカウンター
  BINARY_COUNTER: {
    input: {
      x: -60,
      y: 0, // CLK入力
    },
    output: {
      x: 60,
      y: [
        { index: 0, offset: -15, label: 'Q0' }, // LSB
        { index: 1, offset: 0, label: 'Q1' },
        { index: 2, offset: 15, label: 'Q2' }, // MSB
      ],
    },
  },

  // LEDゲート（動的ピン数対応 - PinConnectionManagerで処理）
  LED: {
    // LEDゲートは動的ピン配置のため、calculateLEDGatePinPositionで処理
  },
} as const;

// カスタムゲート設定
export const CUSTOM_GATE_CONFIG = {
  defaultSize: {
    width: 100,
    height: 60,
  },
  pinSpacing: {
    default: 30,
    minimum: 20,
  },
  margins: {
    horizontal: 10, // ピンからゲート境界までの距離
    vertical: 10,
  },
} as const;

// 接続判定設定
export const CONNECTION_VALIDATION = {
  // ピン間の最大接続距離
  maxConnectionDistance: 50,

  // 最小接続距離（自己接続防止）
  minConnectionDistance: 10,

  // 接続可能性ルール
  rules: {
    // 同一ピンタイプ間は接続不可
    sameTypeConnection: false,

    // 自己接続は不可
    selfConnection: false,

    // 入力ピンへの複数接続は不可
    multipleInputConnections: false,

    // 循環接続の検出
    circularConnectionDetection: true,
  },
} as const;

// ワイヤー描画設定
export const WIRE_RENDERING = {
  styles: ['bezier', 'manhattan', 'manhattan-rounded'] as const,
  defaultStyle: 'bezier' as const,

  visual: {
    strokeWidth: {
      normal: 2,
      active: 3,
      selected: 4,
    },
    colors: {
      active: '#00ff88',
      inactive: '#666666',
      selected: '#ffaa00',
      error: '#ff4444',
    },
    opacity: {
      normal: 0.8,
      active: 1.0,
      inactive: 0.4,
    },
  },

  animation: {
    duration: 300, // ミリ秒
    easing: 'ease-out',
  },
} as const;

// デバッグ設定
export const DEBUG_CONFIG = {
  showPinClickAreas: false, // 本番では false
  showCoordinateLabels: false,
  logConnectionAttempts: false, // 本番ではfalse
} as const;

// 型定義
export type PinOffsetEntry = {
  index: number;
  offset: number;
  label?: string;
};

export type GatePinConfig = {
  input?: {
    x: number;
    y: number | readonly PinOffsetEntry[];
  };
  output?: {
    x: number;
    y: number | readonly PinOffsetEntry[];
  };
};

// ヘルパー関数: ゲートタイプからピン設定を取得
export function getPinConfig(gateType: GateType): GatePinConfig {
  switch (gateType) {
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
      return PIN_OFFSETS.BASIC_GATES;

    case 'NOT':
      return PIN_OFFSETS.NOT;

    case 'INPUT':
      return PIN_OFFSETS.INPUT;

    case 'OUTPUT':
      return PIN_OFFSETS.OUTPUT;

    case 'CLOCK':
      return PIN_OFFSETS.CLOCK;

    case 'D-FF':
      return PIN_OFFSETS['D-FF'];

    case 'SR-LATCH':
      return PIN_OFFSETS['SR-LATCH'];

    case 'MUX':
      return PIN_OFFSETS.MUX;

    case 'BINARY_COUNTER':
      return PIN_OFFSETS.BINARY_COUNTER;

    case 'LED':
      return PIN_OFFSETS.LED;

    case 'CUSTOM':
      // カスタムゲートは動的計算が必要
      return {};

    default:
      // 自動フォールバック: 基本ゲート設定を使用
      console.warn(
        `Unknown gate type: ${gateType}, using BASIC_GATES fallback`
      );
      return PIN_OFFSETS.BASIC_GATES;
  }
}

// ヘルパー関数: ピンインデックスから座標オフセットを取得
export function getPinOffsetY(
  config: number | readonly PinOffsetEntry[],
  pinIndex: number
): number {
  if (typeof config === 'number') {
    return config;
  }

  const entry = config.find(entry => entry.index === pinIndex);
  return entry?.offset ?? 0; // フォールバック: 中央位置
}

// 統一されたエラーメッセージ
export const CONNECTION_ERRORS = {
  SAME_TYPE:
    'ピンのタイプが同じため接続できません（入力同士、出力同士は接続不可）',
  SELF_CONNECTION: '同一ゲート内のピン同士は接続できません',
  MULTIPLE_INPUT: '入力ピンには複数のワイヤーを接続できません',
  DISTANCE_TOO_FAR: `ピン間の距離が ${CONNECTION_VALIDATION.maxConnectionDistance}px を超えています`,
  CIRCULAR_CONNECTION: '循環接続が検出されました',
  INVALID_PIN_INDEX: 'ピンインデックスが無効です',
  GATE_NOT_FOUND: '指定されたゲートが見つかりません',
} as const;
