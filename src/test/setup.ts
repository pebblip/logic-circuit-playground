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

// IndexedDBモック実装
const createMockObjectStore = () => ({
  add: vi.fn(),
  clear: vi.fn(),
  count: vi.fn(),
  createIndex: vi.fn(),
  delete: vi.fn(),
  deleteIndex: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  getAllKeys: vi.fn(),
  getKey: vi.fn(),
  index: vi.fn(),
  openCursor: vi.fn(),
  openKeyCursor: vi.fn(),
  put: vi.fn(),
});

const createMockTransaction = () => ({
  abort: vi.fn(),
  objectStore: vi.fn(() => createMockObjectStore()),
  db: null,
  error: null,
  mode: 'readwrite',
  objectStoreNames: [],
  onabort: null,
  oncomplete: null,
  onerror: null,
});

const createMockDatabase = () => ({
  close: vi.fn(),
  createObjectStore: vi.fn(() => createMockObjectStore()),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn(() => createMockTransaction()),
  name: 'TestDB',
  version: 1,
  objectStoreNames: {
    contains: vi.fn(() => false),
    length: 0,
    item: vi.fn(),
  },
  onabort: null,
  onclose: null,
  onerror: null,
  onversionchange: null,
});

const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: createMockDatabase(),
      error: null,
      readyState: 'done',
      source: null,
      transaction: null,
      onsuccess: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onupgradeneeded: null as ((event: Event) => void) | null,
      onblocked: null as ((event: Event) => void) | null,
    };

    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded({ target: request } as unknown as Event);
      }
      if (request.onsuccess) {
        request.onsuccess({ target: request } as unknown as Event);
      }
    }, 0);

    return request;
  }),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onblocked: null,
  })),
  cmp: vi.fn((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }),
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
  configurable: true,
});
