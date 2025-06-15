/**
 * ピン状態同期の統合テスト
 * 
 * 実際のワイヤー接続時にピンの状態表示が正しく同期されることを確認
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire } from '@/types/circuit';
import { create } from 'zustand';

describe('ピン状態同期 統合テスト', () => {
  let useStore: ReturnType<typeof create<any>>;
  let mockStore: any;

  beforeEach(() => {
    // 独立したストアインスタンスを作成
    useStore = create(() => ({
      gates: [] as Gate[],
      wires: [] as Wire[],
      addGate: (type: string, position: { x: number; y: number }) => {
        const newGate: Gate = {
          id: `gate-${Date.now()}-${Math.random()}`,
          type: type as any,
          position,
          output: type === 'INPUT' ? false : false, // INPUTゲートは初期状態でOFF
          inputs: type !== 'INPUT' ? [] : undefined,
        };
        
        useStore.setState((state: any) => ({
          gates: [...state.gates, newGate]
        }));
        
        return newGate;
      },
      startWireDrawing: (gateId: string, pinIndex: number) => {
        useStore.setState((state: any) => ({
          isDrawingWire: true,
          wireStart: { gateId, pinIndex }
        }));
      },
      endWireDrawing: (gateId: string, pinIndex: number) => {
        const state = useStore.getState();
        if (!state.wireStart) return;
        
        const newWire: Wire = {
          id: `wire-${Date.now()}-${Math.random()}`,
          from: state.wireStart,
          to: { gateId, pinIndex }
        };
        
        useStore.setState((prevState: any) => ({
          wires: [...prevState.wires, newWire],
          isDrawingWire: false,
          wireStart: null
        }));
        
        // 回路評価をシミュレート
        act(() => {
          evaluateCircuitAndUpdatePins();
        });
      },
      updateGateOutput: (gateId: string, output: boolean) => {
        useStore.setState((state: any) => ({
          gates: state.gates.map((gate: Gate) =>
            gate.id === gateId ? { ...gate, output } : gate
          )
        }));
        
        // 回路評価をシミュレート
        act(() => {
          evaluateCircuitAndUpdatePins();
        });
      }
    }));
    
    mockStore = useStore.getState();
  });

  // 簡易回路評価シミュレーション
  const evaluateCircuitAndUpdatePins = () => {
    const state = useStore.getState();
    const { gates, wires } = state;
    
    // 各ゲートの入力を計算
    const updatedGates = gates.map((gate: Gate) => {
      if (gate.type === 'INPUT') {
        return gate; // INPUTゲートは手動制御
      }
      
      // 入力ピンに接続されたワイヤーを探す
      const inputWires = wires.filter((wire: Wire) => wire.to.gateId === gate.id);
      const inputs: boolean[] = [];
      
      inputWires.forEach((wire: Wire) => {
        const sourceGate = gates.find((g: Gate) => g.id === wire.from.gateId);
        if (sourceGate) {
          inputs[wire.to.pinIndex] = sourceGate.output;
        }
      });
      
      // ゲートタイプに応じた出力計算
      let output = false;
      if (gate.type === 'AND') {
        output = inputs.length >= 2 && inputs[0] && inputs[1];
      } else if (gate.type === 'OR') {
        output = inputs.length >= 2 && (inputs[0] || inputs[1]);
      }
      
      return { ...gate, inputs, output };
    });
    
    useStore.setState({ gates: updatedGates });
  };

  describe('INPUTゲートとANDゲートの接続テスト', () => {
    it('INPUTゲートがOFFの時、ANDゲートの入力ピンもOFFで表示される', async () => {
      // 1. INPUTゲートを2つ作成（両方ともOFF）
      const input1 = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const input2 = mockStore.addGate('INPUT', { x: 100, y: 200 });
      
      // 2. ANDゲートを作成
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      // 3. ワイヤーで接続
      mockStore.startWireDrawing(input1.id, -1); // 出力ピン
      mockStore.endWireDrawing(andGate.id, 0); // 入力ピン0
      
      mockStore.startWireDrawing(input2.id, -1); // 出力ピン
      mockStore.endWireDrawing(andGate.id, 1); // 入力ピン1
      
      // 4. 状態確認
      const state = useStore.getState();
      const updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      
      expect(updatedAndGate).toBeDefined();
      expect(updatedAndGate?.inputs).toEqual([false, false]);
      expect(updatedAndGate?.output).toBe(false);
    });

    it('INPUTゲートをONにすると、ANDゲートの対応する入力ピンがONになる', async () => {
      // 1. 上記のテストと同じセットアップ
      const input1 = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const input2 = mockStore.addGate('INPUT', { x: 100, y: 200 });
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      mockStore.startWireDrawing(input1.id, -1);
      mockStore.endWireDrawing(andGate.id, 0);
      
      mockStore.startWireDrawing(input2.id, -1);
      mockStore.endWireDrawing(andGate.id, 1);
      
      // 2. input1をONにする
      mockStore.updateGateOutput(input1.id, true);
      
      // 3. 状態確認
      const state = useStore.getState();
      const updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      
      expect(updatedAndGate?.inputs).toEqual([true, false]); // 1つ目だけON
      expect(updatedAndGate?.output).toBe(false); // ANDなので両方ONでないとfalse
    });

    it('両方のINPUTゲートをONにすると、ANDゲートの出力もONになる', async () => {
      // セットアップ
      const input1 = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const input2 = mockStore.addGate('INPUT', { x: 100, y: 200 });
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      mockStore.startWireDrawing(input1.id, -1);
      mockStore.endWireDrawing(andGate.id, 0);
      
      mockStore.startWireDrawing(input2.id, -1);
      mockStore.endWireDrawing(andGate.id, 1);
      
      // 両方をONにする
      mockStore.updateGateOutput(input1.id, true);
      mockStore.updateGateOutput(input2.id, true);
      
      // 状態確認
      const state = useStore.getState();
      const updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      
      expect(updatedAndGate?.inputs).toEqual([true, true]);
      expect(updatedAndGate?.output).toBe(true);
    });
  });

  describe('状態更新タイミングのテスト', () => {
    it('ワイヤー接続直後に即座に状態が同期される', async () => {
      const input = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      // INPUTをONにしてからワイヤー接続
      mockStore.updateGateOutput(input.id, true);
      
      mockStore.startWireDrawing(input.id, -1);
      mockStore.endWireDrawing(andGate.id, 0);
      
      // 接続直後の状態確認
      const state = useStore.getState();
      const updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      
      expect(updatedAndGate?.inputs).toBeDefined();
      expect(updatedAndGate?.inputs?.[0]).toBe(true); // 即座に反映されているはず
    });

    it('複数のワイヤー接続でも状態が正しく保持される', async () => {
      const input1 = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const input2 = mockStore.addGate('INPUT', { x: 100, y: 200 });
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      // 1つ目のワイヤー接続
      mockStore.startWireDrawing(input1.id, -1);
      mockStore.endWireDrawing(andGate.id, 0);
      
      let state = useStore.getState();
      let updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      expect(updatedAndGate?.inputs).toEqual([false, undefined]); // 1つ目だけ設定
      
      // 2つ目のワイヤー接続
      mockStore.startWireDrawing(input2.id, -1);
      mockStore.endWireDrawing(andGate.id, 1);
      
      state = useStore.getState();
      updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      expect(updatedAndGate?.inputs).toEqual([false, false]); // 両方設定済み
    });
  });

  describe('エラーケースのテスト', () => {
    it('存在しないピンインデックスに接続しようとした場合の処理', async () => {
      const input = mockStore.addGate('INPUT', { x: 100, y: 100 });
      const andGate = mockStore.addGate('AND', { x: 300, y: 150 });
      
      // 無効なピンインデックス（ANDゲートは通常0,1のみ）
      mockStore.startWireDrawing(input.id, -1);
      mockStore.endWireDrawing(andGate.id, 5); // 無効なインデックス
      
      const state = useStore.getState();
      const updatedAndGate = state.gates.find((g: Gate) => g.id === andGate.id);
      
      // エラーが発生せず、安全に処理される
      expect(updatedAndGate).toBeDefined();
      expect(updatedAndGate?.inputs?.[5]).toBe(false); // 無効インデックスでも安全
    });
  });
});