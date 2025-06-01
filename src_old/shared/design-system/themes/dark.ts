/**
 * ダークテーマ定義
 */

import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { borderRadius } from '../tokens/borderRadius';
import { duration, easing } from '../tokens/animation';
import { breakpoints } from '../tokens/breakpoints';
import type { Theme } from '../types';

export const darkTheme: Theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    neutral: colors.neutral,
    background: {
      primary: colors.background.primary,
      secondary: colors.background.secondary,
      tertiary: colors.background.elevated,
    },
    surface: {
      primary: colors.background.secondary,
      secondary: colors.background.elevated,
      elevated: colors.neutral[850],
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[300],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[900],
    },
    semantic: colors.semantic,
  },
  spacing,
  borderRadius,
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    'glow-sm': `0 0 10px ${colors.primary[500]}40`,
    'glow-md': `0 0 20px ${colors.primary[500]}60`,
    'glow-lg': `0 0 30px ${colors.primary[500]}80`,
  },
  typography,
  animation: {
    duration,
    easing,
  },
  breakpoints,
};