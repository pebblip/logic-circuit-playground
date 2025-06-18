import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';
import '@testing-library/jest-dom';

// モックの設定
vi.mock('@/components/layouts/DesktopLayout', () => ({
  DesktopLayout: () => <div data-testid="desktop-layout">Desktop Layout</div>
}));

vi.mock('@/components/layouts/TabletLayout', () => ({
  TabletLayout: () => <div data-testid="tablet-layout">Tablet Layout</div>
}));

vi.mock('@/components/layouts/MobileLayout', () => ({
  MobileLayout: () => <div data-testid="mobile-layout">Mobile Layout</div>
}));

// window.matchMediaのモック
const createMatchMediaMock = (matches: boolean) => {
  return vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('ResponsiveLayout', () => {
  it('デスクトップサイズでDesktopLayoutを表示', () => {
    window.matchMedia = createMatchMediaMock(false);
    
    render(<ResponsiveLayout />);
    
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('tablet-layout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
  });

  it('タブレットサイズでTabletLayoutを表示', () => {
    window.matchMedia = vi.fn().mockImplementation(query => {
      if (query === '(max-width: 768px)') return { matches: true };
      if (query === '(max-width: 480px)') return { matches: false };
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
    
    render(<ResponsiveLayout />);
    
    expect(screen.getByTestId('tablet-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
  });

  it('モバイルサイズでMobileLayoutを表示', () => {
    window.matchMedia = vi.fn().mockImplementation(query => {
      if (query === '(max-width: 768px)') return { matches: true };
      if (query === '(max-width: 480px)') return { matches: true };
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
    
    render(<ResponsiveLayout />);
    
    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tablet-layout')).not.toBeInTheDocument();
  });

  it('画面サイズ変更時にレイアウトが切り替わる', () => {
    const listeners: { [key: string]: ((e: any) => void)[] } = {};
    
    window.matchMedia = vi.fn().mockImplementation(query => {
      const mediaQuery = {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, listener: (e: any) => void) => {
          if (!listeners[query]) listeners[query] = [];
          listeners[query].push(listener);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      
      return mediaQuery;
    });
    
    const { rerender } = render(<ResponsiveLayout />);
    
    // 初期状態：デスクトップ
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    
    // モバイルサイズに変更をシミュレート
    window.matchMedia = vi.fn().mockImplementation(query => {
      const matches = query === '(max-width: 768px)' || query === '(max-width: 480px)';
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
    
    // リスナーをトリガー
    Object.values(listeners).forEach(listenerArray => {
      listenerArray.forEach(listener => listener({ matches: true }));
    });
    
    rerender(<ResponsiveLayout />);
    
    // モバイルレイアウトに切り替わる
    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
  });

  it('SSR環境でもエラーにならない', () => {
    // window.matchMediaが存在しない場合
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    delete window.matchMedia;
    
    expect(() => render(<ResponsiveLayout />)).not.toThrow();
    
    // デフォルトでデスクトップレイアウトを表示
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    
    // 復元
    window.matchMedia = originalMatchMedia;
  });
});