import { useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';

export const useKeyboardShortcuts = () => {
  const { undo, redo, canUndo, canRedo, selectedGateId, deleteGate, deleteWire } = useCircuitStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーム要素にフォーカスがある場合はショートカットを無効化
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y: Redo
      if (
        ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'z') ||
        ((event.metaKey || event.ctrlKey) && event.key === 'y')
      ) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Delete or Backspace: Delete selected gate
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedGateId) {
        event.preventDefault();
        deleteGate(selectedGateId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo, selectedGateId, deleteGate]);
};