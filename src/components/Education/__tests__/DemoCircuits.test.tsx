import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DemoCircuits } from '../DemoCircuits';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

describe('DemoCircuits', () => {
  const mockOnLoadCircuit = vi.fn();
  const originalConfirm = window.confirm;

  beforeEach(() => {
    mockOnLoadCircuit.mockClear();
    // confirmをモック
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    // confirmを元に戻す
    window.confirm = originalConfirm;
  });

  it('デモ回路一覧が表示される', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    expect(screen.getByText('デモ回路集')).toBeInTheDocument();
    expect(screen.getByText('AND ゲートの基本')).toBeInTheDocument();
    expect(screen.getByText('OR と NOT の組み合わせ')).toBeInTheDocument();
  });

  it('タグフィルターが機能する', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // 初期状態では全て表示
    expect(screen.getByText('AND ゲートの基本')).toBeInTheDocument();
    expect(screen.getByText('半加算器')).toBeInTheDocument();

    // 基本タグでフィルタ
    const basicTag = screen.getByRole('button', { name: '基本' });
    fireEvent.click(basicTag);

    // 基本タグの回路のみ表示
    expect(screen.getByText('AND ゲートの基本')).toBeInTheDocument();
    expect(screen.queryByText('半加算器')).not.toBeInTheDocument();
  });

  it('デモ回路をクリックすると詳細が展開される', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    const demoItem = screen.getByText('AND ゲートの基本');
    
    // 初期状態では説明文は非表示
    expect(screen.queryByText('2つの入力とANDゲートを使った最も簡単な回路です')).not.toBeInTheDocument();

    // クリックで展開
    fireEvent.click(demoItem);
    expect(screen.getByText('2つの入力とANDゲートを使った最も簡単な回路です')).toBeInTheDocument();
    expect(screen.getByText('この回路を読み込む')).toBeInTheDocument();
  });

  it('回路読み込みボタンをクリックするとコールバックが呼ばれる', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // デモを展開
    const demoItem = screen.getByText('AND ゲートの基本');
    fireEvent.click(demoItem);

    // 読み込みボタンをクリック
    const loadButton = screen.getByText('この回路を読み込む');
    fireEvent.click(loadButton);

    // コールバックが呼ばれたことを確認
    expect(mockOnLoadCircuit).toHaveBeenCalledTimes(1);
    expect(mockOnLoadCircuit).toHaveBeenCalledWith(expect.objectContaining({
      gates: expect.arrayContaining([
        expect.objectContaining({ type: 'INPUT' }),
        expect.objectContaining({ type: 'AND' }),
        expect.objectContaining({ type: 'OUTPUT' })
      ]),
      connections: expect.any(Array)
    }));
  });

  it('難易度バッジが正しく表示される', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // 簡単バッジ
    const easyBadges = screen.getAllByText('簡単');
    expect(easyBadges.length).toBeGreaterThan(0);

    // 中級バッジ
    const mediumBadges = screen.getAllByText('中級');
    expect(mediumBadges.length).toBeGreaterThan(0);

    // 上級バッジ
    const hardBadges = screen.getAllByText('上級');
    expect(hardBadges.length).toBeGreaterThan(0);
  });

  it('複数のデモを同時に展開できる', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // 1つ目を展開
    fireEvent.click(screen.getByText('AND ゲートの基本'));
    expect(screen.getByText('2つの入力とANDゲートを使った最も簡単な回路です')).toBeInTheDocument();

    // 2つ目も展開（1つ目は閉じる）
    fireEvent.click(screen.getByText('OR と NOT の組み合わせ'));
    expect(screen.queryByText('2つの入力とANDゲートを使った最も簡単な回路です')).not.toBeInTheDocument();
    expect(screen.getByText('ORゲートの出力をNOTゲートで反転する回路です')).toBeInTheDocument();
  });

  it('すべてタグをクリックすると全回路が表示される', () => {
    render(
      <DemoCircuits 
        currentMode="learning" 
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    // 特定のタグでフィルタ
    fireEvent.click(screen.getByRole('button', { name: '基本' }));
    const basicOnlyCount = screen.getAllByRole('heading', { level: 4 }).length;

    // すべてに戻す
    fireEvent.click(screen.getByRole('button', { name: 'すべて' }));
    const allCount = screen.getAllByRole('heading', { level: 4 }).length;

    // 全表示の方が多い
    expect(allCount).toBeGreaterThan(basicOnlyCount);
  });
});