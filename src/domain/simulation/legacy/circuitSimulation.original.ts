import type { Gate, Wire } from '../../types/circuit';
import { isCustomGate } from '../../types/gates';
import {
  setGateInputValue,
  getGateInputValue,
  booleanArrayToDisplayStates,
} from './signalConversion';

// 時間プロバイダー型定義（決定的シミュレーション用）
export interface TimeProvider {
  getCurrentTime(): number;
}

// デフォルト時間プロバイダー（実時間）
export const realTimeProvider: TimeProvider = {
  getCurrentTime: () => Date.now()
};

// 決定的時間プロバイダー（テスト用）
export const createDeterministicTimeProvider = (baseTime: number = 0, incrementMs: number = 100): TimeProvider => {
  let currentTime = baseTime;
  return {
    getCurrentTime: () => {
      const time = currentTime;
      currentTime += incrementMs;
      return time;
    }
  };
};

// 固定時間プロバイダー（CLOCKゲート単体テスト用）
export const createFixedTimeProvider = (fixedTime: number): TimeProvider => {
  return {
    getCurrentTime: () => fixedTime
  };
};

// デバッグログユーティリティ（開発時のみ有効）
const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Simulation] ${message}`, data);
    }
  }
};

// ゲートのロジックを評価（後方互換性用）
export function evaluateGate(
  gate: Gate,
  inputs: boolean[]
): boolean | boolean[];

// ゲートのロジックを評価（時間プロバイダー対応）
export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  timeProvider?: TimeProvider
): boolean | boolean[];

// 実装
export function evaluateGate(
  gate: Gate,
  inputs: boolean[],
  timeProvider: TimeProvider = realTimeProvider
): boolean | boolean[] {
  switch (gate.type) {
    case 'INPUT':
      return gate.output;

    case 'OUTPUT':
      return inputs[0] || false;

    case 'AND':
      return inputs.length === 2 && inputs[0] && inputs[1];

    case 'OR':
      return inputs.some(input => input);

    case 'NOT':
      return !inputs[0];

    case 'XOR':
      return inputs.length === 2 && inputs[0] !== inputs[1];

    case 'NAND':
      return !(inputs.length === 2 && inputs[0] && inputs[1]);

    case 'NOR':
      return !inputs.some(input => input);

    // 特殊ゲート（今後実装）
    case 'CLOCK':
      // CLOCKゲートは自己生成信号
      if (gate.metadata?.isRunning) {
        const frequency = gate.metadata.frequency || 1;
        const period = 1000 / frequency;
        const now = timeProvider.getCurrentTime();
        const startTime = gate.metadata.startTime !== undefined ? gate.metadata.startTime : now;
        const elapsed = now - startTime;
        // 周期的な切り替え
        return Math.floor(elapsed / period) % 2 === 1;
      }
      return false;

    case 'D-FF':
      // D-FFの実装（立ち上がりエッジでDをキャプチャ）
      if (gate.metadata && inputs.length >= 2) {
        const d = inputs[0];
        const clk = inputs[1];
        const prevClk = gate.metadata.previousClockState || false;

        // 立ち上がりエッジ検出
        if (!prevClk && clk) {
          gate.metadata.qOutput = d;
          gate.metadata.qBarOutput = !d;
        }

        // 現在のクロック状態を保存
        gate.metadata.previousClockState = clk;

        return gate.metadata.qOutput;
      }
      return false;

    case 'SR-LATCH':
      // SR-Latchの実装
      if (gate.metadata && inputs.length >= 2) {
        const s = inputs[0]; // Set
        const r = inputs[1]; // Reset

        // S=1, R=0 => Q=1
        if (s && !r) {
          gate.metadata.qOutput = true;
          gate.metadata.qBarOutput = false;
        }
        // S=0, R=1 => Q=0
        else if (!s && r) {
          gate.metadata.qOutput = false;
          gate.metadata.qBarOutput = true;
        }
        // S=0, R=0 => 状態保持
        // S=1, R=1 => 不定状態（避けるべき）

        return gate.metadata.qOutput;
      }
      return false;

    case 'MUX':
      // 2:1 MUXの実装
      if (inputs.length >= 3) {
        const i0 = inputs[0]; // Input 0
        const i1 = inputs[1]; // Input 1
        const select = inputs[2]; // Select
        // S=0 => Y=I0, S=1 => Y=I1
        return select ? i1 : i0;
      }
      return false;

    case 'CUSTOM':
      // カスタムゲートの評価
      if (isCustomGate(gate) && gate.customGateDefinition) {
        const definition = gate.customGateDefinition;
        debug.log('🔧 カスタムゲート評価開始:', {
          gateId: gate.id,
          gateName: definition.name,
          inputs: inputs,
          inputsLength: inputs.length,
          definitionInputs: definition.inputs.length,
          outputsCount: definition.outputs.length,
        });

        // 内部回路がある場合は回路評価
        if (definition.internalCircuit) {
          debug.log('📋 内部回路を評価:', {
            internalGatesCount: definition.internalCircuit.gates.length,
            inputMappings: definition.internalCircuit.inputMappings,
            outputMappings: definition.internalCircuit.outputMappings,
          });

          // 入力値を内部ゲートにマッピング
          const internalGates = definition.internalCircuit.gates.map(g => ({
            ...g,
          }));

          // 入力マッピングを適用
          Object.entries(definition.internalCircuit.inputMappings).forEach(
            ([pinIndex, mapping]) => {
              const inputValue = inputs[Number(pinIndex)] || false;
              const targetGate = internalGates.find(
                g => g.id === mapping.gateId
              );
              debug.log('🔌 入力マッピング適用:', {
                pinIndex,
                inputValue,
                targetGateId: mapping.gateId,
                targetGateType: targetGate?.type,
              });
              if (targetGate) {
                // INPUTゲートの場合はoutputを設定
                if (targetGate.type === 'INPUT') {
                  targetGate.output = inputValue;
                  debug.log('📥 INPUTゲート出力設定:', {
                    gateId: targetGate.id,
                    output: inputValue,
                  });
                } else if (mapping.pinIndex < targetGate.inputs.length) {
                  setGateInputValue(targetGate, mapping.pinIndex, inputValue);
                  debug.log('📥 ゲート入力設定:', {
                    gateId: targetGate.id,
                    pinIndex: mapping.pinIndex,
                    value: inputValue ? '1' : '',
                  });
                }
              }
            }
          );

          // 内部回路を評価
          const { gates: evaluatedGates } = evaluateCircuit(
            internalGates,
            definition.internalCircuit.wires,
            timeProvider
          );

          debug.log('⚡ 内部回路評価完了:', {
            evaluatedGatesCount: evaluatedGates.length,
            gateOutputs: evaluatedGates.map(g => ({
              id: g.id,
              type: g.type,
              output: g.output,
            })),
          });

          // 全ての出力マッピングから結果を取得
          const outputs: boolean[] = [];
          for (
            let outputIndex = 0;
            outputIndex < definition.outputs.length;
            outputIndex++
          ) {
            const outputMapping =
              definition.internalCircuit.outputMappings[outputIndex];
            if (outputMapping) {
              const outputGate = evaluatedGates.find(
                g => g.id === outputMapping.gateId
              );
              debug.log('📤 出力マッピング処理 [' + outputIndex + ']:', {
                outputMapping,
                outputGateId: outputMapping.gateId,
                outputGateFound: !!outputGate,
                outputGateType: outputGate?.type,
                outputGateOutput: outputGate?.output,
              });
              if (outputGate) {
                let result;
                // OUTPUTゲートの場合、outputを返す
                if (outputGate.type === 'OUTPUT') {
                  result = outputGate.output;
                  debug.log(
                    '✅ OUTPUTゲートから結果取得 [' + outputIndex + ']:',
                    { result }
                  );
                }
                // その他のゲートで出力ピンの場合
                else if (outputMapping.pinIndex === -1) {
                  result = outputGate.output;
                  debug.log(
                    '✅ 出力ピンから結果取得 [' + outputIndex + ']:',
                    { result }
                  );
                }
                // 入力ピンの場合
                else {
                  result = getGateInputValue(
                    outputGate,
                    outputMapping.pinIndex
                  );
                  debug.log(
                    '✅ 入力ピンから結果取得 [' + outputIndex + ']:',
                    {
                      pinIndex: outputMapping.pinIndex,
                      pinValue: outputGate.inputs[outputMapping.pinIndex],
                      result,
                    }
                  );
                }
                outputs.push(result);
              } else {
                outputs.push(false);
              }
            } else {
              outputs.push(false);
            }
          }

          debug.log('🎯 カスタムゲート全出力:', { outputs });

          // 単一出力の場合は後方互換性のためにbooleanを返す
          if (outputs.length === 1) {
            return outputs[0];
          }
          // 複数出力の場合は配列を返す
          return outputs;
        }
        // 真理値表がある場合はフォールバック
        else if (definition.truthTable) {
          const inputPattern = inputs
            .map(input => (input ? '1' : '0'))
            .join('');
          const outputPattern = definition.truthTable[inputPattern];

          debug.log('📊 真理値表フォールバック処理:', {
            gateId: gate.id,
            gateName: definition.name,
            inputs,
            inputPattern,
            truthTable: definition.truthTable,
            outputPattern,
          });

          if (outputPattern) {
            // 真理値表から全ての出力を取得
            const outputs = outputPattern.split('').map(bit => bit === '1');
            debug.log('✅ 真理値表から結果取得:', { outputs });

            // 単一出力の場合は後方互換性のためにbooleanを返す
            if (outputs.length === 1) {
              return outputs[0];
            }
            // 複数出力の場合は配列を返す
            return outputs;
          }
        }
      }
      return false;

    default:
      return false;
  }
}

// 回路全体を評価（後方互換性用） - オーバーロード宣言削除

// エラー型定義
export interface CircuitEvaluationError {
  type: 'INVALID_GATE' | 'INVALID_WIRE' | 'CIRCULAR_DEPENDENCY' | 'MISSING_DEPENDENCY' | 'EVALUATION_ERROR';
  message: string;
  details?: {
    gateId?: string;
    wireId?: string;
    stack?: string[];
  };
}

// 評価結果型定義（エラーハンドリング対応）
export interface CircuitEvaluationResult {
  gates: Gate[];
  wires: Wire[];
  errors: CircuitEvaluationError[];
  warnings: string[];
}

// 最適化版実装 (O(n) アルゴリズム) - 後方互換性維持
export function evaluateCircuit(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): { gates: Gate[]; wires: Wire[] } {
  const result = evaluateCircuitSafe(gates, wires, timeProvider);
  return { gates: result.gates, wires: result.wires };
}

// 新しいエラーハンドリング対応版
export function evaluateCircuitSafe(
  gates: Gate[],
  wires: Wire[],
  timeProvider: TimeProvider = realTimeProvider
): CircuitEvaluationResult {
  const errors: CircuitEvaluationError[] = [];
  const warnings: string[] = [];

  // 入力検証とコピー
  const updatedGates: Gate[] = [];
  const updatedWires: Wire[] = [];

  // ゲート検証とコピー
  gates.forEach((gate, index) => {
    try {
      if (!gate.id || typeof gate.id !== 'string') {
        errors.push({
          type: 'INVALID_GATE',
          message: `Gate at index ${index} has invalid ID`,
          details: { gateId: gate.id }
        });
        return;
      }

      if (!gate.type) {
        errors.push({
          type: 'INVALID_GATE',
          message: `Gate ${gate.id} has no type specified`,
          details: { gateId: gate.id }
        });
        return;
      }

      updatedGates.push({ ...gate });
    } catch (error) {
      errors.push({
        type: 'INVALID_GATE',
        message: `Failed to process gate at index ${index}: ${error}`,
        details: { gateId: gate?.id }
      });
    }
  });

  // ワイヤー検証とコピー
  wires.forEach((wire, index) => {
    try {
      if (!wire.id || typeof wire.id !== 'string') {
        errors.push({
          type: 'INVALID_WIRE',
          message: `Wire at index ${index} has invalid ID`,
          details: { wireId: wire.id }
        });
        return;
      }

      if (!wire.from?.gateId || !wire.to?.gateId) {
        errors.push({
          type: 'INVALID_WIRE',
          message: `Wire ${wire.id} has invalid connection points`,
          details: { wireId: wire.id }
        });
        return;
      }

      updatedWires.push({ ...wire });
    } catch (error) {
      errors.push({
        type: 'INVALID_WIRE',
        message: `Failed to process wire at index ${index}: ${error}`,
        details: { wireId: wire?.id }
      });
    }
  });

  // 致命的エラーがある場合は早期終了
  if (errors.length > 0) {
    return {
      gates: updatedGates,
      wires: updatedWires,
      errors,
      warnings
    };
  }

  // ✅ O(1) lookup maps + 重複ID検証
  const gateMap = new Map<string, Gate>();
  const wireMap = new Map<string, Wire>();
  
  // 重複ゲートIDチェック
  updatedGates.forEach(gate => {
    if (gateMap.has(gate.id)) {
      warnings.push(`Duplicate gate ID detected: ${gate.id}`);
    } else {
      gateMap.set(gate.id, gate);
    }
  });
  
  // 重複ワイヤーIDチェック
  updatedWires.forEach(wire => {
    if (wireMap.has(wire.id)) {
      warnings.push(`Duplicate wire ID detected: ${wire.id}`);
    } else {
      wireMap.set(wire.id, wire);
    }
  });

  // 欠損依存チェック - ワイヤーが参照するゲートが存在するか
  updatedWires.forEach(wire => {
    if (!gateMap.has(wire.from.gateId)) {
      errors.push({
        type: 'MISSING_DEPENDENCY',
        message: `Wire ${wire.id} references non-existent source gate: ${wire.from.gateId}`,
        details: { wireId: wire.id, gateId: wire.from.gateId }
      });
    }
    
    if (!gateMap.has(wire.to.gateId)) {
      errors.push({
        type: 'MISSING_DEPENDENCY',
        message: `Wire ${wire.id} references non-existent target gate: ${wire.to.gateId}`,
        details: { wireId: wire.id, gateId: wire.to.gateId }
      });
    }
  });

  // ❌ OLD: O(n*m) wire scanning → ✅ NEW: O(1) lookup per gate
  const gateInputs = new Map<string, boolean[]>();
  const gateOutputConnections = new Map<string, { wireId: string; toGateId: string; toPinIndex: number }[]>();
  const gateInputWires = new Map<string, { wire: Wire; fromGate: Gate }[]>();

  // 各ゲートの入力配列を初期化 - O(n)
  updatedGates.forEach(gate => {
    let inputCount = 2; // デフォルト
    if (gate.type === 'NOT' || gate.type === 'OUTPUT') {
      inputCount = 1;
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      inputCount = 2;
    } else if (gate.type === 'MUX') {
      inputCount = 3;
    } else if (gate.type === 'CLOCK' || gate.type === 'INPUT') {
      inputCount = 0;
    } else if (
      gate.type === 'CUSTOM' &&
      isCustomGate(gate) &&
      gate.customGateDefinition
    ) {
      inputCount = gate.customGateDefinition.inputs.length;
    }
    gateInputs.set(gate.id, new Array(inputCount).fill(false));
    gateOutputConnections.set(gate.id, []);
    gateInputWires.set(gate.id, []);
  });

  // ワイヤーの接続情報を効率的に解析 - O(m)
  updatedWires.forEach(wire => {
    const fromGate = gateMap.get(wire.from.gateId); // O(1)
    const toGate = gateMap.get(wire.to.gateId);     // O(1)

    if (fromGate && toGate) {
      // 出力側のゲートに接続情報を追加
      const connections = gateOutputConnections.get(fromGate.id) || [];
      connections.push({
        wireId: wire.id,
        toGateId: toGate.id,
        toPinIndex: wire.to.pinIndex,
      });
      gateOutputConnections.set(fromGate.id, connections);

      // 入力側のゲートにワイヤー情報を追加（新しい最適化）
      const inputWires = gateInputWires.get(toGate.id) || [];
      inputWires.push({ wire, fromGate });
      gateInputWires.set(toGate.id, inputWires);
    }
  });

  // 最適化されたトポロジカルソート + 循環依存検出 - O(n + m)
  const visited = new Set<string>();
  const visiting = new Set<string>(); // 循環依存検出用
  const evaluationOrder: string[] = [];
  const incomingEdges = new Map<string, string[]>();

  // 依存関係グラフを事前構築 - O(m)
  updatedWires.forEach(wire => {
    const toGateId = wire.to.gateId;
    const fromGateId = wire.from.gateId;
    
    if (!incomingEdges.has(toGateId)) {
      incomingEdges.set(toGateId, []);
    }
    incomingEdges.get(toGateId)!.push(fromGateId);
  });

  function visit(gateId: string, stack: string[] = []): boolean {
    if (visiting.has(gateId)) {
      // 循環依存検出
      const cycleStart = stack.indexOf(gateId);
      const cycle = cycleStart >= 0 ? stack.slice(cycleStart).concat(gateId) : [gateId];
      errors.push({
        type: 'CIRCULAR_DEPENDENCY',
        message: `Circular dependency detected in circuit`,
        details: { 
          gateId,
          stack: cycle
        }
      });
      return false;
    }

    if (visited.has(gateId)) return true;
    
    visiting.add(gateId);
    const newStack = [...stack, gateId];

    try {
      // このゲートに入力を提供するゲートを先に訪問 - O(1) lookup
      const dependencies = incomingEdges.get(gateId) || [];
      for (const depGateId of dependencies) {
        if (!visit(depGateId, newStack)) {
          return false; // 循環依存が発見された
        }
      }

      visiting.delete(gateId);
      visited.add(gateId);
      evaluationOrder.push(gateId);
      return true;
    } catch (error) {
      visiting.delete(gateId);
      errors.push({
        type: 'EVALUATION_ERROR',
        message: `Error during topological sort for gate ${gateId}: ${error}`,
        details: { gateId }
      });
      return false;
    }
  }

  // すべてのゲートを安全に訪問 - O(n)
  updatedGates.forEach(gate => {
    try {
      visit(gate.id);
    } catch (error) {
      errors.push({
        type: 'EVALUATION_ERROR',
        message: `Failed to process gate ${gate.id} during topological sort: ${error}`,
        details: { gateId: gate.id }
      });
    }
  });

  // 最適化されたゲート評価 + エラーハンドリング - O(n)
  evaluationOrder.forEach(gateId => {
    try {
      const gate = gateMap.get(gateId); // ✅ O(1) lookup
      if (!gate) {
        errors.push({
          type: 'EVALUATION_ERROR',
          message: `Gate ${gateId} not found during evaluation`,
          details: { gateId }
        });
        return;
      }

      // CLOCKゲートの場合、開始時刻を初期化
      if (gate.type === 'CLOCK' && gate.metadata && gate.metadata.startTime === undefined) {
        gate.metadata.startTime = timeProvider.getCurrentTime();
      }

      // ❌ OLD: O(n*m) wire scanning → ✅ NEW: O(1) lookup per gate
      const inputs = gateInputs.get(gateId) || [];
      const inputWires = gateInputWires.get(gateId) || [];
      
      try {
        inputWires.forEach(({ wire, fromGate }) => {
          // カスタムゲートの出力ピン検証
          if (fromGate.type === 'CUSTOM' && wire.from.pinIndex < 0) {
            // 出力ピンインデックスを計算（-1 → 0, -2 → 1, ...）
            const outputIndex = -wire.from.pinIndex - 1;
            
            if (fromGate.outputs) {
              // 複数出力の場合
              if (outputIndex >= 0 && outputIndex < fromGate.outputs.length) {
                inputs[wire.to.pinIndex] = fromGate.outputs[outputIndex] || false;
              } else {
                warnings.push(`Invalid output pin index ${wire.from.pinIndex} for custom gate ${fromGate.id}`);
                inputs[wire.to.pinIndex] = false;
              }
            } else {
              // 単一出力の場合 - 出力ピンインデックスは-1のみ有効
              if (wire.from.pinIndex === -1) {
                inputs[wire.to.pinIndex] = fromGate.output;
              } else {
                warnings.push(`Invalid output pin index ${wire.from.pinIndex} for custom gate ${fromGate.id}`);
                inputs[wire.to.pinIndex] = false;
              }
            }
          } else {
            // 通常のゲートまたは単一出力
            inputs[wire.to.pinIndex] = fromGate.output;
          }
        });
      } catch (inputError) {
        errors.push({
          type: 'EVALUATION_ERROR',
          message: `Error collecting inputs for gate ${gateId}: ${inputError}`,
          details: { gateId }
        });
        return;
      }

      // ゲートを安全に評価
      if (gate.type !== 'INPUT') {
        try {
          const result = evaluateGate(gate, inputs, timeProvider);

          // 結果が配列の場合（複数出力）
          if (Array.isArray(result)) {
            gate.outputs = result;
            // 後方互換性のため、最初の出力を gate.output にも設定
            gate.output = result[0] || false;
          } else {
            // 単一出力の場合
            gate.output = result;
            // outputs配列もクリア
            gate.outputs = undefined;
          }
        } catch (evalError) {
          errors.push({
            type: 'EVALUATION_ERROR',
            message: `Error evaluating gate ${gateId} (${gate.type}): ${evalError}`,
            details: { gateId }
          });
          // フォールバック: 安全なデフォルト値
          gate.output = false;
          gate.outputs = undefined;
        }
      }

      // すべてのゲートで入力状態を保存（表示用）
      if (gate.type !== 'INPUT') {
        try {
          gate.inputs = booleanArrayToDisplayStates(inputs);
        } catch (displayError) {
          warnings.push(`Error saving display state for gate ${gateId}: ${displayError}`);
          gate.inputs = [];
        }
      }
    } catch (outerError) {
      errors.push({
        type: 'EVALUATION_ERROR',
        message: `Unexpected error during gate evaluation ${gateId}: ${outerError}`,
        details: { gateId }
      });
    }

    // ✅ 最適化されたワイヤー状態更新 + エラーハンドリング - O(1) per wire
    try {
      const gate = gateMap.get(gateId);
      if (gate) {
        const connections = gateOutputConnections.get(gateId) || [];
        connections.forEach(conn => {
          try {
            const wire = wireMap.get(conn.wireId); // ✅ O(1) lookup
            if (wire) {
              // カスタムゲートの出力ピン検証
              if (gate.type === 'CUSTOM' && wire.from.pinIndex < 0) {
                // 出力ピンインデックスを計算（-1 → 0, -2 → 1, ...）
                const outputIndex = -wire.from.pinIndex - 1;
                
                if (gate.outputs) {
                  // 複数出力の場合
                  if (outputIndex >= 0 && outputIndex < gate.outputs.length) {
                    wire.isActive = gate.outputs[outputIndex] || false;
                  } else {
                    warnings.push(`Invalid output pin index ${wire.from.pinIndex} for wire ${wire.id}`);
                    wire.isActive = false;
                  }
                } else {
                  // 単一出力の場合 - 出力ピンインデックスは-1のみ有効
                  if (wire.from.pinIndex === -1) {
                    wire.isActive = gate.output;
                  } else {
                    warnings.push(`Invalid output pin index ${wire.from.pinIndex} for wire ${wire.id}`);
                    wire.isActive = false;
                  }
                }
              } else {
                // 通常のゲートまたは単一出力
                wire.isActive = gate.output;
              }
            }
          } catch (wireError) {
            warnings.push(`Error updating wire ${conn.wireId}: ${wireError}`);
          }
        });
      }
    } catch (connectionError) {
      warnings.push(`Error updating connections for gate ${gateId}: ${connectionError}`);
    }
  });

  // カスタムゲートの評価結果をログ出力（エラーハンドリング付き）
  try {
    const customGates = updatedGates.filter(g => g.type === 'CUSTOM');
    if (customGates.length > 0) {
      debug.log('🔄 回路評価完了 - カスタムゲート状態:', {
        customGatesCount: customGates.length,
        customGateStates: customGates.map(g => ({
          id: g.id,
          name: g.customGateDefinition?.name,
          inputs: g.inputs,
          output: g.output,
          inputsLength: g.inputs.length,
          definitionInputsLength: g.customGateDefinition?.inputs.length,
        })),
      });
    }
  } catch (debugError) {
    warnings.push(`Error during debug logging: ${debugError}`);
  }

  // 評価完了統計
  if (process.env.NODE_ENV === 'development') {
    debug.log('📊 回路評価統計:', {
      totalGates: updatedGates.length,
      totalWires: updatedWires.length,
      evaluationOrder: evaluationOrder.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      hasCircularDependency: errors.some(e => e.type === 'CIRCULAR_DEPENDENCY'),
      hasMissingDependency: errors.some(e => e.type === 'MISSING_DEPENDENCY')
    });
  }

  return { 
    gates: updatedGates, 
    wires: updatedWires,
    errors,
    warnings
  };
}
