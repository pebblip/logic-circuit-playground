import { describe, it, expect, beforeEach } from 'vitest';
import { clientToSVGCoordinates, mouseEventToSVGCoordinates, touchToSVGCoordinates, reactEventToSVGCoordinates } from './svgCoordinates';

// SVG要素のモック
class MockSVGPoint {
  x: number = 0;
  y: number = 0;

  matrixTransform(matrix: any) {
    return {
      x: this.x * matrix.a + this.y * matrix.c + matrix.e,
      y: this.x * matrix.b + this.y * matrix.d + matrix.f
    };
  }
}

class MockSVGSVGElement {
  createSVGPoint() {
    return new MockSVGPoint();
  }

  getScreenCTM() {
    return {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: () => ({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
      })
    };
  }
}

describe('SVG座標変換ユーティリティ', () => {
  let mockSVG: MockSVGSVGElement;

  beforeEach(() => {
    mockSVG = new MockSVGSVGElement();
    
    // DOMクエリのモック
    document.querySelector = () => mockSVG as any;
  });

  describe('clientToSVGCoordinates', () => {
    it('基本的な座標変換が正しく動作する', () => {
      const result = clientToSVGCoordinates(100, 200, mockSVG as any);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('SVG要素がnullの場合はnullを返す', () => {
      const result = clientToSVGCoordinates(100, 200, null);
      
      expect(result).toBeNull();
    });

    it('SVG要素が指定されない場合、document.querySelectorを使用する', () => {
      const result = clientToSVGCoordinates(100, 200);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('getScreenCTMがnullの場合はnullを返す', () => {
      const mockSVGWithoutCTM = {
        createSVGPoint: () => ({ x: 0, y: 0 }),
        getScreenCTM: () => null
      };
      
      const result = clientToSVGCoordinates(100, 200, mockSVGWithoutCTM as any);
      
      expect(result).toBeNull();
    });

    it('例外が発生した場合はnullを返す', () => {
      const mockSVGWithError = {
        createSVGPoint: () => {
          throw new Error('Test error');
        },
        getScreenCTM: () => ({ inverse: () => ({}) })
      };
      
      const result = clientToSVGCoordinates(100, 200, mockSVGWithError as any);
      
      expect(result).toBeNull();
    });
  });

  describe('mouseEventToSVGCoordinates', () => {
    it('マウスイベントから正しく座標を取得する', () => {
      const mockEvent = {
        clientX: 150,
        clientY: 250
      } as MouseEvent;
      
      const result = mouseEventToSVGCoordinates(mockEvent, mockSVG as any);
      
      expect(result).toEqual({ x: 150, y: 250 });
    });
  });

  describe('touchToSVGCoordinates', () => {
    it('タッチイベントから正しく座標を取得する', () => {
      const mockTouch = {
        clientX: 180,
        clientY: 320
      } as Touch;
      
      const result = touchToSVGCoordinates(mockTouch, mockSVG as any);
      
      expect(result).toEqual({ x: 180, y: 320 });
    });

    it('React.Touchからも正しく座標を取得する', () => {
      const mockReactTouch = {
        clientX: 190,
        clientY: 330
      } as React.Touch;
      
      const result = touchToSVGCoordinates(mockReactTouch, mockSVG as any);
      
      expect(result).toEqual({ x: 190, y: 330 });
    });
  });

  describe('reactEventToSVGCoordinates', () => {
    it('Reactマウスイベントから正しく座標を取得する', () => {
      const mockReactMouseEvent = {
        clientX: 200,
        clientY: 400
      } as React.MouseEvent;
      
      const result = reactEventToSVGCoordinates(mockReactMouseEvent, mockSVG as any);
      
      expect(result).toEqual({ x: 200, y: 400 });
    });

    it('Reactタッチイベントから正しく座標を取得する', () => {
      const mockReactTouchEvent = {
        touches: [{
          clientX: 210,
          clientY: 410
        }]
      } as React.TouchEvent;
      
      const result = reactEventToSVGCoordinates(mockReactTouchEvent, mockSVG as any);
      
      expect(result).toEqual({ x: 210, y: 410 });
    });

    it('changedTouchesからも正しく座標を取得する', () => {
      const mockReactTouchEvent = {
        touches: [],
        changedTouches: [{
          clientX: 220,
          clientY: 420
        }]
      } as React.TouchEvent;
      
      const result = reactEventToSVGCoordinates(mockReactTouchEvent, mockSVG as any);
      
      expect(result).toEqual({ x: 220, y: 420 });
    });

    it('タッチが存在しない場合はnullを返す', () => {
      const mockReactTouchEvent = {
        touches: [],
        changedTouches: []
      } as React.TouchEvent;
      
      const result = reactEventToSVGCoordinates(mockReactTouchEvent, mockSVG as any);
      
      expect(result).toBeNull();
    });
  });
});