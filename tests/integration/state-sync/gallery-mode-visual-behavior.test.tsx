/**
 * ギャラリーモード視覚的動作テスト
 * 
 * 今回のバグを検出するための統合テスト
 * このテストは修正前には失敗し、修正後には成功するべき
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useUnifiedCanvas } from '@/components/canvas/hooks/useUnifiedCanvas';
import { SIMPLE_RING_OSCILLATOR } from '@/features/gallery/data/simple-ring-oscillator';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

// テスト用コンポーネント
function TestGalleryCanvas({ circuit }: { circuit: any }) {
  const config: CanvasConfig = {
    mode: 'gallery',
    simulationMode: 'local',
    interactionLevel: 'view_only',
    galleryOptions: {
      autoSimulation: true,
      showDebugInfo: true,
      autoFit: true,
    },
  };

  const dataSource: CanvasDataSource = {
    galleryCircuit: circuit,
  };

  const { state, actions } = useUnifiedCanvas(config, dataSource);

  return (
    <div data-testid="gallery-canvas">
      <div data-testid="gate-count">{state.displayGates.length}</div>
      <div data-testid="animation-state">{state.isAnimating ? 'animating' : 'stopped'}</div>
      
      {/* OUTPUTゲートの状態を検証可能にする */}
      {state.displayGates
        .filter(g => g.type === 'OUTPUT')
        .map(gate => (
          <div 
            key={gate.id}
            data-testid={`output-${gate.id}`}
            data-input-value={gate.inputs[0] || ''}
            data-should-light={gate.inputs[0] === '1' || gate.inputs[0] === 'true'}
          >
            {gate.id}
          </div>
        ))}
    </div>
  );
}

describe('Gallery Mode Visual Behavior Integration Test', () => {
  describe('Simple Ring Oscillator', () => {
    it('🚨 CRITICAL: displayGates should contain dynamic gates, not static ones', async () => {
      const { getByTestId, getAllByTestId } = render(
        <TestGalleryCanvas circuit={SIMPLE_RING_OSCILLATOR} />
      );

      // 基本構造確認
      await waitFor(() => {
        expect(getByTestId('gate-count')).toHaveTextContent('6'); // 3 NOT + 3 OUTPUT
      });

      // 重要: displayGatesにOUTPUTゲートが含まれているか
      const outputGates = getAllByTestId(/^output-/);
      expect(outputGates).toHaveLength(3);

      // アニメーション開始
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });

      // 🚨 CRITICAL TEST: OUTPUTゲートが動的に更新されるか
      await waitFor(
        () => {
          const outputStates = outputGates.map(el => ({
            id: el.textContent,
            inputValue: el.getAttribute('data-input-value'),
            shouldLight: el.getAttribute('data-should-light') === 'true',
          }));

          // 少なくとも1つのOUTPUTゲートが"1"状態になるはず
          const hasActiveOutput = outputStates.some(state => 
            state.inputValue === '1' && state.shouldLight
          );

          expect(hasActiveOutput).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('🚨 CRITICAL: localGates updates should reflect in displayGates', async () => {
      let canvasHook: any;

      function TestComponent() {
        const config: CanvasConfig = {
          mode: 'gallery',
          simulationMode: 'local',
          galleryOptions: { autoSimulation: true },
        };
        
        const dataSource: CanvasDataSource = {
          galleryCircuit: SIMPLE_RING_OSCILLATOR,
        };

        canvasHook = useUnifiedCanvas(config, dataSource);
        return <div data-testid="test-component" />;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(canvasHook.state.displayGates.length).toBeGreaterThan(0);
      });

      // 🚨 CRITICAL: displayGatesとlocalGatesの整合性確認
      const initialDisplayGates = canvasHook.state.displayGates;
      
      // アニメーション実行後
      await act(async () => {
        canvasHook.actions.startAnimation();
        await new Promise(resolve => setTimeout(resolve, 1000));
      });

      await waitFor(() => {
        const currentDisplayGates = canvasHook.state.displayGates;
        
        // displayGatesは動的に更新されるlocalGatesを反映するべき
        const outputGates = currentDisplayGates.filter(g => g.type === 'OUTPUT');
        expect(outputGates.length).toBe(3);
        
        // 少なくとも1つのOUTPUTゲートのinputsが変化しているはず
        const hasChangedInputs = outputGates.some(gate => 
          gate.inputs[0] === '1' || gate.inputs[0] === ''
        );
        expect(hasChangedInputs).toBe(true);
      });
    });

    it('🚨 CRITICAL: simulation results should propagate to OUTPUT gates', () => {
      // シミュレーションエンジン単体テスト
      const { EnhancedHybridEvaluator } = require('@/domain/simulation/event-driven-minimal');
      
      const evaluator = new EnhancedHybridEvaluator({
        strategy: 'EVENT_DRIVEN_ONLY',
        enableDebugLogging: false,
        delayMode: true,
      });

      const circuit = {
        gates: SIMPLE_RING_OSCILLATOR.gates,
        wires: SIMPLE_RING_OSCILLATOR.wires,
      };

      // 複数回評価してOUTPUTゲートの変化を確認
      let hasOutputChange = false;
      
      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluate(circuit);
        
        const outputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
        const hasActiveOutput = outputGates.some(gate => gate.inputs[0] === '1');
        
        if (hasActiveOutput) {
          hasOutputChange = true;
          break;
        }
      }

      expect(hasOutputChange).toBe(true);
    });
  });
});