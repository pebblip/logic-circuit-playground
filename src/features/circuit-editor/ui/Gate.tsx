import React, { useState, useCallback, useEffect } from 'react';
import { BaseGate } from '../../../entities/gates/BaseGate';
import { CollisionDetector } from '../../../domain/services/CollisionDetector';
import { Position } from '../../../domain/services/GatePlacement';
import { useCircuitStore } from '../../../domain/stores/circuitStore';

interface GateProps {
  gate: BaseGate;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onToggleInput?: () => void;
  onPinClick: (pinIndex: number, pinType: 'input' | 'output') => void;
}

export const Gate: React.FC<GateProps> = ({ 
  gate, 
  isSelected, 
  onSelect, 
  onPositionChange, 
  onToggleInput, 
  onPinClick 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragContext, setDragContext] = useState<{
    initialCanvas: Position;
    initialSvg: Position;
    dragHelper?: ReturnType<CollisionDetector['createDragHelper']>;
  } | null>(null);
  const collisionDetector = CollisionDetector.getInstance();
  
  // ストアから接続関連の状態を取得
  const { 
    drawingConnection, 
    hoveredPinId,
    isValidConnectionTarget,
    getConnectablePins,
    setHoveredPin
  } = useCircuitStore();

  // ゲートのサイズ定数
  const GATE_WIDTH = 70;
  const GATE_HEIGHT = 50;

  // 統一された座標変換を使用したドラッグ処理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const svg = e.currentTarget.closest('svg') as SVGSVGElement;
    if (!svg) return;

    // CollisionDetectorの統一された座標変換を使用
    const svgPoint = collisionDetector.canvasToSvgCoordinates(
      { x: e.clientX, y: e.clientY },
      svg
    );

    // ピンクリック判定
    const clickedPin = collisionDetector.findPinAtPosition(svgPoint, [gate]);
    if (clickedPin) {
      onPinClick(clickedPin.pinIndex, clickedPin.pinType);
      return;
    }

    // ゲート本体のドラッグ開始
    onSelect();
    setIsDragging(true);
    
    setDragContext({
      initialCanvas: { x: e.clientX, y: e.clientY },
      initialSvg: { x: gate.position.x, y: gate.position.y }
    });
  }, [gate, onSelect, onPinClick, collisionDetector]);

  // シンプルなドラッグ処理
  useEffect(() => {
    if (!isDragging || !dragContext) return;

    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg') as SVGSVGElement;
      if (!svg) return;

      // 現在のマウス位置を取得
      const rect = svg.getBoundingClientRect();
      
      // SVG座標変換
      const viewBox = svg.viewBox.baseVal;
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;
      
      // 移動量を計算
      const deltaCanvasX = e.clientX - dragContext.initialCanvas.x;
      const deltaCanvasY = e.clientY - dragContext.initialCanvas.y;
      
      // SVG座標での移動量
      const deltaSvgX = deltaCanvasX * scaleX;
      const deltaSvgY = deltaCanvasY * scaleY;
      
      // 新しい位置
      const newPosition = {
        x: dragContext.initialSvg.x + deltaSvgX,
        y: dragContext.initialSvg.y + deltaSvgY
      };

      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragContext(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragContext, onPositionChange]);

  // ダブルクリックでINPUTゲートをトグル
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (gate.type === 'INPUT' && onToggleInput) {
      onToggleInput();
    }
  }, [gate.type, onToggleInput]);

  // ピンレンダリング（モックアップ準拠）
  const renderPin = (pinIndex: number, pinType: 'input' | 'output', pinValue: boolean) => {
    const position = pinType === 'input' 
      ? collisionDetector.calculateInputPinPosition(gate, pinIndex)
      : collisionDetector.calculateOutputPinPosition(gate, pinIndex);

    const localX = position.x - gate.position.x;
    const localY = position.y - gate.position.y;
    
    // ピンの状態を判定
    const pinId = `${gate.id}-${pinType}-${pinIndex}`;
    const isHovered = hoveredPinId === pinId;
    const connectablePins = drawingConnection ? getConnectablePins(gate.id) : [];
    const isHighlighted = connectablePins.includes(pinIndex) && pinType === 'input';

    const handlePinMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      onPinClick(pinIndex, pinType);
    };

    return (
      <g key={`${pinType}-${pinIndex}`} className="pin-group">
        {/* ピンライン（モックアップ通り） */}
        <line
          x1={localX > 0 ? GATE_WIDTH / 2 - 10 : -GATE_WIDTH / 2 + 10}
          y1={localY}
          x2={localX}
          y2={localY}
          stroke={pinValue ? "#00ff88" : "#666"}
          strokeWidth="2"
          className={`pin-line ${pinValue ? 'active' : ''}`}
          pointerEvents="none"
        />
        
        {/* メインのピン円（モックアップ準拠） */}
        <circle
          cx={localX}
          cy={localY}
          r="6"
          fill={pinValue ? "#00ff88" : "none"}
          stroke={
            isHighlighted ? "#00ff88" :
            pinValue ? "#00ff88" : "#666"
          }
          strokeWidth="2"
          className={`pin ${pinValue ? 'active' : ''} ${isHighlighted ? 'connected' : ''}`}
          style={{
            transition: 'all 0.2s ease',
            filter: pinValue ? 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))' : 'none'
          }}
          pointerEvents="none"
        />
        
        {/* デバッグ用：ヒットエリアの可視化 */}
        {process.env.NODE_ENV === 'development' && (
          <circle
            cx={localX}
            cy={localY}
            r="20"
            fill="none"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.5"
            className="debug-hit-area"
            pointerEvents="none"
          />
        )}
        
        {/* クリック可能なヒットエリア（最前面） */}
        <circle
          cx={localX}
          cy={localY}
          r="20"
          fill="transparent"
          className="pin-hit-area cursor-pointer"
          onMouseDown={handlePinMouseDown}
          onMouseEnter={() => setHoveredPin(pinId)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{ pointerEvents: 'all' }}
        />
      </g>
    );
  };

  // ゲート形状のレンダリング
  const renderGateShape = () => {
    const baseClass = `cursor-pointer transition-all duration-200 ${
      isSelected ? 'stroke-yellow-400 stroke-4' : 'stroke-gray-600 stroke-2'
    }`;

    switch (gate.type) {
      case 'INPUT':
        const inputValue = (gate as any)._outputs?.[0]?.value ?? false;
        return (
          <g>
            <rect
              x={-GATE_WIDTH / 2}
              y={-GATE_HEIGHT / 2}
              width={GATE_WIDTH}
              height={GATE_HEIGHT}
              rx="15"
              fill="#1a1a1a"
              className={baseClass}
            />
            <circle
              cx="5"
              cy="0"
              r="10"
              fill={inputValue ? "#00ff88" : "#444"}
              className="transition-colors duration-200"
            />
            <text
              x="-20"
              y="4"
              className="fill-white text-sm font-mono"
              textAnchor="middle"
            >
              {inputValue ? '1' : '0'}
            </text>
          </g>
        );

      case 'OUTPUT':
        const outputValue = (gate as any)._inputs?.[0]?.value ?? false;
        return (
          <g>
            <circle
              cx="0"
              cy="0"
              r="25"
              fill="#1a1a1a"
              className={baseClass}
            />
            <text
              x="0"
              y="4"
              className={`text-2xl ${outputValue ? 'fill-yellow-400' : 'fill-gray-600'}`}
              textAnchor="middle"
            >
              💡
            </text>
          </g>
        );

      default:
        // 基本ゲート
        return (
          <g>
            <rect
              x={-GATE_WIDTH / 2}
              y={-GATE_HEIGHT / 2}
              width={GATE_WIDTH}
              height={GATE_HEIGHT}
              rx="8"
              fill="#1a1a1a"
              className={baseClass}
            />
            <text
              x="0"
              y="4"
              className="fill-white text-sm font-bold"
              textAnchor="middle"
            >
              {gate.type}
            </text>
          </g>
        );
    }
  };


  return (
    <g
      transform={`translate(${gate.position.x}, ${gate.position.y})`}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      {/* 選択状態のハイライト（最背面） */}
      {isSelected && (
        <rect
          x={-GATE_WIDTH / 2 - 5}
          y={-GATE_HEIGHT / 2 - 5}
          width={GATE_WIDTH + 10}
          height={GATE_HEIGHT + 10}
          rx="12"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      )}

      {/* ゲート本体 */}
      <g onMouseDown={handleMouseDown} onDoubleClick={handleDoubleClick}>
        {renderGateShape()}
      </g>

      {/* 入力ピン（ゲート本体より前面） */}
      {(gate as any)._inputs && (gate as any)._inputs.length > 0 && 
        (console.log(`[Gate] Rendering ${(gate as any)._inputs.length} input pins for ${gate.id}`),
        (gate as any)._inputs.map((pin: any, index: number) => 
          renderPin(index, 'input', pin.value)
        ))
      }

      {/* 出力ピン（ゲート本体より前面） */}
      {(gate as any)._outputs && (gate as any)._outputs.length > 0 && 
        (console.log(`[Gate] Rendering ${(gate as any)._outputs.length} output pins for ${gate.id}`),
        (gate as any)._outputs.map((pin: any, index: number) => 
          renderPin(index, 'output', pin.value)
        ))
      }


    </g>
  );
};