import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEducation } from '../hooks/useEducation';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useErrorFeedback } from '../hooks/useErrorFeedback';
import WelcomeOverlay from './Universal/WelcomeOverlay';
import MinimalHeader from './Universal/MinimalHeader';
import WorkspaceArea from './Universal/WorkspaceArea';
import CollapsibleSidebar from './Universal/CollapsibleSidebar';
import SubtleStatusBar from './Universal/SubtleStatusBar';
import { getUserPreferences, saveUserPreferences } from '../utils/userPreferences';

const LogicCircuitUniversal = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [userMode, setUserMode] = useState('explore'); // explore, guided, create
  const [showSidebar, setShowSidebar] = useState(false);
  const [userLevel, setUserLevel] = useState('beginner'); // beginner, intermediate, advanced
  const [circuit, setCircuit] = useState({ gates: [], connections: [] });
  const [selectedTool, setSelectedTool] = useState(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  
  const { currentLesson, completeLesson, unlockAchievement } = useEducation();
  const { simulate, results } = useCircuitSimulation();
  const { errors, checkErrors, clearErrors } = useErrorFeedback();
  
  const canvasRef = useRef(null);
  const activityTrackerRef = useRef({
    toolUsage: {},
    sessionDuration: 0,
    errorsEncountered: 0,
    successfulConnections: 0
  });

  // 初回訪問チェック
  useEffect(() => {
    const prefs = getUserPreferences();
    if (prefs.hasVisited) {
      setIsFirstVisit(false);
      setUserMode(prefs.lastMode || 'explore');
      setUserLevel(prefs.userLevel || 'beginner');
      setShowAdvancedTools(prefs.showAdvancedTools || false);
    }
  }, []);

  // ユーザーアクティビティの追跡
  const trackActivity = useCallback((action, data) => {
    const tracker = activityTrackerRef.current;
    
    switch (action) {
      case 'tool_used':
        tracker.toolUsage[data.tool] = (tracker.toolUsage[data.tool] || 0) + 1;
        // 5回以上使用したツールは次回から表示
        if (tracker.toolUsage[data.tool] >= 5 && userLevel === 'beginner') {
          setUserLevel('intermediate');
        }
        break;
      case 'error_encountered':
        tracker.errorsEncountered++;
        break;
      case 'successful_connection':
        tracker.successfulConnections++;
        // 10個成功したら中級者に
        if (tracker.successfulConnections >= 10 && userLevel === 'beginner') {
          setUserLevel('intermediate');
          unlockAchievement('first_circuit_master');
        }
        break;
    }
  }, [userLevel, unlockAchievement]);

  // ウェルカム画面を閉じる
  const handleWelcomeClose = (selectedMode) => {
    setIsFirstVisit(false);
    setUserMode(selectedMode);
    saveUserPreferences({
      hasVisited: true,
      lastMode: selectedMode,
      userLevel: 'beginner'
    });
  };

  // ツール選択
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    trackActivity('tool_used', { tool });
  };

  // 回路の更新
  const updateCircuit = useCallback((newCircuit) => {
    setCircuit(newCircuit);
    
    // エラーチェック
    const circuitErrors = checkErrors(newCircuit);
    
    // シミュレーション実行
    if (circuitErrors.length === 0) {
      simulate(newCircuit);
      trackActivity('successful_connection', {});
    } else {
      trackActivity('error_encountered', { errors: circuitErrors });
    }
  }, [checkErrors, simulate, trackActivity]);

  // セッション終了時の保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveUserPreferences({
        hasVisited: true,
        lastMode: userMode,
        userLevel: userLevel,
        showAdvancedTools: showAdvancedTools,
        toolUsage: activityTrackerRef.current.toolUsage
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userMode, userLevel, showAdvancedTools]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 初回訪問時のウェルカム画面 */}
      {isFirstVisit && (
        <WelcomeOverlay onClose={handleWelcomeClose} />
      )}

      {/* 最小限のヘッダー */}
      <MinimalHeader 
        userLevel={userLevel}
        onToggleAdvanced={() => setShowAdvancedTools(!showAdvancedTools)}
        showAdvanced={showAdvancedTools}
      />

      {/* メインワークスペース */}
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceArea
          circuit={circuit}
          onCircuitUpdate={updateCircuit}
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          userMode={userMode}
          userLevel={userLevel}
          showAdvancedTools={showAdvancedTools}
          errors={errors}
          simulationResults={results}
          ref={canvasRef}
        />

        {/* 折りたたみ可能なサイドバー */}
        <CollapsibleSidebar
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
          userMode={userMode}
          userLevel={userLevel}
          currentLesson={currentLesson}
          circuit={circuit}
        />
      </div>

      {/* 控えめなステータスバー */}
      <SubtleStatusBar
        connectionStatus={circuit.connections.length > 0 ? 'connected' : 'idle'}
        errorCount={errors.length}
        userLevel={userLevel}
        showDetails={userLevel !== 'beginner'}
      />
    </div>
  );
};

export default LogicCircuitUniversal;