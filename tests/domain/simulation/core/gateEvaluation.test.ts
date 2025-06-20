import { describe, it, expect, vi } from 'vitest';
import type { Gate } from '@/types/circuit';
import type { CustomGateDefinition } from '@/types/gates';
import {
  evaluateGateUnified,
  evaluateGateSingle,
  evaluateGateMulti,
  convertToLegacyFormat,
  defaultCustomGateEvaluator,
  type EvaluationConfig
} from '@domain/simulation/core/gateEvaluation';
import { defaultConfig, success, failure, createEvaluationError } from '@domain/simulation/core/types';
import { createFixedTimeProvider } from '@domain/simulation/core';

describe('Pure API Gate Evaluation', () => {
  describe('基本ゲート評価', () => {
    describe('INPUT/OUTPUT ゲート', () => {
      it('should evaluate INPUT gate', () => {
        const gate: Gate = {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true
        };
        
        const result = evaluateGateUnified(gate, [], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.outputs).toEqual([true]);
          expect(result.data.primaryOutput).toBe(true);
          expect(result.data.isSingleOutput).toBe(true);
        }
      });

      it('should evaluate OUTPUT gate', () => {
        const gate: Gate = {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false
        };
        
        const result = evaluateGateUnified(gate, [true], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.outputs).toEqual([true]);
          expect(result.data.primaryOutput).toBe(true);
        }
      });
    });

    describe('論理ゲート', () => {
      it('should evaluate AND gate correctly', () => {
        const gate: Gate = {
          id: 'and1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, false], expected: false },
          { inputs: [false, true], expected: false },
          { inputs: [true, false], expected: false },
          { inputs: [true, true], expected: true }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate OR gate correctly', () => {
        const gate: Gate = {
          id: 'or1',
          type: 'OR',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, false], expected: false },
          { inputs: [false, true], expected: true },
          { inputs: [true, false], expected: true },
          { inputs: [true, true], expected: true }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate NOT gate correctly', () => {
        const gate: Gate = {
          id: 'not1',
          type: 'NOT',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false
        };
        
        const testCases = [
          { inputs: [false], expected: true },
          { inputs: [true], expected: false }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate XOR gate correctly', () => {
        const gate: Gate = {
          id: 'xor1',
          type: 'XOR',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, false], expected: false },
          { inputs: [false, true], expected: true },
          { inputs: [true, false], expected: true },
          { inputs: [true, true], expected: false }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate NAND gate correctly', () => {
        const gate: Gate = {
          id: 'nand1',
          type: 'NAND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, false], expected: true },
          { inputs: [false, true], expected: true },
          { inputs: [true, false], expected: true },
          { inputs: [true, true], expected: false }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate NOR gate correctly', () => {
        const gate: Gate = {
          id: 'nor1',
          type: 'NOR',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, false], expected: true },
          { inputs: [false, true], expected: false },
          { inputs: [true, false], expected: false },
          { inputs: [true, true], expected: false }
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });
    });

    describe('特殊ゲート', () => {
      it('should evaluate MUX gate correctly', () => {
        const gate: Gate = {
          id: 'mux1',
          type: 'MUX',
          position: { x: 0, y: 0 },
          inputs: ['', '', ''],
          output: false
        };
        
        const testCases = [
          { inputs: [false, true, false], expected: false }, // S=0 => Y=I0
          { inputs: [false, true, true], expected: true },   // S=1 => Y=I1
          { inputs: [true, false, false], expected: true },  // S=0 => Y=I0
          { inputs: [true, false, true], expected: false }   // S=1 => Y=I1
        ];
        
        testCases.forEach(({ inputs, expected }) => {
          const result = evaluateGateUnified(gate, inputs, defaultConfig);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.primaryOutput).toBe(expected);
          }
        });
      });

      it('should evaluate CLOCK gate when running', () => {
        const gate: Gate = {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 2, // 2Hz
            startTime: 0
          }
        };
        
        const config = {
          ...defaultConfig,
          timeProvider: createFixedTimeProvider(250) // 250ms後
        };
        
        const result = evaluateGateUnified(gate, [], config);
        expect(result.success).toBe(true);
        if (result.success) {
          // 250ms後、周期500ms（2Hz）なので、まだLow
          expect(result.data.primaryOutput).toBe(false);
        }
        
        // 750ms後をテスト
        const config2 = {
          ...defaultConfig,
          timeProvider: createFixedTimeProvider(750)
        };
        
        const result2 = evaluateGateUnified(gate, [], config2);
        expect(result2.success).toBe(true);
        if (result2.success) {
          // 750ms後、周期500msなので、cyclePosition=250ms（Low期間の開始）
          expect(result2.data.primaryOutput).toBe(false);
        }
      });

      it('should evaluate CLOCK gate when not running', () => {
        const gate: Gate = {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: false,
            frequency: 1
          }
        };
        
        const result = evaluateGateUnified(gate, [], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.primaryOutput).toBe(false);
        }
      });

      it('should evaluate D-FF gate correctly', () => {
        // 立ち上がりエッジのテスト（previousClockState: false, CLK: true）
        const gate1: Gate = {
          id: 'dff1',
          type: 'D-FF',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
          metadata: {
            previousClockState: false,
            qOutput: false
          }
        };
        
        const result1 = evaluateGateUnified(gate1, [true, true], defaultConfig); // D=1, CLK=1 (立ち上がり)
        expect(result1.success).toBe(true);
        if (result1.success) {
          expect(result1.data.primaryOutput).toBe(true); // Dがキャプチャされる
        }
        
        // クロックがHighのまま（立ち上がりではない）
        const gate2: Gate = {
          id: 'dff2',
          type: 'D-FF',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
          metadata: {
            previousClockState: true, // 前回もHighだった
            qOutput: true // 前回の出力状態
          }
        };
        
        const result2 = evaluateGateUnified(gate2, [false, true], defaultConfig); // D=0, CLK=1 (立ち上がりではない)
        expect(result2.success).toBe(true);
        if (result2.success) {
          expect(result2.data.primaryOutput).toBe(true); // 前回の値を保持
        }
      });

      it('should evaluate SR-LATCH gate correctly', () => {
        const gate: Gate = {
          id: 'sr1',
          type: 'SR-LATCH',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
          metadata: {
            qOutput: false
          }
        };
        
        // Set操作
        const result1 = evaluateGateUnified(gate, [true, false], defaultConfig); // S=1, R=0
        expect(result1.success).toBe(true);
        if (result1.success) {
          expect(result1.data.primaryOutput).toBe(true);
        }
        
        // Reset操作
        gate.metadata!.qOutput = true; // 前回の状態を設定
        const result2 = evaluateGateUnified(gate, [false, true], defaultConfig); // S=0, R=1
        expect(result2.success).toBe(true);
        if (result2.success) {
          expect(result2.data.primaryOutput).toBe(false);
        }
        
        // 保持操作
        gate.metadata!.qOutput = true; // 前回の状態を設定
        const result3 = evaluateGateUnified(gate, [false, false], defaultConfig); // S=0, R=0
        expect(result3.success).toBe(true);
        if (result3.success) {
          expect(result3.data.primaryOutput).toBe(true); // 状態保持
        }
      });
    });
  });

  describe('カスタムゲート評価', () => {
    describe('真理値表による評価', () => {
      it('should evaluate custom gate with truth table', () => {
        const customGateDefinition: CustomGateDefinition = {
          id: 'buffer',
          name: 'Buffer',
          inputs: [{ name: 'A' }],
          outputs: [{ name: 'Y' }],
          truthTable: {
            '0': '0',
            '1': '1'
          }
        };
        
        const gate: Gate = {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition
        };
        
        const result1 = evaluateGateUnified(gate, [false], defaultConfig);
        expect(result1.success).toBe(true);
        if (result1.success) {
          expect(result1.data.primaryOutput).toBe(false);
        }
        
        const result2 = evaluateGateUnified(gate, [true], defaultConfig);
        expect(result2.success).toBe(true);
        if (result2.success) {
          expect(result2.data.primaryOutput).toBe(true);
        }
      });

      it('should evaluate custom gate with multiple outputs', () => {
        const customGateDefinition: CustomGateDefinition = {
          id: 'splitter',
          name: 'Signal Splitter',
          inputs: [{ name: 'A' }],
          outputs: [{ name: 'Y1' }, { name: 'Y2' }],
          truthTable: {
            '0': '00',
            '1': '11'
          }
        };
        
        const gate: Gate = {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition
        };
        
        const result = evaluateGateUnified(gate, [true], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.outputs).toEqual([true, true]);
          expect(result.data.primaryOutput).toBe(true);
          expect(result.data.isSingleOutput).toBe(false);
        }
      });

      it('should handle missing truth table entries', () => {
        const customGateDefinition: CustomGateDefinition = {
          id: 'incomplete',
          name: 'Incomplete Gate',
          inputs: [{ name: 'A' }],
          outputs: [{ name: 'Y' }],
          truthTable: {
            '1': '1'
            // '0' が欠如
          }
        };
        
        const gate: Gate = {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition
        };
        
        const result = evaluateGateUnified(gate, [false], defaultConfig);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('No truth table entry');
        }
      });
    });

    describe('内部回路による評価', () => {
      it('should fail for internal circuit evaluation (not yet implemented)', () => {
        const customGateDefinition: CustomGateDefinition = {
          id: 'complex',
          name: 'Complex Gate',
          inputs: [{ name: 'A' }],
          outputs: [{ name: 'Y' }],
          internalCircuit: {
            gates: [],
            wires: [],
            inputMappings: {},
            outputMappings: {}
          }
        };
        
        const gate: Gate = {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition
        };
        
        const result = evaluateGateUnified(gate, [true], defaultConfig);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('Internal circuit evaluation not yet implemented');
        }
      });
    });

    describe('カスタム評価器', () => {
      it('should use custom evaluator when provided', () => {
        const mockEvaluator = {
          evaluateByTruthTable: vi.fn().mockReturnValue(success([true])),
          evaluateByInternalCircuit: vi.fn().mockReturnValue(success([false]))
        };
        
        const config: EvaluationConfig = {
          ...defaultConfig,
          customGateEvaluator: mockEvaluator
        };
        
        const customGateDefinition: CustomGateDefinition = {
          id: 'test',
          name: 'Test Gate',
          inputs: [{ name: 'A' }],
          outputs: [{ name: 'Y' }],
          truthTable: { '0': '0', '1': '1' }
        };
        
        const gate: Gate = {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition
        };
        
        const result = evaluateGateUnified(gate, [true], config);
        expect(result.success).toBe(true);
        expect(mockEvaluator.evaluateByTruthTable).toHaveBeenCalledWith(customGateDefinition, [true]);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('should validate inputs when strictValidation is enabled', () => {
      const gate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const config = { ...defaultConfig, strictValidation: true };
      const result = evaluateGateUnified(gate, [true], config); // 不足する入力
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Input validation failed');
      }
    });

    it('should skip validation when strictValidation is disabled', () => {
      const gate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const config = { ...defaultConfig, strictValidation: false };
      const result = evaluateGateUnified(gate, [true], config); // 不足する入力
      
      expect(result.success).toBe(true); // バリデーションがスキップされるので成功
    });

    it('should handle unknown gate types', () => {
      const gate = {
        id: 'unknown1',
        type: 'UNKNOWN_TYPE',
        position: { x: 0, y: 0 },
        inputs: [],
        output: false
      } as any;
      
      const result = evaluateGateUnified(gate, [], defaultConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        // strictValidationが有効の場合、ゲートバリデーションで失敗する
        expect(result.error.message).toContain('Gate validation failed');
      }
    });

    it('should handle custom gates without definitions', () => {
      const gate: Gate = {
        id: 'custom1',
        type: 'CUSTOM',
        position: { x: 0, y: 0 },
        inputs: [''],
        output: false
        // customGateDefinition が欠如
      };
      
      const result = evaluateGateUnified(gate, [true], defaultConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        // strictValidationが有効の場合、ゲートバリデーションで失敗する
        expect(result.error.message).toContain('Gate validation failed');
      }
    });

    it('should handle unexpected errors gracefully', () => {
      const gate: Gate = {
        id: 'error_gate',
        type: 'CLOCK',
        position: { x: 0, y: 0 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1
        }
      };
      
      // TimeProviderがエラーを投げるケースをモック
      const errorConfig = {
        ...defaultConfig,
        timeProvider: {
          getCurrentTime: () => { throw new Error('Time provider error'); }
        }
      };
      
      const result = evaluateGateUnified(gate, [], errorConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Error evaluating CLOCK gate');
      }
    });
  });

  describe('メタデータとデバッグ情報', () => {
    it('should provide metadata with evaluation time', () => {
      const gate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const result = evaluateGateUnified(gate, [true, false], defaultConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toBeDefined();
        expect(result.data.metadata!.evaluationTime).toBeGreaterThanOrEqual(0);
        expect(result.data.metadata!.inputValidation).toBeDefined();
        expect(result.data.metadata!.inputValidation!.expectedInputCount).toBe(2);
        expect(result.data.metadata!.inputValidation!.actualInputCount).toBe(2);
        expect(result.data.metadata!.inputValidation!.isValid).toBe(true);
      }
    });

    it('should provide debug information when enabled', () => {
      const gate: Gate = {
        id: 'or1',
        type: 'OR',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const config = { ...defaultConfig, enableDebug: true };
      const result = evaluateGateUnified(gate, [true, false], config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.debugInfo).toBeDefined();
        expect(result.data.debugInfo!.gateId).toBe('or1');
        expect(result.data.debugInfo!.gateType).toBe('OR');
        expect(result.data.debugInfo!.inputs).toEqual([true, false]);
        expect(result.data.debugInfo!.evaluationTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.data.debugInfo!.intermediateValues).toBeDefined();
      }
    });

    it('should not provide debug information when disabled', () => {
      const gate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const config = { ...defaultConfig, enableDebug: false };
      const result = evaluateGateUnified(gate, [true, false], config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.debugInfo).toBeUndefined();
      }
    });

    it('should include custom gate info in metadata', () => {
      const customGateDefinition: CustomGateDefinition = {
        id: 'buffer',
        name: 'Buffer',
        inputs: [{ name: 'A' }],
        outputs: [{ name: 'Y' }],
        truthTable: { '0': '0', '1': '1' }
      };
      
      const gate: Gate = {
        id: 'custom1',
        type: 'CUSTOM',
        position: { x: 0, y: 0 },
        inputs: [''],
        output: false,
        customGateDefinition
      };
      
      const result = evaluateGateUnified(gate, [true], defaultConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata!.customGateInfo).toBeDefined();
        expect(result.data.metadata!.customGateInfo!.definitionId).toBe('buffer');
        expect(result.data.metadata!.customGateInfo!.evaluationMethod).toBe('TRUTH_TABLE');
      }
    });
  });

  describe('後方互換性ヘルパー', () => {
    describe('convertToLegacyFormat', () => {
      it('should convert single output to boolean', () => {
        const gateResult = {
          outputs: [true],
          primaryOutput: true,
          isSingleOutput: true,
          metadata: undefined,
          debugInfo: undefined
        };
        
        const legacy = convertToLegacyFormat(gateResult);
        expect(legacy).toBe(true);
      });

      it('should convert multiple outputs to array', () => {
        const gateResult = {
          outputs: [true, false, true],
          primaryOutput: true,
          isSingleOutput: false,
          metadata: undefined,
          debugInfo: undefined
        };
        
        const legacy = convertToLegacyFormat(gateResult);
        expect(legacy).toEqual([true, false, true]);
      });
    });

    describe('evaluateGateSingle', () => {
      it('should return single boolean value', () => {
        const gate: Gate = {
          id: 'and1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const result = evaluateGateSingle(gate, [true, false], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data).toBe('boolean');
          expect(result.data).toBe(false);
        }
      });
    });

    describe('evaluateGateMulti', () => {
      it('should return readonly boolean array', () => {
        const gate: Gate = {
          id: 'and1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false
        };
        
        const result = evaluateGateMulti(gate, [true, false], defaultConfig);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data).toEqual([false]);
        }
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('should evaluate gates efficiently', () => {
      const gate: Gate = {
        id: 'perf_test',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = evaluateGateUnified(gate, [true, false], defaultConfig);
        expect(result.success).toBe(true);
      }
      
      const end = performance.now();
      const avgTime = (end - start) / iterations;
      
      expect(avgTime).toBeLessThan(1); // 1ms以下の平均実行時間
    });

    it('should handle complex custom gates efficiently', () => {
      const complexTruthTable: Record<string, string> = {};
      
      // 4入力、2出力の複雑な真理値表を生成
      for (let i = 0; i < 16; i++) {
        const input = i.toString(2).padStart(4, '0');
        const output = ((i % 3) + 1).toString(2).padStart(2, '0');
        complexTruthTable[input] = output;
      }
      
      const customGateDefinition: CustomGateDefinition = {
        id: 'complex',
        name: 'Complex Gate',
        inputs: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
        outputs: [{ name: 'Y1' }, { name: 'Y2' }],
        truthTable: complexTruthTable
      };
      
      const gate: Gate = {
        id: 'complex1',
        type: 'CUSTOM',
        position: { x: 0, y: 0 },
        inputs: ['', '', '', ''],
        output: false,
        customGateDefinition
      };
      
      const start = performance.now();
      
      // 全ての入力パターンをテスト
      for (let i = 0; i < 16; i++) {
        const inputs = [
          !!(i & 8),
          !!(i & 4),
          !!(i & 2),
          !!(i & 1)
        ];
        
        const result = evaluateGateUnified(gate, inputs, defaultConfig);
        expect(result.success).toBe(true);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // 100ms以下
    });
  });

  describe('不変性の確認', () => {
    it('should not modify input gate object', () => {
      const originalGate: Gate = {
        id: 'test',
        type: 'AND',
        position: { x: 100, y: 200 },
        inputs: ['', ''],
        output: false
      };
      
      const gateCopy = { ...originalGate };
      const result = evaluateGateUnified(gateCopy, [true, false], defaultConfig);
      
      expect(result.success).toBe(true);
      expect(originalGate).toEqual(gateCopy); // 元のオブジェクトは変更されていない
    });

    it('should not modify input array', () => {
      const gate: Gate = {
        id: 'test',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };
      
      const originalInputs = [true, false];
      const inputsCopy = [...originalInputs];
      
      const result = evaluateGateUnified(gate, inputsCopy, defaultConfig);
      
      expect(result.success).toBe(true);
      expect(originalInputs).toEqual(inputsCopy); // 入力配列は変更されていない
    });
  });
});