/**
 * 自動フィット機能Hook
 *
 * 回路を画面に収まるように自動調整し、中央に配置
 */

import type React from 'react';
import { useEffect, useCallback } from 'react';
import type { Gate } from '@/types/circuit';
import { calculateCircuitBounds } from '@/features/learning-mode/utils/autoLayout';

interface UseAutoFitParams {
  gates: Gate[];
  svgRef: React.RefObject<SVGSVGElement>;
  enabled: boolean;
  padding?: number;
  onViewBoxChange?: (viewBox: ViewBox) => void;
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useAutoFit({
  gates,
  svgRef,
  enabled,
  padding = 100,
  onViewBoxChange,
}: UseAutoFitParams): {
  calculateOptimalViewBox: () => ViewBox;
  applyAutoFit: () => void;
} {
  /**
   * 最適なviewBoxを計算
   */
  const calculateOptimalViewBox = useCallback((): ViewBox => {
    if (gates.length === 0) {
      return { x: 0, y: 0, width: 1200, height: 800 };
    }

    const bounds = calculateCircuitBounds(gates);

    // パディングを含めた全体サイズ
    const totalWidth = bounds.width + padding * 2;
    const totalHeight = bounds.height + padding * 2;

    // 中央配置のためのオフセット計算
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // viewBoxの開始位置（回路を中央に配置）
    const viewX = centerX - totalWidth / 2;
    const viewY = centerY - totalHeight / 2;

    return {
      x: viewX,
      y: viewY,
      width: totalWidth,
      height: totalHeight,
    };
  }, [gates, padding]);

  /**
   * 自動フィットを適用
   */
  const applyAutoFit = useCallback((): void => {
    if (!enabled || !svgRef.current) return;

    const svg = svgRef.current;
    const containerRect = svg.getBoundingClientRect();
    const viewBox = calculateOptimalViewBox();

    // アスペクト比を維持しながらコンテナに収める
    const containerAspect = containerRect.width / containerRect.height;
    const viewBoxAspect = viewBox.width / viewBox.height;

    let finalViewBox = { ...viewBox };

    if (containerAspect > viewBoxAspect) {
      // コンテナが横長の場合、高さに合わせて幅を調整
      const newWidth = viewBox.height * containerAspect;
      const widthDiff = newWidth - viewBox.width;
      finalViewBox.x -= widthDiff / 2;
      finalViewBox.width = newWidth;
    } else {
      // コンテナが縦長の場合、幅に合わせて高さを調整
      const newHeight = viewBox.width / containerAspect;
      const heightDiff = newHeight - viewBox.height;
      finalViewBox.y -= heightDiff / 2;
      finalViewBox.height = newHeight;
    }

    // viewBox属性を設定
    svg.setAttribute(
      'viewBox',
      `${finalViewBox.x} ${finalViewBox.y} ${finalViewBox.width} ${finalViewBox.height}`
    );

    // viewBox変更を通知
    onViewBoxChange?.(finalViewBox);
  }, [enabled, svgRef, calculateOptimalViewBox, onViewBoxChange]);

  // 自動フィットの自動適用
  useEffect(() => {
    if (enabled && gates.length > 0) {
      // 少し遅延を入れて、レンダリング完了後に実行
      const timer = setTimeout(() => {
        applyAutoFit();
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [enabled, gates, applyAutoFit]);

  return {
    calculateOptimalViewBox,
    applyAutoFit,
  };
}
