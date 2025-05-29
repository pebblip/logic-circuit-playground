/**
 * デザイントークンのエントリーポイント
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './animation';
export * from './breakpoints';

// 統合トークンオブジェクト
import { colors } from './colors';
import { spacing, semanticSpacing } from './spacing';
import { fontSize, fontWeight, lineHeight, letterSpacing, fontFamily, typography } from './typography';
import { duration, easing, animation, keyframes } from './animation';
import { breakpoints, devices, containerWidth, media, responsive } from './breakpoints';

export const tokens = {
  colors,
  spacing,
  semanticSpacing,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFamily,
  typography,
  duration,
  easing,
  animation,
  keyframes,
  breakpoints,
  devices,
  containerWidth,
  media,
  responsive,
} as const;

// 便利な型定義
export type DesignTokens = typeof tokens;
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;