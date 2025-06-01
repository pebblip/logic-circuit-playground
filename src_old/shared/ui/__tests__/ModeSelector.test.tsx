import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModeSelector } from '../ModeSelector';
import { CircuitMode } from '../../../types/mode';

describe('ModeSelector', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('学習モードが選択された状態で正しく表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const learningButton = screen.getByText('📚 学習モード');
    expect(learningButton).toBeInTheDocument();
  });

  it('自由制作モードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const freeButton = screen.getByText('🎨 自由モード');
    fireEvent.click(freeButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('free');
  });

  it('パズルモードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const puzzleButton = screen.getByText('🧩 パズルモード');
    fireEvent.click(puzzleButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('puzzle');
  });

  it('全てのモードが表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('📚 学習モード')).toBeInTheDocument();
    expect(screen.getByText('🎨 自由モード')).toBeInTheDocument();
    expect(screen.getByText('🧩 パズルモード')).toBeInTheDocument();
  });

  it('各モードに正しいアイコンが表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('📚')).toBeInTheDocument(); // 学習モード
    expect(screen.getByText('🎨')).toBeInTheDocument(); // 自由制作モード
    expect(screen.getByText('🧩')).toBeInTheDocument(); // パズルモード
  });

  it('ホバー時に説明がツールチップとして表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const learningButton = screen.getByText('📚 学習モード');
    expect(learningButton.closest('button')).toHaveAttribute(
      'title',
      'ステップバイステップで論理回路を学ぼう！'
    );
  });
});