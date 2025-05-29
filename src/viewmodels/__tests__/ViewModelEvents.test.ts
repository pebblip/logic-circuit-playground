import { describe, it, expect, vi } from 'vitest';
import { UltraModernCircuitViewModel } from '../UltraModernCircuitViewModel';

describe('ViewModelのイベント発火', () => {
  it('toggleInputが正しいイベントを発火する', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // イベントリスナーをモック
    const simulationCompletedSpy = vi.fn();
    const simulationResultsChangedSpy = vi.fn();
    const gatesChangedSpy = vi.fn();
    
    viewModel.on('simulationCompleted', simulationCompletedSpy);
    viewModel.on('simulationResultsChanged', simulationResultsChangedSpy);
    viewModel.on('gatesChanged', gatesChangedSpy);
    
    // INPUTゲートを追加
    const gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    
    // スパイをクリア（addGateでもイベントが発火するため）
    simulationCompletedSpy.mockClear();
    simulationResultsChangedSpy.mockClear();
    gatesChangedSpy.mockClear();
    
    // toggleInput実行
    viewModel.toggleInput(gate.id);
    
    // 必要なイベントが発火されたことを確認
    expect(gatesChangedSpy).toHaveBeenCalledTimes(1);
    expect(simulationResultsChangedSpy).toHaveBeenCalledTimes(1);
    
    // イベントペイロードを確認
    const resultsMap = simulationResultsChangedSpy.mock.calls[0][0];
    expect(resultsMap).toBeInstanceOf(Map);
    expect(resultsMap.get(gate.id)).toBe(true);
  });

  it('simulate()が正しいイベントを発火する', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    const simulationCompletedSpy = vi.fn();
    const simulationResultsChangedSpy = vi.fn();
    
    viewModel.on('simulationCompleted', simulationCompletedSpy);
    viewModel.on('simulationResultsChanged', simulationResultsChangedSpy);
    
    // ゲートを追加してシミュレーション実行
    viewModel.addGate('INPUT', { x: 100, y: 100 });
    
    simulationCompletedSpy.mockClear();
    simulationResultsChangedSpy.mockClear();
    
    viewModel.simulate();
    
    // 両方のイベントが発火されることを確認
    expect(simulationCompletedSpy).toHaveBeenCalledTimes(1);
    expect(simulationResultsChangedSpy).toHaveBeenCalledTimes(1);
    
    // 同じデータが渡されることを確認
    expect(simulationCompletedSpy.mock.calls[0][0]).toBe(simulationResultsChangedSpy.mock.calls[0][0]);
  });

  it('コンポーネントで使用されるイベント名が正しい', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // コンポーネントが期待するイベント名
    const expectedEvents = [
      'gatesChanged',
      'connectionsChanged',
      'simulationResultsChanged',  // これが重要！
      'saveCircuit',
      'notification'
    ];
    
    // これらのイベントがViewModelで発火可能か確認
    const eventSpies: Record<string, any> = {};
    expectedEvents.forEach(event => {
      eventSpies[event] = vi.fn();
      viewModel.on(event, eventSpies[event]);
    });
    
    // 各操作でイベントが発火されることを確認
    const gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    expect(eventSpies.gatesChanged).toHaveBeenCalled();
    expect(eventSpies.simulationResultsChanged).toHaveBeenCalled();
    
    // toggleInputでもsimulationResultsChangedが発火されることを確認
    eventSpies.simulationResultsChanged.mockClear();
    viewModel.toggleInput(gate.id);
    expect(eventSpies.simulationResultsChanged).toHaveBeenCalled();
  });
});