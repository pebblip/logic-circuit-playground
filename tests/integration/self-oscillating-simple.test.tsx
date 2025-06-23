/**
 * self-oscillating-memory-simple のテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_SIMPLE } from '@/features/gallery/data/self-oscillating-memory-simple';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe('self-oscillatingシンプル版の動作確認', () => {
  let galleryConfig: CanvasConfig;
  let mockDataSource: CanvasDataSource;
  
  beforeEach(() => {
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: true,
        animationInterval: 100, // テスト用に短縮
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

    mockDataSource = {
      galleryCircuit: SELF_OSCILLATING_MEMORY_SIMPLE,
    };
  });

  it('基本構成の確認', () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    // 8ゲートが存在
    expect(result.current.state.displayGates).toHaveLength(8);
    
    // 主要なゲートの存在確認
    const gateIds = result.current.state.displayGates.map(g => g.id);
    expect(gateIds).toContain('enable');
    expect(gateIds).toContain('not1');
    expect(gateIds).toContain('not2');
    expect(gateIds).toContain('not3');
    expect(gateIds).toContain('enable_and');
    expect(gateIds).toContain('memory_sr');
  });

  it('初期発振動作の確認', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 発振状態を記録
    const states: {not1: boolean, not2: boolean, not3: boolean}[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const not1 = result.current.state.displayGates.find(g => g.id === 'not1');
      const not2 = result.current.state.displayGates.find(g => g.id === 'not2');
      const not3 = result.current.state.displayGates.find(g => g.id === 'not3');
      
      states.push({
        not1: not1?.outputs?.[0] || false,
        not2: not2?.outputs?.[0] || false,
        not3: not3?.outputs?.[0] || false,
      });
    }
    
    console.log('🔍 NOTゲートの状態変化:');
    states.forEach((state, i) => {
      console.log(`  ${i}: not1=${state.not1}, not2=${state.not2}, not3=${state.not3}`);
    });
    
    // 発振していることを確認（状態変化がある）
    const hasOscillation = states.some((state, i) => 
      i > 0 && (
        state.not1 !== states[i-1].not1 ||
        state.not2 !== states[i-1].not2 ||
        state.not3 !== states[i-1].not3
      )
    );
    expect(hasOscillation).toBe(true);
  });

  it('enable制御が正常に動作', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // enable OFF
    act(() => {
      result.current.actions.toggleInput('enable');
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // enable OFF時の出力を確認
    const outputsWhenDisabled: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const output = result.current.state.displayGates.find(g => g.id === 'output_main');
      outputsWhenDisabled.push(output?.inputs?.[0] || false);
    }
    
    console.log('🔍 Enable OFF時の出力:', outputsWhenDisabled);
    
    // enable=OFFで出力が安定（変化なし）
    const isStable = outputsWhenDisabled.every(v => v === outputsWhenDisabled[0]);
    expect(isStable).toBe(true);
    
    // enable ON
    act(() => {
      result.current.actions.toggleInput('enable');
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // enable ON時の出力を確認
    const outputsWhenEnabled: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const not1 = result.current.state.displayGates.find(g => g.id === 'not1');
      outputsWhenEnabled.push(not1?.outputs?.[0] || false);
    }
    
    console.log('🔍 Enable ON時のnot1出力:', outputsWhenEnabled);
    
    // enable=ONで発振再開
    const hasOscillation = new Set(outputsWhenEnabled).size > 1;
    expect(hasOscillation).toBe(true);
  });
});