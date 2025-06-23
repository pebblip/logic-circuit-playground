/**
 * ギャラリー回路バリデーションテスト
 * 
 * 目的: 全ギャラリー回路の品質保証
 * - 構造整合性検証
 * - シミュレーション設定検証
 * - メタデータ正確性検証
 */

import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '../../../src/features/gallery/data/index';
import { CircuitValidator } from '../../../src/features/gallery/validation/circuitValidator';

describe('Gallery Circuit Validation', () => {
  describe('All Gallery Circuits', () => {
    FEATURED_CIRCUITS.forEach((circuitItem) => {
      describe(`Circuit: ${circuitItem.title}`, () => {
        const circuit = { gates: circuitItem.gates, wires: circuitItem.wires };
        
        it('should have valid basic structure', () => {
          expect(circuit).toBeDefined();
          expect(circuit.gates).toBeDefined();
          expect(Array.isArray(circuit.gates)).toBe(true);
          expect(circuit.gates.length).toBeGreaterThan(0);
          
          if (circuit.wires) {
            expect(Array.isArray(circuit.wires)).toBe(true);
          }
        });

        it('should have unique gate IDs', () => {
          const gateIds = circuit.gates.map(gate => gate.id);
          const uniqueIds = new Set(gateIds);
          expect(uniqueIds.size).toBe(gateIds.length);
        });

        it('should have valid gate types', () => {
          const validTypes = [
            'INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR',
            'CLOCK', 'D-FF', 'SR-LATCH', 'MUX', 'BINARY_COUNTER', 'CUSTOM'
          ];
          
          circuit.gates.forEach(gate => {
            expect(validTypes).toContain(gate.type);
          });
        });

        it('should have valid wire connections', () => {
          if (!circuit.wires) return;
          
          const gateIds = circuit.gates.map(gate => gate.id);
          
          circuit.wires.forEach(wire => {
            expect(gateIds).toContain(wire.from.gateId);
            expect(gateIds).toContain(wire.to.gateId);
            expect(typeof wire.from.pinIndex).toBe('number');
            expect(typeof wire.to.pinIndex).toBe('number');
          });
        });

        it('should have proper D-FF metadata (if contains D-FF)', () => {
          const dffGates = circuit.gates.filter(gate => gate.type === 'D-FF');
          
          dffGates.forEach(gate => {
            if (gate.metadata) {
              // 'state' は非推奨
              expect(gate.metadata).not.toHaveProperty('state');
              
              // 必須プロパティ確認
              if ('qOutput' in gate.metadata || 'previousClockState' in gate.metadata) {
                expect(gate.metadata).toHaveProperty('qOutput');
                expect(gate.metadata).toHaveProperty('qBarOutput');
                expect(gate.metadata).toHaveProperty('previousClockState');
                
                expect(typeof gate.metadata.qOutput).toBe('boolean');
                expect(typeof gate.metadata.qBarOutput).toBe('boolean');
                expect(typeof gate.metadata.previousClockState).toBe('boolean');
              }
            }
          });
        });

        it('should have appropriate simulation config for dynamic circuits', () => {
          const title = circuitItem.title;
          const isDynamicCircuit = [
            'オシレータ', 'カオス', 'メモリ', 'フィボナッチ', 
            'マンダラ', 'ジョンソン', 'LFSR', 'カウンタ'
          ].some(keyword => title.includes(keyword));

          if (isDynamicCircuit && circuitItem.simulationConfig) {
            expect(circuitItem.simulationConfig.needsAnimation).toBe(true);
            
            if (circuitItem.simulationConfig.expectedBehavior) {
              const validBehaviors = ['oscillator', 'sequence_generator', 'memory_circuit', 'logic_gate'];
              expect(validBehaviors).toContain(circuitItem.simulationConfig.expectedBehavior);
            }
          }
        });

        it('should have valid positions for all gates', () => {
          circuit.gates.forEach(gate => {
            expect(gate.position).toBeDefined();
            expect(typeof gate.position.x).toBe('number');
            expect(typeof gate.position.y).toBe('number');
            expect(gate.position.x).toBeGreaterThanOrEqual(0);
            expect(gate.position.y).toBeGreaterThanOrEqual(0);
          });
        });

        it('should pass CircuitValidator validation', () => {
          const circuitMetadata = {
            id: circuitItem.id,
            title: circuitItem.title,
            description: circuitItem.description,
            gates: circuitItem.gates,
            wires: circuitItem.wires,
            simulationConfig: circuitItem.simulationConfig
          };
          
          const result = CircuitValidator.validate(circuitMetadata);
          
          // エラーレベルの問題がないことを確認
          if (result.errors.length > 0) {
            console.log(`Circuit "${circuitItem.title}" validation errors:`, result.errors);
          }
          expect(result.errors).toHaveLength(0);
        });
      });
    });
  });

  describe('Gallery Circuit Metadata', () => {
    it('should have proper title and description for all circuits', () => {
      FEATURED_CIRCUITS.forEach(circuitItem => {
        expect(circuitItem.title).toBeDefined();
        expect(typeof circuitItem.title).toBe('string');
        expect(circuitItem.title.length).toBeGreaterThan(0);
        
        expect(circuitItem.description).toBeDefined();
        expect(typeof circuitItem.description).toBe('string');
        expect(circuitItem.description.length).toBeGreaterThan(0);
      });
    });

    it('should have unique circuit IDs', () => {
      const ids = FEATURED_CIRCUITS.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      
      FEATURED_CIRCUITS.forEach(circuitItem => {
        if (circuitItem.difficulty) {
          expect(validDifficulties).toContain(circuitItem.difficulty);
        }
      });
    });
  });

  describe('Performance Validation', () => {
    it('should not have excessively complex circuits', () => {
      FEATURED_CIRCUITS.forEach(circuitItem => {
        const gateCount = circuitItem.gates.length;
        const wireCount = circuitItem.wires?.length || 0;
        
        // 警告レベルの閾値
        if (gateCount > 50) {
          console.warn(`Circuit "${circuitItem.title}" has ${gateCount} gates (warning: >50)`);
        }
        
        if (wireCount > 100) {
          console.warn(`Circuit "${circuitItem.title}" has ${wireCount} wires (warning: >100)`);
        }
        
        // 最大制限（テスト失敗レベル）
        expect(gateCount).toBeLessThanOrEqual(200);
        expect(wireCount).toBeLessThanOrEqual(500);
      });
    });
  });
});