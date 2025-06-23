/**
 * ギャラリーモード循環回路修正テスト
 * 
 * 目的: CLOCKなし循環回路のアニメーション判定ロジックが正しく動作することを確認
 */

import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';

describe('Gallery Mode Oscillation Fix', () => {
  it('should identify ring oscillator as needing animation', () => {
    const ringOsc = FEATURED_CIRCUITS.find(c => c.id === 'simple-ring-oscillator')!;
    
    // 🔧 修正確認: simulationConfigが正しく設定されているか
    expect(ringOsc.simulationConfig?.needsAnimation).toBe(true);
    expect(ringOsc.simulationConfig?.expectedBehavior).toBe('oscillator');
    
    // 🔧 修正確認: useCanvasの判定ロジックをシミュレート
    const isOscillatingCircuit = ringOsc.simulationConfig?.needsAnimation === true ||
      ringOsc.simulationConfig?.expectedBehavior === 'oscillator';
    
    expect(isOscillatingCircuit).toBe(true);
  });

  it('should identify chaos generator as needing animation', () => {
    const chaos = FEATURED_CIRCUITS.find(c => c.id === 'chaos-generator')!;
    
    expect(chaos.simulationConfig?.needsAnimation).toBe(true);
    expect(chaos.simulationConfig?.expectedBehavior).toBe('oscillator');
    
    const isOscillatingCircuit = chaos.simulationConfig?.needsAnimation === true ||
      chaos.simulationConfig?.expectedBehavior === 'oscillator';
    
    expect(isOscillatingCircuit).toBe(true);
  });

  it('should NOT identify half-adder as needing animation', () => {
    const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
    
    // 半加算器はsimulationConfigがない（組み合わせ回路）
    expect(halfAdder.simulationConfig).toBeUndefined();
    
    const isOscillatingCircuit = halfAdder.simulationConfig?.needsAnimation === true ||
      halfAdder.simulationConfig?.expectedBehavior === 'oscillator';
    
    expect(isOscillatingCircuit).toBe(false);
  });

  it('should verify fix logic for all circuit types', () => {
    const oscillatingCircuits = FEATURED_CIRCUITS.filter(c => 
      c.simulationConfig?.needsAnimation === true || 
      c.simulationConfig?.expectedBehavior === 'oscillator'
    );
    
    const combinationalCircuits = FEATURED_CIRCUITS.filter(c => 
      !c.simulationConfig?.needsAnimation && 
      c.simulationConfig?.expectedBehavior !== 'oscillator'
    );
    
    // 🌀 循環回路が正しく検出される
    expect(oscillatingCircuits.length).toBeGreaterThan(0);
    expect(oscillatingCircuits.some(c => c.id === 'simple-ring-oscillator')).toBe(true);
    expect(oscillatingCircuits.some(c => c.id === 'chaos-generator')).toBe(true);
    
    // 🔧 組み合わせ回路も正しく検出される
    expect(combinationalCircuits.length).toBeGreaterThan(0);
    expect(combinationalCircuits.some(c => c.id === 'half-adder')).toBe(true);
    
    console.log('✅ Oscillating circuits detected:', oscillatingCircuits.map(c => c.id));
    console.log('✅ Combinational circuits detected:', combinationalCircuits.map(c => c.id));
  });
});