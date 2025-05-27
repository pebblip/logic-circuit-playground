// 革新的なUI/UX - Logic Circuit Builder V3

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useHistory } from '../hooks/useHistory';
import { useEducation } from '../hooks/useEducation';
import { useErrorFeedback } from '../hooks/useErrorFeedback';
import { TUTORIAL_STEPS, LEARNING_OBJECTIVES } from '../constants/education';

// 新UIコンポーネント
import UltraMinimalHeader from './UI/UltraMinimalHeader';
import QuickAccessBar from './UI/QuickAccessBar';
import RadialMenu from './UI/RadialMenu';
import SmartHints from './UI/SmartHints';
import DockToolbar from './UI/DockToolbar';
import Canvas from './Circuit/Canvas';
import FloatingHelpWindow from './UI/FloatingHelpWindow';
import ErrorFeedback from './Education/ErrorFeedback';
import SlideInPanel from './UI/SlideInPanel';
import TutorialOverlay from './Education/TutorialOverlay';

const LogicCircuitBuilderV3 = () => {
  // 状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel, unlockedLevels } = state;
  
  // UI状態
  const [darkMode, setDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [radialMenuPosition, setRadialMenuPosition] = useState(null);
  const [showQuickAccess, setShowQuickAccess] = useState(true);
  const [showDock, setShowDock] = useState(false);
  const [mode, setMode] = useState('sandbox');
  const [currentHint, setCurrentHint] = useState(null);
  const [showTutorialPanel, setShowTutorialPanel] = useState(false);
  
  // カスタムフック
  const {
    simulation,
    autoMode,
    simulationSpeed,
    clockSignal,
    runCalculation,
    toggleAutoMode,
    resetSimulation
  } = useCircuitSimulation(gates, connections);
  
  const {
    pushState,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo
  } = useHistory({ gates, connections });
  
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
  
  const {
    progress,
    earnedBadges,
    learningMode,
    currentTutorial,
    tutorialStep,
    setLearningMode,
    startTutorial,
    nextTutorialStep,
    completeTutorial,
    getCurrentTutorialStep,
    validateTutorialStep
  } = useEducation();
  
  const currentStep = getCurrentTutorialStep();
  const isStepCompleted = currentStep ? validateTutorialStep(state) : false;
  
  const {
    errors,
    dismissError,
    applyAutoFix,
    hasErrors
  } = useErrorFeedback(gates, connections, null);
  
  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space: クイックアクセス表示/非表示
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowQuickAccess(prev => !prev);
        }
      }
      
      // Tab: ドック表示/非表示
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowDock(prev => !prev);
      }
      
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      
      // Delete: 選択中のゲートを削除
      if (e.key === 'Delete' && selectedGate) {
        handleDeleteGate(selectedGate.id);
      }
      
      // Escape: すべてを閉じる
      if (e.key === 'Escape') {
        dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
        setRadialMenuPosition(null);
        setShowTutorialPanel(false);
      }
      
      // 数字キー 1-3: クイックゲート追加
      if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey) {
        const gateTypes = ['AND', 'OR', 'NOT'];
        const gateType = gateTypes[parseInt(e.key) - 1];
        if (gateType) {
          addGateAtCenter(gateType);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGate]);
  
  // スマートヒント管理
  useEffect(() => {
    // 初回ユーザー向けヒント
    if (gates.length === 0 && !currentHint) {
      setCurrentHint({
        text: '右クリックでメニューを開く、またはスペースキーでクイックアクセス',
        position: 'center'
      });
    } else if (gates.length === 1 && gates[0].type !== 'INPUT' && gates[0].type !== 'OUTPUT') {
      setCurrentHint({
        text: '入力と出力を追加して回路を完成させましょう',
        position: 'top'
      });
    } else if (hasErrors('error')) {
      setCurrentHint({
        text: 'エラーがあります。赤い枠のゲートを確認してください',
        position: 'bottom',
        type: 'error'
      });
    } else {
      setCurrentHint(null);
    }
  }, [gates, hasErrors, currentHint]);
  
  // ゲート追加（中央に配置）
  const addGateAtCenter = useCallback((type) => {
    const canvasRect = svgRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 : 400;
    const centerY = canvasRect ? canvasRect.height / 2 : 300;
    
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { 
        type, 
        x: Math.round(centerX / 20) * 20, 
        y: Math.round(centerY / 20) * 20,
        clockSignal: type === 'CLOCK' ? clockSignal : undefined
      }
    });
  }, [svgRef, clockSignal]);
  
  // ゲート追加（マウス位置）
  const addGateAtPosition = useCallback((type, x, y) => {
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { 
        type, 
        x: Math.round(x / 20) * 20, 
        y: Math.round(y / 20) * 20,
        clockSignal: type === 'CLOCK' ? clockSignal : undefined
      }
    });
    setRadialMenuPosition(null);
  }, [clockSignal]);
  
  // ゲート削除
  const handleDeleteGate = useCallback((gateId) => {
    dispatch({ type: ACTIONS.REMOVE_GATE, payload: gateId });
  }, []);
  
  // 入力トグル
  const toggleInput = useCallback((gateId) => {
    dispatch({ type: ACTIONS.UPDATE_GATE_VALUE, payload: { gateId } });
  }, []);
  
  // リセット
  const handleReset = useCallback(() => {
    resetSimulation();
    dispatch({ type: ACTIONS.RESET });
  }, [resetSimulation]);
  
  // Undo/Redo
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
  
  // ゲートクリック
  const handleGateClick = useCallback((e, gate) => {
    dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: gate });
  }, []);
  
  // ゲートダブルクリック
  const handleGateDoubleClick = useCallback((e, gate) => {
    if (gate && gate.type === 'INPUT') {
      toggleInput(gate.id);
    }
  }, [toggleInput]);
  
  // 右クリックメニュー（ラジアルメニュー）
  const handleContextMenu = useCallback((e, gateId) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setRadialMenuPosition({
        x: e.clientX,
        y: e.clientY,
        canvasX: e.clientX - rect.left,
        canvasY: e.clientY - rect.top,
        gateId
      });
    }
  }, [svgRef]);
  
  // キャンバスクリック
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
      setRadialMenuPosition(null);
    }
  }, []);
  
  // キャンバス右クリック
  const handleCanvasContextMenu = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleContextMenu(e, null);
    }
  }, [handleContextMenu]);
  
  // 接続削除
  const handleConnectionDelete = useCallback((connectionId) => {
    dispatch({ type: ACTIONS.REMOVE_CONNECTION, payload: connectionId });
  }, []);
  
  // 接続作成
  const handleTerminalMouseUpWrapper = useCallback((terminalInfo) => {
    const result = handleTerminalMouseUp(terminalInfo);
    if (result && result.newConnection) {
      dispatch({ 
        type: ACTIONS.ADD_CONNECTION, 
        payload: result.newConnection 
      });
    }
  }, [handleTerminalMouseUp]);
  
  // モード変更
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'tutorial') {
      setShowTutorialPanel(true);
      setLearningMode('tutorial');
    } else {
      setShowTutorialPanel(false);
      setLearningMode('sandbox');
    }
  }, [setLearningMode]);
  
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
  
  // ダークモード適用
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <div className={`h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* 超ミニマルヘッダー */}
      <UltraMinimalHeader
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onHelp={() => setShowHelp(true)}
      />
      
      {/* メインキャンバス */}
      <div className="h-full pt-12 relative">
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
          onContextMenu={handleContextMenu}
          style={{ cursor: radialMenuPosition ? 'default' : 'crosshair' }}
        />
        
        {/* クイックアクセスバー */}
        {showQuickAccess && (
          <QuickAccessBar
            onAddGate={addGateAtCenter}
            currentLevel={currentLevel}
          />
        )}
        
        {/* ドックツールバー */}
        {showDock && (
          <DockToolbar
            autoMode={autoMode}
            canUndo={canUndo}
            canRedo={canRedo}
            onToggleAutoMode={toggleAutoMode}
            onCalculate={runCalculation}
            onReset={handleReset}
            onUndo={undo}
            onRedo={redo}
          />
        )}
        
        {/* ラジアルメニュー */}
        {radialMenuPosition && (
          <RadialMenu
            position={radialMenuPosition}
            onAddGate={(type) => addGateAtPosition(type, radialMenuPosition.canvasX, radialMenuPosition.canvasY)}
            onDelete={() => radialMenuPosition.gateId && handleDeleteGate(radialMenuPosition.gateId)}
            onClose={() => setRadialMenuPosition(null)}
            hasGate={!!radialMenuPosition.gateId}
            currentLevel={currentLevel}
          />
        )}
        
        {/* スマートヒント */}
        {currentHint && (
          <SmartHints
            hint={currentHint}
            onDismiss={() => setCurrentHint(null)}
          />
        )}
        
        {/* チュートリアルオーバーレイ */}
        {mode === 'tutorial' && currentTutorial && (
          <TutorialOverlay
            tutorialId={currentTutorial}
            currentStep={tutorialStep}
            isStepCompleted={isStepCompleted}
            onNext={nextTutorialStep}
            onSkip={() => {
              completeTutorial();
              handleModeChange('sandbox');
            }}
          />
        )}
        
        {/* スライドインパネル（チュートリアル選択） */}
        <SlideInPanel
          isOpen={showTutorialPanel && !currentTutorial}
          onClose={() => setShowTutorialPanel(false)}
          position="left"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">チュートリアルを選択</h2>
            <div className="space-y-3">
              {Object.entries(LEARNING_OBJECTIVES.level1).map(([category, objectives]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 capitalize">
                    {category}
                  </h3>
                  {objectives.map(obj => (
                    <button
                      key={obj.id}
                      onClick={() => {
                        startTutorial(obj.id);
                        setShowTutorialPanel(false);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">{obj.name}</div>
                      <div className="text-sm text-gray-600">{obj.description}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </SlideInPanel>
        
        {/* エラーフィードバック */}
        {mode !== 'sandbox' && (
          <ErrorFeedback
            errors={errors}
            onDismiss={dismissError}
            onFixSuggestion={(errorId, action) => {
              const fix = applyAutoFix(errorId, action);
              if (fix) {
                switch (fix.type) {
                  case 'REMOVE_GATE':
                    dispatch({ type: ACTIONS.REMOVE_GATE, payload: fix.gateId });
                    break;
                }
              }
            }}
            showAutoFix={true}
            position="bottom-right"
          />
        )}
        
        {/* ヘルプウィンドウ */}
        <FloatingHelpWindow
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </div>
      
      {/* ショートカットヒント */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
        <div>Space: クイックアクセス</div>
        <div>Tab: ツールバー</div>
        <div>右クリック: メニュー</div>
      </div>
    </div>
  );
};

export default LogicCircuitBuilderV3;