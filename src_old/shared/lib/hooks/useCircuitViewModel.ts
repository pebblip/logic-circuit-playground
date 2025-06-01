/**
 * CircuitViewModelをReactで使用するためのカスタムフック
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CircuitViewModel } from '@/features/circuit-editor/model/CircuitViewModel';
import { GateType } from '@/entities/types/gate';
import { Position } from '@/entities/types/common';

export const useCircuitViewModel = () => {
  const [, forceUpdate] = useState({});
  const viewModelRef = useRef<CircuitViewModel>();

  // ViewModelの初期化
  if (!viewModelRef.current) {
    viewModelRef.current = new CircuitViewModel();
  }

  const viewModel = viewModelRef.current;

  // ViewModelのイベントをリッスンしてReactを再レンダリング
  useEffect(() => {
    const handleUpdate = () => forceUpdate({});

    // 再レンダリングが必要なイベント
    const events = [
      'gatesChanged',
      'connectionsChanged',
      'selectionChanged',
      'simulationCompleted',
      'cleared'
    ];

    events.forEach(event => viewModel.on(event, handleUpdate));

    // 初回シミュレーション
    viewModel.simulate();

    return () => {
      events.forEach(event => viewModel.off(event, handleUpdate));
    };
  }, [viewModel]);

  // UIアクション用のコールバック
  const addGate = useCallback((type: GateType, position: Position) => {
    viewModel.addGate(type, position);
    viewModel.simulate();
  }, [viewModel]);

  const removeGate = useCallback((gateId: string) => {
    viewModel.removeGate(gateId);
    viewModel.simulate();
  }, [viewModel]);

  const moveGate = useCallback((gateId: string, position: Position) => {
    viewModel.moveGate(gateId, position);
  }, [viewModel]);

  const addConnection = useCallback((
    fromGateId: string,
    fromOutputIndex: number,
    toGateId: string,
    toInputIndex: number
  ) => {
    const connection = viewModel.addConnection(
      fromGateId,
      fromOutputIndex,
      toGateId,
      toInputIndex
    );
    if (connection) {
      viewModel.simulate();
    }
    return connection;
  }, [viewModel]);

  const removeConnection = useCallback((connectionId: string) => {
    viewModel.removeConnection(connectionId);
    viewModel.simulate();
  }, [viewModel]);

  const selectGate = useCallback((gateId: string, multi: boolean = false) => {
    viewModel.selectGate(gateId, multi);
  }, [viewModel]);

  const clearSelection = useCallback(() => {
    viewModel.clearSelection();
  }, [viewModel]);

  const clear = useCallback(() => {
    viewModel.clear();
  }, [viewModel]);

  return {
    // State
    gates: viewModel.gates,
    connections: viewModel.connections,
    selectedGates: viewModel.selectedGates,
    isSimulating: viewModel.isSimulating,

    // Actions
    addGate,
    removeGate,
    moveGate,
    addConnection,
    removeConnection,
    selectGate,
    clearSelection,
    clear,

    // Direct access to ViewModel for advanced use
    viewModel
  };
};