import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import type { CircuitStore } from '../../src/stores/types';
import { createHistorySlice } from '../../src/stores/slices/historySlice';
import { createSelectionSlice } from '../../src/stores/slices/selectionSlice';
import { createGateOperationsSlice } from '../../src/stores/slices/gateOperations';
import { createWireOperationsSlice } from '../../src/stores/slices/wireOperations';
import { createClipboardSlice } from '../../src/stores/slices/clipboardSlice';
import { createCustomGateSlice } from '../../src/stores/slices/customGateSlice';
import { createAppModeSlice } from '../../src/stores/slices/appModeSlice';
import { createToolPaletteSlice } from '../../src/stores/slices/toolPaletteSlice';
import { createShareSlice } from '../../src/stores/slices/shareSlice';
import { createErrorSlice } from '../../src/stores/slices/errorSlice';
import { createTimingChartSlice } from '../../src/stores/slices/timingChartSlice';
import { createClockSelectionSlice } from '../../src/stores/slices/clockSelectionSlice';
import { CircuitAnalyzer } from '../../src/domain/simulation/event-driven-minimal';

describe('循環回路統合テスト', () => {
  let store: ReturnType<typeof create<CircuitStore>>;

  beforeEach(() => {
    store = create<CircuitStore>()((...a) => ({
      // 基本的な状態
      gates: [],
      wires: [],
      isDrawingWire: false,
      wireStart: null,
      selectedClockGateId: null,
      errorMessage: null,
      errorType: null,

      // 各スライスをマージ
      ...createHistorySlice(...a),
      ...createSelectionSlice(...a),
      ...createGateOperationsSlice(...a),
      ...createWireOperationsSlice(...a),
      ...createClipboardSlice(...a),
      ...createCustomGateSlice(...a),
      ...createAppModeSlice(...a),
      ...createToolPaletteSlice(...a),
      ...createShareSlice(...a),
      ...createErrorSlice(...a),
      ...createTimingChartSlice(...a),
      ...createClockSelectionSlice(...a),
    }));
  });

  describe('SR Latchの統合テスト', () => {
    it('SR Latchを構築して動作確認', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      // ゲートを追加
      const inputS = addGate('INPUT', { x: 100, y: 100 });
      const inputR = addGate('INPUT', { x: 100, y: 300 });
      const nor1 = addGate('NOR', { x: 300, y: 150 });
      const nor2 = addGate('NOR', { x: 300, y: 250 });
      const outputQ = addGate('OUTPUT', { x: 500, y: 150 });
      const outputQBar = addGate('OUTPUT', { x: 500, y: 250 });

      // 配線を作成
      // R → NOR1の1番目の入力
      startWireDrawing(inputR.id, -1);
      endWireDrawing(nor1.id, 0);

      // S → NOR2の1番目の入力
      startWireDrawing(inputS.id, -1);
      endWireDrawing(nor2.id, 0);

      // NOR1 → Q
      startWireDrawing(nor1.id, -1);
      endWireDrawing(outputQ.id, 0);

      // NOR2 → Q_BAR
      startWireDrawing(nor2.id, -1);
      endWireDrawing(outputQBar.id, 0);

      // クロスカップリング: NOR1 → NOR2
      startWireDrawing(nor1.id, -1);
      endWireDrawing(nor2.id, 1);

      // クロスカップリング: NOR2 → NOR1
      startWireDrawing(nor2.id, -1);
      endWireDrawing(nor1.id, 1);

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      // 循環依存を検出
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(true);

      // 循環ゲートを特定
      const circularGates = CircuitAnalyzer.findCircularGates(circuit);
      expect(circularGates).toContain(nor1.id);
      expect(circularGates).toContain(nor2.id);

      // SR Latchの動作確認
      // S=1, R=0でSet操作
      const sGate = state.gates.find(g => g.id === inputS.id);
      const rGate = state.gates.find(g => g.id === inputR.id);
      const qGate = state.gates.find(g => g.id === outputQ.id);
      const qBarGate = state.gates.find(g => g.id === outputQBar.id);

      expect(sGate).toBeDefined();
      expect(rGate).toBeDefined();
      expect(qGate).toBeDefined();
      expect(qBarGate).toBeDefined();

      console.log('SR Latch integration test completed successfully');
      console.log('Circular dependency detected:', hasCircular);
      console.log('Circular gates:', circularGates);
    });
  });

  describe('Ring Oscillatorの統合テスト', () => {
    it('Ring Oscillatorを構築して動作確認', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      // NOTゲートを3つ追加
      const not1 = addGate('NOT', { x: 200, y: 200 });
      const not2 = addGate('NOT', { x: 400, y: 200 });
      const not3 = addGate('NOT', { x: 300, y: 350 });

      // 観測用OUTPUT
      const out1 = addGate('OUTPUT', { x: 200, y: 100 });
      const out2 = addGate('OUTPUT', { x: 400, y: 100 });
      const out3 = addGate('OUTPUT', { x: 300, y: 450 });

      // リング状に接続
      // NOT1 → NOT2
      startWireDrawing(not1.id, -1);
      endWireDrawing(not2.id, 0);

      // NOT2 → NOT3
      startWireDrawing(not2.id, -1);
      endWireDrawing(not3.id, 0);

      // NOT3 → NOT1（フィードバック）
      startWireDrawing(not3.id, -1);
      endWireDrawing(not1.id, 0);

      // 観測用接続
      startWireDrawing(not1.id, -1);
      endWireDrawing(out1.id, 0);

      startWireDrawing(not2.id, -1);
      endWireDrawing(out2.id, 0);

      startWireDrawing(not3.id, -1);
      endWireDrawing(out3.id, 0);

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      // 循環依存を検出
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(true);

      // 循環ゲートを特定
      const circularGates = CircuitAnalyzer.findCircularGates(circuit);
      expect(circularGates).toContain(not1.id);
      expect(circularGates).toContain(not2.id);
      expect(circularGates).toContain(not3.id);

      console.log('Ring Oscillator integration test completed successfully');
      console.log('Circular dependency detected:', hasCircular);
      console.log('Circular gates:', circularGates);
    });
  });

  describe('複合回路の統合テスト', () => {
    it('循環回路と非循環回路の混在', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      // 非循環部分: AND回路
      const inputA = addGate('INPUT', { x: 50, y: 50 });
      const inputB = addGate('INPUT', { x: 50, y: 100 });
      const andGate = addGate('AND', { x: 200, y: 75 });
      const outputAnd = addGate('OUTPUT', { x: 350, y: 75 });

      // 循環部分: SR Latch
      const inputS = addGate('INPUT', { x: 100, y: 200 });
      const inputR = addGate('INPUT', { x: 100, y: 300 });
      const nor1 = addGate('NOR', { x: 300, y: 225 });
      const nor2 = addGate('NOR', { x: 300, y: 275 });
      const outputQ = addGate('OUTPUT', { x: 500, y: 225 });

      // 非循環部分の配線
      startWireDrawing(inputA.id, -1);
      endWireDrawing(andGate.id, 0);

      startWireDrawing(inputB.id, -1);
      endWireDrawing(andGate.id, 1);

      startWireDrawing(andGate.id, -1);
      endWireDrawing(outputAnd.id, 0);

      // 循環部分の配線
      startWireDrawing(inputS.id, -1);
      endWireDrawing(nor2.id, 0);

      startWireDrawing(inputR.id, -1);
      endWireDrawing(nor1.id, 0);

      startWireDrawing(nor1.id, -1);
      endWireDrawing(outputQ.id, 0);

      // クロスカップリング
      startWireDrawing(nor1.id, -1);
      endWireDrawing(nor2.id, 1);

      startWireDrawing(nor2.id, -1);
      endWireDrawing(nor1.id, 1);

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      // 循環依存を検出（部分的に存在）
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(true);

      // 循環ゲートは NOR1, NOR2 のみ
      const circularGates = CircuitAnalyzer.findCircularGates(circuit);
      expect(circularGates).toContain(nor1.id);
      expect(circularGates).toContain(nor2.id);
      expect(circularGates).not.toContain(andGate.id);
      expect(circularGates).not.toContain(inputA.id);
      expect(circularGates).not.toContain(inputB.id);

      console.log('Mixed circuit integration test completed successfully');
      console.log('Total gates:', state.gates.length);
      console.log('Circular gates count:', circularGates.length);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のゲートでも正常動作', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      const startTime = performance.now();

      // 10個のANDゲートチェーン（非循環）
      let prevGate = addGate('INPUT', { x: 50, y: 100 });
      for (let i = 0; i < 10; i++) {
        const andGate = addGate('AND', { x: 150 + i * 50, y: 100 });
        const inputGate = addGate('INPUT', { x: 50, y: 150 + i * 20 });
        
        startWireDrawing(prevGate.id, -1);
        endWireDrawing(andGate.id, 0);
        
        startWireDrawing(inputGate.id, -1);
        endWireDrawing(andGate.id, 1);
        
        prevGate = andGate;
      }

      // 最後に出力
      const finalOutput = addGate('OUTPUT', { x: 800, y: 100 });
      startWireDrawing(prevGate.id, -1);
      endWireDrawing(finalOutput.id, 0);

      const endTime = performance.now();
      const duration = endTime - startTime;

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      // 循環依存がないことを確認
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(false);

      console.log(`Performance test completed in ${duration.toFixed(2)}ms`);
      console.log('Total gates:', state.gates.length);
      console.log('Total wires:', state.wires.length);

      // パフォーマンス目標: 100ms以内
      expect(duration).toBeLessThan(100);
    });
  });
});