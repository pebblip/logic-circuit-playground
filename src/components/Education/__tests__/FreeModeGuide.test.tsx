import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FreeModeGuide } from '../FreeModeGuide';
import { vi, describe, it, beforeEach, expect } from 'vitest';

describe('FreeModeGuide', () => {
  const mockOnStartTutorial = vi.fn();

  beforeEach(() => {
    mockOnStartTutorial.mockClear();
  });

  it('自由制作モードのヘッダーが表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    expect(screen.getByText('🎨 自由制作モード')).toBeInTheDocument();
    expect(screen.getByText('自由に回路を設計・実験できます')).toBeInTheDocument();
  });

  it('クイックスタートセクションが表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    expect(screen.getByText('🚀 クイックスタート')).toBeInTheDocument();
    expect(screen.getByText('チュートリアルを開始')).toBeInTheDocument();
  });

  it('チュートリアル開始ボタンがクリックできる', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    const tutorialButton = screen.getByText('チュートリアルを開始');
    fireEvent.click(tutorialButton);

    expect(mockOnStartTutorial).toHaveBeenCalledTimes(1);
  });

  it('ヒントとコツが表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    expect(screen.getByText('💡 ヒントとコツ')).toBeInTheDocument();
    expect(screen.getByText('基本ゲート')).toBeInTheDocument();
    expect(screen.getByText('カスタムゲート')).toBeInTheDocument();
    expect(screen.getByText('キーボードショートカット')).toBeInTheDocument();
    expect(screen.getByText('保存と共有')).toBeInTheDocument();
  });

  it('ヒントカードをクリックすると詳細が展開される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    const basicGatesCard = screen.getByText('基本ゲート').closest('div');
    
    // 初期状態では詳細は表示されない
    expect(screen.queryByText(/AND, OR, NOT などの基本ゲートから/)).not.toBeInTheDocument();

    // クリックで展開
    fireEvent.click(basicGatesCard!);
    expect(screen.getByText(/AND, OR, NOT などの基本ゲートから/)).toBeInTheDocument();

    // もう一度クリックで閉じる
    fireEvent.click(basicGatesCard!);
    expect(screen.queryByText(/AND, OR, NOT などの基本ゲートから/)).not.toBeInTheDocument();
  });

  it('プロジェクトアイデアが表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    expect(screen.getByText('🎯 プロジェクトアイデア')).toBeInTheDocument();
    expect(screen.getByText('半加算器')).toBeInTheDocument();
    expect(screen.getByText('7セグメントデコーダ')).toBeInTheDocument();
    expect(screen.getByText('マルチプレクサ')).toBeInTheDocument();
    expect(screen.getByText('カウンタ回路')).toBeInTheDocument();
  });

  it('難易度バッジが正しく表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    const easyBadges = screen.getAllByText('簡単');
    const mediumBadges = screen.getAllByText('中級');
    const hardBadges = screen.getAllByText('上級');

    expect(easyBadges.length).toBeGreaterThan(0);
    expect(mediumBadges.length).toBeGreaterThan(0);
    expect(hardBadges.length).toBeGreaterThan(0);
  });

  it('学習リソースセクションが表示される', () => {
    render(
      <FreeModeGuide
        currentMode="free"
        onStartTutorial={mockOnStartTutorial}
      />
    );

    expect(screen.getByText('📚 学習リソース')).toBeInTheDocument();
    expect(screen.getByText(/論理回路の基礎を学ぶには/)).toBeInTheDocument();
  });
});