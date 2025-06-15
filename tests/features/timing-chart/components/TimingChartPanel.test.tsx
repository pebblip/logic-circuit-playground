/**
 * TimingChartPanelコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TimingChartPanel } from '@/features/timing-chart/components/TimingChartPanel';
import { useCircuitStore } from '@/stores/circuitStore';

// モックの設定
vi.mock('@/stores/circuitStore');
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => 
      <div ref={ref} {...props}>{children}</div>
    )
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Heroiconsのモック
vi.mock('@heroicons/react/24/outline', () => ({
  ChartBarIcon: ({ className }: any) => <span className={className}>ChartBarIcon</span>,
  Cog6ToothIcon: ({ className }: any) => <span className={className}>Cog6ToothIcon</span>,
  XMarkIcon: ({ className }: any) => <span className={className}>XMarkIcon</span>,
  CameraIcon: ({ className }: any) => <span className={className}>CameraIcon</span>,
  MagnifyingGlassMinusIcon: ({ className }: any) => <span className={className}>MagnifyingGlassMinusIcon</span>,
  MagnifyingGlassPlusIcon: ({ className }: any) => <span className={className}>MagnifyingGlassPlusIcon</span>,
  ArrowsPointingOutIcon: ({ className }: any) => <span className={className}>ArrowsPointingOutIcon</span>
}));

// WaveformCanvasなどの子コンポーネントをモック
vi.mock('@/features/timing-chart/components/WaveformCanvas', () => ({
  WaveformCanvas: () => <div data-testid="waveform-canvas">WaveformCanvas</div>
}));

vi.mock('@/features/timing-chart/components/TimeAxis', () => ({
  TimeAxis: () => <div data-testid="time-axis">TimeAxis</div>
}));

vi.mock('@/features/timing-chart/components/TimeCursor', () => ({
  TimeCursor: () => <div data-testid="time-cursor">TimeCursor</div>
}));

vi.mock('@/features/timing-chart/components/TimingChartSettings', () => ({
  TimingChartSettings: () => <div data-testid="timing-chart-settings">Settings</div>
}));

const mockCircuitStore = {
  timingChart: {
    isVisible: false,
    panelHeight: 300,
    traces: [],
    timeWindow: { start: 0, end: 1000 },
    timeScale: 'ms' as const,
    cursor: null,
    settings: {
      theme: 'dark' as const,
      gridVisible: true,
      clockHighlightEnabled: true,
      edgeMarkersEnabled: true,
      signalLabelsVisible: true,
      autoCapture: true,
      captureDepth: 10000,
      updateInterval: 16
    }
  },
  timingChartActions: {
    togglePanel: vi.fn(),
    hidePanel: vi.fn(),
    setPanelHeight: vi.fn(),
    setCursor: vi.fn(),
    hideCursor: vi.fn(),
    updateSettings: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    fitToData: vi.fn(),
    resetView: vi.fn(),
    exportData: vi.fn(() => 'csv,data'),
    setTimeScale: vi.fn(),
    panTo: vi.fn(),
    updateTimeWindowForNewEvents: vi.fn()
  }
};

// 元のcreateElementを保存
const originalCreateElement = document.createElement.bind(document);

describe('TimingChartPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // mockCircuitStoreをリセット
    mockCircuitStore.timingChartActions.zoomIn = vi.fn();
    mockCircuitStore.timingChartActions.zoomOut = vi.fn();
    mockCircuitStore.timingChartActions.fitToData = vi.fn();
    
    (useCircuitStore as vi.Mock).mockReturnValue(mockCircuitStore);
    
    // URL.createObjectURLのモック
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // window.alertのモック
    global.alert = vi.fn();
  });

  it('トグルボタンが表示される', () => {
    render(<TimingChartPanel />);
    
    const toggleButton = screen.getByText('タイミングチャート');
    expect(toggleButton).toBeInTheDocument();
  });

  it('トグルボタンをクリックするとパネルが開閉する', () => {
    render(<TimingChartPanel />);
    
    const toggleButton = screen.getByText('タイミングチャート');
    fireEvent.click(toggleButton);
    
    expect(mockCircuitStore.timingChartActions.togglePanel).toHaveBeenCalled();
  });

  it('パネルが開いているとき、コンテンツが表示される', () => {
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true
      }
    });

    render(<TimingChartPanel />);
    
    expect(screen.getByTestId('waveform-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('time-axis')).toBeInTheDocument();
  });

  it('ズームボタンが機能する', () => {
    // モック関数を再作成
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockFitToData = vi.fn();
    const mockResetView = vi.fn();
    
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true,
        traces: [] // 空のtrace配列
      },
      timingChartActions: {
        ...mockCircuitStore.timingChartActions,
        zoomIn: mockZoomIn,
        zoomOut: mockZoomOut,
        fitToData: mockFitToData,
        resetView: mockResetView
      }
    });

    render(<TimingChartPanel />);
    
    const zoomInButton = screen.getByTitle('ズームイン (Ctrl++)');
    const zoomOutButton = screen.getByTitle('ズームアウト (Ctrl+-)');
    const fitButton = screen.getByTitle('全体表示 (Ctrl+0)');
    
    fireEvent.click(zoomInButton);
    expect(mockZoomIn).toHaveBeenCalled();
    
    fireEvent.click(zoomOutButton);
    expect(mockZoomOut).toHaveBeenCalled();
    
    // tracesが空の場合、resetViewが呼ばれる
    fireEvent.click(fitButton);
    expect(mockResetView).toHaveBeenCalled();
  });

  it('キーボードショートカットが機能する', () => {
    // モック関数を再作成
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockFitToData = vi.fn();
    const mockResetView = vi.fn();
    
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true,
        traces: [] // 空のtrace配列
      },
      timingChartActions: {
        ...mockCircuitStore.timingChartActions,
        zoomIn: mockZoomIn,
        zoomOut: mockZoomOut,
        fitToData: mockFitToData,
        resetView: mockResetView
      }
    });

    render(<TimingChartPanel />);
    
    // Ctrl + + でズームイン
    fireEvent.keyDown(window, { key: '+', ctrlKey: true });
    expect(mockZoomIn).toHaveBeenCalled();
    
    // Ctrl + - でズームアウト
    fireEvent.keyDown(window, { key: '-', ctrlKey: true });
    expect(mockZoomOut).toHaveBeenCalled();
    
    // tracesが空の場合、Ctrl + 0 でresetViewが呼ばれる
    fireEvent.keyDown(window, { key: '0', ctrlKey: true });
    expect(mockResetView).toHaveBeenCalled();
  });

  it('CSVエクスポートが機能する', () => {
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true
      }
    });

    render(<TimingChartPanel />);
    
    const exportButton = screen.getByTitle('CSVエクスポート');
    
    // ダウンロードリンクの作成をモック
    const linkElement = originalCreateElement('a');
    linkElement.click = vi.fn();
    
    const createElementSpy = vi.spyOn(document, 'createElement')
      .mockImplementation((tagName) => {
        if (tagName === 'a') return linkElement;
        return originalCreateElement(tagName);
      });
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    
    fireEvent.click(exportButton);
    
    expect(mockCircuitStore.timingChartActions.exportData).toHaveBeenCalledWith('csv');
    expect(linkElement.click).toHaveBeenCalled();
    
    // クリーンアップ
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('PNGスクリーンショットが機能する', () => {
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true
      }
    });

    const { container } = render(<TimingChartPanel />);
    
    // Canvasモックを実際のwaveform-canvas内に追加
    const waveformCanvas = container.querySelector('.waveform-canvas');
    if (waveformCanvas) {
      const mockCanvas = originalCreateElement('canvas');
      mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
      waveformCanvas.appendChild(mockCanvas);
    }
    
    const screenshotButton = screen.getByTitle('PNG画像として保存');
    
    // ダウンロードリンクの作成をモック
    const linkElement = originalCreateElement('a');
    linkElement.click = vi.fn();
    
    const createElementSpy = vi.spyOn(document, 'createElement')
      .mockImplementation((tagName) => {
        if (tagName === 'a') return linkElement;
        return originalCreateElement(tagName);
      });
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);
    
    fireEvent.click(screenshotButton);
    
    // Canvasが見つからない場合はalertが呼ばれる
    if (!waveformCanvas) {
      expect(global.alert).toHaveBeenCalledWith('スクリーンショットの保存に失敗しました。ブラウザがCanvas APIをサポートしていない可能性があります。');
    } else {
      expect(linkElement.click).toHaveBeenCalled();
    }
    
    // クリーンアップ
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('信号名が正しく表示される', () => {
    const traces = [
      {
        id: 'trace-1',
        gateId: 'gate-1749',
        pinType: 'output' as const,
        pinIndex: 0,
        name: '1749',
        color: '#00ff88',
        visible: true,
        events: []
      }
    ];

    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true,
        traces
      }
    });

    render(<TimingChartPanel />);
    
    expect(screen.getByText('1749')).toBeInTheDocument();
    expect(screen.getByText('1 traces')).toBeInTheDocument();
  });

  it('信号がない場合、メッセージが表示される', () => {
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true,
        traces: []
      }
    });

    render(<TimingChartPanel />);
    
    expect(screen.getByText('CLOCKゲートを配置すると')).toBeInTheDocument();
    expect(screen.getByText('自動的に波形が表示されます')).toBeInTheDocument();
  });

  it('閉じるボタンが機能する', () => {
    (useCircuitStore as vi.Mock).mockReturnValue({
      ...mockCircuitStore,
      timingChart: {
        ...mockCircuitStore.timingChart,
        isVisible: true
      }
    });

    render(<TimingChartPanel />);
    
    const closeButton = screen.getByTitle('閉じる');
    fireEvent.click(closeButton);
    
    expect(mockCircuitStore.timingChartActions.hidePanel).toHaveBeenCalled();
  });
});