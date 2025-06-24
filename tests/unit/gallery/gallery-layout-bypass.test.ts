import { describe, it, expect } from 'vitest';
import { JOHNSON_COUNTER } from '@/features/gallery/data/johnson-counter';
import { CHAOS_GENERATOR } from '@/features/gallery/data/chaos-generator';
import { FIBONACCI_COUNTER } from '@/features/gallery/data/fibonacci-counter';
import { SIMPLE_LFSR } from '@/features/gallery/data/simple-lfsr';
import { SELF_OSCILLATING_MEMORY_IMPROVED } from '@/features/gallery/data/self-oscillating-memory-improved';

describe('Gallery Layout Bypass', () => {
  describe('シフトレジスタ回路の自動レイアウトスキップ', () => {
    it('Johnson Counterで自動レイアウトがスキップされる', () => {
      expect(JOHNSON_COUNTER.skipAutoLayout).toBe(true);
      
      // 元の手作業配置が保持されていることを確認
      const dffGates = JOHNSON_COUNTER.gates.filter(gate => gate.type === 'D-FF');
      expect(dffGates).toHaveLength(4);
      
      // 横並びレイアウトが保持されている
      const xPositions = dffGates.map(gate => gate.position.x);
      expect(xPositions).toEqual([250, 380, 510, 640]);
      
      // 同一Y位置で配置されている  
      const yPositions = dffGates.map(gate => gate.position.y);
      expect(yPositions).toEqual([200, 200, 200, 200]);
    });

    it('Chaos Generatorで自動レイアウトがスキップされる', () => {
      expect(CHAOS_GENERATOR.skipAutoLayout).toBe(true);
      
      // D-FFゲートの配置確認
      const dffGates = CHAOS_GENERATOR.gates.filter(gate => gate.type === 'D-FF');
      expect(dffGates.length).toBeGreaterThan(0);
      
      // 重なりのない配置になっている
      const positions = dffGates.map(gate => `${gate.position.x},${gate.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length); // 全て異なる位置
    });

    it('Fibonacci Counterで自動レイアウトがスキップされる', () => {
      expect(FIBONACCI_COUNTER.skipAutoLayout).toBe(true);
      
      // D-FFゲートの配置確認
      const dffGates = FIBONACCI_COUNTER.gates.filter(gate => gate.type === 'D-FF');
      expect(dffGates.length).toBeGreaterThan(0);
      
      // 重なりのない配置になっている
      const positions = dffGates.map(gate => `${gate.position.x},${gate.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length); // 全て異なる位置
    });

    it('Simple LFSRで自動レイアウトがスキップされる', () => {
      expect(SIMPLE_LFSR.skipAutoLayout).toBe(true);
      
      // D-FFゲートの配置確認
      const dffGates = SIMPLE_LFSR.gates.filter(gate => gate.type === 'D-FF');
      expect(dffGates.length).toBeGreaterThan(0);
      
      // 重なりのない配置になっている
      const positions = dffGates.map(gate => `${gate.position.x},${gate.position.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length); // 全て異なる位置
    });

    it('Self Oscillating Memory Improvedで自動レイアウトがスキップされる', () => {
      expect(SELF_OSCILLATING_MEMORY_IMPROVED.skipAutoLayout).toBe(true);
      
      // D-FFゲートの存在確認
      const dffGates = SELF_OSCILLATING_MEMORY_IMPROVED.gates.filter(gate => gate.type === 'D-FF');
      expect(dffGates.length).toBeGreaterThan(0);
    });
  });

  describe('重なり防止の検証', () => {
    const testCircuits = [
      { name: 'Johnson Counter', circuit: JOHNSON_COUNTER },
      { name: 'Chaos Generator', circuit: CHAOS_GENERATOR },
      { name: 'Fibonacci Counter', circuit: FIBONACCI_COUNTER },
      { name: 'Simple LFSR', circuit: SIMPLE_LFSR },
      { name: 'Self Oscillating Memory Improved', circuit: SELF_OSCILLATING_MEMORY_IMPROVED },
    ];

    testCircuits.forEach(({ name, circuit }) => {
      it(`${name}でゲートの重なりがない`, () => {
        const allPositions = circuit.gates.map(gate => 
          `${gate.position.x},${gate.position.y}`
        );
        const uniquePositions = new Set(allPositions);
        
        // 重なりがある場合、uniqueのサイズが小さくなる
        expect(uniquePositions.size).toBe(allPositions.length);
      });
    });
  });
});