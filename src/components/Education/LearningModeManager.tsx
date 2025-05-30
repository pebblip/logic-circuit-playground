import React, { useState, useEffect } from 'react';
import { AppMode } from '../../types/mode';
import { LearningGuide } from './LearningGuide';
import { TutorialOverlay } from './TutorialOverlay';
import { AchievementNotification } from './AchievementNotification';
import { useLearningProgress } from '../../hooks/useLearningProgress';

interface LearningModeManagerProps {
  currentMode: AppMode;
  className?: string;
}

export const LearningModeManager: React.FC<LearningModeManagerProps> = ({
  currentMode,
  className = ''
}) => {
  const {
    progress,
    newAchievements,
    advanceToLesson,
    completeStep,
    completeLesson,
    recordActivity,
    getStatistics
  } = useLearningProgress();

  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // 学習モードでない場合は何も表示しない
  if (currentMode !== 'learning') {
    return null;
  }

  // 新しい実績が解除された時の処理
  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowAchievements(true);
    }
  }, [newAchievements]);

  // チュートリアル開始処理
  const startTutorial = () => {
    setIsTutorialActive(true);
    recordActivity('tutorial_started');
  };

  // チュートリアル完了処理
  const handleTutorialComplete = () => {
    setIsTutorialActive(false);
    completeLesson(progress.currentLesson);
    recordActivity('tutorial_completed');
  };

  // チュートリアルスキップ処理
  const handleTutorialSkip = () => {
    setIsTutorialActive(false);
    recordActivity('tutorial_skipped');
  };

  // ステップ完了処理
  const handleStepComplete = (stepId: string) => {
    completeStep(progress.currentLesson, stepId);
    recordActivity('step_completed', { stepId, lesson: progress.currentLesson });
  };

  // レッスン変更処理
  const handleLessonChange = (lessonId: number) => {
    advanceToLesson(lessonId);
    // 新しいレッスンを開始時にチュートリアルを自動開始
    setIsTutorialActive(true);
  };

  // 実績通知クローズ処理
  const handleAchievementClose = () => {
    setShowAchievements(false);
  };

  const statistics = getStatistics();

  return (
    <div className={`learning-mode-manager ${className}`}>
      {/* 学習ガイドパネル */}
      <LearningGuide
        currentMode={currentMode}
        currentLesson={progress.currentLesson}
        onLessonChange={handleLessonChange}
      />

      {/* 学習進捗サマリー */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#0f172a',
            margin: 0 
          }}>
            学習統計
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#3b82f6' 
            }}>
              {statistics.completionPercentage.toFixed(0)}%
            </div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>
              完了率
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#10b981' 
            }}>
              {statistics.achievementsCount}
            </div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>
              実績解除
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#f59e0b' 
            }}>
              {statistics.hoursSpent}h {statistics.minutesSpent}m
            </div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>
              学習時間
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#ef4444' 
            }}>
              {statistics.currentStreak}
            </div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>
              連続日数
            </div>
          </div>
        </div>
      </div>

      {/* チュートリアル開始ボタン */}
      {!isTutorialActive && (
        <div style={{
          marginTop: '16px',
          textAlign: 'center'
        }}>
          <button
            onClick={startTutorial}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>🎯</span>
            <span>チュートリアルを開始</span>
          </button>
        </div>
      )}

      {/* チュートリアルオーバーレイ */}
      <TutorialOverlay
        currentMode={currentMode}
        currentLesson={progress.currentLesson}
        currentStep={progress.currentStep}
        onStepComplete={handleStepComplete}
        onTutorialComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        isActive={isTutorialActive}
      />

      {/* 実績通知 */}
      {showAchievements && newAchievements.length > 0 && (
        <AchievementNotification
          achievements={newAchievements}
          onClose={handleAchievementClose}
        />
      )}
    </div>
  );
};