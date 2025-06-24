/**
 * GateFactory オブジェクト指向実装テスト
 * 
 * 目的: オブジェクト指向リファクタリング後の動作確認
 * - GATE_CONFIGSオブジェクトによる設定駆動
 * - switch文排除の確認
 * - 純粋関数パターンの検証
 */

import { describe, it, expect, vi } from 'vitest';
import { GateFactory } from '@/models/gates/GateFactory';
import type { Gate } from '@/types/circuit';

describe('GateFactory - オブジェクト指向実装', () => {
  describe('GATE_CONFIGS設定駆動パターン', () => {
    it('基本ゲートの設定が正しく適用される', () => {
      const andGate = GateFactory.createGate('AND', { x: 100, y: 100 });
      
      expect(andGate.type).toBe('AND');
      expect(andGate.inputs).toHaveLength(2);
      expect(andGate.outputs).toHaveLength(1);
      
      const size = GateFactory.getGateSize('AND');
      expect(size).toEqual({ width: 70, height: 50 });
    });

    it('特殊ゲートの設定が正しく適用される', () => {
      const dffGate = GateFactory.createGate('D-FF', { x: 200, y: 200 });
      
      expect(dffGate.type).toBe('D-FF');
      expect(dffGate.inputs).toHaveLength(2);
      expect(dffGate.metadata).toBeDefined();
      expect(dffGate.metadata?.clockEdge).toBe('rising');
      expect(dffGate.metadata?.qOutput).toBe(false);
      expect(dffGate.metadata?.qBarOutput).toBe(true);
      
      const size = GateFactory.getGateSize('D-FF');
      expect(size).toEqual({ width: 100, height: 80 });
    });

    it('INPUTゲートの特殊設定が適用される', () => {
      const inputGate = GateFactory.createGate('INPUT', { x: 50, y: 50 });
      
      expect(inputGate.type).toBe('INPUT');
      expect(inputGate.inputs).toHaveLength(0); // 入力なし
      expect(inputGate.outputs).toHaveLength(1);
      
      const size = GateFactory.getGateSize('INPUT');
      expect(size).toEqual({ width: 50, height: 30 });
    });

    it('未知のゲートタイプでデフォルト設定が使用される', () => {
      const unknownGate = GateFactory.createGate('UNKNOWN' as any, { x: 0, y: 0 });
      
      // CUSTOMのデフォルト設定が使用される
      expect(unknownGate.inputs).toHaveLength(2);
      expect(unknownGate.outputs).toHaveLength(1);
      
      const size = GateFactory.getGateSize('UNKNOWN' as any);
      expect(size).toEqual({ width: 70, height: 50 }); // デフォルトサイズ
    });
  });

  describe('純粋関数パターンの検証', () => {
    it('createSpecific関数が純粋関数として動作する', () => {
      const clock1 = GateFactory.createGate('CLOCK', { x: 0, y: 0 });
      const clock2 = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      
      // 同じ設定から作成されたゲートは同じ構造を持つ
      expect(clock1.metadata?.frequency).toBe(clock2.metadata?.frequency);
      expect(clock1.metadata?.isRunning).toBe(clock2.metadata?.isRunning);
      
      // しかし異なるインスタンス
      expect(clock1).not.toBe(clock2);
      expect(clock1.id).not.toBe(clock2.id);
    });

    it('ゲートサイズ取得が一貫性を保つ', () => {
      const gate = GateFactory.createGate('MUX', { x: 0, y: 0 });
      
      const sizeFromType = GateFactory.getGateSize('MUX');
      const sizeFromGate = GateFactory.getGateSize(gate);
      
      expect(sizeFromType).toEqual(sizeFromGate);
      expect(sizeFromType).toEqual({ width: 100, height: 100 });
    });
  });

  describe('ピン数設定の一貫性', () => {
    it('ゲートタイプごとのピン数が正しい', () => {
      const testCases = [
        { type: 'AND', inputs: 2, outputs: 1 },
        { type: 'NOT', inputs: 1, outputs: 1 },
        { type: 'INPUT', inputs: 0, outputs: 1 },
        { type: 'OUTPUT', inputs: 1, outputs: 0 },
        { type: 'CLOCK', inputs: 0, outputs: 1 },
        { type: 'D-FF', inputs: 2, outputs: 1 },
        { type: 'MUX', inputs: 3, outputs: 1 },
        { type: 'BINARY_COUNTER', inputs: 1, outputs: 2 },
        { type: 'LED', inputs: 4, outputs: 0 },
      ];

      testCases.forEach(({ type, inputs, outputs }) => {
        const gate = GateFactory.createGate(type as any, { x: 0, y: 0 });
        const pinCount = GateFactory.getPinCount(gate);
        
        expect(pinCount.inputs).toBe(inputs);
        expect(pinCount.outputs).toBe(outputs);
        expect(gate.inputs).toHaveLength(inputs);
      });
    });
  });

  describe('カスタムゲートのサポート', () => {
    it('カスタムゲート定義が正しく処理される', () => {
      const customDef = {
        name: 'MyCustomGate',
        width: 150,
        height: 120,
        inputs: [
          { name: 'A', position: { x: -75, y: -30 } },
          { name: 'B', position: { x: -75, y: 0 } },
          { name: 'C', position: { x: -75, y: 30 } },
        ],
        outputs: [
          { name: 'Y', position: { x: 75, y: 0 } },
        ],
        internalCircuit: { gates: [], wires: [] },
      };

      const customGate = GateFactory.createCustomGate(customDef, { x: 300, y: 300 });
      
      expect(customGate.type).toBe('CUSTOM');
      expect(customGate.inputs).toHaveLength(3);
      expect(customGate.outputs).toHaveLength(1);
      expect(customGate.customGateDefinition).toEqual(customDef);
      
      const size = GateFactory.getGateSize(customGate);
      expect(size).toEqual({ width: 150, height: 120 });
    });
  });

  describe('LEDゲートの動的サイズ計算', () => {
    it('LEDゲートのビット幅に応じてサイズが変わる', () => {
      const led4bit = GateFactory.createGate('LED', { x: 0, y: 0 });
      const size4bit = GateFactory.getGateSize(led4bit);
      // 4ビット: 4 * 24 + 40 = 136, Math.max(120, 136) = 136
      expect(size4bit).toEqual({ width: 136, height: 100 });

      // ビット幅を変更したLEDゲート
      const led8bit = { ...led4bit, gateData: { bitWidth: 8, displayMode: 'hex' } };
      const size8bit = GateFactory.getGateSize(led8bit);
      
      // 8ビットの場合は幅が拡張される
      const expectedWidth = Math.max(120, 8 * 24 + 40); // 232
      expect(size8bit.width).toBe(expectedWidth);
      expect(size8bit.height).toBe(100);
    });
  });

  describe('switch文の排除確認', () => {
    it('新しいゲートタイプ追加時にswitch文の修正が不要', () => {
      // GATE_CONFIGSに新しいゲートタイプを追加するシミュレーション
      // 実際のコードでは、GATE_CONFIGSオブジェクトに追加するだけで動作する
      const newGateType = 'FUTURE_GATE';
      
      // 未知のゲートタイプでもエラーなく動作
      expect(() => {
        GateFactory.createGate(newGateType as any, { x: 0, y: 0 });
      }).not.toThrow();
    });
  });
});