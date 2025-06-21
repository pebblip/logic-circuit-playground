import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import type { Gate, Wire } from '@/types/circuit';

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('Custom Gate Slice - INPUT/OUTPUT Only Circuit', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      customGates: [],
    });
    localStorageMock.clear();
  });

  test('should correctly save internal circuit for INPUT/OUTPUT only custom gate', () => {
    const store = useCircuitStore.getState();
    
    // INPUTゲートを作成（中央左側）
    const inputGate: Gate = {
      id: 'input-1',
      type: 'INPUT',
      position: { x: 400, y: 300 },
      inputs: [],
      output: true,
    };
    
    // OUTPUTゲートを作成（中央右側）
    const outputGate: Gate = {
      id: 'output-1',
      type: 'OUTPUT',
      position: { x: 600, y: 300 },
      inputs: [false],
      output: false,
    };
    
    // ワイヤーで接続
    const wire: Wire = {
      id: 'wire-1',
      from: { gateId: 'input-1', pinIndex: -1 },
      to: { gateId: 'output-1', pinIndex: 0 },
      isActive: true,
    };
    
    // ゲートとワイヤーを追加
    useCircuitStore.setState({
      gates: [inputGate, outputGate],
      wires: [wire],
    });
    
    // カスタムゲートを作成
    store.createCustomGateFromCurrentCircuit();
    
    // カスタムゲートが作成されたか確認
    const updatedStore = useCircuitStore.getState();
    expect(updatedStore.customGates).toHaveLength(1);
    
    const customGate = updatedStore.customGates[0];
    expect(customGate).toBeDefined();
    expect(customGate.inputs).toHaveLength(1);
    expect(customGate.outputs).toHaveLength(1);
    
    // 内部回路が保存されているか確認
    expect(customGate.internalCircuit).toBeDefined();
    expect(customGate.internalCircuit?.gates).toHaveLength(2);
    expect(customGate.internalCircuit?.wires).toHaveLength(1);
    
    // ゲートの位置が正しく保存されているか確認
    const savedInputGate = customGate.internalCircuit?.gates.find(g => g.type === 'INPUT');
    const savedOutputGate = customGate.internalCircuit?.gates.find(g => g.type === 'OUTPUT');
    
    expect(savedInputGate).toBeDefined();
    expect(savedInputGate?.position).toEqual({ x: 400, y: 300 });
    
    expect(savedOutputGate).toBeDefined();
    expect(savedOutputGate?.position).toEqual({ x: 600, y: 300 });
    
    console.log('Custom gate internal circuit:', {
      gates: customGate.internalCircuit?.gates,
      wires: customGate.internalCircuit?.wires,
      inputMappings: customGate.internalCircuit?.inputMappings,
      outputMappings: customGate.internalCircuit?.outputMappings,
    });
  });

  test('should display internal circuit in preview mode', () => {
    // まず回路を作成
    const inputGate: Gate = {
      id: 'input-1',
      type: 'INPUT',
      position: { x: 400, y: 300 },
      inputs: [],
      output: true,
    };
    
    const outputGate: Gate = {
      id: 'output-1',
      type: 'OUTPUT',
      position: { x: 600, y: 300 },
      inputs: [false],
      output: false,
    };
    
    const wire: Wire = {
      id: 'wire-1',
      from: { gateId: 'input-1', pinIndex: -1 },
      to: { gateId: 'output-1', pinIndex: 0 },
      isActive: true,
    };
    
    useCircuitStore.setState({
      gates: [inputGate, outputGate],
      wires: [wire],
    });
    
    // カスタムゲートを作成
    const store = useCircuitStore.getState();
    store.createCustomGateFromCurrentCircuit();
    
    // プレビューモードに入る
    const updatedStore = useCircuitStore.getState();
    const customGate = updatedStore.customGates[0];
    updatedStore.enterCustomGatePreview(customGate.id);
    
    // プレビューモードの状態を確認
    const previewState = useCircuitStore.getState();
    expect(previewState.viewMode).toBe('custom-gate-preview');
    expect(previewState.previewingCustomGateId).toBe(customGate.id);
  });
});