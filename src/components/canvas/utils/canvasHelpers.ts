/**
 * Canvas関連のユーティリティ関数
 * Canvas.tsxから抽出・整理
 */

import type React from 'react';
import type { Gate } from '@/types/circuit';
import type { ViewBox } from './canvasConstants';
// svgCoordinates.tsから直接使用してください

/**
 * DOM要素がゲート要素かどうかを判定
 */
export const isGateElement = (
  element: Element | null,
  svgRef: React.RefObject<SVGSVGElement>
): boolean => {
  if (!element) return false;

  let current = element;
  while (current && current !== svgRef.current) {
    // ゲートコンテナクラスのチェック
    if (current.classList?.contains('gate-container')) return true;
    // data-gate-id属性のチェック
    if (current.hasAttribute?.('data-gate-id')) return true;
    // クラス名にgate-containerが含まれるかチェック（古いブラウザ対応）
    if (current.getAttribute?.('class')?.includes('gate-container'))
      return true;

    current = current.parentElement as Element;
  }
  return false;
};

/**
 * ゲートIDをDOM要素から取得
 */
export const getGateIdFromElement = (
  element: Element | null
): string | null => {
  if (!element) return null;

  let current = element;
  while (current) {
    const gateId = current.getAttribute('data-gate-id');
    if (gateId) return gateId;
    current = current.parentElement as Element;
  }
  return null;
};

/**
 * ゲート群の境界ボックスを計算
 */
export const calculateGatesBounds = (
  gates: Gate[]
): { minX: number; maxX: number; minY: number; maxY: number } => {
  if (gates.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  return gates.reduce(
    (acc, gate) => {
      // ゲートのサイズ（GATE_SIZESから取得すべきだが、ここでは簡易的に）
      const gateWidth = 70;
      const gateHeight = 50;
      const pinExtension = 10;

      return {
        minX: Math.min(
          acc.minX,
          gate.position.x - gateWidth / 2 - pinExtension
        ),
        maxX: Math.max(
          acc.maxX,
          gate.position.x + gateWidth / 2 + pinExtension
        ),
        minY: Math.min(acc.minY, gate.position.y - gateHeight / 2),
        maxY: Math.max(acc.maxY, gate.position.y + gateHeight / 2),
      };
    },
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    }
  );
};

/**
 * ViewBoxが有効な範囲内かチェック
 */
export const isValidViewBox = (viewBox: ViewBox): boolean => {
  return (
    isFinite(viewBox.x) &&
    isFinite(viewBox.y) &&
    isFinite(viewBox.width) &&
    isFinite(viewBox.height) &&
    viewBox.width > 0 &&
    viewBox.height > 0
  );
};

// deprecated関数を削除しました
// 座標変換には @/infrastructure/ui/svgCoordinates の clientToSVGCoordinates を直接使用してください

/**
 * ゲートが選択矩形内にあるかチェック
 */
export const isGateInSelectionRect = (
  gate: Gate,
  rect: { startX: number; startY: number; endX: number; endY: number }
): boolean => {
  const minX = Math.min(rect.startX, rect.endX);
  const maxX = Math.max(rect.startX, rect.endX);
  const minY = Math.min(rect.startY, rect.endY);
  const maxY = Math.max(rect.startY, rect.endY);

  return (
    gate.position.x >= minX &&
    gate.position.x <= maxX &&
    gate.position.y >= minY &&
    gate.position.y <= maxY
  );
};

/**
 * CLOCKゲートの最高周波数を取得
 */
export const getMaxClockFrequency = (gates: Gate[]): number => {
  const runningClockGates = gates.filter(
    gate => gate.type === 'CLOCK' && gate.metadata?.isRunning
  );

  if (runningClockGates.length === 0) return 1;

  return Math.max(
    ...runningClockGates.map(gate => gate.metadata?.frequency || 1)
  );
};

/**
 * 動的更新間隔を計算（サンプリング定理に基づく）
 */
export const calculateUpdateInterval = (
  maxFrequency: number,
  samplingMultiplier: number = 4,
  maxInterval: number = 100
): number => {
  const requiredUpdateHz = Math.max(maxFrequency * samplingMultiplier, 10);
  return Math.min(1000 / requiredUpdateHz, maxInterval);
};
