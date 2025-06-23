/**
 * SR-LATCHのデッドロック問題の検証
 * 
 * 問題：trigger入力を変更するとSR-LATCHが反応しなくなる
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe('SR-LATCH Deadlock Investigation', () => {
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

  it('NORゲートとSR-LATCHの状態を追跡', async () => {
    const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

    // アニメーション開始
    act(() => {
      result.current.actions.startAnimation();
    });
    
    // 初期状態を記録
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const getGateStates = () => {
      const nor1 = result.current.state.displayGates.find(g => g.id === 'nor1');
      const nor2 = result.current.state.displayGates.find(g => g.id === 'nor2');
      const memory1 = result.current.state.displayGates.find(g => g.id === 'memory1');
      const memory2 = result.current.state.displayGates.find(g => g.id === 'memory2');
      
      return {
        nor1: {
          inputs: nor1?.inputs,
          outputs: nor1?.outputs
        },
        nor2: {
          inputs: nor2?.inputs,
          outputs: nor2?.outputs
        },
        memory1: {
          inputs: memory1?.inputs,
          outputs: memory1?.outputs
        },
        memory2: {
          inputs: memory2?.inputs,
          outputs: memory2?.outputs
        }
      };
    };

    // 初期状態
    const initialStates = getGateStates();
    console.log('🔍 INITIAL STATES:', initialStates);
    
    // 初期状態でSR-LATCHが動作していることを確認
    const memory1Initial = result.current.state.displayGates.find(g => g.id === 'memory1');
    const memory2Initial = result.current.state.displayGates.find(g => g.id === 'memory2');
    
    // trigger ON
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const statesAfterTriggerOn = getGateStates();
    console.log('🔍 AFTER TRIGGER ON:', statesAfterTriggerOn);
    
    // trigger OFF
    act(() => {
      result.current.actions.toggleInput('trigger');
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const statesAfterTriggerOff = getGateStates();
    console.log('🔍 AFTER TRIGGER OFF:', statesAfterTriggerOff);
    
    // SR-LATCHの禁止状態をチェック
    const checkForbiddenState = (state: any) => {
      // S=1, R=1は禁止状態
      if (state.inputs?.[0] === true && state.inputs?.[1] === true) {
        return true;
      }
      return false;
    };
    
    console.log('🚨 SR-LATCH FORBIDDEN STATES:', {
      memory1_initial: checkForbiddenState(memory1Initial),
      memory1_after_trigger_on: checkForbiddenState(statesAfterTriggerOn.memory1),
      memory1_after_trigger_off: checkForbiddenState(statesAfterTriggerOff.memory1),
      memory2_initial: checkForbiddenState(memory2Initial),
      memory2_after_trigger_on: checkForbiddenState(statesAfterTriggerOn.memory2),
      memory2_after_trigger_off: checkForbiddenState(statesAfterTriggerOff.memory2),
    });
    
    // NORゲートの出力がどちらも同じ値になっていないか確認
    console.log('🔍 NOR GATES ANALYSIS:', {
      initial: {
        nor1_out: initialStates.nor1.outputs?.[0],
        nor2_out: initialStates.nor2.outputs?.[0],
        both_same: initialStates.nor1.outputs?.[0] === initialStates.nor2.outputs?.[0]
      },
      after_trigger_on: {
        nor1_out: statesAfterTriggerOn.nor1.outputs?.[0],
        nor2_out: statesAfterTriggerOn.nor2.outputs?.[0],
        both_same: statesAfterTriggerOn.nor1.outputs?.[0] === statesAfterTriggerOn.nor2.outputs?.[0]
      },
      after_trigger_off: {
        nor1_out: statesAfterTriggerOff.nor1.outputs?.[0],
        nor2_out: statesAfterTriggerOff.nor2.outputs?.[0],
        both_same: statesAfterTriggerOff.nor1.outputs?.[0] === statesAfterTriggerOff.nor2.outputs?.[0]
      }
    });

    // trigger_or の状態も確認
    const trigger_or = result.current.state.displayGates.find(g => g.id === 'trigger_or');
    console.log('🔍 TRIGGER_OR STATE:', {
      inputs: trigger_or?.inputs,
      outputs: trigger_or?.outputs
    });
    
    // アサーション：SR-LATCHが禁止状態になっていないこと
    expect(checkForbiddenState(statesAfterTriggerOff.memory1)).toBe(false);
    expect(checkForbiddenState(statesAfterTriggerOff.memory2)).toBe(false);
  });
});