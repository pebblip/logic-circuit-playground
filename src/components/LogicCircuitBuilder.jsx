// モダンなUIの論理回路ビルダーコンポーネント

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useHistory } from '../hooks/useHistory';
import { useEducation } from '../hooks/useEducation';
import { useErrorFeedback } from '../hooks/useErrorFeedback';
import { CANVAS } from '../constants/circuit';
import { TUTORIAL_STEPS, LEARNING_OBJECTIVES } from '../constants/education';
import { layout, colors, shadows } from '../styles/design-tokens';

// UIコンポーネント
import Canvas from './Circuit/Canvas';
import Toolbar from './UI/Toolbar';
import LevelPanel from './UI/LevelPanel';
import RightPanel from './UI/RightPanel';
import FloatingHelpWindow from './UI/FloatingHelpWindow';

// 教育コンポーネント
import TutorialPanel from './Education/TutorialPanel';
import LearningModeSelector from './Education/LearningModeSelector';
import BadgeDisplay from './Education/BadgeDisplay';
import TruthTableChallenge from './Education/TruthTableChallenge';
import ErrorFeedback from './Education/ErrorFeedback';

/**
 * モダンUI版論理回路ビルダー
 */
const LogicCircuitBuilder = () => {
  // 状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel, unlockedLevels, savedCircuits } = state;
  
  // UIの状態
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [tutorialAttemptCount, setTutorialAttemptCount] = useState(0);
  
  // コンソールログを追加
  const addConsoleLog = useCallback((message, type = 'info') => {
    setConsoleOutput(prev => [...prev, {
      message,
      type,
      timestamp: Date.now()
    }]);
  }, []);
  
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
  
  // 教育機能
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
  
  // チュートリアル用の状態
  const [showHint, setShowHint] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
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
  
  // Force re-render when tutorial changes
  useEffect(() => {
    // Re-render when tutorial changes
  }, [currentTutorial, getCurrentTutorialStep]);
  
  // グローバル関数を設定するためのref
  const toggleHelpRef = useRef(null);
  toggleHelpRef.current = () => {
    console.log('toggleHelp called');
    setIsHelpOpen(prev => {
      console.log('Setting help open to:', !prev);
      return !prev;
    });
  };
  
  // コンポーネントのマウント時の処理
  useEffect(() => {
    // レベル変更関数をグローバルに公開（一時的な解決策）
    window.onLevelChange = (newLevel) => {
      dispatch({ type: ACTIONS.SET_CURRENT_LEVEL, payload: newLevel });
    };
    
    // ヘルプトグル関数をグローバルに公開
    window.toggleHelp = () => toggleHelpRef.current();
    
    return () => {
      delete window.onLevelChange;
      delete window.toggleHelp;
    };
  }, []);
  
  // Track tutorial state changes
  useEffect(() => {
    // Tutorial state updated
  }, [currentTutorial, tutorialStep, currentStep, learningMode]);
  
  // チャレンジの開始
  const handleStartChallenge = useCallback((challengeId) => {
    // 既存のチャレンジやチュートリアルをクリア
    setCurrentChallenge(null);
    setShowHint(false);
    
    // 現在のチュートリアルがある場合は終了
    if (currentTutorial) {
      completeTutorial();
    }
    
    const levelObjectives = LEARNING_OBJECTIVES[`level${currentLevel}`];
    if (!levelObjectives) {
      return;
    }
    
    const challenge = levelObjectives.basics?.find(obj => obj.id === challengeId) ||
                     levelObjectives.constructions?.find(obj => obj.id === challengeId) ||
                     levelObjectives.advanced?.find(obj => obj.id === challengeId);
    
    if (challenge) {
      if (challenge.type === 'truth_table') {
        setCurrentChallenge(challenge);
      } else if (challenge.type === 'construction') {
        startTutorial(challengeId);
      } else if (challenge.type === 'verification') {
        // verificationタイプの処理を追加（現在は未実装）
        alert(`検証チャレンジ「${challenge.name}」は現在実装中です。\nLevel 1の「構築」カテゴリーに、NANDゲートとSRラッチを作るチュートリアルがあります。`);
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

  // ゲート追加
  const addGate = useCallback((type) => {
    const gridSize = 20;
    // 学習モードの場合は、パネルを避けて配置
    const isLearning = learningMode !== 'sandbox';
    const baseX = isLearning ? 600 : 500;  // 学習モード時は右寄りに配置
    const baseY = 300;
    const randomOffsetX = Math.floor((Math.random() - 0.5) * 10) * gridSize;
    const randomOffsetY = Math.floor((Math.random() - 0.5) * 5) * gridSize;
    
    const x = baseX + randomOffsetX;
    const y = baseY + randomOffsetY;
    
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { type, x, y, clockSignal } 
    });
    addConsoleLog(`${type}ゲートを追加しました`, 'success');
  }, [clockSignal, addConsoleLog]);

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

  const handleGateUpdate = useCallback((gateId, updates) => {
    // UPDATE_GATE_VALUEを使用してゲートの値を更新
    if (updates.value !== undefined) {
      dispatch({ 
        type: ACTIONS.UPDATE_GATE_VALUE, 
        payload: { gateId, value: updates.value } 
      });
    }
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
      const fromGate = gates.find(g => g.id === connection.from);
      const toGate = gates.find(g => g.id === connection.to);
      if (fromGate && toGate) {
        addConsoleLog(`接続を作成: ${fromGate.type}[${fromGate.id}] → ${toGate.type}[${toGate.id}]`, 'success');
      }
    }
  }, [handleTerminalMouseUp, gates, addConsoleLog]);

  const handleCalculate = useCallback(() => {
    const newSimulation = runCalculation();
    
    const updatedGates = gates.map(gate => ({
      ...gate,
      value: gate.type === 'INPUT' || gate.type === 'CLOCK'
        ? gate.value
        : (newSimulation[gate.id] ?? gate.value)
    }));
    
    dispatch({ type: ACTIONS.SET_GATES, payload: updatedGates });
    addConsoleLog('回路を計算しました', 'info');
  }, [gates, runCalculation, addConsoleLog]);

  const handleReset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
    resetSimulation();
    setConsoleOutput([]);
    addConsoleLog('回路がリセットされました', 'info');
  }, [resetSimulation, addConsoleLog]);

  const handleConnectionDelete = useCallback((index) => {
    dispatch({ type: ACTIONS.REMOVE_CONNECTION, payload: { index } });
    addConsoleLog('接続が削除されました', 'info');
  }, [addConsoleLog]);

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
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpOpen(prev => !prev);
      } else if (selectedGate) {
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
          learningMode={learningMode}
          earnedBadges={earnedBadges}
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
          onToggleLearningMode={() => {
            setLearningMode(learningMode === 'sandbox' ? 'tutorial' : 'sandbox');
            setCurrentChallenge(null);
            setShowHint(false);
          }}
          onToggleHelp={() => setIsHelpOpen(!isHelpOpen)}
        />
      </div>

      {/* メインコンテンツ */}
      <div 
        className="flex"
        style={{ height: `calc(100vh - ${layout.toolbar.height})` }}
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
        <div className="flex-1 overflow-auto relative">
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
          
          {/* 学習モードセレクター */}
          {learningMode !== 'sandbox' && (
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
          )}
          
          {/* チュートリアルパネル */}
          {currentTutorial && (
            <>
              <TutorialPanel
                currentStep={tutorialStep}
                totalSteps={TUTORIAL_STEPS[currentTutorial]?.length || 0}
                instruction={currentStep?.instruction || 'チュートリアルを読み込み中...'}
                hint={currentStep?.hint || ''}
                showHint={showHint}
                onShowHint={() => setShowHint(true)}
                onSkip={() => {
                  setLearningMode('sandbox');
                  setShowHint(false);
                  setCurrentChallenge(null);
                  // チュートリアルを完了せずにスキップ
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
                    // ステップが完了していない場合は試行回数を増やす
                    setTutorialAttemptCount(prev => prev + 1);
                  }
                }}
                isStepCompleted={isStepCompleted}
                tutorialId={currentTutorial}
                attemptCount={tutorialAttemptCount}
                title={(() => {
                  // チュートリアルIDから目標情報を取得
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
            </>
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
          {learningMode !== 'sandbox' && (
            <ErrorFeedback
              errors={errors}
              onDismiss={dismissError}
              onFixSuggestion={(errorId, action) => {
                const fix = applyAutoFix(errorId, action);
                if (fix) {
                  // 自動修正アクションを実行
                  switch (fix.type) {
                    case 'REMOVE_GATE':
                      dispatch({ type: ACTIONS.REMOVE_GATE, payload: fix.gateId });
                      break;
                    case 'AUTO_CONNECT':
                      // 自動接続のロジックを実装（必要に応じて）
                      addConsoleLog('自動接続機能は現在開発中です', 'info');
                      break;
                    default:
                      console.log('Unknown fix action:', fix);
                  }
                }
              }}
              showAutoFix={true}
              position="bottom-right"
            />
          )}
        </div>

        {/* 右パネル */}
        <RightPanel
          selectedGate={selectedGate}
          onGateUpdate={handleGateUpdate}
          gates={gates}
          connections={connections}
          savedCircuits={savedCircuits}
          onLoadCircuit={handleLoadCircuit}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          consoleOutput={consoleOutput}
        />
      </div>
      
      {/* ヘルプウィンドウ */}
      <FloatingHelpWindow
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default LogicCircuitBuilder;