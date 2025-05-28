import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
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

    const learningButton = screen.getByText('学習モード');
    expect(learningButton).toBeInTheDocument();
  });

  it('構築モードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const buildingButton = screen.getByText('構築モード');
    fireEvent.click(buildingButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('building');
  });

  it('CPUモードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const cpuButton = screen.getByText('CPUモード');
    fireEvent.click(cpuButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('cpu');
  });

  it('全てのモードが表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('学習モード')).toBeInTheDocument();
    expect(screen.getByText('構築モード')).toBeInTheDocument();
    expect(screen.getByText('CPUモード')).toBeInTheDocument();
  });

  it('各モードに正しいアイコンが表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('🔧')).toBeInTheDocument();
    expect(screen.getByText('💻')).toBeInTheDocument();
  });

  it('ホバー時に説明がツールチップとして表示される', () => {
    render(
      <ModeSelector
        currentMode="learning"
        onModeChange={mockOnModeChange}
      />
    );

    const learningButton = screen.getByText('学習モード');
    expect(learningButton.closest('button')).toHaveAttribute(
      'title',
      '基本的な論理ゲートを学習'
    );
  });
});