/**
 * Trigger入力処理詳細テスト
 * 
 * 目的: trigger入力の問題を詳細に分析
 * - enable制御は正常動作
 * - trigger制御は異常動作
 * この差分を詳細に調査してバグを特定
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe('Trigger Input Processing - Detailed Analysis', () => {
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

  describe('Initial State Analysis', () => {
    it('trigger入力の初期値を詳細確認', () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      const triggerGate = result.current.state.displayGates.find(g => g.id === 'trigger');
      
      console.log('🔍 Trigger Gate Initial State:', {
        id: triggerGate?.id,
        type: triggerGate?.type,
        outputs: triggerGate?.outputs,
        inputs: triggerGate?.inputs,
        output: triggerGate?.output,
      });

      // 期待値: 定義で outputs: [false]
      expect(triggerGate?.outputs?.[0]).toBe(false);
    });

    it('enable入力の初期値を比較確認', () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      const enableGate = result.current.state.displayGates.find(g => g.id === 'enable');
      
      console.log('🔍 Enable Gate Initial State:', {
        id: enableGate?.id,
        type: enableGate?.type,
        outputs: enableGate?.outputs,
        inputs: enableGate?.inputs,
        output: enableGate?.output,
      });

      // 期待値: 定義で outputs: [true]
      expect(enableGate?.outputs?.[0]).toBe(true);
    });

    it('回路定義の初期値を直接確認', () => {
      // 定義ファイルから直接確認
      const triggerDef = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'trigger');
      const enableDef = SELF_OSCILLATING_MEMORY_FINAL.gates.find(g => g.id === 'enable');

      console.log('🔍 Circuit Definition Values:', {
        trigger: {
          id: triggerDef?.id,
          outputs: triggerDef?.outputs,
        },
        enable: {
          id: enableDef?.id,
          outputs: enableDef?.outputs,
        }
      });

      expect(triggerDef?.outputs?.[0]).toBe(false);
      expect(enableDef?.outputs?.[0]).toBe(true);
    });
  });

  describe('Single Input Toggle Analysis', () => {
    it('trigger入力の単一切り替えを詳細分析', () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // 初期状態
      const triggerBefore = result.current.state.displayGates.find(g => g.id === 'trigger');
      console.log('🔍 Trigger Before Toggle:', {
        outputs: triggerBefore?.outputs,
        output: triggerBefore?.output,
      });

      // toggleInput実行
      let toggleResult: any;
      act(() => {
        toggleResult = result.current.actions.toggleInput('trigger');
      });

      console.log('🔍 Toggle Result:', toggleResult);

      // 切り替え後状態
      const triggerAfter = result.current.state.displayGates.find(g => g.id === 'trigger');
      console.log('🔍 Trigger After Toggle:', {
        outputs: triggerAfter?.outputs,
        output: triggerAfter?.output,
      });

      // 期待: false → true に変更
      expect(triggerAfter?.outputs?.[0]).toBe(true);
    });

    it('enable入力の単一切り替えを比較分析', () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // 初期状態
      const enableBefore = result.current.state.displayGates.find(g => g.id === 'enable');
      console.log('🔍 Enable Before Toggle:', {
        outputs: enableBefore?.outputs,
        output: enableBefore?.output,
      });

      // toggleInput実行
      let toggleResult: any;
      act(() => {
        toggleResult = result.current.actions.toggleInput('enable');
      });

      console.log('🔍 Enable Toggle Result:', toggleResult);

      // 切り替え後状態
      const enableAfter = result.current.state.displayGates.find(g => g.id === 'enable');
      console.log('🔍 Enable After Toggle:', {
        outputs: enableAfter?.outputs,
        output: enableAfter?.output,
      });

      // 期待: true → false に変更
      expect(enableAfter?.outputs?.[0]).toBe(false);
    });
  });

  describe('Double Toggle Analysis', () => {
    it('trigger入力の二重切り替えで元に戻るか', () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // 初期状態記録
      const initialTrigger = result.current.state.displayGates.find(g => g.id === 'trigger');
      const initialValue = initialTrigger?.outputs?.[0];

      console.log('🔍 Initial Trigger Value:', initialValue);

      // 1回目切り替え
      act(() => {
        result.current.actions.toggleInput('trigger');
      });

      const afterFirst = result.current.state.displayGates.find(g => g.id === 'trigger');
      console.log('🔍 After First Toggle:', afterFirst?.outputs?.[0]);

      // 2回目切り替え
      act(() => {
        result.current.actions.toggleInput('trigger');
      });

      const afterSecond = result.current.state.displayGates.find(g => g.id === 'trigger');
      console.log('🔍 After Second Toggle:', afterSecond?.outputs?.[0]);

      // 期待: 初期値に戻る
      expect(afterSecond?.outputs?.[0]).toBe(initialValue);
    });
  });

  describe('Circuit State Impact Analysis', () => {
    it('trigger切り替えが他のゲートに与える影響', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーション開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 200));

      // 切り替え前の回路状態記録
      const beforeToggle = {
        trigger_or: result.current.state.displayGates.find(g => g.id === 'trigger_or'),
        nor1: result.current.state.displayGates.find(g => g.id === 'nor1'),
        nor2: result.current.state.displayGates.find(g => g.id === 'nor2'),
        out_nor1: result.current.state.displayGates.find(g => g.id === 'out_nor1'),
        out_nor2: result.current.state.displayGates.find(g => g.id === 'out_nor2'),
      };

      console.log('🔍 Circuit State Before Trigger Toggle:', {
        trigger_or_output: beforeToggle.trigger_or?.outputs?.[0],
        nor1_output: beforeToggle.nor1?.outputs?.[0],
        nor2_output: beforeToggle.nor2?.outputs?.[0],
        out_nor1_input: beforeToggle.out_nor1?.inputs?.[0],
        out_nor2_input: beforeToggle.out_nor2?.inputs?.[0],
      });

      // trigger切り替え
      act(() => {
        result.current.actions.toggleInput('trigger');
      });

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 200));

      // 切り替え後の回路状態記録
      const afterToggle = {
        trigger_or: result.current.state.displayGates.find(g => g.id === 'trigger_or'),
        nor1: result.current.state.displayGates.find(g => g.id === 'nor1'),
        nor2: result.current.state.displayGates.find(g => g.id === 'nor2'),
        out_nor1: result.current.state.displayGates.find(g => g.id === 'out_nor1'),
        out_nor2: result.current.state.displayGates.find(g => g.id === 'out_nor2'),
      };

      console.log('🔍 Circuit State After Trigger Toggle:', {
        trigger_or_output: afterToggle.trigger_or?.outputs?.[0],
        nor1_output: afterToggle.nor1?.outputs?.[0],
        nor2_output: afterToggle.nor2?.outputs?.[0],
        out_nor1_input: afterToggle.out_nor1?.inputs?.[0],
        out_nor2_input: afterToggle.out_nor2?.inputs?.[0],
      });

      // 変化があったかを確認
      const hasChanges = 
        beforeToggle.trigger_or?.outputs?.[0] !== afterToggle.trigger_or?.outputs?.[0] ||
        beforeToggle.nor1?.outputs?.[0] !== afterToggle.nor1?.outputs?.[0] ||
        beforeToggle.nor2?.outputs?.[0] !== afterToggle.nor2?.outputs?.[0];

      console.log('🔍 Circuit Changes Detected:', hasChanges);

      // trigger操作は回路状態に影響を与えるべき
      expect(hasChanges).toBe(true);
    });

    it('enable切り替えとtrigger切り替えの影響比較', async () => {
      // enable切り替えのテスト
      const { result: enableResult } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      act(() => {
        enableResult.current.actions.startAnimation();
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const beforeEnable = enableResult.current.state.displayGates.find(g => g.id === 'out_nor1')?.inputs?.[0];

      act(() => {
        enableResult.current.actions.toggleInput('enable');
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const afterEnable = enableResult.current.state.displayGates.find(g => g.id === 'out_nor1')?.inputs?.[0];

      console.log('🔍 Enable Toggle Impact:', {
        before: beforeEnable,
        after: afterEnable,
        changed: beforeEnable !== afterEnable,
      });

      // trigger切り替えのテスト
      const { result: triggerResult } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      act(() => {
        triggerResult.current.actions.startAnimation();
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const beforeTrigger = triggerResult.current.state.displayGates.find(g => g.id === 'out_nor1')?.inputs?.[0];

      act(() => {
        triggerResult.current.actions.toggleInput('trigger');
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const afterTrigger = triggerResult.current.state.displayGates.find(g => g.id === 'out_nor1')?.inputs?.[0];

      console.log('🔍 Trigger Toggle Impact:', {
        before: beforeTrigger,
        after: afterTrigger,
        changed: beforeTrigger !== afterTrigger,
      });

      // 両方とも影響があるべき（ただし、異なるメカニズム）
      const enableChanged = beforeEnable !== afterEnable;
      const triggerChanged = beforeTrigger !== afterTrigger;

      console.log('🔍 Comparison:', {
        enableChanged,
        triggerChanged,
        bothWork: enableChanged && triggerChanged,
      });

      // 期待: 両方とも回路に影響を与える
      expect(enableChanged).toBe(true);
      expect(triggerChanged).toBe(true);
    });
  });

  describe('Oscillation Recovery Analysis', () => {
    it('trigger操作後の発振復帰能力を詳細分析', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーション開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // 初期発振を確認
      await new Promise(resolve => setTimeout(resolve, 300));

      const initialStates: boolean[] = [];
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        const out = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        initialStates.push(out?.inputs?.[0] || false);
      }

      const initialOscillating = new Set(initialStates).size > 1;
      console.log('🔍 Initial Oscillation:', {
        states: initialStates,
        oscillating: initialOscillating,
      });

      // trigger操作（OFF→ON→OFF）
      act(() => {
        result.current.actions.toggleInput('trigger'); // ON
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      act(() => {
        result.current.actions.toggleInput('trigger'); // OFF
      });

      // 復帰能力をチェック
      await new Promise(resolve => setTimeout(resolve, 300));

      const recoveryStates: boolean[] = [];
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        const out = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        recoveryStates.push(out?.inputs?.[0] || false);
      }

      const recoveredOscillating = new Set(recoveryStates).size > 1;
      console.log('🔍 Recovery After Trigger:', {
        states: recoveryStates,
        oscillating: recoveredOscillating,
        recovered: recoveredOscillating,
      });

      // 期待: 発振が復帰する
      expect(recoveredOscillating).toBe(true);
    }, 10000);
  });
});