// 教育機能用カスタムフック

import { useState, useEffect, useCallback } from 'react';
import { LEARNING_OBJECTIVES, TUTORIAL_STEPS, BADGES } from '../constants/education';
import { validateCircuitBehavior, validateSRLatch } from '../utils/circuitValidator';

/**
 * 教育機能を管理するカスタムフック
 */
export const useEducation = () => {
  // 学習進捗の状態管理
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('learningProgress');
    return saved ? JSON.parse(saved) : structuredClone(LEARNING_OBJECTIVES);
  });

  // 獲得バッジの管理
  const [earnedBadges, setEarnedBadges] = useState(() => {
    const saved = localStorage.getItem('earnedBadges');
    return saved ? JSON.parse(saved) : [];
  });

  // 現在のチュートリアル状態
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);

  // 学習モードの状態
  const [learningMode, setLearningMode] = useState('sandbox'); // 'sandbox' | 'tutorial' | 'challenge'

  // 進捗をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  // 目標を完了としてマーク
  const completeObjective = useCallback((level, category, objectiveId) => {
    setProgress(prev => {
      const newProgress = structuredClone(prev);
      const objective = newProgress[level]?.[category]?.find(obj => obj.id === objectiveId);
      if (objective) {
        objective.completed = true;
      }
      return newProgress;
    });

    // バッジのチェック
    checkAndAwardBadges(level, category, objectiveId);
  }, []);

  // バッジの確認と付与
  const checkAndAwardBadges = useCallback((level, category, objectiveId) => {
    // 初めての回路
    if (!earnedBadges.includes('first_circuit') && objectiveId.includes('from_basic')) {
      awardBadge('first_circuit');
    }

    // 真理値表マスター
    const allBasicsCompleted = progress.level1.basics.every(obj => obj.completed);
    if (!earnedBadges.includes('truth_master') && allBasicsCompleted) {
      awardBadge('truth_master');
    }

    // フィードバックループ
    if (!earnedBadges.includes('feedback_loop') && objectiveId === 'sr_latch_nor') {
      awardBadge('feedback_loop');
    }

    // 万能ゲート
    if (!earnedBadges.includes('universal_gate') && objectiveId === 'universal_nand') {
      awardBadge('universal_gate');
    }
  }, [earnedBadges, progress]);

  // バッジを付与
  const awardBadge = useCallback((badgeId) => {
    setEarnedBadges(prev => [...prev, badgeId]);
    // バッジ獲得の通知を表示（実装は後で）
  }, []);

  // チュートリアルを開始
  const startTutorial = useCallback((tutorialId) => {
    setCurrentTutorial(tutorialId);
    setTutorialStep(0);
    setLearningMode('tutorial');
  }, []);

  // チュートリアルの次のステップへ
  const nextTutorialStep = useCallback(() => {
    if (currentTutorial && TUTORIAL_STEPS[currentTutorial]) {
      const maxSteps = TUTORIAL_STEPS[currentTutorial].length;
      if (tutorialStep < maxSteps - 1) {
        setTutorialStep(prev => prev + 1);
      } else {
        // チュートリアル完了
        completeTutorial();
      }
    }
  }, [currentTutorial, tutorialStep]);

  // チュートリアル完了
  const completeTutorial = useCallback(() => {
    if (currentTutorial) {
      // 対応する目標を完了にする
      Object.entries(progress).forEach(([level, categories]) => {
        Object.entries(categories).forEach(([category, objectives]) => {
          const objective = objectives.find(obj => obj.id === currentTutorial);
          if (objective) {
            completeObjective(level, category, currentTutorial);
          }
        });
      });
    }
    
    // チュートリアル状態を完全にクリア
    setCurrentTutorial(null);
    setTutorialStep(0);
    // 学習モードは維持（sandbox に戻さない）
  }, [currentTutorial, progress, completeObjective]);

  // 現在のチュートリアルステップを取得
  const getCurrentTutorialStep = useCallback(() => {
    if (currentTutorial && TUTORIAL_STEPS[currentTutorial]) {
      const step = TUTORIAL_STEPS[currentTutorial][tutorialStep];
      return step;
    }
    return null;
  }, [currentTutorial, tutorialStep]);

  // 進捗率を計算
  const calculateProgress = useCallback((level) => {
    const levelData = progress[level];
    if (!levelData) return 0;

    let total = 0;
    let completed = 0;

    Object.values(levelData).forEach(category => {
      total += category.length;
      completed += category.filter(obj => obj.completed).length;
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress]);

  // チュートリアルステップの検証
  const validateTutorialStep = useCallback((state) => {
    const step = getCurrentTutorialStep();
    if (step && step.validation) {
      return step.validation(state);
    }
    return false;
  }, [getCurrentTutorialStep]);
  
  // 回路の検証
  const validateCircuit = useCallback((gates, connections, targetBehavior) => {
    if (targetBehavior === 'SR_LATCH') {
      return validateSRLatch(gates, connections);
    }
    return validateCircuitBehavior(gates, connections, targetBehavior);
  }, []);

  return {
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
    validateCircuit
  };
};