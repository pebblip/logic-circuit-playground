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
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';

describe('🎨 全ギャラリーコンテンツ完全テスト', () => {
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

  describe('🔍 ギャラリーコンテンツ整合性テスト', () => {
    it('全てのギャラリー回路が適切に定義されている', () => {
      expect(FEATURED_CIRCUITS).toBeDefined();
      expect(Array.isArray(FEATURED_CIRCUITS)).toBe(true);
      expect(FEATURED_CIRCUITS.length).toBeGreaterThan(0);

      console.log(`\n📊 ギャラリー回路数: ${FEATURED_CIRCUITS.length}`);
      console.log('📋 ギャラリー回路一覧:');
      FEATURED_CIRCUITS.forEach((circuit, index) => {
        console.log(`  ${index + 1}. ${circuit.title} (${circuit.id})`);
      });
    });

    it('各回路が必須フィールドを持っている', () => {
      FEATURED_CIRCUITS.forEach(circuit => {
        // 必須フィールドの検証
        expect(circuit.id).toBeDefined();
        expect(circuit.title).toBeDefined();
        expect(circuit.description).toBeDefined();
        expect(circuit.gates).toBeDefined();
        expect(circuit.wires).toBeDefined();

        // 型の検証
        expect(typeof circuit.id).toBe('string');
        expect(typeof circuit.title).toBe('string');
        expect(typeof circuit.description).toBe('string');
        expect(Array.isArray(circuit.gates)).toBe(true);
        expect(Array.isArray(circuit.wires)).toBe(true);

        // 内容の検証
        expect(circuit.id.length).toBeGreaterThan(0);
        expect(circuit.title.length).toBeGreaterThan(0);
        expect(circuit.description.length).toBeGreaterThan(10); // 説明は最低10文字
        expect(circuit.gates.length).toBeGreaterThan(0);
      });
    });

    it('各ゲートが適切に定義されている', () => {
      FEATURED_CIRCUITS.forEach(circuit => {
        circuit.gates.forEach(gate => {
          // 必須フィールド
          expect(gate.id).toBeDefined();
          expect(gate.type).toBeDefined();
          expect(gate.position).toBeDefined();
          expect(gate.output).toBeDefined();
          expect(gate.inputs).toBeDefined();

          // 型検証
          expect(typeof gate.id).toBe('string');
          expect(typeof gate.type).toBe('string');
          expect(typeof gate.position).toBe('object');
          expect(typeof gate.output).toBe('boolean');
          expect(Array.isArray(gate.inputs)).toBe(true);

          // 座標検証
          expect(typeof gate.position.x).toBe('number');
          expect(typeof gate.position.y).toBe('number');
          expect(gate.position.x).toBeGreaterThanOrEqual(0);
          expect(gate.position.y).toBeGreaterThanOrEqual(0);

          // IDの一意性検証（回路内で）
          const duplicateIds = circuit.gates.filter(g => g.id === gate.id);
          expect(duplicateIds.length).toBe(1);
        });
      });
    });

    it('各ワイヤーが適切に定義されている', () => {
      FEATURED_CIRCUITS.forEach(circuit => {
        circuit.wires.forEach(wire => {
          // 必須フィールド
          expect(wire.id).toBeDefined();
          expect(wire.from).toBeDefined();
          expect(wire.to).toBeDefined();
          expect(wire.isActive).toBeDefined();

          // 型検証
          expect(typeof wire.id).toBe('string');
          expect(typeof wire.from).toBe('object');
          expect(typeof wire.to).toBe('object');
          expect(typeof wire.isActive).toBe('boolean');

          // from/to検証
          expect(wire.from.gateId).toBeDefined();
          expect(wire.from.pinIndex).toBeDefined();
          expect(wire.to.gateId).toBeDefined();
          expect(wire.to.pinIndex).toBeDefined();

          expect(typeof wire.from.gateId).toBe('string');
          expect(typeof wire.from.pinIndex).toBe('number');
          expect(typeof wire.to.gateId).toBe('string');
          expect(typeof wire.to.pinIndex).toBe('number');

          // ゲートIDの存在確認
          const fromGateExists = circuit.gates.some(g => g.id === wire.from.gateId);
          const toGateExists = circuit.gates.some(g => g.id === wire.to.gateId);
          
          expect(fromGateExists).toBe(true);
          expect(toGateExists).toBe(true);

          // ワイヤーIDの一意性検証（回路内で）
          const duplicateIds = circuit.wires.filter(w => w.id === wire.id);
          expect(duplicateIds.length).toBe(1);
        });
      });
    });
  });

  describe('⚡ 回路読み込み・動作テスト', () => {
    FEATURED_CIRCUITS.forEach(circuit => {
      it(`${circuit.title} (${circuit.id}) の読み込みと動作確認`, () => {
        const startTime = performance.now();

        // 回路を読み込み
        store.setState({
          gates: circuit.gates.map(gate => ({ ...gate })),
          wires: circuit.wires.map(wire => ({ ...wire })),
          selectedGateId: null,
          isDrawingWire: false,
          wireStart: null,
        });

        const state = store.getState();
        const loadTime = performance.now() - startTime;

        // 読み込み検証
        expect(state.gates.length).toBe(circuit.gates.length);
        expect(state.wires.length).toBe(circuit.wires.length);

        // 回路分析
        const circuitForAnalysis = { gates: state.gates, wires: state.wires };
        const hasCircular = CircuitAnalyzer.hasCircularDependency(circuitForAnalysis);
        
        let circularGates: string[] = [];
        if (hasCircular) {
          circularGates = CircuitAnalyzer.findCircularGates(circuitForAnalysis);
        }

        // パフォーマンス検証
        expect(loadTime).toBeLessThan(100); // 100ms以内

        // 入力ゲートの動作テスト
        const inputGates = state.gates.filter(g => g.type === 'INPUT');
        inputGates.forEach(inputGate => {
          // 入力の切り替えテスト
          const { updateGateOutput } = store.getState();
          
          // ON -> OFF
          updateGateOutput(inputGate.id, true);
          const stateAfterOn = store.getState();
          const updatedGateOn = stateAfterOn.gates.find(g => g.id === inputGate.id);
          expect(updatedGateOn?.output).toBe(true);

          // OFF -> ON
          updateGateOutput(inputGate.id, false);
          const stateAfterOff = store.getState();
          const updatedGateOff = stateAfterOff.gates.find(g => g.id === inputGate.id);
          expect(updatedGateOff?.output).toBe(false);
        });

        // CLOCKゲートの動作テスト
        const clockGates = state.gates.filter(g => g.type === 'CLOCK');
        clockGates.forEach(clockGate => {
          expect(clockGate.metadata).toBeDefined();
          expect(clockGate.metadata?.frequency).toBeDefined();
          expect(typeof clockGate.metadata?.frequency).toBe('number');
          expect(clockGate.metadata?.frequency).toBeGreaterThan(0);
        });

        // レポート出力
        console.log(`\n✅ ${circuit.title}`);
        console.log(`   📍 ID: ${circuit.id}`);
        console.log(`   🔧 ゲート数: ${state.gates.length}`);
        console.log(`   🔗 ワイヤー数: ${state.wires.length}`);
        console.log(`   ⚡ 読み込み時間: ${loadTime.toFixed(2)}ms`);
        console.log(`   🔄 循環回路: ${hasCircular ? 'あり' : 'なし'}`);
        if (hasCircular) {
          console.log(`   🎯 循環ゲート数: ${circularGates.length}`);
        }
        console.log(`   📥 入力ゲート数: ${inputGates.length}`);
        console.log(`   ⏰ クロックゲート数: ${clockGates.length}`);
      });
    });
  });

  describe('🎯 特殊回路テスト', () => {
    it('循環回路（SR Latch, Ring Oscillator）の特別テスト', () => {
      const circularCircuits = FEATURED_CIRCUITS.filter(circuit => 
        circuit.id === 'sr-latch-basic' || circuit.id === 'ring-oscillator'
      );

      expect(circularCircuits.length).toBeGreaterThan(0);

      circularCircuits.forEach(circuit => {
        // 回路読み込み
        store.setState({
          gates: circuit.gates.map(gate => ({ ...gate })),
          wires: circuit.wires.map(wire => ({ ...wire })),
        });

        const state = store.getState();
        const circuitForAnalysis = { gates: state.gates, wires: state.wires };

        // 循環依存の確認
        const hasCircular = CircuitAnalyzer.hasCircularDependency(circuitForAnalysis);
        expect(hasCircular).toBe(true);

        const circularGates = CircuitAnalyzer.findCircularGates(circuitForAnalysis);
        expect(circularGates.length).toBeGreaterThan(0);

        console.log(`\n🔄 循環回路テスト: ${circuit.title}`);
        console.log(`   ✅ 循環依存検出: ${hasCircular}`);
        console.log(`   🎯 循環ゲート: ${circularGates.join(', ')}`);
      });
    });

    it('複雑な組み合わせ回路（4ビット比較器など）の性能テスト', () => {
      const complexCircuits = FEATURED_CIRCUITS.filter(circuit => 
        circuit.gates.length > 15 // 15ゲート以上を複雑回路とする
      );

      complexCircuits.forEach(circuit => {
        const startTime = performance.now();

        // 回路読み込み
        store.setState({
          gates: circuit.gates.map(gate => ({ ...gate })),
          wires: circuit.wires.map(wire => ({ ...wire })),
        });

        const loadTime = performance.now() - startTime;

        // 複雑回路でも高速読み込み
        expect(loadTime).toBeLessThan(50); // 50ms以内

        const state = store.getState();
        
        // 全入力パターンのテスト（入力数が少ない場合のみ）
        const inputGates = state.gates.filter(g => g.type === 'INPUT');
        if (inputGates.length <= 4) { // 4入力以下の場合のみ全パターンテスト
          const totalPatterns = Math.pow(2, inputGates.length);
          
          for (let pattern = 0; pattern < totalPatterns; pattern++) {
            inputGates.forEach((gate, index) => {
              const value = Boolean((pattern >> index) & 1);
              store.getState().updateGateOutput(gate.id, value);
            });

            // 回路が正常に動作することを確認（エラーが発生しないこと）
            const currentState = store.getState();
            expect(currentState.errorMessage).toBeNull();
          }
        }

        console.log(`\n🏗️  複雑回路テスト: ${circuit.title}`);
        console.log(`   🔧 ゲート数: ${circuit.gates.length}`);
        console.log(`   ⚡ 読み込み時間: ${loadTime.toFixed(2)}ms`);
        console.log(`   📥 入力数: ${inputGates.length}`);
      });
    });
  });

  describe('🚀 パフォーマンス総合テスト', () => {
    it('全ギャラリー回路の連続読み込み性能', () => {
      const loadTimes: number[] = [];
      
      FEATURED_CIRCUITS.forEach(circuit => {
        const startTime = performance.now();
        
        // 回路読み込み
        store.getState().clearAll();
        store.setState({
          gates: circuit.gates.map(gate => ({ ...gate })),
          wires: circuit.wires.map(wire => ({ ...wire })),
        });
        
        const loadTime = performance.now() - startTime;
        loadTimes.push(loadTime);
      });

      // 統計計算
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      const maxLoadTime = Math.max(...loadTimes);
      const minLoadTime = Math.min(...loadTimes);

      console.log(`\n📊 パフォーマンス統計:`);
      console.log(`   ⚡ 平均読み込み時間: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`   🚀 最速読み込み時間: ${minLoadTime.toFixed(2)}ms`);
      console.log(`   🐌 最遅読み込み時間: ${maxLoadTime.toFixed(2)}ms`);

      // パフォーマンス基準
      expect(avgLoadTime).toBeLessThan(30); // 平均30ms以内
      expect(maxLoadTime).toBeLessThan(100); // 最大100ms以内
    });

    it('メモリ使用量テスト', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // 全回路を順次読み込み
      FEATURED_CIRCUITS.forEach(circuit => {
        store.getState().clearAll();
        store.setState({
          gates: circuit.gates.map(gate => ({ ...gate })),
          wires: circuit.wires.map(wire => ({ ...wire })),
        });

        // 循環依存チェック（重い処理）
        const state = store.getState();
        const circuitForAnalysis = { gates: state.gates, wires: state.wires };
        CircuitAnalyzer.hasCircularDependency(circuitForAnalysis);
      });

      // 最終クリーンアップ
      store.getState().clearAll();

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`\n💾 メモリ使用量:`);
      console.log(`   📊 初期メモリ: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   📊 最終メモリ: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   📈 メモリ増加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      // メモリリークチェック
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB以下
      }
    });
  });

  describe('🔍 品質保証テスト', () => {
    it('教育的価値の検証', () => {
      const educationalCriteria = [
        'half-adder',        // 基本的な算術回路
        'sr-latch-basic',    // 記憶回路の基本
        'ring-oscillator',   // 発振回路
        'comparator-4bit',   // 実用的な比較回路
        'parity-checker',    // エラー検出
        'seven-segment-decoder' // 表示回路
      ];

      educationalCriteria.forEach(expectedId => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === expectedId);
        expect(circuit).toBeDefined();
        
        if (circuit) {
          // 教育的価値の基準
          expect(circuit.gates.length).toBeGreaterThan(2); // 最低限の複雑さ
          expect(circuit.description.length).toBeGreaterThan(20); // 十分な説明
          
          console.log(`✅ 教育的回路確認: ${circuit.title}`);
        }
      });
    });

    it('ギャラリー品質基準の検証', () => {
      FEATURED_CIRCUITS.forEach(circuit => {
        // 品質基準
        const hasInputs = circuit.gates.some(g => g.type === 'INPUT');
        const hasOutputs = circuit.gates.some(g => g.type === 'OUTPUT');
        const hasLogicGates = circuit.gates.some(g => 
          ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'].includes(g.type)
        );

        expect(hasInputs || circuit.gates.some(g => g.type === 'CLOCK')).toBe(true); // 入力またはクロック
        expect(hasOutputs).toBe(true); // 出力必須
        expect(hasLogicGates || circuit.gates.some(g => g.type === 'CLOCK')).toBe(true); // 論理ゲートまたはクロック

        // ワイヤー接続の妥当性
        expect(circuit.wires.length).toBeGreaterThan(0); // 接続が存在
        
        // 説明の質
        expect(circuit.description).toMatch(/回路|ゲート|論理|デジタル/); // 専門用語を含む
        
        console.log(`🎯 品質基準適合: ${circuit.title}`);
      });
    });
  });
});