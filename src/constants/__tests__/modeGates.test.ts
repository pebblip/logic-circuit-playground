import { describe, it, expect } from 'vitest';
import { getGatesForMode, isGateAvailableInMode, MODE_GATE_SETS } from '../modeGates';
import { CircuitMode } from '../../types/mode';

describe('modeGates', () => {
  describe('MODE_GATE_SETS', () => {
    it('discoveryモードは基本ゲートのみを含む', () => {
      const discoveryGates = MODE_GATE_SETS.discovery;
      
      expect(discoveryGates).toContain('INPUT');
      expect(discoveryGates).toContain('OUTPUT');
      expect(discoveryGates).toContain('AND');
      expect(discoveryGates).toContain('OR');
      expect(discoveryGates).toContain('NOT');
      
      // 上級ゲートは含まない
      expect(discoveryGates).not.toContain('NAND');
      expect(discoveryGates).not.toContain('XOR');
      expect(discoveryGates).not.toContain('D_FLIP_FLOP');
    });

    it('sandboxモードは全てのゲートを含む', () => {
      const sandboxGates = MODE_GATE_SETS.sandbox;
      
      // 基本ゲート
      expect(sandboxGates).toContain('INPUT');
      expect(sandboxGates).toContain('OUTPUT');
      expect(sandboxGates).toContain('AND');
      expect(sandboxGates).toContain('OR');
      expect(sandboxGates).toContain('NOT');
      
      // 上級ゲート
      expect(sandboxGates).toContain('NAND');
      expect(sandboxGates).toContain('NOR');
      expect(sandboxGates).toContain('XOR');
      expect(sandboxGates).toContain('XNOR');
      
      // 特殊ゲート
      expect(sandboxGates).toContain('CLOCK');
      expect(sandboxGates).toContain('D_FLIP_FLOP');
      expect(sandboxGates).toContain('SR_LATCH');
      expect(sandboxGates).toContain('REGISTER_4BIT');
      expect(sandboxGates).toContain('MUX_2TO1');
    });

    it('challengeモードは特定のゲートセットを含む', () => {
      const challengeGates = MODE_GATE_SETS.challenge;
      
      expect(challengeGates).toContain('INPUT');
      expect(challengeGates).toContain('OUTPUT');
      expect(challengeGates).toContain('AND');
      expect(challengeGates).toContain('NAND');
      expect(challengeGates).toContain('XOR');
      
      // チャレンジモードは全てのゲートを含まない
      expect(challengeGates).not.toContain('CLOCK');
      expect(challengeGates).not.toContain('D_FLIP_FLOP');
    });
  });

  describe('getGatesForMode', () => {
    it('指定されたモードの正しいゲートセットを返す', () => {
      const discoveryGates = getGatesForMode('discovery');
      expect(discoveryGates).toEqual(MODE_GATE_SETS.discovery);
      
      const sandboxGates = getGatesForMode('sandbox');
      expect(sandboxGates).toEqual(MODE_GATE_SETS.sandbox);
    });

    it('discoveryモードでアンロックされたゲートを追加できる', () => {
      const unlockedGates = ['NAND', 'XOR'];
      const gates = getGatesForMode('discovery', unlockedGates);
      
      // 基本ゲートに加えてアンロックされたゲートも含む
      expect(gates).toContain('AND');
      expect(gates).toContain('NAND');
      expect(gates).toContain('XOR');
    });
  });

  describe('isGateAvailableInMode', () => {
    it('discoveryモードで基本ゲートが利用可能', () => {
      expect(isGateAvailableInMode('INPUT', 'discovery')).toBe(true);
      expect(isGateAvailableInMode('AND', 'discovery')).toBe(true);
      expect(isGateAvailableInMode('NOT', 'discovery')).toBe(true);
    });

    it('discoveryモードで上級ゲートが利用不可', () => {
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'discovery')).toBe(false);
      expect(isGateAvailableInMode('SR_LATCH', 'discovery')).toBe(false);
    });

    it('sandboxモードで全てのゲートが利用可能', () => {
      expect(isGateAvailableInMode('INPUT', 'sandbox')).toBe(true);
      expect(isGateAvailableInMode('CLOCK', 'sandbox')).toBe(true);
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'sandbox')).toBe(true);
      expect(isGateAvailableInMode('CUSTOM', 'sandbox')).toBe(true);
    });
  });

  describe('モード間の包含関係', () => {
    it('sandboxモードはdiscoveryモードの全ゲートを含む', () => {
      const discoveryGates = MODE_GATE_SETS.discovery;
      const sandboxGates = MODE_GATE_SETS.sandbox;
      
      discoveryGates.forEach(gate => {
        expect(sandboxGates).toContain(gate);
      });
    });
  });
});