import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TruthTableDisplay } from '../../src/components/TruthTableDisplay';
import type { TruthTableResult } from '../../src/domain/analysis';

describe('TruthTableDisplay', () => {
  const mockTruthTableResult: TruthTableResult = {
    table: [
      {
        inputs: '00',
        outputs: '00',
        inputValues: [false, false],
        outputValues: [false, false],
      },
      {
        inputs: '01',
        outputs: '10',
        inputValues: [false, true],
        outputValues: [true, false],
      },
      {
        inputs: '10',
        outputs: '10',
        inputValues: [true, false],
        outputValues: [true, false],
      },
      {
        inputs: '11',
        outputs: '01',
        inputValues: [true, true],
        outputValues: [false, true],
      },
    ],
    inputCount: 2,
    outputCount: 2,
    isSequential: false,
    recognizedPattern: undefined,
  };

  it('複数出力の真理値表ヘッダーが正しく表示される', () => {
    const inputNames = ['A', 'B'];
    const outputNames = ['C', 'D'];
    const gateName = 'テストゲート';

    render(
      <TruthTableDisplay
        result={mockTruthTableResult}
        inputNames={inputNames}
        outputNames={outputNames}
        gateName={gateName}
      />
    );

    // 入力ヘッダーの確認
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    // 出力ヘッダーの確認（これが失敗する問題）
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();

    // タイトルの確認
    expect(screen.getByText('📊 テストゲート の真理値表')).toBeInTheDocument();
  });

  it('単一出力の真理値表ヘッダーが正しく表示される', () => {
    const singleOutputResult: TruthTableResult = {
      table: [
        {
          inputs: '00',
          outputs: '0',
          inputValues: [false, false],
          outputValues: [false],
        },
        {
          inputs: '01',
          outputs: '1',
          inputValues: [false, true],
          outputValues: [true],
        },
        {
          inputs: '10',
          outputs: '1',
          inputValues: [true, false],
          outputValues: [true],
        },
        {
          inputs: '11',
          outputs: '1',
          inputValues: [true, true],
          outputValues: [true],
        },
      ],
      inputCount: 2,
      outputCount: 1,
      isSequential: false,
      recognizedPattern: undefined,
    };

    const inputNames = ['A', 'B'];
    const outputNames = ['Y'];

    render(
      <TruthTableDisplay
        result={singleOutputResult}
        inputNames={inputNames}
        outputNames={outputNames}
      />
    );

    // 入力ヘッダーの確認
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    // 出力ヘッダーの確認
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('出力ヘッダーが空の場合にエラーが発生しない', () => {
    const emptyOutputResult: TruthTableResult = {
      table: [],
      inputCount: 2,
      outputCount: 0,
      isSequential: false,
      recognizedPattern: undefined,
    };

    const inputNames = ['A', 'B'];
    const outputNames: string[] = [];

    expect(() => {
      render(
        <TruthTableDisplay
          result={emptyOutputResult}
          inputNames={inputNames}
          outputNames={outputNames}
        />
      );
    }).not.toThrow();
  });

  it('カスタムゲートの複数出力ヘッダーが正しく表示される', () => {
    const customGateResult: TruthTableResult = {
      table: [
        {
          inputs: '00',
          outputs: '000',
          inputValues: [false, false],
          outputValues: [false, false, false],
        },
        {
          inputs: '01',
          outputs: '100',
          inputValues: [false, true],
          outputValues: [true, false, false],
        },
        {
          inputs: '10',
          outputs: '100',
          inputValues: [true, false],
          outputValues: [true, false, false],
        },
        {
          inputs: '11',
          outputs: '010',
          inputValues: [true, true],
          outputValues: [false, true, false],
        },
      ],
      inputCount: 2,
      outputCount: 3,
      isSequential: false,
      recognizedPattern: undefined,
    };

    const inputNames = ['IN1', 'IN2'];
    const outputNames = ['OUT1', 'OUT2', 'OUT3'];

    render(
      <TruthTableDisplay
        result={customGateResult}
        inputNames={inputNames}
        outputNames={outputNames}
        gateName="カスタムゲート"
      />
    );

    // 入力ヘッダーの確認
    expect(screen.getByText('IN1')).toBeInTheDocument();
    expect(screen.getByText('IN2')).toBeInTheDocument();

    // 出力ヘッダーの確認（特に複数出力）
    expect(screen.getByText('OUT1')).toBeInTheDocument();
    expect(screen.getByText('OUT2')).toBeInTheDocument();
    expect(screen.getByText('OUT3')).toBeInTheDocument();
  });

  it('7つ以上の出力でもヘッダーが表示される', () => {
    const manyOutputResult: TruthTableResult = {
      table: [
        {
          inputs: '00',
          outputs: '0000000',
          inputValues: [false, false],
          outputValues: [false, false, false, false, false, false, false],
        },
      ],
      inputCount: 2,
      outputCount: 7,
      isSequential: false,
      recognizedPattern: undefined,
    };

    const inputNames = ['A', 'B'];
    const outputNames = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7'];

    render(
      <TruthTableDisplay
        result={manyOutputResult}
        inputNames={inputNames}
        outputNames={outputNames}
      />
    );

    // 全ての出力ヘッダーが表示されることを確認
    outputNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('CSVエクスポートボタンが表示される', () => {
    render(
      <TruthTableDisplay
        result={mockTruthTableResult}
        inputNames={['A', 'B']}
        outputNames={['C', 'D']}
      />
    );

    expect(screen.getByText('📄 CSV出力')).toBeInTheDocument();
  });

  it('onCloseハンドラーが提供された場合、閉じるボタンが表示される', () => {
    const mockOnClose = vi.fn();

    render(
      <TruthTableDisplay
        result={mockTruthTableResult}
        inputNames={['A', 'B']}
        outputNames={['C', 'D']}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('×')).toBeInTheDocument();
  });
});