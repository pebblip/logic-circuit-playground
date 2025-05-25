// リファクタリングされた論理回路ビルダーコンポーネント

import React, { useReducer, useCallback, useEffect } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { CANVAS } from '../constants/circuit';

// UIコンポーネント
import Canvas from './Circuit/Canvas';
import Toolbar from './UI/Toolbar';
import LevelPanel from './UI/LevelPanel';
import PropertiesPanel from './UI/PropertiesPanel';
import InfoPanel from './UI/InfoPanel';

/**
 * 論理回路ビルダーメインコンポーネント
 */
const LogicCircuitBuilderRefactored = () => {
  // 状態管理（useReducer）
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel, unlockedLevels, savedCircuits } = state;

  // カスタムフック
  const {
    simulation,
    autoMode,
    simulationSpeed,
    clockSignal,
    calculateCircuitWithGates,
    runCalculation,
    toggleAutoMode,
    updateSimulationSpeed,
    resetSimulation
  } = useCircuitSimulation(gates, connections);

  const {
    svgRef,
    draggedGate,
    connectionDrag,
    mousePosition,
    handleGateMouseDown,
    handleTerminalMouseDown,
    handleTerminalMouseUp,
    handleMouseMove,
    handleMouseUp
  } = useDragAndDrop((gateId, x, y) => {
    dispatch({ type: ACTIONS.MOVE_GATE, payload: { gateId, x, y } });
  });

  // ゲート追加
  const addGate = useCallback((type) => {
    const x = 400 + (Math.random() - 0.5) * 200;
    const y = 250 + (Math.random() - 0.5) * 100;
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { type, x, y, clockSignal } 
    });
  }, [clockSignal]);

  // INPUT値の切り替え
  const toggleInput = useCallback((gateId) => {
    // 現在のゲート状態を取得
    const gate = gates.find(g => g.id === gateId);
    if (!gate || gate.type !== 'INPUT') return;

    // 新しい値を計算
    const newValue = !gate.value;
    
    // まず入力値を更新
    const updatedGates = gates.map(g => 
      g.id === gateId ? { ...g, value: newValue } : g
    );
    
    // 更新されたゲートで回路を計算
    const newSimulation = calculateCircuitWithGates(updatedGates);
    
    // 全てのゲートの値を一度に更新
    const finalGates = updatedGates.map(g => ({
      ...g,
      value: g.type === 'INPUT' || g.type === 'CLOCK' 
        ? g.value 
        : (newSimulation[g.id] ?? g.value)
    }));
    
    dispatch({ type: ACTIONS.SET_GATES, payload: finalGates });
  }, [gates, calculateCircuitWithGates]);

  // クロック信号が変わったら回路を再計算（自動モード時）
  useEffect(() => {
    // ドラッグ中は更新をスキップ
    if (autoMode && !draggedGate) {
      // クロックゲートの値を更新
      const updatedGates = gates.map(gate => 
        gate.type === 'CLOCK' ? { ...gate, value: clockSignal } : gate
      );
      
      // 更新されたゲートで計算を実行
      const newSimulation = calculateCircuitWithGates(updatedGates);
      
      // OUTPUT と その他のゲートの値のみ更新
      const finalGates = updatedGates.map(gate => ({
        ...gate,
        value: gate.type === 'INPUT' || gate.type === 'CLOCK' 
          ? gate.value 
          : (newSimulation[gate.id] ?? gate.value)
      }));
      
      dispatch({ type: ACTIONS.SET_GATES, payload: finalGates });
    }
  }, [clockSignal, autoMode, gates, calculateCircuitWithGates, draggedGate]);

  // イベントハンドラー
  const handleGateClick = useCallback((e, gate) => {
    e.stopPropagation();
    dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: gate });
  }, []);

  const handleGateDoubleClick = useCallback((e, gate) => {
    e.stopPropagation();
    if (gate.type === 'INPUT') {
      toggleInput(gate.id);
    }
  }, [toggleInput]);

  const handleTerminalMouseUpWrapper = useCallback((e, toGate, inputIndex) => {
    const connection = handleTerminalMouseUp(e, toGate, inputIndex);
    if (connection) {
      dispatch({ type: ACTIONS.ADD_CONNECTION, payload: connection });
    }
  }, [handleTerminalMouseUp]);

  const handleCalculate = useCallback(() => {
    const newSimulation = runCalculation();
    
    // 計算結果でゲートの値を更新
    const updatedGates = gates.map(gate => ({
      ...gate,
      value: gate.type === 'INPUT' || gate.type === 'CLOCK'
        ? gate.value
        : (newSimulation[gate.id] ?? gate.value)
    }));
    
    dispatch({ type: ACTIONS.SET_GATES, payload: updatedGates });
  }, [gates, runCalculation]);

  const handleReset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
    resetSimulation();
  }, [resetSimulation]);

  const handleConnectionDelete = useCallback((index) => {
    dispatch({ type: ACTIONS.REMOVE_CONNECTION, payload: { index } });
  }, []);

  const handleCanvasClick = useCallback(() => {
    dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
  }, []);

  const handleLevelSelect = useCallback((level) => {
    dispatch({ type: ACTIONS.SET_CURRENT_LEVEL, payload: level });
  }, []);

  const handleSaveCircuit = useCallback((name) => {
    dispatch({ type: ACTIONS.SAVE_CIRCUIT, payload: { name } });
  }, []);

  const handleLoadCircuit = useCallback((circuit) => {
    dispatch({ type: ACTIONS.LOAD_CIRCUIT, payload: { circuit } });
    resetSimulation();
  }, [resetSimulation]);

  // キーボードイベント処理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedGate) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          dispatch({ 
            type: ACTIONS.REMOVE_GATE, 
            payload: { gateId: selectedGate.id } 
          });
        } else if (e.key === 'Escape') {
          dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Logic Circuit Builder</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="text-sm">ヘルプ</span>
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <span className="text-sm">設定</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3rem)]">
        {/* 左パネル: レベル選択 */}
        <LevelPanel
          currentLevel={currentLevel}
          unlockedLevels={unlockedLevels}
          onLevelSelect={handleLevelSelect}
        />

        {/* メインエリア */}
        <div className="flex-1 flex flex-col">
          {/* ツールバー */}
          <Toolbar
            currentLevel={currentLevel}
            unlockedLevels={unlockedLevels}
            gates={gates}
            autoMode={autoMode}
            simulationSpeed={simulationSpeed}
            clockSignal={clockSignal}
            onAddGate={addGate}
            onToggleInput={toggleInput}
            onCalculate={handleCalculate}
            onToggleAutoMode={toggleAutoMode}
            onUpdateSpeed={updateSimulationSpeed}
            onReset={handleReset}
          />

          {/* キャンバス */}
          <Canvas
            gates={gates}
            connections={connections}
            simulation={simulation}
            selectedGate={selectedGate}
            connectionDrag={connectionDrag}
            mousePosition={mousePosition}
            svgRef={svgRef}
            onGateClick={handleGateClick}
            onGateDoubleClick={handleGateDoubleClick}
            onGateMouseDown={handleGateMouseDown}
            onTerminalMouseDown={handleTerminalMouseDown}
            onTerminalMouseUp={handleTerminalMouseUpWrapper}
            onConnectionDelete={handleConnectionDelete}
            onCanvasClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />

          {/* 情報パネル */}
          <InfoPanel
            currentLevel={currentLevel}
            selectedGate={selectedGate}
          />
        </div>

        {/* 右パネル: プロパティ */}
        <PropertiesPanel
          selectedGate={selectedGate}
          savedCircuits={savedCircuits}
          onLoadCircuit={handleLoadCircuit}
          onSaveCircuit={handleSaveCircuit}
        />
      </div>
    </div>
  );
};

export default LogicCircuitBuilderRefactored;