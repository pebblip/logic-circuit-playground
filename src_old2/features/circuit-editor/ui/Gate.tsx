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

    // SVG座標系への変換
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX + viewBox.x;
    const svgY = (e.clientY - rect.top) * scaleY + viewBox.y;
    
    // ピンクリック判定
    const clickedPin = collisionDetector.findPinAtPosition({ x: svgX, y: svgY }, [gate]);
    
    if (clickedPin) {
      onPinClick(clickedPin.pinIndex, clickedPin.pinType);
      return;
    }

    onSelect();
    setIsDragging(true);
    
    const context = {
      initialCanvas: { x: e.clientX, y: e.clientY },
      initialSvg: { x: gate.position.x, y: gate.position.y }
    };
    
    setDragContext(context);
  }, [gate, onSelect, onPinClick, collisionDetector]);

  // シンプルなドラッグ処理
  useEffect(() => {
    if (!isDragging || !dragContext) return;

    const handleMouseMove = (e: MouseEvent) => {
      const svg = document.querySelector('svg') as SVGSVGElement;
      if (!svg) return;

      // src_oldのシンプルな実装を使用
      const rect = svg.getBoundingClientRect();
      const offsetX = e.clientX - dragContext.initialCanvas.x;
      const offsetY = e.clientY - dragContext.initialCanvas.y;
      
      // グリッドスナップ（20px）
      const newX = Math.round((dragContext.initialSvg.x + offsetX) / 20) * 20;
      const newY = Math.round((dragContext.initialSvg.y + offsetY) / 20) * 20;
      
      onPositionChange({ x: newX, y: newY });
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
  }, [isDragging, dragContext, onPositionChange, collisionDetector, gate.id, gate.position]);

  // ダブルクリックでINPUTゲートをトグル
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (gate.type === 'INPUT' && onToggleInput) {
      onToggleInput();
    }
  }, [gate.type, onToggleInput]);

  // ピンレンダリング（モックアップから完全コピー）
  const renderPin = (pinIndex: number, pinType: 'input' | 'output', pinValue: boolean) => {
    const position = pinType === 'input' 
      ? collisionDetector.calculateInputPinPosition(gate, pinIndex)
      : collisionDetector.calculateOutputPinPosition(gate, pinIndex);

    const localX = position.x - gate.position.x;
    const localY = position.y - gate.position.y;
    
    // ログを削除
    
    // ピンの状態を判定
    const pinId = `${gate.id}-${pinType}-${pinIndex}`;
    const isHovered = hoveredPinId === pinId;
    const connectablePins = drawingConnection ? getConnectablePins(gate.id) : [];
    const isHighlighted = connectablePins.includes(pinIndex) && pinType === 'input';

    const handlePinMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('[Gate] handlePinMouseDown - Pin clicked directly!', { 
        gateId: gate.id, 
        pinIndex, 
        pinType,
        pinGlobalPos: position
      });
      onPinClick(pinIndex, pinType);
    };

    // モックアップ通りに統一されたピンライン長さ（10px）
    const pinLineLength = 10;
    let lineStartX = 0;
    
    if (pinType === 'output') {
      // 出力ピンは右側なので、左から線を引く
      lineStartX = localX - pinLineLength;
    } else {
      // 入力ピンは左側なので、右から線を引く
      lineStartX = localX + pinLineLength;
    }

    return (
      <g key={`${pinType}-${pinIndex}`}>
        {/* ヒットエリア（最背面、大きめ） */}
        <circle
          cx={localX}
          cy={localY}
          r="20"
          fill="rgba(255, 0, 0, 0.2)"  // 赤色半透明で可視化
          stroke="red"
          strokeWidth="1"
          className="pin-hit-area"
          onMouseDown={handlePinMouseDown}
          onMouseEnter={() => setHoveredPin(pinId)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{ cursor: 'pointer' }}
        />
        
        {/* ピンライン */}
        <line
          x1={lineStartX}
          y1={localY}
          x2={localX}
          y2={localY}
          stroke={pinValue ? "#00ff88" : "#666"}
          strokeWidth="2"
          style={{
            transition: 'all 0.2s ease',
            pointerEvents: 'none'
          }}
        />
        
        {/* ピン円 */}
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
          style={{
            transition: 'all 0.2s ease',
            filter: pinValue ? 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))' : 'none',
            pointerEvents: 'none'
          }}
        />
      </g>
    );
  };

  // ゲート形状のレンダリング（モックアップから完全コピー）
  const renderGateShape = () => {
    const value = gate.type === 'INPUT' 
      ? gate.outputPins?.[0]?.value ?? false
      : gate.type === 'OUTPUT'
      ? gate.inputPins?.[0]?.value ?? false
      : false;

    switch (gate.type) {
      case 'INPUT':
        return (
          <g>
            <rect 
              x="-25" 
              y="-15" 
              width="50" 
              height="30" 
              rx="15" 
              fill={value ? "rgba(0, 255, 136, 0.1)" : "#1a1a1a"} 
              stroke={value ? "#00ff88" : "#444"}
              strokeWidth="2"
            />
            <circle 
              cx={value ? "5" : "-5"} 
              cy="0" 
              r="10" 
              fill={value ? "#00ff88" : "#666"}
            />
          </g>
        );

      case 'OUTPUT':
        return (
          <g>
            <circle 
              cx="0" 
              cy="0" 
              r="20" 
              fill="#1a1a1a" 
              stroke="#444" 
              strokeWidth="2"
            />
            <circle 
              cx="0" 
              cy="0" 
              r="15" 
              fill={value ? "#ffcc00" : "#333"}
            />
            <text 
              x="0" 
              y="0" 
              style={{ 
                fontSize: "20px", 
                textAnchor: "middle", 
                dominantBaseline: "middle",
                pointerEvents: "none",
                userSelect: "none" 
              }}
            >
              💡
            </text>
          </g>
        );

      case 'CLOCK':
        return (
          <g>
            <circle 
              cx="0" 
              cy="0" 
              r="40" 
              fill="#1a1a1a" 
              stroke={value ? "#00ff88" : "#444"}
              strokeWidth="2"
            />
            <text 
              x="0" 
              y="2" 
              style={{ 
                fontSize: "24px", 
                textAnchor: "middle",
                dominantBaseline: "middle",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              ⏰
            </text>
          </g>
        );

      case 'AND':
      case 'OR':
      case 'NOT':
      case 'XOR':
      case 'NAND':
      case 'NOR':
        return (
          <g>
            <rect
              x="-35"
              y="-25"
              width="70"
              height="50"
              rx="8"
              fill="#1a1a1a"
              stroke={isSelected ? "#00aaff" : "#444"}
              strokeWidth={isSelected ? "3" : "2"}
            />
            <text
              x="0"
              y="0"
              fill="#fff"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                textAnchor: "middle",
                dominantBaseline: "middle",
                fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              {gate.type}
            </text>
          </g>
        );

      case 'D-FLIPFLOP':
        return (
          <g>
            <rect
              x="-50"
              y="-40"
              width="100"
              height="80"
              rx="8"
              fill="#1a1a1a"
              stroke={isSelected ? "#00aaff" : "#444"}
              strokeWidth={isSelected ? "3" : "2"}
            />
            <text
              x="0"
              y="0"
              fill="#fff"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                textAnchor: "middle",
                dominantBaseline: "middle",
                fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              D-FF
            </text>
          </g>
        );

      case 'SR-LATCH':
        return (
          <g>
            <rect
              x="-50"
              y="-40"
              width="100"
              height="80"
              rx="8"
              fill="#1a1a1a"
              stroke={isSelected ? "#00aaff" : "#444"}
              strokeWidth={isSelected ? "3" : "2"}
            />
            <text
              x="0"
              y="-10"
              fill="#fff"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                textAnchor: "middle",
                dominantBaseline: "middle",
                fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              SR
            </text>
            <text
              x="0"
              y="10"
              fill="#999"
              style={{
                fontSize: "11px",
                fontWeight: "500",
                textAnchor: "middle",
                dominantBaseline: "middle",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              LATCH
            </text>
          </g>
        );

      case 'MUX':
        return (
          <g>
            <rect
              x="-50"
              y="-40"
              width="100"
              height="80"
              rx="8"
              fill="#1a1a1a"
              stroke={isSelected ? "#00aaff" : "#444"}
              strokeWidth={isSelected ? "3" : "2"}
            />
            <text
              x="0"
              y="0"
              fill="#fff"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                textAnchor: "middle",
                dominantBaseline: "middle",
                fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace",
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              MUX
            </text>
          </g>
        );

      default:
        // カスタムゲート
        return (
          <g>
            <rect
              x="-50"
              y="-40"
              width="100"
              height="80"
              rx="8"
              fill="rgba(102, 51, 153, 0.1)"
              stroke="#6633cc"
              strokeWidth="2"
            />
            <text
              x="0"
              y="0"
              fill="#ccc"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                textAnchor: "middle",
                dominantBaseline: "middle",
                pointerEvents: "none",
                userSelect: "none"
              }}
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
      {/* 選択状態のハイライトは削除（モックアップに存在しない） */}

      {/* ゲート本体 */}
      <g 
        onMouseDown={handleMouseDown} 
        onDoubleClick={handleDoubleClick}
        onClick={(e) => {
          if (gate.type === 'INPUT') {
            e.stopPropagation();
            onToggleInput?.();
          }
        }}
      >
        {renderGateShape()}
      </g>

      {/* 入力ピン（ゲート本体より前面） */}
      {(gate as any)._inputs && (gate as any)._inputs.length > 0 && 
        (gate as any)._inputs.map((pin: any, index: number) => (
          <React.Fragment key={`input-${index}`}>
            {renderPin(index, 'input', pin.value)}
          </React.Fragment>
        ))
      }

      {/* 出力ピン（ゲート本体より前面） */}
      {(gate as any)._outputs && (gate as any)._outputs.length > 0 && 
        (gate as any)._outputs.map((pin: any, index: number) => (
          <React.Fragment key={`output-${index}`}>
            {renderPin(index, 'output', pin.value)}
          </React.Fragment>
        ))
      }


    </g>
  );
};