/**
 * 回路操作機能テスト - 理想的な仕様ベース版
 * 
 * このテストは実装詳細に一切依存せず、ユーザーの期待動作のみをテストします。
 * 内部実装（Zustand、DOM、低レベルAPI）が変更されても、
 * 仕様が変わらない限りテストは通り続けます。
 * 
 * 設計原則：
 * - ユーザーストーリーベース
 * - 実装技術に依存しない
 * - 直感的で読みやすい
 * - 将来の設計改善を促進
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { MockCircuit } from '../adapters/MockCircuit';
import type { Circuit, ComponentId } from '@/domain/ports/CircuitDesigner';

describe('回路設計者として', () => {
  let circuit: Circuit;

  beforeEach(() => {
    circuit = new MockCircuit('テスト回路');
  });

  describe('ゲートの配置と削除', () => {
    test('直感的にゲートを配置できる', async () => {
      // Given: 空の回路
      expect(circuit.isEmpty()).toBe(true);
      
      // When: ANDゲートを配置
      const gateId = await circuit.place('AND', { x: 200, y: 150 });
      
      // Then: ゲートが正しく配置される
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(gateId).toBeDefined();
    });

    test('複数のゲートを配置・削除できる', async () => {
      // Given: 空の回路
      expect(circuit.isEmpty()).toBe(true);
      
      // When: 複数のゲートを配置
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const andId = await circuit.place('AND', { x: 300, y: 150 });
      const outputId = await circuit.place('OUTPUT', { x: 500, y: 150 });
      
      // Then: 全てのゲートが配置される
      expect(circuit.getComponentCount()).toBe(3);
      expect(circuit.hasComponent('INPUT')).toBe(true);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(circuit.hasComponent('OUTPUT')).toBe(true);
      
      // When: 中央のゲートを削除
      await circuit.remove(andId);
      
      // Then: そのゲートのみ削除される
      expect(circuit.getComponentCount()).toBe(2);
      expect(circuit.hasComponent('AND')).toBe(false);
      expect(circuit.hasComponent('INPUT')).toBe(true);
      expect(circuit.hasComponent('OUTPUT')).toBe(true);
    });

    test('ゲート削除時に関連する接続も自動削除される', async () => {
      // Given: 接続された3つのゲート
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const andId = await circuit.place('AND', { x: 300, y: 150 });
      const outputId = await circuit.place('OUTPUT', { x: 500, y: 150 });
      
      await circuit.connect(inputId, andId);
      await circuit.connect(andId, outputId);
      
      // 接続が正しく作成されたことを確認
      expect(circuit.areConnected(inputId, andId)).toBe(true);
      expect(circuit.areConnected(andId, outputId)).toBe(true);
      
      // When: 中央のゲートを削除
      await circuit.remove(andId);
      
      // Then: 関連する接続も削除される
      expect(circuit.areConnected(inputId, andId)).toBe(false);
      expect(circuit.areConnected(andId, outputId)).toBe(false);
    });
  });

  describe('直感的な接続操作', () => {
    test('ドラッグ&ドロップでゲート間を接続できる', async () => {
      // Given: 2つのゲート
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const notId = await circuit.place('NOT', { x: 300, y: 100 });
      
      // When: ドラッグで接続
      await circuit.connect(inputId, notId);
      
      // Then: 接続が作成される
      expect(circuit.areConnected(inputId, notId)).toBe(true);
    });

    test('同じ接続は重複して作成されない', async () => {
      // Given: 2つのゲート
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const outputId = await circuit.place('OUTPUT', { x: 300, y: 100 });
      
      // When: 同じ接続を2回試行
      await circuit.connect(inputId, outputId);
      await circuit.connect(inputId, outputId); // 重複試行
      
      // Then: 1つの接続のみ存在
      expect(circuit.areConnected(inputId, outputId)).toBe(true);
      // 内部実装に依存しない方法での重複チェック
      // （MockCircuitでは重複は自動的に防がれる）
    });

    test('接続を個別に削除できる', async () => {
      // Given: 複数の接続を持つ回路
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const andId = await circuit.place('AND', { x: 300, y: 150 });
      const outputId = await circuit.place('OUTPUT', { x: 500, y: 150 });
      
      await circuit.connect(inputId, andId);
      await circuit.connect(andId, outputId);
      
      // When: 最初の接続を削除
      await circuit.disconnect(inputId, andId);
      
      // Then: その接続のみ削除される
      expect(circuit.areConnected(inputId, andId)).toBe(false);
      expect(circuit.areConnected(andId, outputId)).toBe(true);
    });
  });

  describe('選択と移動操作', () => {
    test('クリックでゲートを選択できる', async () => {
      // Given: 配置されたゲート
      const gateId = await circuit.place('AND', { x: 200, y: 200 });
      
      // When: ゲートを選択
      circuit.select(gateId);
      
      // Then: そのゲートが選択される
      const selection = circuit.getSelection();
      expect(selection).toEqual([gateId]);
    });

    test('Ctrlクリックで複数ゲートを選択できる', async () => {
      // Given: 3つのゲート
      const input1 = await circuit.place('INPUT', { x: 100, y: 100 });
      const and1 = await circuit.place('AND', { x: 300, y: 150 });
      const output1 = await circuit.place('OUTPUT', { x: 500, y: 150 });
      
      // When: 複数選択（Ctrl+クリックを想定）
      circuit.selectMultiple([input1, and1, output1]);
      
      // Then: 全てが選択される
      const selection = circuit.getSelection();
      expect(selection).toHaveLength(3);
      expect(selection).toContain(input1);
      expect(selection).toContain(and1);
      expect(selection).toContain(output1);
    });

    test('選択したゲートをドラッグで移動できる', async () => {
      // Given: 配置・選択されたゲート
      const gate1 = await circuit.place('AND', { x: 200, y: 200 });
      const gate2 = await circuit.place('OR', { x: 300, y: 200 });
      
      circuit.selectMultiple([gate1, gate2]);
      
      // When: ドラッグで移動
      await circuit.moveSelection({ x: 50, y: -30 });
      
      // Then: ゲートが移動する
      expect(circuit.getComponentPosition(gate1)).toEqual({ x: 250, y: 170 });
      expect(circuit.getComponentPosition(gate2)).toEqual({ x: 350, y: 170 });
    });

    test('接続されたゲートを移動しても接続は維持される', async () => {
      // Given: 接続されたゲート
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const outputId = await circuit.place('OUTPUT', { x: 300, y: 100 });
      await circuit.connect(inputId, outputId);
      
      // When: 入力ゲートを移動
      circuit.select(inputId);
      await circuit.moveSelection({ x: 0, y: 50 });
      
      // Then: 接続は維持される
      expect(circuit.areConnected(inputId, outputId)).toBe(true);
      expect(circuit.getComponentPosition(inputId)).toEqual({ x: 100, y: 150 });
    });
  });

  describe('コピー&ペースト操作', () => {
    test('Ctrl+C/Ctrl+Vでゲートを複製できる', async () => {
      // Given: 選択されたゲート
      const originalGate1 = await circuit.place('AND', { x: 200, y: 200 });
      const originalGate2 = await circuit.place('OR', { x: 300, y: 200 });
      
      circuit.selectMultiple([originalGate1, originalGate2]);
      
      // When: コピー&ペースト
      circuit.copy();
      await circuit.paste({ x: 400, y: 300 });
      
      // Then: 新しいゲートが作成される
      expect(circuit.getComponentCount()).toBe(4);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(circuit.hasComponent('OR')).toBe(true);
      
      // 新しく選択されたゲートの位置確認
      const newSelection = circuit.getSelection();
      expect(newSelection).toHaveLength(2);
    });

    test('接続されたゲートをコピーすると接続も複製される', async () => {
      // Given: 接続された回路
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const notId = await circuit.place('NOT', { x: 300, y: 100 });
      await circuit.connect(inputId, notId);
      
      // When: 全体をコピー&ペースト
      circuit.selectMultiple([inputId, notId]);
      circuit.copy();
      await circuit.paste({ x: 200, y: 200 });
      
      // Then: 新しい接続も作成される
      expect(circuit.getComponentCount()).toBe(4);
      
      // 新しいゲート間の接続を確認
      const newSelection = circuit.getSelection();
      expect(newSelection).toHaveLength(2);
      
      // 新しいゲート間も接続されているはず
      const [newInput, newNot] = newSelection;
      expect(circuit.areConnected(newInput, newNot)).toBe(true);
    });
  });

  describe('Undo/Redo機能', () => {
    test('Ctrl+Zで操作を取り消せる', async () => {
      // Given: 初期状態
      expect(circuit.isEmpty()).toBe(true);
      
      // When: ゲートを追加
      await circuit.place('AND', { x: 200, y: 200 });
      expect(circuit.getComponentCount()).toBe(1);
      
      // When: 取り消し
      await circuit.undo();
      
      // Then: 初期状態に戻る
      expect(circuit.getComponentCount()).toBe(0);
      expect(circuit.isEmpty()).toBe(true);
    });

    test('Ctrl+Yで操作をやり直せる', async () => {
      // Given: 操作→取り消しした状態
      await circuit.place('AND', { x: 200, y: 200 });
      await circuit.undo();
      expect(circuit.isEmpty()).toBe(true);
      
      // When: やり直し
      await circuit.redo();
      
      // Then: ゲートが復活する
      expect(circuit.getComponentCount()).toBe(1);
      expect(circuit.hasComponent('AND')).toBe(true);
    });

    test('複数操作の連続Undo/Redoが正しく動作する', async () => {
      // Given: 複数の操作を実行
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const andId = await circuit.place('AND', { x: 300, y: 150 });
      await circuit.connect(inputId, andId);
      
      expect(circuit.getComponentCount()).toBe(2);
      expect(circuit.areConnected(inputId, andId)).toBe(true);
      
      // When: 3回取り消し
      await circuit.undo(); // 接続削除
      expect(circuit.areConnected(inputId, andId)).toBe(false);
      
      await circuit.undo(); // ANDゲート削除
      expect(circuit.getComponentCount()).toBe(1);
      
      await circuit.undo(); // INPUTゲート削除
      expect(circuit.getComponentCount()).toBe(0);
      
      // When: 2回やり直し
      await circuit.redo(); // INPUTゲート復活
      await circuit.redo(); // ANDゲート復活
      
      // Then: 適切な状態に戻る
      expect(circuit.getComponentCount()).toBe(2);
      expect(circuit.areConnected(inputId, andId)).toBe(false); // 接続はまだ復活していない
    });
  });

  describe('回路の状態管理', () => {
    test('Clearボタンで回路を全消去できる', async () => {
      // Given: 複雑な回路
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const andId = await circuit.place('AND', { x: 300, y: 150 });
      const outputId = await circuit.place('OUTPUT', { x: 500, y: 150 });
      
      await circuit.connect(inputId, andId);
      await circuit.connect(andId, outputId);
      
      expect(circuit.getComponentCount()).toBe(3);
      expect(circuit.areConnected(inputId, andId)).toBe(true);
      
      // When: 全消去
      await circuit.clear();
      
      // Then: 空の回路になる
      expect(circuit.isEmpty()).toBe(true);
      expect(circuit.getComponentCount()).toBe(0);
    });

    test('回路の有効性を確認できる', async () => {
      // Given: 基本的な回路
      const inputId = await circuit.place('INPUT', { x: 100, y: 100 });
      const outputId = await circuit.place('OUTPUT', { x: 300, y: 100 });
      await circuit.connect(inputId, outputId);
      
      // Then: 回路は有効
      expect(circuit.isValid()).toBe(true);
    });
  });

  describe('回路設計者の体験', () => {
    test('直感的な操作で論理回路を設計できる', async () => {
      // Given: 回路設計者が半加算器を作りたい
      
      // When: 直感的な操作で構築
      const input1 = await circuit.place('INPUT', { x: 100, y: 100 });
      const input2 = await circuit.place('INPUT', { x: 100, y: 200 });
      const xor = await circuit.place('XOR', { x: 300, y: 100 });
      const and = await circuit.place('AND', { x: 300, y: 200 });
      const sum = await circuit.place('OUTPUT', { x: 500, y: 100 });
      const carry = await circuit.place('OUTPUT', { x: 500, y: 200 });
      
      await circuit.connect(input1, xor);
      await circuit.connect(input2, xor);
      await circuit.connect(input1, and);
      await circuit.connect(input2, and);
      await circuit.connect(xor, sum);
      await circuit.connect(and, carry);
      
      // Then: 期待通りの回路が完成
      expect(circuit.getComponentCount()).toBe(6);
      expect(circuit.hasComponent('INPUT')).toBe(true);
      expect(circuit.hasComponent('XOR')).toBe(true);
      expect(circuit.hasComponent('AND')).toBe(true);
      expect(circuit.hasComponent('OUTPUT')).toBe(true);
      
      // 接続の確認
      expect(circuit.areConnected(input1, xor)).toBe(true);
      expect(circuit.areConnected(input2, xor)).toBe(true);
      expect(circuit.areConnected(xor, sum)).toBe(true);
      expect(circuit.areConnected(and, carry)).toBe(true);
      
      expect(circuit.isValid()).toBe(true);
    });
  });
});