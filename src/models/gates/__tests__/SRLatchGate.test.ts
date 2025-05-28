import { describe, it, expect, beforeEach } from 'vitest';
import { SRLatchGate } from '../SRLatchGate';

describe('SRLatchGate', () => {
  let srLatch: SRLatchGate;

  beforeEach(() => {
    srLatch = new SRLatchGate('test-sr-latch', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(srLatch.id).toBe('test-sr-latch');
      expect(srLatch.type).toBe('SR_LATCH');
      expect(srLatch.position).toEqual({ x: 100, y: 100 });
      expect(srLatch.getState()).toBe(false);
      expect(srLatch.isInvalidState()).toBe(false);
    });

    it('2つの入力ピンを持つ', () => {
      const inputs = srLatch.getInputs();
      expect(inputs).toHaveLength(2);
      expect(inputs[0].name).toBe('S');
      expect(inputs[1].name).toBe('R');
    });

    it('2つの出力ピンを持つ', () => {
      const outputs = srLatch.getOutputs();
      expect(outputs).toHaveLength(2);
      expect(outputs[0].name).toBe('Q');
      expect(outputs[1].name).toBe('Q\'');
    });
  });

  describe('基本動作', () => {
    it('初期出力はQ=false, Q\'=true', () => {
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(false); // Q
      expect(srLatch.getOutputValue(1)).toBe(true);  // Q'
    });

    it('S=1, R=0でセット（Q=1）', () => {
      srLatch.setInputValue(0, true);   // S=1
      srLatch.setInputValue(1, false);  // R=0
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(true);   // Q=1
      expect(srLatch.getOutputValue(1)).toBe(false);  // Q'=0
      expect(srLatch.getState()).toBe(true);
    });

    it('S=0, R=1でリセット（Q=0）', () => {
      // まずセット状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      
      // リセット
      srLatch.setInputValue(0, false);  // S=0
      srLatch.setInputValue(1, true);   // R=1
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(false);  // Q=0
      expect(srLatch.getOutputValue(1)).toBe(true);   // Q'=1
      expect(srLatch.getState()).toBe(false);
    });

    it('S=0, R=0で状態を保持', () => {
      // セット状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(true);
      
      // 保持状態
      srLatch.setInputValue(0, false);  // S=0
      srLatch.setInputValue(1, false);  // R=0
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(true);   // Q=1（保持）
      expect(srLatch.getOutputValue(1)).toBe(false);  // Q'=0
      
      // リセット状態にする
      srLatch.setInputValue(0, false);
      srLatch.setInputValue(1, true);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(false);
      
      // 再び保持状態
      srLatch.setInputValue(0, false);  // S=0
      srLatch.setInputValue(1, false);  // R=0
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(false);  // Q=0（保持）
      expect(srLatch.getOutputValue(1)).toBe(true);   // Q'=1
    });

    it('S=1, R=1で禁止状態（両出力が0）', () => {
      srLatch.setInputValue(0, true);   // S=1
      srLatch.setInputValue(1, true);   // R=1
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(false);  // Q=0
      expect(srLatch.getOutputValue(1)).toBe(false);  // Q'=0（通常と異なる）
      expect(srLatch.isInvalidState()).toBe(true);
    });

    it('禁止状態から抜けると初期状態に戻る', () => {
      // 禁止状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, true);
      srLatch.compute();
      expect(srLatch.isInvalidState()).toBe(true);
      
      // 保持状態に移行
      srLatch.setInputValue(0, false);  // S=0
      srLatch.setInputValue(1, false);  // R=0
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(false);  // Q=0（初期状態）
      expect(srLatch.getOutputValue(1)).toBe(true);   // Q'=1
      expect(srLatch.isInvalidState()).toBe(false);
    });
  });

  describe('複雑なシーケンス', () => {
    it('セット→保持→リセット→保持のシーケンス', () => {
      // セット
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(true);
      
      // 保持
      srLatch.setInputValue(0, false);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(true);
      
      // リセット
      srLatch.setInputValue(0, false);
      srLatch.setInputValue(1, true);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(false);
      
      // 保持
      srLatch.setInputValue(0, false);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(false);
    });

    it('禁止状態を含むシーケンス', () => {
      // セット
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getState()).toBe(true);
      
      // 禁止状態
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, true);
      srLatch.compute();
      expect(srLatch.isInvalidState()).toBe(true);
      
      // セット（禁止状態から直接セットへ）
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getOutputValue(0)).toBe(true);
      expect(srLatch.isInvalidState()).toBe(false);
    });
  });

  describe('リセット機能', () => {
    it('reset()で初期状態に戻る', () => {
      // 状態を変更
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();
      expect(srLatch.getState()).toBe(true);
      
      // リセット
      srLatch.reset();
      
      expect(srLatch.getState()).toBe(false);
      expect(srLatch.isInvalidState()).toBe(false);
      expect(srLatch.getOutputValue(0)).toBe(false);
      expect(srLatch.getOutputValue(1)).toBe(true);
    });

    it('禁止状態からもreset()で復帰', () => {
      // 禁止状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, true);
      srLatch.compute();
      expect(srLatch.isInvalidState()).toBe(true);
      
      // リセット
      srLatch.reset();
      
      expect(srLatch.isInvalidState()).toBe(false);
      expect(srLatch.getOutputValue(0)).toBe(false);
      expect(srLatch.getOutputValue(1)).toBe(true);
    });
  });

  describe('シリアライズ/デシリアライズ', () => {
    it('状態を含めてシリアライズできる', () => {
      // セット状態
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();

      const json = srLatch.toJSON();
      expect(json.state).toBe(true);
      expect(json.isInvalidState).toBe(false);
    });

    it('禁止状態もシリアライズできる', () => {
      // 禁止状態
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, true);
      srLatch.compute();

      const json = srLatch.toJSON();
      expect(json.isInvalidState).toBe(true);
    });

    it('デシリアライズして状態を復元できる', () => {
      const json = {
        id: 'restored-sr',
        type: 'SR_LATCH',
        position: { x: 200, y: 200 },
        state: true,
        isInvalidState: false
      };

      const restored = SRLatchGate.fromJSON(json);
      expect(restored.id).toBe('restored-sr');
      expect(restored.getState()).toBe(true);
      
      restored.compute();
      expect(restored.getOutputValue(0)).toBe(true);
      expect(restored.getOutputValue(1)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('入力が未定義の場合はfalseとして扱う', () => {
      // 入力を設定しない
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(false);
      expect(srLatch.getOutputValue(1)).toBe(true);
    });

    it('片方だけ入力を設定', () => {
      // Sのみ設定
      srLatch.setInputValue(0, true);
      srLatch.compute();
      
      expect(srLatch.getOutputValue(0)).toBe(true);  // セット動作
      expect(srLatch.getOutputValue(1)).toBe(false);
    });
  });

  describe('クローン機能', () => {
    it('状態を含めてクローンできる', () => {
      // セット状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, false);
      srLatch.compute();

      const cloned = srLatch.clone('cloned-sr');
      expect(cloned.id).toBe('cloned-sr');
      expect(cloned.getState()).toBe(true);
      
      cloned.compute();
      expect(cloned.getOutputValue(0)).toBe(true);
      expect(cloned.getOutputValue(1)).toBe(false);
    });

    it('禁止状態もクローンできる', () => {
      // 禁止状態にする
      srLatch.setInputValue(0, true);
      srLatch.setInputValue(1, true);
      srLatch.compute();

      const cloned = srLatch.clone('cloned-sr');
      expect(cloned.isInvalidState()).toBe(true);
    });
  });
});