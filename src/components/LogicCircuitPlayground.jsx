import React, { useState, useCallback, useEffect } from 'react';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { useEducation } from '../hooks/useEducation';
import { TUTORIAL_CONTENT } from '../data/tutorialContent';
import Header from './Header';
import ToolBar from './ToolBar';
import LearningControls from './LearningControls';
import Canvas from './Canvas';
import ContextualHelp from './ContextualHelp';
import { analyzeCircuitErrors } from '../utils/errorAnalysis';
import { calculateCircuit } from '../utils/circuit';

const LogicCircuitPlayground = () => {
  // 回路の状態
  const [circuit, setCircuit] = useState({
    gates: [],
    connections: [],
    inputs: [],
    outputs: []
  });
  
  // UI状態
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  // 学習状態
  const { 
    currentTutorial,
    setCurrentTutorial,
    completeTutorial,
    progress
  } = useEducation();
  
  // currentLessonをcurrentTutorialにマッピング
  const [currentLesson, setCurrentLesson] = useState('and_gate');
  
  // レッスン完了チェック関数
  const isLessonCompleted = (lessonId) => {
    // progressから完了状態を確認
    for (const level of Object.values(progress)) {
      for (const category of Object.values(level)) {
        const objective = category.find(obj => obj.id === lessonId);
        if (objective) {
          return objective.completed || false;
        }
      }
    }
    return false;
  };
  
  // レッスン完了処理
  const completeLesson = (lessonId) => {
    setCurrentTutorial(lessonId);
    completeTutorial();
  };
  
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // シミュレーション
  const { simulation: results, isSimulating } = useCircuitSimulation(circuit.gates || [], circuit.connections || []);
  
  // ヘルプメッセージの生成
  const getContextualHelp = useCallback(() => {
    // 現在のレッスンのヘルプ
    if (currentLesson && TUTORIAL_CONTENT[currentLesson]) {
      const lessonContent = TUTORIAL_CONTENT[currentLesson];
      if (showHint) {
        return lessonContent.hint || lessonContent.sections[0]?.content;
      }
      return lessonContent.sections[0]?.title || lessonContent.title;
    }
    
    // ツール選択時のヘルプ
    if (selectedTool) {
      const toolHelps = {
        'and': 'ANDゲート：両方の入力がONの時だけONを出力します',
        'or': 'ORゲート：どちらか一方でもONならONを出力します',
        'not': 'NOTゲート：入力を反転します（ON→OFF、OFF→ON）',
        'input': '入力スイッチ：クリックでON/OFFを切り替えます',
        'output': '出力表示：接続された信号の状態を表示します',
        'wire': '配線：出力端子から入力端子へドラッグして接続します',
        'delete': '削除：クリックでゲートや配線を削除します'
      };
      return toolHelps[selectedTool] || '';
    }
    
    // デフォルトメッセージ
    return 'ツールを選んで回路を作ってみましょう！';
  }, [currentLesson, selectedTool, showHint]);
  
  // 回路の更新
  const updateCircuit = useCallback((newCircuit) => {
    setCircuit(newCircuit);
    
    // シミュレーション実行
    const simResults = calculateCircuit(newCircuit.gates || [], newCircuit.connections || []);
    
    // エラー分析
    const errors = analyzeCircuitErrors(newCircuit, simResults);
    
    // レッスンの完了チェック
    if (currentLesson && errors.length === 0) {
      checkLessonCompletion(newCircuit, simResults);
    }
  }, [currentLesson]);
  
  // レッスン完了チェック
  const checkLessonCompletion = useCallback((circuit, results) => {
    // レッスンごとの完了条件をチェック
    const lessonChecks = {
      'and_gate': () => {
        // ANDゲートが正しく動作しているか
        const hasAndGate = circuit.gates.some(g => g.type === 'AND');
        const hasInputs = circuit.inputs.length >= 2;
        const hasOutput = circuit.outputs.length >= 1;
        return hasAndGate && hasInputs && hasOutput;
      },
      'or_gate': () => {
        const hasOrGate = circuit.gates.some(g => g.type === 'OR');
        const hasInputs = circuit.inputs.length >= 2;
        const hasOutput = circuit.outputs.length >= 1;
        return hasOrGate && hasInputs && hasOutput;
      },
      'not_gate': () => {
        const hasNotGate = circuit.gates.some(g => g.type === 'NOT');
        const hasInput = circuit.inputs.length >= 1;
        const hasOutput = circuit.outputs.length >= 1;
        return hasNotGate && hasInput && hasOutput;
      }
    };
    
    const checker = lessonChecks[currentLesson];
    if (checker && checker()) {
      completeLesson(currentLesson);
      // 次のレッスンへ自動遷移（オプション）
      const lessons = Object.keys(TUTORIAL_CONTENT);
      const currentIndex = lessons.indexOf(currentLesson);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => {
          setCurrentLesson(lessons[currentIndex + 1]);
          setShowHint(false);
          setShowAnswer(false);
        }, 2000);
      }
    }
  }, [currentLesson, completeLesson, setCurrentLesson]);
  
  // ツール選択
  const handleToolSelect = useCallback((tool) => {
    setSelectedTool(tool);
    setSelectedComponent(null);
  }, []);
  
  // コンポーネント選択
  const handleComponentSelect = useCallback((component) => {
    setSelectedComponent(component);
    setSelectedTool(null);
  }, []);
  
  // 答えを表示
  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
    // レッスンの模範回答を回路に設定
    if (currentLesson && TUTORIAL_CONTENT[currentLesson]?.answer) {
      const answerCircuit = TUTORIAL_CONTENT[currentLesson].answer;
      setCircuit(answerCircuit);
      updateCircuit(answerCircuit);
    }
  }, [currentLesson, updateCircuit]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* シンプルなヘッダー */}
      <Header />
      
      {/* ツールバー */}
      <ToolBar 
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
      />
      
      {/* 学習コントロール */}
      <LearningControls
        currentLesson={currentLesson}
        onLessonChange={setCurrentLesson}
        showHint={showHint}
        onToggleHint={() => setShowHint(!showHint)}
        onShowAnswer={handleShowAnswer}
        isLessonCompleted={isLessonCompleted(currentLesson)}
      />
      
      {/* メインキャンバス */}
      <div className="flex-1 relative">
        <Canvas
          circuit={circuit}
          onCircuitUpdate={updateCircuit}
          selectedTool={selectedTool}
          selectedComponent={selectedComponent}
          onComponentSelect={handleComponentSelect}
          simulationResults={results}
          showAnswer={showAnswer}
        />
      </div>
      
      {/* コンテキストヘルプ */}
      <ContextualHelp
        message={getContextualHelp()}
        type={showHint ? 'hint' : 'info'}
      />
    </div>
  );
};

export default LogicCircuitPlayground;