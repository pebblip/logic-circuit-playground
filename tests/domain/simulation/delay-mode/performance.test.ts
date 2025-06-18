import { describe, it, expect } from 'vitest';
import type { Circuit, Gate, Wire } from '../../../../src/types/circuit';
import { DEFAULT_GATE_DELAYS } from '../../../../src/constants/gateDelays';
import { EventDrivenEngine } from '../../../../src/domain/simulation/event-driven';

/**
 * 遅延モードのパフォーマンステスト
 * 
 * 100ゲート規模の回路で遅延モードのパフォーマンスを検証
 */
describe('Delay Mode Performance Test', () => {
  /**
   * NOTゲートのチェーンを作成
   */
  function createNotChain(length: number): Circuit {
    const gates: Gate[] = [];
    const wires: Wire[] = [];
    
    // 入力ゲート
    gates.push({
      id: 'INPUT',
      type: 'INPUT',
      position: { x: 0, y: 100 },
      output: false,
      inputs: [],
    });
    
    // NOTゲートチェーン
    for (let i = 0; i < length; i++) {
      gates.push({
        id: `NOT${i}`,
        type: 'NOT',
        position: { x: (i + 1) * 100, y: 100 },
        output: false,
        inputs: [''],
        timing: {
          propagationDelay: DEFAULT_GATE_DELAYS['NOT'],
        },
      });
      
      // ワイヤー接続
      const fromId = i === 0 ? 'INPUT' : `NOT${i - 1}`;
      wires.push({
        id: `w${i}`,
        from: { gateId: fromId, pinIndex: -1 },
        to: { gateId: `NOT${i}`, pinIndex: 0 },
        isActive: false,
      });
    }
    
    // 出力ゲート
    gates.push({
      id: 'OUTPUT',
      type: 'OUTPUT',
      position: { x: (length + 1) * 100, y: 100 },
      output: false,
      inputs: [''],
    });
    
    wires.push({
      id: `w${length}`,
      from: { gateId: `NOT${length - 1}`, pinIndex: -1 },
      to: { gateId: 'OUTPUT', pinIndex: 0 },
      isActive: false,
    });
    
    return { gates, wires };
  }

  /**
   * ランダムな論理回路を作成
   */
  function createRandomCircuit(gateCount: number): Circuit {
    const gates: Gate[] = [];
    const wires: Wire[] = [];
    const gateTypes = ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR'] as const;
    
    // 入力ゲート（10個）
    for (let i = 0; i < 10; i++) {
      gates.push({
        id: `INPUT${i}`,
        type: 'INPUT',
        position: { x: 0, y: i * 50 },
        output: Math.random() > 0.5,
        inputs: [],
      });
    }
    
    // ランダムなゲート
    for (let i = 0; i < gateCount; i++) {
      const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
      const inputCount = gateType === 'NOT' ? 1 : 2;
      
      gates.push({
        id: `GATE${i}`,
        type: gateType,
        position: { x: (i % 10 + 1) * 100, y: Math.floor(i / 10) * 50 },
        output: false,
        inputs: new Array(inputCount).fill(''),
        timing: {
          propagationDelay: DEFAULT_GATE_DELAYS[gateType],
        },
      });
      
      // ランダムな接続
      for (let j = 0; j < inputCount; j++) {
        const sourceIndex = Math.floor(Math.random() * (gates.length - 1));
        const sourceGate = gates[sourceIndex];
        
        wires.push({
          id: `w${i}_${j}`,
          from: { gateId: sourceGate.id, pinIndex: -1 },
          to: { gateId: `GATE${i}`, pinIndex: j },
          isActive: false,
        });
      }
    }
    
    // 出力ゲート（5個）
    for (let i = 0; i < 5; i++) {
      gates.push({
        id: `OUTPUT${i}`,
        type: 'OUTPUT',
        position: { x: 1200, y: i * 50 },
        output: false,
        inputs: [''],
      });
      
      // ランダムなゲートから接続
      const sourceIndex = Math.floor(Math.random() * gateCount) + 10;
      wires.push({
        id: `wout${i}`,
        from: { gateId: gates[sourceIndex].id, pinIndex: -1 },
        to: { gateId: `OUTPUT${i}`, pinIndex: 0 },
        isActive: false,
      });
    }
    
    return { gates, wires };
  }

  it('should handle 100 NOT gates chain efficiently', () => {
    const circuit = createNotChain(100);
    
    console.log('\n=== 100 NOT Gates Chain Performance ===');
    
    // 即時モード
    const instantEngine = new EventDrivenEngine({ 
      delayMode: false,
      enableDebug: false,
      maxDeltaCycles: 1000,
    });
    
    const instantStart = performance.now();
    const instantResult = instantEngine.evaluate(circuit);
    const instantTime = performance.now() - instantStart;
    
    // 遅延モード
    const delayEngine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: false,
      maxDeltaCycles: 1000,
    });
    
    const delayStart = performance.now();
    const delayResult = delayEngine.evaluate(circuit);
    const delayTime = performance.now() - delayStart;
    
    console.log('Results:');
    console.log(`  Instant mode: ${instantTime.toFixed(2)}ms (${instantResult.cycleCount} cycles)`);
    console.log(`  Delay mode: ${delayTime.toFixed(2)}ms (${delayResult.cycleCount} cycles)`);
    console.log(`  Performance ratio: ${(delayTime / instantTime).toFixed(2)}x`);
    console.log(`  Final simulation time: ${delayResult.finalState.currentTime}ns`);
    
    // 基本的な検証
    expect(instantResult.success).toBe(true);
    expect(delayResult.success).toBe(true);
    
    // パフォーマンス基準：遅延モードは即時モードの10倍以内
    expect(delayTime).toBeLessThan(instantTime * 10);
  });

  it('should handle random circuit with 100 gates', () => {
    const circuit = createRandomCircuit(100);
    
    console.log('\n=== Random Circuit (100 gates) Performance ===');
    console.log(`Circuit: ${circuit.gates.length} gates, ${circuit.wires.length} wires`);
    
    // 即時モード
    const instantEngine = new EventDrivenEngine({ 
      delayMode: false,
      enableDebug: false,
      maxDeltaCycles: 1000,
    });
    
    const instantStart = performance.now();
    const instantResult = instantEngine.evaluate(circuit);
    const instantTime = performance.now() - instantStart;
    
    // 遅延モード
    const delayEngine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: false,
      maxDeltaCycles: 1000,
    });
    
    const delayStart = performance.now();
    const delayResult = delayEngine.evaluate(circuit);
    const delayTime = performance.now() - delayStart;
    
    console.log('Results:');
    console.log(`  Instant mode: ${instantTime.toFixed(2)}ms (${instantResult.cycleCount} cycles)`);
    console.log(`  Delay mode: ${delayTime.toFixed(2)}ms (${delayResult.cycleCount} cycles)`);
    console.log(`  Performance ratio: ${(delayTime / instantTime).toFixed(2)}x`);
    
    // 基本的な検証
    expect(instantResult.success).toBe(true);
    expect(delayResult.success).toBe(true);
  });

  it('should scale linearly with circuit size', () => {
    const sizes = [10, 25, 50, 100];
    const results: Array<{ size: number; instantTime: number; delayTime: number }> = [];
    
    console.log('\n=== Scalability Test ===');
    
    for (const size of sizes) {
      const circuit = createNotChain(size);
      
      // 即時モード
      const instantEngine = new EventDrivenEngine({ 
        delayMode: false,
        enableDebug: false,
        maxDeltaCycles: 1000,
      });
      
      const instantStart = performance.now();
      instantEngine.evaluate(circuit);
      const instantTime = performance.now() - instantStart;
      
      // 遅延モード
      const delayEngine = new EventDrivenEngine({ 
        delayMode: true,
        enableDebug: false,
        maxDeltaCycles: 1000,
      });
      
      const delayStart = performance.now();
      delayEngine.evaluate(circuit);
      const delayTime = performance.now() - delayStart;
      
      results.push({ size, instantTime, delayTime });
      
      console.log(`  ${size} gates: instant=${instantTime.toFixed(2)}ms, delay=${delayTime.toFixed(2)}ms`);
    }
    
    // 線形スケーリングの検証（大まかな検証）
    const ratio10to100 = results[3].delayTime / results[0].delayTime;
    console.log(`  Scaling ratio (10→100 gates): ${ratio10to100.toFixed(2)}x`);
    
    // 100倍以内のスケーリング（10倍のゲート数で）
    expect(ratio10to100).toBeLessThan(100);
  });

  it('should handle oscillating circuits efficiently', () => {
    // 5つのNOTゲートによるリングオシレータ
    const circuit: Circuit = {
      gates: [
        {
          id: 'NOT1',
          type: 'NOT',
          position: { x: 100, y: 100 },
          output: true,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT2',
          type: 'NOT',
          position: { x: 200, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT3',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT4',
          type: 'NOT',
          position: { x: 400, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
        {
          id: 'NOT5',
          type: 'NOT',
          position: { x: 500, y: 100 },
          output: false,
          inputs: [''],
          timing: { propagationDelay: 1.0 },
        },
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'NOT1', pinIndex: -1 },
          to: { gateId: 'NOT2', pinIndex: 0 },
          isActive: true,
        },
        {
          id: 'w2',
          from: { gateId: 'NOT2', pinIndex: -1 },
          to: { gateId: 'NOT3', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w3',
          from: { gateId: 'NOT3', pinIndex: -1 },
          to: { gateId: 'NOT4', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w4',
          from: { gateId: 'NOT4', pinIndex: -1 },
          to: { gateId: 'NOT5', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'w5',
          from: { gateId: 'NOT5', pinIndex: -1 },
          to: { gateId: 'NOT1', pinIndex: 0 },
          isActive: false,
        },
      ],
    };
    
    console.log('\n=== Oscillating Circuit Performance ===');
    
    // 遅延モードで発振を検出
    const engine = new EventDrivenEngine({ 
      delayMode: true,
      enableDebug: false,
      maxDeltaCycles: 100,
      continueOnOscillation: true,
      oscillationCyclesAfterDetection: 20,
    });
    
    const start = performance.now();
    const result = engine.evaluate(circuit);
    const time = performance.now() - start;
    
    console.log('Results:');
    console.log(`  Execution time: ${time.toFixed(2)}ms`);
    console.log(`  Total cycles: ${result.cycleCount}`);
    console.log(`  Oscillation detected: ${result.hasOscillation}`);
    console.log(`  Oscillation period: ${result.oscillationInfo?.period || 'N/A'}`);
    
    expect(result.hasOscillation).toBe(true);
    expect(result.oscillationInfo?.period).toBe(10); // 5 NOTゲート × 2状態
    
    // 発振検出は効率的に行われるべき（100ms以内）
    expect(time).toBeLessThan(100);
  });
});

/**
 * パフォーマンス統計を表示
 */
export function performanceSummary(
  results: Array<{ name: string; time: number; cycles: number }>
): void {
  console.log('\n=== Performance Summary ===');
  console.log('Test                    Time(ms)  Cycles');
  console.log('-----------------------------------------');
  
  for (const result of results) {
    console.log(
      `${result.name.padEnd(20)} ${result.time.toFixed(2).padStart(8)} ${result.cycles.toString().padStart(7)}`
    );
  }
  
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  console.log('-----------------------------------------');
  console.log(`Average time: ${avgTime.toFixed(2)}ms`);
}