import { describe, it, expect } from 'vitest';
import { evaluateCircuitPure, evaluateGateUnified, isSuccess, defaultConfig, createFixedTimeProvider } from '@domain/simulation/pure';
import { evaluateCircuit as evaluateCircuitLegacy } from '@domain/simulation/legacy/circuitSimulation.deprecated';
import { isCustomGate } from '@/types/gates';
import { booleanArrayToDisplayStates } from '@domain/simulation/signalConversion';
import { Gate, Wire } from '@/types/circuit';

describe('Circuit Simulation Performance: 新旧実装の実測比較', () => {
  const timeProvider = createFixedTimeProvider(1000);
  const config = { ...defaultConfig, timeProvider };

  // 大規模な回路を生成するヘルパー関数（層構造で循環依存を防ぐ）
  function createTestCircuit(gateCount: number, wireRatio: number = 2) {
    const gates: Gate[] = [];
    const wires: Wire[] = [];

    // 層構造のゲート配置（循環依存を防ぐため）
    const layers = 5; // 5層構造
    const gatesPerLayer = Math.floor(gateCount / layers);
    
    // Layer 0: INPUT gates
    const inputCount = Math.max(Math.floor(gateCount * 0.1), 2);
    for (let i = 0; i < inputCount; i++) {
      gates.push({
        id: `input_${i}`,
        type: 'INPUT',
        position: { x: i * 50, y: 0 },
        inputs: [],
        output: Math.random() > 0.5,
      });
    }

    // Layers 1-3: Logic gates
    let gateIndex = 0;
    const gateTypes = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'] as const;
    for (let layer = 1; layer < layers - 1; layer++) {
      const layerGateCount = layer === 1 ? gatesPerLayer * 2 : gatesPerLayer;
      for (let i = 0; i < layerGateCount && gates.length < gateCount - gatesPerLayer; i++) {
        const gateType = gateTypes[gateIndex % gateTypes.length];
        gates.push({
          id: `logic_${gateIndex}`,
          type: gateType,
          position: { x: (i % 20) * 50, y: layer * 100 },
          inputs: gateType === 'NOT' ? [''] : ['', ''],
          output: false,
        });
        gateIndex++;
      }
    }

    // Layer 4: OUTPUT gates
    const outputCount = Math.max(Math.floor(gateCount * 0.1), 1);
    for (let i = 0; i < outputCount; i++) {
      gates.push({
        id: `output_${i}`,
        type: 'OUTPUT',
        position: { x: i * 50, y: (layers - 1) * 100 },
        inputs: [''],
        output: false,
      });
    }

    // 層構造に基づいたワイヤー生成（前の層から次の層への接続のみ）
    const layerGates: Gate[][] = [];
    layerGates[0] = gates.filter(g => g.type === 'INPUT');
    for (let layer = 1; layer < layers - 1; layer++) {
      layerGates[layer] = gates.filter(g => g.id.startsWith('logic_') && 
        Math.floor(g.position.y / 100) === layer);
    }
    layerGates[layers - 1] = gates.filter(g => g.type === 'OUTPUT');

    const maxWires = Math.min(gateCount * wireRatio, gates.length * 3);
    let wireCount = 0;
    const usedPins = new Set<string>();

    // 層間のワイヤー接続
    for (let layer = 0; layer < layers - 1 && wireCount < maxWires; layer++) {
      const fromLayer = layerGates[layer];
      const toLayer = layerGates[layer + 1];
      
      if (fromLayer.length === 0 || toLayer.length === 0) continue;

      // 各宛先ゲートに少なくとも1つの接続を確保
      for (const toGate of toLayer) {
        if (wireCount >= maxWires) break;
        
        const fromGate = fromLayer[Math.floor(Math.random() * fromLayer.length)];
        const maxPins = toGate.type === 'NOT' || toGate.type === 'OUTPUT' ? 1 : 2;
        
        for (let pinIndex = 0; pinIndex < maxPins && wireCount < maxWires; pinIndex++) {
          const pinKey = `${toGate.id}:${pinIndex}`;
          if (usedPins.has(pinKey)) continue;
          
          usedPins.add(pinKey);
          wires.push({
            id: `wire_${wireCount++}`,
            from: { gateId: fromGate.id, pinIndex: -1 },
            to: { gateId: toGate.id, pinIndex },
            isActive: false,
          });
        }
      }
    }

    return { gates, wires };
  }

  describe('新旧API パフォーマンス比較', () => {
    it('小規模回路での新旧比較 (50 gates)', () => {
      const { gates, wires } = createTestCircuit(50, 1.5);

      // 旧API測定
      const legacyStart = performance.now();
      const legacyResult = evaluateCircuitLegacy(gates, wires, timeProvider);
      const legacyEnd = performance.now();
      const legacyTime = legacyEnd - legacyStart;

      // 新API測定
      const newStart = performance.now();
      const newResult = evaluateCircuitPure({ gates, wires }, config);
      const newEnd = performance.now();
      const newTime = newEnd - newStart;

      // 改善率計算
      const improvementRatio = legacyTime / newTime;

      console.log(`50ゲート回路:`);
      console.log(`  旧API: ${legacyTime.toFixed(2)}ms`);
      console.log(`  新API: ${newTime.toFixed(2)}ms`);
      console.log(`  改善率: ${improvementRatio.toFixed(1)}倍`);

      // 結果の正確性検証
      expect(isSuccess(newResult)).toBe(true);
      if (isSuccess(newResult)) {
        expect(newResult.data.circuit.gates.length).toBe(legacyResult.gates.length);
        expect(newResult.data.circuit.wires.length).toBe(legacyResult.wires.length);
      }
      
      // 新APIのパフォーマンスを確認
      expect(newTime).toBeLessThan(50); // 50ms以内
    });

    it('中規模回路での新旧比較 (100 gates)', () => {
      const { gates, wires } = createTestCircuit(100, 2);

      // 旧API測定
      const legacyStart = performance.now();
      const legacyResult = evaluateCircuitLegacy(gates, wires, timeProvider);
      const legacyEnd = performance.now();
      const legacyTime = legacyEnd - legacyStart;

      // 新API測定
      const newStart = performance.now();
      const newResult = evaluateCircuitPure({ gates, wires }, config);
      const newEnd = performance.now();
      const newTime = newEnd - newStart;

      // 改善率計算
      const improvementRatio = legacyTime / newTime;

      console.log(`100ゲート回路:`);
      console.log(`  旧API: ${legacyTime.toFixed(2)}ms`);
      console.log(`  新API: ${newTime.toFixed(2)}ms`);
      console.log(`  改善率: ${improvementRatio.toFixed(1)}倍`);

      // 結果の正確性検証
      expect(isSuccess(newResult)).toBe(true);
      if (isSuccess(newResult)) {
        expect(newResult.data.circuit.gates.length).toBe(legacyResult.gates.length);
        expect(newResult.data.circuit.wires.length).toBe(legacyResult.wires.length);
      }
      
      // 新APIのパフォーマンスを確認
      expect(newTime).toBeLessThan(100); // 100ms以内
    });

    it('大規模回路での新旧比較 (200 gates)', () => {
      const { gates, wires } = createTestCircuit(200, 2.5);

      // 旧API測定
      const legacyStart = performance.now();
      const legacyResult = evaluateCircuitLegacy(gates, wires, timeProvider);
      const legacyEnd = performance.now();
      const legacyTime = legacyEnd - legacyStart;

      // 新API測定
      const newStart = performance.now();
      const newResult = evaluateCircuitPure({ gates, wires }, config);
      const newEnd = performance.now();
      const newTime = newEnd - newStart;

      // 改善率計算
      const improvementRatio = legacyTime / newTime;

      console.log(`200ゲート回路:`);
      console.log(`  旧API: ${legacyTime.toFixed(2)}ms`);
      console.log(`  新API: ${newTime.toFixed(2)}ms`);
      console.log(`  改善率: ${improvementRatio.toFixed(1)}倍`);

      // 結果の正確性検証
      expect(isSuccess(newResult)).toBe(true);
      if (isSuccess(newResult)) {
        expect(newResult.data.circuit.gates.length).toBe(legacyResult.gates.length);
        expect(newResult.data.circuit.wires.length).toBe(legacyResult.wires.length);
      }
      
      // 新APIのパフォーマンスを確認
      expect(newTime).toBeLessThan(200); // 200ms以内
    });
  });

  describe('新API内部のパフォーマンス特性', () => {
    it('バリデーション有無でのパフォーマンス比較', () => {
      const { gates, wires } = createTestCircuit(100, 2);

      // バリデーションあり
      const strictStart = performance.now();
      const strictResult = evaluateCircuitPure({ gates, wires }, { ...config, strictValidation: true });
      const strictEnd = performance.now();
      const strictTime = strictEnd - strictStart;

      // バリデーションなし
      const noValidStart = performance.now();
      const noValidResult = evaluateCircuitPure({ gates, wires }, { ...config, strictValidation: false });
      const noValidEnd = performance.now();
      const noValidTime = noValidEnd - noValidStart;

      console.log(`バリデーション有無の影響 (100ゲート):`);
      console.log(`  バリデーションあり: ${strictTime.toFixed(2)}ms`);
      console.log(`  バリデーションなし: ${noValidTime.toFixed(2)}ms`);
      console.log(`  オーバーヘッド: ${(strictTime - noValidTime).toFixed(2)}ms`);

      expect(isSuccess(strictResult)).toBe(true);
      expect(isSuccess(noValidResult)).toBe(true);
      
      // バリデーションのオーバーヘッドが過大でないことを確認
      expect(strictTime).toBeLessThan(noValidTime * 2);
    });

    it('デバッグモードでのパフォーマンス影響', () => {
      const { gates, wires } = createTestCircuit(100, 2);

      // デバッグなし
      const noDebugStart = performance.now();
      const noDebugResult = evaluateCircuitPure({ gates, wires }, { ...config, enableDebug: false });
      const noDebugEnd = performance.now();
      const noDebugTime = noDebugEnd - noDebugStart;

      // デバッグあり
      const debugStart = performance.now();
      const debugResult = evaluateCircuitPure({ gates, wires }, { ...config, enableDebug: true });
      const debugEnd = performance.now();
      const debugTime = debugEnd - debugStart;

      console.log(`デバッグモードの影響 (100ゲート):`);
      console.log(`  デバッグなし: ${noDebugTime.toFixed(2)}ms`);
      console.log(`  デバッグあり: ${debugTime.toFixed(2)}ms`);
      console.log(`  オーバーヘッド: ${(debugTime - noDebugTime).toFixed(2)}ms`);

      expect(isSuccess(noDebugResult)).toBe(true);
      expect(isSuccess(debugResult)).toBe(true);
      
      if (isSuccess(debugResult)) {
        expect(debugResult.data.debugTrace).toBeDefined();
        expect(debugResult.data.evaluationStats).toBeDefined();
      }
      
      // デバッグのオーバーヘッドが過大でないことを確認
      expect(debugTime).toBeLessThan(noDebugTime * 3);
    });
  });

  describe('スケーラビリティ分析', () => {
    it('サイズ増加に対する実行時間の線形性を確認', () => {
      const sizes = [50, 100, 150, 200];
      const times: number[] = [];

      sizes.forEach(size => {
        const { gates, wires } = createTestCircuit(size, 2);
        
        const start = performance.now();
        const result = evaluateCircuitPure({ gates, wires }, config);
        const end = performance.now();
        
        expect(isSuccess(result)).toBe(true);
        times.push(end - start);
      });

      console.log('新APIのスケーラビリティ:');
      sizes.forEach((size, i) => {
        console.log(`  ${size}ゲート: ${times[i].toFixed(2)}ms`);
      });

      // 線形性の検証（倍率を計算）
      const growthRatios: number[] = [];
      for (let i = 1; i < sizes.length; i++) {
        const sizeRatio = sizes[i] / sizes[i - 1];
        const timeRatio = times[i] / times[i - 1];
        growthRatios.push(timeRatio / sizeRatio);
        console.log(`  ${sizes[i-1]}→${sizes[i]}ゲート: サイズ${sizeRatio.toFixed(1)}倍, 時間${timeRatio.toFixed(1)}倍`);
      }

      // 成長率が線形（1.0に近い）であることを確認
      growthRatios.forEach(ratio => {
        expect(ratio).toBeGreaterThan(0.8);
        expect(ratio).toBeLessThan(1.5);
      });
    });

    it('ワイヤー密度の影響を分析', () => {
      const gateCount = 100;
      const densities = [1, 2, 3, 4];
      const times: number[] = [];

      densities.forEach(density => {
        const { gates, wires } = createTestCircuit(gateCount, density);
        
        const start = performance.now();
        const result = evaluateCircuitPure({ gates, wires }, config);
        const end = performance.now();
        
        expect(isSuccess(result)).toBe(true);
        times.push(end - start);
        
        console.log(`密度${density}: ${wires.length}ワイヤー`);
      });

      console.log('ワイヤー密度の影響 (100ゲート):');
      densities.forEach((density, i) => {
        console.log(`  密度${density}: ${times[i].toFixed(2)}ms`);
      });

      // ワイヤー密度が増えても線形的な増加であることを確認
      for (let i = 1; i < times.length; i++) {
        const timeRatio = times[i] / times[0];
        expect(timeRatio).toBeLessThan(densities[i] * 2); // 最悪でも2倍以内
      }
    });
  });

  describe('エッジケースのパフォーマンス', () => {
    it('循環依存がある場合の処理時間', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'gate2',
          type: 'AND',
          position: { x: 100, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'gate2', pinIndex: -1 },
          to: { gateId: 'gate1', pinIndex: 0 },
          isActive: false,
        }
      ];

      const start = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const end = performance.now();
      const time = end - start;

      console.log(`循環依存検出時間: ${time.toFixed(2)}ms`);

      expect(isSuccess(result)).toBe(false);
      expect(time).toBeLessThan(10); // 高速に失敗すること
    });

    it('非常に深い依存関係チェーンの処理', () => {
      const depth = 50;
      const gates: Gate[] = [];
      const wires: Wire[] = [];

      // 深いチェーンを作成
      for (let i = 0; i < depth; i++) {
        gates.push({
          id: `gate_${i}`,
          type: i === 0 ? 'INPUT' : 'NOT',
          position: { x: i * 50, y: 0 },
          inputs: i === 0 ? [] : [''],
          output: i === 0,
        });

        if (i > 0) {
          wires.push({
            id: `wire_${i}`,
            from: { gateId: `gate_${i - 1}`, pinIndex: -1 },
            to: { gateId: `gate_${i}`, pinIndex: 0 },
            isActive: false,
          });
        }
      }

      const start = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const end = performance.now();
      const time = end - start;

      console.log(`深さ${depth}のチェーン処理時間: ${time.toFixed(2)}ms`);

      expect(isSuccess(result)).toBe(true);
      expect(time).toBeLessThan(50); // 深いチェーンでも高速
    });
  });
});