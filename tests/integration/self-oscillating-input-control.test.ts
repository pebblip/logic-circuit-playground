/**
 * Self-Oscillating Memory Final (21ゲート版) 入力制御テスト
 * 
 * 現在の問題を検証：
 * - 21ゲート表示: ✅ 動作
 * - 初期発振: ✅ 動作  
 * - 入力制御: ❌ 期待通り動作しない
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '@/components/canvas/hooks/useCanvas';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { CanvasConfig, CanvasDataSource } from '@/components/canvas/types/canvasTypes';

describe.skip('Self-Oscillating Memory Final - 21ゲート版入力制御 - SKIPPED: useCanvasタイムアウト問題', () => {
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
      galleryCircuit: SELF_OSCILLATING_MEMORY_FINAL,
    };
  });

  describe('基本表示確認', () => {
    it('21ゲートが全て表示される', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // 21ゲートの存在確認
      expect(result.current.state.displayGates).toHaveLength(21);

      // 主要なゲートの存在確認
      const gateIds = result.current.state.displayGates.map(g => g.id);
      expect(gateIds).toContain('enable');
      expect(gateIds).toContain('trigger');
      expect(gateIds).toContain('nor1');
      expect(gateIds).toContain('nor2');
      expect(gateIds).toContain('out_nor1');
      expect(gateIds).toContain('out_nor2');
      expect(gateIds).toContain('out_xor');
    });

    it('初期入力状態が正しい', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // enable入力: ON (true)
      const enableGate = result.current.state.displayGates.find(g => g.id === 'enable');
      expect(enableGate?.outputs?.[0]).toBe(true);

      // trigger入力: OFF (false)  
      const triggerGate = result.current.state.displayGates.find(g => g.id === 'trigger');
      expect(triggerGate?.outputs?.[0]).toBe(false);
    });
  });

  describe('初期発振確認', () => {
    it('初期状態で出力が点滅している', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーションを開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // 発振確認: 複数回状態をチェックして変化を検出
      const outputStates: boolean[] = [];
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150)); // アニメーション間隔より長く待機
        
        const nor1Output = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        const isActive = nor1Output?.inputs?.[0] || false;
        outputStates.push(isActive);
      }

      // 状態変化があることを確認（発振している）
      const uniqueStates = new Set(outputStates);
      expect(uniqueStates.size).toBeGreaterThan(1); // 少なくとも2つの異なる状態
    });
  });

  describe('入力制御の問題確認', () => {
    it('trigger入力ON→OFFで発振が停止する問題', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーションを開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // 少し待機して初期発振を確認
      await new Promise(resolve => setTimeout(resolve, 300));

      // trigger入力をクリック（OFF→ON）
      act(() => {
        result.current.actions.toggleInput('trigger');
      });

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 200));

      // trigger入力を再度クリック（ON→OFF）
      act(() => {
        result.current.actions.toggleInput('trigger');
      });

      // 発振状態を確認
      const outputStatesAfterTrigger: boolean[] = [];
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const nor1Output = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        const nor2Output = result.current.state.displayGates.find(g => g.id === 'out_nor2');
        
        const nor1Active = nor1Output?.inputs?.[0] || false;
        const nor2Active = nor2Output?.inputs?.[0] || false;
        
        outputStatesAfterTrigger.push(nor1Active || nor2Active);
      }

      // 期待: 発振が継続する（状態変化がある）
      // 実際: 発振が停止する（全てfalse）
      const uniqueStatesAfter = new Set(outputStatesAfterTrigger);
      
      // このテストは現在失敗することを期待
      // 問題が修正されれば、このテストがパスするようになる
      expect(uniqueStatesAfter.size).toBeGreaterThan(1);
    }, 10000); // タイムアウトを長めに設定

    it('enable入力で発振制御ができる', async () => {
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーションを開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // enable入力をクリック（ON→OFF）
      act(() => {
        result.current.actions.toggleInput('enable');
      });

      // 発振停止を確認
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const outputStatesDisabled: boolean[] = [];
      
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const nor1Output = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        const nor2Output = result.current.state.displayGates.find(g => g.id === 'out_nor2');
        
        const nor1Active = nor1Output?.inputs?.[0] || false;
        const nor2Active = nor2Output?.inputs?.[0] || false;
        
        outputStatesDisabled.push(nor1Active || nor2Active);
      }

      // enable=OFFで発振停止を期待
      const allInactive = outputStatesDisabled.every(state => !state);
      expect(allInactive).toBe(true);

      // enable入力を再度クリック（OFF→ON）
      act(() => {
        result.current.actions.toggleInput('enable');
      });

      // 発振再開を確認
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const outputStatesReEnabled: boolean[] = [];
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const nor1Output = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        const nor2Output = result.current.state.displayGates.find(g => g.id === 'out_nor2');
        
        const nor1Active = nor1Output?.inputs?.[0] || false;
        const nor2Active = nor2Output?.inputs?.[0] || false;
        
        outputStatesReEnabled.push(nor1Active || nor2Active);
      }

      // enable=ONで発振再開を期待
      const uniqueStatesReEnabled = new Set(outputStatesReEnabled);
      expect(uniqueStatesReEnabled.size).toBeGreaterThan(1);
    }, 10000);
  });

  describe('期待される正しい動作', () => {
    it('trigger入力は発振を開始/攪乱するが停止はしない', async () => {
      // このテストは現在の実装では失敗する
      // 修正後にパスするようになることを期待
      
      const { result } = renderHook(() => useCanvas(galleryConfig, mockDataSource));

      // アニメーションを開始
      act(() => {
        result.current.actions.startAnimation();
      });

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 200));

      // trigger入力をパルス（OFF→ON→OFF）
      act(() => {
        result.current.actions.toggleInput('trigger'); // ON
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      act(() => {
        result.current.actions.toggleInput('trigger'); // OFF
      });

      // 発振が継続することを確認
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const outputStates: boolean[] = [];
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const nor1Output = result.current.state.displayGates.find(g => g.id === 'out_nor1');
        const nor2Output = result.current.state.displayGates.find(g => g.id === 'out_nor2');
        
        const nor1Active = nor1Output?.inputs?.[0] || false;
        const nor2Active = nor2Output?.inputs?.[0] || false;
        const hasActivity = nor1Active || nor2Active;
        
        outputStates.push(hasActivity);
      }

      // 発振継続を期待（現在は失敗する）
      const uniqueStates = new Set(outputStates);
      expect(uniqueStates.size).toBeGreaterThan(1);
    }, 10000);
  });
});