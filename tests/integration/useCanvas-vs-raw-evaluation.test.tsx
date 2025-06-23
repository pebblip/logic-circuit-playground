/**
 * useCanvasと生のCircuitEvaluatorの動作の違いを調査
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';

describe('useCanvas vs 生の評価の比較', () => {
  it('useCanvasでの初期評価', async () => {
    const galleryConfig: CanvasConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: true,
        animationInterval: 100,
        showDebugInfo: true,
        autoFit: false,
        autoFitPadding: 80,
      },
      uiControls: {
        showControls: true,
        showPreviewHeader: false,
        showBackground: false,
      },
    };

    const mockDataSource: CanvasDataSource = {
      galleryCircuit: SELF_OSCILLATING_MEMORY_FINAL,
    };

    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    console.log('🔍 useCanvas初期状態:');
    const initialNor1 = result.current.state.displayGates.find(g => g.id === 'nor1');
    const initialNor2 = result.current.state.displayGates.find(g => g.id === 'nor2');
    console.log('nor1:', initialNor1?.outputs);
    console.log('nor2:', initialNor2?.outputs);
    
    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('\n🔍 useCanvasアニメーション開始後:');
    const animatedNor1 = result.current.state.displayGates.find(g => g.id === 'nor1');
    const animatedNor2 = result.current.state.displayGates.find(g => g.id === 'nor2');
    console.log('nor1:', animatedNor1?.outputs);
    console.log('nor2:', animatedNor2?.outputs);
    
    // 発振を確認
    const states: {nor1: boolean, nor2: boolean}[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const n1 = result.current.state.displayGates.find(g => g.id === 'nor1');
      const n2 = result.current.state.displayGates.find(g => g.id === 'nor2');
      states.push({
        nor1: n1?.outputs?.[0] || false,
        nor2: n2?.outputs?.[0] || false
      });
    }
    
    console.log('\n🔍 発振状態の記録:');
    states.forEach((state, i) => {
      console.log(`  ${i}: nor1=${state.nor1}, nor2=${state.nor2}`);
    });
    
    // 発振しているか確認
    const hasOscillation = states.some((state, i) => 
      i > 0 && (state.nor1 !== states[i-1].nor1 || state.nor2 !== states[i-1].nor2)
    );
    
    console.log('\n発振検出:', hasOscillation);
  });
  
  it('生の評価での初期評価', () => {
    const evaluator = new CircuitEvaluator();
    
    // 同じ回路を生で評価
    const circuit: EvaluationCircuit = {
      gates: SELF_OSCILLATING_MEMORY_FINAL.gates.map(gate => ({
        id: gate.id,
        type: gate.type as any,
        position: gate.position,
        inputs: gate.inputs || [],
        outputs: gate.outputs || [],
      })),
      wires: SELF_OSCILLATING_MEMORY_FINAL.wires,
    };
    
    const context: EvaluationContext = {
      currentTime: 0,
      memory: {
        enable: { state: true },
        trigger: { state: false }
      }
    };
    
    console.log('\n🔍 生の評価初期状態:');
    const initialNor1 = circuit.gates.find(g => g.id === 'nor1');
    const initialNor2 = circuit.gates.find(g => g.id === 'nor2');
    console.log('nor1:', initialNor1?.outputs);
    console.log('nor2:', initialNor2?.outputs);
    
    // 複数サイクル評価
    let current = { circuit, context };
    const states: {nor1: boolean, nor2: boolean}[] = [];
    
    for (let i = 0; i < 10; i++) {
      current = evaluator.evaluateDelayed(current.circuit, current.context);
      const n1 = current.circuit.gates.find(g => g.id === 'nor1');
      const n2 = current.circuit.gates.find(g => g.id === 'nor2');
      states.push({
        nor1: n1?.outputs?.[0] || false,
        nor2: n2?.outputs?.[0] || false
      });
    }
    
    console.log('\n🔍 生の評価での状態遷移:');
    states.forEach((state, i) => {
      console.log(`  サイクル${i+1}: nor1=${state.nor1}, nor2=${state.nor2}`);
    });
    
    // hasChangesも確認
    const finalResult = evaluator.evaluateDelayed(current.circuit, current.context);
    console.log('\nhasChanges:', finalResult.hasChanges);
  });
});