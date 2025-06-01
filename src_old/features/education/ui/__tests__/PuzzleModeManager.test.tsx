import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PuzzleModeManager } from '../PuzzleModeManager';
import { vi, describe, it, beforeEach, expect } from 'vitest';

describe('PuzzleModeManager', () => {
  const mockOnLoadCircuit = vi.fn();

  beforeEach(() => {
    mockOnLoadCircuit.mockClear();
  });

  it('パズル一覧が表示される', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    expect(screen.getByText('🧩 パズルモード')).toBeInTheDocument();
    expect(screen.getByText('XORゲートを作ろう')).toBeInTheDocument();
    expect(screen.getByText('半加算器')).toBeInTheDocument();
    expect(screen.getByText('SRラッチ')).toBeInTheDocument();
  });

  it('パズルをクリックすると詳細が表示される', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    const xorPuzzle = screen.getByText('XORゲートを作ろう');
    fireEvent.click(xorPuzzle);

    expect(screen.getByText('← パズル一覧に戻る')).toBeInTheDocument();
    expect(screen.getByText('目標:')).toBeInTheDocument();
    expect(screen.getByText('ヒントを見る')).toBeInTheDocument();
    expect(screen.getByText('答えを確認')).toBeInTheDocument();
  });

  it('パズル選択時に回路がクリアされる', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    const xorPuzzle = screen.getByText('XORゲートを作ろう');
    fireEvent.click(xorPuzzle);

    expect(mockOnLoadCircuit).toHaveBeenCalledWith({ gates: [], connections: [] });
  });

  it('ヒントボタンで順番にヒントが表示される', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    fireEvent.click(screen.getByText('XORゲートを作ろう'));
    
    // 最初のヒント
    fireEvent.click(screen.getByText('ヒントを見る'));
    expect(screen.getByText(/XORは「排他的論理和」です/)).toBeInTheDocument();

    // 次のヒント
    fireEvent.click(screen.getByText('次のヒント'));
    expect(screen.getByText(/入力が異なるときだけ出力が1になります/)).toBeInTheDocument();

    // 3番目のヒント
    fireEvent.click(screen.getByText('次のヒント'));
    expect(screen.getByText(/AND, OR, NOTゲートを組み合わせて作れます/)).toBeInTheDocument();
  });

  it('進捗状況が正しく表示される', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    expect(screen.getByText('完了: 0 / 3')).toBeInTheDocument();
  });

  it('不正解の回路で答えを確認するとエラーメッセージが表示される', () => {
    const mockAlert = vi.fn();
    global.alert = mockAlert;

    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
        gates={[]}
        connections={[]}
      />
    );

    fireEvent.click(screen.getByText('XORゲートを作ろう'));
    fireEvent.click(screen.getByText('答えを確認'));

    expect(mockAlert).toHaveBeenCalledWith('まだ正解ではありません。もう一度試してみてください。');
  });

  it('正解の回路で答えを確認すると成功メッセージが表示される', () => {
    const mockAlert = vi.fn();
    global.alert = mockAlert;

    // 正しいXOR回路のゲートと接続
    const correctGates = [
      { id: 'input1', type: 'INPUT', x: 100, y: 100 },
      { id: 'input2', type: 'INPUT', x: 100, y: 200 },
      { id: 'and1', type: 'AND', x: 200, y: 120 },
      { id: 'and2', type: 'AND', x: 200, y: 180 },
      { id: 'not1', type: 'NOT', x: 150, y: 120 },
      { id: 'not2', type: 'NOT', x: 150, y: 180 },
      { id: 'or1', type: 'OR', x: 300, y: 150 },
      { id: 'output1', type: 'OUTPUT', x: 400, y: 150 }
    ];

    const correctConnections = [
      { id: 'c1', from: 'input1', fromOutput: 0, to: 'not2', toInput: 0 },
      { id: 'c2', from: 'input2', fromOutput: 0, to: 'not1', toInput: 0 },
      { id: 'c3', from: 'input1', fromOutput: 0, to: 'and1', toInput: 0 },
      { id: 'c4', from: 'not1', fromOutput: 0, to: 'and1', toInput: 1 },
      { id: 'c5', from: 'not2', fromOutput: 0, to: 'and2', toInput: 0 },
      { id: 'c6', from: 'input2', fromOutput: 0, to: 'and2', toInput: 1 },
      { id: 'c7', from: 'and1', fromOutput: 0, to: 'or1', toInput: 0 },
      { id: 'c8', from: 'and2', fromOutput: 0, to: 'or1', toInput: 1 },
      { id: 'c9', from: 'or1', fromOutput: 0, to: 'output1', toInput: 0 }
    ];

    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
        gates={correctGates}
        connections={correctConnections}
      />
    );

    fireEvent.click(screen.getByText('XORゲートを作ろう'));
    fireEvent.click(screen.getByText('答えを確認'));

    expect(mockAlert).toHaveBeenCalledWith('正解です！おめでとうございます！🎉');
  });

  it('戻るボタンでパズル一覧に戻る', () => {
    render(
      <PuzzleModeManager
        currentMode="puzzle"
        onLoadCircuit={mockOnLoadCircuit}
      />
    );

    fireEvent.click(screen.getByText('XORゲートを作ろう'));
    expect(screen.queryByText('パズル一覧')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('← パズル一覧に戻る'));
    expect(screen.getByText('パズル一覧')).toBeInTheDocument();
  });
});