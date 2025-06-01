import { describe, it, expect, beforeEach } from 'vitest';
import { DFlipFlopGate } from '../DFlipFlopGate';

describe('DFlipFlopGate', () => {
  let dff: DFlipFlopGate;

  beforeEach(() => {
    dff = new DFlipFlopGate('test-dff', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(dff.id).toBe('test-dff');
      expect(dff.type).toBe('D_FLIP_FLOP');
      expect(dff.position).toEqual({ x: 100, y: 100 });
      expect(dff.getState()).toBe(false);
    });

    it('2つの入力ピンを持つ', () => {
      const inputs = dff.getInputs();
      expect(inputs).toHaveLength(2);
      expect(inputs[0].name).toBe('D');
      expect(inputs[1].name).toBe('CLK');
    });

    it('2つの出力ピンを持つ', () => {
      const outputs = dff.getOutputs();
      expect(outputs).toHaveLength(2);
      expect(outputs[0].name).toBe('Q');
      expect(outputs[1].name).toBe('Q\'');
    });
  });

  describe('基本動作', () => {
    it('初期出力はQ=false, Q\'=true', () => {
      dff.compute();
      expect(dff.getOutputValue(0)).toBe(false); // Q
      expect(dff.getOutputValue(1)).toBe(true);  // Q'
    });

    it('クロックがLowの時はD入力を無視', () => {
      // D=true, CLK=false
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(false); // 状態は変わらない
      expect(dff.getOutputValue(1)).toBe(true);
    });

    it('クロックの立ち上がりエッジでD入力を記憶', () => {
      // D=true, CLK=false -> true (立ち上がり)
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      
      dff.setInputValue(1, true); // CLKを立ち上げる
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(true);  // Q=D
      expect(dff.getOutputValue(1)).toBe(false); // Q'=!D
    });

    it('クロックがHighのままではD入力の変化を無視', () => {
      // まず立ち上がりエッジでD=trueを記憶
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      
      dff.setInputValue(1, true);
      dff.compute();
      
      // CLKはHighのまま、Dを変更
      dff.setInputValue(0, false);
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(true);  // 状態は変わらない
      expect(dff.getOutputValue(1)).toBe(false);
    });

    it('複数の立ち上がりエッジで正しく動作', () => {
      // 1回目: D=true
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();
      expect(dff.getOutputValue(0)).toBe(true);

      // CLKをLowに戻す
      dff.setInputValue(1, false);
      dff.compute();

      // 2回目: D=false
      dff.setInputValue(0, false);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();
      expect(dff.getOutputValue(0)).toBe(false);

      // CLKをLowに戻す
      dff.setInputValue(1, false);
      dff.compute();

      // 3回目: D=true
      dff.setInputValue(0, true);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();
      expect(dff.getOutputValue(0)).toBe(true);
    });
  });

  describe('リセット機能', () => {
    it('reset()で初期状態に戻る', () => {
      // 状態を変更
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(true);
      expect(dff.getOutputValue(1)).toBe(false);

      // リセット
      dff.reset();
      
      expect(dff.getState()).toBe(false);
      expect(dff.getOutputValue(0)).toBe(false);
      expect(dff.getOutputValue(1)).toBe(true);
    });
  });

  describe('シリアライズ/デシリアライズ', () => {
    it('状態を含めてシリアライズできる', () => {
      // 状態を設定
      dff.setInputValue(0, true);
      dff.setInputValue(1, false);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();

      const json = dff.toJSON();
      expect(json.state).toBe(true);
      expect(json.lastClockState).toBe(true);
    });

    it('デシリアライズして状態を復元できる', () => {
      const json = {
        id: 'restored-dff',
        type: 'D_FLIP_FLOP',
        position: { x: 200, y: 200 },
        state: true,
        lastClockState: false
      };

      const restored = DFlipFlopGate.fromJSON(json);
      expect(restored.id).toBe('restored-dff');
      expect(restored.getState()).toBe(true);
      
      restored.compute();
      expect(restored.getOutputValue(0)).toBe(true);
      expect(restored.getOutputValue(1)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('D入力が未定義の場合はfalseとして扱う', () => {
      // CLKのみ設定
      dff.setInputValue(1, false);
      dff.compute();
      dff.setInputValue(1, true);
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(false);
      expect(dff.getOutputValue(1)).toBe(true);
    });

    it('CLK入力が未定義の場合は立ち上がりエッジを検出しない', () => {
      // Dのみ設定
      dff.setInputValue(0, true);
      dff.compute();
      
      expect(dff.getOutputValue(0)).toBe(false);
      expect(dff.getOutputValue(1)).toBe(true);
    });
  });
});