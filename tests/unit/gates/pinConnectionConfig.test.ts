/**
 * pinConnectionConfig.test.ts
 * 
 * CLAUDE.md準拠: 設定統合の検証テスト
 * - ピン設定の型安全性確認
 * - ヘルパー関数の動作検証
 * - フォールバック機能のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  PIN_CLICK_AREA,
  PIN_VISUAL,
  PIN_OFFSETS,
  CONNECTION_VALIDATION,
  CONNECTION_ERRORS,
  getPinConfig,
  getPinOffsetY,
  calculateCustomGateHeight,
  calculateCustomGatePinSpacing,
  CUSTOM_GATE_CONFIG,
  type PinOffsetEntry,
} from '@/domain/connection/pinConnectionConfig';
import type { GateType } from '@/types/circuit';

describe('pinConnectionConfig', () => {
  describe('定数値の検証', () => {
    it('PIN_CLICK_AREAが適切な値を持つ', () => {
      expect(PIN_CLICK_AREA.rx).toBe(25);
      expect(PIN_CLICK_AREA.ry).toBe(10);
      expect(typeof PIN_CLICK_AREA.rx).toBe('number');
      expect(typeof PIN_CLICK_AREA.ry).toBe('number');
    });

    it('PIN_VISUALが完全な設定を持つ', () => {
      expect(PIN_VISUAL.radius).toBe(6);
      expect(PIN_VISUAL.strokeWidth.normal).toBe(2);
      expect(PIN_VISUAL.strokeWidth.hovered).toBe(3);
      expect(PIN_VISUAL.colors.active).toBe('#00ff88');
      expect(PIN_VISUAL.opacity.normal).toBe(0.8);
    });

    it('CONNECTION_VALIDATIONが論理的な値を持つ', () => {
      expect(CONNECTION_VALIDATION.maxConnectionDistance).toBeGreaterThan(0);
      expect(CONNECTION_VALIDATION.minConnectionDistance).toBeGreaterThan(0);
      expect(CONNECTION_VALIDATION.maxConnectionDistance).toBeGreaterThan(
        CONNECTION_VALIDATION.minConnectionDistance
      );
      
      expect(CONNECTION_VALIDATION.rules.sameTypeConnection).toBe(false);
      expect(CONNECTION_VALIDATION.rules.selfConnection).toBe(false);
      expect(CONNECTION_VALIDATION.rules.multipleInputConnections).toBe(false);
      expect(CONNECTION_VALIDATION.rules.circularConnectionDetection).toBe(true);
    });
  });

  describe('getPinConfig関数', () => {
    it('基本ゲートタイプの設定を正しく返す', () => {
      const andConfig = getPinConfig('AND');
      expect(andConfig).toBe(PIN_OFFSETS.BASIC_GATES);
      
      const orConfig = getPinConfig('OR');
      expect(orConfig).toBe(PIN_OFFSETS.BASIC_GATES);
      
      const xorConfig = getPinConfig('XOR');
      expect(xorConfig).toBe(PIN_OFFSETS.BASIC_GATES);
    });

    it('特殊ゲートタイプの設定を正しく返す', () => {
      const notConfig = getPinConfig('NOT');
      expect(notConfig).toBe(PIN_OFFSETS.NOT);
      
      const inputConfig = getPinConfig('INPUT');
      expect(inputConfig).toBe(PIN_OFFSETS.INPUT);
      
      const outputConfig = getPinConfig('OUTPUT');
      expect(outputConfig).toBe(PIN_OFFSETS.OUTPUT);
      
      const clockConfig = getPinConfig('CLOCK');
      expect(clockConfig).toBe(PIN_OFFSETS.CLOCK);
    });

    it('複雑なゲートタイプの設定を正しく返す', () => {
      const dffConfig = getPinConfig('D-FF');
      expect(dffConfig).toBe(PIN_OFFSETS['D-FF']);
      
      const srConfig = getPinConfig('SR-LATCH');
      expect(srConfig).toBe(PIN_OFFSETS['SR-LATCH']);
      
      const muxConfig = getPinConfig('MUX');
      expect(muxConfig).toBe(PIN_OFFSETS.MUX);
      
      const counterConfig = getPinConfig('BINARY_COUNTER');
      expect(muxConfig).toBe(PIN_OFFSETS.MUX);
    });

    it('CUSTOMゲートタイプで空オブジェクトを返す', () => {
      const customConfig = getPinConfig('CUSTOM');
      expect(customConfig).toEqual({});
    });

    it('未知のゲートタイプでフォールバックを返す', () => {
      const unknownConfig = getPinConfig('UNKNOWN' as GateType);
      expect(unknownConfig).toBe(PIN_OFFSETS.BASIC_GATES);
    });
  });

  describe('getPinOffsetY関数', () => {
    it('数値設定で正しい値を返す', () => {
      const result = getPinOffsetY(10, 0);
      expect(result).toBe(10);
      
      const result2 = getPinOffsetY(-5, 0);
      expect(result2).toBe(-5);
    });

    it('配列設定で正しいオフセットを返す', () => {
      const offsetArray: PinOffsetEntry[] = [
        { index: 0, offset: -10 },
        { index: 1, offset: 10 },
        { index: 2, offset: 0 },
      ];

      expect(getPinOffsetY(offsetArray, 0)).toBe(-10);
      expect(getPinOffsetY(offsetArray, 1)).toBe(10);
      expect(getPinOffsetY(offsetArray, 2)).toBe(0);
    });

    it('存在しないインデックスでフォールバック値を返す', () => {
      const offsetArray: PinOffsetEntry[] = [
        { index: 0, offset: -10 },
        { index: 1, offset: 10 },
      ];

      // 存在しないインデックス3の場合、フォールバック値0を返す
      expect(getPinOffsetY(offsetArray, 3)).toBe(0);
    });

    it('空配列でフォールバック値を返す', () => {
      const emptyArray: PinOffsetEntry[] = [];
      expect(getPinOffsetY(emptyArray, 0)).toBe(0);
    });
  });

  describe('PIN_OFFSETS設定の妥当性', () => {
    it('基本ゲートの設定が論理的である', () => {
      const config = PIN_OFFSETS.BASIC_GATES;
      
      // 入力は左側（負のx）、出力は右側（正のx）
      expect(config.input.x).toBeLessThan(0);
      expect(config.output.x).toBeGreaterThan(0);
      
      // 2つの入力ピンがある
      expect(Array.isArray(config.input.y)).toBe(true);
      expect((config.input.y as PinOffsetEntry[]).length).toBe(2);
      
      // 出力は1つ（中央）
      expect(typeof config.output.y).toBe('number');
      expect(config.output.y).toBe(0);
    });

    it('NOTゲートの設定が論理的である', () => {
      const config = PIN_OFFSETS.NOT;
      
      // 入力は左側、出力は右側
      expect(config.input.x).toBeLessThan(0);
      expect(config.output.x).toBeGreaterThan(0);
      
      // 単一入力・単一出力（中央）
      expect(config.input.y).toBe(0);
      expect(config.output.y).toBe(0);
    });

    it('D-FFの設定が適切である', () => {
      const config = PIN_OFFSETS['D-FF'];
      
      // 2つの入力ピン（D, CLK）
      expect(Array.isArray(config.input?.y)).toBe(true);
      const inputs = config.input?.y as PinOffsetEntry[];
      expect(inputs.length).toBe(2);
      expect(inputs[0].label).toBe('D');
      expect(inputs[1].label).toBe('CLK');
      
      // 2つの出力ピン（Q, Q̄）
      expect(Array.isArray(config.output?.y)).toBe(true);
      const outputs = config.output?.y as PinOffsetEntry[];
      expect(outputs.length).toBe(2);
      expect(outputs[0].label).toBe('Q');
      expect(outputs[1].label).toBe('Q̄');
    });

    it('INPUTゲートは出力のみを持つ', () => {
      const config = PIN_OFFSETS.INPUT;
      expect(config.input).toBeUndefined();
      expect(config.output).toBeDefined();
      expect(config.output?.x).toBeGreaterThan(0);
    });

    it('OUTPUTゲートは入力のみを持つ', () => {
      const config = PIN_OFFSETS.OUTPUT;
      expect(config.input).toBeDefined();
      expect(config.output).toBeUndefined();
      expect(config.input?.x).toBeLessThan(0);
    });
  });

  describe('CONNECTION_ERRORS', () => {
    it('全てのエラーメッセージが日本語で定義されている', () => {
      expect(CONNECTION_ERRORS.SAME_TYPE).toContain('同じため');
      expect(CONNECTION_ERRORS.SELF_CONNECTION).toContain('同一ゲート');
      expect(CONNECTION_ERRORS.MULTIPLE_INPUT).toContain('複数');
      expect(CONNECTION_ERRORS.DISTANCE_TOO_FAR).toContain('距離');
      expect(CONNECTION_ERRORS.CIRCULAR_CONNECTION).toContain('循環');
      expect(CONNECTION_ERRORS.INVALID_PIN_INDEX).toContain('無効');
      expect(CONNECTION_ERRORS.GATE_NOT_FOUND).toContain('見つかりません');
    });

    it('エラーメッセージがユーザーフレンドリーである', () => {
      // 技術的すぎず、理解しやすい表現になっているかチェック
      Object.values(CONNECTION_ERRORS).forEach(message => {
        expect(message.length).toBeGreaterThan(10); // 最低限の説明長
        expect(message.length).toBeLessThan(100);   // 長すぎない
        expect(message).not.toContain('Error');     // 英語のエラー用語を避ける
        expect(message).not.toContain('undefined'); // 技術的な表現を避ける
      });
    });
  });

  describe('カスタムゲート計算関数', () => {
    describe('calculateCustomGateHeight', () => {
      it('最小高さを下回らない', () => {
        const height = calculateCustomGateHeight(1);
        expect(height).toBe(CUSTOM_GATE_CONFIG.minHeight);
      });

      it('ピン数に応じて高さが増加する', () => {
        const height2 = calculateCustomGateHeight(2);
        const height4 = calculateCustomGateHeight(4);
        const height8 = calculateCustomGateHeight(8);

        expect(height2).toBeLessThan(height4);
        expect(height4).toBeLessThan(height8);
      });

      it('ピン数が多い場合の計算が正しい', () => {
        const pins = 5;
        const expectedHeight = pins * CUSTOM_GATE_CONFIG.pinSpacing.perPin;
        const actualHeight = calculateCustomGateHeight(pins);
        
        expect(actualHeight).toBe(expectedHeight);
      });

      it('0ピンでも最小高さを返す', () => {
        const height = calculateCustomGateHeight(0);
        expect(height).toBe(CUSTOM_GATE_CONFIG.minHeight);
      });
    });

    describe('calculateCustomGatePinSpacing', () => {
      it('単一ピンの場合は0を返す', () => {
        const spacing = calculateCustomGatePinSpacing(1, 100);
        expect(spacing).toBe(0);
      });

      it('0ピンの場合も0を返す', () => {
        const spacing = calculateCustomGatePinSpacing(0, 100);
        expect(spacing).toBe(0);
      });

      it('最小間隔を下回らない', () => {
        // 非常に小さい高さでも最小間隔を維持
        const spacing = calculateCustomGatePinSpacing(10, 50);
        expect(spacing).toBeGreaterThanOrEqual(
          CUSTOM_GATE_CONFIG.pinSpacing.minimum
        );
      });

      it('利用可能な高さに基づいて適切な間隔を計算', () => {
        const pinCount = 4;
        const gateHeight = 150;
        const availableHeight = gateHeight - 2 * CUSTOM_GATE_CONFIG.margins.vertical;
        const expectedSpacing = availableHeight / (pinCount - 1);
        
        const actualSpacing = calculateCustomGatePinSpacing(pinCount, gateHeight);
        
        expect(actualSpacing).toBe(expectedSpacing);
      });

      it('高さが十分な場合は理想的な間隔を使用', () => {
        const spacing = calculateCustomGatePinSpacing(3, 200);
        const availableHeight = 200 - 2 * CUSTOM_GATE_CONFIG.margins.vertical;
        const idealSpacing = availableHeight / 2; // 3-1=2
        
        expect(spacing).toBe(idealSpacing);
      });

      it('マージンを考慮した計算が正しい', () => {
        const gateHeight = 100;
        const pinCount = 3;
        const expectedAvailable = gateHeight - 2 * CUSTOM_GATE_CONFIG.margins.vertical;
        const expectedSpacing = expectedAvailable / (pinCount - 1);
        
        const actualSpacing = calculateCustomGatePinSpacing(pinCount, gateHeight);
        
        expect(actualSpacing).toBe(expectedSpacing);
      });
    });
  });

  describe('型安全性の確認', () => {
    it('PinOffsetEntry型が正しく定義されている', () => {
      const validEntry: PinOffsetEntry = {
        index: 0,
        offset: -10,
        label: 'A',
      };

      expect(typeof validEntry.index).toBe('number');
      expect(typeof validEntry.offset).toBe('number');
      expect(typeof validEntry.label).toBe('string');
    });

    it('readonlyサポートが正しく動作する', () => {
      const readonlyArray: readonly PinOffsetEntry[] = [
        { index: 0, offset: -10 },
        { index: 1, offset: 10 },
      ];

      // readonly配列でも正常に動作する
      expect(() => getPinOffsetY(readonlyArray, 0)).not.toThrow();
      expect(getPinOffsetY(readonlyArray, 0)).toBe(-10);
    });
  });
});