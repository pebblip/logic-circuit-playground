import { describe, it, expect } from 'vitest';
import { UltraModernCircuitViewModel } from '../../viewmodels/UltraModernCircuitViewModel';

describe('入力ゲートのViewModel統合テスト', () => {
  it('ViewModelでINPUTゲートをトグルできる', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // INPUTゲートを追加
    const gate = viewModel.addGate('INPUT', 100, 100);
    expect(gate).toBeTruthy();
    expect(gate.type).toBe('INPUT');
    
    // 初期状態を確認
    const results1 = viewModel.getSimulationResults();
    expect(results1[gate.id]).toBe(false);
    
    // トグル
    viewModel.toggleInput(gate.id);
    
    // 状態が変わったことを確認
    const results2 = viewModel.getSimulationResults();
    expect(results2[gate.id]).toBe(true);
    
    // もう一度トグル
    viewModel.toggleInput(gate.id);
    
    // 元に戻ったことを確認
    const results3 = viewModel.getSimulationResults();
    expect(results3[gate.id]).toBe(false);
  });

  it('複数のINPUTゲートを独立してトグルできる', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // 2つのINPUTゲートを追加
    const gate1 = viewModel.addGate('INPUT', 100, 100);
    const gate2 = viewModel.addGate('INPUT', 200, 100);
    
    // 両方ともOFF
    let results = viewModel.getSimulationResults();
    expect(results[gate1.id]).toBe(false);
    expect(results[gate2.id]).toBe(false);
    
    // gate1だけON
    viewModel.toggleInput(gate1.id);
    results = viewModel.getSimulationResults();
    expect(results[gate1.id]).toBe(true);
    expect(results[gate2.id]).toBe(false);
    
    // gate2もON
    viewModel.toggleInput(gate2.id);
    results = viewModel.getSimulationResults();
    expect(results[gate1.id]).toBe(true);
    expect(results[gate2.id]).toBe(true);
  });
});