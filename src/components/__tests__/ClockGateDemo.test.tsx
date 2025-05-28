import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UltraModernCircuitViewModel } from '../../viewmodels/UltraModernCircuitViewModel';

describe('CLOCKゲートの実用例', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('例1: LEDの点滅回路', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // CLOCKとLED(OUTPUT)を配置
    const clock = viewModel.addGate('CLOCK', 100, 100);
    const led = viewModel.addGate('OUTPUT', 300, 100);
    
    // 接続
    viewModel.addConnection(clock.id, 0, led.id, 0);
    
    // 初期状態を確認
    let results = viewModel.getSimulationResults();
    console.log('初期状態 - LED:', results[clock.id] ? 'ON' : 'OFF');
    
    // クロックを開始（1秒間隔）
    viewModel.startClock(clock.id);
    
    // 時間経過をシミュレート
    for (let i = 1; i <= 5; i++) {
      vi.advanceTimersByTime(1000);
      results = viewModel.getSimulationResults();
      console.log(`${i}秒後 - LED:`, results[clock.id] ? 'ON' : 'OFF');
    }
    
    viewModel.stopClock(clock.id);
  });

  it('例2: AND ゲートを使ったゲート制御', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // ゲートを配置
    const clock = viewModel.addGate('CLOCK', 100, 100);
    const enable = viewModel.addGate('INPUT', 100, 200);
    const andGate = viewModel.addGate('AND', 300, 150);
    const output = viewModel.addGate('OUTPUT', 500, 150);
    
    // 接続
    viewModel.addConnection(clock.id, 0, andGate.id, 0);
    viewModel.addConnection(enable.id, 0, andGate.id, 1);
    viewModel.addConnection(andGate.id, 0, output.id, 0);
    
    // Enableを OFF の状態でクロック開始
    viewModel.startClock(clock.id);
    
    console.log('\n=== Enable OFF の場合 ===');
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(500);
      const results = viewModel.getSimulationResults();
      console.log(`Clock: ${results[clock.id] ? 'HIGH' : 'LOW'}, Output: ${results[andGate.id] ? 'HIGH' : 'LOW'}`);
    }
    
    // EnableをONにする
    viewModel.toggleInput(enable.id);
    console.log('\n=== Enable ON の場合 ===');
    
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(500);
      const results = viewModel.getSimulationResults();
      console.log(`Clock: ${results[clock.id] ? 'HIGH' : 'LOW'}, Output: ${results[andGate.id] ? 'HIGH' : 'LOW'}`);
    }
    
    viewModel.stopClock(clock.id);
  });

  it('例3: 複数のクロックで異なる周波数', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // 2つのクロックを配置
    const clock1 = viewModel.addGate('CLOCK', 100, 100);
    const clock2 = viewModel.addGate('CLOCK', 100, 200);
    const output1 = viewModel.addGate('OUTPUT', 300, 100);
    const output2 = viewModel.addGate('OUTPUT', 300, 200);
    
    // 接続
    viewModel.addConnection(clock1.id, 0, output1.id, 0);
    viewModel.addConnection(clock2.id, 0, output2.id, 0);
    
    // 異なる周波数を設定
    viewModel.setClockInterval(clock1.id, 1000); // 1秒
    viewModel.setClockInterval(clock2.id, 500);  // 0.5秒
    
    // 両方のクロックを開始
    viewModel.startClock(clock1.id);
    viewModel.startClock(clock2.id);
    
    console.log('\n=== 異なる周波数のクロック ===');
    console.log('Clock1: 1秒周期, Clock2: 0.5秒周期');
    
    for (let i = 1; i <= 8; i++) {
      vi.advanceTimersByTime(250); // 0.25秒刻み
      const results = viewModel.getSimulationResults();
      console.log(`${i * 0.25}秒: Clock1=${results[clock1.id] ? '1' : '0'}, Clock2=${results[clock2.id] ? '1' : '0'}`);
    }
    
    viewModel.stopClock(clock1.id);
    viewModel.stopClock(clock2.id);
  });

  it('例4: クロックの状態を保存・復元', () => {
    const viewModel = new UltraModernCircuitViewModel();
    
    // クロック回路を作成
    const clock = viewModel.addGate('CLOCK', 100, 100);
    const output = viewModel.addGate('OUTPUT', 300, 100);
    viewModel.addConnection(clock.id, 0, output.id, 0);
    
    // カスタム間隔を設定して開始
    viewModel.setClockInterval(clock.id, 750);
    viewModel.startClock(clock.id);
    
    // 回路を保存
    const savedCircuit = viewModel.toJSON();
    console.log('\n保存された回路データ:', JSON.stringify(savedCircuit, null, 2));
    
    // 新しいViewModelで読み込み
    const newViewModel = new UltraModernCircuitViewModel();
    newViewModel.loadCircuit(savedCircuit);
    
    // クロックの状態を確認
    const gates = newViewModel.getGates();
    const loadedClock = gates.find(g => g.type === 'CLOCK');
    if (loadedClock) {
      const state = newViewModel.getClockState(loadedClock.id);
      console.log('\n読み込まれたクロックの状態:');
      console.log('- 間隔:', state?.interval, 'ms');
      console.log('- 動作中:', state?.isRunning);
    }
  });
});