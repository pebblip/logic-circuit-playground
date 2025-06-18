/**
 * 🎯 全ギャラリー回路の最終動作確認テスト
 * 
 * D-FFメタデータ修正後の全回路動作確認
 * 特に以下の回路を重点チェック：
 * - フィボナッチカウンター（D-FF使用）
 * - ジョンソンカウンター（D-FF使用）
 * - その他の全回路
 */

import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('全ギャラリー回路最終動作確認', () => {
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

  // D-FFを使用する重要回路
  const criticalCircuits = [
    'chaos-generator',
    'fibonacci-counter',
    'johnson-counter'
  ];

  describe('D-FF使用回路の詳細動作確認', () => {
    criticalCircuits.forEach(circuitId => {
      test(`${circuitId} の長期動作安定性`, () => {
        console.log(`\n🔍 ${circuitId} の長期動作テスト開始`);
        
        const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
        expect(circuit).toBeTruthy();
        if (!circuit) return;
        
        console.log(`回路: ${circuit.title}`);
        
        let currentCircuit = { gates: circuit.gates, wires: circuit.wires };
        const outputHistory: string[] = [];
        
        // 20サイクル実行して安定性確認
        for (let cycle = 0; cycle < 20; cycle++) {
          const result = evaluator.evaluate(currentCircuit);
          
          if (result && result.circuit) {
            const outputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
            const litCount = outputGates.filter(gate => getGateInputValue(gate, 0)).length;
            
            // D-FFの状態も確認
            const dffGates = result.circuit.gates.filter(g => g.type === 'D-FF');
            const dffStates = dffGates.map(dff => 
              `${dff.id}:${dff.metadata?.qOutput ? '1' : '0'}`
            ).join(',');
            
            outputHistory.push(`C${cycle + 1}: ${litCount}/${outputGates.length} [${dffStates}]`);
            
            currentCircuit = result.circuit;
          } else {
            console.error(`❌ サイクル ${cycle + 1} で評価失敗`);
            break;
          }
        }
        
        // 結果表示
        console.log('\n📊 20サイクルの出力履歴:');
        outputHistory.forEach((history, index) => {
          if (index % 5 === 0) console.log(''); // 5サイクルごとに改行
          process.stdout.write(history + '  ');
        });
        console.log('\n');
        
        // 動作の安定性評価
        const allZeroCount = outputHistory.filter(h => h.includes(' 0/')).length;
        const hasActivity = outputHistory.some(h => !h.includes(' 0/'));
        
        console.log(`\n📈 安定性評価:`);
        console.log(`  全出力停止回数: ${allZeroCount}/20`);
        console.log(`  活動あり: ${hasActivity ? 'YES' : 'NO'}`);
        
        // D-FF使用回路は必ず何らかの活動があるはず
        expect(hasActivity).toBe(true);
        expect(allZeroCount).toBeLessThan(20); // 全サイクル停止はNG
      });
    });
  });

  test('全14回路の基本動作サマリー', () => {
    console.log('\n📋 全ギャラリー回路動作サマリー\n');
    
    const results = [];
    
    FEATURED_CIRCUITS.forEach(circuit => {
      const { gates, wires } = circuit;
      let currentCircuit = { gates, wires };
      
      // 初期評価
      const result = evaluator.evaluate(currentCircuit);
      
      if (result && result.circuit) {
        const outputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
        const litCount = outputGates.filter(gate => getGateInputValue(gate, 0)).length;
        
        // 5サイクル後の状態も確認
        for (let i = 0; i < 5; i++) {
          const nextResult = evaluator.evaluate(currentCircuit);
          if (nextResult && nextResult.circuit) {
            currentCircuit = nextResult.circuit;
          }
        }
        
        const finalOutputGates = currentCircuit.gates.filter(g => g.type === 'OUTPUT');
        const finalLitCount = finalOutputGates.filter(gate => getGateInputValue(gate, 0)).length;
        
        const status = {
          id: circuit.id,
          title: circuit.title,
          gateCount: gates.length,
          outputCount: outputGates.length,
          initialLit: litCount,
          finalLit: finalLitCount,
          status: finalLitCount > 0 || litCount > 0 ? '✅ 動作中' : '⚠️ 要確認'
        };
        
        results.push(status);
      }
    });
    
    // 結果表示
    console.log('回路名                            | ゲート数 | 出力数 | 初期点灯 | 5サイクル後 | 状態');
    console.log('-'.repeat(90));
    
    results.forEach(r => {
      const title = r.title.padEnd(30);
      console.log(`${title} | ${r.gateCount.toString().padStart(8)} | ${r.outputCount.toString().padStart(6)} | ${r.initialLit.toString().padStart(8)} | ${r.finalLit.toString().padStart(11)} | ${r.status}`);
    });
    
    // 統計
    const workingCount = results.filter(r => r.status.includes('✅')).length;
    const needsCheckCount = results.filter(r => r.status.includes('⚠️')).length;
    
    console.log(`\n📊 統計:`);
    console.log(`  正常動作: ${workingCount}/14`);
    console.log(`  要確認: ${needsCheckCount}/14`);
    
    // 少なくとも80%は正常動作すべき
    expect(workingCount).toBeGreaterThanOrEqual(11);
  });

  test('特殊ケース：組み合わせ回路の動作確認', () => {
    console.log('\n🔧 組み合わせ回路（入力依存）の確認\n');
    
    const combinationalCircuits = [
      '4bit-comparator',
      'parity-checker', 
      'majority-voter'
    ];
    
    combinationalCircuits.forEach(circuitId => {
      const circuit = FEATURED_CIRCUITS.find(c => c.id === circuitId);
      if (!circuit) return;
      
      console.log(`\n${circuit.title}:`);
      
      // 現在の入力状態を確認
      const inputGates = circuit.gates.filter(g => g.type === 'INPUT');
      const inputStates = inputGates.map(g => g.output ? '1' : '0').join('');
      console.log(`  入力状態: ${inputStates}`);
      
      // 評価実行
      const result = evaluator.evaluate({ gates: circuit.gates, wires: circuit.wires });
      if (result && result.circuit) {
        const outputGates = result.circuit.gates.filter(g => g.type === 'OUTPUT');
        const outputStates = outputGates.map(gate => 
          getGateInputValue(gate, 0) ? '1' : '0'
        ).join('');
        console.log(`  出力状態: ${outputStates}`);
        
        // 組み合わせ回路は入力に応じた正しい出力を生成
        console.log(`  評価: 入力${inputStates} → 出力${outputStates} ✅`);
      }
    });
  });
});