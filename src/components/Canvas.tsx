import React, { useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { GateComponent } from './Gate';
import { WireComponent } from './Wire';
import { evaluateCircuit } from '../utils/simulation';
import { useIsMobile } from '../hooks/useResponsive';

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const isMobile = useIsMobile();
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

  // CLOCKゲートがある場合、定期的に回路を更新
  React.useEffect(() => {
    const hasClockGate = gates.some(gate => gate.type === 'CLOCK' && gate.metadata?.isRunning);
    
    if (hasClockGate) {
      const interval = setInterval(() => {
        const { gates: updatedGates, wires: updatedWires } = evaluateCircuit(gates, wires);
        useCircuitStore.setState({ gates: updatedGates, wires: updatedWires });
      }, 50); // 20Hz更新
      
      return () => clearInterval(interval);
    }
  }, [gates, wires]);


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

  // パン開始
  const handlePanStart = (clientX: number, clientY: number) => {
    if (isMobile && !isDrawingWire) {
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
    }
  };

  // パン中
  const handlePan = (clientX: number, clientY: number) => {
    if (isPanning) {
      const dx = (panStart.x - clientX) / scale;
      const dy = (panStart.y - clientY) / scale;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      
      setPanStart({ x: clientX, y: clientY });
    }
  };

  // パン終了
  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // ズーム処理
  const handleZoom = (delta: number, centerX: number, centerY: number) => {
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor));
    
    if (newScale !== scale) {
      // ズームの中心点を基準に調整
      const scaleDiff = newScale - scale;
      const dx = (centerX - viewBox.x - viewBox.width / 2) * (scaleDiff / scale);
      const dy = (centerY - viewBox.y - viewBox.height / 2) * (scaleDiff / scale);
      
      setViewBox(prev => ({
        x: prev.x - dx,
        y: prev.y - dy,
        width: 1200 / newScale,
        height: 800 / newScale,
      }));
      
      setScale(newScale);
    }
  };

  // ホイールイベント
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = viewBox.x + (event.clientX - rect.left) * viewBox.width / rect.width;
    const centerY = viewBox.y + (event.clientY - rect.top) * viewBox.height / rect.height;
    
    handleZoom(-event.deltaY, centerX, centerY);
  };

  // ゲート要素かどうかを判定する関数
  const isGateElement = (element: Element | null): boolean => {
    if (!element) return false;
    
    // 要素自体または親要素を辿ってゲート関連の要素を探す
    let current = element;
    while (current && current !== svgRef.current) {
      if (current.classList.contains('gate-container') || 
          current.hasAttribute('data-gate-id') ||
          current.closest('.gate-container')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  };

  // タッチイベント（モバイル用）
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const target = event.target as Element;
      
      // ゲート要素をタッチした場合はパンを開始しない
      if (!isGateElement(target)) {
        handlePanStart(touch.clientX, touch.clientY);
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 1 && isPanning) {
      const touch = event.touches[0];
      handlePan(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    handlePanEnd();
  };

  // マウスイベント（デスクトップでのパン）
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      handlePanStart(event.clientX, event.clientY);
    }
  };

  const handleMouseUp = () => {
    handlePanEnd();
  };

  // グローバルイベントリスナー
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isPanning) {
        handlePan(event.clientX, event.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isPanning) {
        handlePanEnd();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanning, panStart, scale, viewBox]);

  return (
    <div className="canvas-container">
      <svg
        ref={svgRef}
        className="canvas"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"
            patternTransform={`scale(${1})`}>
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)"/>
          </pattern>
        </defs>
        <rect 
          id="canvas-background" 
          x={viewBox.x - 1000}
          y={viewBox.y - 1000}
          width={viewBox.width + 2000}
          height={viewBox.height + 2000}
          fill="url(#grid)"
        />

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