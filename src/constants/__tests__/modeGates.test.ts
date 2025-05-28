import { getGatesForMode, isGateAvailableInMode, MODE_GATE_SETS } from '../modeGates';
import { CircuitMode } from '../../types/mode';

describe('modeGates', () => {
  describe('MODE_GATE_SETS', () => {
    it('学習モードは基本ゲートのみを含む', () => {
      const learningGates = MODE_GATE_SETS.learning;
      
      expect(learningGates).toContain('INPUT');
      expect(learningGates).toContain('OUTPUT');
      expect(learningGates).toContain('AND');
      expect(learningGates).toContain('OR');
      expect(learningGates).toContain('NOT');
      expect(learningGates).toContain('CLOCK');
      
      // 上級ゲートは含まない
      expect(learningGates).not.toContain('NAND');
      expect(learningGates).not.toContain('XOR');
      expect(learningGates).not.toContain('D_FLIP_FLOP');
    });

    it('構築モードは多くのゲートを含む', () => {
      const buildingGates = MODE_GATE_SETS.building;
      
      expect(buildingGates).toContain('INPUT');
      expect(buildingGates).toContain('OUTPUT');
      expect(buildingGates).toContain('AND');
      expect(buildingGates).toContain('NAND');
      expect(buildingGates).toContain('XOR');
      expect(buildingGates).toContain('D_FLIP_FLOP');
      expect(buildingGates).toContain('CUSTOM');
    });

    it('CPUモードは全てのゲートを含む', () => {
      const cpuGates = MODE_GATE_SETS.cpu;
      
      // 基本ゲート
      expect(cpuGates).toContain('INPUT');
      expect(cpuGates).toContain('OUTPUT');
      expect(cpuGates).toContain('AND');
      
      // 上級ゲート
      expect(cpuGates).toContain('NAND');
      expect(cpuGates).toContain('XOR');
      expect(cpuGates).toContain('D_FLIP_FLOP');
      expect(cpuGates).toContain('CUSTOM');
      
      // 構築モード以上のゲート数を持つ
      expect(cpuGates.length).toBeGreaterThanOrEqual(MODE_GATE_SETS.building.length);
    });
  });

  describe('getGatesForMode', () => {
    it('指定されたモードの正しいゲートセットを返す', () => {
      expect(getGatesForMode('learning')).toBe(MODE_GATE_SETS.learning);
      expect(getGatesForMode('building')).toBe(MODE_GATE_SETS.building);
      expect(getGatesForMode('cpu')).toBe(MODE_GATE_SETS.cpu);
    });

    it('無効なモードの場合はlearningモードを返す', () => {
      const invalidMode = 'invalid' as CircuitMode;
      expect(getGatesForMode(invalidMode)).toBe(MODE_GATE_SETS.learning);
    });
  });

  describe('isGateAvailableInMode', () => {
    it('学習モードで基本ゲートが利用可能', () => {
      expect(isGateAvailableInMode('AND', 'learning')).toBe(true);
      expect(isGateAvailableInMode('OR', 'learning')).toBe(true);
      expect(isGateAvailableInMode('NOT', 'learning')).toBe(true);
    });

    it('学習モードで上級ゲートが利用不可', () => {
      expect(isGateAvailableInMode('NAND', 'learning')).toBe(false);
      expect(isGateAvailableInMode('XOR', 'learning')).toBe(false);
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'learning')).toBe(false);
    });

    it('構築モードで多くのゲートが利用可能', () => {
      expect(isGateAvailableInMode('AND', 'building')).toBe(true);
      expect(isGateAvailableInMode('NAND', 'building')).toBe(true);
      expect(isGateAvailableInMode('XOR', 'building')).toBe(true);
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'building')).toBe(true);
    });

    it('CPUモードで全てのゲートが利用可能', () => {
      expect(isGateAvailableInMode('AND', 'cpu')).toBe(true);
      expect(isGateAvailableInMode('NAND', 'cpu')).toBe(true);
      expect(isGateAvailableInMode('XOR', 'cpu')).toBe(true);
      expect(isGateAvailableInMode('D_FLIP_FLOP', 'cpu')).toBe(true);
      expect(isGateAvailableInMode('CUSTOM', 'cpu')).toBe(true);
    });
  });

  describe('モード間の包含関係', () => {
    it('上位モードは下位モードの全ゲートを含む', () => {
      const learningGates = MODE_GATE_SETS.learning;
      const buildingGates = MODE_GATE_SETS.building;
      const cpuGates = MODE_GATE_SETS.cpu;

      // 構築モードは学習モードの全ゲートを含む
      learningGates.forEach(gate => {
        expect(buildingGates).toContain(gate);
      });

      // CPUモードは構築モードの全ゲートを含む
      buildingGates.forEach(gate => {
        expect(cpuGates).toContain(gate);
      });
    });
  });
});