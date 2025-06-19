import type React from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';

interface UseGateEventsResult {
  isSelected: boolean;
  handleGateClick: (event: React.MouseEvent, hasDragged: boolean) => void;
  handleInputClick: (event: React.MouseEvent, hasDragged: boolean) => void;
  handleInputDoubleClick: (
    event: React.MouseEvent,
    hasDragged: boolean
  ) => void;
}

export function useGateEvents(gate: Gate): UseGateEventsResult {
  const {
    selectGate,
    selectedGateId,
    selectedGateIds,
    addToSelection,
    removeFromSelection,
    updateGateOutput,
    selectedClockGateId,
    setSelectedClockGate,
  } = useCircuitStore();

  const isSelected =
    selectedGateId === gate.id || (selectedGateIds && Array.isArray(selectedGateIds) ? selectedGateIds.includes(gate.id) : false);

  const handleGateClick = (event: React.MouseEvent, hasDragged: boolean) => {
    event.stopPropagation();

    // ドラッグした場合はクリックイベントを無視
    if (hasDragged) {
      return;
    }

    // CLOCKゲートの特別な処理
    if (gate.type === 'CLOCK') {
      // CLOCKゲートを選択
      selectGate(gate.id);
      // タイミングチャート用にCLOCKゲートを選択
      setSelectedClockGate(gate.id);
      return;
    }

    // Shift/Ctrl/Cmdキーが押されている場合の複数選択
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      if (selectedGateIds.includes(gate.id)) {
        removeFromSelection(gate.id);
      } else {
        addToSelection(gate.id);
      }
    } else {
      // 通常のクリックは単一選択
      selectGate(gate.id);
    }
  };

  const handleInputClick = (event: React.MouseEvent, hasDragged: boolean) => {
    event.stopPropagation();
    // シングルクリックでは選択のみ
    if (gate.type === 'INPUT' && !hasDragged) {
      selectGate(gate.id);
    }
  };

  const handleInputDoubleClick = (
    event: React.MouseEvent,
    hasDragged: boolean
  ) => {
    event.stopPropagation();
    // ダブルクリックでスイッチ切り替え
    if (gate.type === 'INPUT' && !hasDragged) {
      updateGateOutput(gate.id, !gate.output);
    }
  };

  return {
    isSelected,
    handleGateClick,
    handleInputClick,
    handleInputDoubleClick,
  };
}
