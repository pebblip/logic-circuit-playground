import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CircuitViewModel } from '../viewmodels/CircuitViewModel';
import { useCircuitViewModel } from '../hooks/useCircuitViewModel';
import { CircuitCanvas } from './Circuit/CircuitCanvas.jsx';
import { ToolPalette } from './Circuit/ToolPalette.jsx';
import { GateType } from '../types/gate';

// Import existing components
import TutorialSystemV2 from './TutorialSystemV2';
import ChallengeSystem from './ChallengeSystem';
import ExtendedChallengeSystem from './ExtendedChallengeSystem';
import ProgressTracker from './ProgressTracker';
import ModeSelector from './ModeSelector';
import SaveLoadPanel from './SaveLoadPanel';
import GateDefinitionDialog from './GateDefinitionDialog';
import CustomGateDetail from './CustomGateDetail';

import { 
  getUserPreferences, 
  saveUserPreferences,
  getTutorialState,
  saveTutorialState,
  decodeCircuitFromURL,
  saveCustomGate,
  getCustomGates
} from '../utils/circuitStorage';
import { migrateAllCustomGates } from '../utils/customGateMigration';

export const LogicCircuitBuilderEnhanced = () => {
  const [viewModel] = useState(() => new CircuitViewModel());
  useCircuitViewModel(viewModel);
  
  const [showToolPalette, setShowToolPalette] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);
  
  // ユーザー設定とモード
  const [userMode, setUserMode] = useState(null);
  const [preferences, setPreferences] = useState(null);
  
  // 教育機能の状態
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showExtendedChallenge, setShowExtendedChallenge] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showGateDefinition, setShowGateDefinition] = useState(false);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({
    gatesPlaced: 0,
    challengesCompleted: 0,
    totalTime: 0
  });
  
  // カスタムゲート
  const [customGates, setCustomGates] = useState({});
  const [showCustomGatePanel, setShowCustomGatePanel] = useState(false);
  const [selectedCustomGateDetail, setSelectedCustomGateDetail] = useState(null);

  // Load user preferences and custom gates on mount
  useEffect(() => {
    const prefs = getUserPreferences();
    setPreferences(prefs);
    
    const tutorialState = getTutorialState();
    if (tutorialState) {
      setBadges(tutorialState.badges || []);
      setProgress(tutorialState.progress || progress);
    }
    
    // Load custom gates
    const gates = getCustomGates();
    setCustomGates(gates);
    
    // Check URL for shared circuit
    const urlCircuit = decodeCircuitFromURL();
    if (urlCircuit) {
      // TODO: Load circuit from URL
    }
  }, []);

  // Responsive design detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle drag over for drop support
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop from tool palette
  const handleDrop = (e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType');
    if (gateType) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        viewModel.addGate(gateType, { x, y });
        
        // Update progress
        setProgress(prev => ({ ...prev, gatesPlaced: prev.gatesPlaced + 1 }));
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected gates/connections
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedGates = viewModel.getSelectedGates();
        const selectedConnections = viewModel.getSelectedConnections();
        
        selectedGates.forEach(gate => viewModel.removeGate(gate.id));
        selectedConnections.forEach(conn => viewModel.removeConnection(conn.id));
      }
      
      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        viewModel.selectAll();
      }
      
      // Deselect all
      if (e.key === 'Escape') {
        viewModel.clearSelection();
      }
      
      // Simulate
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        viewModel.simulate();
      }
      
      // Toggle help
      if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewModel]);

  // Tutorial completion handler
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    const newBadge = { id: 'tutorial-complete', name: 'チュートリアル完了', icon: '🎓' };
    setBadges(prev => [...prev, newBadge]);
    saveTutorialState({ badges: [...badges, newBadge], progress });
  };

  // Challenge completion handler
  const handleChallengeComplete = (challengeId) => {
    setProgress(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
    saveTutorialState({ badges, progress: { ...progress, challengesCompleted: progress.challengesCompleted + 1 } });
  };

  // Save custom gate
  const handleSaveCustomGate = (gateData) => {
    const saved = saveCustomGate(gateData);
    if (saved) {
      setCustomGates(prev => ({ ...prev, [saved.id]: saved }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0e27] relative">
      {/* Header */}
      <header className="bg-[#0f1441] shadow-lg border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">論理回路プレイグラウンド</h1>
            {badges.length > 0 && (
              <div className="flex gap-1">
                {badges.slice(0, 3).map(badge => (
                  <span key={badge.id} className="text-lg" title={badge.name}>
                    {badge.icon}
                  </span>
                ))}
                {badges.length > 3 && (
                  <span className="text-sm text-gray-400">+{badges.length - 3}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              チュートリアル
            </button>
            <button
              onClick={() => setShowChallenge(true)}
              className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              チャレンジ
            </button>
            <button
              onClick={() => setShowSaveLoad(true)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              保存/読込
            </button>
            <button
              onClick={() => setShowGateDefinition(true)}
              className="px-3 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
            >
              カスタムゲート
            </button>
            <button
              onClick={() => viewModel.simulate()}
              className="px-4 py-2 bg-[#00ff88] text-[#0a0e27] rounded hover:bg-[#00cc66] transition-colors font-medium"
            >
              シミュレート
            </button>
            <button
              onClick={() => viewModel.clearCircuit()}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              クリア
            </button>
            <button
              onClick={() => setShowHelp(prev => !prev)}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ヘルプ
            </button>
            {isMobile && (
              <button
                onClick={() => setShowToolPalette(!showToolPalette)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors md:hidden"
              >
                ツール
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mode selector for first-time users */}
      {!userMode && !preferences && (
        <ModeSelector onModeSelect={(mode) => {
          setUserMode(mode);
          saveUserPreferences({ mode });
          if (mode === 'education') {
            setShowTutorial(true);
          }
        }} />
      )}

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Tool Palette - responsive positioning */}
        {showToolPalette && (
          <div className={`
            ${isMobile 
              ? 'absolute inset-0 z-20 bg-[#0f1441] overflow-auto' 
              : 'w-64 bg-[#0f1441] border-r border-gray-800 overflow-y-auto'
            }
          `}>
            {isMobile && (
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="font-bold text-white">ツールパレット</h2>
                <button
                  onClick={() => setShowToolPalette(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="p-4">
              <ToolPalette viewModel={viewModel} />
              
              {/* Custom gates section */}
              {Object.keys(customGates).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">カスタムゲート</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(customGates).map(gate => (
                      <button
                        key={gate.id}
                        onClick={() => setSelectedCustomGateDetail(gate)}
                        className="flex flex-col items-center justify-center p-3 border-2 border-purple-700 bg-purple-900 rounded-lg hover:border-purple-500 hover:bg-purple-800 cursor-pointer transition-colors"
                      >
                        <span className="text-lg">🔧</span>
                        <span className="text-xs mt-1 text-gray-300">{gate.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CircuitCanvas viewModel={viewModel} />
        </div>

        {/* Help Panel - slide in from right */}
        {showHelp && !isMobile && (
          <div className="w-80 border-l border-gray-800 bg-[#0f1441] p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">ヘルプ</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-1">基本操作</h3>
                <ul className="text-sm space-y-1">
                  <li>• ゲートをクリックして配置</li>
                  <li>• ピンをクリックして接続</li>
                  <li>• ドラッグで移動</li>
                  <li>• Delete/Backspaceで削除</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">ショートカット</h3>
                <ul className="text-sm space-y-1">
                  <li>• Ctrl/Cmd + A: 全選択</li>
                  <li>• Ctrl/Cmd + S: シミュレート</li>
                  <li>• Ctrl/Cmd + H: ヘルプ切替</li>
                  <li>• Escape: 選択解除</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Properties Panel - desktop only */}
        {!isMobile && !showHelp && (
          <div className="w-64 border-l border-gray-800 bg-[#0f1441] p-4">
            <h2 className="text-lg font-bold mb-4 text-white">プロパティ</h2>
            {viewModel.getSelectedGates().length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-white">選択中のゲート</h3>
                {viewModel.getSelectedGates().map(gate => (
                  <div key={gate.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <p className="text-sm text-gray-300">タイプ: {gate.type}</p>
                    <p className="text-sm text-gray-300">ID: {gate.id}</p>
                  </div>
                ))}
              </div>
            )}
            {viewModel.getSelectedConnections().length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-white">選択中の接続</h3>
                {viewModel.getSelectedConnections().map(conn => (
                  <div key={conn.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <p className="text-sm text-gray-300">ID: {conn.id}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Progress display */}
            {preferences?.mode === 'education' && (
              <div className="mt-6 p-3 bg-gray-800 rounded">
                <h3 className="font-semibold mb-2 text-white">進捗</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>配置したゲート: {progress.gatesPlaced}</p>
                  <p>完了したチャレンジ: {progress.challengesCompleted}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB for tool palette */}
      {isMobile && !showToolPalette && (
        <button
          onClick={() => setShowToolPalette(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-[#00ff88] text-[#0a0e27] rounded-full shadow-lg flex items-center justify-center hover:bg-[#00cc66] transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Tutorial System */}
      {showTutorial && (
        <TutorialSystemV2
          onComplete={handleTutorialComplete}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Challenge System */}
      {showChallenge && (
        <ChallengeSystem
          onComplete={handleChallengeComplete}
          onClose={() => setShowChallenge(false)}
        />
      )}

      {/* Extended Challenge System */}
      {showExtendedChallenge && (
        <ExtendedChallengeSystem
          onComplete={handleChallengeComplete}
          onClose={() => setShowExtendedChallenge(false)}
        />
      )}

      {/* Progress Tracker */}
      {showProgress && (
        <ProgressTracker
          progress={progress}
          badges={badges}
          onClose={() => setShowProgress(false)}
        />
      )}

      {/* Save/Load Panel */}
      {showSaveLoad && (
        <SaveLoadPanel
          circuit={viewModel.toJSON()}
          onLoad={(circuitData) => {
            // TODO: Load circuit data into viewModel
            setShowSaveLoad(false);
          }}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {/* Gate Definition Dialog */}
      {showGateDefinition && (
        <GateDefinitionDialog
          onSave={handleSaveCustomGate}
          onClose={() => setShowGateDefinition(false)}
        />
      )}

      {/* Custom Gate Detail */}
      {selectedCustomGateDetail && (
        <CustomGateDetail
          gate={selectedCustomGateDetail}
          onEdit={(gateData) => {
            handleSaveCustomGate(gateData);
            setSelectedCustomGateDetail(null);
          }}
          onClose={() => setSelectedCustomGateDetail(null)}
        />
      )}
    </div>
  );
};