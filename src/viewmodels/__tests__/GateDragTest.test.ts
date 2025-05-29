import { describe, it, expect, beforeEach } from 'vitest';
import { UltraModernCircuitViewModel } from '../UltraModernCircuitViewModel';

describe('UltraModernCircuitViewModel - ゲートドラッグ', () => {
  let viewModel: UltraModernCircuitViewModel;
  let gateId: string;

  beforeEach(() => {
    viewModel = new UltraModernCircuitViewModel();
    // ANDゲートを追加
    const gate = viewModel.addGate('AND', { x: 100, y: 100 });
    gateId = gate.id;
  });

  it('moveGateが正しく動作する', () => {
    // 初期位置を確認
    const gates = viewModel.getGates();
    const gate = gates.find(g => g.id === gateId);
    expect(gate).toBeDefined();
    expect(gate?.x).toBe(100);
    expect(gate?.y).toBe(100);

    // ゲートを移動
    viewModel.moveGate(gateId, 200, 300);

    // 移動後の位置を確認
    const updatedGates = viewModel.getGates();
    const updatedGate = updatedGates.find(g => g.id === gateId);
    expect(updatedGate?.x).toBe(200);
    expect(updatedGate?.y).toBe(300);
  });

  it('連続してmoveGateを呼んでも正常に動作する', () => {
    // 複数回移動
    viewModel.moveGate(gateId, 150, 150);
    viewModel.moveGate(gateId, 200, 200);
    viewModel.moveGate(gateId, 250, 250);

    // 最終位置を確認
    const gates = viewModel.getGates();
    const gate = gates.find(g => g.id === gateId);
    expect(gate?.x).toBe(250);
    expect(gate?.y).toBe(250);
  });

  it('存在しないゲートIDでmoveGateを呼んでもエラーにならない', () => {
    expect(() => {
      viewModel.moveGate('non-existent-id', 300, 300);
    }).not.toThrow();
  });

  it('ゲート移動時にgatesChangedイベントが発火する', () => {
    let eventFired = false;
    let eventData: any = null;

    viewModel.on('gatesChanged', (data) => {
      eventFired = true;
      eventData = data;
    });

    viewModel.moveGate(gateId, 300, 400);

    expect(eventFired).toBe(true);
    expect(eventData).toBeDefined();
    expect(Array.isArray(eventData)).toBe(true);
  });
});