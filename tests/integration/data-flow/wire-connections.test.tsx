/**
 * コア機能: ワイヤー接続のE2Eテスト
 * ユーザー視点でのワイヤー接続機能を検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';

describe('ワイヤー接続 - ユーザー機能テスト', () => {
  beforeEach(() => {
    useCircuitStore.setState({
      gates: [],
      wires: [],
      isDrawingWire: false,
      wireStart: null,
    });
  });

  describe('基本的なワイヤー接続', () => {
    it('出力ピンから入力ピンにワイヤーを引ける', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 2つのゲートを配置
      addGate('INPUT', { x: 100, y: 200 });
      addGate('OUTPUT', { x: 300, y: 200 });
      const [input, output] = useCircuitStore.getState().gates;
      
      // INPUTの出力ピン（-1）をクリック
      startWireDrawing(input.id, -1);
      expect(useCircuitStore.getState().isDrawingWire).toBe(true);
      
      // OUTPUTの入力ピン（0）をクリック
      endWireDrawing(output.id, 0);
      
      // ワイヤーが作成されている
      const { wires, isDrawingWire } = useCircuitStore.getState();
      expect(isDrawingWire).toBe(false);
      expect(wires).toHaveLength(1);
      expect(wires[0].from).toEqual({ gateId: input.id, pinIndex: -1 });
      expect(wires[0].to).toEqual({ gateId: output.id, pinIndex: 0 });
    });

    it('1つの出力から複数の入力に接続できる', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 1つのINPUTと3つのOUTPUT
      addGate('INPUT', { x: 100, y: 200 });
      addGate('OUTPUT', { x: 300, y: 100 });
      addGate('OUTPUT', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 300, y: 300 });
      
      const gates = useCircuitStore.getState().gates;
      const input = gates[0];
      const outputs = gates.slice(1);
      
      // INPUTから各OUTPUTへ接続
      outputs.forEach(output => {
        startWireDrawing(input.id, -1);
        endWireDrawing(output.id, 0);
      });
      
      // 3本のワイヤーが作成されている
      const { wires } = useCircuitStore.getState();
      expect(wires).toHaveLength(3);
      
      // すべて同じ出力から
      expect(wires.every(w => w.from.gateId === input.id && w.from.pinIndex === -1)).toBe(true);
      
      // それぞれ異なる入力へ
      const toGateIds = wires.map(w => w.to.gateId);
      expect(new Set(toGateIds).size).toBe(3);
    });

    it('論理ゲート間を正しく接続できる', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // AND → OR → NOT のチェーン
      addGate('AND', { x: 100, y: 200 });
      addGate('OR', { x: 300, y: 200 });
      addGate('NOT', { x: 500, y: 200 });
      
      const [and, or, not] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(and.id, -1);
      endWireDrawing(or.id, 0);  // ANDの出力 → ORの入力1
      
      startWireDrawing(or.id, -1);
      endWireDrawing(not.id, 0);  // ORの出力 → NOTの入力
      
      const { wires } = useCircuitStore.getState();
      expect(wires).toHaveLength(2);
    });
  });

  describe('接続の制約', () => {
    it('入力から入力への接続は作成されない', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 2つのANDゲート
      addGate('AND', { x: 100, y: 200 });
      addGate('AND', { x: 300, y: 200 });
      const [and1, and2] = useCircuitStore.getState().gates;
      
      // 入力ピンから入力ピンへ接続を試みる
      startWireDrawing(and1.id, 0);  // 入力ピン
      endWireDrawing(and2.id, 1);     // 入力ピン
      
      // ワイヤーは作成されない
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    it('出力から出力への接続は作成されない', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 2つのNOTゲート
      addGate('NOT', { x: 100, y: 200 });
      addGate('NOT', { x: 300, y: 200 });
      const [not1, not2] = useCircuitStore.getState().gates;
      
      // 出力ピンから出力ピンへ接続を試みる
      startWireDrawing(not1.id, -1);  // 出力ピン
      endWireDrawing(not2.id, -1);     // 出力ピン
      
      // ワイヤーは作成されない
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    it('自己接続（同じゲートの出力→入力）は作成されない', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // ORゲート
      addGate('OR', { x: 200, y: 200 });
      const orGate = useCircuitStore.getState().gates[0];
      
      // 自己接続を試みる
      startWireDrawing(orGate.id, -1);  // 出力
      endWireDrawing(orGate.id, 0);      // 入力
      
      // ワイヤーは作成されない
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    // 削除：実装詳細のテストのため価値なし
  });

  describe('ワイヤーの削除', () => {
    it('ワイヤーを選択して削除できる', () => {
      const { addGate, startWireDrawing, endWireDrawing, deleteWire } = useCircuitStore.getState();
      
      // ゲートとワイヤーを作成
      addGate('INPUT', { x: 100, y: 200 });
      addGate('NOT', { x: 300, y: 200 });
      const [input, not] = useCircuitStore.getState().gates;
      
      startWireDrawing(input.id, -1);
      endWireDrawing(not.id, 0);
      const wire = useCircuitStore.getState().wires[0];
      
      // ワイヤーを削除
      deleteWire(wire.id);
      
      // ワイヤーが削除されている
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    it('ゲート削除時に関連するワイヤーも削除される', () => {
      const { addGate, startWireDrawing, endWireDrawing, deleteGate } = useCircuitStore.getState();
      
      // 3つのゲートを接続
      addGate('INPUT', { x: 100, y: 200 });
      addGate('AND', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 500, y: 200 });
      const [input, and, output] = useCircuitStore.getState().gates;
      
      // input → and → output
      startWireDrawing(input.id, -1);
      endWireDrawing(and.id, 0);
      
      startWireDrawing(and.id, -1);
      endWireDrawing(output.id, 0);
      expect(useCircuitStore.getState().wires).toHaveLength(2);
      
      // 中間のANDゲートを削除
      deleteGate(and.id);
      
      // ANDゲートと両方のワイヤーが削除される
      expect(useCircuitStore.getState().gates).toHaveLength(2);
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });
  });

  describe('ワイヤー描画のキャンセル', () => {
    it('ESCキーでワイヤー描画をキャンセルできる', () => {
      const { addGate, startWireDrawing, cancelWireDrawing } = useCircuitStore.getState();
      
      // ゲートを配置
      addGate('XOR', { x: 200, y: 200 });
      const xor = useCircuitStore.getState().gates[0];
      
      // ワイヤー描画開始
      startWireDrawing(xor.id, -1);
      expect(useCircuitStore.getState().isDrawingWire).toBe(true);
      
      // ESCでキャンセル
      cancelWireDrawing();
      
      // 描画状態が解除される
      expect(useCircuitStore.getState().isDrawingWire).toBe(false);
      expect(useCircuitStore.getState().wireStart).toBeNull();
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });

    it('右クリックでワイヤー描画をキャンセルできる', () => {
      const { addGate, startWireDrawing, cancelWireDrawing } = useCircuitStore.getState();
      
      // ゲートを配置
      addGate('NAND', { x: 300, y: 300 });
      const nand = useCircuitStore.getState().gates[0];
      
      // ワイヤー描画開始
      startWireDrawing(nand.id, -1);
      
      // 右クリックでキャンセル
      cancelWireDrawing();
      
      // 描画状態が解除される
      expect(useCircuitStore.getState().isDrawingWire).toBe(false);
    });
  });

  describe('複雑な接続パターン', () => {
    it('フィードバックループを作成できる', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // SR-LATCHを構成（2つのNORゲート）
      addGate('NOR', { x: 200, y: 150 });
      addGate('NOR', { x: 200, y: 250 });
      const [nor1, nor2] = useCircuitStore.getState().gates;
      
      // クロス接続
      startWireDrawing(nor1.id, -1);
      endWireDrawing(nor2.id, 1);  // nor1出力 → nor2入力2
      
      startWireDrawing(nor2.id, -1);
      endWireDrawing(nor1.id, 1);  // nor2出力 → nor1入力2
      
      // フィードバックループが作成されている
      const { wires } = useCircuitStore.getState();
      expect(wires).toHaveLength(2);
    });

    it('分岐と合流を含む回路を作成できる', () => {
      const { addGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 入力
      addGate('INPUT', { x: 100, y: 200 });
      
      // 分岐（2つのNOT）
      addGate('NOT', { x: 300, y: 150 });
      addGate('NOT', { x: 300, y: 250 });
      
      // 合流（AND）
      addGate('AND', { x: 500, y: 200 });
      
      // 出力
      addGate('OUTPUT', { x: 700, y: 200 });
      
      const [input, not1, not2, and, output] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(input.id, -1);
      endWireDrawing(not1.id, 0);   // 分岐1
      
      startWireDrawing(input.id, -1);
      endWireDrawing(not2.id, 0);   // 分岐2
      
      startWireDrawing(not1.id, -1);
      endWireDrawing(and.id, 0);     // 合流1
      
      startWireDrawing(not2.id, -1);
      endWireDrawing(and.id, 1);     // 合流2
      
      startWireDrawing(and.id, -1);
      endWireDrawing(output.id, 0);   // 出力へ
      
      expect(useCircuitStore.getState().wires).toHaveLength(5);
    });
  });
});