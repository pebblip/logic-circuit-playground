import { describe, it, expect, vi } from 'vitest';
import { UltraModernCircuitViewModel } from '../../viewmodels/UltraModernCircuitViewModel';

describe('ANDゲートの接続バグ', () => {
  it('ANDゲートの両方の入力ピンに接続できる', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // 入力ゲートを2つ追加
    const input1 = viewModel.addGate('INPUT', 100, 100);
    const input2 = viewModel.addGate('INPUT', 100, 200);
    
    // ANDゲートを追加
    const andGate = viewModel.addGate('AND', 300, 150);
    
    // デバッグ: ゲートの内部情報を確認
    console.log('AND Gate:', andGate);
    console.log('Gates:', viewModel.getGates());
    
    // 1つ目の入力（上側）に接続
    const conn1 = viewModel.addConnection(input1.id, 0, andGate.id, 0);
    console.log('Connection 1:', conn1);
    
    expect(conn1).not.toBeNull();
    if (conn1) {
      expect(conn1.from).toBe(input1.id);
      expect(conn1.to).toBe(andGate.id);
      expect(conn1.toInput).toBe(0);
    }
    
    // 2つ目の入力（下側）に接続
    const conn2 = viewModel.addConnection(input2.id, 0, andGate.id, 1);
    console.log('Connection 2:', conn2);
    
    expect(conn2).not.toBeNull();
    if (conn2) {
      expect(conn2.from).toBe(input2.id);
      expect(conn2.to).toBe(andGate.id);
      expect(conn2.toInput).toBe(1);
    }
    
    // 接続が2つできていることを確認
    const connections = viewModel.getConnections();
    console.log('All connections:', connections);
    expect(connections).toHaveLength(2);
  });
  
  it('ViewModelが正しくゲートのピン情報を処理している', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // ANDゲートを追加
    const andGate = viewModel.addGate('AND', 300, 150);
    
    // 内部モデルの確認
    const internalId = (viewModel as any).gateIdMap.get(andGate.id);
    expect(internalId).toBeDefined();
    
    const internalGate = (viewModel as any).circuit.getGate(internalId);
    console.log('Internal gate:', internalGate);
    console.log('Internal gate inputs:', internalGate?.inputs);
    console.log('Internal gate outputs:', internalGate?.outputs);
    
    // ピンが正しく存在することを確認
    expect(internalGate?.inputs).toHaveLength(2);
    expect(internalGate?.outputs).toHaveLength(1);
  });
});