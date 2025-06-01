import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClockGate } from '../ClockGate';

describe('ClockGate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期化が正しく行われる', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 });
    
    expect(gate.id).toBe('clock1');
    expect(gate.type).toBe('CLOCK');
    expect(gate.getInputs()).toHaveLength(0);
    expect(gate.getOutputs()).toHaveLength(1);
    expect(gate.getInterval()).toBe(1000);
    expect(gate.getIsRunning()).toBe(false);
  });

  it('カスタムインターバルで初期化できる', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 500);
    expect(gate.getInterval()).toBe(500);
  });

  it('startメソッドでクロックが開始される', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 100);
    const output = gate.getOutputs()[0];
    
    expect(output.value).toBe(false);
    
    gate.start();
    expect(gate.getIsRunning()).toBe(true);
    
    // 100ms後
    vi.advanceTimersByTime(100);
    expect(output.value).toBe(true);
    
    // 200ms後
    vi.advanceTimersByTime(100);
    expect(output.value).toBe(false);
    
    // 300ms後
    vi.advanceTimersByTime(100);
    expect(output.value).toBe(true);
  });

  it('stopメソッドでクロックが停止される', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 100);
    const output = gate.getOutputs()[0];
    
    gate.start();
    vi.advanceTimersByTime(100);
    expect(output.value).toBe(true);
    
    gate.stop();
    expect(gate.getIsRunning()).toBe(false);
    
    // 停止後は値が変化しない
    const currentValue = output.value;
    vi.advanceTimersByTime(200);
    expect(output.value).toBe(currentValue);
  });

  it('インターバルを変更できる', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 100);
    const output = gate.getOutputs()[0];
    
    gate.start();
    vi.advanceTimersByTime(100);
    expect(output.value).toBe(true);
    
    // インターバルを200msに変更
    gate.setInterval(200);
    expect(gate.getInterval()).toBe(200);
    
    // リスタートされるので、次のトグルまで200msかかる
    vi.advanceTimersByTime(200);
    expect(output.value).toBe(false);
  });

  it('二重起動を防ぐ', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 100);
    
    gate.start();
    gate.start(); // 二回目の起動
    
    // 一度だけ起動されることを確認
    vi.advanceTimersByTime(100);
    expect(gate.getOutputs()[0].value).toBe(true);
  });

  it('手動でトグルできる', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 });
    const output = gate.getOutputs()[0];
    
    expect(output.value).toBe(false);
    
    gate.toggle();
    expect(output.value).toBe(true);
    
    gate.toggle();
    expect(output.value).toBe(false);
  });

  it('シリアライズとデシリアライズが正しく動作する', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 }, 500);
    gate.start();
    gate.getOutputs()[0].value = true;
    
    const serialized = gate.serialize();
    expect(serialized.interval).toBe(500);
    expect(serialized.isRunning).toBe(true);
    expect(serialized.outputValue).toBe(true);
    
    const deserialized = ClockGate.deserialize(serialized);
    expect(deserialized.getInterval()).toBe(500);
    expect(deserialized.getIsRunning()).toBe(true);
    expect(deserialized.getOutputs()[0].value).toBe(true);
  });

  it('destroyでクロックが停止される', () => {
    const gate = new ClockGate('clock1', { x: 100, y: 100 });
    
    gate.start();
    expect(gate.getIsRunning()).toBe(true);
    
    gate.destroy();
    expect(gate.getIsRunning()).toBe(false);
  });
});