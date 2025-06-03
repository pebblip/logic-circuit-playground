// Vitest Setup File
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Zustand のモック設定（必要に応じて）

// グローバルなモック設定
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// SVG要素のモック（CanvasのSVG操作用）
class MockSVGElement {
  createSVGPoint() {
    return {
      x: 0,
      y: 0,
      matrixTransform: () => ({ x: 0, y: 0 }),
    };
  }

  getScreenCTM() {
    return {
      inverse: () => ({}),
    };
  }
}

Object.defineProperty(window, 'SVGSVGElement', {
  writable: true,
  value: MockSVGElement,
});

// 必要に応じて他のブラウザAPIのモックを追加
