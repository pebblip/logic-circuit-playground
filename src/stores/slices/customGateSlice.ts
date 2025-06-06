import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type {
  Gate,
  CustomGateDefinition,
  CustomGatePin,
} from '@/types/circuit';
import {
  saveCustomGates,
  loadCustomGates,
} from '@infrastructure/storage/customGateStorage';
import {
  evaluateCircuit,
  defaultConfig,
  isSuccess,
} from '@domain/simulation/core';
import type { Circuit } from '@domain/simulation/core/types';
import { IdGenerator } from '@shared/id';

export interface CustomGateSlice {
  customGates: CustomGateDefinition[];
  addCustomGate: (definition: CustomGateDefinition) => void;
  removeCustomGate: (id: string) => void;
  createCustomGateFromCurrentCircuit: () => void;
}

export const createCustomGateSlice: StateCreator<
  CircuitStore,
  [],
  [],
  CustomGateSlice
> = (set, get) => ({
  customGates: loadCustomGates(),

  addCustomGate: (definition: CustomGateDefinition) => {
    set(state => {
      const newCustomGates = [...state.customGates, definition];
      saveCustomGates(newCustomGates);
      return { customGates: newCustomGates };
    });
  },

  removeCustomGate: (id: string) => {
    set(state => {
      const newCustomGates = state.customGates.filter(g => g.id !== id);
      saveCustomGates(newCustomGates);
      return { customGates: newCustomGates };
    });
  },

  createCustomGateFromCurrentCircuit: () => {
    const state = get();
    const { gates } = state;

    // INPUTとOUTPUTゲートを抽出
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
      alert('回路にはINPUTゲートとOUTPUTゲートが必要です');
      return;
    }

    // ピン情報を作成
    const inputPins: CustomGatePin[] = inputGates.map((gate, index) => ({
      name: `IN${index + 1}`,
      index,
      gateId: gate.id,
    }));

    const outputPins: CustomGatePin[] = outputGates.map((gate, index) => ({
      name: `OUT${index + 1}`,
      index,
      gateId: gate.id,
    }));

    // 回路をシミュレーションして真理値表を生成
    const truthTable: Record<string, string> = {};
    const inputCount = inputGates.length;
    const combinations = Math.pow(2, inputCount);

    for (let i = 0; i < combinations; i++) {
      // 入力の組み合わせを設定
      const inputBits = i.toString(2).padStart(inputCount, '0');
      const testGates = gates.map(gate => {
        if (gate.type === 'INPUT') {
          const inputIndex = inputGates.findIndex(ig => ig.id === gate.id);
          return {
            ...gate,
            output: inputBits[inputIndex] === '1',
          };
        }
        return gate;
      });

      // 回路を評価
      const circuit: Circuit = { gates: testGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      let evaluatedGates: Gate[];
      if (isSuccess(result)) {
        evaluatedGates = [...result.data.circuit.gates];
      } else {
        console.warn(
          'Custom gate creation: Circuit evaluation failed:',
          result.error.message
        );
        evaluatedGates = testGates;
      }

      // 出力を読み取る
      const outputBits = outputGates
        .map(outputGate => {
          const evaluatedGate = evaluatedGates.find(
            g => g.id === outputGate.id
          );
          // OUTPUTゲートの場合、inputs[0]を文字列として比較
          if (evaluatedGate?.inputs && evaluatedGate.inputs.length > 0) {
            return evaluatedGate.inputs[0] === '1' ? '1' : '0';
          }
          // 新API対応: OUTPUTゲートのoutputプロパティもチェック
          return evaluatedGate?.output ? '1' : '0';
        })
        .join('');

      truthTable[inputBits] = outputBits;
    }

    // カスタムゲート定義を作成
    const definition: CustomGateDefinition = {
      id: IdGenerator.generateCustomGateId(),
      name: `CustomGate_${Date.now()}`,
      displayName: 'カスタムゲート',
      description: '現在の回路から作成されたカスタムゲート',
      icon: '⚡',
      width: 100,
      height: Math.max(80, Math.max(inputCount, outputPins.length) * 40),
      inputs: inputPins,
      outputs: outputPins,
      truthTable,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // カスタムゲートを追加
    get().addCustomGate(definition);
    alert('カスタムゲートが作成されました！');
  },
});
