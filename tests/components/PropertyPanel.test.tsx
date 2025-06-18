import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyPanel } from '@/components/property-panel/PropertyPanel';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate } from '@/types/circuit';
import '@testing-library/jest-dom';

// モック
vi.mock('@/stores/circuitStore');

describe('PropertyPanel', () => {
  const mockUpdateGate = vi.fn();
  const mockDeleteGate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // useCircuitStoreのモック設定
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: null,
      gates: [],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
  });

  it('ゲートが選択されていない時は空のパネルを表示', () => {
    render(<PropertyPanel />);
    
    expect(screen.getByText('プロパティ')).toBeInTheDocument();
    expect(screen.getByText('ゲートを選択してください')).toBeInTheDocument();
  });

  it('基本ゲートのプロパティを表示', () => {
    const selectedGate: Gate = {
      id: 'and1',
      type: 'AND',
      position: { x: 100, y: 200 },
      inputs: ['0', '1'],
      output: false
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'and1',
      gates: [selectedGate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // ゲート情報が表示される
    expect(screen.getByText('ANDゲート')).toBeInTheDocument();
    expect(screen.getByText('ID: and1')).toBeInTheDocument();
    expect(screen.getByText('位置: (100, 200)')).toBeInTheDocument();
    
    // 入出力状態が表示される
    expect(screen.getByText('入力 1: 0')).toBeInTheDocument();
    expect(screen.getByText('入力 2: 1')).toBeInTheDocument();
    expect(screen.getByText('出力: false')).toBeInTheDocument();
  });

  it('CLOCKゲートの設定を変更できる', async () => {
    const user = userEvent.setup();
    const clockGate: Gate = {
      id: 'clock1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      output: false,
      metadata: {
        frequency: 1,
        isRunning: true
      }
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'clock1',
      gates: [clockGate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // CLOCK特有の設定が表示される
    expect(screen.getByText('CLOCKゲート')).toBeInTheDocument();
    expect(screen.getByLabelText('周波数 (Hz)')).toBeInTheDocument();
    expect(screen.getByLabelText('動作状態')).toBeInTheDocument();
    
    // 周波数を変更
    const frequencyInput = screen.getByLabelText('周波数 (Hz)');
    await user.clear(frequencyInput);
    await user.type(frequencyInput, '5');
    
    // updateGateが呼ばれることを確認
    expect(mockUpdateGate).toHaveBeenCalledWith('clock1', {
      metadata: {
        frequency: 5,
        isRunning: true
      }
    });
    
    // 動作状態を切り替え
    const runningToggle = screen.getByLabelText('動作状態');
    await user.click(runningToggle);
    
    expect(mockUpdateGate).toHaveBeenCalledWith('clock1', {
      metadata: {
        frequency: 5,
        isRunning: false
      }
    });
  });

  it('カスタムゲートの詳細情報を表示', () => {
    const customGate: Gate = {
      id: 'custom1',
      type: 'CUSTOM',
      position: { x: 200, y: 300 },
      inputs: ['', ''],
      output: false,
      customGateDefinition: {
        id: 'half-adder',
        name: '半加算器',
        displayName: 'HA',
        description: '1ビットの半加算器',
        inputs: [
          { name: 'A', index: 0 },
          { name: 'B', index: 1 }
        ],
        outputs: [
          { name: 'Sum', index: 0 },
          { name: 'Carry', index: 1 }
        ],
        width: 80,
        height: 60,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'custom1',
      gates: [customGate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // カスタムゲート情報が表示される
    expect(screen.getByText('カスタムゲート: 半加算器')).toBeInTheDocument();
    expect(screen.getByText('表示名: HA')).toBeInTheDocument();
    expect(screen.getByText('1ビットの半加算器')).toBeInTheDocument();
    
    // ピン情報が表示される
    expect(screen.getByText('入力ピン:')).toBeInTheDocument();
    expect(screen.getByText('A (ピン1)')).toBeInTheDocument();
    expect(screen.getByText('B (ピン2)')).toBeInTheDocument();
    
    expect(screen.getByText('出力ピン:')).toBeInTheDocument();
    expect(screen.getByText('Sum')).toBeInTheDocument();
    expect(screen.getByText('Carry')).toBeInTheDocument();
  });

  it('ゲートを削除できる', async () => {
    const user = userEvent.setup();
    const gate: Gate = {
      id: 'gate1',
      type: 'OR',
      position: { x: 150, y: 250 },
      inputs: ['', ''],
      output: false
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'gate1',
      gates: [gate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByText('ゲートを削除');
    await user.click(deleteButton);
    
    // 確認ダイアログが表示される（実装による）
    // ここでは直接削除が呼ばれると仮定
    expect(mockDeleteGate).toHaveBeenCalledWith('gate1');
  });

  it('特殊ゲートの追加情報を表示', () => {
    const srLatchGate: Gate = {
      id: 'srlatch1',
      type: 'SR-LATCH',
      position: { x: 300, y: 400 },
      inputs: ['0', '0'],
      output: true,
      outputs: [true, false]
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'srlatch1',
      gates: [srLatchGate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // SR-LATCH特有の情報
    expect(screen.getByText('SR-LATCHゲート')).toBeInTheDocument();
    expect(screen.getByText('S入力: 0')).toBeInTheDocument();
    expect(screen.getByText('R入力: 0')).toBeInTheDocument();
    expect(screen.getByText('Q出力: true')).toBeInTheDocument();
    expect(screen.getByText('Q̄出力: false')).toBeInTheDocument();
    
    // 状態説明
    expect(screen.getByText('現在の状態: 保持')).toBeInTheDocument();
  });

  it('位置情報を編集できる', async () => {
    const user = userEvent.setup();
    const gate: Gate = {
      id: 'gate1',
      type: 'NOT',
      position: { x: 100, y: 200 },
      inputs: [''],
      output: true
    };
    
    vi.mocked(useCircuitStore).mockReturnValue({
      selectedGateId: 'gate1',
      gates: [gate],
      updateGate: mockUpdateGate,
      deleteGate: mockDeleteGate,
      updateClockFrequency: vi.fn(),
      updateGateTiming: vi.fn(),
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
      customGates: []
    } as any);
    
    render(<PropertyPanel />);
    
    // 位置編集ボタンをクリック
    const editPositionButton = screen.getByLabelText('位置を編集');
    await user.click(editPositionButton);
    
    // 編集フィールドが表示される
    const xInput = screen.getByLabelText('X座標');
    const yInput = screen.getByLabelText('Y座標');
    
    // 値を変更
    await user.clear(xInput);
    await user.type(xInput, '150');
    
    await user.clear(yInput);
    await user.type(yInput, '250');
    
    // 適用ボタンをクリック
    const applyButton = screen.getByText('適用');
    await user.click(applyButton);
    
    // updateGateが呼ばれることを確認
    expect(mockUpdateGate).toHaveBeenCalledWith('gate1', {
      position: { x: 150, y: 250 }
    });
  });

  it('ゲートタイプのアイコンが表示される', () => {
    const gates: Gate[] = [
      { id: 'and', type: 'AND', position: { x: 0, y: 0 }, inputs: ['', ''], output: false },
      { id: 'or', type: 'OR', position: { x: 0, y: 0 }, inputs: ['', ''], output: false },
      { id: 'not', type: 'NOT', position: { x: 0, y: 0 }, inputs: [''], output: false },
      { id: 'xor', type: 'XOR', position: { x: 0, y: 0 }, inputs: ['', ''], output: false }
    ];
    
    gates.forEach(gate => {
      vi.mocked(useCircuitStore).mockReturnValue({
        selectedGateId: gate.id,
        gates: [gate],
        updateGate: mockUpdateGate,
        deleteGate: mockDeleteGate,
        updateClockFrequency: vi.fn(),
        updateGateTiming: vi.fn(),
        selectedToolGateType: null,
        selectedToolCustomGateId: null,
        customGates: []
      } as any);
      
      const { rerender } = render(<PropertyPanel />);
      
      // 各ゲートタイプのアイコンが表示される
      const icon = screen.getByTestId(`gate-icon-${gate.type}`);
      expect(icon).toBeInTheDocument();
      
      rerender(<></>); // クリーンアップ
    });
  });
});