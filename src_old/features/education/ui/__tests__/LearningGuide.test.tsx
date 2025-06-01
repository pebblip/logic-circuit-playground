import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LearningGuide } from '../LearningGuide';

// LocalStorageモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LearningGuide', () => {
  const mockOnLessonChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('学習モードで正しく表示される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(screen.getByText('学習ガイド')).toBeInTheDocument();
    expect(screen.getByText('全体進捗')).toBeInTheDocument();
  });

  it('学習モード以外では何も表示しない', () => {
    const { container } = render(
      <LearningGuide
        currentMode="free"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('レッスン一覧が正しく表示される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(screen.getAllByText('プレイグラウンドの基本操作')).toHaveLength(2); // ヘッダーとリストの両方
    expect(screen.getByText('ANDゲートの世界')).toBeInTheDocument();
    expect(screen.getByText('ORゲートの理解')).toBeInTheDocument();
  });

  it('レッスンクリックで展開される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    const lessonTitles = screen.getAllByText('プレイグラウンドの基本操作');
    fireEvent.click(lessonTitles[1]); // リストの方をクリック

    expect(mockOnLessonChange).toHaveBeenCalledWith(1);
  });

  it('現在のレッスンが強調表示される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={2}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(screen.getAllByText('ANDゲートの世界')).toHaveLength(2); // ヘッダーとリストの両方
  });

  it('保存された進捗を正しく読み込む', () => {
    const savedProgress = {
      completedLessons: [1, 2],
      lastUpdate: '2023-01-01'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));

    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('learning-progress');
  });

  it('難易度バッジが正しく表示される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    expect(screen.getAllByText('初級')).toHaveLength(4); // 4つの初級レッスン
    expect(screen.getAllByText('中級')).toHaveLength(2); // 2つの中級レッスン
  });

  it('ロックされたレッスンが正しく表示される', () => {
    render(
      <LearningGuide
        currentMode="learning"
        currentLesson={1}
        onLessonChange={mockOnLessonChange}
      />
    );

    // 最初のレッスン以外はロックされているはず
    const lockIcons = screen.getAllByText('🔒');
    expect(lockIcons.length).toBeGreaterThan(0);
  });
});