import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateComponent } from '@/components/Gate';
import { evaluateCircuit } from '@/domain/simulation/core/circuitEvaluation';

describe('Pin State Synchronization', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateIds: new Set(),
      selectedWireIds: new Set(),
    });
  });

  it('should correctly update NAND gate input pin states when inputs change', () => {
    const store = useCircuitStore.getState();
    
    // 2つのINPUTゲートとNANDゲートを作成
    const input1 = {
      id: 'input1',
      type: 'INPUT' as const,
      position: { x: 100, y: 100 },
      inputs: [],
      output: false,
      metadata: {},
    };
    
    const input2 = {
      id: 'input2',
      type: 'INPUT' as const,
      position: { x: 100, y: 200 },
      inputs: [],
      output: false,
      metadata: {},
    };
    
    const nandGate = {
      id: 'nand1',
      type: 'NAND' as const,
      position: { x: 300, y: 150 },
      inputs: ['', ''],
      output: true,
      metadata: {},
    };
    
    // ゲートを追加
    store.addGate(input1);
    store.addGate(input2);
    store.addGate(nandGate);
    
    // ワイヤーを追加
    store.addWire({
      id: 'wire1',
      from: { gateId: 'input1', pinIndex: -1 },
      to: { gateId: 'nand1', pinIndex: 0 },
      isActive: false,
    });
    
    store.addWire({
      id: 'wire2',
      from: { gateId: 'input2', pinIndex: -1 },
      to: { gateId: 'nand1', pinIndex: 1 },
      isActive: false,
    });
    
    // 初期状態を評価
    const circuit1 = {
      gates: store.gates,
      wires: store.wires,
      metadata: {},
    };
    
    const result1 = evaluateCircuit(circuit1);
    expect(result1.success).toBe(true);
    if (result1.success) {
      const updatedCircuit1 = result1.data.circuit;
      
      // NANDゲートの初期状態確認（両入力がfalseなのでoutputはtrue）
      const nand1 = updatedCircuit1.gates.find(g => g.id === 'nand1');
      expect(nand1?.output).toBe(true);
      expect(nand1?.inputs).toEqual(['', '']);
    }
    
    // 両方のINPUTをONにする
    store.updateGate('input1', { output: true });
    store.updateGate('input2', { output: true });
    
    const circuit2 = {
      gates: store.gates,
      wires: store.wires,
      metadata: {},
    };
    
    const result2 = evaluateCircuit(circuit2);
    expect(result2.success).toBe(true);
    if (result2.success) {
      const updatedCircuit2 = result2.data.circuit;
      
      // NANDゲートの状態確認（両入力がtrueなのでoutputはfalse）
      const nand2 = updatedCircuit2.gates.find(g => g.id === 'nand1');
      expect(nand2?.output).toBe(false);
      expect(nand2?.inputs).toEqual(['1', '1']);
    }
    
    // 上のINPUTのみOFFにする
    store.updateGate('input1', { output: false });
    
    const circuit3 = {
      gates: store.gates,
      wires: store.wires,
      metadata: {},
    };
    
    const result3 = evaluateCircuit(circuit3);
    expect(result3.success).toBe(true);
    if (result3.success) {
      const updatedCircuit3 = result3.data.circuit;
      
      // NANDゲートの状態確認（片方がfalseなのでoutputはtrue）
      const nand3 = updatedCircuit3.gates.find(g => g.id === 'nand1');
      expect(nand3?.output).toBe(true);
      expect(nand3?.inputs).toEqual(['', '1']); // ここが重要：正しく更新されているか
      
      // ワイヤーの状態も確認
      const wire1 = updatedCircuit3.wires.find(w => w.id === 'wire1');
      const wire2 = updatedCircuit3.wires.find(w => w.id === 'wire2');
      expect(wire1?.isActive).toBe(false);
      expect(wire2?.isActive).toBe(true);
    }
  });

  it('should render NAND gate pins with correct active states', () => {
    const nandGate = {
      id: 'nand1',
      type: 'NAND' as const,
      position: { x: 300, y: 150 },
      inputs: ['', '1'], // 上の入力はOFF、下の入力はON
      output: true,
      metadata: {},
    };
    
    const { container } = render(
      <svg>
        <GateComponent gate={nandGate} />
      </svg>
    );
    
    // ピンの要素を取得
    const pins = container.querySelectorAll('.pin');
    expect(pins.length).toBe(3); // 2つの入力ピン + 1つの出力ピン
    
    // 入力ピンの状態を確認（順序に注意）
    const inputPins = container.querySelectorAll('.input-pin');
    expect(inputPins.length).toBe(2);
    
    // 各ピンのfill属性を確認
    inputPins.forEach((pin, index) => {
      const circle = pin as SVGCircleElement;
      const fill = circle.getAttribute('fill');
      
      if (index === 0) {
        // 上の入力ピン（inputs[0] = ''）
        expect(fill).toBe('none');
      } else {
        // 下の入力ピン（inputs[1] = '1'）
        expect(fill).toBe('#00ff88');
      }
    });
  });
});