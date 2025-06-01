import { useCallback, useState, useEffect } from 'react';
import { useCircuitStore } from './stores/circuitStore';
import { GateType, Position } from '../../../entities/types';
import { GateFactory } from '../../../entities/gates';

interface DrawingConnection {
  from: {
    gateId: string;
    pinId: string;
  };
  tempEnd: {
    x: number;
    y: number;
  };
}

/**
 * Zustandストアを使用したCircuitViewModelフック
 * 既存のインターフェースを維持しながら、内部ではZustandを使用
 */
export const useCircuitViewModel = () => {
  const {
    viewModel,
    gates,
    connections,
    selectedGateId,
    addGate: storeAddGate,
    setSelectedGate,
    toggleInputGate,
    moveGate,
    deleteSelection,
    connectPins,
    syncFromViewModel
  } = useCircuitStore();

  const [drawingConnection, setDrawingConnection] = useState<DrawingConnection | null>(null);

  // 初期同期
  useEffect(() => {
    syncFromViewModel();
  }, [syncFromViewModel]);

  // ゲートの追加
  const addGate = useCallback((type: GateType, position: Position) => {
    // ViewModelを通じてゲートを追加（返り値を利用）
    const gateData = viewModel.addGateByType(type, position);
    return gateData;
  }, [viewModel]);

  // ゲートの選択
  const selectGate = useCallback((gateId: string | null) => {
    setSelectedGate(gateId);
  }, [setSelectedGate]);

  // ゲートの更新（主に位置の更新）
  const updateGate = useCallback((gateId: string, updates: { position?: Position }) => {
    if (updates.position) {
      moveGate(gateId, updates.position.x, updates.position.y);
    }
  }, [moveGate]);

  // ゲートの削除
  const deleteGate = useCallback((gateId: string) => {
    if (selectedGateId === gateId) {
      deleteSelection();
    } else {
      // 選択してから削除
      setSelectedGate(gateId);
      setTimeout(() => deleteSelection(), 0);
    }
  }, [selectedGateId, deleteSelection, setSelectedGate]);

  // 接続開始
  const startConnection = useCallback((gateId: string, pinId: string, x: number, y: number) => {
    setDrawingConnection({
      from: { gateId, pinId },
      tempEnd: { x, y }
    });
  }, []);

  // 接続中の座標更新
  const updateConnectionEnd = useCallback((x: number, y: number) => {
    if (drawingConnection) {
      setDrawingConnection({
        ...drawingConnection,
        tempEnd: { x, y }
      });
    }
  }, [drawingConnection]);

  // 接続完了
  const finishConnection = useCallback((gateId: string, pinId: string) => {
    if (!drawingConnection) return;
    
    // 同じピンには接続しない
    if (drawingConnection.from.gateId === gateId && drawingConnection.from.pinId === pinId) {
      setDrawingConnection(null);
      return;
    }
    
    connectPins(drawingConnection.from.pinId, pinId);
    setDrawingConnection(null);
  }, [drawingConnection, connectPins]);

  // 接続キャンセル
  const cancelConnection = useCallback(() => {
    setDrawingConnection(null);
  }, []);

  // 未使用だがインターフェース互換性のため
  const simulateCircuit = useCallback(() => {
    // ViewModelが自動的にシミュレーションを実行するため、ここでは何もしない
  }, []);

  return {
    gates,
    connections,
    drawingConnection,
    selectedGateId,
    addGate,
    selectGate,
    updateGate,
    deleteGate,
    startConnection,
    updateConnectionEnd,
    finishConnection,
    cancelConnection,
    toggleInputGate,
    simulateCircuit,
  };
};