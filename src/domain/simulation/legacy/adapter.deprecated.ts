/**
 * レガシーAPIアダプター - 新APIから既存API形式への変換
 * 
 * 目的:
 * - 既存APIの完全な後方互換性を維持
 * - 内部実装を新APIベースに移行
 * - 外部インターフェースは変更なし
 */

import type { Gate, Wire } from '../../../types/circuit';
import type { TimeProvider } from '../circuitSimulation';
import {
  evaluateGateUnified,
  evaluateCircuitPure,
  type EvaluationConfig,
  type Circuit,
  type CircuitEvaluationResult as NewCircuitEvaluationResult,
  defaultConfig,
  isSuccess
} from '../pure';

// 既存APIの型定義（後方互換性用）
interface LegacyCircuitEvaluationResult {
  gates: Gate[];
  wires: Wire[];
  errors: LegacyCircuitEvaluationError[];
  warnings: string[];
}

interface LegacyCircuitEvaluationError {
  type: 'INVALID_GATE' | 'INVALID_WIRE' | 'CIRCULAR_DEPENDENCY' | 'MISSING_DEPENDENCY' | 'EVALUATION_ERROR';
  message: string;
  details?: {
    gateId?: string;
    wireId?: string;
    stack?: string[];
  };
}

// ===============================
// ゲート評価アダプター
// ===============================

/**
 * 既存API用ゲート評価アダプター
 * 
 * @param gate 評価対象のゲート（副作用で変更される）
 * @param inputs 入力値配列
 * @param timeProvider 時間プロバイダー（オプション）
 * @returns 既存API形式の結果（boolean | boolean[]）
 */
export function evaluateGateLegacyAdapter(
  gate: Gate,
  inputs: boolean[],
  timeProvider?: TimeProvider
): boolean | boolean[] {
  try {
    // 新API設定を作成
    const config: EvaluationConfig = {
      timeProvider: timeProvider || defaultConfig.timeProvider,
      enableDebug: false,
      strictValidation: false, // 既存APIとの互換性のため緩い検証
      maxRecursionDepth: 100
    };

    // ゲートのコピーを作成（新APIは不変なので）
    const gateForEvaluation = { 
      ...gate,
      // メタデータも深いコピーを作成
      metadata: gate.metadata ? { ...gate.metadata } : undefined
    };

    // 新APIで評価
    const result = evaluateGateUnified(
      gateForEvaluation as Readonly<Gate>, 
      inputs as readonly boolean[], 
      config
    );
    
    if (isSuccess(result)) {
      // 🔥 既存APIの副作用を再現：元のゲートオブジェクトのメタデータを更新
      // 新APIは純粋関数なので、手動でメタデータ更新ロジックを再実装
      
      if (gate.type === 'CLOCK' && gate.metadata) {
        // CLOCKゲートのstartTime初期化（既存API互換）
        if (gate.metadata.startTime === undefined) {
          gate.metadata.startTime = (timeProvider || defaultConfig.timeProvider).getCurrentTime();
        }
      } else if (gate.type === 'D-FF' && gate.metadata && inputs.length >= 2) {
        // D-FFのメタデータ更新ロジック（既存API互換）
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
      } else if (gate.type === 'SR-LATCH' && gate.metadata && inputs.length >= 2) {
        // SR-LATCHのメタデータ更新ロジック（既存API互換）
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
        // S=1, R=1 => 不定状態（既存APIでは前の状態を維持）
      }

      // 既存APIの戻り値形式に変換
      if (result.data.isSingleOutput) {
        return result.data.primaryOutput;
      } else {
        return [...result.data.outputs]; // readonlyを通常の配列に変換
      }
    } else {
      // 既存APIの動作に合わせた処理
      // Unknown gate type の場合は既存APIではfalseを返す（エラーを投げない）
      if (result.error.message.includes('Unknown gate type') || 
          result.error.message.includes('Invalid gate type')) {
        return false; // 既存API互換：未知ゲートタイプはfalseを返す
      }
      
      // その他のエラーの場合はエラーを投げる
      throw new Error(`Gate evaluation failed: ${result.error.message}`);
    }
  } catch (error) {
    // 既存APIの動作に合わせてエラーを投げる
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unexpected error during gate evaluation: ${error}`);
    }
  }
}

// ===============================
// 回路評価アダプター
// ===============================

/**
 * 既存API用回路評価アダプター（副作用版）
 * 
 * @param gates ゲート配列（変更される）
 * @param wires ワイヤー配列（変更される）
 * @param timeProvider 時間プロバイダー（オプション）
 * @returns 既存API形式の結果
 */
export function evaluateCircuitLegacyAdapter(
  gates: Gate[],
  wires: Wire[],
  timeProvider?: TimeProvider
): { gates: Gate[]; wires: Wire[] } {
  try {
    // 既存APIとの互換性のため、循環依存などの厳密チェックは無効化
    const circuit: Circuit = { 
      gates: gates as readonly Gate[], 
      wires: wires as readonly Wire[] 
    };
    
    const config: EvaluationConfig = { 
      timeProvider: timeProvider || defaultConfig.timeProvider, 
      enableDebug: false, 
      strictValidation: false, // 既存APIとの互換性のため緩い検証
      maxRecursionDepth: 100 
    };
    
    const result = evaluateCircuitPure(circuit, config);
    
    if (isSuccess(result)) {
      // 新APIの結果から更新されたゲートとワイヤーを取得
      const updatedGates = [...result.data.circuit.gates];
      const updatedWires = [...result.data.circuit.wires];
      
      // 既存APIの副作用動作を再現：
      // 1. CLOCKゲートのstartTime初期化
      // 2. 特殊ゲートのメタデータ更新
      updatedGates.forEach((gate, index) => {
        const originalGate = gates[index];
        if (originalGate) {
          // CLOCKゲートのstartTime初期化（既存動作の再現）
          if (gate.type === 'CLOCK' && gate.metadata && !gate.metadata.startTime) {
            gate.metadata.startTime = (timeProvider || defaultConfig.timeProvider).getCurrentTime();
          }
          
          // 特殊ゲートのメタデータを元のオブジェクトに反映（副作用の再現）
          if (gate.metadata && originalGate.metadata) {
            Object.assign(originalGate.metadata, gate.metadata);
          }
        }
      });
      
      // 既存APIの副作用動作を再現：元の配列を更新
      gates.splice(0, gates.length, ...updatedGates);
      wires.splice(0, wires.length, ...updatedWires);
      
      return { gates: updatedGates, wires: updatedWires };
    } else {
      // 既存APIの動作：エラーでも元の結果を返し、ログ出力のみ
      if (result.error.type === 'DEPENDENCY_ERROR' && result.error.circularDependencies?.length > 0) {
        // 循環依存は既存APIでは警告程度（クラッシュしない）
        console.warn('Circuit evaluation warning:', result.error.message);
      } else {
        console.error('Circuit evaluation failed:', result.error.message);
      }
      return { gates: [...gates], wires: [...wires] };
    }
  } catch (error) {
    // 既存APIの動作に合わせてエラーログを出力し、元の値を返す
    console.error('Unexpected error during circuit evaluation:', error);
    return { gates: [...gates], wires: [...wires] };
  }
}

/**
 * 既存API用回路評価アダプター（Safe版）
 * 既存APIと完全に同じバリデーション・エラー検出ロジックを実装
 * 
 * @param gates ゲート配列
 * @param wires ワイヤー配列  
 * @param timeProvider 時間プロバイダー（オプション）
 * @returns 既存API形式のSafe結果
 */
export function evaluateCircuitSafeLegacyAdapter(
  gates: Gate[],
  wires: Wire[],
  timeProvider?: TimeProvider
): LegacyCircuitEvaluationResult {
  const errors: LegacyCircuitEvaluationError[] = [];
  const warnings: string[] = [];

  // 🔥 既存APIと同じ詳細なバリデーションを実装
  
  // 入力検証とコピー
  const updatedGates: Gate[] = [];
  const updatedWires: Wire[] = [];

  // ゲート検証とコピー（既存API互換）
  gates.forEach((gate, index) => {
    try {
      if (!gate.id || typeof gate.id !== 'string') {
        errors.push({
          type: 'INVALID_GATE',
          message: `Gate at index ${index} has invalid ID`,
          details: { gateId: gate?.id }
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

  // ワイヤー検証とコピー（既存API互換）
  wires.forEach((wire, index) => {
    try {
      if (!wire.id || typeof wire.id !== 'string') {
        errors.push({
          type: 'INVALID_WIRE',
          message: `Wire at index ${index} has invalid ID`,
          details: { wireId: wire?.id }
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

  // 致命的エラー（INVALID_GATE、INVALID_WIRE）がある場合は早期終了
  // MISSING_DEPENDENCYやCIRCULAR_DEPENDENCYの場合は評価を続行
  const fatalErrors = errors.filter(e => e.type === 'INVALID_GATE' || e.type === 'INVALID_WIRE');
  if (fatalErrors.length > 0) {
    return {
      gates: updatedGates,
      wires: updatedWires,
      errors,
      warnings
    };
  }

  // 重複ID検出（既存API互換）
  const gateMap = new Map<string, Gate>();
  const wireMap = new Map<string, Wire>();
  
  updatedGates.forEach(gate => {
    if (gateMap.has(gate.id)) {
      warnings.push(`Duplicate gate ID detected: ${gate.id}`);
    } else {
      gateMap.set(gate.id, gate);
    }
  });
  
  updatedWires.forEach(wire => {
    if (wireMap.has(wire.id)) {
      warnings.push(`Duplicate wire ID detected: ${wire.id}`);
    } else {
      wireMap.set(wire.id, wire);
    }
  });

  // 欠損依存チェック（既存API互換）
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

  // 循環依存検出（既存API互換）
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const incomingEdges = new Map<string, string[]>();

  // 依存関係グラフを構築
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

    const dependencies = incomingEdges.get(gateId) || [];
    for (const depGateId of dependencies) {
      if (!visit(depGateId, newStack)) {
        return false;
      }
    }

    visiting.delete(gateId);
    visited.add(gateId);
    return true;
  }

  // 循環依存チェック実行
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

  // 基本的な回路評価を実行（エラーがあっても試行）
  // 既存APIでは欠損依存があっても評価を試行し、追加のEVALUATION_ERRORを生成
  try {
    const basicResult = evaluateCircuitLegacyAdapter(updatedGates, updatedWires, timeProvider);
    
    // 既存APIでは missing source gates の場合のみ EVALUATION_ERROR も生成される
    // missing target gates では EVALUATION_ERROR は生成されない
    const hasMissingSourceGate = errors.some(e => 
      e.type === 'MISSING_DEPENDENCY' && e.message.includes('non-existent source gate')
    );
    if (hasMissingSourceGate) {
      errors.push({
        type: 'EVALUATION_ERROR',
        message: `Circuit evaluation encountered missing source gates`,
        details: {}
      });
    }
    
    // 警告の収集（無効なピンインデックスなど）
    // ワイヤー状態更新時の警告をチェック
    updatedWires.forEach(wire => {
      const fromGate = gateMap.get(wire.from.gateId);
      if (fromGate?.type === 'CUSTOM' && wire.from.pinIndex < 0) {
        const outputIndex = -wire.from.pinIndex - 1;
        if (fromGate.outputs) {
          if (outputIndex >= fromGate.outputs.length) {
            warnings.push(`Invalid output pin index ${wire.from.pinIndex} for custom gate ${fromGate.id}`);
          }
        } else if (wire.from.pinIndex !== -1) {
          warnings.push(`Invalid output pin index ${wire.from.pinIndex} for custom gate ${fromGate.id}`);
        }
      }
    });
    
    return {
      gates: basicResult.gates,
      wires: basicResult.wires,
      errors,
      warnings
    };
  } catch (evalError) {
    // 評価エラーが発生した場合は追加のEVALUATION_ERRORを生成
    errors.push({
      type: 'EVALUATION_ERROR',
      message: `Circuit evaluation failed: ${evalError}`,
      details: {}
    });
    
    return {
      gates: updatedGates,
      wires: updatedWires,
      errors,
      warnings
    };
  }
}

// ===============================
// エラー変換ユーティリティ
// ===============================

/**
 * 新APIのエラーを既存API形式に変換
 */
function convertToLegacyError(error: any): LegacyCircuitEvaluationError {
  // 新APIのエラー型に基づいて変換
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return {
        type: 'INVALID_GATE',
        message: error.message,
        details: error.context
      };
    
    case 'DEPENDENCY_ERROR':
      if (error.circularDependencies?.length > 0) {
        return {
          type: 'CIRCULAR_DEPENDENCY',
          message: error.message,
          details: {
            stack: error.circularDependencies[0] || []
          }
        };
      } else {
        return {
          type: 'MISSING_DEPENDENCY',
          message: error.message,
          details: error.context
        };
      }
    
    case 'EVALUATION_ERROR':
    default:
      return {
        type: 'EVALUATION_ERROR',
        message: error.message,
        details: error.context
      };
  }
}

// ===============================
// 型変換ユーティリティ
// ===============================

/**
 * 新APIの設定を既存API互換に調整
 */
export function createLegacyCompatibleConfig(
  timeProvider?: TimeProvider,
  enableStrictValidation: boolean = false
): EvaluationConfig {
  return {
    timeProvider: timeProvider || defaultConfig.timeProvider,
    enableDebug: false, // 既存APIはデバッグ機能なし
    strictValidation: enableStrictValidation,
    maxRecursionDepth: 100
  };
}

/**
 * 既存APIの時間プロバイダーを新API形式に変換
 */
export function adaptTimeProvider(timeProvider?: TimeProvider): TimeProvider {
  if (timeProvider) {
    return timeProvider;
  }
  
  // デフォルト時間プロバイダー
  return {
    getCurrentTime: () => Date.now()
  };
}

// ===============================
// パフォーマンス監視
// ===============================

/**
 * 新旧API実行時間比較用ヘルパー
 */
export function measureAdapterPerformance<T>(
  operation: () => T,
  operationName: string = 'adapter_operation'
): { result: T; timeMs: number } {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  const timeMs = end - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Adapter] ${operationName}: ${timeMs.toFixed(2)}ms`);
  }
  
  return { result, timeMs };
}

/**
 * メモリ使用量監視（開発時のみ）
 */
export function logMemoryUsage(context: string = 'adapter'): void {
  if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    console.debug(`[${context}] Memory - Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB, Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  }
}