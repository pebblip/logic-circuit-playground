import React from 'react';

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDrawing?: boolean;
  isSelected?: boolean;
  value?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

/**
 * 高品質ベジエ曲線ワイヤーコンポーネント
 * - 美しい曲線描画
 * - 信号値による視覚表現
 * - インタラクティブ機能
 */
const WireComponent: React.FC<WireProps> = ({ 
  x1, 
  y1, 
  x2, 
  y2, 
  isDrawing = false,
  isSelected = false,
  value = false,
  onHover,
  onLeave,
  onClick
}) => {
  
  // ベジエ曲線の制御点を計算
  const calculateBezierPath = (): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 制御点の距離を動的に調整
    const controlDistance = Math.min(Math.max(Math.abs(dx) * 0.5, 50), 150);
    
    // 水平方向の制御点（より自然な曲線）
    const cp1x = x1 + controlDistance;
    const cp1y = y1;
    const cp2x = x2 - controlDistance;
    const cp2y = y2;
    
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  };

  // ワイヤーの色を決定
  const getWireColor = (): string => {
    if (isDrawing) return '#10b981'; // 描画中は緑
    if (isSelected) return '#fbbf24'; // 選択時は黄色
    return value ? '#00ff88' : '#6b7280'; // 信号値により色変更
  };

  // ワイヤーの太さを決定
  const getStrokeWidth = (): number => {
    if (isSelected) return 4;
    if (value) return 3;
    return 2;
  };

  // アニメーション効果
  const getAnimationProps = () => {
    if (isDrawing) {
      return {
        strokeDasharray: '8,4',
        className: 'animate-pulse'
      };
    }
    if (value) {
      return {
        className: 'animate-pulse',
        style: { animationDuration: '2s' }
      };
    }
    return {};
  };

  const path = calculateBezierPath();
  const animationProps = getAnimationProps();

  return (
    <g 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* 太い透明な当たり判定線 */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="cursor-pointer"
      />
      
      {/* グロー効果（信号値がtrueの時） */}
      {value && !isDrawing && (
        <path
          d={path}
          stroke={getWireColor()}
          strokeWidth={getStrokeWidth() + 2}
          fill="none"
          opacity={0.3}
          filter="blur(2px)"
          {...animationProps}
        />
      )}
      
      {/* メインのワイヤー線 */}
      <path
        d={path}
        stroke={getWireColor()}
        strokeWidth={getStrokeWidth()}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isDrawing ? 0.7 : 1}
        {...animationProps}
      />
      
      {/* 選択状態のハイライト */}
      {isSelected && (
        <path
          d={path}
          stroke="#fbbf24"
          strokeWidth={getStrokeWidth() + 2}
          fill="none"
          strokeDasharray="6,6"
          opacity={0.6}
          className="animate-pulse"
        />
      )}
      
      {/* 信号フロー方向の矢印（オプション） */}
      {value && !isDrawing && (
        <g>
          <defs>
            <marker
              id={`arrowhead-${Math.random().toString(36).substr(2, 9)}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={getWireColor()}
                opacity={0.8}
              />
            </marker>
          </defs>
          {/* 矢印は中間点に配置 */}
          <circle
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
            r="2"
            fill={getWireColor()}
            className="animate-pulse"
          />
        </g>
      )}
      
      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && isSelected && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 10}
          className="fill-yellow-400 text-xs font-mono"
          textAnchor="middle"
        >
          {value ? 'HIGH' : 'LOW'}
        </text>
      )}
    </g>
  );
};

// パフォーマンス最適化のためのメモ化
export const Wire = React.memo(WireComponent, (prevProps, nextProps) => {
  // 位置や状態が変更された場合のみ再レンダリング
  return (
    prevProps.x1 === nextProps.x1 &&
    prevProps.y1 === nextProps.y1 &&
    prevProps.x2 === nextProps.x2 &&
    prevProps.y2 === nextProps.y2 &&
    prevProps.isDrawing === nextProps.isDrawing &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.value === nextProps.value
  );
});