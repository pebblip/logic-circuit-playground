/**
 * ワイヤーパス生成ユーティリティ
 * 異なる配線スタイルのパスを生成する
 */

import type { Position } from '@/types';

export type WireStyle = 'bezier' | 'manhattan' | 'manhattan-rounded';

interface PathGeneratorOptions {
  from: Position;
  to: Position;
  style: WireStyle;
  avoidPoints?: Position[]; // 将来的な拡張用：回避すべき点
}

/**
 * ベジェ曲線パスを生成
 */
function generateBezierPath(from: Position, to: Position): string {
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${(from.y + to.y) / 2} T ${to.x} ${to.y}`;
}

/**
 * マンハッタンルーティング（直交配線）パスを生成
 * 基本的なL字またはZ字の経路を生成
 */
function generateManhattanPath(from: Position, to: Position): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // 水平距離が垂直距離より大きい場合は、水平→垂直の順で配線
  if (Math.abs(dx) > Math.abs(dy) || dy === 0) {
    // Z字型配線（水平→垂直→水平）
    const midX = from.x + dx / 2;
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
  } else {
    // L字型配線（水平→垂直）
    return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;
  }
}

/**
 * 角を丸めたマンハッタンルーティングパスを生成
 */
function generateManhattanRoundedPath(from: Position, to: Position): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const radius = Math.min(10, Math.abs(dx) / 4, Math.abs(dy) / 4); // 角の丸み半径

  if (Math.abs(dx) < radius * 2 || Math.abs(dy) < radius * 2) {
    // 距離が短すぎる場合は通常のマンハッタンパスを使用
    return generateManhattanPath(from, to);
  }

  // 水平→垂直の順で配線（角を丸める）
  if (Math.abs(dx) > Math.abs(dy) || dy === 0) {
    const midX = from.x + dx / 2;
    const path = [];

    // 開始点
    path.push(`M ${from.x} ${from.y}`);

    // 最初の水平線（最初の角まで）
    path.push(`L ${midX - radius} ${from.y}`);

    // 最初の角（丸め）
    const firstCornerDir = dy > 0 ? 1 : -1;
    path.push(
      `Q ${midX} ${from.y} ${midX} ${from.y + firstCornerDir * radius}`
    );

    // 垂直線
    path.push(`L ${midX} ${to.y - firstCornerDir * radius}`);

    // 2番目の角（丸め）
    path.push(`Q ${midX} ${to.y} ${midX + radius} ${to.y}`);

    // 最後の水平線
    path.push(`L ${to.x} ${to.y}`);

    return path.join(' ');
  } else {
    // L字型配線（角を丸める）
    const path = [];

    // 開始点
    path.push(`M ${from.x} ${from.y}`);

    // 水平線（角まで）
    const horizontalDir = dx > 0 ? 1 : -1;
    path.push(`L ${to.x - horizontalDir * radius} ${from.y}`);

    // 角（丸め）
    const verticalDir = dy > 0 ? 1 : -1;
    path.push(`Q ${to.x} ${from.y} ${to.x} ${from.y + verticalDir * radius}`);

    // 垂直線
    path.push(`L ${to.x} ${to.y}`);

    return path.join(' ');
  }
}

/**
 * 指定されたスタイルでワイヤーパスを生成
 */
export function generateWirePath(options: PathGeneratorOptions): string {
  const { from, to, style } = options;

  switch (style) {
    case 'bezier':
      return generateBezierPath(from, to);

    case 'manhattan':
      return generateManhattanPath(from, to);

    case 'manhattan-rounded':
      return generateManhattanRoundedPath(from, to);

    default:
      // デフォルトはベジェ曲線
      return generateBezierPath(from, to);
  }
}

/**
 * 将来的な拡張: 障害物を回避するマンハッタンルーティング
 * TODO: A*アルゴリズムなどを使用した高度なルーティング
 */
export function generateAdvancedManhattanPath(
  from: Position,
  to: Position
): string {
  // 現時点では基本的なマンハッタンパスを返す
  // 将来的にはA*アルゴリズムなどで障害物回避を実装
  return generateManhattanPath(from, to);
}
