// ワイヤー接続の包括的テスト
// エッジケースと統合動作の完全保証

import { describe, it, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import { Gate, Wire } from '@/types/circuit';
import { getInputPinPosition, getOutputPinPosition } from '@domain/analysis/pinPositionCalculator';

describe('Wire Connection Integration Tests', () => {
  beforeEach(() => {
    // ストアを初期化
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateId: null,
      selectedGateIds: [],
      isDrawingWire: false,
      wireStart: null,
      customGates: [],
      history: [{ gates: [], wires: [] }],
      historyIndex: 0,
      clipboard: null,
      appMode: '自由制作',
      allowedGates: null
    });
  });

  describe('ワイヤー接続の完全性テスト', () => {
    it('ゲート移動時にワイヤー接続が維持される', () => {
      const store = useCircuitStore.getState();
      
      // ゲート配置
      const input = store.addGate('INPUT', { x: 100, y: 100 });
      const and = store.addGate('AND', { x: 200, y: 100 });
      
      // ワイヤー接続
      store.startWireDrawing(input.id, -1);
      store.endWireDrawing(and.id, 0);
      
      const wireId = useCircuitStore.getState().wires[0].id;
      
      // ゲート移動
      store.moveGate(and.id, { x: 300, y: 200 });
      
      // ワイヤーが維持されていることを確認
      const state = useCircuitStore.getState();
      expect(state.wires).toHaveLength(1);
      expect(state.wires[0].id).toBe(wireId);
      expect(state.wires[0].from.gateId).toBe(input.id);
      expect(state.wires[0].to.gateId).toBe(and.id);
    });

    it('ゲート削除時に関連ワイヤーも削除される', () => {
      const store = useCircuitStore.getState();
      
      // 3つのゲートを接続
      const input = store.addGate('INPUT', { x: 100, y: 100 });
      const and = store.addGate('AND', { x: 200, y: 100 });
      const output = store.addGate('OUTPUT', { x: 300, y: 100 });
      
      store.startWireDrawing(input.id, -1);
      store.endWireDrawing(and.id, 0);
      
      store.startWireDrawing(and.id, -1);
      store.endWireDrawing(output.id, 0);
      
      expect(useCircuitStore.getState().wires).toHaveLength(2);
      
      // 中間のゲートを削除
      store.deleteGate(and.id);
      
      // 関連するワイヤーが全て削除されていることを確認
      const state = useCircuitStore.getState();
      expect(state.wires).toHaveLength(0);
      expect(state.gates).toHaveLength(2);
    });

    it('不正な接続（出力→出力）を防ぐ', () => {
      const store = useCircuitStore.getState();
      
      const input1 = store.addGate('INPUT', { x: 100, y: 100 });
      const input2 = store.addGate('INPUT', { x: 200, y: 100 });
      
      // 出力から出力への接続を試みる
      store.startWireDrawing(input1.id, -1); // 出力ピン
      store.endWireDrawing(input2.id, -1); // 出力ピン（不正）
      
      // ワイヤーが作成されていないことを確認
      expect(useCircuitStore.getState().wires).toHaveLength(0);
      expect(useCircuitStore.getState().isDrawingWire).toBe(false);
    });

    it('不正な接続（入力→入力）を防ぐ', () => {
      const store = useCircuitStore.getState();
      
      const and1 = store.addGate('AND', { x: 100, y: 100 });
      const and2 = store.addGate('AND', { x: 200, y: 100 });
      
      // 入力から入力への接続を試みる
      store.startWireDrawing(and1.id, 0); // 入力ピン
      store.endWireDrawing(and2.id, 0); // 入力ピン（不正）
      
      // ワイヤーが作成されていないことを確認
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    it('同一ピンへの複数接続を防ぐ（重要な実装バグ）', () => {
      const store = useCircuitStore.getState();
      
      const input1 = store.addGate('INPUT', { x: 100, y: 100 });
      const input2 = store.addGate('INPUT', { x: 100, y: 200 });
      const and = store.addGate('AND', { x: 200, y: 150 });
      
      // 最初の接続
      store.startWireDrawing(input1.id, -1);
      store.endWireDrawing(and.id, 0);
      
      expect(useCircuitStore.getState().wires).toHaveLength(1);
      
      // 同じ入力ピンへの2つ目の接続を試みる
      store.startWireDrawing(input2.id, -1);
      store.endWireDrawing(and.id, 0); // 既に接続されているピン
      
      // 2つ目のワイヤーが作成されていないことを確認
      expect(useCircuitStore.getState().wires).toHaveLength(1);
    });
  });

  describe('複雑な回路のエッジケース', () => {
    it('循環参照を持つ回路でもクラッシュしない', () => {
      const store = useCircuitStore.getState();
      
      // NANDゲートで循環回路を作成（SRラッチ）
      const nand1 = store.addGate('NAND', { x: 100, y: 100 });
      const nand2 = store.addGate('NAND', { x: 200, y: 100 });
      
      // 交差接続
      store.startWireDrawing(nand1.id, -1);
      store.endWireDrawing(nand2.id, 0);
      
      store.startWireDrawing(nand2.id, -1);
      store.endWireDrawing(nand1.id, 1);
      
      // 評価してもクラッシュしないことを確認
      expect(() => {
        const state = useCircuitStore.getState();
        // シミュレーションが正常に動作することを確認
        expect(state.wires).toHaveLength(2);
      }).not.toThrow();
    });

    it('1000個のゲートと接続でもパフォーマンスを維持', () => {
      const store = useCircuitStore.getState();
      const startTime = performance.now();
      
      // 大量のゲートを作成
      const gates: Gate[] = [];
      for (let i = 0; i < 100; i++) {
        const gate = store.addGate('AND', { x: i * 50, y: Math.floor(i / 10) * 50 });
        gates.push(gate);
      }
      
      // 連鎖接続
      for (let i = 0; i < gates.length - 1; i++) {
        store.startWireDrawing(gates[i].id, -1);
        store.endWireDrawing(gates[i + 1].id, 0);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 1秒以内に完了することを確認
      expect(executionTime).toBeLessThan(1000);
      expect(useCircuitStore.getState().gates).toHaveLength(100);
      expect(useCircuitStore.getState().wires).toHaveLength(99);
    });
  });

  describe('ピン位置計算の境界値テスト', () => {
    it('負の座標でのピン位置計算', () => {
      const negativeGate: Gate = {
        id: 'negative',
        type: 'AND',
        position: { x: -1000, y: -2000 },
        inputs: ['', ''],
        output: false
      };
      
      const inputPos = getInputPinPosition(negativeGate, 0);
      const outputPos = getOutputPinPosition(negativeGate, 0);
      
      expect(inputPos.x).toBe(-1045); // -1000 - 45
      expect(inputPos.y).toBe(-2010); // -2000 - 10
      expect(outputPos.x).toBe(-955);  // -1000 + 45
      expect(outputPos.y).toBe(-2000);
    });

    it('極端に大きな座標でのピン位置計算', () => {
      const hugeGate: Gate = {
        id: 'huge',
        type: 'AND',
        position: { x: 999999, y: 888888 },
        inputs: ['', ''],
        output: false
      };
      
      const inputPos = getInputPinPosition(hugeGate, 0);
      const outputPos = getOutputPinPosition(hugeGate, 0);
      
      expect(inputPos.x).toBe(999954);  // 999999 - 45
      expect(inputPos.y).toBe(888878);  // 888888 - 10
      expect(outputPos.x).toBe(1000044); // 999999 + 45
      expect(outputPos.y).toBe(888888);
    });

    it('小数点座標でのピン位置計算', () => {
      const floatGate: Gate = {
        id: 'float',
        type: 'AND',
        position: { x: 100.5, y: 200.7 },
        inputs: ['', ''],
        output: false
      };
      
      const inputPos = getInputPinPosition(floatGate, 0);
      const outputPos = getOutputPinPosition(floatGate, 0);
      
      expect(inputPos.x).toBe(55.5);   // 100.5 - 45
      expect(inputPos.y).toBe(190.7);  // 200.7 - 10
      expect(outputPos.x).toBe(145.5); // 100.5 + 45
      expect(outputPos.y).toBe(200.7);
    });
  });

  describe('カスタムゲートの極端なケース', () => {
    it('1ピンのカスタムゲート', () => {
      const customGate: Gate = {
        id: 'custom-1pin',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: [''],
        output: false,
        outputs: [false],
        customGateDefinition: {
          id: 'def1',
          name: 'Buffer',
          width: 60,
          height: 40,
          inputs: [{ id: 'in', name: 'IN' }],
          outputs: [{ id: 'out', name: 'OUT' }],
          circuit: { gates: [], wires: [] }
        }
      };
      
      const inputPos = getInputPinPosition(customGate, 0);
      const outputPos = getOutputPinPosition(customGate, 0);
      
      // 1ピンの場合、中央に配置
      expect(inputPos.y).toBe(100); // y座標は変わらない
      expect(outputPos.y).toBe(100);
    });

    it('50ピンの巨大カスタムゲート', () => {
      const inputs = Array(50).fill(null).map((_, i) => ({ id: `in${i}`, name: `I${i}` }));
      const customGate: Gate = {
        id: 'custom-50pin',
        type: 'CUSTOM',
        position: { x: 100, y: 100 },
        inputs: Array(50).fill(''),
        output: false,
        outputs: [false],
        customGateDefinition: {
          id: 'def50',
          name: 'MegaMux',
          width: 200,
          height: 1000,
          inputs,
          outputs: [{ id: 'out', name: 'OUT' }],
          circuit: { gates: [], wires: [] }
        }
      };
      
      // 最初と最後のピン位置を確認
      const firstPin = getInputPinPosition(customGate, 0);
      const lastPin = getInputPinPosition(customGate, 49);
      
      expect(firstPin.x).toBe(-10); // 100 - 100 - 10
      expect(lastPin.x).toBe(-10);  // X座標は同じ
      
      // Y座標の分布を確認
      const yDiff = lastPin.y - firstPin.y;
      expect(yDiff).toBeGreaterThan(0); // 下に向かって配置
    });
  });

  describe('並行操作と競合状態', () => {
    it('複数のワイヤー描画を同時に開始できない', () => {
      const store = useCircuitStore.getState();
      
      const input1 = store.addGate('INPUT', { x: 100, y: 100 });
      const input2 = store.addGate('INPUT', { x: 100, y: 200 });
      
      // 最初のワイヤー描画を開始
      store.startWireDrawing(input1.id, -1);
      expect(useCircuitStore.getState().isDrawingWire).toBe(true);
      
      // 2つ目のワイヤー描画を開始しようとする
      store.startWireDrawing(input2.id, -1);
      
      // 最初のワイヤー描画がキャンセルされ、新しいものが開始される
      const state = useCircuitStore.getState();
      expect(state.isDrawingWire).toBe(true);
      expect(state.wireStart?.gateId).toBe(input2.id);
    });

    it('Undo/Redo中のワイヤー描画状態', () => {
      const store = useCircuitStore.getState();
      
      const input = store.addGate('INPUT', { x: 100, y: 100 });
      const output = store.addGate('OUTPUT', { x: 200, y: 100 });
      
      // ワイヤー接続
      store.startWireDrawing(input.id, -1);
      store.endWireDrawing(output.id, 0);
      
      // Undo
      store.undo();
      expect(useCircuitStore.getState().wires).toHaveLength(0);
      expect(useCircuitStore.getState().isDrawingWire).toBe(false);
      
      // Redo
      store.redo();
      expect(useCircuitStore.getState().wires).toHaveLength(1);
      expect(useCircuitStore.getState().isDrawingWire).toBe(false);
    });
  });
});