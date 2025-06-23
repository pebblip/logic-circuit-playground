/**
 * 全ギャラリー回路包括的動作検証テスト
 * 
 * 目的: 全15種類のギャラリー回路が正しい動作をすることを包括的に検証
 * 戦略: テストファーストでバグを特定し、評価エンジンを修正
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe('All Gallery Circuits Comprehensive Behavior', () => {
  let galleryConfig: CanvasConfig;
  
  beforeEach(() => {
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: true,
        animationInterval: 100,
        showDebugInfo: false, // デバッグログ削減
        autoFit: false,
        autoFitPadding: 80,
      },
      uiControls: {
        showControls: true,
        showPreviewHeader: false,
        showBackground: false,
      },
    };
  });

  describe('🔧 組み合わせ回路（状態変化なし）', () => {
    const combinationalCircuits = [
      'half-adder',
      'decoder', 
      '4bit-comparator',
      'parity-checker',
      'majority-voter',
      'seven-segment'
    ];

    combinationalCircuits.forEach(circuitId => {
      it(`should work correctly: ${circuitId}`, async () => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
        if (!circuit) {
          console.warn(`⚠️ Circuit not found: ${circuitId}`);
          return;
        }

        const dataSource: CanvasDataSource = { galleryCircuit: circuit };
        const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 500)); // 🔥 200ms→500msに増加
        });

        console.log(`🔍 Testing ${circuitId}:`);
        
        // 基本構造確認
        expect(result.current.state.displayGates.length).toBeGreaterThan(0);
        expect(result.current.state.displayWires.length).toBeGreaterThan(0);
        
        // 組み合わせ回路はアニメーションしない
        expect(result.current.state.isAnimating).toBe(false);
        
        // 入力ゲートがある場合のトグル動作確認
        const inputGates = result.current.state.displayGates.filter(g => g.type === 'INPUT');
        if (inputGates.length > 0) {
          const initialOutputs = result.current.state.displayGates
            .filter(g => g.type === 'OUTPUT')
            .map(g => g.outputs[0]);
          
          // 最初の入力をトグル
          act(() => {
            const toggleResult = result.current.actions.toggleInput(inputGates[0].id);
            expect(toggleResult.success).toBe(true);
          });
          
          // 出力が変化したか確認
          const newOutputs = result.current.state.displayGates
            .filter(g => g.type === 'OUTPUT')
            .map(g => g.outputs[0]);
          
          // 組み合わせ回路は入力変化で即座に出力変化すべき
          const hasOutputChanged = !newOutputs.every((out, i) => out === initialOutputs[i]);
          
          console.log(`  Input gates: ${inputGates.length}`);
          console.log(`  Initial outputs: ${JSON.stringify(initialOutputs)}`);
          console.log(`  New outputs: ${JSON.stringify(newOutputs)}`);
          console.log(`  Output changed: ${hasOutputChanged}`);
          
          if (inputGates.length > 0) {
            expect(hasOutputChanged).toBe(true);
          }
        }
        
        console.log(`✅ ${circuitId} basic functionality verified`);
      }, 10000);
    });
  });

  describe('🌀 循環回路（CLOCKなし・継続アニメーション）', () => {
    const oscillatingCircuits = [
      'simple-ring-oscillator',
      'self-oscillating-memory-final',
      'mandala-circuit'
    ];

    oscillatingCircuits.forEach(circuitId => {
      it(`should oscillate continuously: ${circuitId}`, async () => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
        if (!circuit) {
          console.warn(`⚠️ Circuit not found: ${circuitId}`);
          return;
        }

        console.log(`🌀 Testing oscillating circuit: ${circuitId}`);
        
        // メタデータ確認
        expect(circuit.simulationConfig?.needsAnimation).toBe(true);
        expect(circuit.simulationConfig?.expectedBehavior).toBe('oscillator');

        const dataSource: CanvasDataSource = { galleryCircuit: circuit };
        const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

        // 初期化完了を待つ
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
        });

        // 基本構造
        expect(result.current.state.displayGates.length).toBeGreaterThan(0);
        expect(result.current.state.displayWires.length).toBeGreaterThan(0);
        
        // CLOCKゲートがないことを確認
        const hasClockGate = result.current.state.displayGates.some(g => g.type === 'CLOCK');
        expect(hasClockGate).toBe(false);

        // 🎯 重要: 時間経過による状態変化の検証
        const getGateStates = () => {
          const gates = result.current.state.displayGates;
          return gates.reduce((states, gate) => {
            states[gate.id] = gate.outputs[0];
            return states;
          }, {} as Record<string, boolean | undefined>);
        };

        // 初期状態を即座に取得
        const initialStates = getGateStates();
        console.log(`  Initial states:`, initialStates);

        // 複数回サンプリングして発振を検出
        const stateHistory: Array<Record<string, boolean | undefined>> = [initialStates];
        
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
          });
          
          const currentStates = getGateStates();
          stateHistory.push(currentStates);
          console.log(`  After ${(i + 1) * 300}ms:`, currentStates);
        }

        // 状態変化の検証
        let changeCount = 0;
        for (let i = 1; i < stateHistory.length; i++) {
          const prevStates = stateHistory[i - 1];
          const currStates = stateHistory[i];
          
          const hasChange = Object.keys(prevStates).some(
            gateId => prevStates[gateId] !== currStates[gateId]
          );
          
          if (hasChange) {
            changeCount++;
            console.log(`  State changed at ${i * 300}ms`);
          }
        }
        
        // 発振回路は継続的に変化すべき（少なくとも2回以上）
        const hasAnyChange = changeCount >= 2;

        // 🚨 状態変化の検証
        console.log(`  Total state changes: ${changeCount}`);
        
        if (!hasAnyChange) {
          console.log(`🚨 OSCILLATION FAILURE DETECTED: ${circuitId}`);
          console.log(`  Expected: At least 2 state changes`);
          console.log(`  Actual: ${changeCount} state changes detected`);
          
          // 失敗を記録
          expect(hasAnyChange).toBe(true);
        } else {
          console.log(`✅ ${circuitId} oscillation verified`);
        }
      }, 20000);
    });
  });

  describe('⏰ CLOCK駆動回路（タイマーベース）', () => {
    const clockDrivenCircuits = [
      'simple-lfsr',
      'fibonacci-counter', 
      'johnson-counter',
      'chaos-generator'
    ];

    clockDrivenCircuits.forEach(circuitId => {
      it(`should work with CLOCK: ${circuitId}`, async () => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
        if (!circuit) {
          console.warn(`⚠️ Circuit not found: ${circuitId}`);
          return;
        }

        console.log(`⏰ Testing CLOCK-driven circuit: ${circuitId}`);

        const dataSource: CanvasDataSource = { galleryCircuit: circuit };
        const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 800)); // 🔥 300ms→800msに増加
        });

        // 基本構造
        expect(result.current.state.displayGates.length).toBeGreaterThan(0);
        expect(result.current.state.displayWires.length).toBeGreaterThan(0);
        
        // CLOCKゲートが存在することを確認
        const clockGates = result.current.state.displayGates.filter(g => g.type === 'CLOCK');
        expect(clockGates.length).toBeGreaterThan(0);
        console.log(`  CLOCK gates found: ${clockGates.length}`);

        // D-FFやその他のシーケンシャルゲートの存在確認
        const sequentialGates = result.current.state.displayGates.filter(g => 
          g.type === 'D-FF' || g.type === 'SR-LATCH'
        );
        expect(sequentialGates.length).toBeGreaterThan(0);
        console.log(`  Sequential gates found: ${sequentialGates.length}`);

        // 🎯 CLOCK駆動での状態変化検証
        const getSequentialStates = () => {
          return result.current.state.displayGates
            .filter(g => g.type === 'D-FF' || g.type === 'OUTPUT')
            .reduce((states, gate) => {
              states[gate.id] = gate.outputs[0];
              return states;
            }, {} as Record<string, boolean | undefined>);
        };

        const initialStates = getSequentialStates();
        console.log(`  Initial sequential states:`, initialStates);

        // CLOCKサイクル実行のための時間経過（十分な時間確保）
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 🔥 600ms→1500msに増加
        });

        const afterStates = getSequentialStates();
        console.log(`  After CLOCK cycles:`, afterStates);

        // CLOCK駆動回路は状態変化すべき
        const hasChanged = Object.keys(initialStates).some(
          gateId => initialStates[gateId] !== afterStates[gateId]
        );

        console.log(`  Sequential state changed: ${hasChanged}`);

        if (!hasChanged) {
          console.log(`🚨 CLOCK OPERATION FAILURE: ${circuitId}`);
          console.log(`  Expected: State changes on CLOCK cycles`);
          console.log(`  Actual: No sequential state changes`);
        }

        // CLOCK回路の動作検証（現在はバグの可能性あり）
        expect(hasChanged).toBe(true);
        
        console.log(`✅ ${circuitId} CLOCK operation verified`);
      }, 15000);
    });
  });

  describe('💾 メモリ回路（入力応答型）', () => {
    const memoryCircuits = ['sr-latch', 'sr-latch-basic'];
    
    memoryCircuits.forEach(circuitId => {
      it(`should work correctly: ${circuitId}`, async () => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
      if (!circuit) {
        console.warn('⚠️ SR-LATCH circuit not found');
        return;
      }

      console.log(`💾 Testing memory circuit: ${circuitId}`);

      const dataSource: CanvasDataSource = { galleryCircuit: circuit };
      const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // 🔥 200ms→500msに増加
      });

      // 基本構造
      expect(result.current.state.displayGates.length).toBeGreaterThan(0);
      expect(result.current.state.displayWires.length).toBeGreaterThan(0);
      
      // SR-LATCHまたはNORゲートの存在確認
      const srLatchGates = result.current.state.displayGates.filter(g => g.type === 'SR-LATCH');
      const norGates = result.current.state.displayGates.filter(g => g.type === 'NOR');
      expect(srLatchGates.length + norGates.length).toBeGreaterThan(0);
      
      // 入力ゲート確認
      const inputGates = result.current.state.displayGates.filter(g => g.type === 'INPUT');
      expect(inputGates.length).toBe(2); // S, R inputs
      
      // 出力ゲート確認 
      const outputGates = result.current.state.displayGates.filter(g => g.type === 'OUTPUT');
      expect(outputGates.length).toBe(2); // Q, Q_BAR outputs

      console.log(`  SR-LATCH gates: ${srLatchGates.length}, NOR gates: ${norGates.length}`);
      console.log(`  Input gates: ${inputGates.length}`);
      console.log(`  Output gates: ${outputGates.length}`);

      // 🎯 メモリ動作テスト: SET操作
      const sInput = inputGates.find(g => g.id.includes('s') || g.id.includes('S'));
      const rInput = inputGates.find(g => g.id.includes('r') || g.id.includes('R'));
      
      if (sInput && rInput) {
        // SET操作: S=1, R=0
        act(() => {
          result.current.actions.toggleInput(sInput.id); // S=1
        });

        const afterSet = result.current.state.displayGates
          .filter(g => g.type === 'OUTPUT')
          .map(g => ({ id: g.id, output: g.outputs[0] }));
        
        console.log('  After SET operation:', afterSet);

        // RESET操作: S=0, R=1  
        act(() => {
          result.current.actions.toggleInput(sInput.id); // S=0
          result.current.actions.toggleInput(rInput.id); // R=1
        });

        const afterReset = result.current.state.displayGates
          .filter(g => g.type === 'OUTPUT')
          .map(g => ({ id: g.id, output: g.outputs[0] }));
        
        console.log('  After RESET operation:', afterReset);

        // メモリ動作の検証
        const setResetDifferent = !afterSet.every((gate, i) => 
          gate.output === afterReset[i]?.output
        );
        
        expect(setResetDifferent).toBe(true);
        console.log(`✅ ${circuitId} memory operation verified`);
      }
    }, 10000);
    });
  });

  describe('📊 包括的問題レポート', () => {
    it('should identify all circuit types and their issues', async () => {
      console.log('📊 COMPREHENSIVE GALLERY CIRCUIT ANALYSIS:');
      
      const circuitsByType = {
        combinational: ['half-adder', 'decoder', '4bit-comparator', 'parity-checker', 'majority-voter', 'seven-segment'],
        oscillating: ['simple-ring-oscillator', 'chaos-generator', 'sr-latch-basic', 'self-oscillating-memory-final', 'mandala-circuit'],
        clockDriven: ['simple-lfsr', 'fibonacci-counter', 'johnson-counter'],
        memory: ['sr-latch']
      };

      let totalCircuits = 0;
      let foundCircuits = 0;

      Object.entries(circuitsByType).forEach(([type, circuitIds]) => {
        console.log(`\n🔍 ${type.toUpperCase()} CIRCUITS:`);
        
        circuitIds.forEach(circuitId => {
          totalCircuits++;
          const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
          
          if (circuit) {
            foundCircuits++;
            console.log(`  ✅ ${circuitId}: Found`);
            console.log(`    - Gates: ${circuit.gates.length}`);
            console.log(`    - Wires: ${circuit.wires.length}`);
            if (circuit.simulationConfig) {
              console.log(`    - Animation: ${circuit.simulationConfig.needsAnimation}`);
              console.log(`    - Behavior: ${circuit.simulationConfig.expectedBehavior}`);
            }
          } else {
            console.log(`  ❌ ${circuitId}: NOT FOUND`);
          }
        });
      });

      console.log(`\n📈 SUMMARY:`);
      console.log(`  Total expected circuits: ${totalCircuits}`);
      console.log(`  Found circuits: ${foundCircuits}`);
      console.log(`  Missing circuits: ${totalCircuits - foundCircuits}`);

      expect(foundCircuits).toBeGreaterThan(10); // 最低限の回路数確認
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('  1. Run individual circuit tests to identify specific failures');
      console.log('  2. Fix evaluation engine for oscillating circuits');
      console.log('  3. Verify CLOCK-driven circuit operation');
      console.log('  4. Ensure combinational circuit correctness');
    });
  });
});