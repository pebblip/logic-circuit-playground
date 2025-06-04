import React, { useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { GateComponent } from './Gate';
import { WireComponent } from './Wire';
import { evaluateCircuit } from '@domain/simulation';
import { useCanvasPan } from '../hooks/useCanvasPan';
import { useCanvasSelection } from '../hooks/useCanvasSelection';
import { useCanvasZoom } from '../hooks/useCanvasZoom';
import { reactEventToSVGCoordinates } from '@infrastructure/ui/svgCoordinates';

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasProps {
  highlightedGateId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ highlightedGateId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const {
    gates,
    wires,
    isDrawingWire,
    wireStart,
    cancelWireDrawing,
    selectedGateIds,
    setSelectedGates,
    clearSelection,
    addGate,
    addCustomGateInstance,
  } = useCircuitStore();

  // カスタムフックの使用
  const { scale, handleZoom, resetZoom, zoomIn, zoomOut } = useCanvasZoom(
    svgRef,
    viewBox,
    setViewBox
  );
  const { isPanning, handlePanStart, handlePan, handlePanEnd } = useCanvasPan(
    svgRef,
    viewBox,
    setViewBox,
    scale
  );
  const {
    isSelecting,
    selectionRect,
    selectionJustFinished,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection: clearSelectionRect,
  } = useCanvasSelection(gates, setSelectedGates);

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
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedGateIds.length > 0
      ) {
        event.preventDefault();
        const deleteGate = useCircuitStore.getState().deleteGate;
        selectedGateIds.forEach(gateId => deleteGate(gateId));
        clearSelectionRect(); // 削除後は選択矩形をクリア
      }
      // Ctrl+C でコピー
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'c' &&
        selectedGateIds.length > 0
      ) {
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
        handlePanEnd();
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
    const hasRunningClockGate = gates.some(
      gate => gate.type === 'CLOCK' && gate.metadata?.isRunning
    );

    if (hasRunningClockGate) {
      const interval = setInterval(() => {
        // 現在の状態を直接取得
        const currentState = useCircuitStore.getState();
        const { gates: updatedGates, wires: updatedWires } = evaluateCircuit(
          currentState.gates,
          currentState.wires
        );
        useCircuitStore.setState({ gates: updatedGates, wires: updatedWires });
      }, 50); // 20Hz更新

      return () => {
        clearInterval(interval);
      };
    }
  }, [
    gates
      .filter(g => g.type === 'CLOCK')
      .map(g => g.metadata?.isRunning)
      .join(','),
  ]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!svgRef.current) return;

    const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
    if (!svgPoint) return;

    setMousePosition({
      x: svgPoint.x,
      y: svgPoint.y,
    });

    // パン中の処理
    if (isPanning) {
      handlePan(event.clientX, event.clientY);
    }

    // 選択矩形の更新
    if (isSelecting) {
      updateSelection(svgPoint.x, svgPoint.y);
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
        clearSelectionRect(); // 選択矩形もクリア
      }
    }
  };

  // ホイールイベント
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    handleZoom(-event.deltaY, event.clientX, event.clientY);
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
      if (
        current.getAttribute &&
        current.getAttribute('class')?.includes('gate-container')
      ) {
        return true;
      }
      current = current.parentElement as Element;
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
    else if (
      event.button === 0 &&
      !isGate &&
      !isDrawingWire &&
      (target === svgRef.current || target.id === 'canvas-background')
    ) {
      if (!svgRef.current) return;

      const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
      if (!svgPoint) return;

      startSelection(svgPoint.x, svgPoint.y);
    }
  };

  const handleMouseUp = (_event: React.MouseEvent) => {
    handlePanEnd();

    // 選択矩形終了時の処理
    if (isSelecting) {
      endSelection();
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
  }, [isPanning, handlePan, handlePanEnd]);

  // ドロップハンドラ
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const draggedGate = (window as Window & { _draggedGate?: unknown })._draggedGate;
    if (!draggedGate || !svgRef.current) return;

    // SVG座標系でのドロップ位置を取得
    const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
    if (!svgPoint) return;

    // ゲートを配置
    if (draggedGate.type === 'CUSTOM' && draggedGate.customDefinition) {
      addCustomGateInstance(draggedGate.customDefinition, {
        x: svgPoint.x,
        y: svgPoint.y,
      });
    } else {
      addGate(draggedGate.type, { x: svgPoint.x, y: svgPoint.y });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="canvas-container">
      <svg
        ref={svgRef}
        className="canvas"
        data-testid="canvas"
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
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform={`scale(${1})`}
          >
            <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)" />
          </pattern>

          {/* パーティクルのグロー効果 */}
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ゲートのグロー効果 */}
          <filter id="gateGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
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
        {wires.map(wire => (
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
        {gates.map(gate => (
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

      {/* ズームコントロール */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={zoomOut}>
          −
        </button>
        <button className="zoom-button zoom-reset" onClick={resetZoom}>
          {Math.round(scale * 100)}%
        </button>
        <button className="zoom-button" onClick={zoomIn}>
          ＋
        </button>
      </div>
    </div>
  );
};
