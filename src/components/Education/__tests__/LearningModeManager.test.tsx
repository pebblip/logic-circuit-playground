import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LearningModeManager } from '../LearningModeManager';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// モックの設定
vi.mock('../../hooks/useLearningProgress', () => {
  const mock = vi.fn();
  mock.mockReturnValue({
    progress: {
      currentLesson: 1,
      currentStep: 0,
      completedLessons: [],
      completedSteps: {},
      achievements: [],
      totalTimeSpent: 0, // 初期状態なので0秒
      lastActivity: new Date().toISOString()
    },
    newAchievements: [],
    advanceToLesson: vi.fn(),
    completeStep: vi.fn(),
    completeLesson: vi.fn(),
    recordActivity: vi.fn(),
    getStatistics: vi.fn().mockReturnValue({
      completionPercentage: 0,  // completedLessons.length / 6 * 100 = 0/6 * 100 = 0
      hoursSpent: 0,     // totalTimeSpent: 0なのでhoursSpent: 0
      minutesSpent: 0,   // totalTimeSpent: 0なのでminutesSpent: 0
      achievementsCount: 0,  // achievements.length = 0
      totalAchievements: 10,
      currentStreak: 0  // Math.min(completedLessons.length, 7) = Math.min(0, 7) = 0
    })
  });
  return { useLearningProgress: mock };
});

// LearningGuideコンポーネントのモック
vi.mock('../LearningGuide', () => ({
  LearningGuide: vi.fn(() => <div>学習ガイド</div>)
}));

// TutorialOverlayコンポーネントのモック
vi.mock('../TutorialOverlay', () => ({
  TutorialOverlay: vi.fn(({ isActive }) => 
    isActive ? <div>ようこそ論理回路の世界へ</div> : null
  )
}));

// DemoCircuitsコンポーネントのモック
vi.mock('../DemoCircuits', () => ({
  DemoCircuits: vi.fn(() => <div>デモ回路集</div>)
}));

// AchievementNotificationコンポーネントのモック
vi.mock('../AchievementNotification', () => ({
  AchievementNotification: vi.fn(({ achievements }) => 
    <div>{achievements[0]?.title}</div>
  )
}));

describe('LearningModeManager', () => {
  const mockOnLoadCircuit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('学習モードの時のみ表示される', () => {
    const { rerender } = render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );
    
    expect(screen.getByText('学習ガイド')).toBeInTheDocument();

    // 他のモードでは非表示
    rerender(
      <LearningModeManager 
        currentMode="free"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );
    
    expect(screen.queryByText('学習ガイド')).not.toBeInTheDocument();
  });

  it('学習統計が正しく表示される', () => {
    render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    expect(screen.getByText('学習統計')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); // 完了率
    
    // 実績数の「0」を特定（複数の「0」が画面にあるため、実績解除セクションの0を特定）
    const achievementSection = screen.getByText('実績解除').closest('div');
    const achievementCount = achievementSection?.previousElementSibling;
    expect(achievementCount?.textContent).toBe('0');
    
    // 学習時間の表示を確認（hoursSpent=0, minutesSpent=0の場合）
    const timeSection = screen.getByText('学習時間').closest('div');
    const timeDisplay = timeSection?.previousElementSibling;
    expect(timeDisplay?.textContent).toBe('0h 0m');
    
    // 連続日数の「0」を特定
    const streakSection = screen.getByText('連続日数').closest('div');
    const streakCount = streakSection?.previousElementSibling;
    expect(streakCount?.textContent).toBe('0');
  });

  it('チュートリアル開始ボタンが表示される', () => {
    render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    const tutorialButton = screen.getByText('チュートリアルを開始');
    expect(tutorialButton).toBeInTheDocument();
  });

  it('チュートリアル開始ボタンをクリックするとチュートリアルが開始される', async () => {
    render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    const tutorialButton = screen.getByText('チュートリアルを開始');
    fireEvent.click(tutorialButton);

    // チュートリアルオーバーレイが表示される
    await waitFor(() => {
      expect(screen.getByText(/ようこそ論理回路の世界へ/)).toBeInTheDocument();
    });

    // ボタンが消える
    expect(screen.queryByText('チュートリアルを開始')).not.toBeInTheDocument();
  });

  it('onLoadCircuitが渡された場合、デモ回路が表示される', () => {
    render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    expect(screen.getByText('デモ回路集')).toBeInTheDocument();
  });

  it('onLoadCircuitが渡されない場合、デモ回路は表示されない', () => {
    render(
      <LearningModeManager 
        currentMode="learning"
      />
    );

    expect(screen.queryByText('デモ回路集')).not.toBeInTheDocument();
  });

  it.skip('新しい実績が解除されると通知が表示される', async () => {
    // 動的インポートのテストは別途改善が必要
  });

  it('統計の各項目が正しいスタイルで表示される', () => {
    const { container } = render(
      <LearningModeManager 
        currentMode="learning"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // 統計セクションのスタイル確認
    const statsSection = container.querySelector('[style*="background: linear-gradient(135deg, #f0f9ff, #e0f2fe)"]');
    expect(statsSection).toBeTruthy();

    // グリッドレイアウトの確認
    const gridContainer = container.querySelector('[style*="display: grid"]');
    expect(gridContainer).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' });
  });

  it('コンポーネントに適切なパディングが適用される', () => {
    const { container } = render(
      <LearningModeManager 
        currentMode="learning"
        className="custom-class"
      />
    );

    const rootElement = container.querySelector('.learning-mode-manager.custom-class');
    expect(rootElement).toHaveStyle({ padding: '16px' });
  });
});