/**
 * ゲート評価関数
 * 各ゲートタイプの論理を実装
 */

import type { Gate } from '../../../types/circuit';
import type { GateState } from './types';

/**
 * ゲートを評価して新しい出力を計算
 */
export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  state: GateState
): boolean[] {
  switch (gate.type) {
    case 'INPUT':
      return [gate.output];
    
    case 'OUTPUT':
      return [inputs[0] || false];
    
    case 'AND':
      return [inputs[0] && inputs[1]];
    
    case 'OR':
      return [inputs[0] || inputs[1]];
    
    case 'NOT':
      return [!inputs[0]];
    
    case 'XOR':
      return [inputs[0] !== inputs[1]];
    
    case 'NAND':
      return [!(inputs[0] && inputs[1])];
    
    case 'NOR':
      return [!(inputs[0] || inputs[1])];
    
    case 'CLOCK': {
      // CLOCKゲートは特殊処理
      const frequency = gate.metadata?.frequency || 1;
      const isRunning = gate.metadata?.isRunning || false;
      if (!isRunning) return [false];
      
      // 簡易実装：前回の状態を反転
      const currentOutput = state.outputs[0] || false;
      return [!currentOutput]; // TODO: 実際の時間ベース実装
    }
    
    case 'D-FF': {
      // D-フリップフロップ
      const d = inputs[0] || false;
      const clk = inputs[1] || false;
      const prevClk = state.previousInputs?.[1] || false;
      
      // 立ち上がりエッジ検出
      if (!prevClk && clk) {
        return [d, !d]; // Q出力とQ̄出力
      }
      
      // 状態保持
      const currentQ = state.outputs[0] || false;
      return [currentQ, !currentQ];
    }
    
    case 'SR-LATCH': {
      // SR-ラッチ
      const s = inputs[0] || false;
      const r = inputs[1] || false;
      const currentQ = state.outputs[0] || false;
      
      let newQ = currentQ;
      
      if (s && !r) {
        newQ = true; // Set
      } else if (!s && r) {
        newQ = false; // Reset
      } else if (s && r) {
        newQ = currentQ; // 不定（現状維持）
      } else {
        newQ = currentQ; // Hold
      }
      
      return [newQ, !newQ]; // QとQ̄の2つの出力
    }
    
    case 'MUX': {
      // マルチプレクサ
      const a = inputs[0] || false;
      const b = inputs[1] || false;
      const sel = inputs[2] || false;
      
      return [sel ? b : a];
    }
    
    case 'BINARY_COUNTER': {
      // バイナリカウンタ
      const clk = inputs[0] || false;
      const prevClk = state.previousInputs?.[0] || false;
      const bitCount = gate.metadata?.bitCount || 2;
      let currentValue = (state.metadata?.currentValue as number) || 0;
      
      // 立ち上がりエッジでカウント
      if (!prevClk && clk) {
        currentValue = (currentValue + 1) % (1 << bitCount);
        state.metadata = { ...state.metadata, currentValue };
      }
      
      // ビット毎の出力
      const outputs: boolean[] = [];
      for (let i = 0; i < bitCount; i++) {
        outputs.push((currentValue & (1 << i)) !== 0);
      }
      
      return outputs;
    }
    
    case 'CUSTOM': {
      // カスタムゲート（真理値表ベース）
      if (!gate.customGateDefinition?.truthTable) {
        return state.outputs; // 変化なし
      }
      
      const inputPattern = inputs.map(i => i ? '1' : '0').join('');
      const outputPattern = gate.customGateDefinition.truthTable[inputPattern];
      
      if (outputPattern) {
        return outputPattern.split('').map(bit => bit === '1');
      }
      
      return state.outputs; // デフォルト
    }
    
    case 'DELAY': {
      // 遅延ゲート（3サイクル遅延）
      const history = (state.metadata?.history || []) as boolean[];
      const currentInput = inputs[0] || false;
      
      // 3サイクル前の値を出力（なければfalse）
      const output = history.length >= 3 ? history[0] : false;
      
      // 履歴に現在の入力を追加
      const newHistory = [...history, currentInput];
      
      // 履歴を最大3つまで保持
      if (newHistory.length > 3) {
        newHistory.shift();
      }
      
      // メタデータを更新
      state.metadata = { ...state.metadata, history: newHistory };
      
      return [output];
    }
    
    default:
      return state.outputs; // 未対応のゲートは現状維持
  }
}