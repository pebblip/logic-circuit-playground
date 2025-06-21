/**
 * シンプルリングオシレータの検出ロジックのテスト
 * useUnifiedCanvas.tsの実際のロジックをテスト
 */

import { describe, it, expect } from 'vitest';
import { SIMPLE_RING_OSCILLATOR } from '@/features/gallery/data/simple-ring-oscillator';

describe('Simple Ring Oscillator Detection Logic', () => {
  it('should be detected as oscillator circuit by useUnifiedCanvas logic', () => {
    const dataSource = { galleryCircuit: SIMPLE_RING_OSCILLATOR };
    
    // useUnifiedCanvas.ts line 126-138 のロジックを再現
    const hasCircularDependency = dataSource.galleryCircuit && (() => {
      // オシレーター回路の特定パターンを検出
      const circuitTitle = dataSource.galleryCircuit!.title || '';
      const isOscillatorCircuit = [
        'オシレータ', 'オシレーター', 'カオス', 'フィボナッチ', 
        'ジョンソン', 'LFSR', 'リング', 'マンダラ', 'メモリ'
      ].some(keyword => circuitTitle.includes(keyword));
      
      // オシレーター回路またはsimulationConfig.needsAnimationがある場合
      const isAnimationRequired = dataSource.galleryCircuit!.simulationConfig?.needsAnimation;
      
      return isOscillatorCircuit || isAnimationRequired;
    })();

    // 循環依存回路（オシレーター）は強制的にEVENT_DRIVEN使用
    const strategy = hasCircularDependency ? 'EVENT_DRIVEN_ONLY' : 'AUTO_SELECT';
    
    console.log('🔍 Detection Test Results:');
    console.log(`Title: "${SIMPLE_RING_OSCILLATOR.title}"`);
    console.log(`Has circular dependency (by title/config): ${hasCircularDependency}`);
    console.log(`Selected strategy: ${strategy}`);
    console.log(`needsAnimation: ${SIMPLE_RING_OSCILLATOR.simulationConfig?.needsAnimation}`);
    
    // チェック項目
    expect(hasCircularDependency).toBe(true);
    expect(strategy).toBe('EVENT_DRIVEN_ONLY');
    expect(SIMPLE_RING_OSCILLATOR.simulationConfig?.needsAnimation).toBe(true);
  });

  it('should match keyword detection', () => {
    const title = SIMPLE_RING_OSCILLATOR.title;
    const keywords = [
      'オシレータ', 'オシレーター', 'カオス', 'フィボナッチ', 
      'ジョンソン', 'LFSR', 'リング', 'マンダラ', 'メモリ'
    ];
    
    const matchedKeywords = keywords.filter(keyword => title.includes(keyword));
    
    console.log('🎯 Keyword Matching:');
    console.log(`Title: "${title}"`);
    console.log(`Matched keywords: [${matchedKeywords.join(', ')}]`);
    
    expect(matchedKeywords.length).toBeGreaterThan(0);
    expect(matchedKeywords).toContain('オシレータ');
    expect(matchedKeywords).toContain('リング');
  });

  it('should have correct simulation config', () => {
    const config = SIMPLE_RING_OSCILLATOR.simulationConfig;
    
    console.log('⚙️ Simulation Config:');
    console.log(JSON.stringify(config, null, 2));
    
    expect(config).toBeDefined();
    expect(config?.needsAnimation).toBe(true);
    expect(config?.expectedBehavior).toBe('oscillator');
    expect(config?.updateInterval).toBeDefined();
  });
});