/**
 * Core API 回路評価機能
 *
 * 特徴:
 * - 完全にimmutable（元の回路を変更せず新しい回路を返す）
 * - エラーハンドリングと依存関係解決
 * - 詳細な統計情報とデバッグトレース
 * - 最適化されたアルゴリズム（O(n)）
 * - 循環依存検出
 */

import type { Gate, Wire } from '../../../types/circuit';
import {
  type Result,
  type Circuit,
  type CircuitEvaluationResult,
  type EvaluationConfig,
  type EvaluationStats,
  type DependencyGraph,
  type DependencyNode,
  type DependencyEdge,
  type DebugTraceEntry,
  type EvaluationError,
  type DependencyError,
  type ValidationError,
  defaultConfig,
  success,
  failure,
  createEvaluationError,
  createDependencyError,
  createValidationError,
} from './types';
import { validateCircuit, validateCircuitLight } from './validation';
import { evaluateGateUnified } from './gateEvaluation';

// ===============================
// メイン回路評価関数
// ===============================

/**
 * 純粋関数による回路評価 - 新APIのメイン関数
 *
 * @param circuit 評価対象の回路（Readonly）
 * @param config 評価設定（Readonly）
 * @returns 完全に新しい回路オブジェクトとメタデータ
 */
export function evaluateCircuit(
  circuit: Readonly<Circuit>,
  config: Readonly<EvaluationConfig> = defaultConfig
): Result<
  CircuitEvaluationResult,
  ValidationError | DependencyError | EvaluationError
> {
  const startTime = Date.now();
  const debugTrace: DebugTraceEntry[] = [];

  try {
    // 1. 入力検証
    if (config.strictValidation) {
      const validation = validateCircuit(circuit);
      if (!validation.success) {
        return failure(
          createValidationError(
            `Circuit validation failed: ${validation.error.message}`,
            [],
            validation.error.context
          )
        );
      }
      if (!validation.data.isValid) {
        const errors = validation.data.violations.filter(
          v => v.severity === 'ERROR'
        );
        return failure(
          createValidationError(
            `Circuit contains validation errors: ${errors.map(e => e.message).join(', ')}`,
            errors
          )
        );
      }
    } else {
      // 軽量バリデーション
      const lightValidation = validateCircuitLight(circuit);
      if (!lightValidation.success) {
        return failure(
          createValidationError(
            `Basic circuit validation failed: ${lightValidation.error.message}`,
            [],
            lightValidation.error.context
          )
        );
      }
    }

    if (config.enableDebug) {
      debugTrace.push({
        timestamp: Date.now(),
        gateId: 'CIRCUIT',
        action: 'START_EVALUATION',
        data: {
          gateCount: circuit.gates.length,
          wireCount: circuit.wires.length,
        },
      });
    }

    // 2. 依存関係グラフ構築
    const dependencyStart = Date.now();
    const dependencyResult = buildDependencyGraph(circuit);
    if (!dependencyResult.success) {
      return dependencyResult;
    }
    const dependencyGraph = dependencyResult.data;
    const dependencyEnd = Date.now();

    // 3. 循環依存チェック
    if (dependencyGraph.hasCycles) {
      return failure(
        createValidationError(
          'Circuit contains circular dependencies',
          dependencyGraph.cycles.map(cycle => ({
            severity: 'ERROR' as const,
            code: 'CIRCULAR_DEPENDENCY',
            message: `Circular dependency detected: ${cycle.join(' -> ')}`,
            location: {},
          }))
        )
      );
    }

    // 4. 回路評価実行
    const evaluationResult = evaluateCircuitStep(
      circuit,
      dependencyGraph,
      config,
      debugTrace
    );
    if (!evaluationResult.success) {
      return evaluationResult;
    }

    const { updatedCircuit, gateEvaluationTimes } = evaluationResult.data;
    const endTime = Date.now();

    // 5. 統計情報作成
    const stats: EvaluationStats = {
      totalGates: circuit.gates.length,
      evaluatedGates: dependencyGraph.evaluationOrder.length,
      skippedGates:
        circuit.gates.length - dependencyGraph.evaluationOrder.length,
      evaluationTimeMs: endTime - startTime,
      dependencyResolutionTimeMs: dependencyEnd - dependencyStart,
      gateEvaluationTimes,
      memoryUsage: getMemoryUsage(),
    };

    if (config.enableDebug) {
      debugTrace.push({
        timestamp: Date.now(),
        gateId: 'CIRCUIT',
        action: 'END_EVALUATION',
        data: { stats },
      });
    }

    // 6. 結果作成
    const result: CircuitEvaluationResult = {
      circuit: updatedCircuit,
      evaluationStats: stats,
      dependencyGraph,
      debugTrace: config.enableDebug ? debugTrace : undefined,
    };

    return success(result);
  } catch (error) {
    return failure(
      createEvaluationError(
        `Unexpected error during circuit evaluation: ${error}`,
        'CIRCUIT_TRAVERSAL',
        undefined,
        error
      )
    );
  }
}

// ===============================
// 依存関係グラフ構築
// ===============================

/**
 * 依存関係グラフを構築
 */
function buildDependencyGraph(
  circuit: Readonly<Circuit>
): Result<DependencyGraph, ValidationError | DependencyError> {
  try {
    // ゲートIDマップの作成
    const gateMap = new Map<string, Gate>();
    const gateIds = new Set<string>();

    for (const gate of circuit.gates) {
      if (gateIds.has(gate.id)) {
        return failure(
          createValidationError(
            `Duplicate gate ID: ${gate.id}`,
            [
              {
                severity: 'ERROR',
                code: 'DUPLICATE_GATE_ID',
                message: `Duplicate gate ID: ${gate.id}`,
                location: { gateId: gate.id },
                suggestion: 'Ensure all gate IDs are unique',
              },
            ],
            { gateId: gate.id }
          )
        );
      }
      gateIds.add(gate.id);
      gateMap.set(gate.id, gate);
    }

    // 依存関係の構築
    const dependencies = new Map<string, string[]>(); // gateId -> dependencies
    const dependents = new Map<string, string[]>(); // gateId -> dependents
    const edges: DependencyEdge[] = [];

    // 初期化
    for (const gate of circuit.gates) {
      dependencies.set(gate.id, []);
      dependents.set(gate.id, []);
    }

    // ワイヤーIDの重複チェック
    const wireIds = new Set<string>();
    for (const wire of circuit.wires) {
      if (wireIds.has(wire.id)) {
        return failure(
          createValidationError(
            `Duplicate wire ID: ${wire.id}`,
            [
              {
                severity: 'ERROR',
                code: 'DUPLICATE_WIRE_ID',
                message: `Duplicate wire ID: ${wire.id}`,
                location: { wireId: wire.id },
                suggestion: 'Ensure all wire IDs are unique',
              },
            ],
            { wireId: wire.id }
          )
        );
      }
      wireIds.add(wire.id);
    }

    // ワイヤーから依存関係を構築
    for (const wire of circuit.wires) {
      const fromGateId = wire.from.gateId;
      const toGateId = wire.to.gateId;

      // 存在チェック
      if (!gateMap.has(fromGateId)) {
        return failure(
          createValidationError(
            `Wire ${wire.id} references non-existent source gate: ${fromGateId}`,
            [
              {
                severity: 'ERROR',
                code: 'MISSING_SOURCE_GATE',
                message: `Wire ${wire.id} references non-existent source gate: ${fromGateId}`,
                location: { wireId: wire.id, gateId: fromGateId },
              },
            ],
            { wireId: wire.id, gateId: fromGateId }
          )
        );
      }

      if (!gateMap.has(toGateId)) {
        return failure(
          createValidationError(
            `Wire ${wire.id} references non-existent target gate: ${toGateId}`,
            [
              {
                severity: 'ERROR',
                code: 'MISSING_TARGET_GATE',
                message: `Wire ${wire.id} references non-existent target gate: ${toGateId}`,
                location: { wireId: wire.id, gateId: toGateId },
              },
            ],
            { wireId: wire.id, gateId: toGateId }
          )
        );
      }

      // 依存関係追加
      const deps = dependencies.get(toGateId) || [];
      if (!deps.includes(fromGateId)) {
        deps.push(fromGateId);
        dependencies.set(toGateId, deps);
      }

      const dents = dependents.get(fromGateId) || [];
      if (!dents.includes(toGateId)) {
        dents.push(toGateId);
        dependents.set(fromGateId, dents);
      }

      // エッジ追加
      edges.push({
        from: fromGateId,
        to: toGateId,
        wireId: wire.id,
        pinIndex: wire.to.pinIndex,
      });
    }

    // トポロジカルソートと循環依存検出
    const sortResult = topologicalSort(dependencies, dependents);
    if (!sortResult.success) {
      return sortResult;
    }

    const { evaluationOrder, cycles } = sortResult.data;

    // ノード作成
    const nodes = new Map<string, DependencyNode>();
    let maxDepth = 0;

    for (const gateId of circuit.gates.map(g => g.id)) {
      const gateDeps = dependencies.get(gateId) || [];
      const gateDents = dependents.get(gateId) || [];

      // 深度計算
      const depth = calculateNodeDepth(gateId, dependencies, new Set());
      maxDepth = Math.max(maxDepth, depth);

      nodes.set(gateId, {
        gateId,
        dependencies: gateDeps,
        dependents: gateDents,
        depth,
      });
    }

    const dependencyGraph: DependencyGraph = {
      nodes,
      edges,
      evaluationOrder,
      hasCycles: cycles.length > 0,
      cycles,
    };

    return success(dependencyGraph);
  } catch (error) {
    return failure(
      createDependencyError(
        `Error building dependency graph: ${error}`,
        [],
        [],
        undefined
      )
    );
  }
}

/**
 * トポロジカルソート実行
 */
function topologicalSort(
  dependencies: Map<string, string[]>,
  _dependents: Map<string, string[]>
): Result<{ evaluationOrder: string[]; cycles: string[][] }, DependencyError> {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const evaluationOrder: string[] = [];
  const cycles: string[][] = [];

  function visit(gateId: string, path: string[]): boolean {
    if (visiting.has(gateId)) {
      // 循環依存を発見
      const cycleStart = path.indexOf(gateId);
      if (cycleStart >= 0) {
        const cycle = [...path.slice(cycleStart), gateId];
        cycles.push(cycle);
      }
      return false;
    }

    if (visited.has(gateId)) {
      return true;
    }

    visiting.add(gateId);
    const newPath = [...path, gateId];

    // 依存関係を先に訪問
    const deps = dependencies.get(gateId) || [];
    for (const depId of deps) {
      if (!visit(depId, newPath)) {
        return false;
      }
    }

    visiting.delete(gateId);
    visited.add(gateId);
    evaluationOrder.push(gateId);

    return true;
  }

  // 全ゲートを訪問
  for (const gateId of dependencies.keys()) {
    if (!visited.has(gateId)) {
      visit(gateId, []);
    }
  }

  if (cycles.length > 0) {
    return failure(
      createDependencyError('Circular dependencies detected', [], cycles)
    );
  }

  return success({ evaluationOrder, cycles });
}

/**
 * ノードの深度を計算
 */
function calculateNodeDepth(
  gateId: string,
  dependencies: Map<string, string[]>,
  visited: Set<string>
): number {
  if (visited.has(gateId)) {
    return 0; // 循環を避ける
  }

  visited.add(gateId);
  const deps = dependencies.get(gateId) || [];

  if (deps.length === 0) {
    visited.delete(gateId);
    return 0;
  }

  let maxDepth = 0;
  for (const depId of deps) {
    const depDepth = calculateNodeDepth(depId, dependencies, visited);
    maxDepth = Math.max(maxDepth, depDepth + 1);
  }

  visited.delete(gateId);
  return maxDepth;
}

// ===============================
// 回路評価実行
// ===============================

/**
 * 依存関係順序に従って回路を評価
 */
function evaluateCircuitStep(
  circuit: Readonly<Circuit>,
  dependencyGraph: Readonly<DependencyGraph>,
  config: Readonly<EvaluationConfig>,
  debugTrace: DebugTraceEntry[]
): Result<
  { updatedCircuit: Circuit; gateEvaluationTimes: ReadonlyMap<string, number> },
  EvaluationError
> {
  try {
    // 更新されたゲートとワイヤーのコピーを作成
    const updatedGates = circuit.gates.map(gate => ({ ...gate }));
    const updatedWires = circuit.wires.map(wire => ({ ...wire }));

    // CLOCKゲートのstartTime初期化
    updatedGates.forEach(gate => {
      if (
        gate.type === 'CLOCK' &&
        gate.metadata?.isRunning &&
        gate.metadata.startTime === undefined
      ) {
        gate.metadata = {
          ...gate.metadata,
          startTime: config.timeProvider.getCurrentTime(),
        };
      }
    });

    // 効率的なルックアップマップ
    const gateMap = new Map<string, Gate>();
    const wireMap = new Map<string, Wire>();
    const gateInputWires = new Map<string, { wire: Wire; fromGate: Gate }[]>();

    // マップ初期化
    updatedGates.forEach(gate => {
      gateMap.set(gate.id, gate);
      gateInputWires.set(gate.id, []);
    });

    updatedWires.forEach(wire => {
      wireMap.set(wire.id, wire);
    });

    // ワイヤー接続情報の事前構築
    updatedWires.forEach(wire => {
      const fromGate = gateMap.get(wire.from.gateId);
      const toGate = gateMap.get(wire.to.gateId);

      if (fromGate && toGate) {
        const inputWires = gateInputWires.get(toGate.id) || [];
        inputWires.push({ wire, fromGate });
        gateInputWires.set(toGate.id, inputWires);
      }
    });

    const gateEvaluationTimes = new Map<string, number>();

    // 評価順序に従ってゲートを評価
    for (const gateId of dependencyGraph.evaluationOrder) {
      const gate = gateMap.get(gateId);
      if (!gate) {
        return failure(
          createEvaluationError(
            `Gate ${gateId} not found during evaluation`,
            'CIRCUIT_TRAVERSAL',
            { gateId }
          )
        );
      }

      if (config.enableDebug) {
        debugTrace.push({
          timestamp: Date.now(),
          gateId: gate.id,
          action: 'START_EVALUATION',
          data: { gateType: gate.type },
        });
      }

      const gateStartTime = Date.now();

      // 入力値の収集
      const inputs = collectGateInputs(gate, gateInputWires, gateMap);

      // ゲート評価実行
      if (gate.type !== 'INPUT') {
        const evaluationResult = evaluateGateUnified(gate, inputs, config);

        if (!evaluationResult.success) {
          return failure(
            createEvaluationError(
              `Failed to evaluate gate ${gateId}: ${evaluationResult.error.message}`,
              'GATE_LOGIC',
              { gateId }
            )
          );
        }

        const result = evaluationResult.data;

        // 結果をゲートに適用（副作用的だが、新しいオブジェクトなので安全）
        if (result.isSingleOutput) {
          gate.output = result.primaryOutput;
          gate.outputs = undefined;
        } else {
          gate.outputs = [...result.outputs];
          gate.output = result.primaryOutput;
        }

        // 入力状態の保存（表示用）
        gate.inputs = inputs.map(input => (input ? '1' : ''));

        // 特殊ゲートのメタデータ更新
        updateGateMetadata(gate, inputs);
        
        // 🔥 根本修正: D-FFとSR-LATCHの真の出力をgate.outputに反映
        if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
          gate.output = gate.metadata?.qOutput ?? false;
        }
      }

      const gateEndTime = Date.now();
      gateEvaluationTimes.set(gateId, gateEndTime - gateStartTime);

      // ワイヤー状態の更新
      updateWireStates(gate, gateInputWires, wireMap);

      if (config.enableDebug) {
        debugTrace.push({
          timestamp: Date.now(),
          gateId: gate.id,
          action: 'END_EVALUATION',
          data: {
            output: gate.output,
            outputs: gate.outputs,
            evaluationTimeMs: gateEndTime - gateStartTime,
          },
        });
      }
    }

    const updatedCircuit: Circuit = {
      gates: updatedGates,
      wires: updatedWires,
      metadata: circuit.metadata,
    };

    return success({ updatedCircuit, gateEvaluationTimes });
  } catch (error) {
    return failure(
      createEvaluationError(
        `Error during circuit step evaluation: ${error}`,
        'CIRCUIT_TRAVERSAL',
        undefined,
        error
      )
    );
  }
}

/**
 * ゲートの入力値を収集
 */
function collectGateInputs(
  gate: Gate,
  gateInputWires: Map<string, { wire: Wire; fromGate: Gate }[]>,
  _gateMap: Map<string, Gate>
): boolean[] {
  // 期待する入力数を計算
  let inputCount = 0;
  switch (gate.type) {
    case 'INPUT':
    case 'CLOCK':
      inputCount = 0;
      break;
    case 'OUTPUT':
    case 'NOT':
      inputCount = 1;
      break;
    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
    case 'D-FF':
    case 'SR-LATCH':
      inputCount = 2;
      break;
    case 'MUX':
      inputCount = 3;
      break;
    case 'BINARY_COUNTER':
    case 'DELAY':
      inputCount = 1;
      break;
    case 'CUSTOM':
      if ('customGateDefinition' in gate && gate.customGateDefinition) {
        inputCount = gate.customGateDefinition.inputs.length;
      }
      break;
  }

  const inputs = new Array(inputCount).fill(false);
  const inputWires = gateInputWires.get(gate.id) || [];

  // ワイヤーからの入力値を設定
  inputWires.forEach(({ wire, fromGate }) => {
    if (wire.to.pinIndex < inputs.length) {
      // カスタムゲートの複数出力チェック
      if (
        fromGate.type === 'CUSTOM' &&
        fromGate.outputs &&
        wire.from.pinIndex < 0
      ) {
        const outputIndex = -wire.from.pinIndex - 1;
        if (outputIndex >= 0 && outputIndex < fromGate.outputs.length) {
          inputs[wire.to.pinIndex] = fromGate.outputs[outputIndex];
        }
      } else {
        inputs[wire.to.pinIndex] = fromGate.output;
      }
    }
  });

  return inputs;
}

/**
 * 特殊ゲートのメタデータを更新
 */
function updateGateMetadata(gate: Gate, inputs: boolean[]): void {
  switch (gate.type) {
    case 'D-FF':
      // D-フリップフロップのメタデータ更新
      if (inputs.length >= 2) {
        const d = inputs[0];
        const clk = inputs[1];
        const prevClk = gate.metadata?.previousClockState || false;

        // 立ち上がりエッジ検出
        if (!prevClk && clk) {
          gate.metadata = {
            ...gate.metadata,
            qOutput: d,
            qBarOutput: !d,
            previousClockState: clk,
          };
        } else {
          gate.metadata = {
            ...gate.metadata,
            previousClockState: clk,
          };
        }
      }
      break;

    case 'SR-LATCH':
      // SR-ラッチのメタデータ更新
      if (inputs.length >= 2) {
        const s = inputs[0];
        const r = inputs[1];
        let qOutput = gate.metadata?.qOutput || false;

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

        gate.metadata = {
          ...gate.metadata,
          qOutput,
          qBarOutput: !qOutput,
        };
      }
      break;

    case 'CLOCK':
      // CLOCKゲートのstartTimeが未設定の場合は初期化
      if (gate.metadata && gate.metadata.startTime === undefined) {
        gate.metadata = {
          ...gate.metadata,
          startTime: Date.now(),
        };
      }
      break;

    case 'BINARY_COUNTER':
      // バイナリカウンタのメタデータ更新
      if (inputs.length >= 1) {
        const clk = inputs[0];
        const prevClk = gate.metadata?.previousClockState || false;
        const bitCount = (gate.metadata?.bitCount as number) || 2;
        let currentValue = (gate.metadata?.currentValue as number) || 0;

        // 立ち上がりエッジ検出
        if (!prevClk && clk) {
          currentValue = (currentValue + 1) % (1 << bitCount);
        }

        gate.metadata = {
          ...gate.metadata,
          currentValue,
          previousClockState: clk,
        };
      }
      break;

    case 'DELAY':
      // DELAYゲートの履歴更新
      if (inputs.length >= 1) {
        const history = (gate.metadata?.history || []) as boolean[];
        const newHistory = [...history, inputs[0]];
        if (newHistory.length > 3) {
          newHistory.shift(); // 最古の値を削除
        }

        gate.metadata = {
          ...gate.metadata,
          history: newHistory,
        };
      }
      break;
  }
}

/**
 * ワイヤー状態を更新
 */
function updateWireStates(
  gate: Gate,
  gateInputWires: Map<string, { wire: Wire; fromGate: Gate }[]>,
  wireMap: Map<string, Wire>
): void {
  // このゲートから出ているワイヤーを探して状態を更新
  wireMap.forEach(wire => {
    if (wire.from.gateId === gate.id) {
      // カスタムゲートの複数出力チェック
      if (gate.type === 'CUSTOM' && gate.outputs && wire.from.pinIndex < 0) {
        const outputIndex = -wire.from.pinIndex - 1;
        if (outputIndex >= 0 && outputIndex < gate.outputs.length) {
          wire.isActive = gate.outputs[outputIndex];
        } else {
          wire.isActive = false;
        }
      } else {
        wire.isActive = gate.output;
      }
    }
  });
}

// ===============================
// ユーティリティ関数
// ===============================

/**
 * メモリ使用量を取得（Node.js環境のみ）
 */
function getMemoryUsage(): { heapUsed: number; heapTotal: number } | undefined {
  if (
    typeof globalThis.process !== 'undefined' &&
    globalThis.process.memoryUsage
  ) {
    const usage = globalThis.process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
    };
  }
  return undefined;
}

// ===============================
// 差分更新機能（将来拡張用）
// ===============================

/**
 * 差分更新による高速評価（将来実装）
 */
export function evaluateCircuitIncremental(
  circuit: Readonly<Circuit>,
  changedGateIds: readonly string[],
  previousResult: Readonly<CircuitEvaluationResult>,
  _config: Readonly<EvaluationConfig> = defaultConfig
): Result<CircuitEvaluationResult, EvaluationError> {
  // TODO: 将来実装
  // 変更されたゲートとその依存関係のみを再評価

  return failure(
    createEvaluationError(
      'Incremental evaluation not yet implemented',
      'CIRCUIT_TRAVERSAL'
    )
  );
}

/**
 * 並列評価（将来実装）
 */
export function evaluateCircuitParallel(
  circuit: Readonly<Circuit>,
  _config: Readonly<EvaluationConfig> = defaultConfig
): Result<CircuitEvaluationResult, EvaluationError> {
  // TODO: 将来実装
  // 依存関係のないゲートを並列評価

  return failure(
    createEvaluationError(
      'Parallel evaluation not yet implemented',
      'CIRCUIT_TRAVERSAL'
    )
  );
}

// ===============================
// デバッグユーティリティ
// ===============================

/**
 * 依存関係グラフの可視化（デバッグ用）
 */
export function visualizeDependencyGraph(
  graph: Readonly<DependencyGraph>
): string {
  const lines: string[] = ['Dependency Graph:'];
  lines.push(`Nodes: ${graph.nodes.size}`);
  lines.push(`Edges: ${graph.edges.length}`);
  lines.push(`Has Cycles: ${graph.hasCycles}`);

  if (graph.hasCycles) {
    lines.push('Cycles:');
    graph.cycles.forEach(cycle => {
      lines.push(`  ${cycle.join(' -> ')}`);
    });
  }

  lines.push('Evaluation Order:');
  graph.evaluationOrder.forEach((gateId, index) => {
    const node = graph.nodes.get(gateId);
    lines.push(`  ${index + 1}. ${gateId} (depth: ${node?.depth || 0})`);
  });

  return lines.join('\n');
}

/**
 * 評価統計の詳細表示（デバッグ用）
 */
export function formatEvaluationStats(
  stats: Readonly<EvaluationStats>
): string {
  const lines: string[] = ['Evaluation Statistics:'];
  lines.push(`Total Gates: ${stats.totalGates}`);
  lines.push(`Evaluated Gates: ${stats.evaluatedGates}`);
  lines.push(`Skipped Gates: ${stats.skippedGates}`);
  lines.push(`Total Time: ${stats.evaluationTimeMs.toFixed(2)}ms`);
  lines.push(
    `Dependency Resolution: ${stats.dependencyResolutionTimeMs.toFixed(2)}ms`
  );

  if (stats.memoryUsage) {
    lines.push(
      `Heap Used: ${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
    lines.push(
      `Heap Total: ${(stats.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
    );
  }

  lines.push('Gate Evaluation Times:');
  const sortedTimes = [...stats.gateEvaluationTimes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 slowest gates

  sortedTimes.forEach(([gateId, time]) => {
    lines.push(`  ${gateId}: ${time.toFixed(2)}ms`);
  });

  return lines.join('\n');
}
