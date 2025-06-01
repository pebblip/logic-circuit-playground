// UI関連の定数

// ピンのサイズと当たり判定
export const PIN_CONSTANTS = {
  // 表示サイズ（より大きく見やすく）
  VISUAL_RADIUS: 6,
  
  // 当たり判定（クリックしやすく）
  HIT_RADIUS: 20,
  
  // ホバー時の拡大率
  HOVER_SCALE: 1.3,
  
  // マグネット効果の範囲
  MAGNET_DISTANCE: 20,
  
  // ストローク幅
  STROKE_WIDTH: 2,
  
  // アニメーション時間
  TRANSITION_DURATION: '0.2s',
  
  // ピンの色（ダークテーマ最適化）
  COLORS: {
    INPUT: {
      DEFAULT: 'rgba(255, 255, 255, 0.4)',  // 半透明白
      HOVER: 'rgba(255, 255, 255, 0.8)',
      ACTIVE: '#00ff88',
      STROKE: '#ffffff',
      GLOW: 'rgba(0, 255, 136, 0.4)'
    },
    OUTPUT: {
      DEFAULT: 'rgba(255, 255, 255, 0.4)',  // 半透明白
      HOVER: 'rgba(255, 255, 255, 0.8)', 
      ACTIVE: '#00ff88',
      STROKE: '#ffffff',
      GLOW: 'rgba(0, 255, 136, 0.4)'
    }
  }
} as const;

// グリッドスナップ
export const GRID_CONSTANTS = {
  SIZE: 20,  // グリッドサイズ
  SNAP_ENABLED: true,  // スナップ有効/無効
  DOT_RADIUS: 1,  // グリッドドットのサイズ
  LINE_WIDTH: 0.5,  // グリッド線の太さ
  COLORS: {
    DARK: {
      DOT: '#333333',
      LINE: '#2a2a2a',
      HOVER: 'rgba(0, 255, 136, 0.1)'
    },
    LIGHT: {
      DOT: '#e0e0e0', 
      LINE: '#f0f0f0',
      HOVER: 'rgba(74, 144, 226, 0.1)'
    }
  }
} as const;

// ゲート配置
export const GATE_PLACEMENT = {
  // 初期配置位置
  INITIAL_X: 100,
  INITIAL_Y: 100,
  
  // グリッド配置の間隔
  GRID_SPACING: 120,
  
  // 行ごとの最大ゲート数
  MAX_GATES_PER_ROW: 5,
  
  // 次のゲートのオフセット
  OFFSET_X: 120,
  OFFSET_Y: 120,
  
  // 最大配置位置（画面外を防ぐ）
  MAX_X: 800,
  MAX_Y: 600,
  
  // 配置アニメーション
  ANIMATION_DURATION: '0.3s',
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
} as const;

// 型定義
export type PinConstants = typeof PIN_CONSTANTS;
export type GridConstants = typeof GRID_CONSTANTS;
export type GatePlacement = typeof GATE_PLACEMENT;