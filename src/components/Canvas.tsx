import React, { useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { GateComponent } from './Gate';
import { WireComponent } from './Wire';
import { evaluateCircuit } from '../utils/simulation';
import { useIsMobile } from '../hooks/useResponsive';
import { Position } from '../types/circuit';

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasProps {
  highlightedGateId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ highlightedGateId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const selectionJustFinished = useRef(false);
  
  const isMobile = useIsMobile();
  const { 
    gates, 
    wires, 
    isDrawingWire, 
    wireStart, 
    cancelWireDrawing,
    selectGate,
    selectedGateIds,
    setSelectedGates,
    addToSelection,
    clearSelection,
    addGate,
    addCustomGateInstance
  } = useCircuitStore();

  // キーボードイベント処理
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawingWire) {
        cancelWireDrawing();
      }
      // スペースキーでパンモード
      if (event.key === ' ' && !event.repeat) {
        event.preventDefault();
        setIsSpacePressed(true);
        if (svgRef.current) {
          svgRef.current.style.cursor = 'grab';
        }
      }
      // Deleteキーで選択中のゲートを削除
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedGateIds.length > 0) {
        event.preventDefault();
        const deleteGate = useCircuitStore.getState().deleteGate;
        selectedGateIds.forEach(gateId => deleteGate(gateId));
        setSelectionRect(null); // 削除後は選択矩形をクリア
      }
      // Ctrl+C でコピー
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && selectedGateIds.length > 0) {
        event.preventDefault();
        const copySelection = useCircuitStore.getState().copySelection;
        copySelection();
        
        // コピーフィードバック（選択枠を一瞬光らせる）
        // TODO: 視覚的フィードバックの実装
      }
      // Ctrl+V でペースト
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        const { paste, canPaste } = useCircuitStore.getState();
        if (canPaste()) {
          paste(mousePosition);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setIsSpacePressed(false);
        setIsPanning(false);
        if (svgRef.current) {
          svgRef.current.style.cursor = 'default';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrawingWire, cancelWireDrawing, selectedGateIds, mousePosition]);

  // CLOCKゲートがある場合、定期的に回路を更新
  React.useEffect(() => {
    // 実行中のCLOCKゲートがあるか確認
    const hasRunningClockGate = gates.some(gate => gate.type === 'CLOCK' && gate.metadata?.isRunning);
    
    if (hasRunningClockGate) {
      const interval = setInterval(() => {
        // 現在の状態を直接取得
        const currentState = useCircuitStore.getState();
        const { gates: updatedGates, wires: updatedWires } = evaluateCircuit(currentState.gates, currentState.wires);
        useCircuitStore.setState({ gates: updatedGates, wires: updatedWires });
      }, 50); // 20Hz更新
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [gates.filter(g => g.type === 'CLOCK').map(g => g.metadata?.isRunning).join(',')]);


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
    
    // パン中の処理
    if (isPanning) {
      handlePan(event.clientX, event.clientY);
    }
    
    // 選択矩形の更新
    if (isSelecting && selectionRect) {
      setSelectionRect({
        ...selectionRect,
        endX: svgPoint.x,
        endY: svgPoint.y
      });
    }
    
  };

  const handleClick = (event: React.MouseEvent) => {
    // 矩形選択直後のクリックは無視（ドラッグによる選択の場合）
    if (selectionJustFinished.current) {
      selectionJustFinished.current = false;
      return;
    }
    
    const target = event.target as SVGElement;
    
    // ゲート要素かどうかをチェック
    const isGate = isGateElement(target);
    
    // ゲート要素の場合は何もしない（ゲート自体のクリックハンドラーに任せる）
    if (isGate) {
      return;
    }
    
    // 背景（grid）またはSVG自体をクリックした場合のみ選択解除
    if (target === svgRef.current || target.id === 'canvas-background') {
      // ワイヤー描画をキャンセル
      if (isDrawingWire) {
        cancelWireDrawing();
      }
      // 選択をクリア（Shift/Ctrlキーが押されていない場合）
      if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
        clearSelection();
        setSelectionRect(null); // 選択矩形もクリア
      }
    }
  };

  // パン開始
  const handlePanStart = (clientX: number, clientY: number) => {
    if (!isDrawingWire) {
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      if (svgRef.current && isSpacePressed) {
        svgRef.current.style.cursor = 'grabbing';
      }
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
    if (svgRef.current && isSpacePressed) {
      svgRef.current.style.cursor = 'grab';
    } else if (svgRef.current) {
      svgRef.current.style.cursor = 'default';
    }
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
      // SVG要素とHTML要素の両方に対応
      if (current.classList && current.classList.contains('gate-container')) {
        return true;
      }
      if (current.hasAttribute && current.hasAttribute('data-gate-id')) {
        return true;
      }
      // SVG要素でclassName属性をチェック
      if (current.getAttribute && current.getAttribute('class')?.includes('gate-container')) {
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
    const target = event.target as SVGElement;
    const isGate = isGateElement(target);
    
    // スペース+左クリックでパン（優先的に処理）
    if (event.button === 0 && isSpacePressed) {
      handlePanStart(event.clientX, event.clientY);
      return; // 他の処理を実行しない
    }
    
    // 中ボタン、Ctrl+左クリックでパン
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      handlePanStart(event.clientX, event.clientY);
    }
    // 左クリックで背景をクリックした場合、選択矩形を開始
    else if (event.button === 0 && !isGate && !isDrawingWire && (target === svgRef.current || target.id === 'canvas-background')) {
      if (!svgRef.current) return;
      
      const point = svgRef.current.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
      
      setIsSelecting(true);
      setSelectionRect({
        startX: svgPoint.x,
        startY: svgPoint.y,
        endX: svgPoint.x,
        endY: svgPoint.y
      });
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    handlePanEnd();
    
    // 選択矩形終了時の処理
    if (isSelecting && selectionRect) {
      // 矩形内のゲートを選択
      const minX = Math.min(selectionRect.startX, selectionRect.endX);
      const maxX = Math.max(selectionRect.startX, selectionRect.endX);
      const minY = Math.min(selectionRect.startY, selectionRect.endY);
      const maxY = Math.max(selectionRect.startY, selectionRect.endY);
      
      const selectedGates = gates.filter(gate => {
        const { x, y } = gate.position;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      });
      
      if (selectedGates.length > 0) {
        setSelectedGates(selectedGates.map(g => g.id));
        // 選択されたゲートがある場合は選択矩形を維持
        // setSelectionRectは削除しない！
      } else {
        // 選択されたゲートがない場合のみクリア
        setSelectionRect(null);
      }
      
      setIsSelecting(false);
      // 矩形選択直後のクリックイベントを無視するためのフラグ
      // ドラッグ選択が実際に行われた場合のみフラグを立てる
      const dragDistance = Math.abs(selectionRect.endX - selectionRect.startX) + 
                          Math.abs(selectionRect.endY - selectionRect.startY);
      if (dragDistance > 5) { // 5px以上ドラッグした場合のみ
        selectionJustFinished.current = true;
      }
    }
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

  // ドロップハンドラ
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    const draggedGate = (window as any)._draggedGate;
    if (!draggedGate || !svgRef.current) return;
    
    // SVG座標系でのドロップ位置を取得
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
    
    // ゲートを配置
    if (draggedGate.type === 'CUSTOM' && draggedGate.customDefinition) {
      addCustomGateInstance(draggedGate.customDefinition, { x: svgPoint.x, y: svgPoint.y });
    } else {
      addGate(draggedGate.type, { x: svgPoint.x, y: svgPoint.y });
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  // ズームボタンハンドラー
  const handleZoomIn = () => {
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    handleZoom(-100, centerX, centerY); // negative delta for zoom in
  };

  const handleZoomOut = () => {
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;
    handleZoom(100, centerX, centerY); // positive delta for zoom out
  };

  const handleZoomReset = () => {
    setScale(1);
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
  };

  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="canvas-container">
      {/* ズームコントロール */}
      <div className="zoom-controls">
        <button 
          className="zoom-button" 
          onClick={handleZoomOut}
          title="ズームアウト"
        >
          −
        </button>
        <button 
          className="zoom-button zoom-reset" 
          onClick={handleZoomReset}
          title="ズームリセット"
        >
          {zoomPercentage}%
        </button>
        <button 
          className="zoom-button" 
          onClick={handleZoomIn}
          title="ズームイン"
        >
          +
        </button>
      </div>
      
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ touchAction: 'none' }}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"
            patternTransform={`scale(${1})`}>
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)"/>
          </pattern>
          
          {/* パーティクルのグロー効果 */}
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* ゲートのグロー効果 */}
          <filter id="gateGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect 
          id="canvas-background" 
          x={viewBox.x - 5000}
          y={viewBox.y - 5000}
          width={viewBox.width + 10000}
          height={viewBox.height + 10000}
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
          <GateComponent 
            key={gate.id} 
            gate={gate} 
            isHighlighted={highlightedGateId === gate.id}
          />
        ))}
        
        {/* 選択矩形 */}
        {selectionRect && (
          <rect
            x={Math.min(selectionRect.startX, selectionRect.endX)}
            y={Math.min(selectionRect.startY, selectionRect.endY)}
            width={Math.abs(selectionRect.endX - selectionRect.startX)}
            height={Math.abs(selectionRect.endY - selectionRect.startY)}
            fill="rgba(0, 255, 136, 0.1)"
            stroke="#00ff88"
            strokeWidth="1"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}
        
      </svg>
    </div>
  );
};