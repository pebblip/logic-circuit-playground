import { describe, it, expect } from 'vitest';
import { getGatesForMode, isGateAvailableInMode, MODE_GATE_SETS } from '../modeGates';
import { CircuitMode } from '../../types/mode';

describe('modeGates', () => {
  describe('MODE_GATE_SETS', () => {
    it('learningモードは基本ゲートのみを含む', () => {
      const learningGates = MODE_GATE_SETS.learning;
      
      expect(learningGates).toContain('INPUT');
      expect(learningGates).toContain('OUTPUT');
      expect(learningGates).toContain('AND');
      expect(learningGates).toContain('OR');
      expect(learningGates).toContain('NOT');
      
      // 上級ゲートは含まない
      expect(learningGates).not.toContain('NAND');
      expect(learningGates).not.toContain('XOR');
      expect(learningGates).not.toContain('D_FLIP_FLOP');
    });

    it('freeモードは全てのゲートを含む', () => {
      const freeGates = MODE_GATE_SETS.free;
      
      // 基本ゲート
      expect(freeGates).toContain('INPUT');
      expect(freeGates).toContain('OUTPUT');
      expect(freeGates).toContain('AND');
      expect(freeGates).toContain('OR');
      expect(freeGates).toContain('NOT');
      
      // 上級ゲート
      expect(freeGates).toContain('NAND');
      expect(freeGates).toContain('NOR');
      expect(freeGates).toContain('XOR');
      expect(freeGates).toContain('XNOR');
      
      // 特殊ゲート
      expect(freeGates).toContain('CLOCK');
      expect(freeGates).toContain('D_FLIP_FLOP');
      expect(freeGates).toContain('SR_LATCH');
      expect(freeGates).toContain('REGISTER_4BIT');
      expect(freeGates).toContain('MUX_2TO1');
    });

    it('puzzleモードは特定のゲートセットを含む', () => {
      const puzzleGates = MODE_GATE_SETS.puzzle;
      
      expect(puzzleGates).toContain('INPUT');
      expect(puzzleGates).toContain('OUTPUT');
      expect(puzzleGates).toContain('AND');
      expect(puzzleGates).toContain('NAND');
      expect(puzzleGates).toContain('XOR');
      
      // パズルモードは全てのゲートを含まない
      expect(puzzleGates).not.toContain('CLOCK');
      expect(puzzleGates).not.toContain('D_FLIP_FLOP');
    });
  });

  describe('getGatesForMode', () => {
    it('指定されたモードの正しいゲートセットを返す', () => {
      const learningGates = getGatesForMode('learning');
      expect(learningGates).toEqual(MODE_GATE_SETS.learning);
      
      const freeGates = getGatesForMode('free');
      expect(freeGates).toEqual(MODE_GATE_SETS.free);
    });

    it('learningモードでアンロックされたゲートを追加できる', () => {
      const unlockedGates = ['NAND', 'XOR'];
      const gates = getGatesForMode('learning', unlockedGates);
      
      // 基本ゲートに加えてアンロックされたゲートも含む
      expect(gates).toContain('AND');
      expect(gates).toContain('NAND');
      expect(gates).toContain('XOR');
    });
  });

  describe('isGateAvailableInMode', () => {
    it('learningモードで基本ゲートが利用可能', () => {
      expect(isGateAvailableInMode('INPUT', 'learning')).toBe(true);
      expect(isGateAvailableInMode('AND', 'learning')).toBe(true);
      expect(isGateAvailableInMode('NOT', 'learning')).toBe(true);
    });

    it('learningモードで上級ゲートが利用不可', () => {
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'learning')).toBe(false);
      expect(isGateAvailableInMode('SR_LATCH', 'learning')).toBe(false);
    });

    it('freeモードで全てのゲートが利用可能', () => {
      expect(isGateAvailableInMode('INPUT', 'free')).toBe(true);
      expect(isGateAvailableInMode('CLOCK', 'free')).toBe(true);
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'free')).toBe(true);
      expect(isGateAvailableInMode('CUSTOM', 'free')).toBe(true);
    });
  });

  describe('モード間の包含関係', () => {
    it('freeモードはlearningモードの全ゲートを含む', () => {
      const learningGates = MODE_GATE_SETS.learning;
      const freeGates = MODE_GATE_SETS.free;
      
      learningGates.forEach(gate => {
        expect(freeGates).toContain(gate);
      });
    });
  });
});