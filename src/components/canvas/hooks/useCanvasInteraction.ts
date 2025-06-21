/**
 * Canvasのインタラクション処理フック
 * マウス・タッチイベント、ドラッグ&ドロップ、選択操作を管理
 */

import type React from 'react';
import type { RefObject } from 'react';
import { useEffect, useCallback } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import {
  reactEventToSVGCoordinates,
  mouseEventToSVGCoordinates,
} from '@infrastructure/ui/svgCoordinates';
import { isGateElement } from '../utils/canvasHelpers';
import type { SelectionRect } from '@/hooks/useCanvasSelection';

interface UseCanvasInteractionProps {
  svgRef: RefObject<SVGSVGElement>;
  selectedGateIds: string[];
  isSelecting: boolean;
  selectionRect: SelectionRect | null;
  selectionJustFinished: React.MutableRefObject<boolean>;
  isDraggingSelection: boolean;
  dragStart: { x: number; y: number } | null;
  initialGatePositions: Map<string, { x: number; y: number }>;
  initialSelectionRect: SelectionRect | null;
  isSpacePressed: boolean;
  isPanning: boolean;
  isDrawingWire: boolean;
  isReadOnly: boolean;
  setMousePosition: (pos: { x: number; y: number }) => void;
  setIsDraggingSelection: (value: boolean) => void;
  setDragStart: (value: { x: number; y: number } | null) => void;
  setInitialGatePositions: (
    value: Map<string, { x: number; y: number }>
  ) => void;
  setInitialSelectionRect: (value: SelectionRect | null) => void;
  handlePan: (x: number, y: number) => void;
  handlePanStart: (x: number, y: number) => void;
  handlePanEnd: () => void;
  updateSelection: (x: number, y: number) => void;
  startSelection: (x: number, y: number) => void;
  endSelection: () => void;
  setSelectionRect: (rect: SelectionRect) => void;
  handleZoom: (delta: number, x: number, y: number) => void;
  clearSelection: () => void;
  clearSelectionRect: () => void;
  cancelWireDrawing: () => void;
}

export const useCanvasInteraction = ({
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
  isReadOnly,
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
}: UseCanvasInteractionProps) => {
  const { gates } = useCircuitStore();

  // クリック位置が選択されたゲート上にあるかを判定
  const isClickOnSelectedGate = useCallback(
    (x: number, y: number): boolean => {
      if (selectedGateIds.length === 0) return false;

      // ゲートのヒットボックスサイズ（大まかな判定用）
      const GATE_WIDTH = 70;
      const GATE_HEIGHT = 50;

      return gates.some(gate => {
        if (!selectedGateIds.includes(gate.id)) return false;

        const left = gate.position.x - GATE_WIDTH / 2;
        const right = gate.position.x + GATE_WIDTH / 2;
        const top = gate.position.y - GATE_HEIGHT / 2;
        const bottom = gate.position.y + GATE_HEIGHT / 2;

        return x >= left && x <= right && y >= top && y <= bottom;
      });
    },
    [gates, selectedGateIds]
  );

  // クリック位置が選択矩形内にあるかを判定
  const isClickInSelectionRect = useCallback(
    (x: number, y: number): boolean => {
      if (!selectionRect || selectedGateIds.length === 0) return false;

      // selectionRectは既に正規化されているので直接使用
      return (
        x >= selectionRect.startX &&
        x <= selectionRect.endX &&
        y >= selectionRect.startY &&
        y <= selectionRect.endY
      );
    },
    [selectionRect, selectedGateIds]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
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
    },
    [
      svgRef,
      isPanning,
      isSelecting,
      setMousePosition,
      handlePan,
      updateSelection,
    ]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      // プレビューモードでは操作不可
      if (isReadOnly) {
        return;
      }

      // ドラッグ中の場合はクリックイベントを無視
      if (isDraggingSelection) {
        return;
      }

      // 矩形選択直後のクリックは無視（ドラッグによる選択の場合）
      if (selectionJustFinished.current) {
        selectionJustFinished.current = false;
        return;
      }

      const target = event.target as SVGElement;

      // ゲート要素かどうかをチェック
      const isGate = isGateElement(target, svgRef);

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
    },
    [
      isReadOnly,
      isDraggingSelection,
      selectionJustFinished,
      svgRef,
      isDrawingWire,
      cancelWireDrawing,
      clearSelection,
      clearSelectionRect,
    ]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      handleZoom(-event.deltaY, event.clientX, event.clientY);
    },
    [handleZoom]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as SVGElement;
      const isGate = isGateElement(target, svgRef);

      if (!svgRef.current) return;
      const svgPoint = reactEventToSVGCoordinates(event, svgRef.current);
      if (!svgPoint) return;

      // スペース+左クリックでパン（優先的に処理）
      if (event.button === 0 && isSpacePressed) {
        handlePanStart(event.clientX, event.clientY);
        return; // 他の処理を実行しない
      }

      // 選択されたゲート上または選択矩形内でのクリック（ドラッグ開始）
      if (
        event.button === 0 &&
        selectedGateIds.length > 0 &&
        (isClickOnSelectedGate(svgPoint.x, svgPoint.y) ||
          isClickInSelectionRect(svgPoint.x, svgPoint.y))
      ) {
        setIsDraggingSelection(true);
        setDragStart({ x: svgPoint.x, y: svgPoint.y });

        // 初期ゲート位置を記録
        const positions = new Map<string, { x: number; y: number }>();
        gates.forEach(gate => {
          if (selectedGateIds.includes(gate.id)) {
            positions.set(gate.id, { x: gate.position.x, y: gate.position.y });
          }
        });
        setInitialGatePositions(positions);

        // 初期選択矩形位置を記録（そのまま記録）
        if (selectionRect) {
          setInitialSelectionRect({ ...selectionRect });
        }

        return;
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
        startSelection(svgPoint.x, svgPoint.y);
      }
    },
    [
      svgRef,
      isSpacePressed,
      selectedGateIds,
      gates,
      selectionRect,
      isDrawingWire,
      isClickOnSelectedGate,
      isClickInSelectionRect,
      handlePanStart,
      startSelection,
      setIsDraggingSelection,
      setDragStart,
      setInitialGatePositions,
      setInitialSelectionRect,
    ]
  );

  const handleMouseUp = useCallback(() => {
    handlePanEnd();

    // 選択矩形終了時の処理
    if (isSelecting) {
      endSelection();
    }

    // 選択されたゲート群のドラッグ終了
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      setDragStart(null);
      setInitialGatePositions(new Map());
      setInitialSelectionRect(null);
      // 履歴に保存
      const { saveToHistory } = useCircuitStore.getState();
      saveToHistory();
    }
  }, [
    handlePanEnd,
    isSelecting,
    endSelection,
    isDraggingSelection,
    setIsDraggingSelection,
    setDragStart,
    setInitialGatePositions,
    setInitialSelectionRect,
  ]);

  // タッチイベント（モバイル用）
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const target = event.target as Element;

        // ゲート要素をタッチした場合はパンを開始しない
        if (!isGateElement(target, svgRef)) {
          handlePanStart(touch.clientX, touch.clientY);
        }
      }
    },
    [svgRef, handlePanStart]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 1 && isPanning) {
        const touch = event.touches[0];
        handlePan(touch.clientX, touch.clientY);
      }
    },
    [isPanning, handlePan]
  );

  const handleTouchEnd = useCallback(() => {
    handlePanEnd();
  }, [handlePanEnd]);

  // グローバルイベントリスナー
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isPanning) {
        handlePan(event.clientX, event.clientY);
      }

      // 選択されたゲート群のドラッグ中の処理
      if (
        isDraggingSelection &&
        dragStart &&
        svgRef.current &&
        initialGatePositions.size > 0
      ) {
        const svgPoint = mouseEventToSVGCoordinates(event, svgRef.current);
        if (!svgPoint) return;

        const deltaX = svgPoint.x - dragStart.x;
        const deltaY = svgPoint.y - dragStart.y;

        // 初期位置からの絶対的な移動を計算
        const newGates = gates.map(gate => {
          const initialPos = initialGatePositions.get(gate.id);
          if (initialPos && selectedGateIds.includes(gate.id)) {
            return {
              ...gate,
              position: {
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              },
            };
          }
          return gate;
        });

        // 状態を更新
        useCircuitStore.setState({ gates: newGates });

        // 選択矩形も移動（正規化された状態を維持）
        if (initialSelectionRect) {
          const newRect = {
            startX: initialSelectionRect.startX + deltaX,
            startY: initialSelectionRect.startY + deltaY,
            endX: initialSelectionRect.endX + deltaX,
            endY: initialSelectionRect.endY + deltaY,
          };
          setSelectionRect(newRect);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isPanning) {
        handlePanEnd();
      }

      // 選択されたゲート群のドラッグ終了
      if (isDraggingSelection) {
        setIsDraggingSelection(false);
        setDragStart(null);
        setInitialGatePositions(new Map());
        setInitialSelectionRect(null);
        // 履歴に保存
        const { saveToHistory } = useCircuitStore.getState();
        saveToHistory();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [
    isPanning,
    handlePan,
    handlePanEnd,
    isDraggingSelection,
    dragStart,
    selectedGateIds,
    gates,
    initialGatePositions,
    initialSelectionRect,
    svgRef,
    setSelectionRect,
    setIsDraggingSelection,
    setDragStart,
    setInitialGatePositions,
    setInitialSelectionRect,
  ]);

  return {
    handleMouseMove,
    handleClick,
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
