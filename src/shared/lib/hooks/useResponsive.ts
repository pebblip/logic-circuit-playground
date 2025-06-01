import { useState, useEffect } from 'react';

// ブレークポイント定義（モックアップに基づく）
export const breakpoints = {
  mobile: 768,  // モバイル/タブレット境界
  tablet: 1024, // タブレット/デスクトップ境界
  desktop: 1280 // デスクトップ/大画面境界
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * レスポンシブ対応のためのカスタムフック
 * デバイスタイプと画面サイズを提供
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(getResponsiveState());

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    // デバウンス処理
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    
    // 初回実行
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
};

/**
 * 現在の画面サイズからレスポンシブ状態を計算
 */
function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  let deviceType: DeviceType;
  
  if (width < breakpoints.mobile) {
    deviceType = 'mobile';
  } else if (width < breakpoints.tablet) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    width,
    height
  };
}

/**
 * メディアクエリヘルパー
 */
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet}px)`,
  notMobile: `@media (min-width: ${breakpoints.mobile}px)`
} as const;