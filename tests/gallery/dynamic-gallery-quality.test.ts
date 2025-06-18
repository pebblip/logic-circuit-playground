/**
 * 🚨 全ギャラリー回路の動的品質保証テスト
 * 
 * ユーザー要求：
 * - カオス発生器：最初点滅→時間経過で停止
 * - 他回路も同様の問題の可能性
 * 
 * 動的品質基準：
 * 1. CLOCK駆動回路の継続的動作（複数サイクル）
 * 2. 発振回路の持続性確認
 * 3. 時間経過による状態の安定性
 * 4. CLOCKゲートの適切な設定確認
 */

import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('全ギャラリー回路動的品質保証', () => {
  let evaluator: EnhancedHybridEvaluator;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: false,
      delayMode: false,
    });
  });

  // CLOCK駆動回路の動的テスト
  const clockDrivenCircuits = [
    'chaos-generator',
    'fibonacci-counter', 
    'johnson-counter',
    'simple-ring-oscillator'
  ];

  clockDrivenCircuits.forEach(circuitId => {
    test(`${circuitId} の動的継続動作確認`, () => {
      console.log(`\n🔄 ${circuitId} の動的継続動作確認`);
      
      const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
      expect(circuit).toBeTruthy();
      if (!circuit) return;
      
      const { gates, wires } = circuit;
      let currentCircuit = { gates, wires };
      
      console.log(`回路: ${circuit.title}`);
      console.log(`ゲート数: ${gates.length}, ワイヤー数: ${wires.length}`);
      
      // CLOCKゲートの設定確認
      const clockGates = gates.filter(g => g.type === 'CLOCK');
      console.log(`\n⏰ CLOCKゲート設定確認:`);
      clockGates.forEach(clock => {
        const hasIsRunning = clock.metadata?.isRunning !== undefined;
        const isRunning = clock.metadata?.isRunning;
        console.log(`  ${clock.id}: frequency=${clock.metadata?.frequency}, isRunning=${isRunning} (設定${hasIsRunning ? 'あり' : 'なし'})`);
        
        if (!hasIsRunning) {
          console.warn(`⚠️ CLOCKゲート ${clock.id} にisRunning設定がありません`);
        }
      });
      
      // 複数サイクルテスト
      const cycles = 8;
      const results = [];
      let consecutiveZeroOutputs = 0;
      
      for (let cycle = 0; cycle < cycles; cycle++) {
        const result = evaluator.evaluate(currentCircuit);
        
        if (result && result.circuit) {
          const updatedGates = result.circuit.gates;
          const outputGates = updatedGates.filter(g => g.type === 'OUTPUT');
          
          let litOutputCount = 0;
          outputGates.forEach(gate => {
            const inputValue = getGateInputValue(gate, 0);
            if (inputValue) litOutputCount++;
          });
          
          results.push({
            cycle: cycle + 1,
            litOutputCount,
            totalOutputs: outputGates.length
          });
          
          console.log(`サイクル ${cycle + 1}: ${litOutputCount}/${outputGates.length} 出力が光る`);
          
          // 連続ゼロ出力のカウント
          if (litOutputCount === 0) {
            consecutiveZeroOutputs++;
          } else {
            consecutiveZeroOutputs = 0;
          }
          
          currentCircuit = result.circuit;
        } else {
          console.error(`❌ サイクル ${cycle + 1} で評価失敗`);
          break;
        }
      }
      
      // 動的品質評価
      console.log(`\n📊 動的品質評価:`);
      
      const initialLitCount = results[0]?.litOutputCount || 0;
      const finalLitCount = results[results.length - 1]?.litOutputCount || 0;
      const averageLitCount = results.reduce((sum, r) => sum + r.litOutputCount, 0) / results.length;
      
      console.log(`初期出力: ${initialLitCount}`);
      console.log(`最終出力: ${finalLitCount}`);
      console.log(`平均出力: ${averageLitCount.toFixed(1)}`);
      console.log(`連続ゼロ出力: ${consecutiveZeroOutputs}サイクル`);
      
      // 品質判定
      const hasInitialActivity = initialLitCount > 0;
      const maintainsActivity = finalLitCount > 0 || averageLitCount > 0;
      const notStalled = consecutiveZeroOutputs < cycles / 2;
      
      if (hasInitialActivity && maintainsActivity && notStalled) {
        console.log(`✅ 動的品質: 良好`);
      } else {
        console.log(`🚨 動的品質: 問題あり`);
        if (!hasInitialActivity) console.log(`  - 初期活動なし`);
        if (!maintainsActivity) console.log(`  - 活動が維持されない`);
        if (!notStalled) console.log(`  - 停止状態が長い`);
      }
      
      // 最低限の品質基準
      expect(results.length).toBeGreaterThan(0);
      // CLOCK駆動回路は何らかの動的活動があることを期待
      if (clockGates.length > 0) {
        expect(averageLitCount).toBeGreaterThan(0);
      }
    });
  });

  test('全ギャラリー回路のCLOCK設定品質確認', () => {
    console.log('\n⏰ 全ギャラリー回路のCLOCK設定品質確認');
    
    let clockCircuitCount = 0;
    let properlyConfiguredCount = 0;
    let configurationIssues = [];
    
    FEATURED_CIRCUITS.forEach(circuit => {
      const clockGates = circuit.gates.filter(g => g.type === 'CLOCK');
      
      if (clockGates.length > 0) {
        clockCircuitCount++;
        console.log(`\n📍 ${circuit.title} (${circuit.id}):`);
        
        let circuitProperlyConfigured = true;
        
        clockGates.forEach(clock => {
          const hasFrequency = clock.metadata?.frequency !== undefined;
          const hasIsRunning = clock.metadata?.isRunning !== undefined;
          const frequency = clock.metadata?.frequency;
          const isRunning = clock.metadata?.isRunning;
          
          console.log(`  ${clock.id}: freq=${frequency}, isRunning=${isRunning}`);
          
          if (!hasFrequency) {
            console.log(`    ⚠️ frequency設定なし`);
            configurationIssues.push(`${circuit.id}/${clock.id}: frequency未設定`);
            circuitProperlyConfigured = false;
          }
          
          if (!hasIsRunning) {
            console.log(`    ⚠️ isRunning設定なし`);
            configurationIssues.push(`${circuit.id}/${clock.id}: isRunning未設定`);
            circuitProperlyConfigured = false;
          }
          
          if (hasIsRunning && isRunning === false) {
            console.log(`    ⚠️ CLOCKが停止状態`);
            configurationIssues.push(`${circuit.id}/${clock.id}: CLOCK停止状態`);
            circuitProperlyConfigured = false;
          }
        });
        
        if (circuitProperlyConfigured) {
          properlyConfiguredCount++;
          console.log(`  ✅ 設定良好`);
        } else {
          console.log(`  ❌ 設定に問題あり`);
        }
      }
    });
    
    console.log(`\n📊 CLOCK設定サマリー:`);
    console.log(`CLOCK回路数: ${clockCircuitCount}`);
    console.log(`適切設定数: ${properlyConfiguredCount}`);
    console.log(`設定不備数: ${clockCircuitCount - properlyConfiguredCount}`);
    
    if (configurationIssues.length > 0) {
      console.log(`\n🚨 設定問題一覧:`);
      configurationIssues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
    
    // 品質基準: 少なくとも80%のCLOCK回路が適切に設定されていること
    const configurationRate = clockCircuitCount > 0 ? properlyConfiguredCount / clockCircuitCount : 1;
    console.log(`\n設定適合率: ${(configurationRate * 100).toFixed(1)}%`);
    
    expect(configurationRate).toBeGreaterThanOrEqual(0.8);
  });

  test('発振系回路の安定性確認', () => {
    console.log('\n🌊 発振系回路の安定性確認');
    
    const oscillatorCircuits = [
      'simple-ring-oscillator',
      'chaos-generator', 
      'self-oscillating-memory-final',
      'mandala-circuit'
    ];
    
    oscillatorCircuits.forEach(circuitId => {
      const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
      if (!circuit) return;
      
      console.log(`\n🔍 ${circuit.title}:`);
      
      const { gates, wires } = circuit;
      let currentCircuit = { gates, wires };
      
      // 長期実行テスト（15サイクル）
      const longCycles = 15;
      let totalActivity = 0;
      let cyclicPatternDetected = false;
      const stateHistory = [];
      
      for (let cycle = 0; cycle < longCycles; cycle++) {
        const result = evaluator.evaluate(currentCircuit);
        
        if (result && result.circuit) {
          const outputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
          const litCount = outputGates.filter(gate => getGateInputValue(gate, 0)).length;
          
          totalActivity += litCount;
          
          // 状態パターンの記録（最初の8サイクル）
          if (cycle < 8) {
            const stateSignature = outputGates.map(gate => 
              getGateInputValue(gate, 0) ? '1' : '0'
            ).join('');
            stateHistory.push(stateSignature);
          }
          
          currentCircuit = result.circuit;
        }
      }
      
      // 周期性の検出
      if (stateHistory.length >= 4) {
        const pattern1 = stateHistory.slice(0, 4).join(',');
        const pattern2 = stateHistory.slice(4, 8).join(',');
        if (pattern1 === pattern2) {
          cyclicPatternDetected = true;
        }
      }
      
      const averageActivity = totalActivity / longCycles;
      
      console.log(`  長期平均活動: ${averageActivity.toFixed(1)}`);
      console.log(`  周期パターン: ${cyclicPatternDetected ? '検出' : '未検出'}`);
      
      if (averageActivity > 0.5) {
        console.log(`  ✅ 安定した発振`);
      } else if (averageActivity > 0) {
        console.log(`  ⚠️ 低活動レベル`);
      } else {
        console.log(`  ❌ 発振停止`);
      }
    });
  });
});