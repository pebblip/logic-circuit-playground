import { describe, it, expect, beforeEach } from 'vitest';
import { UltraModernCircuitViewModel } from '../UltraModernCircuitViewModel';

describe('UltraModernCircuitViewModel', () => {
  let viewModel: UltraModernCircuitViewModel;

  beforeEach(() => {
    viewModel = new UltraModernCircuitViewModel();
  });

  describe('Input Gate Toggle', () => {
    it('should toggle input gate value correctly', () => {
      // INPUTゲートを追加
      const inputGate = viewModel.addGate('INPUT', 100, 100);
      
      // 初期値はfalseであることを確認
      expect(inputGate.value).toBe(false);
      
      // 値を取得
      let gates = viewModel.getGates();
      let gate = gates.find(g => g.id === inputGate.id);
      expect(gate?.value).toBe(false);
      
      // toggleInputを呼び出す
      viewModel.toggleInput(inputGate.id);
      
      // 値がtrueに変わっていることを確認
      gates = viewModel.getGates();
      gate = gates.find(g => g.id === inputGate.id);
      expect(gate?.value).toBe(true);
      
      // もう一度toggleInputを呼び出す
      viewModel.toggleInput(inputGate.id);
      
      // 値がfalseに戻っていることを確認
      gates = viewModel.getGates();
      gate = gates.find(g => g.id === inputGate.id);
      expect(gate?.value).toBe(false);
    });
  });

  describe('Simulation', () => {
    it('should simulate AND gate correctly', () => {
      // ゲートを追加
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const andGate = viewModel.addGate('AND', 300, 150);
      const output = viewModel.addGate('OUTPUT', 500, 150);
      
      // 接続を追加
      viewModel.addConnection(input1.id, 0, andGate.id, 0);
      viewModel.addConnection(input2.id, 0, andGate.id, 1);
      viewModel.addConnection(andGate.id, 0, output.id, 0);
      
      // 初期状態：両方の入力がfalseなので、出力もfalse
      let gates = viewModel.getGates();
      let outputGate = gates.find(g => g.id === output.id);
      expect(outputGate?.value).toBe(false);
      
      // 入力1をtrueに
      viewModel.toggleInput(input1.id);
      gates = viewModel.getGates();
      outputGate = gates.find(g => g.id === output.id);
      expect(outputGate?.value).toBe(false); // まだfalse（ANDゲートなので）
      
      // 入力2もtrueに
      viewModel.toggleInput(input2.id);
      gates = viewModel.getGates();
      outputGate = gates.find(g => g.id === output.id);
      expect(outputGate?.value).toBe(true); // 両方trueなのでtrue
    });

    it('should simulate OR gate correctly', () => {
      // ゲートを追加
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const orGate = viewModel.addGate('OR', 300, 150);
      const output = viewModel.addGate('OUTPUT', 500, 150);
      
      // 接続を追加
      viewModel.addConnection(input1.id, 0, orGate.id, 0);
      viewModel.addConnection(input2.id, 0, orGate.id, 1);
      viewModel.addConnection(orGate.id, 0, output.id, 0);
      
      // 初期状態：両方の入力がfalseなので、出力もfalse
      let gates = viewModel.getGates();
      let outputGate = gates.find(g => g.id === output.id);
      expect(outputGate?.value).toBe(false);
      
      // 入力1をtrueに
      viewModel.toggleInput(input1.id);
      gates = viewModel.getGates();
      outputGate = gates.find(g => g.id === output.id);
      expect(outputGate?.value).toBe(true); // ORゲートなので一つでもtrueならtrue
    });
  });

  describe('Circuit Save/Load', () => {
    it('should save and load circuit with input states', () => {
      // 回路を作成
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const notGate = viewModel.addGate('NOT', 300, 100);
      
      // 入力値を設定
      viewModel.toggleInput(input1.id);
      
      // 回路を保存
      const savedData = viewModel.toJSON();
      
      // 新しいViewModelインスタンスを作成
      const newViewModel = new UltraModernCircuitViewModel();
      
      // 保存したデータを読み込み
      newViewModel.loadCircuit(savedData);
      
      // ゲートが正しく復元されていることを確認
      const gates = newViewModel.getGates();
      expect(gates.length).toBe(3);
      
      // 入力値が正しく復元されていることを確認
      const restoredInput1 = gates.find(g => g.type === 'INPUT' && g.x === 100 && g.y === 100);
      const restoredInput2 = gates.find(g => g.type === 'INPUT' && g.x === 100 && g.y === 200);
      
      expect(restoredInput1?.value).toBe(true);
      expect(restoredInput2?.value).toBe(false);
    });
  });
});