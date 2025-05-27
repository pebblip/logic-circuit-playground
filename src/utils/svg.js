// SVG関連のユーティリティ関数

/**
 * SVG要素内のマウス座標を取得
 * @param {MouseEvent} event - マウスイベント
 * @param {SVGElement} svgElement - SVG要素
 * @returns {Object} SVG座標系での座標 {x, y}
 */
export const getSVGPoint = (event, svgElement) => {
  if (!svgElement) return { x: 0, y: 0 };
  
  // テスト環境やcreateSVGPointが使えない環境での代替実装
  if (typeof svgElement.createSVGPoint !== 'function') {
    const rect = svgElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  const pt = svgElement.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  
  const screenCTM = svgElement.getScreenCTM();
  if (!screenCTM) return { x: 0, y: 0 };
  
  return pt.matrixTransform(screenCTM.inverse());
};