// モダンUIv2 - クリーンで直感的な論理回路ビルダー

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useHistory } from '../hooks/useHistory';
import { useEducation } from '../hooks/useEducation';
import { useErrorFeedback } from '../hooks/useErrorFeedback';
import { TUTORIAL_STEPS, LEARNING_OBJECTIVES } from '../constants/education';

// 新しいUIコンポーネント
import MinimalHeader from './UI/MinimalHeader';
import SimpleToolPalette from './UI/SimpleToolPalette';
import Canvas from './Circuit/Canvas';
import FloatingHelpWindow from './UI/FloatingHelpWindow';
import ErrorFeedback from './Education/ErrorFeedback';
import TutorialPanel from './Education/TutorialPanel';
import TruthTableChallenge from './Education/TruthTableChallenge';
import LearningModeSelector from './Education/LearningModeSelector';
import EnhancedTutorial from './Education/EnhancedTutorial';

// コンテキストメニュー
import ContextMenu from './UI/ContextMenu';

// 右クリックメニューの定義
const contextMenuOptions = [
  { id: 'delete', label: '削除', icon: '🗑️', shortcut: 'Del' },
  { id: 'duplicate', label: '複製', icon: '📋', shortcut: 'Ctrl+D' },
  { id: 'properties', label: 'プロパティ', icon: '⚙️', shortcut: 'P' },
  { type: 'separator' },
  { id: 'help', label: 'このゲートについて', icon: '❓' }
];

const LogicCircuitBuilderV2 = () => {
  // 状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel, unlockedLevels, savedCircuits } = state;
  
  // UI状態
  const [darkMode, setDarkMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toolPalettePosition, setToolPalettePosition] = useState({ x: 20, y: 80 });
  const [mode, setMode] = useState('sandbox'); // sandbox, tutorial, challenge
  const [contextMenu, setContextMenu] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [tutorialAttemptCount, setTutorialAttemptCount] = useState(0);
  
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
    completeObjective,
    startTutorial,
    nextTutorialStep,
    completeTutorial,
    getCurrentTutorialStep,
    calculateProgress,
    validateTutorialStep,
    setCurrentTutorial,
    setTutorialStep
  } = useEducation();
  
  const currentStep = getCurrentTutorialStep();
  const isStepCompleted = currentStep ? validateTutorialStep(state) : false;
  
  // 現在の目標を取得
  const getCurrentObjective = useCallback(() => {
    if (currentChallenge) return currentChallenge;
    if (currentTutorial && TUTORIAL_STEPS[currentTutorial]) {
      return {
        id: currentTutorial,
        targetBehavior: currentTutorial.toUpperCase().replace(/_/g, '_')
      };
    }
    return null;
  }, [currentChallenge, currentTutorial]);
  
  // エラーフィードバック
  const {
    errors,
    dismissError,
    clearAllErrors,
    applyAutoFix,
    errorStats,
    hasErrors,
    errorSummary
  } = useErrorFeedback(gates, connections, getCurrentObjective());
  
  // グローバルキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e) => {
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
        handleDeleteGate(selectedGate);
      }
      // Escape: 選択解除
      if (e.key === 'Escape') {
        dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
        setContextMenu(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGate]);
  
  // モード変更時の処理
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === 'sandbox') {
      setLearningMode('sandbox');
      setCurrentChallenge(null);
      setShowHint(false);
      if (currentTutorial) {
        completeTutorial();
      }
    } else if (newMode === 'tutorial') {
      setLearningMode('tutorial');
    } else if (newMode === 'challenge') {
      setLearningMode('challenge');
    }
  }, [setLearningMode, currentTutorial, completeTutorial]);
  
  // ゲート追加
  const addGate = useCallback((type) => {
    const gridSize = 20;
    const canvasRect = svgRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 : 400;
    const centerY = canvasRect ? canvasRect.height / 2 : 300;
    
    const x = Math.round(centerX / gridSize) * gridSize;
    const y = Math.round(centerY / gridSize) * gridSize;
    
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { type, x, y, clockSignal: type === 'CLOCK' ? clockSignal : undefined }
    });
  }, [svgRef, clockSignal]);
  
  // ゲート削除
  const handleDeleteGate = useCallback((gateId) => {
    dispatch({ type: ACTIONS.REMOVE_GATE, payload: gateId });
    setContextMenu(null);
  }, []);
  
  // 入力トグル
  const toggleInput = useCallback((gateId) => {
    dispatch({ type: ACTIONS.UPDATE_GATE_VALUE, payload: { gateId } });
  }, []);
  
  // 計算実行
  const handleCalculate = useCallback(() => {
    runCalculation();
  }, [runCalculation]);
  
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
  
  // 保存/読み込み（仮実装）
  const handleSave = useCallback(() => {
    const circuit = {
      name: `回路_${new Date().toLocaleString()}`,
      gates,
      connections,
      timestamp: Date.now()
    };
    dispatch({ type: ACTIONS.SAVE_CIRCUIT, payload: circuit });
    alert('回路を保存しました');
  }, [gates, connections]);
  
  const handleLoad = useCallback(() => {
    // TODO: 実際のロード画面を実装
    alert('読み込み機能は開発中です');
  }, []);
  
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
  
  // 右クリックメニュー
  const handleContextMenu = useCallback((e, gateId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      gateId
    });
  }, []);
  
  // コンテキストメニューアクション
  const handleContextMenuAction = useCallback((action) => {
    if (!contextMenu) return;
    
    switch (action) {
      case 'delete':
        handleDeleteGate(contextMenu.gateId);
        break;
      case 'duplicate':
        // TODO: 複製機能の実装
        alert('複製機能は開発中です');
        break;
      case 'properties':
        // TODO: プロパティパネルの表示
        alert('プロパティ機能は開発中です');
        break;
      case 'help':
        // TODO: ゲート固有のヘルプ表示
        setIsHelpOpen(true);
        break;
    }
    
    setContextMenu(null);
  }, [contextMenu, handleDeleteGate]);
  
  // キャンバスクリック
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
      setContextMenu(null);
    }
  }, []);
  
  // 接続削除
  const handleConnectionDelete = useCallback((connectionId) => {
    dispatch({ type: ACTIONS.REMOVE_CONNECTION, payload: connectionId });
  }, []);
  
  // 接続作成のラッパー
  const handleTerminalMouseUpWrapper = useCallback((terminalInfo) => {
    const result = handleTerminalMouseUp(terminalInfo);
    if (result && result.newConnection) {
      dispatch({ 
        type: ACTIONS.ADD_CONNECTION, 
        payload: result.newConnection 
      });
    }
  }, [handleTerminalMouseUp]);
  
  // チャレンジ開始
  const handleStartChallenge = useCallback((challengeId) => {
    setCurrentChallenge(null);
    setShowHint(false);
    
    if (currentTutorial) {
      completeTutorial();
    }
    
    const levelObjectives = LEARNING_OBJECTIVES[`level${currentLevel}`];
    if (!levelObjectives) return;
    
    const challenge = levelObjectives.basics?.find(obj => obj.id === challengeId) ||
                     levelObjectives.constructions?.find(obj => obj.id === challengeId) ||
                     levelObjectives.advanced?.find(obj => obj.id === challengeId);
    
    if (challenge) {
      if (challenge.type === 'truth_table') {
        setCurrentChallenge(challenge);
      } else if (challenge.type === 'construction') {
        startTutorial(challengeId);
      }
    }
  }, [currentLevel, currentTutorial, completeTutorial, startTutorial]);
  
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
    <div className={`h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* ミニマルヘッダー */}
      <MinimalHeader
        mode={mode}
        onModeChange={handleModeChange}
        onHelp={() => setIsHelpOpen(true)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onMenuClick={() => setShowSettings(true)}
      />
      
      {/* メインキャンバス */}
      <div className="pt-14 h-full bg-gray-50 dark:bg-gray-900">
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
        />
      </div>
      
      {/* シンプルツールパレット */}
      <SimpleToolPalette
        currentLevel={currentLevel}
        autoMode={autoMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onAddGate={addGate}
        onToggleAutoMode={toggleAutoMode}
        onCalculate={handleCalculate}
        onReset={handleReset}
        onUndo={undo}
        onRedo={redo}
      />
      
      {/* 学習モードセレクター（チュートリアル/チャレンジモード時のみ） */}
      {mode !== 'sandbox' && (
        <div className="fixed top-20 left-4 z-30">
          <LearningModeSelector
            learningMode={learningMode}
            progress={progress}
            currentLevel={currentLevel}
            onModeChange={setLearningMode}
            onStartChallenge={handleStartChallenge}
            calculateProgress={calculateProgress}
            currentTutorial={currentTutorial}
            earnedBadges={earnedBadges}
          />
        </div>
      )}
      
      {/* チュートリアルパネル */}
      {currentTutorial && (
        <TutorialPanel
          currentStep={tutorialStep}
          totalSteps={TUTORIAL_STEPS[currentTutorial]?.length || 0}
          instruction={currentStep?.instruction || 'チュートリアルを読み込み中...'}
          hint={currentStep?.hint || ''}
          showHint={showHint}
          onShowHint={() => setShowHint(true)}
          onSkip={() => {
            handleModeChange('sandbox');
            setCurrentTutorial(null);
            setTutorialStep(0);
            setTutorialAttemptCount(0);
          }}
          onComplete={() => {
            if (isStepCompleted) {
              nextTutorialStep();
              setShowHint(false);
              setTutorialAttemptCount(0);
            } else {
              setTutorialAttemptCount(prev => prev + 1);
            }
          }}
          isStepCompleted={isStepCompleted}
          tutorialId={currentTutorial}
          attemptCount={tutorialAttemptCount}
          title={(() => {
            for (const [level, categories] of Object.entries(LEARNING_OBJECTIVES)) {
              for (const [category, objectives] of Object.entries(categories)) {
                const objective = objectives.find(obj => obj.id === currentTutorial);
                if (objective) {
                  return objective.name;
                }
              }
            }
            return null;
          })()}
        />
      )}
      
      {/* 真理値表チャレンジ */}
      {currentChallenge && currentChallenge.type === 'truth_table' && (
        <TruthTableChallenge
          targetGate={currentChallenge.targetGate}
          gates={gates}
          connections={connections}
          simulation={simulation}
          onComplete={() => {
            completeObjective(`level${currentLevel}`, 'basics', currentChallenge.id);
            setCurrentChallenge(null);
          }}
          onCancel={() => setCurrentChallenge(null)}
        />
      )}
      
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
                case 'AUTO_CONNECT':
                  // TODO: 自動接続の実装
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
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      
      {/* コンテキストメニュー */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenuOptions}
          onSelect={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* 設定パネル（TODO: 実装） */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">設定</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              設定パネルは開発中です
            </p>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogicCircuitBuilderV2;