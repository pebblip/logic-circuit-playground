// UI関連の定数

// ピンのサイズと当たり判定
export const PIN_CONSTANTS = {
  // 表示サイズ
  VISUAL_RADIUS: 5,
  
  // 当たり判定（表示サイズの3倍）
  HIT_RADIUS: 15,
  
  // ホバー時の拡大率
  HOVER_SCALE: 1.5,
  
  // マグネット効果の範囲
  MAGNET_DISTANCE: 20,
  
  // ピンの色
  COLORS: {
    INPUT: {
      DEFAULT: '#4A90E2',  // 青
      HOVER: '#5BA0F2',
      ACTIVE: '#6BB0FF',
    },
    OUTPUT: {
      DEFAULT: '#50C878',  // 緑
      HOVER: '#60D888',
      ACTIVE: '#70E898',
    }
  }
};

// グリッドスナップ
export const GRID_CONSTANTS = {
  SIZE: 20,  // グリッドサイズ
  SNAP_ENABLED: true,  // スナップ有効/無効
};

// ゲート配置
export const GATE_PLACEMENT = {
  // 初期配置位置
  INITIAL_X: 100,
  INITIAL_Y: 100,
  
  // 次のゲートのオフセット
  OFFSET_X: 100,
  OFFSET_Y: 0,
  
  // 最大配置位置（画面外を防ぐ）
  MAX_X: 800,
  MAX_Y: 600,
};