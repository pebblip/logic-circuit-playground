import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { UltraModernCircuitViewModel } from '../../viewmodels/UltraModernCircuitViewModel';
import { useViewModelSubscription } from '../../hooks/useViewModelSubscription';

// ViewModelとコンポーネント間の統合をテストするためのモックコンポーネント
const TestComponent: React.FC<{ viewModel: UltraModernCircuitViewModel }> = ({ viewModel }) => {
  const [gates, setGates] = React.useState<any[]>([]);
  const [simulationResults, setSimulationResults] = React.useState<Record<string, boolean>>({});

  useViewModelSubscription({
    viewModel,
    onGatesChanged: setGates,
    onConnectionsChanged: () => {},
    onSimulationResultsChanged: (results) => {
      const resultMap: Record<string, boolean> = {};
      results.forEach((value, key) => {
        resultMap[key] = value;
      });
      setSimulationResults(resultMap);
    }
  });

  const handleToggle = (gateId: string) => {
    viewModel.toggleInput(gateId);
  };

  return (
    <div>
      {gates.map(gate => (
        <div key={gate.id} data-testid={`gate-${gate.id}`}>
          <span>Type: {gate.type}</span>
          <span data-testid={`state-${gate.id}`}>
            State: {simulationResults[gate.id] ? 'ON' : 'OFF'}
          </span>
          {gate.type === 'INPUT' && (
            <button
              data-testid={`toggle-${gate.id}`}
              onClick={() => handleToggle(gate.id)}
            >
              Toggle
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

describe('入力ゲートの統合テスト', () => {
  let viewModel: UltraModernCircuitViewModel;

  beforeEach(() => {
    viewModel = new UltraModernCircuitViewModel();
  });

  test('ViewModelとコンポーネントの統合が正しく動作する', async () => {
    const { getByTestId } = render(<TestComponent viewModel={viewModel} />);

    // INPUTゲートを追加
    let gate: any;
    await act(async () => {
      gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    });

    // ゲートが表示されるまで待つ
    await waitFor(() => {
      expect(getByTestId(`gate-${gate.id}`)).toBeInTheDocument();
    });

    // 初期状態を確認
    expect(getByTestId(`state-${gate.id}`)).toHaveTextContent('State: OFF');

    // トグルボタンをクリック
    await act(async () => {
      fireEvent.click(getByTestId(`toggle-${gate.id}`));
    });

    // 状態が更新されるまで待つ
    await waitFor(() => {
      expect(getByTestId(`state-${gate.id}`)).toHaveTextContent('State: ON');
    });

    // もう一度トグル
    await act(async () => {
      fireEvent.click(getByTestId(`toggle-${gate.id}`));
    });

    await waitFor(() => {
      expect(getByTestId(`state-${gate.id}`)).toHaveTextContent('State: OFF');
    });
  });

  test('イベントの順序と内容が正しい', async () => {
    const eventLog: string[] = [];
    
    viewModel.on('gatesChanged', () => eventLog.push('gatesChanged'));
    viewModel.on('simulationResultsChanged', () => eventLog.push('simulationResultsChanged'));
    
    const { getByTestId } = render(<TestComponent viewModel={viewModel} />);

    // ゲート追加
    let gate: any;
    await act(async () => {
      gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    });
    
    await waitFor(() => {
      expect(getByTestId(`gate-${gate.id}`)).toBeInTheDocument();
    });

    // イベントログをクリア
    eventLog.length = 0;

    // トグル実行
    await act(async () => {
      fireEvent.click(getByTestId(`toggle-${gate.id}`));
    });

    await waitFor(() => {
      // 両方のイベントが発火されることを確認
      expect(eventLog).toContain('gatesChanged');
      expect(eventLog).toContain('simulationResultsChanged');
    });
  });
});