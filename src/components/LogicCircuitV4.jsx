import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { circuitReducer, initialState, ACTIONS } from '../reducers/circuitReducer';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useHistory } from '../hooks/useHistory';
import { motion, AnimatePresence } from 'framer-motion';

// 新UIコンポーネント
import HeaderV4 from './UI/HeaderV4';
import PartsPanel from './UI/PartsPanel';
import CanvasV4 from './Circuit/CanvasV4';
import PropertiesPanel from './UI/PropertiesPanel';
import ChallengeBar from './UI/ChallengeBar';
import WelcomeTutorial from './Education/WelcomeTutorial';
import DebugPanel from './DebugPanel';

// 定数
import { CHALLENGES } from '../constants/challenges';

const LogicCircuitV4 = () => {
  // 回路の状態管理
  const [state, dispatch] = useReducer(circuitReducer, initialState);
  const { gates, connections, selectedGate, currentLevel } = state;
  
  // UI状態
  const [showTutorial, setShowTutorial] = useState(() => {
    // localStorageでチュートリアル完了を確認
    return !localStorage.getItem('tutorialCompleted');
  });
  const [currentChallenge, setCurrentChallenge] = useState(CHALLENGES.level1[0]);
  const [showHint, setShowHint] = useState(0); // 0: なし, 1: 配置, 2: 配線, 3: 答え
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // ゲート操作関数のスタブ（実装が必要）
  const handleDeleteGate = useCallback((gateId) => {
    dispatch({ type: ACTIONS.DELETE_GATE, payload: gateId });
  }, []);
  
  const handleDeleteConnection = useCallback((connectionId) => {
    dispatch({ type: ACTIONS.DELETE_CONNECTION, payload: connectionId });
  }, []);
  
  const handleUpdateGate = useCallback((gateId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_GATE, payload: { id: gateId, updates } });
  }, []);
  
  // シミュレーション
  const { simulation, runCalculation, calculateCircuitWithGates } = useCircuitSimulation(gates, connections);
  
  // 履歴管理
  const { pushState, undo, redo, canUndo, canRedo } = useHistory({ gates, connections });
  
  // ゲート追加
  const handleAddGate = useCallback((type, position) => {
    const newGate = {
      id: `${type.toLowerCase()}_${Date.now()}`,
      type,
      x: position.x,
      y: position.y,
      inputs: type === 'NOT' ? 1 : type === 'INPUT' || type === 'OUTPUT' ? 0 : 2,
      outputs: type === 'INPUT' ? 0 : 1,
      value: type === 'INPUT' ? false : undefined
    };
    
    dispatch({ type: ACTIONS.ADD_GATE, payload: newGate });
    pushState({ gates: [...gates, newGate], connections });
  }, [gates, connections, pushState]);
  
  // 配線追加
  const handleAddConnection = useCallback((connection) => {
    console.log('Adding connection to state:', connection);
    console.log('Current connections before add:', connections);
    dispatch({ type: ACTIONS.ADD_CONNECTION, payload: connection });
    pushState({ gates, connections: [...connections, connection] });
  }, [gates, connections, pushState]);
  
  // 接続状態をデバッグ
  useEffect(() => {
    console.log('Connections updated in state:', connections);
  }, [connections]);
  
  // 課題の確認状態
  const [isCorrect, setIsCorrect] = useState(false);
  const [checkResult, setCheckResult] = useState(undefined);
  
  // 課題の確認
  const checkChallenge = useCallback(() => {
    if (!currentChallenge) return false;
    
    // 入力ゲートを順番に取得（配置された順に番号付け）
    const inputGates = gates
      .filter(g => g.type === 'INPUT')
      .sort((a, b) => a.x - b.x || a.y - b.y); // 左から右、上から下の順
    
    // 出力ゲートを取得
    const outputGates = gates
      .filter(g => g.type === 'OUTPUT')
      .sort((a, b) => a.x - b.x || a.y - b.y);
    
    // 真理値表のすべての行をチェック
    let allCorrect = true;
    const results = [];
    
    for (const row of currentChallenge.truthTable) {
      // 入力値を設定
      const updatedGates = gates.map(gate => {
        if (gate.type === 'INPUT') {
          const index = inputGates.findIndex(g => g.id === gate.id);
          if (index !== -1 && index < row.inputs.length) {
            return { ...gate, value: Boolean(row.inputs[index]) };
          }
        }
        return gate;
      });
      
      // その入力状態で回路を計算
      const simulationResult = calculateCircuitWithGates(updatedGates);
      
      // 出力をチェック
      let rowCorrect = false;
      
      if (row.outputs) {
        // 複数出力の場合（半加算器など）
        rowCorrect = row.outputs.every((expectedOutput, index) => {
          if (index < outputGates.length) {
            const actualOutput = simulationResult[outputGates[index].id];
            return actualOutput === Boolean(expectedOutput);
          }
          return false;
        });
      } else {
        // 単一出力の場合
        if (outputGates.length > 0) {
          const actualOutput = simulationResult[outputGates[0].id];
          rowCorrect = actualOutput === Boolean(row.output);
        }
      }
      
      results.push({
        inputs: row.inputs,
        expected: row.outputs || [row.output],
        actual: outputGates.map(g => simulationResult[g.id] ? 1 : 0),
        correct: rowCorrect
      });
      
      if (!rowCorrect) {
        allCorrect = false;
      }
    }
    
    // デバッグ情報をコンソールに出力
    console.log('Challenge check results:', {
      challenge: currentChallenge.title,
      results,
      allCorrect
    });
    
    setIsCorrect(allCorrect);
    setCheckResult(allCorrect);
    setTimeout(() => setCheckResult(undefined), 3000); // 3秒後に結果を非表示
    
    return allCorrect;
  }, [currentChallenge, gates, calculateCircuitWithGates, simulation]);
  
  // 次の課題へ
  const handleNextChallenge = useCallback(() => {
    const currentIndex = CHALLENGES[`level${currentLevel}`].indexOf(currentChallenge);
    const nextChallenge = CHALLENGES[`level${currentLevel}`][currentIndex + 1];
    
    if (nextChallenge) {
      setCurrentChallenge(nextChallenge);
      setShowHint(0);
      dispatch({ type: ACTIONS.CLEAR_CIRCUIT });
    } else {
      // レベルアップ処理
      dispatch({ type: ACTIONS.LEVEL_UP });
      setCurrentChallenge(CHALLENGES[`level${currentLevel + 1}`]?.[0]);
    }
  }, [currentChallenge, currentLevel]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ウェルカムチュートリアル */}
      <AnimatePresence>
        {showTutorial && (
          <WelcomeTutorial onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorialCompleted', 'true');
          }} />
        )}
      </AnimatePresence>
      
      {/* ヘッダー */}
      <HeaderV4 
        currentLevel={currentLevel}
        challengeProgress={currentChallenge?.id || '1-1'}
        userName="ゲスト"
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左パネル: パーツボックス */}
        <motion.div 
          className="w-64 bg-white border-r border-gray-200 shadow-sm"
          animate={{ x: isPanelCollapsed ? -240 : 0 }}
        >
          <PartsPanel 
            currentLevel={currentLevel}
            onDragStart={(type) => console.log('Dragging:', type)}
          />
        </motion.div>
        
        {/* 中央: キャンバス */}
        <div className="flex-1 relative">
          <CanvasV4
            gates={gates}
            connections={connections}
            simulation={simulation}
            onAddGate={handleAddGate}
            onAddConnection={handleAddConnection}
            onSelectGate={(gate) => dispatch({ type: ACTIONS.SELECT_GATE, payload: gate })}
            onDeleteGate={handleDeleteGate}
            onDeleteConnection={handleDeleteConnection}
            onUpdateGate={handleUpdateGate}
            showHint={showHint}
            currentChallenge={currentChallenge}
          />
        </div>
        
        {/* 右パネル: プロパティ */}
        <motion.div 
          className="w-80 bg-white border-l border-gray-200 shadow-sm"
          animate={{ x: isPanelCollapsed ? 320 : 0 }}
        >
          <PropertiesPanel
            selectedGate={selectedGate}
            simulation={simulation}
            truthTable={currentChallenge?.truthTable}
            currentLevel={currentLevel}
            gates={gates}
            connections={connections}
          />
        </motion.div>
      </div>
      
      {/* 下部: 課題バー */}
      <ChallengeBar
        challenge={currentChallenge}
        showHint={showHint}
        onHintClick={() => setShowHint(prev => Math.min(prev + 1, 3))}
        onResetClick={() => dispatch({ type: ACTIONS.CLEAR_CIRCUIT })}
        onCheckClick={checkChallenge}
        onNextClick={handleNextChallenge}
        canProceed={isCorrect}
        checkResult={checkResult}
      />
      
      {/* デバッグパネル（開発環境のみ） */}
      <DebugPanel 
        gates={gates}
        connections={connections}
        simulation={simulation}
      />
    </div>
  );
};

export default LogicCircuitV4;