import { useState, useEffect } from 'react';

// ブレークポイント定義
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;

// デバイスタイプ
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// レスポンシブ情報
export interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  windowWidth: number;
  windowHeight: number;
  isLandscape: boolean;
}

/**
 * レスポンシブデザイン用カスタムフック
 * 現在のデバイスタイプと画面サイズ情報を提供
 */
export const useResponsive = (): ResponsiveInfo => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // 初期値設定
    handleResize();

    // リサイズイベントリスナー
    window.addEventListener('resize', handleResize);

    // デバウンス処理（パフォーマンス向上）
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // デバイスタイプの判定
  const isMobile = windowSize.width < BREAKPOINTS.mobile;
  const isTablet = windowSize.width >= BREAKPOINTS.mobile && windowSize.width < BREAKPOINTS.tablet;
  const isDesktop = windowSize.width >= BREAKPOINTS.tablet;

  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  // 横向き判定
  const isLandscape = windowSize.width > windowSize.height;

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
    isLandscape
  };
};

// メディアクエリ用のヘルパー関数
export const getMediaQuery = (breakpoint: keyof typeof BREAKPOINTS): string => {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`;
};

// レスポンシブな値を返すヘルパー関数
export const getResponsiveValue = <T>(
  values: { mobile?: T; tablet?: T; desktop?: T },
  deviceType: DeviceType
): T | undefined => {
  return values[deviceType] || values.desktop || values.tablet || values.mobile;
};