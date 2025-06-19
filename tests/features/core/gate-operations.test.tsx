/**
 * コア機能: ゲート操作のE2Eテスト
 * ユーザー視点での基本的なゲート操作を検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';

describe('ゲート操作 - ユーザー機能テスト', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateIds: [],
      mode: 'select',
    });
  });

  describe('ゲートの配置', () => {
    it('ツールパレットからゲートをドラッグ&ドロップで配置できる', async () => {
      // ゲートを配置
      const { addGate } = useCircuitStore.getState();
      addGate('AND', { x: 300, y: 200 });
      
      // 配置されたことを確認
      const { gates } = useCircuitStore.getState();
      expect(gates).toHaveLength(1);
      expect(gates[0].type).toBe('AND');
      expect(gates[0].position).toEqual({ x: 300, y: 200 });
    });

    it('同じ種類のゲートを複数配置できる', () => {
      const { addGate } = useCircuitStore.getState();
      
      // 3つのANDゲートを配置
      addGate('AND', { x: 100, y: 100 });
      addGate('AND', { x: 200, y: 100 });
      addGate('AND', { x: 300, y: 100 });
      
      const { gates } = useCircuitStore.getState();
      expect(gates).toHaveLength(3);
      expect(gates.every(g => g.type === 'AND')).toBe(true);
      
      // 各ゲートが異なるIDを持つ
      const ids = gates.map(g => g.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  describe('ゲートの選択', () => {
    it('クリックでゲートを選択できる', () => {
      // ゲートを配置
      const { addGate } = useCircuitStore.getState();
      addGate('OR', { x: 400, y: 300 });
      
      const gate = useCircuitStore.getState().gates[0];
      
      // ゲートを選択
      const { setSelectedGates } = useCircuitStore.getState();
      setSelectedGates([gate.id]);
      
      // 選択されたことを確認
      const { selectedGateIds } = useCircuitStore.getState();
      expect(selectedGateIds).toContain(gate.id);
    });

    it('Ctrl+クリックで複数選択できる', () => {
      const { addGate, setSelectedGates } = useCircuitStore.getState();
      
      // 3つのゲートを配置
      addGate('NOT', { x: 100, y: 200 });
      addGate('XOR', { x: 200, y: 200 });
      addGate('NAND', { x: 300, y: 200 });
      
      const gates = useCircuitStore.getState().gates;
      
      // 最初のゲートを選択
      setSelectedGates([gates[0].id]);
      
      // Ctrl+クリックで追加選択（既存の選択に追加）
      const currentSelection = useCircuitStore.getState().selectedGateIds;
      setSelectedGates([...currentSelection, gates[1].id]);
      setSelectedGates([...useCircuitStore.getState().selectedGateIds, gates[2].id]);
      
      // 3つすべて選択されている
      const { selectedGateIds } = useCircuitStore.getState();
      expect(selectedGateIds).toHaveLength(3);
      expect(selectedGateIds).toContain(gates[0].id);
      expect(selectedGateIds).toContain(gates[1].id);
      expect(selectedGateIds).toContain(gates[2].id);
    });

    it('背景クリックで選択解除できる', () => {
      const { addGate, selectGate, clearSelection } = useCircuitStore.getState();
      
      // ゲートを配置して選択
      addGate('INPUT', { x: 500, y: 400 });
      const gate = useCircuitStore.getState().gates[0];
      selectGate(gate.id);
      
      // 選択されていることを確認
      expect(useCircuitStore.getState().selectedGateIds).toContain(gate.id);
      
      // 背景クリックで選択解除
      clearSelection();
      
      // 選択が解除されている
      expect(useCircuitStore.getState().selectedGateIds).toHaveLength(0);
    });
  });

  describe('ゲートの移動', () => {
    it('選択したゲートをドラッグで移動できる', () => {
      const { addGate, selectGate, moveGate } = useCircuitStore.getState();
      
      // ゲートを配置
      addGate('OUTPUT', { x: 100, y: 100 });
      const gate = useCircuitStore.getState().gates[0];
      
      // ゲートを選択
      selectGate(gate.id);
      
      // ドラッグで移動
      moveGate(gate.id, { x: 300, y: 250 });
      
      // 位置が更新されている
      const movedGate = useCircuitStore.getState().gates[0];
      expect(movedGate.position).toEqual({ x: 300, y: 250 });
    });

    it('複数選択したゲートを一括移動できる', () => {
      const { addGate, setSelectedGates, moveMultipleGates } = useCircuitStore.getState();
      
      // 3つのゲートを配置
      addGate('AND', { x: 100, y: 100 });
      addGate('OR', { x: 200, y: 100 });
      addGate('NOT', { x: 300, y: 100 });
      
      const gates = useCircuitStore.getState().gates;
      
      // すべて選択
      setSelectedGates([gates[0].id, gates[1].id, gates[2].id]);
      
      // 一括移動（デルタ: x+50, y+100）
      moveMultipleGates(
        [gates[0].id, gates[1].id, gates[2].id],
        50, // deltaX
        100 // deltaY
      );
      
      // すべて移動している
      const movedGates = useCircuitStore.getState().gates;
      expect(movedGates[0].position).toEqual({ x: 150, y: 200 });
      expect(movedGates[1].position).toEqual({ x: 250, y: 200 });
      expect(movedGates[2].position).toEqual({ x: 350, y: 200 });
    });
  });

  describe('ゲートの削除', () => {
    it('選択したゲートをDeleteキーで削除できる', () => {
      const { addGate, setSelectedGates, deleteGate } = useCircuitStore.getState();
      
      // ゲートを配置
      addGate('NOR', { x: 400, y: 300 });
      const gate = useCircuitStore.getState().gates[0];
      
      // ゲートを選択
      setSelectedGates([gate.id]);
      
      // 削除
      const selectedIds = useCircuitStore.getState().selectedGateIds;
      selectedIds.forEach(id => deleteGate(id));
      
      // ゲートが削除されている
      expect(useCircuitStore.getState().gates).toHaveLength(0);
    });

    it('複数選択したゲートを一括削除できる', () => {
      const { addGate, setSelectedGates, deleteGate } = useCircuitStore.getState();
      
      // 5つのゲートを配置
      for (let i = 0; i < 5; i++) {
        addGate('XOR', { x: 100 + i * 100, y: 200 });
      }
      
      const gates = useCircuitStore.getState().gates;
      
      // 3つ選択（1番目、3番目、5番目）
      setSelectedGates([gates[0].id, gates[2].id, gates[4].id]);
      
      // 削除
      const selectedIds = useCircuitStore.getState().selectedGateIds;
      selectedIds.forEach(id => deleteGate(id));
      
      // 選択した3つが削除され、2つ残る
      const remainingGates = useCircuitStore.getState().gates;
      expect(remainingGates).toHaveLength(2);
      expect(remainingGates[0].id).toBe(gates[1].id);
      expect(remainingGates[1].id).toBe(gates[3].id);
    });

    it('ゲート削除時に接続されたワイヤーも削除される', () => {
      const { addGate, setSelectedGates, deleteGate, startWireDrawing, endWireDrawing } = useCircuitStore.getState();
      
      // 2つのゲートを配置
      addGate('INPUT', { x: 100, y: 200 });
      addGate('OUTPUT', { x: 300, y: 200 });
      const [input, output] = useCircuitStore.getState().gates;
      
      // ワイヤーで接続
      startWireDrawing(input.id, -1);
      endWireDrawing(output.id, 0);
      
      // ワイヤーが存在することを確認
      expect(useCircuitStore.getState().wires).toHaveLength(1);
      
      // INPUTゲートを削除
      setSelectedGates([input.id]);
      deleteGate(input.id);
      
      // ゲートとワイヤーが削除されている
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      expect(useCircuitStore.getState().wires).toHaveLength(0);
    });
  });

  describe('特殊なゲートの動作', () => {
    it('INPUTゲートをクリックで値を切り替えられる', () => {
      const { addGate, updateGateOutput } = useCircuitStore.getState();
      
      // INPUTゲートを配置
      addGate('INPUT', { x: 200, y: 300 });
      const inputGate = useCircuitStore.getState().gates[0];
      
      // 初期値はfalse
      expect(inputGate.output).toBe(false);
      
      // クリックで切り替え（手動でトグル）
      updateGateOutput(inputGate.id, !inputGate.output);
      
      // 値がtrueに変わる
      const updatedGate = useCircuitStore.getState().gates[0];
      expect(updatedGate.output).toBe(true);
      
      // もう一度クリックでfalseに戻る
      updateGateOutput(inputGate.id, !updatedGate.output);
      const toggledAgain = useCircuitStore.getState().gates[0];
      expect(toggledAgain.output).toBe(false);
    });

    it('CLOCKゲートの周波数を設定できる', () => {
      const { addGate, updateClockFrequency } = useCircuitStore.getState();
      
      // CLOCKゲートを配置
      addGate('CLOCK', { x: 400, y: 400 });
      const clockGate = useCircuitStore.getState().gates[0];
      
      // 初期周波数を確認（デフォルト1Hz）
      expect(clockGate.metadata?.frequency).toBe(1);
      
      // 周波数を変更
      updateClockFrequency(clockGate.id, 10);
      
      // 周波数が更新されている
      const updatedClock = useCircuitStore.getState().gates[0];
      expect(updatedClock.metadata?.frequency).toBe(10);
    });
  });
});