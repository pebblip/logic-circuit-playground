/**
 * Canvas状態伝播テスト
 *
 * 目的: 内部状態の変更が適切にUI表示に反映されることを保証
 * - localGatesとdisplayGatesの同期
 * - シミュレーション結果のUI反映
 * - モード切り替え時の状態整合性
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnifiedCanvas } from '../../../src/components/canvas/hooks/useUnifiedCanvas';
import type {
  CanvasConfig,
  CanvasDataSource,
} from '../../../src/components/canvas/types/canvasTypes';
import type { Gate, Wire } from '../../../src/types/circuit';

describe('Canvas State Propagation', () => {
  describe('Gallery Mode State Sync', () => {
    const createTestCircuit = () => ({
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          inputs: [false],
          output: false,
          outputs: [false],
        },
        {
          id: 'OUT1',
          type: 'OUTPUT',
          position: { x: 200, y: 100 },
          inputs: [false],
          output: false,
          outputs: [],
        },
      ] as Gate[],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'OUT1', pinIndex: 0 },
        },
      ] as Wire[],
    });

    it('should update displayGates when localGates change in gallery mode', () => {
      const config: CanvasConfig = {
        mode: 'gallery',
        simulationMode: 'local',
        galleryOptions: { autoSimulation: false },
      };

      const dataSource: CanvasDataSource = {
        galleryCircuit: {
          id: 'test',
          title: 'Test Circuit',
          description: 'Test',
          ...createTestCircuit(),
        },
      };

      const { result } = renderHook(() => useUnifiedCanvas(config, dataSource));

      // 初期状態確認
      expect(result.current.state.displayGates).toHaveLength(2);
      const initialOutputGate = result.current.state.displayGates.find(
        g => g.id === 'OUT1'
      );
      expect(initialOutputGate?.inputs[0]).toBe(false);

      // シミュレーション実行
      act(() => {
        result.current.actions.updateCircuit(
          result.current.state.displayGates.map(gate =>
            gate.id === 'OUT1' ? { ...gate, inputs: ['1'] } : gate
          ),
          result.current.state.displayWires
        );
      });

      // displayGatesが更新されているか確認
      const updatedOutputGate = result.current.state.displayGates.find(
        g => g.id === 'OUT1'
      );
      expect(updatedOutputGate?.inputs[0]).toBe('1');
    });

    it('should prioritize dynamic localGates over static gallery data', () => {
      const config: CanvasConfig = {
        mode: 'gallery',
        simulationMode: 'local',
        galleryOptions: { autoSimulation: true },
      };

      const staticCircuit = createTestCircuit();
      const dataSource: CanvasDataSource = {
        galleryCircuit: {
          id: 'test',
          title: 'Test Circuit',
          description: 'Test',
          ...staticCircuit,
        },
      };

      const { result } = renderHook(() => useUnifiedCanvas(config, dataSource));

      // アニメーション開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // displayGatesが静的データではなく動的なlocalGatesを参照しているか
      // （localGatesが空でない限り）
      expect(result.current.state.displayGates).toBeDefined();

      // updateCircuitでlocalGatesを更新
      const modifiedGates = staticCircuit.gates.map(gate => ({
        ...gate,
        inputs: gate.type === 'OUTPUT' ? ['1'] : gate.inputs,
      }));

      act(() => {
        result.current.actions.updateCircuit(
          modifiedGates,
          staticCircuit.wires
        );
      });

      // displayGatesに変更が反映されているか
      const outputGate = result.current.state.displayGates.find(
        g => g.id === 'OUT1'
      );
      expect(outputGate?.inputs[0]).toBe('1');
    });
  });

  describe('React Render Trigger', () => {
    it('should trigger re-render when OUTPUT gate inputs change', () => {
      const config: CanvasConfig = {
        mode: 'gallery',
        simulationMode: 'local',
      };

      const circuit = {
        gates: [
          {
            id: 'OUT1',
            type: 'OUTPUT',
            position: { x: 100, y: 100 },
            inputs: [false],
            output: false,
            outputs: [],
          },
        ] as Gate[],
        wires: [] as Wire[],
      };

      const dataSource: CanvasDataSource = {
        galleryCircuit: {
          id: 'test',
          title: 'Test',
          description: 'Test',
          ...circuit,
        },
      };

      const { result, rerender } = renderHook(() =>
        useUnifiedCanvas(config, dataSource)
      );

      let renderCount = 0;
      const originalDisplayGates = result.current.state.displayGates;

      // レンダリング回数をカウント
      rerender();
      renderCount++;

      // OUTPUTゲートのinputsを変更
      act(() => {
        const updatedGates = circuit.gates.map(gate => ({
          ...gate,
          inputs: gate.type === 'OUTPUT' ? ['1'] : gate.inputs,
        }));
        result.current.actions.updateCircuit(updatedGates, circuit.wires);
      });

      // displayGatesが変更されたか確認
      expect(result.current.state.displayGates).not.toBe(originalDisplayGates);

      // OUTPUTゲートの値が更新されたか
      const outputGate = result.current.state.displayGates.find(
        g => g.id === 'OUT1'
      );
      expect(outputGate?.inputs[0]).toBe('1');
    });
  });

  describe('Mode Switching', () => {
    it('should maintain state consistency when switching between modes', () => {
      // エディターモードから開始
      let config: CanvasConfig = {
        mode: 'editor',
        simulationMode: 'store',
      };

      const dataSource: CanvasDataSource = {};

      const { result, rerender } = renderHook(
        ({ config }) => useUnifiedCanvas(config, dataSource),
        { initialProps: { config } }
      );

      const initialGateCount = result.current.state.displayGates.length;

      // ギャラリーモードに切り替え
      config = {
        mode: 'gallery',
        simulationMode: 'local',
        galleryOptions: { autoSimulation: false },
      };

      act(() => {
        rerender({ config });
      });

      // モード切り替え後も状態が整合性を保っているか
      expect(result.current.state.displayGates).toBeDefined();
      expect(Array.isArray(result.current.state.displayGates)).toBe(true);
    });
  });
});
