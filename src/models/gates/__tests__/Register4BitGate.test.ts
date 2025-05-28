import { describe, it, expect, beforeEach } from 'vitest';
import { Register4BitGate } from '../Register4BitGate';

describe('Register4BitGate', () => {
  let register: Register4BitGate;

  beforeEach(() => {
    register = new Register4BitGate('test-register', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(register.id).toBe('test-register');
      expect(register.type).toBe('REGISTER_4BIT');
      expect(register.position).toEqual({ x: 100, y: 100 });
      expect(register.getState()).toEqual([false, false, false, false]);
      expect(register.getStateAsDecimal()).toBe(0);
    });

    it('6つの入力ピンを持つ', () => {
      const inputs = register.getInputs();
      expect(inputs).toHaveLength(6);
      expect(inputs[0].name).toBe('D0');
      expect(inputs[1].name).toBe('D1');
      expect(inputs[2].name).toBe('D2');
      expect(inputs[3].name).toBe('D3');
      expect(inputs[4].name).toBe('CLK');
      expect(inputs[5].name).toBe('RST');
    });

    it('4つの出力ピンを持つ', () => {
      const outputs = register.getOutputs();
      expect(outputs).toHaveLength(4);
      expect(outputs[0].name).toBe('Q0');
      expect(outputs[1].name).toBe('Q1');
      expect(outputs[2].name).toBe('Q2');
      expect(outputs[3].name).toBe('Q3');
    });
  });

  describe('基本動作', () => {
    it('初期出力は全て0', () => {
      register.compute();
      expect(register.getOutputValue(0)).toBe(false);
      expect(register.getOutputValue(1)).toBe(false);
      expect(register.getOutputValue(2)).toBe(false);
      expect(register.getOutputValue(3)).toBe(false);
    });

    it('クロックがLowの時はデータ入力を無視', () => {
      // データ入力を設定
      register.setInputValue(0, true);   // D0=1
      register.setInputValue(1, false);  // D1=0
      register.setInputValue(2, true);   // D2=1
      register.setInputValue(3, true);   // D3=1
      register.setInputValue(4, false);  // CLK=0
      register.compute();
      
      // 状態は変わらない
      expect(register.getState()).toEqual([false, false, false, false]);
    });

    it('クロックの立ち上がりエッジで4ビットデータを記憶', () => {
      // データ入力を設定 (1011 = 13)
      register.setInputValue(0, true);   // D0=1
      register.setInputValue(1, true);   // D1=1
      register.setInputValue(2, false);  // D2=0
      register.setInputValue(3, true);   // D3=1
      register.setInputValue(4, false);  // CLK=0
      register.compute();
      
      // クロックを立ち上げる
      register.setInputValue(4, true);   // CLK=1
      register.compute();
      
      expect(register.getOutputValue(0)).toBe(true);   // Q0=1
      expect(register.getOutputValue(1)).toBe(true);   // Q1=1
      expect(register.getOutputValue(2)).toBe(false);  // Q2=0
      expect(register.getOutputValue(3)).toBe(true);   // Q3=1
      expect(register.getStateAsDecimal()).toBe(11);   // 1011 in binary = 11 in decimal
    });

    it('クロックがHighのままではデータ入力の変化を無視', () => {
      // まず立ち上がりエッジでデータを記憶
      register.setInputValue(0, true);
      register.setInputValue(1, false);
      register.setInputValue(2, true);
      register.setInputValue(3, false);
      register.setInputValue(4, false);
      register.compute();
      
      register.setInputValue(4, true);
      register.compute();
      
      // CLKはHighのまま、データを変更
      register.setInputValue(0, false);
      register.setInputValue(1, true);
      register.setInputValue(2, false);
      register.setInputValue(3, true);
      register.compute();
      
      // 状態は変わらない
      expect(register.getOutputValue(0)).toBe(true);
      expect(register.getOutputValue(1)).toBe(false);
      expect(register.getOutputValue(2)).toBe(true);
      expect(register.getOutputValue(3)).toBe(false);
    });

    it('複数の立ち上がりエッジで正しく動作', () => {
      // 1回目: 0101
      register.setInputValue(0, true);
      register.setInputValue(1, false);
      register.setInputValue(2, true);
      register.setInputValue(3, false);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(5);

      // CLKをLowに戻す
      register.setInputValue(4, false);
      register.compute();

      // 2回目: 1010
      register.setInputValue(0, false);
      register.setInputValue(1, true);
      register.setInputValue(2, false);
      register.setInputValue(3, true);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(10);

      // CLKをLowに戻す
      register.setInputValue(4, false);
      register.compute();

      // 3回目: 1111
      register.setInputValue(0, true);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, true);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(15);
    });
  });

  describe('リセット機能', () => {
    it('RST=1で全ビットが0にリセット', () => {
      // まずデータを記憶
      register.setInputValue(0, true);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, true);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(15);
      
      // リセット
      register.setInputValue(5, true);  // RST=1
      register.compute();
      
      expect(register.getState()).toEqual([false, false, false, false]);
      expect(register.getStateAsDecimal()).toBe(0);
      expect(register.getOutputValue(0)).toBe(false);
      expect(register.getOutputValue(1)).toBe(false);
      expect(register.getOutputValue(2)).toBe(false);
      expect(register.getOutputValue(3)).toBe(false);
    });

    it('リセット中はクロックエッジを無視', () => {
      // リセット信号を有効にしたまま
      register.setInputValue(5, true);  // RST=1
      
      // データとクロックを設定
      register.setInputValue(0, true);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, true);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      
      // リセット中なので状態は0のまま
      expect(register.getStateAsDecimal()).toBe(0);
    });

    it('reset()メソッドで初期状態に戻る', () => {
      // 状態を変更
      register.setInputValue(0, true);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, true);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(15);
      
      // リセット
      register.reset();
      
      expect(register.getState()).toEqual([false, false, false, false]);
      expect(register.getStateAsDecimal()).toBe(0);
    });
  });

  describe('10進数値の取得', () => {
    it('getStateAsDecimal()が正しい値を返す', () => {
      // 0000 = 0
      expect(register.getStateAsDecimal()).toBe(0);
      
      // 0001 = 1
      register.setInputValue(0, true);
      register.setInputValue(1, false);
      register.setInputValue(2, false);
      register.setInputValue(3, false);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(1);
      
      // 1111 = 15
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(0, true);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, true);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(15);
      
      // 1010 = 10
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(0, false);
      register.setInputValue(1, true);
      register.setInputValue(2, false);
      register.setInputValue(3, true);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      expect(register.getStateAsDecimal()).toBe(10);
    });
  });

  describe('シリアライズ/デシリアライズ', () => {
    it('状態を含めてシリアライズできる', () => {
      // 状態を設定
      register.setInputValue(0, true);
      register.setInputValue(1, false);
      register.setInputValue(2, true);
      register.setInputValue(3, false);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();

      const json = register.toJSON();
      expect(json.state).toEqual([true, false, true, false]);
      expect(json.lastClockState).toBe(true);
    });

    it('デシリアライズして状態を復元できる', () => {
      const json = {
        id: 'restored-register',
        type: 'REGISTER_4BIT',
        position: { x: 200, y: 200 },
        state: [true, true, false, true],
        lastClockState: false
      };

      const restored = Register4BitGate.fromJSON(json);
      expect(restored.id).toBe('restored-register');
      expect(restored.getState()).toEqual([true, true, false, true]);
      expect(restored.getStateAsDecimal()).toBe(11);
      
      restored.compute();
      expect(restored.getOutputValue(0)).toBe(true);
      expect(restored.getOutputValue(1)).toBe(true);
      expect(restored.getOutputValue(2)).toBe(false);
      expect(restored.getOutputValue(3)).toBe(true);
    });
  });

  describe('クローン機能', () => {
    it('状態を含めてクローンできる', () => {
      // 状態を設定
      register.setInputValue(0, false);
      register.setInputValue(1, true);
      register.setInputValue(2, true);
      register.setInputValue(3, false);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();

      const cloned = register.clone('cloned-register');
      expect(cloned.id).toBe('cloned-register');
      expect(cloned.getState()).toEqual([false, true, true, false]);
      expect(cloned.getStateAsDecimal()).toBe(6);
    });
  });

  describe('エッジケース', () => {
    it('入力が未定義の場合はfalseとして扱う', () => {
      // CLKのみ設定
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      
      expect(register.getState()).toEqual([false, false, false, false]);
    });

    it('部分的なデータ入力', () => {
      // D0とD2のみ設定
      register.setInputValue(0, true);
      register.setInputValue(2, true);
      register.setInputValue(4, false);
      register.compute();
      register.setInputValue(4, true);
      register.compute();
      
      expect(register.getOutputValue(0)).toBe(true);
      expect(register.getOutputValue(1)).toBe(false);
      expect(register.getOutputValue(2)).toBe(true);
      expect(register.getOutputValue(3)).toBe(false);
      expect(register.getStateAsDecimal()).toBe(5);
    });
  });
});