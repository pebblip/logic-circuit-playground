import { renderHook, act } from '@testing-library/react';
import { useResponsive, BREAKPOINTS, getMediaQuery, getResponsiveValue } from '../useResponsive';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useResponsive', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // ウィンドウサイズを元に戻す
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
  });

  const setWindowSize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('モバイルサイズを正しく判定する', () => {
    setWindowSize(375, 667);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.deviceType).toBe('mobile');
  });

  it('タブレットサイズを正しく判定する', () => {
    setWindowSize(768, 1024);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.deviceType).toBe('tablet');
  });

  it('デスクトップサイズを正しく判定する', () => {
    setWindowSize(1920, 1080);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.deviceType).toBe('desktop');
  });

  it('横向きを正しく判定する', () => {
    setWindowSize(667, 375);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLandscape).toBe(true);
  });

  it('縦向きを正しく判定する', () => {
    setWindowSize(375, 667);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isLandscape).toBe(false);
  });

  it('ウィンドウリサイズに反応する', async () => {
    setWindowSize(1920, 1080);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);

    // モバイルサイズに変更
    act(() => {
      setWindowSize(375, 667);
    });

    // デバウンス待機
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('ウィンドウサイズを正しく返す', () => {
    setWindowSize(1024, 768);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.windowWidth).toBe(1024);
    expect(result.current.windowHeight).toBe(768);
  });
});

describe('ヘルパー関数', () => {
  it('getMediaQuery が正しいメディアクエリを返す', () => {
    expect(getMediaQuery('mobile')).toBe('@media (min-width: 768px)');
    expect(getMediaQuery('tablet')).toBe('@media (min-width: 1024px)');
    expect(getMediaQuery('desktop')).toBe('@media (min-width: 1280px)');
  });

  it('getResponsiveValue が正しい値を返す', () => {
    const values = {
      mobile: '100%',
      tablet: '50%',
      desktop: '33%'
    };

    expect(getResponsiveValue(values, 'mobile')).toBe('100%');
    expect(getResponsiveValue(values, 'tablet')).toBe('50%');
    expect(getResponsiveValue(values, 'desktop')).toBe('33%');
  });

  it('getResponsiveValue で未定義の値はフォールバックする', () => {
    const values = {
      desktop: '33%'
    };

    expect(getResponsiveValue(values, 'mobile')).toBe('33%');
    expect(getResponsiveValue(values, 'tablet')).toBe('33%');
  });
});