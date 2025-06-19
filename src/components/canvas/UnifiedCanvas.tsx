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
import { handleError } from '@/infrastructure/errorHandler';
import { CANVAS_CONSTANTS } from './utils/canvasConstants';
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
  const {
    svgRef,
    state,
    transform,
    actions,
    features,
  } = useUnifiedCanvas(config, dataSource, handlers);
  
  // ViewBox管理用のローカル状態
  const [localViewBox, setLocalViewBox] = React.useState(state.viewBox);
  
  // エディターモード専用機能（実際のHookインターフェースに合わせて修正）
  const panHandlers = features.canPan && config.mode === 'editor' 
    ? useCanvasPan(svgRef, localViewBox, setLocalViewBox, state.scale)
    : null;
  
  const zoomHandlers = features.canZoom
    ? useCanvasZoom(svgRef, localViewBox, setLocalViewBox)
    : null;
  
  const selectionHandlers = features.canSelect && config.mode === 'editor'
    ? useCanvasSelection(state.displayGates, actions.setSelection, Array.from(state.selectedIds))
    : null;
  
  // ViewBox計算
  const viewBoxString = useMemo(() => {
    const { x, y, width, height } = state.viewBox;
    return `${x} ${y} ${width} ${height}`;
  }, [state.viewBox]);
  
  // イベントハンドラー統合
  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
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
  };
  
  const handleSvgMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    try {
      if (config.mode === 'editor' && panHandlers) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          panHandlers.handlePanStart(event.clientX, event.clientY);
        }
      }
      
      if (config.mode === 'editor' && selectionHandlers && !panHandlers?.isPanning) {
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
  };
  
  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    try {
      if (config.mode === 'editor' && panHandlers?.isPanning) {
        panHandlers.handlePan(event.clientX, event.clientY);
      }
      
      if (config.mode === 'editor' && selectionHandlers?.isSelecting) {
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
  };
  
  const handleSvgMouseUp = (event: React.MouseEvent<SVGSVGElement>) => {
    try {
      if (config.mode === 'editor' && panHandlers?.isPanning) {
        panHandlers.handlePanEnd();
      }
      
      if (config.mode === 'editor' && selectionHandlers?.isSelecting) {
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
  };
  
  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    try {
      if (features.canZoom && zoomHandlers) {
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
  };
  
  // ゲートクリックハンドラー
  const handleGateClick = (event: React.MouseEvent, gateId: string) => {
    try {
      event.stopPropagation();
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
  };
  
  // ワイヤークリックハンドラー
  const handleWireClick = (event: React.MouseEvent, wireId: string) => {
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
  };
  
  // CSS classes
  const canvasClasses = [
    'unified-canvas',
    `unified-canvas--${config.mode}`,
    `unified-canvas--${config.interactionLevel}`,
    state.isPanning && 'unified-canvas--panning',
    state.isDragging && 'unified-canvas--dragging',
    state.isAnimating && 'unified-canvas--animating',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={canvasClasses} style={style}>
      {/* プレビューヘッダー（プレビューモード専用） */}
      {features.showControls && config.uiControls?.showPreviewHeader && (
        <CanvasPreviewHeader 
          customGateName={config.previewOptions?.customGateName || 'カスタムゲート'}
          onExit={() => handlers?.onExitPreview?.()}
        />
      )}
      
      {/* メインSVGキャンバス */}
      <svg
        ref={svgRef}
        viewBox={viewBoxString}
        className="unified-canvas__svg"
        preserveAspectRatio="xMidYMid meet"
        onClick={handleSvgClick}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onWheel={handleWheel}
      >
        {/* 背景グリッド */}
        {features.showBackground && (
          <CanvasBackground viewBox={state.viewBox} />
        )}
        
        {/* ワイヤー描画 */}
        {state.displayWires.map(wire => (
          <WireComponent
            key={wire.id}
            wire={wire}
            gates={state.displayGates}
          />
        ))}
        
        {/* ゲート描画 */}
        {state.displayGates.map(gate => (
          <GateComponent
            key={gate.id}
            gate={gate}
            isHighlighted={highlightedGateId === gate.id}
            onInputClick={features.canEdit ? (gateId) => actions.handleGateClick(gateId) : undefined}
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
          </>
        )}
      </svg>
      
      {/* コントロールパネル */}
      {features.showControls && (
        <CanvasControls
          scale={state.scale}
          onZoomIn={() => actions.setZoom(Math.min(state.scale * 1.2, 5))}
          onZoomOut={() => actions.setZoom(Math.max(state.scale * 0.8, 0.1))}
          onResetZoom={() => actions.setZoom(1)}
        />
      )}
      
      {/* デバッグ情報（開発時のみ） */}
      {config.galleryOptions?.showDebugInfo && import.meta.env.DEV && (
        <div className="unified-canvas__debug">
          <div>Mode: {config.mode}</div>
          <div>Gates: {state.displayGates.length}</div>
          <div>Wires: {state.displayWires.length}</div>
          <div>Scale: {state.scale.toFixed(2)}</div>
          <div>Animating: {state.isAnimating ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};