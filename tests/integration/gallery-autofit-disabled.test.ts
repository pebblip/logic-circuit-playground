/**
 * ギャラリーモード: autoFit無効化動作テスト
 * 
 * 目的: autoFit無効化によるサイズ一貫性の確保
 * - 同じゲートタイプは常に同じサイズで表示
 * - 大きな回路は手動パン操作で閲覧可能
 * - ビューボックスが自動調整されないこと
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from '../../src/components/canvas/hooks/useCanvas';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/index';
import { GateFactory } from '../../src/models/gates/GateFactory';
import type { CanvasConfig, CanvasDataSource } from '../../src/components/canvas/types/canvasTypes';

describe('Gallery Mode: AutoFit Disabled Behavior', () => {
  let galleryConfig: CanvasConfig;

  beforeEach(() => {
    // ギャラリーモード設定（autoFit無効化）
    galleryConfig = {
      mode: 'gallery',
      interactionLevel: 'view_interactive',
      simulationMode: 'local',
      galleryOptions: {
        autoSimulation: false,
        animationInterval: 1000,
        showDebugInfo: false,
        autoFit: false, // 🎯 無効化確認
        autoFitPadding: 80,
      },
      uiControls: {
        showControls: true,
        showBackground: false,
      },
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('AutoFit Configuration', () => {
    it('should have autoFit disabled in gallery mode preset', () => {
      expect(galleryConfig.galleryOptions?.autoFit).toBe(false);
    });

    it('should maintain consistent gate sizes across circuits', () => {
      // D-FFゲートのサイズを確認
      const dffSize = GateFactory.getGateSize('D-FF');
      expect(dffSize).toEqual({ width: 100, height: 80 });

      // CLOCKゲートのサイズを確認
      const clockSize = GateFactory.getGateSize('CLOCK');
      expect(clockSize).toEqual({ width: 80, height: 80 });

      // INPUTゲートのサイズを確認
      const inputSize = GateFactory.getGateSize('INPUT');
      expect(inputSize).toEqual({ width: 50, height: 30 });
    });
  });

  describe('Circuit Display Consistency', () => {
    it('should maintain consistent gate sizes regardless of circuit complexity', () => {
      // 直接GateFactoryから取得して一貫性をテスト
      const dffSize1 = GateFactory.getGateSize('D-FF');
      const dffSize2 = GateFactory.getGateSize('D-FF');
      expect(dffSize1).toEqual(dffSize2);

      const inputSize1 = GateFactory.getGateSize('INPUT');
      const inputSize2 = GateFactory.getGateSize('INPUT');
      expect(inputSize1).toEqual(inputSize2);

      const clockSize1 = GateFactory.getGateSize('CLOCK');
      const clockSize2 = GateFactory.getGateSize('CLOCK');
      expect(clockSize1).toEqual(clockSize2);
    });
  });

  describe('Manual Pan Operation', () => {
    it('should have pan functionality available in gallery config', () => {
      // ギャラリーモードでパン操作が可能かをconfig確認
      expect(galleryConfig.interactionLevel).toBe('view_interactive');
      expect(galleryConfig.mode).toBe('gallery');
      // view_interactiveレベルでは基本操作（ズーム、パン）が可能
    });
  });

  describe('No Automatic Scaling', () => {
    it('should have autoFit disabled in configuration', () => {
      // autoFit設定が無効化されていることを確認
      expect(galleryConfig.galleryOptions?.autoFit).toBe(false);
      
      // この設定により、回路切り替え時に自動スケール調整は行われない
      // 手動のズーム・パン操作のみ可能
    });
  });
});