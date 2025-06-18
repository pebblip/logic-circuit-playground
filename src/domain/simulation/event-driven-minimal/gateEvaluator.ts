/**
 * イベント駆動シミュレーション用のゲート評価
 */

import type { Gate } from '../../../types/circuit';
import type { GateState } from './types';
import { evaluateGateUnified } from '../core/gateEvaluation';
import { isCustomGate } from '../../../types/gates';
import { evaluateCustomGateByInternalCircuit } from '../core/customGateInternalCircuitEvaluator';
import { defaultConfig } from '../core/types';

/**
 * ゲートを評価し、新しい出力値を返す
 */
export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  state: GateState
): boolean[] {
  // カスタムゲートの特別処理
  if (isCustomGate(gate) && gate.customGateDefinition) {
    // 内部回路評価を優先
    if (gate.customGateDefinition.internalCircuit) {
      const result = evaluateCustomGateByInternalCircuit(
        gate.customGateDefinition,
        inputs,
        defaultConfig
      );
      
      if (result.success) {
        return [...result.data];
      }
    }
    
    // 真理値表による評価
    if (gate.customGateDefinition.truthTable) {
      const inputPattern = inputs.map(v => v ? '1' : '0').join('');
      const outputPattern = gate.customGateDefinition.truthTable[inputPattern];
      
      if (outputPattern) {
        return outputPattern.split('').map(bit => bit === '1');
      }
    }
    
    // フォールバック
    return [false];
  }
  
  // D-FFとSR-LATCHの特別処理（状態保持ゲート）
  if (gate.type === 'D-FF') {
    if (inputs.length >= 2) {
      const d = inputs[0];
      const clk = inputs[1];
      // 重要：前回評価時のクロック状態を取得（現在のクロック状態ではない）
      const prevClk = typeof state.metadata?.previousClockState === 'boolean' 
        ? state.metadata.previousClockState 
        : false;
      let qOutput = typeof state.metadata?.qOutput === 'boolean'
        ? state.metadata.qOutput
        : false;
      
      // 立ち上がりエッジ検出
      if (!prevClk && clk) {
        qOutput = d;
      }
      // 注意：previousClockStateの更新は評価前に行われているため、ここでは更新しない
      
      return [qOutput, !qOutput];
    }
    return [false, true];
  }
  
  if (gate.type === 'SR-LATCH') {
    if (inputs.length >= 2) {
      const s = inputs[0];
      const r = inputs[1];
      let qOutput = typeof state.metadata?.qOutput === 'boolean'
        ? state.metadata.qOutput
        : false;
      
      // S=1, R=0 => Q=1
      if (s && !r) {
        qOutput = true;
      }
      // S=0, R=1 => Q=0
      else if (!s && r) {
        qOutput = false;
      }
      // S=0, R=0 => 状態保持
      // S=1, R=1 => 不定状態（現在の状態を保持）
      
      return [qOutput, !qOutput];
    }
    return [false, true];
  }
  
  // 通常のゲートは統合評価関数を使用（ただしメタデータを渡す）
  const gateWithUpdatedMetadata = { ...gate, metadata: state.metadata };
  const result = evaluateGateUnified(gateWithUpdatedMetadata, inputs, defaultConfig);
  
  if (result.success) {
    return [...result.data.outputs];
  } else {
    // エラーの場合はデフォルト値を返す
    console.warn(`Gate evaluation failed: ${result.error.message}`);
    return [false];
  }
}