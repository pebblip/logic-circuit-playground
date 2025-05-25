// モダンなUIの論理回路ビルダーコンポーネント

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useHistory } from '../hooks/useHistory';
import { CANVAS } from '../constants/circuit';
import { layout, colors, shadows } from '../styles/design-tokens';

// UIコンポーネント
import Canvas from './Circuit/Canvas';
import Toolbar from './UI/Toolbar';
import LevelPanel from './UI/LevelPanel';
import PropertiesPanel from './UI/PropertiesPanel';
import InfoPanel from './UI/InfoPanel';

/**
 * モダンUI版論理回路ビルダー
 */
const LogicCircuitBuilder = () => {
  // 状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel, unlockedLevels, savedCircuits } = state;
  
  // UIの状態
  const [bottomPanelHeight, setBottomPanelHeight] = useState(layout.bottomPanel.defaultHeight);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  
  // 履歴管理
  const {
    pushState,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo
  } = useHistory({ gates, connections });
  
  // Undo/Redo処理
  const undo = useCallback(() => {
    const result = undoHistory();
    if (result && result.state) {
      dispatch({ type: ACTIONS.SET_GATES, payload: result.state.gates });
      dispatch({ type: ACTIONS.SET_CONNECTIONS, payload: result.state.connections });
    }
  }, [undoHistory]);

  const redo = useCallback(() => {
    const result = redoHistory();
    if (result && result.state) {
      dispatch({ type: ACTIONS.SET_GATES, payload: result.state.gates });
      dispatch({ type: ACTIONS.SET_CONNECTIONS, payload: result.state.connections });
    }
  }, [redoHistory]);
  
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
  
  // 状態変更を履歴に保存
  const isFirstRender = useRef(true);
  const prevStateRef = useRef({ gates, connections });
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const hasGatesChanged = JSON.stringify(prevStateRef.current.gates) !== JSON.stringify(gates);
    const hasConnectionsChanged = JSON.stringify(prevStateRef.current.connections) !== JSON.stringify(connections);
    
    if ((hasGatesChanged || hasConnectionsChanged) && !draggedGate && !connectionDrag && !autoMode) {
      pushState({ gates, connections });
      prevStateRef.current = { gates, connections };
    }
  }, [gates, connections, draggedGate, connectionDrag, autoMode, pushState]);

  // ゲート追加
  const addGate = useCallback((type) => {
    const gridSize = 20;
    const baseX = 500;
    const baseY = 300;
    const randomOffsetX = Math.floor((Math.random() - 0.5) * 10) * gridSize;
    const randomOffsetY = Math.floor((Math.random() - 0.5) * 5) * gridSize;
    
    const x = baseX + randomOffsetX;
    const y = baseY + randomOffsetY;
    
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { type, x, y, clockSignal } 
    });
  }, [clockSignal]);

  // INPUT値の切り替え
  const toggleInput = useCallback((gateId) => {
    const gate = gates.find(g => g.id === gateId);
    if (!gate || gate.type !== 'INPUT') return;

    const newValue = !gate.value;
    
    const updatedGates = gates.map(g => 
      g.id === gateId ? { ...g, value: newValue } : g
    );
    
    const newSimulation = calculateCircuitWithGates(updatedGates);
    
    const finalGates = updatedGates.map(g => ({
      ...g,
      value: g.type === 'INPUT' || g.type === 'CLOCK' 
        ? g.value 
        : (newSimulation[g.id] ?? g.value)
    }));
    
    dispatch({ type: ACTIONS.SET_GATES, payload: finalGates });
  }, [gates, calculateCircuitWithGates]);

  // クロック信号の自動更新
  useEffect(() => {
    if (autoMode && !draggedGate && clockSignal !== undefined) {
      const updatedGates = gates.map(gate => 
        gate.type === 'CLOCK' ? { ...gate, value: clockSignal } : gate
      );
      
      const hasClockGate = gates.some(g => g.type === 'CLOCK');
      const clockValueChanged = gates.some(g => g.type === 'CLOCK' && g.value !== clockSignal);
      
      if (hasClockGate && clockValueChanged) {
        const newSimulation = calculateCircuitWithGates(updatedGates);
        
        const finalGates = updatedGates.map(gate => ({
          ...gate,
          value: gate.type === 'INPUT' || gate.type === 'CLOCK' 
            ? gate.value 
            : (newSimulation[gate.id] ?? gate.value)
        }));
        
        dispatch({ type: ACTIONS.SET_GATES, payload: finalGates });
      }
    }
  }, [clockSignal, autoMode, draggedGate]);

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

  // キーボードイベント
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

  // パネルリサイズ
  const handlePanelResize = useCallback((e) => {
    if (!isDraggingPanel) return;
    
    const containerHeight = window.innerHeight - layout.toolbar.height;
    const newHeight = containerHeight - e.clientY;
    const clampedHeight = Math.max(
      parseInt(layout.bottomPanel.minHeight),
      Math.min(parseInt(layout.bottomPanel.maxHeight), newHeight)
    );
    
    setBottomPanelHeight(`${clampedHeight}px`);
  }, [isDraggingPanel]);

  useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handlePanelResize);
      document.addEventListener('mouseup', () => setIsDraggingPanel(false));
      return () => {
        document.removeEventListener('mousemove', handlePanelResize);
        document.removeEventListener('mouseup', () => setIsDraggingPanel(false));
      };
    }
  }, [isDraggingPanel, handlePanelResize]);

  return (
    <div 
      className="h-screen overflow-hidden"
      style={{ backgroundColor: colors.ui.background }}
    >
      {/* ツールバー */}
      <div 
        style={{ 
          height: layout.toolbar.height,
          backgroundColor: colors.ui.surface,
          borderBottom: `1px solid ${colors.ui.border}`,
          boxShadow: shadows.sm
        }}
      >
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
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* メインコンテンツ */}
      <div 
        className="flex"
        style={{ height: `calc(100vh - ${layout.toolbar.height} - ${bottomPanelHeight})` }}
      >
        {/* 左パネル */}
        <div 
          style={{ 
            width: layout.leftPanel.width,
            minWidth: layout.leftPanel.minWidth,
            backgroundColor: colors.ui.surface,
            borderRight: `1px solid ${colors.ui.border}`,
            boxShadow: shadows.sm
          }}
        >
          <LevelPanel
            currentLevel={currentLevel}
            unlockedLevels={unlockedLevels}
            onLevelSelect={handleLevelSelect}
          />
        </div>

        {/* キャンバス */}
        <div className="flex-1 overflow-auto">
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
        </div>

        {/* 右パネル */}
        <div 
          style={{ 
            width: layout.rightPanel.width,
            minWidth: layout.rightPanel.minWidth,
            backgroundColor: colors.ui.surface,
            borderLeft: `1px solid ${colors.ui.border}`,
            boxShadow: shadows.sm
          }}
        >
          <PropertiesPanel
            selectedGate={selectedGate}
            savedCircuits={savedCircuits}
            onLoadCircuit={handleLoadCircuit}
            onSaveCircuit={handleSaveCircuit}
          />
        </div>
      </div>

      {/* 下部パネル（リサイズ可能） */}
      <div 
        style={{ 
          height: bottomPanelHeight,
          backgroundColor: colors.ui.surface,
          borderTop: `1px solid ${colors.ui.border}`,
          boxShadow: shadows.md
        }}
      >
        {/* リサイズハンドル */}
        <div
          className="h-1 cursor-ns-resize hover:bg-blue-500 transition-colors"
          style={{ backgroundColor: colors.ui.border }}
          onMouseDown={() => setIsDraggingPanel(true)}
        />
        
        <InfoPanel
          currentLevel={currentLevel}
          selectedGate={selectedGate}
          gates={gates}
          connections={connections}
          height={`calc(${bottomPanelHeight} - 4px)`}
        />
      </div>
    </div>
  );
};

export default LogicCircuitBuilder;