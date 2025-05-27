// 日本の学生のための論理回路プレイグラウンド

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useHistory } from '../hooks/useHistory';
import { useEducation } from '../hooks/useEducation';
import { useErrorFeedback } from '../hooks/useErrorFeedback';

// 日本語最適化されたコンポーネント
import WelcomeScreen from './JP/WelcomeScreen';
import SimpleHeader from './JP/SimpleHeader';
import GuidedToolbar from './JP/GuidedToolbar';
import Canvas from './Circuit/Canvas';
import HelpfulErrors from './JP/HelpfulErrors';
import ProgressTracker from './JP/ProgressTracker';
import StepByStepGuide from './JP/StepByStepGuide';
import CelebrationModal from './JP/CelebrationModal';

// 日本の学生向けの例
const JAPANESE_EXAMPLES = {
  AND: {
    title: '自動販売機の仕組み',
    description: 'お金を入れて（入力1）、ボタンを押す（入力2）と、飲み物が出る（出力）',
    visual: '💴 + 🔘 = 🥤'
  },
  OR: {
    title: '駅の改札',
    description: 'ICカード（入力1）または切符（入力2）で通れる（出力）',
    visual: '💳 または 🎫 = ✅'
  },
  NOT: {
    title: '信号機の切り替え',
    description: '赤信号（入力）の時は止まる、青信号（NOTで反転）の時は進む',
    visual: '🔴 → 🟢'
  }
};

const LogicCircuitJP = () => {
  // 状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate } = state;
  
  // UI状態
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [currentMode, setCurrentMode] = useState('guided'); // guided, practice, free
  const [showCelebration, setShowCelebration] = useState(false);
  const [userLevel, setUserLevel] = useState('beginner');
  const [achievements, setAchievements] = useState([]);
  
  // カスタムフック
  const {
    simulation,
    autoMode,
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
    currentTutorial,
    tutorialStep,
    getCurrentTutorialStep,
    validateTutorialStep,
    nextTutorialStep
  } = useEducation();
  
  const {
    errors,
    dismissError,
    hasErrors
  } = useErrorFeedback(gates, connections, null);
  
  // 初回訪問チェック
  useEffect(() => {
    const visited = localStorage.getItem('logic-circuit-jp-visited');
    if (visited) {
      setIsFirstVisit(false);
    }
  }, []);
  
  // レベルアップチェック
  useEffect(() => {
    const checkLevelUp = () => {
      if (gates.length > 5 && connections.length > 3) {
        setUserLevel('intermediate');
      }
      if (gates.length > 10 && connections.length > 8) {
        setUserLevel('advanced');
      }
    };
    checkLevelUp();
  }, [gates, connections]);
  
  // 成功体験の検出
  useEffect(() => {
    // 初めての接続
    if (connections.length === 1 && !achievements.includes('first_connection')) {
      setAchievements([...achievements, 'first_connection']);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    // 初めての完全な回路
    const hasInput = gates.some(g => g.type === 'INPUT');
    const hasOutput = gates.some(g => g.type === 'OUTPUT');
    const hasLogic = gates.some(g => ['AND', 'OR', 'NOT'].includes(g.type));
    
    if (hasInput && hasOutput && hasLogic && connections.length >= 2 
        && !achievements.includes('first_circuit')) {
      setAchievements([...achievements, 'first_circuit']);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [connections, gates, achievements]);
  
  // ゲート追加（ガイド付き）
  const addGate = useCallback((type) => {
    const canvasRect = svgRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // 初心者向けに配置位置をガイド
    let x, y;
    if (currentMode === 'guided') {
      // 入力は左側、ロジックは中央、出力は右側に配置をガイド
      if (type === 'INPUT') {
        x = 100;
        y = 200 + (gates.filter(g => g.type === 'INPUT').length * 100);
      } else if (type === 'OUTPUT') {
        x = 700;
        y = 200 + (gates.filter(g => g.type === 'OUTPUT').length * 100);
      } else {
        x = 400;
        y = 200 + (gates.filter(g => !['INPUT', 'OUTPUT'].includes(g.type)).length * 100);
      }
    } else {
      // 自由配置モード
      x = canvasRect.width / 2;
      y = canvasRect.height / 2;
    }
    
    dispatch({ 
      type: ACTIONS.ADD_GATE, 
      payload: { 
        type, 
        x: Math.round(x / 20) * 20, 
        y: Math.round(y / 20) * 20 
      }
    });
  }, [svgRef, currentMode, gates]);
  
  // ゲート削除
  const deleteGate = useCallback((gateId) => {
    dispatch({ type: ACTIONS.REMOVE_GATE, payload: gateId });
  }, []);
  
  // 入力トグル
  const toggleInput = useCallback((gateId) => {
    dispatch({ type: ACTIONS.UPDATE_GATE_VALUE, payload: { gateId } });
  }, []);
  
  // リセット（確認付き）
  const handleReset = useCallback(() => {
    if (gates.length > 0 || connections.length > 0) {
      if (window.confirm('すべてをクリアしますか？\n（ヒント：Ctrl+Zで元に戻せます）')) {
        resetSimulation();
        dispatch({ type: ACTIONS.RESET });
      }
    } else {
      resetSimulation();
      dispatch({ type: ACTIONS.RESET });
    }
  }, [gates, connections, resetSimulation]);
  
  // ウェルカム画面の完了
  const handleWelcomeComplete = useCallback(() => {
    setIsFirstVisit(false);
    localStorage.setItem('logic-circuit-jp-visited', 'true');
  }, []);
  
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
  
  // キャンバスクリック
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: ACTIONS.SET_SELECTED_GATE, payload: null });
    }
  }, []);
  
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
  
  // 右クリックメニュー（シンプル）
  const handleContextMenu = useCallback((e, gateId) => {
    e.preventDefault();
    if (gateId && window.confirm('このゲートを削除しますか？')) {
      deleteGate(gateId);
    }
  }, [deleteGate]);
  
  return (
    <>
      {/* ウェルカム画面 */}
      {isFirstVisit && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      
      {/* メインアプリ */}
      {!isFirstVisit && (
        <div className="h-screen flex flex-col bg-gray-50">
          {/* シンプルヘッダー */}
          <SimpleHeader 
            mode={currentMode}
            onModeChange={setCurrentMode}
            userLevel={userLevel}
          />
          
          {/* メインコンテンツ */}
          <div className="flex-1 flex">
            {/* 左側：ツールバー */}
            <GuidedToolbar
              mode={currentMode}
              userLevel={userLevel}
              onAddGate={addGate}
              onCalculate={runCalculation}
              onReset={handleReset}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              autoMode={autoMode}
              onToggleAutoMode={toggleAutoMode}
              examples={JAPANESE_EXAMPLES}
            />
            
            {/* 中央：キャンバス */}
            <div className="flex-1 relative">
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
              
              {/* ガイド付きモードのヘルプ */}
              {currentMode === 'guided' && gates.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h3 className="text-xl font-bold mb-4">はじめよう！</h3>
                    <p className="text-gray-600 mb-4">
                      左のツールバーから「入力スイッチ」をクリックして
                      回路作りを始めましょう
                    </p>
                    <div className="text-4xl animate-bounce">👈</div>
                  </div>
                </div>
              )}
              
              {/* ステップバイステップガイド */}
              {currentMode === 'guided' && (
                <StepByStepGuide
                  gates={gates}
                  connections={connections}
                  currentStep={tutorialStep}
                />
              )}
            </div>
            
            {/* 右側：進捗トラッカー */}
            <ProgressTracker
              achievements={achievements}
              gateCount={gates.length}
              connectionCount={connections.length}
              userLevel={userLevel}
            />
          </div>
          
          {/* エラーヘルプ */}
          <HelpfulErrors
            errors={errors}
            onDismiss={dismissError}
          />
          
          {/* お祝いモーダル */}
          {showCelebration && (
            <CelebrationModal
              achievement={achievements[achievements.length - 1]}
              onClose={() => setShowCelebration(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default LogicCircuitJP;