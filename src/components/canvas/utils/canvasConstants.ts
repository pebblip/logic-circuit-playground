/**
 * Canvas関連の定数定義
 * Canvas.tsxから抽出して整理
 */

export const CANVAS_CONSTANTS = {
  // ViewBox関連
  DEFAULT_VIEWBOX: {
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
  },
  
  // プレビューモード関連
  PREVIEW_PADDING: 150,
  MIN_VIEWBOX_SIZE: 400,
  
  // グリッド関連
  GRID_SIZE: 20,
  GRID_COLOR: 'rgba(255, 255, 255, 0.2)',
  GRID_OPACITY: 0.3,
  
  // ズームコントロール関連
  ZOOM_CONTROLS_OFFSET: 20,
  ZOOM_CONTROLS_BOTTOM: 80,
  
  // 選択矩形関連
  SELECTION_RECT_COLOR: '#00ff88',
  SELECTION_RECT_OPACITY: 0.1,
  SELECTION_RECT_STROKE_WIDTH: 2,
  
  // CLOCKゲート更新関連
  MIN_UPDATE_INTERVAL: 10, // Hz
  MAX_UPDATE_INTERVAL: 100, // ms
  CLOCK_UPDATE_MULTIPLIER: 4, // サンプリング定理に基づく倍率
  
  // パン・ズーム関連
  PAN_STEP: 50,
  ZOOM_FACTOR: 1.2,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  
  // その他
  PIN_EXTENSION: 10, // ゲートピンの突き出し分
  ORIGIN_VIEW_SIZE: 4000,
  ORIGIN_VIEW_OFFSET: -2000,
} as const;

export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};