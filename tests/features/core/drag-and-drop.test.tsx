/**
 * コア機能: ドラッグ&ドロップのE2Eテスト
 * 現在の問題を明確に定義するテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import { useCircuitStore } from '@/stores/circuitStore';
import React from 'react';

// SVGElement のモック
const mockGetBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 1200,
  height: 800,
  top: 0,
  right: 1200,
  bottom: 800,
  left: 0,
}));

// createSVGPoint のモック
const mockCreateSVGPoint = vi.fn(() => ({
  x: 0,
  y: 0,
  matrixTransform: vi.fn(function() {
    return { x: this.x, y: this.y };
  }),
}));

Object.defineProperty(SVGElement.prototype, 'getBoundingClientRect', {
  value: mockGetBoundingClientRect,
});

Object.defineProperty(SVGSVGElement.prototype, 'createSVGPoint', {
  value: mockCreateSVGPoint,
});

Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
  value: vi.fn(() => ({
    inverse: vi.fn(() => ({
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
    })),
  })),
});

describe('ドラッグ&ドロップ - 現在の問題を定義', () => {
  beforeEach(() => {
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateIds: [],
    });
  });

  describe('ゲートのドラッグ（現在失敗する）', () => {
    it('選択したゲートをドラッグで移動できる', async () => {
      // ゲートを配置
      const { addGate } = useCircuitStore.getState();
      addGate('AND', { x: 300, y: 200 });
      const gate = useCircuitStore.getState().gates[0];

      // UnifiedCanvasをレンダー
      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      // ゲート要素を取得
      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      expect(gateElement).toBeInTheDocument();

      // ゲートをクリックして選択
      fireEvent.click(gateElement!);
      
      // 選択されたことを確認（これが失敗する）
      expect(useCircuitStore.getState().selectedGateIds).toContain(gate.id);

      // ドラッグ操作をシミュレート
      fireEvent.mouseDown(gateElement!, { clientX: 300, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 400, clientY: 300 });
      fireEvent.mouseUp(document);

      // ゲートが移動したことを確認（これも失敗する）
      const movedGate = useCircuitStore.getState().gates[0];
      expect(movedGate.position.x).toBeGreaterThan(300);
      expect(movedGate.position.y).toBeGreaterThan(200);
    });

    it('複数選択したゲートを一括でドラッグできる', async () => {
      // 3つのゲートを配置
      const { addGate } = useCircuitStore.getState();
      addGate('AND', { x: 200, y: 200 });
      addGate('OR', { x: 300, y: 200 });
      addGate('NOT', { x: 400, y: 200 });
      
      const gates = useCircuitStore.getState().gates;

      // UnifiedCanvasをレンダー
      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      // 矩形選択で複数選択をシミュレート
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // 矩形選択
      fireEvent.mouseDown(svg!, { clientX: 150, clientY: 150 });
      fireEvent.mouseMove(svg!, { clientX: 450, clientY: 250 });
      fireEvent.mouseUp(svg!);

      // 複数選択されたことを確認（これが失敗する）
      expect(useCircuitStore.getState().selectedGateIds).toHaveLength(3);

      // 選択したゲートの1つをドラッグ
      const firstGateElement = container.querySelector(`[data-gate-id="${gates[0].id}"]`);
      fireEvent.mouseDown(firstGateElement!, { clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 250, clientY: 300 });
      fireEvent.mouseUp(document);

      // すべてのゲートが移動したことを確認（これも失敗する）
      const movedGates = useCircuitStore.getState().gates;
      movedGates.forEach((gate, index) => {
        expect(gate.position.y).toBeGreaterThan(gates[index].position.y);
      });
    });
  });

  describe('期待される動作（あるべき姿）', () => {
    it('ゲートクリックでZustandストアのselectedGateIdsが更新される', () => {
      const { addGate } = useCircuitStore.getState();
      addGate('XOR', { x: 500, y: 400 });
      const gate = useCircuitStore.getState().gates[0];

      // UnifiedCanvasをレンダー
      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      fireEvent.click(gateElement!);

      // Zustandストアに選択状態が反映される（現在はローカル状態のみ）
      const { selectedGateIds } = useCircuitStore.getState();
      expect(selectedGateIds).toContain(gate.id);
    });

    it('ドラッグ中にリアルタイムで位置が更新される', () => {
      const { addGate } = useCircuitStore.getState();
      addGate('NAND', { x: 300, y: 300 });
      const gate = useCircuitStore.getState().gates[0];

      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      // ゲートを選択
      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      fireEvent.click(gateElement!);

      // ドラッグ開始
      fireEvent.mouseDown(gateElement!, { clientX: 300, clientY: 300 });

      // ドラッグ中（複数回のmousemove）
      const movements = [
        { x: 320, y: 310 },
        { x: 340, y: 320 },
        { x: 360, y: 330 },
        { x: 380, y: 340 },
      ];

      movements.forEach(({ x, y }) => {
        fireEvent.mouseMove(document, { clientX: x, clientY: y });
        
        // 各移動でゲート位置が更新される
        const currentGate = useCircuitStore.getState().gates[0];
        expect(currentGate.position.x).toBeGreaterThan(300);
        expect(currentGate.position.y).toBeGreaterThan(300);
      });

      fireEvent.mouseUp(document);
    });

    it('ドラッグ終了時にUndo履歴に保存される', () => {
      const { addGate, saveToHistory } = useCircuitStore.getState();
      addGate('NOR', { x: 200, y: 200 });
      const gate = useCircuitStore.getState().gates[0];

      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      // 履歴保存のモック
      const saveToHistorySpy = vi.spyOn(useCircuitStore.getState(), 'saveToHistory');

      // ドラッグ操作
      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      fireEvent.click(gateElement!);
      fireEvent.mouseDown(gateElement!, { clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 400, clientY: 400 });
      fireEvent.mouseUp(document);

      // 履歴が保存される
      expect(saveToHistorySpy).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('画面外へのドラッグでも正常に動作する', () => {
      const { addGate } = useCircuitStore.getState();
      addGate('INPUT', { x: 600, y: 400 });
      const gate = useCircuitStore.getState().gates[0];

      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      fireEvent.click(gateElement!);
      fireEvent.mouseDown(gateElement!, { clientX: 600, clientY: 400 });
      
      // 画面外へドラッグ
      fireEvent.mouseMove(document, { clientX: 2000, clientY: 1500 });
      fireEvent.mouseUp(document);

      // ゲートは移動するが、適切な範囲内に制限される可能性
      const movedGate = useCircuitStore.getState().gates[0];
      expect(movedGate.position.x).toBeGreaterThan(600);
      expect(movedGate.position.y).toBeGreaterThan(400);
    });

    it('ドラッグ中にESCキーでキャンセルできる', () => {
      const { addGate } = useCircuitStore.getState();
      addGate('OUTPUT', { x: 300, y: 300 });
      const gate = useCircuitStore.getState().gates[0];
      const originalPosition = { ...gate.position };

      const { container } = render(
        <UnifiedCanvas
          config={CANVAS_MODE_PRESETS.editor}
          dataSource={{ store: true }}
        />
      );

      const gateElement = container.querySelector(`[data-gate-id="${gate.id}"]`);
      fireEvent.click(gateElement!);
      fireEvent.mouseDown(gateElement!, { clientX: 300, clientY: 300 });
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
      
      // ESCキーでキャンセル
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // 位置が元に戻る
      const currentGate = useCircuitStore.getState().gates[0];
      expect(currentGate.position).toEqual(originalPosition);
    });
  });
});