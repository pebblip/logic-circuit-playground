/**
 * PinConnectionManager.test.ts
 * 
 * CLAUDE.md準拠: ゲート2必須テスト
 * - 基本的な機能テスト
 * - エラーケースの検証
 * - 型安全性の確認
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PinConnectionManager } from '@/domain/connection/PinConnectionManager';
import type { Gate, Wire, Position } from '@/types/circuit';
import { CONNECTION_ERRORS } from '@/domain/connection/pinConnectionConfig';

describe('PinConnectionManager', () => {
  let manager: PinConnectionManager;
  let testGates: Gate[];

  beforeEach(() => {
    manager = new PinConnectionManager();
    
    // テスト用のゲートデータ
    testGates = [
      {
        id: 'gate1',
        type: 'AND',
        position: { x: 100, y: 100 },
        inputs: [false, false],
        output: false,
      },
      {
        id: 'gate2', 
        type: 'OR',
        position: { x: 200, y: 100 },
        inputs: [false, false],
        output: false,
      },
      {
        id: 'input1',
        type: 'INPUT',
        position: { x: 50, y: 100 },
        inputs: [],
        output: false,
        inputValue: true,
      },
      {
        id: 'output1',
        type: 'OUTPUT',
        position: { x: 300, y: 100 },
        inputs: [false],
        output: false,
      },
    ];

    manager.updateGates(testGates);
  });

  describe('ピン位置計算', () => {
    it('ANDゲートの入力ピン位置を正確に計算する', () => {
      const gate = testGates[0]; // AND gate
      const pin0 = manager.calculatePinPosition(gate, 0, false);
      const pin1 = manager.calculatePinPosition(gate, 1, false);

      // 期待値: x=55 (100-45), y=90/110 (100±10)
      expect(pin0).toEqual({
        x: 55,
        y: 90,
        gateId: 'gate1',
        pinIndex: 0,
        isOutput: false,
      });

      expect(pin1).toEqual({
        x: 55,
        y: 110,
        gateId: 'gate1',
        pinIndex: 1,
        isOutput: false,
      });
    });

    it('ANDゲートの出力ピン位置を正確に計算する', () => {
      const gate = testGates[0]; // AND gate
      const outputPin = manager.calculatePinPosition(gate, 0, true);

      // 期待値: x=145 (100+45), y=100
      expect(outputPin).toEqual({
        x: 145,
        y: 100,
        gateId: 'gate1',
        pinIndex: 0,
        isOutput: true,
      });
    });

    it('INPUTゲートの出力ピン位置を正確に計算する', () => {
      const inputGate = testGates[2]; // INPUT gate
      const outputPin = manager.calculatePinPosition(inputGate, 0, true);

      // 期待値: x=85 (50+35), y=100
      expect(outputPin).toEqual({
        x: 85,
        y: 100,
        gateId: 'input1',
        pinIndex: 0,
        isOutput: true,
      });
    });

    it('OUTPUTゲートの入力ピン位置を正確に計算する', () => {
      const outputGate = testGates[3]; // OUTPUT gate
      const inputPin = manager.calculatePinPosition(outputGate, 0, false);

      // 期待値: x=270 (300-30), y=100
      expect(inputPin).toEqual({
        x: 270,
        y: 100,
        gateId: 'output1',
        pinIndex: 0,
        isOutput: false,
      });
    });
  });

  describe('最寄りピン検索', () => {
    it('指定位置に最も近いピンを検索する', () => {
      const searchPos: Position = { x: 57, y: 92 };
      const nearestPin = manager.findNearestPin(searchPos);

      // gate1の入力ピン0 (55, 90) が最も近い
      expect(nearestPin).toEqual({
        x: 55,
        y: 90,
        gateId: 'gate1',
        pinIndex: 0,
        isOutput: false,
      });
    });

    it('最大距離制限を正しく適用する', () => {
      const searchPos: Position = { x: 0, y: 0 };
      const nearestPin = manager.findNearestPin(searchPos, { maxDistance: 10 });

      // 距離制限により検索結果なし
      expect(nearestPin).toBeNull();
    });

    it('特定ゲートを除外して検索する', () => {
      const searchPos: Position = { x: 57, y: 92 };
      const nearestPin = manager.findNearestPin(searchPos, { 
        excludeGateId: 'gate1' 
      });

      // gate1を除外するため、他のピンが返される
      expect(nearestPin).not.toBeNull();
      expect(nearestPin?.gateId).not.toBe('gate1');
    });

    it('入力ピンのみを検索する', () => {
      const searchPos: Position = { x: 85, y: 100 };
      const nearestPin = manager.findNearestPin(searchPos, { 
        pinType: 'input' 
      });

      // 入力ピンのみ検索するため、近くのINPUTゲートの出力ピンは除外される
      expect(nearestPin?.isOutput).toBe(false);
    });
  });

  describe('接続検証', () => {
    it('有効な接続を正しく検証する', () => {
      const from = { gateId: 'input1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate1', pinIndex: 0, isOutput: false };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(true);
    });

    it('同一タイプピン間の接続を拒否する', () => {
      const from = { gateId: 'gate1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate2', pinIndex: 0, isOutput: true };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('SAME_TYPE');
      expect(result.error).toBe(CONNECTION_ERRORS.SAME_TYPE);
    });

    it('自己接続を拒否する', () => {
      const from = { gateId: 'gate1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate1', pinIndex: 0, isOutput: false };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('SELF_CONNECTION');
      expect(result.error).toBe(CONNECTION_ERRORS.SELF_CONNECTION);
    });

    it('存在しないゲートへの接続を拒否する', () => {
      const from = { gateId: 'nonexistent', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate1', pinIndex: 0, isOutput: false };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('GATE_NOT_FOUND');
    });

    it('距離が遠すぎる接続を拒否する', () => {
      // 遠い位置にテストゲートを追加
      const distantGate: Gate = {
        id: 'distant',
        type: 'AND',
        position: { x: 1000, y: 1000 },
        inputs: [false, false],
        output: false,
      };
      
      manager.updateGates([...testGates, distantGate]);

      const from = { gateId: 'input1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'distant', pinIndex: 0, isOutput: false };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('DISTANCE_TOO_FAR');
    });
  });

  describe('ワイヤー作成', () => {
    it('有効な接続からワイヤーを作成する', () => {
      const from = { gateId: 'input1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate1', pinIndex: 0, isOutput: false };

      const result = manager.createWire(from, to);
      
      expect(result.success).toBe(true);
      expect(result.wire).toBeDefined();
      expect(result.wire?.from.gateId).toBe('input1');
      expect(result.wire?.to.gateId).toBe('gate1');
      expect(result.wire?.isActive).toBe(false);
      expect(result.wire?.id).toMatch(/^wire-\d+-[a-z0-9]+$/);
    });

    it('入力・出力を正規化する', () => {
      // 順序が逆でも正しく正規化される
      const from = { gateId: 'gate1', pinIndex: 0, isOutput: false };
      const to = { gateId: 'input1', pinIndex: 0, isOutput: true };

      const result = manager.createWire(from, to);
      
      expect(result.success).toBe(true);
      expect(result.wire?.from.gateId).toBe('input1'); // 出力側がfrom
      expect(result.wire?.to.gateId).toBe('gate1');     // 入力側がto
    });

    it('無効な接続でワイヤー作成を拒否する', () => {
      const from = { gateId: 'gate1', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate2', pinIndex: 0, isOutput: true };

      const result = manager.createWire(from, to);
      expect(result.success).toBe(false);
      expect(result.wire).toBeUndefined();
    });
  });

  describe('重複接続検証', () => {
    it('入力ピンへの複数接続を拒否する', () => {
      // gate1の入力ピン0の位置: (55, 90)
      // 距離50以内に出力ピンを配置するため、x=10, y=90 とすると
      // 出力ピン位置は (10+45, 90) = (55, 90) で距離0になる
      
      const gate2Close: Gate = {
        id: 'gate2close',
        type: 'OR',
        position: { x: 10, y: 90 }, // gate1の入力ピンと同じY座標、近いX座標
        inputs: [false, false],
        output: false,
      };
      
      manager.updateGates([...testGates, gate2Close]);
      
      // 既存のワイヤーを設定
      const existingWires: Wire[] = [{
        id: 'wire1',
        from: { gateId: 'input1', pinIndex: 0 },
        to: { gateId: 'gate1', pinIndex: 0 },
        isActive: false,
      }];
      
      manager.updateWires(existingWires);

      // 同じ入力ピンへの別の接続を試行
      // gate2closeの出力ピン (55, 90) から gate1の入力ピン (55, 90) - 距離0
      const from = { gateId: 'gate2close', pinIndex: 0, isOutput: true };
      const to = { gateId: 'gate1', pinIndex: 0, isOutput: false };

      const result = manager.validateConnection(from, to);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('MULTIPLE_INPUT');
    });
  });

  describe('ピン数取得', () => {
    it('ANDゲートのピン数を正しく取得する', () => {
      const gate = testGates[0]; // AND gate
      expect(manager.getInputPinCount(gate)).toBe(2);
      expect(manager.getOutputPinCount(gate)).toBe(1);
    });

    it('INPUTゲートのピン数を正しく取得する', () => {
      const gate = testGates[2]; // INPUT gate
      expect(manager.getInputPinCount(gate)).toBe(0);
      expect(manager.getOutputPinCount(gate)).toBe(1);
    });

    it('OUTPUTゲートのピン数を正しく取得する', () => {
      const gate = testGates[3]; // OUTPUT gate
      expect(manager.getInputPinCount(gate)).toBe(1);
      expect(manager.getOutputPinCount(gate)).toBe(0);
    });
  });

  describe('クリック範囲判定', () => {
    it('ピンクリック範囲内の判定が正しく動作する', () => {
      const pinPos = {
        x: 100,
        y: 100,
        gateId: 'test',
        pinIndex: 0,
        isOutput: true,
      };

      // 範囲内の位置
      expect(manager.isWithinClickArea({ x: 105, y: 102 }, pinPos)).toBe(true);
      expect(manager.isWithinClickArea({ x: 100, y: 100 }, pinPos)).toBe(true);

      // 範囲外の位置
      expect(manager.isWithinClickArea({ x: 130, y: 100 }, pinPos)).toBe(false);
      expect(manager.isWithinClickArea({ x: 100, y: 120 }, pinPos)).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なゲートでフォールバック位置を返す', () => {
      const invalidGate: Gate = {
        id: 'invalid',
        type: 'UNKNOWN' as any, // 無効なタイプ
        position: { x: 200, y: 200 },
        inputs: [],
        output: false,
      };

      // エラーが発生してもクラッシュしない
      const result = manager.calculatePinPosition(invalidGate, 0, false);
      
      // 実装を確認: フォールバックで基本ゲートの入力設定が適用される
      // 入力ピンのy配列の最初の要素のoffsetは-10なので、200 + (-10) = 190
      expect(result.x).toBe(155); // 200 + (-45) = 155
      expect(result.y).toBe(190); // 200 + (-10) = 190 (基本ゲートの最初の入力ピンオフセット)
      expect(result.gateId).toBe('invalid');
      expect(result.isOutput).toBe(false);
    });
  });
});