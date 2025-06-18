import { useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { clientToSVGCoordinates } from '@infrastructure/ui/svgCoordinates';

// 保存ダイアログを開くためのグローバルイベント
export const OPEN_SAVE_DIALOG_EVENT = 'openSaveDialog';

export const useKeyboardShortcuts = () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    selectedGateId,
    selectedGateIds,
    deleteGate,
    deleteWire: _deleteWire,
    copySelection,
    paste,
    canPaste,
    gates,
    setSelectedGates,
    clearSelection,
    isDrawingWire,
    cancelWireDrawing,
  } = useCircuitStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーム要素にフォーカスがある場合はショートカットを無効化
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y: Redo
      if (
        ((event.metaKey || event.ctrlKey) &&
          event.shiftKey &&
          event.key === 'z') ||
        ((event.metaKey || event.ctrlKey) && event.key === 'y')
      ) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Delete or Backspace: Delete selected gate(s)
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        (selectedGateId || selectedGateIds.length > 0)
      ) {
        event.preventDefault();
        if (selectedGateIds.length > 0) {
          selectedGateIds.forEach(id => deleteGate(id));
        } else if (selectedGateId) {
          deleteGate(selectedGateId);
        }
      }

      // Cmd/Ctrl + S: Save circuit
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        // カスタムイベントを発火して保存ダイアログを開く
        window.dispatchEvent(new CustomEvent(OPEN_SAVE_DIALOG_EVENT));
      }

      // Cmd/Ctrl + C: Copy
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'c' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (selectedGateIds.length > 0) {
          copySelection();
        }
      }

      // Cmd/Ctrl + V: Paste
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'v' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (canPaste()) {
          // キャンバスの表示中心にペースト
          const canvas = document.querySelector('svg.circuit-canvas') as SVGSVGElement;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            // viewBoxを考慮して実際のSVG座標に変換
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const svgPoint = clientToSVGCoordinates(centerX, centerY, canvas);
            if (svgPoint) {
              paste({ x: svgPoint.x, y: svgPoint.y });
            }
          }
        }
      }

      // Cmd/Ctrl + A: Select All
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'a' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        const allGateIds = gates && Array.isArray(gates) ? gates.map(gate => gate.id) : [];
        setSelectedGates(allGateIds);
      }

      // Escape: Clear selection or cancel wire drawing
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isDrawingWire) {
          cancelWireDrawing();
        } else if (selectedGateIds.length > 0 || selectedGateId) {
          clearSelection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedGateId,
    selectedGateIds,
    deleteGate,
    copySelection,
    paste,
    canPaste,
    gates,
    setSelectedGates,
    clearSelection,
    isDrawingWire,
    cancelWireDrawing,
  ]);
};
