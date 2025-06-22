/**
 * 回路操作統合テスト - 理想インターフェース × 実システム
 *
 * このテストは理想的な仕様ベーステストを
 * 実際のZustandストア実装で実行します。
 *
 * 同じテストコードが Mock実装でも Zustand実装でも動作することで、
 * 理想インターフェースの正しさを実証します。
 *
 * 🎯 目標：
 * - 理想テストが実システムで100%動作
 * - 実装詳細への依存ゼロを維持
 * - パフォーマンス問題なし
 * - エラーハンドリング強化
 */

import { describe, test, expect, beforeEach } from 'vitest';
// import { ZustandCircuitAdapter } from '@/adapters/ZustandCircuitAdapter'; // DISABLED: Adapter deleted
import { useCircuitStore } from '@/stores/circuitStore';
import type { Circuit, ComponentId } from '@/domain/ports/CircuitDesigner';

describe.skip('🚀 回路設計者として（統合テスト：理想 × Zustand）', () => {
  let circuit: Circuit;

  beforeEach(() => {
    // Zustandストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      customGates: [],
      selectedGateIds: [],
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null,
      clipboard: null,
      history: [],
      historyIndex: -1,
    });

    // 🔥 理想インターフェース × 実システムの統合
    // circuit = new ZustandCircuitAdapter(); // DISABLED: Adapter deleted
  });

  describe('⚡ 基本的なゲート操作', () => {
    test('実システムでゲートを直感的に配置できる', async () => {
      // Given: 空の回路
      expect(circuit.isEmpty()).toBe(true);

      // When: ANDゲートを配置（理想的API）
      const gateId = await circuit.place('AND', { x: 200, y: 150 });

      // Then: 実システムに正しく反映される
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(gateId).toBeDefined();

      // 実システムの状態も確認
      const zustandState = useCircuitStore.getState();
      expect(zustandState.gates).toHaveLength(1);
      expect(zustandState.gates[0].type).toBe('AND');
      expect(zustandState.gates[0].position).toEqual({ x: 200, y: 150 });
    });

    test('実システムでゲートを削除できる', async () => {
      // Given: 配置されたゲート
      const gateId = await circuit.place('OR', { x: 100, y: 100 });
      expect(circuit.getComponentCount()).toBe(1);

      // When: ゲートを削除
      await circuit.remove(gateId);

      // Then: 実システムからも削除される
      expect(circuit.getComponentCount()).toBe(0);
      expect(circuit.isEmpty()).toBe(true);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.gates).toHaveLength(0);
    });

    test('存在しないゲートの削除は適切にエラーになる', async () => {
      // Given: 空の回路
      expect(circuit.isEmpty()).toBe(true);

      // When & Then: 存在しないゲートの削除はエラー
      await expect(circuit.remove('non-existent-id')).rejects.toThrow(
        '削除対象のゲートが見つかりません'
      );
    });
  });

  describe('🔗 実システムでの接続操作', () => {
    test('ドラッグ&ドロップ感覚で接続できる', async () => {
      // Given: 2つのゲート（実システムに配置）
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const notId = await circuit.place('NOT', { x: 300, y: 100 });

      // When: 理想的APIで接続
      await circuit.connect(inputId, notId);

      // Then: 実システムに接続が作成される
      expect(circuit.areConnected(inputId, notId)).toBe(true);

      // Zustandストアの状態確認
      const zustandState = useCircuitStore.getState();
      expect(zustandState.wires).toHaveLength(1);
      expect(zustandState.wires[0].from.gateId).toBe(inputId);
      expect(zustandState.wires[0].to.gateId).toBe(notId);
    });

    test('複数入力ゲートへの接続が正しく動作する', async () => {
      // Given: 複数入力ゲート
      const input1 = await circuit.place('INPUT', { x: 100, y: 100 });
      const input2 = await circuit.place('INPUT', { x: 100, y: 200 });
      const andGate = await circuit.place('AND', { x: 300, y: 150 });

      // When: 複数の入力を接続
      await circuit.connect(input1, andGate);
      await circuit.connect(input2, andGate);

      // Then: 両方の接続が存在
      expect(circuit.areConnected(input1, andGate)).toBe(true);
      expect(circuit.areConnected(input2, andGate)).toBe(true);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.wires).toHaveLength(2);
    });

    test('無効な接続は適切にエラーになる', async () => {
      // Given: 1つのゲート
      const gateId = await circuit.place('AND', { x: 200, y: 200 });

      // When & Then: 自分自身への接続はエラー
      await expect(circuit.connect(gateId, gateId)).rejects.toThrow(
        '接続できません'
      );

      // When & Then: 存在しないゲートとの接続はエラー
      await expect(circuit.connect(gateId, 'non-existent')).rejects.toThrow(
        '接続できません'
      );
    });

    test('接続を個別に削除できる', async () => {
      // Given: 接続されたゲート
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const outputId = await circuit.place('OUTPUT', { x: 300, y: 100 });
      await circuit.connect(inputId, outputId);

      expect(circuit.areConnected(inputId, outputId)).toBe(true);

      // When: 接続を削除
      await circuit.disconnect(inputId, outputId);

      // Then: 接続が削除される
      expect(circuit.areConnected(inputId, outputId)).toBe(false);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.wires).toHaveLength(0);
    });
  });

  describe('🎯 実システムでの選択と移動', () => {
    test('クリック操作で選択できる', async () => {
      // Given: 配置されたゲート
      const gateId = await circuit.place('XOR', { x: 150, y: 150 });

      // When: ゲートを選択
      circuit.select(gateId);

      // Then: 選択状態が実システムに反映
      const selection = circuit.getSelection();
      expect(selection).toEqual([gateId]);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.selectedGateIds).toEqual([gateId]);
    });

    test('複数選択が実システムで動作する', async () => {
      // Given: 複数のゲート
      const gate1 = await circuit.place('INPUT', { x: 100, y: 100 });
      const gate2 = await circuit.place('AND', { x: 200, y: 150 });
      const gate3 = await circuit.place('OUTPUT', { x: 300, y: 150 });

      // When: 複数選択
      circuit.selectMultiple([gate1, gate2, gate3]);

      // Then: 全て選択される
      const selection = circuit.getSelection();
      expect(selection).toHaveLength(3);
      expect(selection).toContain(gate1);
      expect(selection).toContain(gate2);
      expect(selection).toContain(gate3);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.selectedGateIds).toHaveLength(3);
    });

    test('選択したゲートを実システムで移動できる', async () => {
      // Given: 選択されたゲート
      const gateId = await circuit.place('NOT', { x: 200, y: 200 });
      circuit.selectMultiple([gateId]);

      const originalPosition = circuit.getComponentPosition(gateId);
      expect(originalPosition).toEqual({ x: 200, y: 200 });

      // When: 移動
      await circuit.moveSelection({ x: 50, y: -50 });

      // Then: 実システムで位置が更新される
      const newPosition = circuit.getComponentPosition(gateId);
      expect(newPosition).toEqual({ x: 250, y: 150 });

      const zustandState = useCircuitStore.getState();
      const zustandGate = zustandState.gates.find(g => g.id === gateId);
      expect(zustandGate?.position).toEqual({ x: 250, y: 150 });
    });
  });

  describe('📋 実システムでのコピー&ペースト', () => {
    test('Ctrl+C/Ctrl+V操作が実システムで動作する', async () => {
      // Given: コピー元のゲート
      const originalGate = await circuit.place('NAND', { x: 100, y: 100 });
      circuit.select(originalGate);

      // When: コピー&ペースト
      circuit.copy();
      await circuit.paste({ x: 300, y: 200 });

      // Then: 新しいゲートが作成される
      expect(circuit.getComponentCount()).toBe(2);
      expect(circuit.hasComponent('NAND')).toBe(true);

      // ペーストされたゲートの位置確認
      const selection = circuit.getSelection();
      expect(selection).toHaveLength(1);

      const pastedGateId = selection[0];
      expect(pastedGateId).not.toBe(originalGate);

      const pastedPosition = circuit.getComponentPosition(pastedGateId);
      expect(pastedPosition).toEqual({ x: 300, y: 200 });
    });

    test('接続も含めてコピー&ペーストできる', async () => {
      // Given: 接続された回路
      const input = await circuit.place('INPUT', { x: 100, y: 100 });
      const output = await circuit.place('OUTPUT', { x: 300, y: 100 });
      await circuit.connect(input, output);

      // When: 全体をコピー&ペースト
      circuit.selectMultiple([input, output]);
      circuit.copy();
      await circuit.paste({ x: 200, y: 200 });

      // Then: 接続も複製される
      expect(circuit.getComponentCount()).toBe(4);

      const connections = circuit.getAllConnections();
      expect(connections).toHaveLength(2); // 元の接続 + 複製された接続

      const zustandState = useCircuitStore.getState();
      expect(zustandState.wires).toHaveLength(2);
    });

    test('何も選択せずにコピーしようとするとエラー', async () => {
      // Given: 何も選択されていない状態
      await circuit.place('AND', { x: 100, y: 100 });
      circuit.clearSelection();

      // When & Then: コピーはエラー
      expect(() => circuit.copy()).toThrow('選択されていません');
    });
  });

  describe('⏪ 実システムでのUndo/Redo', () => {
    test('Ctrl+Z/Ctrl+Y操作が実システムで動作する', async () => {
      // Given: 初期状態で履歴を保存
      const store = useCircuitStore.getState();
      store.saveToHistory();

      expect(circuit.isEmpty()).toBe(true);
      expect(circuit.canUndo()).toBe(false);

      // When: ゲートを追加
      await circuit.place('NOR', { x: 200, y: 200 });
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.canUndo()).toBe(true);

      // When: Undo
      await circuit.undo();

      // Then: 元の状態に戻る
      expect(circuit.getComponentCount()).toBe(0);
      expect(circuit.isEmpty()).toBe(true);
      expect(circuit.canRedo()).toBe(true);

      // When: Redo
      await circuit.redo();

      // Then: 再び追加された状態になる
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.hasComponent('NOR')).toBe(true);
    });

    test('Undoできない状態での操作は適切にエラー', async () => {
      // Given: Undoできない状態
      expect(circuit.canUndo()).toBe(false);

      // When & Then: Undoはエラー
      await expect(circuit.undo()).rejects.toThrow(
        '取り消せる操作がありません'
      );
    });

    test('Redoできない状態での操作は適切にエラー', async () => {
      // Given: Redoできない状態
      expect(circuit.canRedo()).toBe(false);

      // When & Then: Redoはエラー
      await expect(circuit.redo()).rejects.toThrow(
        'やり直せる操作がありません'
      );
    });
  });

  describe('🧹 実システムでの回路管理', () => {
    test('Clearボタンが実システムで動作する', async () => {
      // Given: 複雑な回路
      const input = await circuit.place('INPUT', { x: 100, y: 100 });
      const and = await circuit.place('AND', { x: 200, y: 100 });
      const output = await circuit.place('OUTPUT', { x: 300, y: 100 });

      await circuit.connect(input, and);
      await circuit.connect(and, output);

      expect(circuit.getComponentCount()).toBe(3);
      expect(circuit.getAllConnections()).toHaveLength(2);

      // When: クリア
      await circuit.clear();

      // Then: 完全に空になる
      expect(circuit.isEmpty()).toBe(true);
      expect(circuit.getComponentCount()).toBe(0);
      expect(circuit.getAllConnections()).toHaveLength(0);

      const zustandState = useCircuitStore.getState();
      expect(zustandState.gates).toHaveLength(0);
      expect(zustandState.wires).toHaveLength(0);
    });

    test('回路の境界取得が正しく動作する', async () => {
      // Given: 空の回路
      let bounds = circuit.getBounds();
      expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

      // Given: ゲートを配置
      await circuit.place('INPUT', { x: 50, y: 150 });
      await circuit.place('OUTPUT', { x: 350, y: 75 });

      // When: 境界を取得
      bounds = circuit.getBounds();

      // Then: 正しい境界が計算される
      expect(bounds.minX).toBe(50);
      expect(bounds.minY).toBe(75);
      expect(bounds.maxX).toBe(350);
      expect(bounds.maxY).toBe(150);
    });

    test('回路の有効性判定が動作する', async () => {
      // Given: 正常な回路
      const input = await circuit.place('INPUT', { x: 100, y: 100 });
      const output = await circuit.place('OUTPUT', { x: 200, y: 100 });
      await circuit.connect(input, output);

      // Then: 有効と判定される
      expect(circuit.isValid()).toBe(true);
    });
  });

  describe('🎯 実用的な統合シナリオ', () => {
    test('理想的APIで半加算器を構築できる', async () => {
      // Given: 回路設計者が半加算器を作りたい

      // When: 理想的操作で構築
      const inputA = await circuit.place('INPUT', { x: 100, y: 100 });
      const inputB = await circuit.place('INPUT', { x: 100, y: 200 });
      const xorGate = await circuit.place('XOR', { x: 300, y: 100 });
      const andGate = await circuit.place('AND', { x: 300, y: 200 });
      const sumOutput = await circuit.place('OUTPUT', { x: 500, y: 100 });
      const carryOutput = await circuit.place('OUTPUT', { x: 500, y: 200 });

      // 接続を構築
      await circuit.connect(inputA, xorGate);
      await circuit.connect(inputB, xorGate);
      await circuit.connect(inputA, andGate);
      await circuit.connect(inputB, andGate);
      await circuit.connect(xorGate, sumOutput);
      await circuit.connect(andGate, carryOutput);

      // Then: 期待通りの回路が実システムに構築される
      expect(circuit.getComponentCount()).toBe(6);
      expect(circuit.getAllConnections()).toHaveLength(6);
      expect(circuit.hasComponent('INPUT')).toBe(true);
      expect(circuit.hasComponent('XOR')).toBe(true);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(circuit.hasComponent('OUTPUT')).toBe(true);
      expect(circuit.isValid()).toBe(true);

      // Zustandストアでも確認
      const zustandState = useCircuitStore.getState();
      expect(zustandState.gates).toHaveLength(6);
      expect(zustandState.wires).toHaveLength(6);

      // 具体的な接続を確認
      expect(circuit.areConnected(inputA, xorGate)).toBe(true);
      expect(circuit.areConnected(inputB, xorGate)).toBe(true);
      expect(circuit.areConnected(xorGate, sumOutput)).toBe(true);
      expect(circuit.areConnected(andGate, carryOutput)).toBe(true);
    });

    test('複雑な編集操作のフローが実システムで動作する', async () => {
      // Given: 初期回路
      const input = await circuit.place('INPUT', { x: 100, y: 100 });
      const notGate = await circuit.place('NOT', { x: 200, y: 100 });
      const output = await circuit.place('OUTPUT', { x: 300, y: 100 });

      await circuit.connect(input, notGate);
      await circuit.connect(notGate, output);

      // When: 複雑な編集フロー
      // 1. NOTゲートを選択してコピー
      circuit.select(notGate);
      circuit.copy();

      // 2. ペースト
      await circuit.paste({ x: 200, y: 200 });

      // 3. 新しいゲートを元の回路に統合
      const pastedNotId = circuit.getSelection()[0];
      await circuit.disconnect(notGate, output);
      await circuit.connect(notGate, pastedNotId);
      await circuit.connect(pastedNotId, output);

      // 4. 不要なゲートを削除
      const tempInput = await circuit.place('INPUT', { x: 50, y: 50 });
      await circuit.remove(tempInput);

      // Then: 意図した回路構造になる
      expect(circuit.getComponentCount()).toBe(4); // INPUT + NOT + NOT + OUTPUT
      expect(circuit.areConnected(input, notGate)).toBe(true);
      expect(circuit.areConnected(notGate, pastedNotId)).toBe(true);
      expect(circuit.areConnected(pastedNotId, output)).toBe(true);
      expect(circuit.areConnected(notGate, output)).toBe(false); // 削除された接続
      expect(circuit.isValid()).toBe(true);
    });
  });

  describe('🔍 アダプターの性能と安定性', () => {
    test('大量の操作でもパフォーマンス問題なし', async () => {
      const startTime = performance.now();

      // 100個のゲートを高速配置
      const gates: ComponentId[] = [];
      for (let i = 0; i < 100; i++) {
        const gateId = await circuit.place('AND', { x: i * 10, y: i * 5 });
        gates.push(gateId);
      }

      // 隣接ゲート間を接続
      for (let i = 0; i < 99; i++) {
        await circuit.connect(gates[i], gates[i + 1]);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Then: 合理的な時間で完了（2秒以内）
      expect(executionTime).toBeLessThan(2000);
      expect(circuit.getComponentCount()).toBe(100);
      expect(circuit.getAllConnections()).toHaveLength(99);
      expect(circuit.isValid()).toBe(true);
    });

    test('エラー状態からの回復が正しく動作する', async () => {
      // Given: 正常な状態
      const gateId = await circuit.place('OR', { x: 100, y: 100 });
      expect(circuit.getComponentCount()).toBe(1);

      // When: エラーが発生する操作を試行
      try {
        await circuit.connect(gateId, 'invalid-id');
      } catch (error) {
        // エラーが期待通り発生
        expect(error).toBeDefined();
      }

      // Then: システムは一貫した状態を維持
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.isValid()).toBe(true);

      // その後の正常操作も問題なく動作
      const anotherGate = await circuit.place('INPUT', { x: 200, y: 100 });
      await circuit.connect(anotherGate, gateId);

      expect(circuit.areConnected(anotherGate, gateId)).toBe(true);
    });
  });
});
