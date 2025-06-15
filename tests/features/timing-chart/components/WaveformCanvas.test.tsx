/**
 * WaveformCanvasコンポーネントのテスト
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaveformCanvas } from '@/features/timing-chart/components/WaveformCanvas';
import type { TimingTrace, TimeWindow, TimeScale, TimingChartSettings } from '@/types/timing';

// モックの設定
vi.mock('@/stores/circuitStore', () => ({
  useCircuitStore: vi.fn(() => ({
    gates: [],
    wires: [],
    timingChart: {
      isPaused: false
    },
    timingChartActions: {
      updateTimeWindowForNewEvents: vi.fn(),
      togglePause: vi.fn()
    }
  }))
}));

// Canvas 2Dコンテキストのモック
class MockCanvasContext {
  fillRect = vi.fn();
  clearRect = vi.fn();
  strokeRect = vi.fn();
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  stroke = vi.fn();
  fill = vi.fn();
  scale = vi.fn();
  bezierCurveTo = vi.fn();
  closePath = vi.fn();
  setLineDash = vi.fn();
  fillText = vi.fn();
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  }));
  
  // プロパティ（getterとsetterで実装）
  private _fillStyle = '';
  private _strokeStyle = '';
  private _lineWidth = 1;
  private _font = '';
  private _textAlign: CanvasTextAlign = 'start';
  private _textBaseline: CanvasTextBaseline = 'alphabetic';
  private _imageSmoothingEnabled = true;
  private _imageSmoothingQuality: ImageSmoothingQuality = 'low';
  private _lineCap: CanvasLineCap = 'butt';
  private _lineJoin: CanvasLineJoin = 'miter';
  private _shadowColor = '';
  private _shadowBlur = 0;
  private _shadowOffsetX = 0;
  private _shadowOffsetY = 0;
  
  get fillStyle() { return this._fillStyle; }
  set fillStyle(value) { this._fillStyle = value; }
  
  get strokeStyle() { return this._strokeStyle; }
  set strokeStyle(value) { this._strokeStyle = value; }
  
  get lineWidth() { return this._lineWidth; }
  set lineWidth(value) { this._lineWidth = value; }
  
  get font() { return this._font; }
  set font(value) { this._font = value; }
  
  get textAlign() { return this._textAlign; }
  set textAlign(value) { this._textAlign = value; }
  
  get textBaseline() { return this._textBaseline; }
  set textBaseline(value) { this._textBaseline = value; }
  
  get imageSmoothingEnabled() { return this._imageSmoothingEnabled; }
  set imageSmoothingEnabled(value) { this._imageSmoothingEnabled = value; }
  
  get imageSmoothingQuality() { return this._imageSmoothingQuality; }
  set imageSmoothingQuality(value) { this._imageSmoothingQuality = value; }
  
  get lineCap() { return this._lineCap; }
  set lineCap(value) { this._lineCap = value; }
  
  get lineJoin() { return this._lineJoin; }
  set lineJoin(value) { this._lineJoin = value; }
  
  get shadowColor() { return this._shadowColor; }
  set shadowColor(value) { this._shadowColor = value; }
  
  get shadowBlur() { return this._shadowBlur; }
  set shadowBlur(value) { this._shadowBlur = value; }
  
  get shadowOffsetX() { return this._shadowOffsetX; }
  set shadowOffsetX(value) { this._shadowOffsetX = value; }
  
  get shadowOffsetY() { return this._shadowOffsetY; }
  set shadowOffsetY(value) { this._shadowOffsetY = value; }
}

const mockCanvasContext = new MockCanvasContext();

// HTMLCanvasElementのモック
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext as any);
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

describe('WaveformCanvas', () => {
  const defaultProps = {
    traces: [] as TimingTrace[],
    timeWindow: { start: 0, end: 1000 } as TimeWindow,
    timeScale: 'ms' as TimeScale,
    settings: {
      theme: 'dark',
      gridVisible: true,
      clockHighlightEnabled: true,
      edgeMarkersEnabled: true,
      signalLabelsVisible: true,
      autoCapture: true,
      captureDepth: 10000,
      updateInterval: 16
    } as TimingChartSettings
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // window.devicePixelRatio のモック
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1
    });
  });

  it('コンポーネントが正しくレンダリングされる', () => {
    const { container } = render(<WaveformCanvas {...defaultProps} />);
    
    expect(container.querySelector('.waveform-canvas')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('トレースがない場合、デモメッセージが表示される', () => {
    render(<WaveformCanvas {...defaultProps} />);
    
    expect(screen.getByText('CLOCKゲートを配置すると波形が表示されます')).toBeInTheDocument();
  });

  it('トレースがある場合、デバッグ情報が表示される', () => {
    const traces: TimingTrace[] = [{
      id: 'trace-1',
      gateId: 'gate-1',
      pinType: 'output',
      pinIndex: 0,
      name: 'Test Signal',
      color: '#00ff88',
      visible: true,
      events: []
    }];

    render(<WaveformCanvas {...defaultProps} traces={traces} />);
    
    expect(screen.getByText('📊 Performance')).toBeInTheDocument();
    expect(screen.getByText('📈 Traces')).toBeInTheDocument();
    expect(screen.getByText('Test Signal')).toBeInTheDocument();
  });

  it('背景が適切な色で描画される', () => {
    render(<WaveformCanvas {...defaultProps} />);
    
    // fillRectが背景色で呼ばれたことを確認
    expect(mockCanvasContext.fillRect).toHaveBeenCalled();
    const fillRectCalls = mockCanvasContext.fillRect.mock.calls;
    expect(fillRectCalls.length).toBeGreaterThan(0);
    
    // scaleの後のfillStyleが#2a2a2aに設定されてfillRectが呼ばれる
    expect(mockCanvasContext.scale).toHaveBeenCalled();
  });

  it('グリッドが描画される', () => {
    render(<WaveformCanvas {...defaultProps} />);
    
    // グリッド線の描画を確認
    expect(mockCanvasContext.beginPath).toHaveBeenCalled();
    expect(mockCanvasContext.stroke).toHaveBeenCalled();
  });

  it('波形が正しく描画される', () => {
    const traces: TimingTrace[] = [{
      id: 'trace-1',
      gateId: 'gate-1',
      pinType: 'output',
      pinIndex: 0,
      name: 'Clock',
      color: '#00ff88',
      visible: true,
      events: [
        { id: 'e1', time: 100, gateId: 'gate-1', pinType: 'output', pinIndex: 0, value: true },
        { id: 'e2', time: 200, gateId: 'gate-1', pinType: 'output', pinIndex: 0, value: false },
        { id: 'e3', time: 300, gateId: 'gate-1', pinType: 'output', pinIndex: 0, value: true }
      ]
    }];

    // プロパティの変更を追跡
    const strokeStyleValues: string[] = [];
    const lineWidthValues: number[] = [];
    const shadowBlurValues: number[] = [];
    
    // setterをオーバーライドして値を記録
    Object.defineProperty(mockCanvasContext, 'strokeStyle', {
      get() { return this._strokeStyle; },
      set(value) {
        this._strokeStyle = value;
        strokeStyleValues.push(value);
      }
    });
    Object.defineProperty(mockCanvasContext, 'lineWidth', {
      get() { return this._lineWidth; },
      set(value) {
        this._lineWidth = value;
        lineWidthValues.push(value);
      }
    });
    Object.defineProperty(mockCanvasContext, 'shadowBlur', {
      get() { return this._shadowBlur; },
      set(value) {
        this._shadowBlur = value;
        shadowBlurValues.push(value);
      }
    });

    render(<WaveformCanvas {...defaultProps} traces={traces} />);
    
    // 波形描画時に設定された値を確認
    expect(strokeStyleValues).toContain('#00ff88');
    expect(lineWidthValues).toContain(4);
    expect(shadowBlurValues).toContain(12);
  });

  it('高DPIディスプレイに対応している', () => {
    // 高DPIをシミュレート
    Object.defineProperty(window, 'devicePixelRatio', { value: 2 });
    
    render(<WaveformCanvas {...defaultProps} />);
    
    // scaleが呼ばれることを確認
    expect(mockCanvasContext.scale).toHaveBeenCalledWith(2, 2);
  });

  it('時間窓が変更されると再描画される', () => {
    const { rerender } = render(<WaveformCanvas {...defaultProps} />);
    
    const clearCallCount = mockCanvasContext.fillRect.mock.calls.length;
    
    // 時間窓を変更
    const newTimeWindow = { start: 500, end: 1500 };
    rerender(<WaveformCanvas {...defaultProps} timeWindow={newTimeWindow} />);
    
    // 再描画されることを確認
    expect(mockCanvasContext.fillRect.mock.calls.length).toBeGreaterThan(clearCallCount);
  });

  it('リサイズに対応している', () => {
    const { container } = render(<WaveformCanvas {...defaultProps} />);
    const canvas = container.querySelector('canvas');
    
    // 親要素のサイズを変更
    Object.defineProperty(canvas?.parentElement, 'getBoundingClientRect', {
      value: () => ({ width: 1200, height: 400 })
    });
    
    // リサイズイベントを発火
    window.dispatchEvent(new Event('resize'));
    
    // Canvasのスタイルが更新されることを確認
    expect(canvas?.style.width).toBe('1200px');
    expect(canvas?.style.height).toBe('400px');
  });
});