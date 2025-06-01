import React, { useRef, useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { GateComponent } from './Gate';
import { WireComponent } from './Wire';

export const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  
  const { gates, wires, isDrawingWire, wireStart, cancelWireDrawing } = useCircuitStore();

  // Escapeキーでワイヤー描画をキャンセル
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawingWire) {
        cancelWireDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawingWire, cancelWireDrawing]);


  const handleMouseMove = (event: React.MouseEvent) => {
    if (!svgRef.current) return;
    
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()!.inverse());

    setMousePosition({
      x: svgPoint.x,
      y: svgPoint.y,
    });
  };

  const handleClick = (event: React.MouseEvent) => {
    // 背景（grid）またはSVG自体をクリックした場合のみワイヤー描画をキャンセル
    const target = event.target as SVGElement;
    if (isDrawingWire && (target === svgRef.current || target.id === 'canvas-background')) {
      cancelWireDrawing();
    }
  };

  return (
    <div className="canvas-container">
      <svg
        ref={svgRef}
        className="canvas"
        viewBox="0 0 1200 800"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)"/>
          </pattern>
        </defs>
        <rect id="canvas-background" width="100%" height="100%" fill="url(#grid)"/>

        {/* ワイヤー */}
        {wires.map((wire) => (
          <WireComponent key={wire.id} wire={wire} />
        ))}

        {/* 描画中のワイヤー */}
        {isDrawingWire && wireStart && (
          <line
            x1={wireStart.position.x}
            y1={wireStart.position.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="#00ff88"
            strokeWidth="2"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}

        {/* ゲート */}
        {gates.map((gate) => (
          <GateComponent key={gate.id} gate={gate} />
        ))}
      </svg>
    </div>
  );
};