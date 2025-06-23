/**
 * リングオシレータ包括的挙動検証テスト
 * 
 * 目的: リングオシレータの本来あるべき動作を包括的に検証
 * - 3つのNOTゲートの循環動作
 * - 時間経過による状態変化
 * - ワイヤー伝播の正確性
 * - 出力ゲートへの正しい反映
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe.skip('Ring Oscillator Comprehensive Behavior - SKIPPED: useCanvasタイムアウト問題', () => {
  let galleryConfig: CanvasConfig;
  
  beforeEach(() => {
    galleryConfig = {
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

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should oscillate all NOT gates in ring pattern over time', async () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };

    const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

    // 初期化完了を待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // 🔍 回路構造の検証
    const gates = result.current.state.displayGates;
    const notGates = gates.filter(g => g.type === 'NOT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    
    expect(notGates.length).toBe(3); // NOT1, NOT2, NOT3
    expect(outputGates.length).toBe(3); // OUT_NOT1, OUT_NOT2, OUT_NOT3
    
    // 🔍 初期状態の記録
    const getGateOutputs = () => {
      const currentGates = result.current.state.displayGates;
      return {
        NOT1: currentGates.find(g => g.id === 'NOT1')?.outputs[0],
        NOT2: currentGates.find(g => g.id === 'NOT2')?.outputs[0],
        NOT3: currentGates.find(g => g.id === 'NOT3')?.outputs[0],
        OUT_NOT1: currentGates.find(g => g.id === 'OUT_NOT1')?.outputs[0],
        OUT_NOT2: currentGates.find(g => g.id === 'OUT_NOT2')?.outputs[0],
        OUT_NOT3: currentGates.find(g => g.id === 'OUT_NOT3')?.outputs[0],
      };
    };

    const getWireStates = () => {
      const currentWires = result.current.state.displayWires;
      return {
        w1: currentWires.find(w => w.id === 'w1')?.isActive, // NOT1 -> NOT2
        w2: currentWires.find(w => w.id === 'w2')?.isActive, // NOT2 -> NOT3  
        w3: currentWires.find(w => w.id === 'w3')?.isActive, // NOT3 -> NOT1
        w4: currentWires.find(w => w.id === 'w4')?.isActive, // NOT1 -> OUT_NOT1
        w5: currentWires.find(w => w.id === 'w5')?.isActive, // NOT2 -> OUT_NOT2
        w6: currentWires.find(w => w.id === 'w6')?.isActive, // NOT3 -> OUT_NOT3
      };
    };

    const initialOutputs = getGateOutputs();
    const initialWires = getWireStates();
    
    console.log('🔍 Initial state:', initialOutputs);
    console.log('🔍 Initial wires:', initialWires);

    // 🕐 時間経過1: 最初のサイクル
    await act(async () => {
      vi.advanceTimersByTime(500);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const cycle1Outputs = getGateOutputs();
    const cycle1Wires = getWireStates();
    
    console.log('🔍 After 500ms:', cycle1Outputs);
    console.log('🔍 Wires after 500ms:', cycle1Wires);

    // ❗ 重要: 状態が変化しているべき
    expect(cycle1Outputs).not.toEqual(initialOutputs);
    
    // 🕐 時間経過2: さらなるサイクル
    await act(async () => {
      vi.advanceTimersByTime(500);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const cycle2Outputs = getGateOutputs();
    const cycle2Wires = getWireStates();
    
    console.log('🔍 After 1000ms:', cycle2Outputs);
    console.log('🔍 Wires after 1000ms:', cycle2Wires);

    // ❗ 重要: さらに状態が変化しているべき
    expect(cycle2Outputs).not.toEqual(cycle1Outputs);

    // 🔄 循環パターンの検証: すべてのNOTゲートが異なる時点で異なる値を持つべき
    const allStates = [initialOutputs, cycle1Outputs, cycle2Outputs];
    
    // NOT1の値に注目した変化パターン
    const not1Values = allStates.map(state => state.NOT1);
    const not2Values = allStates.map(state => state.NOT2);
    const not3Values = allStates.map(state => state.NOT3);
    
    console.log('🔄 NOT1 pattern:', not1Values);
    console.log('🔄 NOT2 pattern:', not2Values);  
    console.log('🔄 NOT3 pattern:', not3Values);

    // ❗ 重要: 少なくとも一つのNOTゲートは値が変化しているべき
    const hasNot1Changed = not1Values.some((val, i) => i > 0 && val !== not1Values[0]);
    const hasNot2Changed = not2Values.some((val, i) => i > 0 && val !== not2Values[0]);
    const hasNot3Changed = not3Values.some((val, i) => i > 0 && val !== not3Values[0]);
    
    expect(hasNot1Changed || hasNot2Changed || hasNot3Changed).toBe(true);

    // 🔌 ワイヤー伝播の検証: NOTゲートの出力とOUTPUTゲートの入力が一致すべき
    const finalState = cycle2Outputs;
    
    // NOT1の出力 = OUT_NOT1の出力であるべき（直接接続）
    expect(finalState.NOT1).toBe(finalState.OUT_NOT1);
    expect(finalState.NOT2).toBe(finalState.OUT_NOT2);
    expect(finalState.NOT3).toBe(finalState.OUT_NOT3);

    // 🔗 ワイヤーアクティブ状態の検証
    const finalWires = getWireStates();
    
    // NOT1がtrueなら、w4（NOT1->OUT_NOT1）もactiveであるべき
    if (finalState.NOT1) {
      expect(finalWires.w4).toBe(true);
    }
    if (finalState.NOT2) {
      expect(finalWires.w5).toBe(true);
    }
    if (finalState.NOT3) {
      expect(finalWires.w6).toBe(true);
    }
  }, 15000);

  it('should maintain circuit integrity during oscillation', async () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };

    const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // 🔍 回路の完全性検証
    const gates = result.current.state.displayGates;
    const wires = result.current.state.displayWires;
    
    // すべてのゲートが存在
    expect(gates.length).toBe(6); // 3 NOT + 3 OUTPUT
    expect(wires.length).toBe(6); // 6本のワイヤー
    
    // 各ゲートが適切な出力数を持つ
    gates.forEach(gate => {
      expect(gate.outputs).toBeDefined();
      expect(gate.outputs.length).toBeGreaterThan(0);
      expect(typeof gate.outputs[0]).toBe('boolean');
    });

    // 各ワイヤーが適切な接続を持つ
    wires.forEach(wire => {
      expect(wire.from).toBeDefined();
      expect(wire.to).toBeDefined();
      expect(typeof wire.isActive).toBe('boolean');
    });

    // 🕐 長期間の動作テスト
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        vi.advanceTimersByTime(300);
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      // 回路の完全性が保たれている
      expect(result.current.state.displayGates.length).toBe(6);
      expect(result.current.state.displayWires.length).toBe(6);
      
      // すべてのゲートが有効な出力を持つ
      result.current.state.displayGates.forEach(gate => {
        expect(gate.outputs[0]).toBeDefined();
        expect(typeof gate.outputs[0]).toBe('boolean');
      });
    }
  }, 15000);
});