/**
 * useCanvas タイマー修正テスト
 * 
 * 目的: fakeTimersの問題を解決してuseCanvasが動作することを確認
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe('useCanvas Timer Fix', () => {
  let galleryConfig: CanvasConfig;
  
  beforeEach(() => {
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: false,
        animationInterval: 100,
        showDebugInfo: false,
        autoFit: false,
        autoFitPadding: 80,
      },
      uiControls: {
        showControls: true,
        showPreviewHeader: false,
        showBackground: false,
      },
    };

    // ❌ Fake timers を使わない
    // vi.useFakeTimers();
  });

  afterEach(() => {
    // vi.useRealTimers();
  });

  it('should work with real timers (no fake timers)', async () => {
    console.log('🔍 Testing useCanvas with REAL timers');
    
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };

    const { result } = renderHook(() => {
      console.log('🔍 useCanvas rendering...');
      const canvasResult = useCanvas(galleryConfig, dataSource);
      console.log('🔍 useCanvas result:', {
        gateCount: canvasResult.state?.displayGates?.length,
        isAnimating: canvasResult.state?.isAnimating
      });
      return canvasResult;
    });

    console.log('🔍 renderHook completed');

    // リアルタイマーで短時間待機
    await act(async () => {
      console.log('🔍 Starting real 200ms wait');
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('🔍 Real 200ms wait completed');
    });

    console.log('🔍 Checking final state');
    
    // 基本確認
    expect(result.current.state.displayGates.length).toBe(6);
    expect(result.current.state.displayWires.length).toBe(6);
    expect(result.current.state.isAnimating).toBe(false); // autoSimulation=false
    
    // ゲート詳細確認
    const gates = result.current.state.displayGates;
    const notGates = gates.filter(g => g.type === 'NOT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    
    expect(notGates.length).toBe(3);
    expect(outputGates.length).toBe(3);
    
    console.log('🔍 Gate states:', {
      NOT1: gates.find(g => g.id === 'NOT1')?.outputs[0],
      NOT2: gates.find(g => g.id === 'NOT2')?.outputs[0],
      NOT3: gates.find(g => g.id === 'NOT3')?.outputs[0]
    });
    
    console.log('✅ useCanvas works with real timers!');
  }, 10000);

  it('should work with fake timers if properly managed', async () => {
    console.log('🔍 Testing useCanvas with MANAGED fake timers');
    
    // テスト内でfake timersを有効化
    vi.useFakeTimers();
    
    try {
      const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
      const dataSource: CanvasDataSource = {
        galleryCircuit: ringOsc,
      };

      const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

      console.log('🔍 renderHook with fake timers completed');

      // fake timers で適切に時間を進める
      await act(async () => {
        console.log('🔍 Advancing fake timers by 500ms');
        vi.advanceTimersByTime(500);
        console.log('🔍 Fake timers advanced');
        
        // flush promises
        await vi.runAllTimersAsync();
        console.log('🔍 All timers flushed');
      });

      console.log('🔍 Checking state after fake timer advance');
      
      expect(result.current.state.displayGates.length).toBe(6);
      expect(result.current.state.displayWires.length).toBe(6);
      
      console.log('✅ useCanvas works with managed fake timers!');
      
    } finally {
      vi.useRealTimers();
    }
  }, 10000);

  it('should handle both half-adder and ring oscillator', async () => {
    console.log('🔍 Testing both circuit types');
    
    // 半加算器（シンプル）
    const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
    const halfAdderSource: CanvasDataSource = { galleryCircuit: halfAdder };

    const { result: halfAdderResult } = renderHook(() => useCanvas(galleryConfig, halfAdderSource));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(halfAdderResult.current.state.displayGates.length).toBeGreaterThan(0);
    console.log('✅ Half-adder loaded:', halfAdderResult.current.state.displayGates.length, 'gates');

    // リングオシレータ（循環）
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    const ringOscSource: CanvasDataSource = { galleryCircuit: ringOsc };

    const { result: ringOscResult } = renderHook(() => useCanvas(galleryConfig, ringOscSource));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(ringOscResult.current.state.displayGates.length).toBe(6);
    console.log('✅ Ring oscillator loaded:', ringOscResult.current.state.displayGates.length, 'gates');
    
    console.log('✅ Both circuit types work correctly!');
  }, 10000);
});