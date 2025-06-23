/**
 * useCanvas最小限テスト
 * 
 * 目的: useCanvasのどこで初期化が止まっているかを特定
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe('useCanvas Minimal Test', () => {
  let galleryConfig: CanvasConfig;
  
  beforeEach(() => {
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: false, // アニメーション完全無効
        animationInterval: 100,
        showDebugInfo: false, // デバッグログも無効
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

  it('should create useCanvas hook without hanging (step-by-step)', async () => {
    console.log('🔍 Step 1: Creating ring oscillator data source');
    
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    expect(ringOsc).toBeDefined();
    
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };
    
    console.log('🔍 Step 2: Attempting to renderHook with useCanvas');
    
    // useCanvasのレンダリング（ここで止まっている可能性）
    const { result } = renderHook(() => {
      console.log('🔍 Step 2a: Inside useCanvas hook');
      const canvasResult = useCanvas(galleryConfig, dataSource);
      console.log('🔍 Step 2b: useCanvas returned:', {
        hasState: !!canvasResult.state,
        gateCount: canvasResult.state?.displayGates?.length,
        hasActions: !!canvasResult.actions
      });
      return canvasResult;
    });

    console.log('🔍 Step 3: renderHook completed, checking result');
    
    // 基本的な存在確認（ここまで到達できるかチェック）
    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.actions).toBeDefined();
    
    console.log('🔍 Step 4: Basic structure exists, checking gate count');
    
    // 短時間待機（初期化用）
    await act(async () => {
      console.log('🔍 Step 4a: Starting 100ms wait');
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('🔍 Step 4b: 100ms wait completed');
    });
    
    console.log('🔍 Step 5: Wait completed, checking final state');
    
    // 最終確認
    const finalGateCount = result.current.state.displayGates.length;
    console.log('🔍 Final gate count:', finalGateCount);
    
    expect(finalGateCount).toBeGreaterThan(0);
    
    console.log('✅ Test completed successfully');
  }, 5000); // より短いタイムアウト

  it('should handle half-adder (simpler circuit) correctly', async () => {
    console.log('🔍 Testing with simpler circuit (half-adder)');
    
    const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
    const dataSource: CanvasDataSource = {
      galleryCircuit: halfAdder,
    };

    const { result } = renderHook(() => {
      const canvasResult = useCanvas(galleryConfig, dataSource);
      console.log('🔍 Half-adder useCanvas result:', {
        gateCount: canvasResult.state?.displayGates?.length
      });
      return canvasResult;
    });

    // 短時間待機
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    console.log('🔍 Half-adder final gate count:', result.current.state.displayGates.length);
    expect(result.current.state.displayGates.length).toBeGreaterThan(0);
    
    console.log('✅ Half-adder test completed');
  }, 5000);
});