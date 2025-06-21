import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitShareService } from '@/services/CircuitShareService';
import type { Gate, Wire } from '@/types/circuit';

describe('CircuitShareService', () => {
  const mockGates: Gate[] = [
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
      position: { x: 200, y: 200 },
      inputs: [false, false],
      output: false,
    },
  ];

  const mockWires: Wire[] = [
    {
      id: 'wire1',
      from: { gateId: 'gate1', pinIndex: -1 },
      to: { gateId: 'gate2', pinIndex: 0 },
    },
  ];

  beforeEach(() => {
    // URLをクリア
    window.history.replaceState({}, '', window.location.pathname);
  });

  describe('createShareUrl', () => {
    it('ゲートとワイヤーから共有URLを生成できる', async () => {
      const result = await CircuitShareService.createShareUrl(mockGates, mockWires, {
        name: 'テスト回路',
        description: 'これはテスト用の回路です',
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
      expect(result.url).toContain('?circuit=');
    });

    it('空の回路でも共有URLを生成できる', async () => {
      const result = await CircuitShareService.createShareUrl([], []);

      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
    });

    it('URLの最大長を超える場合はカスタムゲート定義を除外する', async () => {
      // 大きなカスタムゲート定義を持つゲートを作成
      const largeCustomGate: Gate = {
        id: 'custom1',
        type: 'CUSTOM',
        position: { x: 300, y: 300 },
        inputs: [],
        output: false,
        customGateDefinition: {
          id: 'large-custom',
          name: 'LargeCustom',
          inputs: Array(100).fill(null).map((_, i) => ({ name: `IN${i}`, index: i })),
          outputs: Array(100).fill(null).map((_, i) => ({ name: `OUT${i}`, index: i })),
          circuit: {
            gates: Array(100).fill(null).map((_, i) => ({
              id: `inner-gate-${i}`,
              type: 'AND' as const,
              position: { x: i * 100, y: i * 100 },
              inputs: [false, false],
              output: false,
            })),
            wires: [],
          },
          truthTable: [],
          createdAt: new Date().toISOString(),
        },
      };

      const result = await CircuitShareService.createShareUrl(
        [...mockGates, largeCustomGate],
        mockWires
      );

      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
      // URLが短縮されていることを確認
      expect(result.url!.length).toBeLessThan(2048);
    });
  });

  describe('parseShareUrl', () => {
    it('共有URLから回路データを復元できる', async () => {
      // まず共有URLを生成
      const createResult = await CircuitShareService.createShareUrl(mockGates, mockWires, {
        name: 'テスト回路',
        description: 'これはテスト用の回路です',
      });

      expect(createResult.success).toBe(true);

      // 生成されたURLを解析
      const parseResult = await CircuitShareService.parseShareUrl(createResult.url!);

      expect(parseResult.success).toBe(true);
      expect(parseResult.data).toBeTruthy();
      expect(parseResult.data!.name).toBe('テスト回路');
      expect(parseResult.data!.description).toBe('これはテスト用の回路です');
      expect(parseResult.data!.gates).toHaveLength(2);
      expect(parseResult.data!.wires).toHaveLength(1);
    });

    it('無効なURLの場合はエラーを返す', async () => {
      const result = await CircuitShareService.parseShareUrl('https://example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('破損したデータの場合はエラーを返す', async () => {
      const result = await CircuitShareService.parseShareUrl(
        'https://example.com?circuit=invalid_base64_data'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('hasShareData', () => {
    it('URLに回路データが含まれている場合はtrueを返す', () => {
      window.history.replaceState({}, '', '?circuit=test_data');
      expect(CircuitShareService.hasShareData()).toBe(true);
    });

    it('URLに回路データが含まれていない場合はfalseを返す', () => {
      window.history.replaceState({}, '', '/');
      expect(CircuitShareService.hasShareData()).toBe(false);
    });
  });

  describe('clearShareParams', () => {
    it('URLから共有パラメータを削除する', () => {
      window.history.replaceState({}, '', '?circuit=test_data&other=param');
      
      CircuitShareService.clearShareParams();
      
      expect(window.location.search).toBe('?other=param');
      expect(CircuitShareService.hasShareData()).toBe(false);
    });
  });
});