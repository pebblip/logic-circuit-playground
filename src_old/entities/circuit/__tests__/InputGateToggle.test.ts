import { describe, it, expect, beforeEach } from 'vitest';
import { InputGate } from '../../gates/InputGate';
import { UltraModernCircuitViewModel } from '../../../features/circuit-editor/model/UltraModernCircuitViewModel';

describe('InputGate Toggle', () => {
  it('InputGateのtoggleメソッドが正しく動作する', () => {
    const inputGate = new InputGate('test-id', { x: 0, y: 0 });
    
    // 初期状態はfalse
    expect(inputGate.getState()).toBe(false);
    expect(inputGate.getOutputValue(0)).toBe(false);
    
    // toggle後はtrue
    inputGate.toggle();
    expect(inputGate.getState()).toBe(true);
    expect(inputGate.getOutputValue(0)).toBe(true);
    
    // もう一度toggleするとfalse
    inputGate.toggle();
    expect(inputGate.getState()).toBe(false);
    expect(inputGate.getOutputValue(0)).toBe(false);
  });
  
  it('ViewModelのtoggleInputが正しく動作する', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // INPUTゲートを追加
    const gate = viewModel.addGate('INPUT', { x: 100, y: 100 });
    const gateId = gate.id;
    
    // 初期状態を確認
    const results1 = viewModel.getSimulationResults();
    expect(results1[gateId]).toBe(false);
    
    // toggle
    viewModel.toggleInput(gateId);
    
    // 状態が変わったことを確認
    const results2 = viewModel.getSimulationResults();
    expect(results2[gateId]).toBe(true);
    
    // もう一度toggle
    viewModel.toggleInput(gateId);
    
    // 元に戻ったことを確認
    const results3 = viewModel.getSimulationResults();
    expect(results3[gateId]).toBe(false);
  });
});