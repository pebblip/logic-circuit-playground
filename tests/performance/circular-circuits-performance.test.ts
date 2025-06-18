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

describe('循環回路パフォーマンステスト', () => {
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

  describe('循環回路の構築パフォーマンス', () => {
    it('SR Latchの構築が高速である（< 10ms）', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      const startTime = performance.now();

      // SR Latch構築
      const inputS = addGate('INPUT', { x: 100, y: 100 });
      const inputR = addGate('INPUT', { x: 100, y: 300 });
      const nor1 = addGate('NOR', { x: 300, y: 150 });
      const nor2 = addGate('NOR', { x: 300, y: 250 });
      const outputQ = addGate('OUTPUT', { x: 500, y: 150 });
      const outputQBar = addGate('OUTPUT', { x: 500, y: 250 });

      // 配線作成
      startWireDrawing(inputR.id, -1);
      endWireDrawing(nor1.id, 0);

      startWireDrawing(inputS.id, -1);
      endWireDrawing(nor2.id, 0);

      startWireDrawing(nor1.id, -1);
      endWireDrawing(outputQ.id, 0);

      startWireDrawing(nor2.id, -1);
      endWireDrawing(outputQBar.id, 0);

      // クロスカップリング
      startWireDrawing(nor1.id, -1);
      endWireDrawing(nor2.id, 1);

      startWireDrawing(nor2.id, -1);
      endWireDrawing(nor1.id, 1);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`SR Latch構築時間: ${duration.toFixed(2)}ms`);

      // SR Latchの構築は10ms以内であること
      expect(duration).toBeLessThan(10);

      // 循環依存が正しく検出されること
      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(true);
    });

    it('Ring Oscillatorの構築が高速である（< 10ms）', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      const startTime = performance.now();

      // Ring Oscillator構築
      const not1 = addGate('NOT', { x: 200, y: 200 });
      const not2 = addGate('NOT', { x: 400, y: 200 });
      const not3 = addGate('NOT', { x: 300, y: 350 });

      // 観測用OUTPUT
      const out1 = addGate('OUTPUT', { x: 200, y: 100 });
      const out2 = addGate('OUTPUT', { x: 400, y: 100 });
      const out3 = addGate('OUTPUT', { x: 300, y: 450 });

      // リング状に接続
      startWireDrawing(not1.id, -1);
      endWireDrawing(not2.id, 0);

      startWireDrawing(not2.id, -1);
      endWireDrawing(not3.id, 0);

      startWireDrawing(not3.id, -1);
      endWireDrawing(not1.id, 0);

      // 観測用接続
      startWireDrawing(not1.id, -1);
      endWireDrawing(out1.id, 0);

      startWireDrawing(not2.id, -1);
      endWireDrawing(out2.id, 0);

      startWireDrawing(not3.id, -1);
      endWireDrawing(out3.id, 0);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Ring Oscillator構築時間: ${duration.toFixed(2)}ms`);

      // Ring Oscillatorの構築は10ms以内であること
      expect(duration).toBeLessThan(10);

      // 循環依存が正しく検出されること
      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      expect(hasCircular).toBe(true);
    });
  });

  describe('循環依存検出のパフォーマンス', () => {
    it('大規模回路での循環依存検出が高速である（< 20ms）', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      // 50個のゲートからなる複雑な回路を構築
      const gates = [];
      
      // 入力ゲート
      for (let i = 0; i < 5; i++) {
        gates.push(addGate('INPUT', { x: 50, y: 100 + i * 50 }));
      }

      // AND/ORゲートのチェーン（非循環部分）
      for (let i = 0; i < 20; i++) {
        const gateType = i % 2 === 0 ? 'AND' : 'OR';
        gates.push(addGate(gateType, { x: 200 + (i % 10) * 100, y: 100 + Math.floor(i / 10) * 200 }));
      }

      // SR Latchを追加（循環部分）
      const srInputS = addGate('INPUT', { x: 100, y: 500 });
      const srInputR = addGate('INPUT', { x: 100, y: 600 });
      const srNor1 = addGate('NOR', { x: 300, y: 550 });
      const srNor2 = addGate('NOR', { x: 300, y: 600 });
      const srOutputQ = addGate('OUTPUT', { x: 500, y: 550 });

      // 出力ゲート
      for (let i = 0; i < 10; i++) {
        gates.push(addGate('OUTPUT', { x: 1200, y: 100 + i * 50 }));
      }

      // 非循環部分の配線（簡単な線形チェーン）
      for (let i = 5; i < 23; i++) { // 入力5個からAND/OR20個へ
        if (i < 25) {
          startWireDrawing(gates[i - 1].id, -1);
          endWireDrawing(gates[i].id, 0);
          
          if (i > 5) {
            startWireDrawing(gates[Math.max(0, i - 3)].id, -1);
            endWireDrawing(gates[i].id, 1);
          }
        }
      }

      // SR Latchの配線（循環部分）
      startWireDrawing(srInputS.id, -1);
      endWireDrawing(srNor2.id, 0);

      startWireDrawing(srInputR.id, -1);
      endWireDrawing(srNor1.id, 0);

      startWireDrawing(srNor1.id, -1);
      endWireDrawing(srOutputQ.id, 0);

      // クロスカップリング（循環依存）
      startWireDrawing(srNor1.id, -1);
      endWireDrawing(srNor2.id, 1);

      startWireDrawing(srNor2.id, -1);
      endWireDrawing(srNor1.id, 1);

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      console.log(`回路サイズ: ${state.gates.length}ゲート, ${state.wires.length}ワイヤー`);

      // 循環依存検出の性能測定
      const startTime = performance.now();
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      const circularGates = CircuitAnalyzer.findCircularGates(circuit);
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`循環依存検出時間: ${duration.toFixed(2)}ms`);
      console.log(`循環ゲート数: ${circularGates.length}`);

      // 循環依存が検出されること
      expect(hasCircular).toBe(true);
      
      // SR Latchの2つのNORゲートが循環ゲートとして検出されること
      expect(circularGates).toContain(srNor1.id);
      expect(circularGates).toContain(srNor2.id);

      // 検出時間が20ms以内であること
      expect(duration).toBeLessThan(20);
    });

    it('複数の循環回路が混在する場合の検出性能（< 30ms）', () => {
      const { addGate, startWireDrawing, endWireDrawing } = store.getState();

      const startTime = performance.now();

      // SR Latch 1
      const s1 = addGate('INPUT', { x: 100, y: 100 });
      const r1 = addGate('INPUT', { x: 100, y: 200 });
      const nor1_1 = addGate('NOR', { x: 300, y: 150 });
      const nor1_2 = addGate('NOR', { x: 300, y: 200 });

      // SR Latch 2
      const s2 = addGate('INPUT', { x: 100, y: 400 });
      const r2 = addGate('INPUT', { x: 100, y: 500 });
      const nor2_1 = addGate('NOR', { x: 300, y: 450 });
      const nor2_2 = addGate('NOR', { x: 300, y: 500 });

      // Ring Oscillator
      const not1 = addGate('NOT', { x: 600, y: 200 });
      const not2 = addGate('NOT', { x: 800, y: 200 });
      const not3 = addGate('NOT', { x: 700, y: 350 });

      // SR Latch 1の配線
      startWireDrawing(s1.id, -1);
      endWireDrawing(nor1_2.id, 0);
      startWireDrawing(r1.id, -1);
      endWireDrawing(nor1_1.id, 0);
      startWireDrawing(nor1_1.id, -1);
      endWireDrawing(nor1_2.id, 1);
      startWireDrawing(nor1_2.id, -1);
      endWireDrawing(nor1_1.id, 1);

      // SR Latch 2の配線
      startWireDrawing(s2.id, -1);
      endWireDrawing(nor2_2.id, 0);
      startWireDrawing(r2.id, -1);
      endWireDrawing(nor2_1.id, 0);
      startWireDrawing(nor2_1.id, -1);
      endWireDrawing(nor2_2.id, 1);
      startWireDrawing(nor2_2.id, -1);
      endWireDrawing(nor2_1.id, 1);

      // Ring Oscillatorの配線
      startWireDrawing(not1.id, -1);
      endWireDrawing(not2.id, 0);
      startWireDrawing(not2.id, -1);
      endWireDrawing(not3.id, 0);
      startWireDrawing(not3.id, -1);
      endWireDrawing(not1.id, 0);

      const state = store.getState();
      const circuit = { gates: state.gates, wires: state.wires };

      // 循環依存検出の性能測定
      const detectStartTime = performance.now();
      const hasCircular = CircuitAnalyzer.hasCircularDependency(circuit);
      const circularGates = CircuitAnalyzer.findCircularGates(circuit);
      const detectEndTime = performance.now();

      const totalTime = detectEndTime - startTime;
      const detectTime = detectEndTime - detectStartTime;

      console.log(`複数循環回路構築 + 検出時間: ${totalTime.toFixed(2)}ms`);
      console.log(`循環依存検出のみ: ${detectTime.toFixed(2)}ms`);
      console.log(`循環ゲート数: ${circularGates.length}`);

      // 循環依存が検出されること
      expect(hasCircular).toBe(true);
      
      // 7つのゲートが循環ゲートとして検出されること（SR Latch1: 2個、SR Latch2: 2個、Ring: 3個）
      expect(circularGates.length).toBe(7);

      // 検出時間が30ms以内であること
      expect(detectTime).toBeLessThan(30);
    });
  });

  describe('メモリ使用量テスト', () => {
    it('大量の循環回路でメモリリークが発生しない', () => {
      const { addGate, startWireDrawing, endWireDrawing, clearAll } = store.getState();

      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

      // 10回循環して大量の回路を作成・削除
      for (let cycle = 0; cycle < 10; cycle++) {
        // 複数のSR Latchを作成
        for (let i = 0; i < 5; i++) {
          const s = addGate('INPUT', { x: 100 + i * 150, y: 100 });
          const r = addGate('INPUT', { x: 100 + i * 150, y: 200 });
          const nor1 = addGate('NOR', { x: 250 + i * 150, y: 150 });
          const nor2 = addGate('NOR', { x: 250 + i * 150, y: 200 });

          startWireDrawing(s.id, -1);
          endWireDrawing(nor2.id, 0);
          startWireDrawing(r.id, -1);
          endWireDrawing(nor1.id, 0);
          startWireDrawing(nor1.id, -1);
          endWireDrawing(nor2.id, 1);
          startWireDrawing(nor2.id, -1);
          endWireDrawing(nor1.id, 1);
        }

        // 循環依存検出を実行
        const state = store.getState();
        const circuit = { gates: state.gates, wires: state.wires };
        CircuitAnalyzer.hasCircularDependency(circuit);
        CircuitAnalyzer.findCircularGates(circuit);

        // 回路をクリア
        clearAll();
      }

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`初期メモリ: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`最終メモリ: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`メモリ増加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      // メモリ増加が10MB以下であること（メモリリークの検出）
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
    });
  });
});