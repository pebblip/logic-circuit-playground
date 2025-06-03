import { Position } from '@/types/circuit';

/**
 * SVG座標変換ユーティリティ
 * 
 * クライアント座標（マウスやタッチ）をSVG内の座標系に変換
 * 複数箇所で重複していたロジックを統一し、保守性を向上
 */

/**
 * クライアント座標をSVG座標に変換
 * 
 * @param clientX - クライアントX座標（マウス/タッチイベントから取得）
 * @param clientY - クライアントY座標（マウス/タッチイベントから取得）
 * @param svgElement - 対象のSVG要素（省略時は.canvasセレクタで自動検出）
 * @returns SVG座標系でのPosition、または変換失敗時はnull
 * 
 * @example
 * ```typescript
 * // マウスイベントからSVG座標を取得
 * const svgPos = clientToSVGCoordinates(event.clientX, event.clientY);
 * if (svgPos) {
 *   console.log('SVG座標:', svgPos.x, svgPos.y);
 * }
 * 
 * // 特定のSVG要素を指定
 * const svgPos = clientToSVGCoordinates(clientX, clientY, svgRef.current);
 * ```
 */
export function clientToSVGCoordinates(
  clientX: number,
  clientY: number,
  svgElement?: SVGSVGElement | null
): Position | null {
  try {
    // SVG要素を取得（引数で指定されるか、自動検出）
    let svg: SVGSVGElement | null;
    if (svgElement !== undefined) {
      svg = svgElement;
    } else {
      svg = document.querySelector('.canvas') as SVGSVGElement;
    }
    
    if (!svg) {
      console.warn('⚠️ SVG要素が見つかりません');
      return null;
    }

    // SVGのスクリーン変換マトリックスを取得
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) {
      console.warn('⚠️ SVGのスクリーン変換マトリックスを取得できません');
      return null;
    }

    // SVGPointを作成し、クライアント座標を設定
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    // SVG座標系に変換
    const svgPoint = point.matrixTransform(screenCTM.inverse());

    return {
      x: svgPoint.x,
      y: svgPoint.y
    };
  } catch (error) {
    console.error('❌ SVG座標変換に失敗:', error);
    return null;
  }
}

/**
 * マウスイベントからSVG座標を取得（便利なヘルパー関数）
 * 
 * @param event - マウスイベント
 * @param svgElement - 対象のSVG要素（省略時は自動検出）
 * @returns SVG座標系でのPosition、または変換失敗時はnull
 */
export function mouseEventToSVGCoordinates(
  event: MouseEvent,
  svgElement?: SVGSVGElement | null
): Position | null {
  return clientToSVGCoordinates(event.clientX, event.clientY, svgElement);
}

/**
 * タッチイベントからSVG座標を取得（便利なヘルパー関数）
 * 
 * @param touch - タッチオブジェクト
 * @param svgElement - 対象のSVG要素（省略時は自動検出）
 * @returns SVG座標系でのPosition、または変換失敗時はnull
 */
export function touchToSVGCoordinates(
  touch: Touch | React.Touch,
  svgElement?: SVGSVGElement | null
): Position | null {
  return clientToSVGCoordinates(touch.clientX, touch.clientY, svgElement);
}

/**
 * ReactイベントからSVG座標を取得（TypeScript対応）
 * 
 * @param event - ReactマウスイベントまたはReactタッチイベント
 * @param svgElement - 対象のSVG要素（省略時は自動検出）
 * @returns SVG座標系でのPosition、または変換失敗時はnull
 */
export function reactEventToSVGCoordinates(
  event: React.MouseEvent | React.TouchEvent,
  svgElement?: SVGSVGElement | null
): Position | null {
  if ('touches' in event) {
    // タッチイベントの場合、最初のタッチを使用
    const touch = event.touches[0] || event.changedTouches[0];
    return touch ? touchToSVGCoordinates(touch, svgElement) : null;
  } else {
    // マウスイベントの場合
    return clientToSVGCoordinates(event.clientX, event.clientY, svgElement);
  }
}