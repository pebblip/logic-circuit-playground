/**
 * アニメーショントークン定義
 */

export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '1000ms',
} as const;

export const easing = {
  // 基本的なイージング
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // カスタムイージング（Material Design風）
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',      // 標準的な動き
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',      // 減速
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',      // 加速
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',         // シャープな動き
  
  // バウンス系
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// セマンティックアニメーション
export const animation = {
  // フェード
  fade: {
    in: {
      duration: duration.normal,
      easing: easing.easeOut,
    },
    out: {
      duration: duration.fast,
      easing: easing.easeIn,
    },
  },
  
  // スライド
  slide: {
    in: {
      duration: duration.normal,
      easing: easing.decelerate,
    },
    out: {
      duration: duration.fast,
      easing: easing.accelerate,
    },
  },
  
  // スケール
  scale: {
    in: {
      duration: duration.normal,
      easing: easing.elastic,
    },
    out: {
      duration: duration.fast,
      easing: easing.easeOut,
    },
  },
  
  // ホバー効果
  hover: {
    duration: duration.fast,
    easing: easing.standard,
  },
  
  // クリック効果
  press: {
    duration: duration.instant,
    easing: easing.easeOut,
  },
  
  // ページ遷移
  page: {
    duration: duration.slow,
    easing: easing.standard,
  },
} as const;

// キーフレーム定義
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from { 
        transform: translateY(20px);
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,
  
  glow: `
    @keyframes glow {
      0% { box-shadow: 0 0 5px currentColor; }
      50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      100% { box-shadow: 0 0 5px currentColor; }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
} as const;

// 型定義
export type DurationToken = typeof duration;
export type EasingToken = typeof easing;
export type AnimationVariant = keyof typeof animation;