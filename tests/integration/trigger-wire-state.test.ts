/**
 * Trigger入力のワイヤー状態問題の検証
 * 
 * 問題：
 * - triggerをONにするとピンは緑だが接続線はグレーのまま
 * - trigger OFFで出力がOFFになり復帰しない
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe('Trigger Wire State Issue', () => {
  let galleryConfig: CanvasConfig;
  let mockDataSource: CanvasDataSource;
  
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

    mockDataSource = {
      galleryCircuit: SELF_OSCILLATING_MEMORY_FINAL,
    };
  });

  it('trigger入力のワイヤー状態が正しく更新される', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    await new Promise(resolve => setTimeout(resolve, 200));

    // trigger入力をONに
    act(() => {
      result.current.actions.toggleInput('trigger');
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // trigger入力からのワイヤーを確認
    const triggerWires = result.current.state.displayWires.filter(
      w => w.from.gateId === 'trigger'
    );
    
    // trigger自体の状態確認
    const triggerGate = result.current.state.displayGates.find(g => g.id === 'trigger');
    
    console.log('🔍 TRIGGER STATE CHECK:', {
      triggerOutput: triggerGate?.output,
      triggerOutputs: triggerGate?.outputs,
      wireCount: triggerWires.length,
      wireStates: triggerWires.map(w => ({
        id: w.id,
        to: w.to.gateId,
        isActive: w.isActive
      }))
    });

    // アサーション
    expect(triggerGate?.output).toBe(true);
    expect(triggerGate?.outputs?.[0]).toBe(true);
    
    // ワイヤーもアクティブになるべき
    expect(triggerWires.length).toBeGreaterThan(0);
    expect(triggerWires[0].isActive).toBe(true); // これが失敗するはず
  });

  it('trigger OFF後も発振が継続する', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));

    // 初期の出力状態を記録
    const initialOutputs = result.current.state.displayGates
      .filter(g => g.type === 'OUTPUT')
      .map(g => ({ id: g.id, active: g.inputs?.[0] }));

    // trigger ON
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    await new Promise(resolve => setTimeout(resolve, 200));

    // trigger OFF
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // 出力状態を確認（複数回サンプリング）
    const outputStates: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const outputs = result.current.state.displayGates
        .filter(g => g.type === 'OUTPUT')
        .some(g => g.inputs?.[0]);
      
      outputStates.push(outputs);
    }

    console.log('🔍 OUTPUT STATES AFTER TRIGGER:', {
      initialOutputs,
      outputStates,
      uniqueStates: new Set(outputStates).size
    });

    // 発振が継続しているはず（状態変化がある）
    expect(new Set(outputStates).size).toBeGreaterThan(1);
  });
});