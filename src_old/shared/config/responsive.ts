/**
 * レスポンシブデザイン用定数
 */

// レイアウト幅
export const LAYOUT_WIDTHS = {
  sidePanel: {
    mobile: '100vw',
    tablet: '320px',
    desktop: '320px'
  },
  toolPalette: {
    mobile: '100vw',
    tablet: '80px',
    desktop: '100px'
  },
  header: {
    mobile: '100%',
    tablet: '100%',
    desktop: '100%'
  }
} as const;

// スペーシング（8pxグリッドシステム）
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

// タッチターゲットサイズ（アクセシビリティ基準）
export const TOUCH_TARGET = {
  minimum: 44, // iOS Human Interface Guidelines
  recommended: 48 // Material Design
} as const;

// ヘッダー高さ
export const HEADER_HEIGHT = {
  mobile: 56,
  tablet: 60,
  desktop: 60
} as const;

// z-index管理
export const Z_INDEX = {
  mobileMenu: 1000,
  modal: 900,
  overlay: 800,
  sidePanel: 700,
  header: 600,
  toolPalette: 500,
  canvas: 1
} as const;

// アニメーション時間
export const TRANSITION = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s'
} as const;

// モバイルUIパターン
export const MOBILE_UI = {
  bottomSheetHeight: '60vh',
  tabBarHeight: 56,
  menuTransition: `transform ${TRANSITION.normal} ease-out`
} as const;