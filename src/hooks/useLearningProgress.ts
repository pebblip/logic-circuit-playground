import { useState, useEffect, useCallback } from 'react';

export interface LearningProgress {
  currentLesson: number;
  currentStep: number;
  completedLessons: number[];
  completedSteps: Record<number, string[]>; // lessonId -> stepIds
  achievements: string[];
  totalTimeSpent: number; // seconds
  lastActivity: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockCondition: (progress: LearningProgress) => boolean;
}

// 実績定義
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_gate',
    title: '初めてのゲート',
    description: '最初のゲートを配置しました',
    icon: '🚀',
    unlockCondition: (progress) => progress.achievements.includes('gate_placed')
  },
  {
    id: 'first_connection',
    title: '繋がりの発見',
    description: '初めての接続を作成しました',
    icon: '🔗',
    unlockCondition: (progress) => progress.achievements.includes('connection_created')
  },
  {
    id: 'logic_master',
    title: '論理の達人',
    description: '基本ゲートをすべて理解しました',
    icon: '🧠',
    unlockCondition: (progress) => progress.completedLessons.includes(4)
  },
  {
    id: 'circuit_architect',
    title: '回路設計士',
    description: '複合回路を設計しました',
    icon: '🏗️',
    unlockCondition: (progress) => progress.completedLessons.includes(5)
  },
  {
    id: 'speed_learner',
    title: 'スピードラーナー',
    description: '1時間以内に3レッスンを完了しました',
    icon: '⚡',
    unlockCondition: (progress) => {
      // 簡単な実装 - 実際はタイムスタンプを使用
      return progress.completedLessons.length >= 3;
    }
  },
  {
    id: 'persistent',
    title: '継続は力なり',
    description: '7日間連続で学習しました',
    icon: '🔥',
    unlockCondition: (progress) => {
      // 実装簡略化 - 実際は日付追跡が必要
      return progress.totalTimeSpent > 3600; // 1時間以上
    }
  }
];

const STORAGE_KEY = 'learning-progress-v2';

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress>({
    currentLesson: 1,
    currentStep: 0,
    completedLessons: [],
    completedSteps: {},
    achievements: [],
    totalTimeSpent: 0,
    lastActivity: new Date().toISOString()
  });

  const [sessionStartTime] = useState(Date.now());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // ローカルストレージから進捗を読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedProgress = JSON.parse(saved);
        setProgress(parsedProgress);
      } catch (e) {
        console.warn('Failed to parse learning progress:', e);
      }
    }
  }, []);

  // 進捗をローカルストレージに保存
  const saveProgress = useCallback((newProgress: LearningProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // セッション時間の更新
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      setProgress(prev => {
        const updated = {
          ...prev,
          totalTimeSpent: prev.totalTimeSpent + 1,
          lastActivity: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // 実績チェック
  const checkAchievements = useCallback((newProgress: LearningProgress) => {
    const currentAchievementIds = new Set(newProgress.achievements);
    const unlockedAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (!currentAchievementIds.has(achievement.id) && 
          achievement.unlockCondition(newProgress)) {
        unlockedAchievements.push(achievement);
        currentAchievementIds.add(achievement.id);
      }
    });

    if (unlockedAchievements.length > 0) {
      const updated = {
        ...newProgress,
        achievements: Array.from(currentAchievementIds)
      };
      saveProgress(updated);
      setNewAchievements(unlockedAchievements);
      
      // 3秒後に新実績通知をクリア
      setTimeout(() => {
        setNewAchievements([]);
      }, 3000);
    }
  }, [saveProgress]);

  // レッスン進行
  const advanceToLesson = useCallback((lessonId: number) => {
    const updated = {
      ...progress,
      currentLesson: lessonId,
      currentStep: 0,
      lastActivity: new Date().toISOString()
    };
    saveProgress(updated);
    checkAchievements(updated);
  }, [progress, saveProgress, checkAchievements]);

  // ステップ完了
  const completeStep = useCallback((lessonId: number, stepId: string) => {
    const lessonSteps = progress.completedSteps[lessonId] || [];
    if (!lessonSteps.includes(stepId)) {
      const updated = {
        ...progress,
        completedSteps: {
          ...progress.completedSteps,
          [lessonId]: [...lessonSteps, stepId]
        },
        currentStep: progress.currentStep + 1,
        lastActivity: new Date().toISOString()
      };
      saveProgress(updated);
      checkAchievements(updated);
    }
  }, [progress, saveProgress, checkAchievements]);

  // レッスン完了
  const completeLesson = useCallback((lessonId: number) => {
    if (!progress.completedLessons.includes(lessonId)) {
      const updated = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId],
        currentLesson: lessonId + 1,
        currentStep: 0,
        lastActivity: new Date().toISOString()
      };
      saveProgress(updated);
      checkAchievements(updated);
    }
  }, [progress, saveProgress, checkAchievements]);

  // アクティビティ記録
  const recordActivity = useCallback((activityType: string, data?: any) => {
    const updated = {
      ...progress,
      lastActivity: new Date().toISOString()
    };

    // 特定のアクティビティに基づく実績解除
    switch (activityType) {
      case 'gate_placed':
        if (!progress.achievements.includes('gate_placed')) {
          updated.achievements = [...progress.achievements, 'gate_placed'];
        }
        break;
      case 'connection_created':
        if (!progress.achievements.includes('connection_created')) {
          updated.achievements = [...progress.achievements, 'connection_created'];
        }
        break;
    }

    saveProgress(updated);
    checkAchievements(updated);
  }, [progress, saveProgress, checkAchievements]);

  // 進捗リセット
  const resetProgress = useCallback(() => {
    const fresh: LearningProgress = {
      currentLesson: 1,
      currentStep: 0,
      completedLessons: [],
      completedSteps: {},
      achievements: [],
      totalTimeSpent: 0,
      lastActivity: new Date().toISOString()
    };
    saveProgress(fresh);
  }, [saveProgress]);

  // 統計計算
  const getStatistics = useCallback(() => {
    const totalLessons = 6; // 現在のカリキュラム数
    const completionPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
    const hoursSpent = Math.floor(progress.totalTimeSpent / 3600);
    const minutesSpent = Math.floor((progress.totalTimeSpent % 3600) / 60);

    return {
      completionPercentage,
      hoursSpent,
      minutesSpent,
      achievementsCount: progress.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
      currentStreak: calculateStreak()
    };
  }, [progress]);

  // 連続学習日数計算（簡略化）
  const calculateStreak = useCallback(() => {
    // 実際の実装では日付ベースの追跡が必要
    return Math.min(progress.completedLessons.length, 7);
  }, [progress.completedLessons.length]);

  return {
    progress,
    newAchievements,
    advanceToLesson,
    completeStep,
    completeLesson,
    recordActivity,
    resetProgress,
    getStatistics,
    achievements: ACHIEVEMENTS
  };
};