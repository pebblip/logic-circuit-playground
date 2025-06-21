import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { GateComponent } from './Gate';
import { WireComponent } from './Wire';
import { useCanvasPan } from '../hooks/useCanvasPan';
import {
  useCanvasSelection,
  type SelectionRect,
} from '../hooks/useCanvasSelection';
import { useCanvasZoom } from '../hooks/useCanvasZoom';
import { GATE_SIZES } from '../types/gates';
import { debug } from '@/shared/debug';
import { handleError } from '@/infrastructure/errorHandler';
import { CANVAS_CONSTANTS, type ViewBox } from './canvas/utils/canvasConstants';
import { CanvasBackground } from './canvas/components/CanvasBackground';
import { CanvasControls } from './canvas/components/CanvasControls';
import { CanvasPreviewHeader } from './canvas/components/CanvasPreviewHeader';
import { SelectionRect as SelectionRectComponent } from './canvas/components/SelectionRect';
import { WirePreview } from './canvas/components/WirePreview';
import { useCanvasSimulation } from './canvas/hooks/useCanvasSimulation';
import { useCanvasInteraction } from './canvas/hooks/useCanvasInteraction';
import { useCanvasGateManagement } from './canvas/hooks/useCanvasGateManagement';

interface CanvasProps {
  highlightedGateId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ highlightedGateId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 300 });
  const [viewBox, setViewBox] = useState<ViewBox>(
    CANVAS_CONSTANTS.DEFAULT_VIEWBOX
  );
  // Removed unused savedViewBox state
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [initialGatePositions, setInitialGatePositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());
  const [initialSelectionRect, setInitialSelectionRect] =
    useState<SelectionRect | null>(null);
  // Removed unused selectionRectOffset state

  const {
    gates,
    wires,
    isDrawingWire,
    wireStart,
    cancelWireDrawing,
    selectedGateIds,
    setSelectedGates,
    clearSelection,
    viewMode,
    previewingCustomGateId,
    customGates,
    exitCustomGatePreview,
  } = useCircuitStore();

  // 表示データの切り替え（プレビューモード対応）- パフォーマンス最適化
  const displayData = useMemo(() => {
    // 早期リターン：通常モードでは重い計算を避ける
    if (viewMode !== 'custom-gate-preview') {
      return {
        displayGates: gates,
        displayWires: wires,
        isReadOnly: false,
      };
    }

    // プレビューモード時のみ重い計算を実行
    if (!previewingCustomGateId) {
      return {
        displayGates: [],
        displayWires: [],
        isReadOnly: true,
      };
    }

    const customGate = customGates.find(g => g.id === previewingCustomGateId);

    // エラーハンドリング
    if (!customGate?.internalCircuit) {
      handleError(
        new Error(
          `Internal circuit not found for custom gate: ${previewingCustomGateId}`
        ),
        'Canvas',
        {
          userAction: 'カスタムゲートプレビュー開始',
          severity: 'medium',
          showToUser: true,
        }
      );
      return {
        displayGates: [],
        displayWires: [],
        isReadOnly: true,
      };
    }

    // ゲートが配列であることを確認
    const gatesArray = Array.isArray(customGate.internalCircuit.gates)
      ? customGate.internalCircuit.gates
      : [];
    const wiresArray = Array.isArray(customGate.internalCircuit.wires)
      ? customGate.internalCircuit.wires
      : [];

    return {
      displayGates: gatesArray,
      displayWires: wiresArray,
      isReadOnly: true,
    };
  }, [viewMode, previewingCustomGateId, customGates, gates, wires]);

  // カスタムフックの使用
  const { scale, handleZoom, resetZoom, zoomIn, zoomOut } = useCanvasZoom(
    svgRef,
    viewBox,
    setViewBox
  );

  // CLOCKゲートのアニメーション処理（ギャラリーと同様）
  // useCanvasSimulationに統合したため無効化
  // const animationRef = useRef<number | null>(null);

  // 🛡️ 既存ゲートの座標チェック・修正（初回のみ）
  useEffect(() => {
    if (displayData.isReadOnly) return;

    const currentState = useCircuitStore.getState();
    let needsCoordinatefix = false;

    const fixedGates = currentState.gates.map(gate => {
      // 左上角近辺（座標100未満）のゲートを修正
      if (gate.position.x < 100 || gate.position.y < 100) {
        needsCoordinatefix = true;
        const fixedX = Math.max(gate.position.x, 150);
        const fixedY = Math.max(gate.position.y, 150);

        if (import.meta.env.DEV) {
          console.warn(
            `🔧 既存ゲート座標を修正: ${gate.type}(${gate.id}) (${gate.position.x}, ${gate.position.y}) -> (${fixedX}, ${fixedY})`
          );
        }

        return { ...gate, position: { x: fixedX, y: fixedY } };
      }
      return gate;
    });

    if (needsCoordinatefix) {
      useCircuitStore.setState({ gates: fixedGates });
    }
  }, [displayData.isReadOnly]); // 依存関係を追加

  // CLOCKアニメーション処理はuseCanvasSimulationに統合
  // useEffect(() => {
  //   // プレビューモードでは更新しない
  //   if (displayData.isReadOnly) return;
  //
  //   const hasClockGate = displayData.displayGates.some(g => g.type === 'CLOCK');
  //
  //   if (hasClockGate) {
  //     let lastUpdateTime = 0;
  //     const animate = () => {
  //       const now = Date.now();
  //
  //       // 100ms毎に更新（パフォーマンスのため）
  //       if (now - lastUpdateTime > 100) {
  //         lastUpdateTime = now;
  //
  //         // 現在のstoreの状態を取得
  //         const currentState = useCircuitStore.getState();
  //         let needsUpdate = false;
  //
  //         const newGates = currentState.gates.map(gate => {
  //           if (gate.type === 'CLOCK' && gate.metadata?.frequency && gate.metadata?.isRunning) {
  //             const frequency = gate.metadata.frequency as number;
  //             const period = 1000 / frequency;
  //
  //             // startTimeの取得（Core APIと一致させる）
  //             const startTime = gate.metadata.startTime !== undefined ?
  //               (gate.metadata.startTime as number) : now;
  //             const elapsed = now - startTime;
  //
  //             const shouldBeOn = Math.floor(elapsed / period) % 2 === 1;
  //
  //
  //             if (gate.output !== shouldBeOn) {
  //               needsUpdate = true;
  //               return { ...gate, output: shouldBeOn };
  //             }
  //           }
  //           return gate;
  //         });
  //
  //         if (needsUpdate) {
  //           // 回路評価を実行してワイヤーも更新（ギャラリーと同様）
  //           const circuitData: Circuit = { gates: newGates, wires: currentState.wires };
  //
  //           // EnhancedHybridEvaluatorで回路評価（同期処理）
  //           const enhancedEvaluator = new EnhancedHybridEvaluator({
  //             strategy: 'AUTO_SELECT',
  //             enableDebugLogging: false,
  //           });
  //
  //           try {
  //             // 🔧 同期的に評価実行
  //             const evaluationResult = enhancedEvaluator.evaluate(circuitData);
  //             const updatedCircuit = evaluationResult.circuit;
  //
  //             // Zustand storeを更新（ゲートとワイヤー両方）
  //             useCircuitStore.setState({
  //               gates: [...updatedCircuit.gates],
  //               wires: [...updatedCircuit.wires]
  //             });
  //           } catch (error) {
  //             console.error('🚨 CLOCK animation circuit evaluation failed:', error);
  //             // エラー時はCLOCK状態のみ更新
  //             useCircuitStore.setState({
  //               gates: [...newGates]
  //             });
  //           }
  //         }
  //       }
  //
  //       animationRef.current = requestAnimationFrame(animate);
  //     };
  //
  //     animationRef.current = requestAnimationFrame(animate);
  //   }
  //
  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //   };
  // }, []); // 初回のみ実行（依存配列の無限ループを防止）

  // プレビューモード開始時にビューをリセット
  useEffect(() => {
    if (viewMode === 'custom-gate-preview') {
      // 内部回路の境界を計算（ゲートのサイズを考慮）
      const gatesArray = displayData.displayGates;
      if (gatesArray.length === 0) {
        debug.log('[Canvas] No gates to display in preview mode');
        return;
      }

      // 各ゲートのサイズを考慮した正確な境界を計算
      const bounds = gatesArray.reduce(
        (acc, gate) => {
          // ゲートサイズを取得
          let gateWidth: number;
          let gateHeight: number;

          if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
            gateWidth =
              gate.customGateDefinition.width || GATE_SIZES.CUSTOM.width;
            gateHeight =
              gate.customGateDefinition.height || GATE_SIZES.CUSTOM.height;
          } else if (gate.type in GATE_SIZES) {
            const size = GATE_SIZES[gate.type as keyof typeof GATE_SIZES];
            gateWidth = size.width;
            gateHeight = size.height;
          } else {
            // フォールバック
            gateWidth = 70;
            gateHeight = 50;
          }

          // ピンの突き出し分も考慮（左右に10px）
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

      // 境界が正しく計算されているか確認
      if (
        !isFinite(bounds.minX) ||
        !isFinite(bounds.maxX) ||
        !isFinite(bounds.minY) ||
        !isFinite(bounds.maxY)
      ) {
        handleError(
          new Error(`Invalid bounds calculated: ${JSON.stringify(bounds)}`),
          'Canvas',
          {
            userAction: '表示範囲計算',
            severity: 'low',
            showToUser: false,
            logToConsole: true,
          }
        );
        // フォールバック: デフォルトビュー
        setViewBox({
          x: -600,
          y: -400,
          width: 1200,
          height: 800,
        });
        resetZoom();
        return;
      }

      // パディングを追加（均等に）
      const padding = 150;
      const circuitWidth = bounds.maxX - bounds.minX;
      const circuitHeight = bounds.maxY - bounds.minY;

      // 回路の中心点
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;

      // viewBoxのサイズ（回路に合わせて調整）
      const minViewBoxSize = 400;
      const viewBoxWidth = Math.max(circuitWidth + padding * 2, minViewBoxSize);
      const viewBoxHeight = Math.max(
        circuitHeight + padding * 2,
        minViewBoxSize
      );

      // 回路を画面中央に配置するため、viewBoxの左上座標を計算
      // viewBoxの中心を回路の中心に合わせる
      const viewBoxX = centerX - viewBoxWidth / 2;
      const viewBoxY = centerY - viewBoxHeight / 2;

      // ゲートの平均位置を計算（フォールバック用）
      const avgX =
        gatesArray.reduce((sum, g) => sum + g.position.x, 0) /
        gatesArray.length;
      const avgY =
        gatesArray.reduce((sum, g) => sum + g.position.y, 0) /
        gatesArray.length;

      // デバッグ: 原点周辺を表示するオプション
      const showOrigin = false; // true にすると原点周辺を表示（デバッグ用）
      const useAvgPosition = true; // true にすると平均位置を使用

      // ゲートが1つもない場合は早期リターン
      if (gatesArray.length === 0) {
        handleError('No gates in internal circuit', 'Canvas', {
          userAction: 'カスタムゲート内部回路表示',
          severity: 'medium',
          showToUser: true,
          logToConsole: true,
        });
        setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
        resetZoom();
        return;
      }

      if (showOrigin) {
        // より広い範囲を表示
        setViewBox({
          x: -2000,
          y: -2000,
          width: 4000,
          height: 4000,
        });
      } else if (useAvgPosition && isFinite(avgX) && isFinite(avgY)) {
        // 平均位置を中心に表示
        setViewBox({
          x: avgX - viewBoxWidth / 2,
          y: avgY - viewBoxHeight / 2,
          width: viewBoxWidth,
          height: viewBoxHeight,
        });
      } else {
        setViewBox({
          x: viewBoxX,
          y: viewBoxY,
          width: viewBoxWidth,
          height: viewBoxHeight,
        });
      }

      // ズームもリセット
      resetZoom();
    }
  }, [viewMode, displayData.displayGates, resetZoom]);

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
    setSelectionRect,
  } = useCanvasSelection(
    displayData.displayGates,
    setSelectedGates,
    selectedGateIds
  );

  // キーボードイベント処理
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDrawingWire) {
          cancelWireDrawing();
        }
        if (viewMode === 'custom-gate-preview') {
          exitCustomGatePreview();
        }
      }
      // スペースキーでパンモード
      if (event.key === ' ' && !event.repeat) {
        event.preventDefault();
        setIsSpacePressed(true);
        if (svgRef.current) {
          svgRef.current.style.cursor = 'grab';
        }
      }
      // 重複するキーボードショートカットはuseKeyboardShortcuts.tsに一元化済み
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
  }, [
    isDrawingWire,
    cancelWireDrawing,
    handlePanEnd,
    viewMode,
    exitCustomGatePreview,
  ]);

  // CLOCKゲートシミュレーションロジックをカスタムフックに委譲
  // タイミングチャートとの連携のため有効化
  useCanvasSimulation({
    displayGates: displayData.displayGates,
    isReadOnly: displayData.isReadOnly,
  });

  // インタラクション処理をカスタムフックに委譲
  const {
    handleMouseMove,
    handleClick,
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasInteraction({
    svgRef,
    selectedGateIds,
    isSelecting,
    selectionRect,
    selectionJustFinished,
    isDraggingSelection,
    dragStart,
    initialGatePositions,
    initialSelectionRect,
    isSpacePressed,
    isPanning,
    isDrawingWire,
    isReadOnly: displayData.isReadOnly,
    setMousePosition,
    setIsDraggingSelection,
    setDragStart,
    setInitialGatePositions,
    setInitialSelectionRect,
    handlePan,
    handlePanStart,
    handlePanEnd,
    updateSelection,
    startSelection,
    endSelection,
    setSelectionRect,
    handleZoom,
    clearSelection,
    clearSelectionRect,
    cancelWireDrawing,
  });

  // ゲート管理処理をカスタムフックに委譲
  const { handleDrop, handleDragOver } = useCanvasGateManagement({
    svgRef,
    isReadOnly: displayData.isReadOnly,
  });

  return (
    <div className="canvas-container">
      {/* プレビューモードヘッダー */}
      {viewMode === 'custom-gate-preview' && previewingCustomGateId && (
        <CanvasPreviewHeader
          customGateName={
            customGates.find(g => g.id === previewingCustomGateId)
              ?.displayName || 'カスタムゲート'
          }
          onExit={exitCustomGatePreview}
        />
      )}
      <svg
        ref={svgRef}
        className={`canvas ${displayData.isReadOnly ? 'canvas--preview-mode' : ''}`}
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
        {/* 背景とグリッド */}
        <CanvasBackground viewBox={viewBox} scale={scale} />

        {/* ワイヤー */}
        {displayData.displayWires.map(wire => (
          <WireComponent
            key={wire.id}
            wire={wire}
            gates={
              displayData.isReadOnly ? displayData.displayGates : undefined
            }
          />
        ))}

        {/* 描画中のワイヤープレビュー（プレビューモードでは非表示） */}
        {!displayData.isReadOnly && isDrawingWire && wireStart && (
          <WirePreview
            startX={wireStart.position.x}
            startY={wireStart.position.y}
            endX={mousePosition.x}
            endY={mousePosition.y}
          />
        )}

        {/* ゲート */}
        {displayData.displayGates.map(gate => (
          <GateComponent
            key={gate.id}
            gate={gate}
            isHighlighted={highlightedGateId === gate.id}
          />
        ))}

        {/* 選択矩形 */}
        {selectionRect && (
          <SelectionRectComponent
            startX={selectionRect.startX}
            startY={selectionRect.startY}
            endX={selectionRect.endX}
            endY={selectionRect.endY}
            isSelecting={isSelecting}
          />
        )}
      </svg>

      {/* ズームコントロール */}
      <CanvasControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />
    </div>
  );
};
