/**
 * ANDゲートのテスト
 */

import { describe, it, expect } from 'vitest';
import { ANDGate } from '../../gates/ANDGate';

describe('ANDGate', () => {
  describe('基本動作', () => {
    it('正しく初期化される', () => {
      const gate = new ANDGate('and1', { x: 100, y: 100 });
      
      expect(gate.id).toBe('and1');
      expect(gate.type).toBe('AND');
      expect(gate.position).toEqual({ x: 100, y: 100 });
      expect(gate.inputs).toHaveLength(2);
      expect(gate.outputs).toHaveLength(1);
    });

    it('移動が正しく動作する', () => {
      const gate = new ANDGate('and1', { x: 100, y: 100 });
      gate.move({ x: 200, y: 200 });
      
      expect(gate.position).toEqual({ x: 200, y: 200 });
    });
  });

  describe('論理演算', () => {
    it('0 AND 0 = 0', () => {
      const gate = new ANDGate('and1', { x: 0, y: 0 });
      gate.setInputValue(0, false);
      gate.setInputValue(1, false);
      gate.compute();
      
      expect(gate.getOutputValue(0)).toBe(false);
    });

    it('0 AND 1 = 0', () => {
      const gate = new ANDGate('and1', { x: 0, y: 0 });
      gate.setInputValue(0, false);
      gate.setInputValue(1, true);
      gate.compute();
      
      expect(gate.getOutputValue(0)).toBe(false);
    });

    it('1 AND 0 = 0', () => {
      const gate = new ANDGate('and1', { x: 0, y: 0 });
      gate.setInputValue(0, true);
      gate.setInputValue(1, false);
      gate.compute();
      
      expect(gate.getOutputValue(0)).toBe(false);
    });

    it('1 AND 1 = 1', () => {
      const gate = new ANDGate('and1', { x: 0, y: 0 });
      gate.setInputValue(0, true);
      gate.setInputValue(1, true);
      gate.compute();
      
      expect(gate.getOutputValue(0)).toBe(true);
    });
  });

  describe('シリアライズ', () => {
    it('JSONに変換できる', () => {
      const gate = new ANDGate('and1', { x: 100, y: 100 });
      gate.setInputValue(0, true);
      gate.setInputValue(1, false);
      gate.compute();
      
      const json = gate.toJSON();
      
      expect(json).toMatchObject({
        id: 'and1',
        type: 'AND',
        position: { x: 100, y: 100 },
        inputs: expect.arrayContaining([
          expect.objectContaining({ name: 'A', value: true }),
          expect.objectContaining({ name: 'B', value: false })
        ]),
        outputs: expect.arrayContaining([
          expect.objectContaining({ name: 'OUT', value: false })
        ])
      });
    });
  });

  describe('クローン', () => {
    it('新しいIDで複製できる', () => {
      const original = new ANDGate('and1', { x: 100, y: 100 });
      const clone = original.clone('and2');
      
      expect(clone.id).toBe('and2');
      expect(clone.position).toEqual(original.position);
      expect(clone).not.toBe(original);
    });
  });
});