/**
 * 回路共有統合テスト - 理想インターフェース × 実システム
 *
 * このテストは理想的な仕様ベーステストを
 * 実際のCircuitShareServiceで実行します。
 *
 * 同じテストコードが Mock実装でも Service実装でも動作することで、
 * 理想インターフェースの正しさを実証します。
 *
 * 🎯 目標：
 * - 理想テストが実システムで100%動作
 * - 実装詳細への依存ゼロを維持
 * - URL生成・解析の信頼性
 * - パフォーマンス問題なし
 */

import { describe, test, expect, beforeEach } from 'vitest';
// import { ServiceCircuitSharingAdapter } from '@/adapters/ServiceCircuitSharingAdapter'; // DISABLED: Adapter deleted
import type {
  CircuitSharing,
  CircuitContent,
  ShareUrl,
} from '@/domain/ports/CircuitSharing';

describe.skip('🚀 回路共有者として（統合テスト：理想 × Service）', () => {
  let sharing: CircuitSharing;

  beforeEach(() => {
    // sharing = new ServiceCircuitSharingAdapter(); // DISABLED: Adapter deleted
  });

  describe('🔧 実システム統合動作確認', () => {
    test('実際のサービスで回路共有が動作する', async () => {
      // Given: リアルな回路データ
      const circuit: CircuitContent = {
        name: 'Real World Test Circuit',
        components: [
          { id: 'input_a', type: 'INPUT', position: { x: 50, y: 100 } },
          { id: 'input_b', type: 'INPUT', position: { x: 50, y: 200 } },
          { id: 'and_gate', type: 'AND', position: { x: 200, y: 150 } },
          { id: 'output_c', type: 'OUTPUT', position: { x: 350, y: 150 } },
        ],
        connections: [
          {
            id: 'wire_1',
            from: { componentId: 'input_a', outputIndex: 0 },
            to: { componentId: 'and_gate', inputIndex: 0 },
          },
          {
            id: 'wire_2',
            from: { componentId: 'input_b', outputIndex: 0 },
            to: { componentId: 'and_gate', inputIndex: 1 },
          },
          {
            id: 'wire_3',
            from: { componentId: 'and_gate', outputIndex: 0 },
            to: { componentId: 'output_c', inputIndex: 0 },
          },
        ],
        metadata: {
          description: 'AND gate integration test',
          author: 'Integration Tester',
        },
      };

      // When: 実際のサービスで共有
      const shareResult = await sharing.share(circuit);

      // Then: 成功する
      expect(shareResult.success).toBe(true);
      expect(shareResult.shareUrl).toBeDefined();

      // And: 復元できる
      const restoredCircuit = await sharing.load(shareResult.shareUrl!);
      expect(restoredCircuit).toBeDefined();
      expect(restoredCircuit!.name).toBe(circuit.name);
      expect(restoredCircuit!.components).toHaveLength(4);
      expect(restoredCircuit!.connections).toHaveLength(3);
    });

    test('日本語回路名でも実システムで正常動作する', async () => {
      // Given: 日本語を含む回路
      const japaneseCircuit: CircuitContent = {
        name: 'テスト用論理回路',
        components: [
          { id: 'ゲート1', type: 'AND', position: { x: 100, y: 100 } },
        ],
        connections: [],
        metadata: {
          description: '日本語説明文のテスト',
          author: '日本語ユーザー',
        },
      };

      // When: 日本語回路を共有
      const shareResult = await sharing.share(japaneseCircuit);

      // Then: 成功する
      expect(shareResult.success).toBe(true);

      const restoredCircuit = await sharing.load(shareResult.shareUrl!);
      expect(restoredCircuit!.name).toBe('テスト用論理回路');
      expect(restoredCircuit!.metadata?.description).toBe(
        '日本語説明文のテスト'
      );
    });
  });

  describe('🛡️ 実システムエラーハンドリング', () => {
    test('実システムで不正データが適切に処理される', async () => {
      // Given: 不正な回路データ
      const invalidCircuits = [
        null as any,
        { name: '', components: [], connections: [] },
        { name: 'test', components: null, connections: [] } as any,
      ];

      for (const invalidCircuit of invalidCircuits) {
        // When: 不正データを共有
        const result = await sharing.share(invalidCircuit);

        // Then: 適切にエラーハンドリング
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    test('実システムで無効URLが適切に処理される', async () => {
      // Given: 無効なURL群
      const invalidUrls = [
        'https://invalid.com/share/nonexistent' as ShareUrl,
        'malformed-url' as ShareUrl,
        '' as ShareUrl,
      ];

      for (const invalidUrl of invalidUrls) {
        // When: 無効URLから読み込み
        const circuit = await sharing.load(invalidUrl);
        const isValid = await sharing.isValidShareUrl(invalidUrl);

        // Then: 適切にnullを返す
        expect(circuit).toBeNull();
        expect(isValid).toBe(false);
      }
    });
  });

  describe('⚡ 実システムパフォーマンス', () => {
    test('大きな回路でもレスポンス時間が許容範囲内', async () => {
      // Given: 大きな回路（100コンポーネント）
      const largeCircuit: CircuitContent = {
        name: 'Performance Test Circuit',
        components: Array.from({ length: 100 }, (_, i) => ({
          id: `component_${i}`,
          type: 'AND',
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        })),
        connections: Array.from({ length: 99 }, (_, i) => ({
          id: `connection_${i}`,
          from: { componentId: `component_${i}`, outputIndex: 0 },
          to: { componentId: `component_${i + 1}`, inputIndex: 0 },
        })),
        metadata: {
          description: 'Large circuit for performance testing',
        },
      };

      // When: パフォーマンス測定
      const startTime = Date.now();
      const shareResult = await sharing.share(largeCircuit);
      const shareTime = Date.now() - startTime;

      const loadStartTime = Date.now();
      const restoredCircuit = await sharing.load(shareResult.shareUrl!);
      const loadTime = Date.now() - loadStartTime;

      // Then: 許容可能な時間内で完了
      expect(shareResult.success).toBe(true);
      expect(restoredCircuit).toBeDefined();
      expect(shareTime).toBeLessThan(5000); // 5秒以内
      expect(loadTime).toBeLessThan(5000); // 5秒以内

      // And: データ整合性を保持
      expect(restoredCircuit!.components).toHaveLength(100);
      expect(restoredCircuit!.connections).toHaveLength(99);
    });
  });

  describe('🔄 実システム統合品質確認', () => {
    test('複数回の共有・復元で一貫性を保つ', async () => {
      // Given: 基準回路
      const baseCircuit: CircuitContent = {
        name: 'Consistency Test Circuit',
        components: [
          { id: 'gate1', type: 'OR', position: { x: 100, y: 100 } },
          { id: 'gate2', type: 'NOT', position: { x: 200, y: 100 } },
        ],
        connections: [
          {
            id: 'wire1',
            from: { componentId: 'gate1', outputIndex: 0 },
            to: { componentId: 'gate2', inputIndex: 0 },
          },
        ],
        metadata: { description: 'Consistency test' },
      };

      // When: 複数回共有・復元
      const results = [];
      for (let i = 0; i < 3; i++) {
        const shareResult = await sharing.share(baseCircuit);
        const restoredCircuit = await sharing.load(shareResult.shareUrl!);
        results.push(restoredCircuit);
      }

      // Then: 全て同じ結果
      for (const result of results) {
        expect(result).toBeDefined();
        expect(result!.name).toBe(baseCircuit.name);
        expect(result!.components).toHaveLength(2);
        expect(result!.connections).toHaveLength(1);
      }
    });
  });
});
