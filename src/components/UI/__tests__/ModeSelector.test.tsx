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

  it('探検モードが選択された状態で正しく表示される', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    const discoveryButton = screen.getByText('探検モード');
    expect(discoveryButton).toBeInTheDocument();
  });

  it('実験室モードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    const sandboxButton = screen.getByText('実験室モード');
    fireEvent.click(sandboxButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('sandbox');
  });

  it('チャレンジモードに切り替えができる', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    const challengeButton = screen.getByText('チャレンジモード');
    fireEvent.click(challengeButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('challenge');
  });

  it('全てのモードが表示される', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('探検モード')).toBeInTheDocument();
    expect(screen.getByText('実験室モード')).toBeInTheDocument();
    expect(screen.getByText('チャレンジモード')).toBeInTheDocument();
  });

  it('各モードに正しいアイコンが表示される', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('🔍')).toBeInTheDocument(); // 探検モード
    expect(screen.getByText('🧪')).toBeInTheDocument(); // 実験室モード
    expect(screen.getByText('🏆')).toBeInTheDocument(); // チャレンジモード
  });

  it('ホバー時に説明がツールチップとして表示される', () => {
    render(
      <ModeSelector
        currentMode="discovery" as CircuitMode
        onModeChange={mockOnModeChange}
      />
    );

    const discoveryButton = screen.getByText('探検モード');
    expect(discoveryButton.closest('button')).toHaveAttribute(
      'title',
      '論理ゲートの世界を探検しよう！'
    );
  });
});