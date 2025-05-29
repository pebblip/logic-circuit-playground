/**
 * ブレークポイントトークン定義
 * モバイルファーストアプローチ
 */

export const breakpoints = {
  // 基本ブレークポイント
  xs: '0px',       // Extra small devices (phones)
  sm: '640px',     // Small devices (large phones)
  md: '768px',     // Medium devices (tablets)
  lg: '1024px',    // Large devices (desktops)
  xl: '1280px',    // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
} as const;

// デバイスタイプ
export const devices = {
  mobile: `(max-width: ${breakpoints.sm})`,
  tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  largeDesktop: `(min-width: ${breakpoints.xl})`,
} as const;

// コンテナ幅
export const containerWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// メディアクエリヘルパー
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // 特殊なメディアクエリ
  hover: '@media (hover: hover)',
  touch: '@media (hover: none)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
} as const;

// レスポンシブユーティリティ
export const responsive = {
  // 表示/非表示
  hide: {
    mobile: `${media.md} { display: none; }`,
    tablet: `${media.xs} { display: none; } ${media.lg} { display: none; }`,
    desktop: `${media.xs} { display: none; } ${media.sm} { display: none; } ${media.md} { display: none; }`,
  },
  
  show: {
    mobile: `display: none; ${media.xs} { display: block; } ${media.md} { display: none; }`,
    tablet: `display: none; ${media.md} { display: block; } ${media.lg} { display: none; }`,
    desktop: `display: none; ${media.lg} { display: block; }`,
  },
} as const;

// 型定義
export type BreakpointToken = typeof breakpoints;
export type BreakpointKey = keyof BreakpointToken;
export type DeviceType = keyof typeof devices;