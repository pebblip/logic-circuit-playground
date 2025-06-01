/**
 * スペーシングトークン定義
 * 8pxベースのスペーシングシステム
 */

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
} as const;

// セマンティックスペーシング
export const semanticSpacing = {
  // コンポーネント内部
  component: {
    xs: spacing[1],   // 4px - アイコンとテキストの間など
    sm: spacing[2],   // 8px - 小さな余白
    md: spacing[4],   // 16px - 標準的な余白
    lg: spacing[6],   // 24px - 大きな余白
    xl: spacing[8],   // 32px - 特大の余白
  },
  
  // レイアウト
  layout: {
    xs: spacing[2],   // 8px
    sm: spacing[4],   // 16px
    md: spacing[6],   // 24px
    lg: spacing[8],   // 32px
    xl: spacing[12],  // 48px
    xxl: spacing[16], // 64px
  },
  
  // セクション間
  section: {
    sm: spacing[8],   // 32px
    md: spacing[12],  // 48px
    lg: spacing[16],  // 64px
    xl: spacing[20],  // 80px
  },
} as const;

// 型定義
export type SpacingToken = typeof spacing;
export type SpacingValue = SpacingToken[keyof SpacingToken];
export type SemanticSpacingCategory = keyof typeof semanticSpacing;