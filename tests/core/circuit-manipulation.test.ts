import { describe, test, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire, Position } from '@/types/circuit';

/**
 * 回路操作機能テスト
 * 
 * このテストはユーザーの作業効率に直結する重要機能を保護します。
 * 直感的で確実な操作は、学習体験の質を左右します。
 */
describe('回路操作機能', () => {
  beforeEach(() => {
    // ストアの初期化
    useCircuitStore.setState({
      gates: [],
      wires: [],
      customGates: [],
      selectedGateIds: [],
    });
  });

  describe('ゲートの追加と削除', () => {
    test('ゲートが正しい位置に追加される', () => {
      const store = useCircuitStore.getState();
      const position: Position = { x: 200, y: 150 };
      
      // ANDゲートを追加
      const gate = store.addGate('AND', position);
      
      const gates = useCircuitStore.getState().gates;
      expect(gates).toHaveLength(1);
      expect(gates[0].type).toBe('AND');
      expect(gates[0].position).toEqual(position);
      // Gate inputs are initialized as empty strings in the actual implementation
      expect(gates[0].inputs).toEqual(['', '']);
      expect(gates[0].output).toBe(false);
      expect(gate.id).toBe(gates[0].id);
    });

    test('複数のゲートが追加・削除できる', () => {
      const store = useCircuitStore.getState();
      
      // 複数のゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      store.addGate('OUTPUT', { x: 500, y: 150 });
      
      let gates = useCircuitStore.getState().gates;
      expect(gates).toHaveLength(3);
      
      // 中央のゲートを削除
      const andGateId = gates[1].id;
      store.deleteGate(andGateId);
      
      gates = useCircuitStore.getState().gates;
      expect(gates).toHaveLength(2);
      expect(gates.find(g => g.id === andGateId)).toBeUndefined();
      expect(gates[0].type).toBe('INPUT');
      expect(gates[1].type).toBe('OUTPUT');
    });

    test('ゲート削除時に関連するワイヤーも削除される', () => {
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      store.addGate('OUTPUT', { x: 500, y: 150 });
      
      const gates = useCircuitStore.getState().gates;
      const inputId = gates[0].id;
      const andId = gates[1].id;
      const outputId = gates[2].id;
      
      // ワイヤーを追加（実際のAPIに合わせて修正）
      store.startWireDrawing(inputId, -1);
      store.endWireDrawing(andId, 0);
      store.startWireDrawing(andId, -1);
      store.endWireDrawing(outputId, 0);
      
      let wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(2);
      
      // ANDゲートを削除
      store.deleteGate(andId);
      
      // 関連するワイヤーが削除されたことを確認
      wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(0);
    });
  });

  describe('ワイヤーの接続と削除', () => {
    test('ゲート間にワイヤーが正しく接続される', () => {
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('NOT', { x: 300, y: 100 });
      
      const gates = useCircuitStore.getState().gates;
      const inputId = gates[0].id;
      const notId = gates[1].id;
      
      // ワイヤーを接続（実際のAPIに合わせて修正）
      store.startWireDrawing(inputId, -1);
      store.endWireDrawing(notId, 0);
      
      const wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(1);
      expect(wires[0].from).toEqual({ gateId: inputId, pinIndex: -1 });
      expect(wires[0].to).toEqual({ gateId: notId, pinIndex: 0 });
      expect(wires[0].isActive).toBe(false);
    });

    test('同じ接続のワイヤーは重複して作成されない', () => {
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('OUTPUT', { x: 300, y: 100 });
      
      const gates = useCircuitStore.getState().gates;
      const inputId = gates[0].id;
      const outputId = gates[1].id;
      
      // 同じ接続を2回試行
      store.startWireDrawing(inputId, -1);
      store.endWireDrawing(outputId, 0);
      store.startWireDrawing(inputId, -1);
      store.endWireDrawing(outputId, 0);
      
      const wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(1);
    });

    test('ワイヤーが個別に削除できる', () => {
      const store = useCircuitStore.getState();
      
      // 3つのゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      store.addGate('OUTPUT', { x: 500, y: 150 });
      
      const gates = useCircuitStore.getState().gates;
      
      // 2本のワイヤーを追加
      store.startWireDrawing(gates[0].id, -1);
      store.endWireDrawing(gates[1].id, 0);
      store.startWireDrawing(gates[1].id, -1);
      store.endWireDrawing(gates[2].id, 0);
      
      let wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(2);
      
      // 最初のワイヤーを削除
      const firstWireId = wires[0].id;
      store.deleteWire(firstWireId);
      
      wires = useCircuitStore.getState().wires;
      expect(wires).toHaveLength(1);
      expect(wires[0].id).not.toBe(firstWireId);
    });
  });

  describe('ゲートの選択と移動', () => {
    test('単一ゲートの選択と選択解除', () => {
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      store.addGate('AND', { x: 200, y: 200 });
      const gateId = useCircuitStore.getState().gates[0].id;
      
      // ゲートを選択
      store.selectGate(gateId);
      expect(useCircuitStore.getState().selectedGateId).toBe(gateId);
      expect(useCircuitStore.getState().selectedGateIds).toEqual([gateId]);
      
      // 選択解除
      store.clearSelection();
      expect(useCircuitStore.getState().selectedGateIds).toEqual([]);
    });

    test('複数ゲートの選択（Ctrlキー使用）', () => {
      const store = useCircuitStore.getState();
      
      // 3つのゲートを追加
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      store.addGate('OUTPUT', { x: 500, y: 150 });
      
      const gates = useCircuitStore.getState().gates;
      
      // 順番に選択（Ctrlキー押下を想定）
      store.selectGate(gates[0].id);
      store.addToSelection(gates[1].id);
      store.addToSelection(gates[2].id);
      
      const selected = useCircuitStore.getState().selectedGateIds;
      expect(selected).toHaveLength(3);
      expect(selected).toContain(gates[0].id);
      expect(selected).toContain(gates[1].id);
      expect(selected).toContain(gates[2].id);
    });

    test('選択したゲートの移動', () => {
      const store = useCircuitStore.getState();
      
      // ゲートを追加
      store.addGate('AND', { x: 200, y: 200 });
      store.addGate('OR', { x: 300, y: 200 });
      
      const gates = useCircuitStore.getState().gates;
      
      // 両方のゲートを選択
      store.selectGate(gates[0].id);
      store.addToSelection(gates[1].id);
      
      // 移動
      const delta = { x: 50, y: -30 };
      const selectedIds = useCircuitStore.getState().selectedGateIds;
      store.moveMultipleGates(selectedIds, delta.x, delta.y);
      
      const movedGates = useCircuitStore.getState().gates;
      expect(movedGates[0].position).toEqual({ x: 250, y: 170 });
      expect(movedGates[1].position).toEqual({ x: 350, y: 170 });
    });

    test('接続されたゲートの移動でワイヤーが追従する', () => {
      const store = useCircuitStore.getState();
      
      // ゲートとワイヤーを設定
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('OUTPUT', { x: 300, y: 100 });
      
      const gates = useCircuitStore.getState().gates;
      store.startWireDrawing(gates[0].id, -1);
      store.endWireDrawing(gates[1].id, 0);
      
      // 入力ゲートを移動
      store.selectGate(gates[0].id);
      store.moveGate(gates[0].id, { x: 100, y: 150 }, true);
      
      // ゲートの位置が更新されたことを確認
      const movedGates = useCircuitStore.getState().gates;
      expect(movedGates[0].position).toEqual({ x: 100, y: 150 });
      
      // ワイヤーの接続は維持される
      const wires = useCircuitStore.getState().wires;
      expect(wires[0].from.gateId).toBe(gates[0].id);
      expect(wires[0].to.gateId).toBe(gates[1].id);
    });
  });

  describe('回路のコピー・ペースト', () => {
    test('選択したゲートをコピー・ペーストできる', () => {
      const store = useCircuitStore.getState();
      
      // 元のゲートを作成
      store.addGate('AND', { x: 200, y: 200 });
      store.addGate('OR', { x: 300, y: 200 });
      
      const originalGates = useCircuitStore.getState().gates;
      
      // 両方を選択してコピー
      store.selectGate(originalGates[0].id);
      store.addToSelection(originalGates[1].id);
      store.copySelection();
      
      // ペースト（オフセット付き）
      store.paste({ x: 350, y: 250 });
      
      const allGates = useCircuitStore.getState().gates;
      expect(allGates).toHaveLength(4);
      
      // ペーストされたゲートの確認
      const pastedGates = allGates.slice(2);
      expect(pastedGates[0].type).toBe('AND');
      expect(pastedGates[1].type).toBe('OR');
      
      // 位置がオフセットされている
      expect(pastedGates[0].position.x).toBeGreaterThan(originalGates[0].position.x);
      expect(pastedGates[0].position.y).toBeGreaterThan(originalGates[0].position.y);
    });

    test('接続されたゲートをコピー・ペーストするとワイヤーも複製される', () => {
      const store = useCircuitStore.getState();
      
      // 接続された回路を作成
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('NOT', { x: 300, y: 100 });
      
      const originalGates = useCircuitStore.getState().gates;
      store.startWireDrawing(originalGates[0].id, -1);
      store.endWireDrawing(originalGates[1].id, 0);
      
      // 全体を選択してコピー
      store.selectGate(originalGates[0].id);
      store.addToSelection(originalGates[1].id);
      store.copySelection();
      
      // ペースト
      store.paste({ x: 200, y: 200 });
      
      const allGates = useCircuitStore.getState().gates;
      const allWires = useCircuitStore.getState().wires;
      
      expect(allGates).toHaveLength(4);
      expect(allWires).toHaveLength(2);
      
      // 新しいワイヤーが新しいゲート間に接続されている
      const newWire = allWires[1];
      const newGates = allGates.slice(2);
      expect(newWire.from.gateId).toBe(newGates[0].id);
      expect(newWire.to.gateId).toBe(newGates[1].id);
    });
  });

  describe('Undo/Redo機能', () => {
    test('ゲート追加操作のUndo/Redo', () => {
      const store = useCircuitStore.getState();
      
      // 初期状態を履歴に保存
      store.saveToHistory();
      expect(useCircuitStore.getState().gates).toHaveLength(0);
      
      // ゲートを追加（addGateは自動的にsaveToHistoryを呼ぶ）
      store.addGate('AND', { x: 200, y: 200 });
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      
      // Undo
      store.undo();
      expect(useCircuitStore.getState().gates).toHaveLength(0);
      
      // Redo
      store.redo();
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      expect(useCircuitStore.getState().gates[0].type).toBe('AND');
    });

    test('複数操作の連続Undo/Redo', () => {
      const store = useCircuitStore.getState();
      
      // 初期状態を履歴に保存
      store.saveToHistory();
      
      // 複数の操作を実行
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      const gates = useCircuitStore.getState().gates;
      store.startWireDrawing(gates[0].id, -1);
      store.endWireDrawing(gates[1].id, 0);
      
      expect(useCircuitStore.getState().gates).toHaveLength(2);
      expect(useCircuitStore.getState().wires).toHaveLength(1);
      
      // 3回Undo
      store.undo(); // ワイヤー削除
      expect(useCircuitStore.getState().wires).toHaveLength(0);
      
      store.undo(); // ANDゲート削除
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      
      store.undo(); // INPUTゲート削除
      expect(useCircuitStore.getState().gates).toHaveLength(0);
      
      // 2回Redo
      store.redo(); // INPUTゲート復元
      store.redo(); // ANDゲート復元
      expect(useCircuitStore.getState().gates).toHaveLength(2);
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });
  });

  describe('回路の状態管理', () => {
    test('現在の回路状態を取得できる', () => {
      const store = useCircuitStore.getState();
      
      // テスト回路を構築
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 300, y: 150 });
      store.addGate('OUTPUT', { x: 500, y: 150 });
      
      const gates = useCircuitStore.getState().gates;
      store.startWireDrawing(gates[0].id, -1);
      store.endWireDrawing(gates[1].id, 0);
      store.startWireDrawing(gates[1].id, -1);
      store.endWireDrawing(gates[2].id, 0);
      
      // 現在の状態を取得
      const currentGates = useCircuitStore.getState().gates;
      const currentWires = useCircuitStore.getState().wires;
      
      expect(currentGates).toHaveLength(3);
      expect(currentWires).toHaveLength(2);
      expect(currentGates[0].type).toBe('INPUT');
      expect(currentGates[1].type).toBe('AND');
      expect(currentGates[2].type).toBe('OUTPUT');
    });

    test('リセット後に新しい回路を構築できる', () => {
      const store = useCircuitStore.getState();
      
      // 最初に何か追加
      store.addGate('AND', { x: 100, y: 100 });
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      
      // リセット
      store.clearAll();
      expect(useCircuitStore.getState().gates).toHaveLength(0);
      expect(useCircuitStore.getState().wires).toHaveLength(0);
      
      // 新しい回路を構築
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('NOT', { x: 300, y: 100 });
      
      const gates = useCircuitStore.getState().gates;
      store.startWireDrawing(gates[0].id, -1);
      store.endWireDrawing(gates[1].id, 0);
      
      const finalGates = useCircuitStore.getState().gates;
      const finalWires = useCircuitStore.getState().wires;
      
      expect(finalGates).toHaveLength(2);
      expect(finalWires).toHaveLength(1);
      expect(finalGates[0].type).toBe('INPUT');
      expect(finalGates[1].type).toBe('NOT');
    });
  });
});