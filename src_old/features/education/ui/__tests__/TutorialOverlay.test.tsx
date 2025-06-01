import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TutorialOverlay } from '../TutorialOverlay';
import { vi, describe, it, beforeEach, expect } from 'vitest';

describe('TutorialOverlay', () => {
  const mockOnStepComplete = vi.fn();
  const mockOnTutorialComplete = vi.fn();
  const mockOnSkip = vi.fn();

  const defaultProps = {
    currentMode: 'learning' as const,
    currentLesson: 1,
    currentStep: 0,
    onStepComplete: mockOnStepComplete,
    onTutorialComplete: mockOnTutorialComplete,
    onSkip: mockOnSkip,
    isActive: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('学習モードでアクティブな時のみ表示される', () => {
    const { rerender } = render(<TutorialOverlay {...defaultProps} />);
    expect(screen.getByText('🎉 ようこそ論理回路の世界へ！')).toBeInTheDocument();

    // 非アクティブ時は非表示
    rerender(<TutorialOverlay {...defaultProps} isActive={false} />);
    expect(screen.queryByText('🎉 ようこそ論理回路の世界へ！')).not.toBeInTheDocument();

    // 学習モード以外では非表示
    rerender(<TutorialOverlay {...defaultProps} currentMode="free" />);
    expect(screen.queryByText('🎉 ようこそ論理回路の世界へ！')).not.toBeInTheDocument();
  });

  it('現在のステップの内容が表示される', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    // レッスン1、ステップ0の内容
    expect(screen.getByText('🎉 ようこそ論理回路の世界へ！')).toBeInTheDocument();
    expect(screen.getByText(/このプレイグラウンドでは、コンピュータの心臓部である/)).toBeInTheDocument();
  });

  it('ステップ進行が正しく表示される', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    // ステップ表示
    expect(screen.getByText('1/10')).toBeInTheDocument(); // レッスン1は10ステップ
  });

  it('次へボタンをクリックするとonStepCompleteが呼ばれる', () => {
    render(<TutorialOverlay {...defaultProps} />);
    
    const nextButton = screen.getByText('次へ').closest('button');
    fireEvent.click(nextButton!);
    
    expect(mockOnStepComplete).toHaveBeenCalledWith('welcome');
  });

  it('最後のステップでは完了ボタンが表示される', () => {
    render(<TutorialOverlay {...defaultProps} currentStep={9} />); // レッスン1の最終ステップ（0ベースで9）
    
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.queryByText('次へ')).not.toBeInTheDocument();
  });

  it('完了ボタンをクリックするとonTutorialCompleteが呼ばれる', () => {
    render(<TutorialOverlay {...defaultProps} currentStep={9} />); // レッスン1の最終ステップ（0ベースで9）
    
    const completeButton = screen.getByText('完了').closest('button');
    fireEvent.click(completeButton!);
    
    expect(mockOnTutorialComplete).toHaveBeenCalled();
  });

  it('スキップ可能なステップではスキップボタンが表示される', () => {
    render(<TutorialOverlay {...defaultProps} />); // ステップ0はskippable: true
    
    const skipButton = screen.getByText('スキップ');
    expect(skipButton).toBeInTheDocument();
    
    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('プログレスバーが進行状況を表示する', () => {
    const { container } = render(<TutorialOverlay {...defaultProps} />);
    
    // プログレスバーの幅をチェック
    const progressBar = container.querySelector('div[style*="linear-gradient(90deg, #10b981, #34d399)"]');
    expect(progressBar).toHaveStyle({ width: '10%' }); // 1/10
  });

  it('レッスン2の内容も正しく表示される', () => {
    render(<TutorialOverlay {...defaultProps} currentLesson={2} currentStep={0} />);
    
    expect(screen.getByText('🤝 論理ゲートを学ぼう')).toBeInTheDocument();
    expect(screen.getByText(/論理ゲートは、入力信号を処理して/)).toBeInTheDocument();
  });

  it('ターゲット要素がない場合は中央に表示される', () => {
    const { container } = render(<TutorialOverlay {...defaultProps} />);
    
    const overlayPanel = container.querySelector('div[style*="transform: translate(-50%, -50%)"]');
    expect(overlayPanel).toBeTruthy();
  });

  it('存在しないレッスンやステップの場合は何も表示しない', () => {
    const { container } = render(
      <TutorialOverlay {...defaultProps} currentLesson={99} currentStep={0} />
    );
    
    // オーバーレイのルート要素が存在しない
    expect(container.firstChild).toBeNull();
  });

  it('ダークオーバーレイが表示される', () => {
    const { container } = render(<TutorialOverlay {...defaultProps} />);
    
    const darkOverlay = container.querySelector('div[style*="background: rgba(0, 0, 0, 0.7)"]');
    expect(darkOverlay).toBeTruthy();
    expect(darkOverlay).toHaveStyle({ pointerEvents: 'none' });
  });
});