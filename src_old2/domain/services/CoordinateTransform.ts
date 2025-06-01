import { Position } from './GatePlacement';

/**
 * 超高精度座標変換サービス
 * SVGネイティブAPIを活用した信頼性の高い座標変換
 */
export class CoordinateTransform {
  private static instance: CoordinateTransform;
  private transformCache = new Map<string, { matrix: DOMMatrix; timestamp: number }>();
  private readonly CACHE_LIFETIME = 16; // 16ms (60fps)

  private constructor() {}

  static getInstance(): CoordinateTransform {
    if (!CoordinateTransform.instance) {
      CoordinateTransform.instance = new CoordinateTransform();
    }
    return CoordinateTransform.instance;
  }

  /**
   * キャンバス座標をSVG座標に変換（src_oldのシンプル実装）
   */
  canvasToSvg(canvasPoint: Position, svgElement: SVGSVGElement): Position {
    const rect = svgElement.getBoundingClientRect();
    return {
      x: canvasPoint.x - rect.left,
      y: canvasPoint.y - rect.top
    };
  }

  /**
   * SVG座標をキャンバス座標に変換（高精度）
   */
  svgToCanvas(svgPoint: Position, svgElement: SVGSVGElement): Position {
    try {
      const point = svgElement.createSVGPoint();
      point.x = svgPoint.x;
      point.y = svgPoint.y;

      const matrix = this.getTransformMatrix(svgElement);
      if (!matrix) {
        return this.fallbackSvgToCanvas(svgPoint, svgElement);
      }

      const transformed = point.matrixTransform(matrix);
      
      return {
        x: Math.round(transformed.x * 1000) / 1000,
        y: Math.round(transformed.y * 1000) / 1000
      };
    } catch (error) {
      console.warn('SVG coordinate transformation failed, using fallback:', error);
      return this.fallbackSvgToCanvas(svgPoint, svgElement);
    }
  }

  /**
   * ドラッグに最適化された座標変換
   * ドラッグ開始時の基準点を保持し、相対移動量で計算
   */
  createDragTransform(svgElement: SVGSVGElement) {
    const matrix = this.getTransformMatrix(svgElement);
    
    return {
      /**
       * ドラッグ開始時の初期化
       */
      start: (canvasPoint: Position): {
        svgPoint: Position;
        dragContext: { initialCanvas: Position; initialSvg: Position }
      } => {
        const svgPoint = this.canvasToSvg(canvasPoint, svgElement);
        return {
          svgPoint,
          dragContext: {
            initialCanvas: { ...canvasPoint },
            initialSvg: { ...svgPoint }
          }
        };
      },

      /**
       * ドラッグ中の移動量計算
       */
      move: (
        currentCanvasPoint: Position, 
        dragContext: { initialCanvas: Position; initialSvg: Position }
      ): Position => {
        // キャンバス上での移動量を計算
        const canvasDelta = {
          x: currentCanvasPoint.x - dragContext.initialCanvas.x,
          y: currentCanvasPoint.y - dragContext.initialCanvas.y
        };

        // SVG空間での移動量に変換
        const svgDelta = this.transformDelta(canvasDelta, svgElement);

        // 初期SVG位置 + 移動量 = 新しいSVG位置
        return {
          x: dragContext.initialSvg.x + svgDelta.x,
          y: dragContext.initialSvg.y + svgDelta.y
        };
      }
    };
  }

  /**
   * 移動量（ベクトル）をSVG空間に変換
   */
  private transformDelta(canvasDelta: Position, svgElement: SVGSVGElement): Position {
    try {
      const matrix = this.getTransformMatrix(svgElement);
      if (!matrix) {
        // フォールバック
        const rect = svgElement.getBoundingClientRect();
        const viewBox = svgElement.viewBox.baseVal;
        return {
          x: (canvasDelta.x / rect.width) * viewBox.width,
          y: (canvasDelta.y / rect.height) * viewBox.height
        };
      }

      // 原点と移動後の点を変換して差分を取る
      const origin = svgElement.createSVGPoint();
      const moved = svgElement.createSVGPoint();
      moved.x = canvasDelta.x;
      moved.y = canvasDelta.y;

      const originTransformed = origin.matrixTransform(matrix.inverse());
      const movedTransformed = moved.matrixTransform(matrix.inverse());

      return {
        x: movedTransformed.x - originTransformed.x,
        y: movedTransformed.y - originTransformed.y
      };
    } catch (error) {
      console.warn('Delta transformation failed:', error);
      // 安全なフォールバック
      return { x: 0, y: 0 };
    }
  }

  /**
   * 変換マトリックスを取得（キャッシュ機能付き）
   */
  private getTransformMatrix(svgElement: SVGSVGElement): DOMMatrix | null {
    try {
      const elementId = this.getElementCacheKey(svgElement);
      const now = performance.now();
      
      // キャッシュチェック
      const cached = this.transformCache.get(elementId);
      if (cached && (now - cached.timestamp) < this.CACHE_LIFETIME) {
        return cached.matrix;
      }

      // 新しいマトリックスを取得
      const ctm = svgElement.getScreenCTM();
      if (!ctm) return null;

      const matrix = new DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]);
      
      // キャッシュに保存
      this.transformCache.set(elementId, { matrix, timestamp: now });
      
      return matrix;
    } catch (error) {
      console.warn('Failed to get transform matrix:', error);
      return null;
    }
  }

  /**
   * SVG要素のキャッシュキーを生成
   */
  private getElementCacheKey(svgElement: SVGSVGElement): string {
    const rect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    return `${rect.width}x${rect.height}_${viewBox.x}_${viewBox.y}_${viewBox.width}_${viewBox.height}`;
  }

  /**
   * フォールバック: 手動座標変換（キャンバス→SVG）
   */
  private fallbackCanvasToSvg(canvasPoint: Position, svgElement: SVGSVGElement): Position {
    const rect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    
    // より正確な計算
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    return {
      x: (canvasPoint.x - rect.left) * scaleX + viewBox.x,
      y: (canvasPoint.y - rect.top) * scaleY + viewBox.y
    };
  }

  /**
   * フォールバック: 手動座標変換（SVG→キャンバス）
   */
  private fallbackSvgToCanvas(svgPoint: Position, svgElement: SVGSVGElement): Position {
    const rect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;
    
    return {
      x: (svgPoint.x - viewBox.x) * scaleX + rect.left,
      y: (svgPoint.y - viewBox.y) * scaleY + rect.top
    };
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.transformCache.clear();
  }

  /**
   * 座標変換の精度テスト
   */
  testAccuracy(svgElement: SVGSVGElement): {
    averageError: number;
    maxError: number;
    testPoints: number;
  } {
    const testPoints = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 500, y: 300 },
      { x: 1000, y: 600 }
    ];

    const errors: number[] = [];

    testPoints.forEach(original => {
      // SVG → Canvas → SVG の変換テスト
      const canvas = this.svgToCanvas(original, svgElement);
      const backToSvg = this.canvasToSvg(canvas, svgElement);
      
      const error = Math.sqrt(
        Math.pow(original.x - backToSvg.x, 2) + 
        Math.pow(original.y - backToSvg.y, 2)
      );
      errors.push(error);
    });

    return {
      averageError: errors.reduce((sum, err) => sum + err, 0) / errors.length,
      maxError: Math.max(...errors),
      testPoints: testPoints.length
    };
  }
}