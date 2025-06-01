import { describe, it, expect, beforeEach } from 'vitest';
import { Mux2to1Gate } from '../Mux2to1Gate';

describe('Mux2to1Gate', () => {
  let mux: Mux2to1Gate;

  beforeEach(() => {
    mux = new Mux2to1Gate('test-mux', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(mux.id).toBe('test-mux');
      expect(mux.type).toBe('MUX_2TO1');
      expect(mux.position).toEqual({ x: 100, y: 100 });
    });

    it('3つの入力ピンを持つ', () => {
      const inputs = mux.getInputs();
      expect(inputs).toHaveLength(3);
      expect(inputs[0].name).toBe('A');
      expect(inputs[1].name).toBe('B');
      expect(inputs[2].name).toBe('SEL');
    });

    it('1つの出力ピンを持つ', () => {
      const outputs = mux.getOutputs();
      expect(outputs).toHaveLength(1);
      expect(outputs[0].name).toBe('Y');
    });
  });

  describe('基本動作', () => {
    it('初期出力は0', () => {
      mux.compute();
      expect(mux.getOutputValue(0)).toBe(false);
    });

    it('SEL=0の時はAを出力', () => {
      // A=1, B=0, SEL=0
      mux.setInputValue(0, true);   // A=1
      mux.setInputValue(1, false);  // B=0
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
    });

    it('SEL=1の時はBを出力', () => {
      // A=0, B=1, SEL=1
      mux.setInputValue(0, false);  // A=0
      mux.setInputValue(1, true);   // B=1
      mux.setInputValue(2, true);   // SEL=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=B=1
    });

    it('両方の入力が同じ場合', () => {
      // A=1, B=1, SEL=0
      mux.setInputValue(0, true);   // A=1
      mux.setInputValue(1, true);   // B=1
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
      
      // SEL=1に変更
      mux.setInputValue(2, true);   // SEL=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=B=1（同じ値）
    });

    it('両方の入力が0の場合', () => {
      // A=0, B=0, SEL=0
      mux.setInputValue(0, false);  // A=0
      mux.setInputValue(1, false);  // B=0
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(false);  // Y=A=0
      
      // SEL=1に変更
      mux.setInputValue(2, true);   // SEL=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(false);  // Y=B=0
    });
  });

  describe('完全な真理値表のテスト', () => {
    it('全ての入力組み合わせで正しく動作', () => {
      const testCases = [
        // [A, B, SEL, 期待出力]
        [false, false, false, false],  // SEL=0, Y=A=0
        [false, false, true,  false],  // SEL=1, Y=B=0
        [false, true,  false, false],  // SEL=0, Y=A=0
        [false, true,  true,  true],   // SEL=1, Y=B=1
        [true,  false, false, true],   // SEL=0, Y=A=1
        [true,  false, true,  false],  // SEL=1, Y=B=0
        [true,  true,  false, true],   // SEL=0, Y=A=1
        [true,  true,  true,  true],   // SEL=1, Y=B=1
      ];

      testCases.forEach(([a, b, sel, expected], index) => {
        mux.setInputValue(0, a);
        mux.setInputValue(1, b);
        mux.setInputValue(2, sel);
        mux.compute();
        
        expect(mux.getOutputValue(0)).toBe(expected);
      });
    });
  });

  describe('動的な選択切り替え', () => {
    it('SELを切り替えると出力が即座に変わる', () => {
      // 異なる入力を設定
      mux.setInputValue(0, true);   // A=1
      mux.setInputValue(1, false);  // B=0
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
      
      // SELを切り替え
      mux.setInputValue(2, true);   // SEL=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(false);  // Y=B=0
      
      // 再びSELを切り替え
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
    });

    it('入力データを変更しても正しく選択される', () => {
      // 初期状態
      mux.setInputValue(0, false);  // A=0
      mux.setInputValue(1, false);  // B=0
      mux.setInputValue(2, false);  // SEL=0
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(false);  // Y=A=0
      
      // Aを変更
      mux.setInputValue(0, true);   // A=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
      
      // SELを切り替えてBを選択
      mux.setInputValue(2, true);   // SEL=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(false);  // Y=B=0
      
      // Bを変更
      mux.setInputValue(1, true);   // B=1
      mux.compute();
      
      expect(mux.getOutputValue(0)).toBe(true);  // Y=B=1
    });
  });

  describe('シリアライズ/デシリアライズ', () => {
    it('シリアライズできる', () => {
      const json = mux.toJSON();
      expect(json.id).toBe('test-mux');
      expect(json.type).toBe('MUX_2TO1');
      expect(json.position).toEqual({ x: 100, y: 100 });
    });

    it('デシリアライズできる', () => {
      const json = {
        id: 'restored-mux',
        type: 'MUX_2TO1',
        position: { x: 200, y: 200 }
      };

      const restored = Mux2to1Gate.fromJSON(json);
      expect(restored.id).toBe('restored-mux');
      expect(restored.type).toBe('MUX_2TO1');
      expect(restored.position).toEqual({ x: 200, y: 200 });
      
      // 動作確認
      restored.setInputValue(0, true);
      restored.setInputValue(1, false);
      restored.setInputValue(2, false);
      restored.compute();
      expect(restored.getOutputValue(0)).toBe(true);
    });
  });

  describe('クローン機能', () => {
    it('クローンできる', () => {
      const cloned = mux.clone('cloned-mux');
      expect(cloned.id).toBe('cloned-mux');
      expect(cloned.type).toBe('MUX_2TO1');
      expect(cloned.position).toEqual({ x: 100, y: 100 });
      
      // 動作確認
      cloned.setInputValue(0, false);
      cloned.setInputValue(1, true);
      cloned.setInputValue(2, true);
      cloned.compute();
      expect(cloned.getOutputValue(0)).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('入力が未定義の場合はfalseとして扱う', () => {
      // 何も設定しない
      mux.compute();
      expect(mux.getOutputValue(0)).toBe(false);
      
      // SELのみ設定
      mux.setInputValue(2, true);
      mux.compute();
      expect(mux.getOutputValue(0)).toBe(false);  // B=false(未定義)
    });

    it('部分的な入力設定', () => {
      // Aのみ設定、SEL=0
      mux.setInputValue(0, true);
      mux.setInputValue(2, false);
      mux.compute();
      expect(mux.getOutputValue(0)).toBe(true);  // Y=A=1
      
      // Bのみ設定、SEL=1
      const mux2 = new Mux2to1Gate('mux2', 0, 0);
      mux2.setInputValue(1, true);
      mux2.setInputValue(2, true);
      mux2.compute();
      expect(mux2.getOutputValue(0)).toBe(true);  // Y=B=1
    });
  });
});