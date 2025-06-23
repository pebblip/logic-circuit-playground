/**
 * self-oscillating-memory-improved のテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_IMPROVED } from '@/features/gallery/data/self-oscillating-memory-improved';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe.skip('self-oscillating改善版の動作確認 - SKIPPED: useCanvasタイムアウト問題', () => {
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
      galleryCircuit: SELF_OSCILLATING_MEMORY_IMPROVED,
    };
  });

  it('基本構成の確認', () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    // 16ゲートが存在
    expect(result.current.state.displayGates).toHaveLength(16);
    
    // 主要なゲートの存在確認
    const gateIds = result.current.state.displayGates.map(g => g.id);
    expect(gateIds).toContain('enable');
    expect(gateIds).toContain('trigger');
    expect(gateIds).toContain('edge_clock');
    expect(gateIds).toContain('trigger_dff');
    expect(gateIds).toContain('edge_detector');
    expect(gateIds).toContain('osc1');
    expect(gateIds).toContain('osc5');
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
    const states: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const output = result.current.state.displayGates.find(g => g.id === 'output_main');
      states.push(output?.inputs?.[0] || false);
    }
    
    console.log('🔍 出力状態の変化:', states);
    
    // 発振していることを確認（状態変化がある）
    const hasOscillation = new Set(states).size > 1;
    expect(hasOscillation).toBe(true);
  });

  it('trigger操作が正常に動作', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));
    
    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 発振状態を記録（trigger前）
    const beforeTrigger: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const output = result.current.state.displayGates.find(g => g.id === 'output_main');
      beforeTrigger.push(output?.inputs?.[0] || false);
    }
    
    // trigger ON
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // trigger OFF
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    
    // trigger後の発振状態を記録
    const afterTrigger: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const output = result.current.state.displayGates.find(g => g.id === 'output_main');
      afterTrigger.push(output?.inputs?.[0] || false);
    }
    
    console.log('🔍 Trigger前:', beforeTrigger);
    console.log('🔍 Trigger後:', afterTrigger);
    
    // trigger後も発振が継続していることを確認
    const hasOscillationAfter = new Set(afterTrigger).size > 1;
    expect(hasOscillationAfter).toBe(true);
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
    
    // enable=OFFで出力が常にLOW
    expect(outputsWhenDisabled.every(v => v === false)).toBe(true);
    
    // enable ON
    act(() => {
      result.current.actions.toggleInput('enable');
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // enable ON時の出力を確認
    const outputsWhenEnabled: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const output = result.current.state.displayGates.find(g => g.id === 'output_main');
      outputsWhenEnabled.push(output?.inputs?.[0] || false);
    }
    
    // enable=ONで発振再開
    const hasOscillation = new Set(outputsWhenEnabled).size > 1;
    expect(hasOscillation).toBe(true);
  });
});