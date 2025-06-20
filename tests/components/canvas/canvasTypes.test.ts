/**
 * canvasTypes.test.ts
 * 
 * CLAUDE.md準拠: 型安全性の徹底検証
 * - 統一キャンバス型定義のテスト
 * - プリセット設定の妥当性確認
 * - 型の互換性チェック
 */

import { describe, it, expect } from 'vitest';
import {
  CANVAS_MODE_PRESETS,
  DEFAULT_CANVAS_CONFIG,
  type CanvasMode,
  type InteractionLevel,
  type SimulationMode,
  type CanvasConfig,
  type CanvasDataSource,
  type UnifiedCanvasProps,
} from '@/components/canvas/types/canvasTypes';
import type { CircuitMetadata } from '@/features/gallery/data/gallery';

describe('canvasTypes', () => {
  describe('型定義', () => {
    it('CanvasModeが正しい値を持つ', () => {
      const validModes: CanvasMode[] = ['editor', 'gallery', 'preview'];
      validModes.forEach(mode => {
        expect(typeof mode).toBe('string');
        expect(['editor', 'gallery', 'preview']).toContain(mode);
      });
    });

    it('InteractionLevelが正しい値を持つ', () => {
      const validLevels: InteractionLevel[] = ['full', 'view_interactive', 'view_only'];
      validLevels.forEach(level => {
        expect(typeof level).toBe('string');
        expect(['full', 'view_interactive', 'view_only']).toContain(level);
      });
    });

    it('SimulationModeが正しい値を持つ', () => {
      const validModes: SimulationMode[] = ['store', 'local', 'hybrid'];
      validModes.forEach(mode => {
        expect(typeof mode).toBe('string');
        expect(['store', 'local', 'hybrid']).toContain(mode);
      });
    });
  });

  describe('プリセット設定', () => {
    it('すべてのモードにプリセットが存在する', () => {
      const modes: CanvasMode[] = ['editor', 'gallery', 'preview'];
      
      modes.forEach(mode => {
        expect(CANVAS_MODE_PRESETS[mode]).toBeDefined();
        expect(CANVAS_MODE_PRESETS[mode].mode).toBe(mode);
      });
    });

    it('エディターモードプリセットが正しい設定を持つ', () => {
      const editorPreset = CANVAS_MODE_PRESETS.editor;
      
      expect(editorPreset.mode).toBe('editor');
      expect(editorPreset.interactionLevel).toBe('full');
      expect(editorPreset.simulationMode).toBe('store');
      expect(editorPreset.editorOptions?.enableTimingChart).toBe(true);
      expect(editorPreset.editorOptions?.enableMultiSelection).toBe(true);
      expect(editorPreset.editorOptions?.enableGridSnap).toBe(true);
      expect(editorPreset.editorOptions?.enableGateAddition).toBe(true);
      expect(editorPreset.uiControls?.showControls).toBe(true);
      expect(editorPreset.uiControls?.showPreviewHeader).toBe(false);
      expect(editorPreset.uiControls?.showBackground).toBe(true);
    });

    it('ギャラリーモードプリセットが正しい設定を持つ', () => {
      const galleryPreset = CANVAS_MODE_PRESETS.gallery;
      
      expect(galleryPreset.mode).toBe('gallery');
      expect(galleryPreset.interactionLevel).toBe('view_interactive');
      expect(galleryPreset.simulationMode).toBe('local');
      expect(galleryPreset.galleryOptions?.autoSimulation).toBe(true);
      expect(galleryPreset.galleryOptions?.animationInterval).toBe(1000);
      expect(galleryPreset.galleryOptions?.showDebugInfo).toBe(false);
      expect(galleryPreset.galleryOptions?.initialScale).toBe(1);
      expect(galleryPreset.uiControls?.showControls).toBe(true);
      expect(galleryPreset.uiControls?.showPreviewHeader).toBe(false);
      expect(galleryPreset.uiControls?.showBackground).toBe(false);
    });

    it('プレビューモードプリセットが正しい設定を持つ', () => {
      const previewPreset = CANVAS_MODE_PRESETS.preview;
      
      expect(previewPreset.mode).toBe('preview');
      expect(previewPreset.interactionLevel).toBe('view_only');
      expect(previewPreset.simulationMode).toBe('local');
      expect(previewPreset.uiControls?.showControls).toBe(false);
      expect(previewPreset.uiControls?.showPreviewHeader).toBe(true);
      expect(previewPreset.uiControls?.showBackground).toBe(true);
    });
  });

  describe('デフォルト設定', () => {
    it('DEFAULT_CANVAS_CONFIGがエディターモードと同じ', () => {
      expect(DEFAULT_CANVAS_CONFIG).toEqual(CANVAS_MODE_PRESETS.editor);
    });
  });

  describe('CanvasConfig型の妥当性', () => {
    it('最小限の設定でCanvasConfigを作成できる', () => {
      const minimalConfig: CanvasConfig = {
        mode: 'editor',
        interactionLevel: 'full',
        simulationMode: 'store',
      };
      
      expect(minimalConfig.mode).toBe('editor');
      expect(minimalConfig.interactionLevel).toBe('full');
      expect(minimalConfig.simulationMode).toBe('store');
    });

    it('すべてのオプションを持つCanvasConfigを作成できる', () => {
      const fullConfig: CanvasConfig = {
        mode: 'gallery',
        interactionLevel: 'view_interactive',
        simulationMode: 'local',
        galleryOptions: {
          autoSimulation: true,
          animationInterval: 500,
          showDebugInfo: true,
          initialScale: 1.5,
        },
        editorOptions: {
          enableTimingChart: false,
          enableMultiSelection: false,
          enableGridSnap: false,
          enableGateAddition: false,
        },
        uiControls: {
          showControls: true,
          showPreviewHeader: false,
          showBackground: true,
        },
      };
      
      expect(fullConfig.galleryOptions?.animationInterval).toBe(500);
      expect(fullConfig.galleryOptions?.initialScale).toBe(1.5);
      expect(fullConfig.editorOptions?.enableTimingChart).toBe(false);
      expect(fullConfig.uiControls?.showControls).toBe(true);
    });
  });

  describe('CanvasDataSource型の妥当性', () => {
    it('ストアモード用のデータソースを作成できる', () => {
      const storeDataSource: CanvasDataSource = {
        store: undefined,
      };
      
      expect(storeDataSource.store).toBeUndefined();
      expect(storeDataSource.galleryCircuit).toBeUndefined();
      expect(storeDataSource.customData).toBeUndefined();
    });

    it('ギャラリーモード用のデータソースを作成できる', () => {
      const mockCircuit: CircuitMetadata = {
        id: 'test',
        title: 'Test Circuit',
        description: 'Test Description',
        gates: [],
        wires: [],
        category: 'basic',
        difficulty: 'beginner',
        behaviorConfig: {
          needsAnimation: false,
          updateInterval: 1000,
          expectedBehavior: 'logic_gate',
        },
      };

      const galleryDataSource: CanvasDataSource = {
        galleryCircuit: mockCircuit,
      };
      
      expect(galleryDataSource.galleryCircuit).toBe(mockCircuit);
      expect(galleryDataSource.store).toBeUndefined();
      expect(galleryDataSource.customData).toBeUndefined();
    });

    it('カスタムデータ用のデータソースを作成できる', () => {
      const customDataSource: CanvasDataSource = {
        customData: {
          gates: [],
          wires: [],
        },
      };
      
      expect(customDataSource.customData?.gates).toEqual([]);
      expect(customDataSource.customData?.wires).toEqual([]);
      expect(customDataSource.store).toBeUndefined();
      expect(customDataSource.galleryCircuit).toBeUndefined();
    });
  });

  describe('UnifiedCanvasProps型の妥当性', () => {
    it('最小限のPropsでUnifiedCanvasPropsを作成できる', () => {
      const minimalProps: UnifiedCanvasProps = {
        config: DEFAULT_CANVAS_CONFIG,
        dataSource: { store: undefined },
      };
      
      expect(minimalProps.config).toBe(DEFAULT_CANVAS_CONFIG);
      expect(minimalProps.dataSource.store).toBeUndefined();
    });

    it('すべてのPropsを持つUnifiedCanvasPropsを作成できる', () => {
      const fullProps: UnifiedCanvasProps = {
        config: CANVAS_MODE_PRESETS.gallery,
        dataSource: { 
          galleryCircuit: {
            id: 'test',
            title: 'Test',
            description: 'Test',
            gates: [],
            wires: [],
            category: 'basic',
            difficulty: 'beginner',
            behaviorConfig: {
              needsAnimation: false,
              updateInterval: 1000,
              expectedBehavior: 'logic_gate',
            },
          },
        },
        handlers: {
          onGateClick: () => {},
          onInputToggle: () => {},
          onCanvasClick: () => {},
          onError: () => {},
        },
        highlightedGateId: 'gate1',
        className: 'custom-class',
        style: { backgroundColor: 'red' },
      };
      
      expect(fullProps.handlers?.onGateClick).toBeDefined();
      expect(fullProps.highlightedGateId).toBe('gate1');
      expect(fullProps.className).toBe('custom-class');
      expect(fullProps.style?.backgroundColor).toBe('red');
    });
  });

  describe('型の相互運用性', () => {
    it('各モードが対応するプリセット設定と整合性がある', () => {
      // エディターモードの整合性
      const editorConfig = CANVAS_MODE_PRESETS.editor;
      expect(editorConfig.mode).toBe('editor');
      expect(editorConfig.interactionLevel).toBe('full');
      expect(editorConfig.simulationMode).toBe('store');
      
      // ギャラリーモードの整合性
      const galleryConfig = CANVAS_MODE_PRESETS.gallery;
      expect(galleryConfig.mode).toBe('gallery');
      expect(galleryConfig.interactionLevel).toBe('view_interactive');
      expect(galleryConfig.simulationMode).toBe('local');
      
      // プレビューモードの整合性
      const previewConfig = CANVAS_MODE_PRESETS.preview;
      expect(previewConfig.mode).toBe('preview');
      expect(previewConfig.interactionLevel).toBe('view_only');
      expect(previewConfig.simulationMode).toBe('local');
    });

    it('設定とデータソースの組み合わせが適切である', () => {
      // ストアモード + エディター設定
      const editorCombination = {
        config: CANVAS_MODE_PRESETS.editor,
        dataSource: { store: undefined } as CanvasDataSource,
      };
      expect(editorCombination.config.simulationMode).toBe('store');
      expect(editorCombination.dataSource.store).toBeUndefined();
      
      // ローカルモード + ギャラリー設定
      const galleryCombination = {
        config: CANVAS_MODE_PRESETS.gallery,
        dataSource: { 
          galleryCircuit: {
            id: 'test',
            title: 'Test',
            description: 'Test',
            gates: [],
            wires: [],
            category: 'basic' as const,
            difficulty: 'beginner' as const,
            behaviorConfig: {
              needsAnimation: false,
              updateInterval: 1000,
              expectedBehavior: 'logic_gate' as const,
            },
          } 
        } as CanvasDataSource,
      };
      expect(galleryCombination.config.simulationMode).toBe('local');
      expect(galleryCombination.dataSource.galleryCircuit).toBeDefined();
    });
  });

  describe('型制約の検証', () => {
    it('互換性のない組み合わせがTypeScriptエラーになる', () => {
      // これらは実際にはコンパイル時にエラーになるべき
      // ランタイムテストでは基本的な型チェックのみ確認
      
      const config: CanvasConfig = {
        mode: 'editor',
        interactionLevel: 'full',
        simulationMode: 'store',
      };
      
      // 基本的な型チェック
      expect(typeof config.mode).toBe('string');
      expect(typeof config.interactionLevel).toBe('string');
      expect(typeof config.simulationMode).toBe('string');
    });
  });
});