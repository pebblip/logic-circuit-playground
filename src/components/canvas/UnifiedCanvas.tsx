/**
 * 統一キャンバスコンポーネント
 *
 * CLAUDE.md準拠: 段階的移行によるリスク軽減
 * - Canvas.tsx と GalleryCanvas.tsx を統合
 * - モード別機能の動的切り替え
 * - 既存コンポーネントとの完全互換性
 */

import React, { useMemo } from 'react';
import { GateComponent } from '../Gate';
import { WireComponent } from '../Wire';
import { CanvasBackground } from './components/CanvasBackground';
import { CanvasControls } from './components/CanvasControls';
import { CanvasPreviewHeader } from './components/CanvasPreviewHeader';
import { SelectionRect } from './components/SelectionRect';
import { WirePreview } from './components/WirePreview';
import { useUnifiedCanvas } from './hooks/useUnifiedCanvas';
import { useCanvasPan } from '../../hooks/useCanvasPan';
import { useCanvasZoom } from '../../hooks/useCanvasZoom';
import { useCanvasSelection } from '../../hooks/useCanvasSelection';
import { useCanvasGateManagement } from './hooks/useCanvasGateManagement';
import { useCanvasSimulation } from './hooks/useCanvasSimulation';
// import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useCircuitStore } from '@/stores/circuitStore';
import { handleError } from '@/infrastructure/errorHandler';
import type { UnifiedCanvasProps } from './types/canvasTypes';
import './UnifiedCanvas.css';

/**
 * 統一キャンバスコンポーネント
 */
export const UnifiedCanvas: React.FC<UnifiedCanvasProps> = ({
  config,
  dataSource,
  handlers,
  highlightedGateId,
  className,
  style,
}) => {
  // 統一キャンバス管理
  const { svgRef, state, transform, actions, features } = useUnifiedCanvas(
    config,
    dataSource,
    handlers
  );

  // ViewBox管理：ギャラリーモードはuseUnifiedCanvasのstate.viewBoxを使用
  const viewBox =
    config.mode === 'gallery'
      ? state.viewBox
      : { x: 0, y: 0, width: 1200, height: 800 };
  const [localViewBox, setLocalViewBox] = React.useState(viewBox);

  // ギャラリーモードでstate.viewBoxが変更されたらlocalViewBoxも更新
  React.useEffect(() => {
    if (config.mode === 'gallery') {
      setLocalViewBox(state.viewBox);
    }
  }, [config.mode, state.viewBox]);

  // Zustandストアからワイヤー描画状態を取得
  const {
    isDrawingWire,
    wireStart,
    cancelWireDrawing,
    exitCustomGatePreview,
    viewMode,
  } = useCircuitStore();

  // スペースキー押下状態
  const [isSpacePressed, setIsSpacePressed] = React.useState(false);

  // マウス位置の追跡（ワイヤー描画用）
  const [currentMousePosition, setCurrentMousePosition] = React.useState({
    x: 0,
    y: 0,
  });

  // エディターモード専用機能（Hooksは常に呼び出す）
  const panHandlers = useCanvasPan(
    svgRef,
    localViewBox,
    setLocalViewBox,
    state.scale
  );
  const zoomHandlers = useCanvasZoom(svgRef, localViewBox, setLocalViewBox);
  const selectionHandlers = useCanvasSelection(
    state.displayGates,
    actions.setSelection,
    Array.from(state.selectedIds)
  );

  // 実際に使用するかどうかは機能フラグで判定
  const canUsePan = features.canPan && config.mode === 'editor';
  const canUseZoom = features.canZoom;
  const canUseSelection = features.canSelect && config.mode === 'editor';

  // ゲート管理（ドラッグ&ドロップ）
  const gateManagement = useCanvasGateManagement({
    svgRef,
    isReadOnly:
      config.interactionLevel === 'view_only' ||
      config.previewOptions?.readOnly === true,
  });

  // キャンバスインタラクション（一時的に無効化）
  // TODO: useCanvasInteractionの引数を正しく修正する
  // const canvasInteraction = useCanvasInteraction({
  //   svgRef,
  //   isReadOnly: config.interactionLevel === 'view_only' || config.previewOptions?.readOnly === true,
  // });

  // ViewBox計算
  const viewBoxString = useMemo(() => {
    const { x, y, width, height } = localViewBox;
    return `${x} ${y} ${width} ${height}`;
  }, [localViewBox]);

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
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setIsSpacePressed(false);
        panHandlers.handlePanEnd();
        if (svgRef.current) {
          svgRef.current.style.cursor = '';
        }
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
    panHandlers,
    viewMode,
    exitCustomGatePreview,
  ]);

  // CLOCKゲートシミュレーション（エディターモードのみ）
  useCanvasSimulation({
    displayGates: state.displayGates,
    isReadOnly:
      config.interactionLevel === 'view_only' ||
      config.previewOptions?.readOnly === true,
  });

  // イベントハンドラー統合（メモ化）
  const handleSvgClick = React.useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      try {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const svgPoint = transform.screenToSvg({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        handlers?.onCanvasClick?.(svgPoint);
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Canvas click failed'),
          'UnifiedCanvas',
          {
            userAction: 'キャンバスクリック',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [handlers, transform]
  );

  const handleSvgMouseDown = React.useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      try {
        // ドラッグ機能を一時的に無効化
        // TODO: canvasInteraction.handleMouseDown(event);

        // スペース+左クリックでパン（優先的に処理）
        if (event.button === 0 && isSpacePressed) {
          panHandlers.handlePanStart(event.clientX, event.clientY);
          return;
        }

        if (canUsePan) {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            panHandlers.handlePanStart(event.clientX, event.clientY);
          }
        }

        if (canUseSelection && !panHandlers?.isPanning) {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const svgX = event.clientX - rect.left;
            const svgY = event.clientY - rect.top;
            selectionHandlers.startSelection(svgX, svgY);
          }
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Mouse down failed'),
          'UnifiedCanvas',
          {
            userAction: 'マウスダウン',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [canUsePan, isSpacePressed, panHandlers, canUseSelection, selectionHandlers]
  );

  const handleSvgMouseMove = React.useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      try {
        // ドラッグ機能を一時的に無効化
        // TODO: canvasInteraction.handleMouseMove(event);

        // マウス位置を更新（ワイヤー描画用）
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const svgX = event.clientX - rect.left;
          const svgY = event.clientY - rect.top;

          // viewBoxのスケールを考慮（localViewBoxを使用）
          const viewBox = localViewBox;
          const scaleX = viewBox.width / rect.width;
          const scaleY = viewBox.height / rect.height;

          setCurrentMousePosition({
            x: viewBox.x + svgX * scaleX,
            y: viewBox.y + svgY * scaleY,
          });
        }

        if (canUsePan && panHandlers?.isPanning) {
          panHandlers.handlePan(event.clientX, event.clientY);
        }

        if (canUseSelection && selectionHandlers?.isSelecting) {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const svgX = event.clientX - rect.left;
            const svgY = event.clientY - rect.top;
            selectionHandlers.updateSelection(svgX, svgY);
          }
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Mouse move failed'),
          'UnifiedCanvas',
          {
            userAction: 'マウス移動',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [
      canUsePan,
      isDrawingWire,
      isSpacePressed,
      panHandlers,
      localViewBox,
      canUseSelection,
      selectionHandlers,
    ]
  );

  const handleSvgMouseUp = React.useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      try {
        // ドラッグ機能を一時的に無効化
        // TODO: canvasInteraction.handleMouseUp(event);

        if (canUsePan && panHandlers?.isPanning) {
          panHandlers.handlePanEnd();
        }

        if (canUseSelection && selectionHandlers?.isSelecting) {
          selectionHandlers.endSelection();
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Mouse up failed'),
          'UnifiedCanvas',
          {
            userAction: 'マウスアップ',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [canUsePan, canUseSelection, panHandlers, selectionHandlers]
  );

  const handleWheel = React.useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      try {
        if (canUseZoom) {
          event.preventDefault();
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            zoomHandlers.handleZoom(
              event.deltaY,
              event.clientX - rect.left,
              event.clientY - rect.top
            );
          }
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Wheel event failed'),
          'UnifiedCanvas',
          {
            userAction: 'ホイール操作',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [canUseZoom, zoomHandlers]
  );

  // ゲートクリックハンドラー（Zustandストア統合）
  const handleGateClick = React.useCallback(
    (event: React.MouseEvent, gateId: string) => {
      try {
        event.stopPropagation();

        // Zustandストアで選択状態を管理
        const { selectGate, setSelectedGates, selectedGateIds } =
          useCircuitStore.getState();

        // Ctrl/Cmdキーで複数選択
        if (event.ctrlKey || event.metaKey) {
          if (selectedGateIds.includes(gateId)) {
            // 既に選択されている場合は選択解除
            setSelectedGates(selectedGateIds.filter(id => id !== gateId));
          } else {
            // 選択に追加
            setSelectedGates([...selectedGateIds, gateId]);
          }
        } else {
          // 単一選択
          setSelectedGates([gateId]);
          selectGate(gateId);
        }

        // ローカル状態も更新
        actions.handleGateClick(gateId);
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Gate click failed'),
          'UnifiedCanvas',
          {
            userAction: 'ゲートクリック',
            severity: 'medium',
            showToUser: true,
          }
        );
      }
    },
    [actions]
  );

  // タッチイベントハンドラー
  const handleTouchStart = React.useCallback(
    (event: React.TouchEvent<SVGSVGElement>) => {
      try {
        if (event.touches.length === 1 && canUsePan) {
          const touch = event.touches[0];
          panHandlers.handlePanStart(touch.clientX, touch.clientY);
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Touch start failed'),
          'UnifiedCanvas',
          {
            userAction: 'タッチ開始',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [canUsePan, panHandlers]
  );

  const handleTouchMove = React.useCallback(
    (event: React.TouchEvent<SVGSVGElement>) => {
      try {
        if (event.touches.length === 1 && panHandlers?.isPanning) {
          const touch = event.touches[0];
          panHandlers.handlePan(touch.clientX, touch.clientY);
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Touch move failed'),
          'UnifiedCanvas',
          {
            userAction: 'タッチ移動',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [panHandlers]
  );

  const handleTouchEnd = React.useCallback(() => {
    try {
      panHandlers.handlePanEnd();
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Touch end failed'),
        'UnifiedCanvas',
        {
          userAction: 'タッチ終了',
          severity: 'low',
          showToUser: false,
        }
      );
    }
  }, [panHandlers]);

  // ワイヤークリックハンドラー
  const handleWireClick = React.useCallback(
    (event: React.MouseEvent, wireId: string) => {
      try {
        event.stopPropagation();
        const wire = state.displayWires.find(w => w.id === wireId);
        if (wire) {
          handlers?.onWireClick?.(wireId, wire);
        }
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error('Wire click failed'),
          'UnifiedCanvas',
          {
            userAction: 'ワイヤークリック',
            severity: 'low',
            showToUser: false,
          }
        );
      }
    },
    [state.displayWires, handlers]
  );

  // CSS classes
  const canvasClasses = useMemo(
    () =>
      [
        'unified-canvas',
        `unified-canvas--${config.mode}`,
        `unified-canvas--${config.interactionLevel}`,
        state.isPanning && 'unified-canvas--panning',
        state.isDragging && 'unified-canvas--dragging',
        state.isAnimating && 'unified-canvas--animating',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [
      config.mode,
      config.interactionLevel,
      state.isPanning,
      state.isDragging,
      state.isAnimating,
      className,
    ]
  );

  return (
    <div className={canvasClasses} style={style}>
      {/* プレビューヘッダー（プレビューモード専用） */}
      {features.showControls && config.uiControls?.showPreviewHeader && (
        <CanvasPreviewHeader
          customGateName={
            config.previewOptions?.customGateName || 'カスタムゲート'
          }
          onExit={() => handlers?.onExitPreview?.()}
        />
      )}

      {/* メインSVGキャンバス */}
      <svg
        ref={svgRef}
        viewBox={viewBoxString}
        className="unified-canvas__svg"
        data-testid="canvas"
        preserveAspectRatio="xMidYMid meet"
        onClick={handleSvgClick}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onWheel={handleWheel}
        onDrop={gateManagement.handleDrop}
        onDragOver={gateManagement.handleDragOver}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 背景グリッド */}
        {features.showBackground && (
          <CanvasBackground viewBox={state.viewBox} />
        )}

        {/* ワイヤー描画 */}
        {state.displayWires.map(wire => (
          <WireComponent key={wire.id} wire={wire} gates={state.displayGates} />
        ))}

        {/* ゲート描画 */}
        {state.displayGates.map(gate => (
          <GateComponent
            key={gate.id}
            gate={gate}
            isHighlighted={highlightedGateId === gate.id}
            onInputClick={
              config.interactionLevel !== 'view_only'
                ? gateId => actions.toggleInput(gateId)
                : undefined
            }
          />
        ))}

        {/* エディターモード専用要素 */}
        {config.mode === 'editor' && (
          <>
            {/* 選択矩形 */}
            {selectionHandlers?.selectionRect && (
              <SelectionRect
                startX={selectionHandlers.selectionRect.startX}
                startY={selectionHandlers.selectionRect.startY}
                endX={selectionHandlers.selectionRect.endX}
                endY={selectionHandlers.selectionRect.endY}
                isSelecting={selectionHandlers.isSelecting}
              />
            )}

            {/* ワイヤー描画プレビュー */}
            {isDrawingWire && wireStart && (
              <WirePreview
                startX={wireStart.position.x}
                startY={wireStart.position.y}
                endX={currentMousePosition.x}
                endY={currentMousePosition.y}
              />
            )}
          </>
        )}
      </svg>

      {/* コントロールパネル */}
      {features.showControls && (
        <CanvasControls
          scale={config.mode === 'gallery' ? state.scale : zoomHandlers.scale}
          onZoomIn={
            config.mode === 'gallery'
              ? () => actions.setZoom(state.scale * 1.1)
              : zoomHandlers.zoomIn
          }
          onZoomOut={
            config.mode === 'gallery'
              ? () => actions.setZoom(state.scale * 0.9)
              : zoomHandlers.zoomOut
          }
          onResetZoom={
            config.mode === 'gallery'
              ? () => actions.setZoom(1)
              : zoomHandlers.resetZoom
          }
          hideWireStyleButton={config.mode === 'gallery'} // ギャラリーモードでは非表示
        />
      )}

      {/* デバッグ情報（開発時のみ） */}
      {config.galleryOptions?.showDebugInfo && import.meta.env.DEV && (
        <div className="unified-canvas__debug">
          <div>Mode: {config.mode}</div>
          <div>Gates: {state.displayGates.length}</div>
          <div>Wires: {state.displayWires.length}</div>
          <div>Scale: {zoomHandlers.scale.toFixed(2)}</div>
          <div>Animating: {state.isAnimating ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};
