/**
 * リングオシレータ基本動作確認
 * 
 * 目的: アニメーション無効で基本初期化のみを確認
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe('Ring Oscillator Basic Initialization', () => {
  let galleryConfig: CanvasConfig;
  
  beforeEach(() => {
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: false, // アニメーション無効
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

  it('should load ring oscillator circuit correctly (no animation)', async () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };

    const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

    // 短時間で初期化完了
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // 🔍 基本構造の確認
    const gates = result.current.state.displayGates;
    const wires = result.current.state.displayWires;
    
    console.log('📊 Gate count:', gates.length);
    console.log('📊 Wire count:', wires.length);
    
    // 期待される構造
    expect(gates.length).toBe(6); // 3 NOT + 3 OUTPUT
    expect(wires.length).toBe(6); // 6本のワイヤー
    
    // NOT ゲートの確認
    const notGates = gates.filter(g => g.type === 'NOT');
    expect(notGates.length).toBe(3);
    expect(notGates.map(g => g.id).sort()).toEqual(['NOT1', 'NOT2', 'NOT3']);
    
    // OUTPUT ゲートの確認
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    expect(outputGates.length).toBe(3);
    expect(outputGates.map(g => g.id).sort()).toEqual(['OUT_NOT1', 'OUT_NOT2', 'OUT_NOT3']);
    
    // 🔍 初期状態の詳細確認
    const not1 = gates.find(g => g.id === 'NOT1')!;
    const not2 = gates.find(g => g.id === 'NOT2')!;
    const not3 = gates.find(g => g.id === 'NOT3')!;
    
    console.log('🔍 NOT1 initial:', { outputs: not1.outputs, inputs: not1.inputs });
    console.log('🔍 NOT2 initial:', { outputs: not2.outputs, inputs: not2.inputs });
    console.log('🔍 NOT3 initial:', { outputs: not3.outputs, inputs: not3.inputs });
    
    // すべてのゲートが有効な出力を持つ
    expect(not1.outputs).toBeDefined();
    expect(not2.outputs).toBeDefined();
    expect(not3.outputs).toBeDefined();
    expect(not1.outputs.length).toBe(1);
    expect(not2.outputs.length).toBe(1);
    expect(not3.outputs.length).toBe(1);
    
    // 🔗 ワイヤー接続の確認
    const wireConnections = wires.map(w => ({
      id: w.id,
      from: w.from.gateId,
      to: w.to.gateId,
      isActive: w.isActive
    }));
    
    console.log('🔗 Wire connections:', wireConnections);
    
    // 期待される接続
    expect(wires.find(w => w.from.gateId === 'NOT1' && w.to.gateId === 'NOT2')).toBeDefined();
    expect(wires.find(w => w.from.gateId === 'NOT2' && w.to.gateId === 'NOT3')).toBeDefined();
    expect(wires.find(w => w.from.gateId === 'NOT3' && w.to.gateId === 'NOT1')).toBeDefined();
  }, 10000);

  it('should detect ring oscillator as oscillating circuit type', async () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    // メタデータ確認
    expect(ringOsc.simulationConfig?.needsAnimation).toBe(true);
    expect(ringOsc.simulationConfig?.expectedBehavior).toBe('oscillator');
    
    const dataSource: CanvasDataSource = {
      galleryCircuit: ringOsc,
    };

    const { result } = renderHook(() => useCanvas(galleryConfig, dataSource));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // 回路が正しく読み込まれている
    expect(result.current.state.displayGates.length).toBeGreaterThan(0);
    
    // CLOCKゲートがないことを確認
    const hasClockGate = result.current.state.displayGates.some(g => g.type === 'CLOCK');
    expect(hasClockGate).toBe(false);
    
    // アニメーション無効なので isAnimating は false
    expect(result.current.state.isAnimating).toBe(false);
  }, 10000);
});