/**
 * Canvas用シミュレーションフック
 * CLOCKゲートの定期的な回路更新とタイミングチャート管理
 */

import { useEffect, useRef } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
// ※ Circuit型は@/types/circuitから直接import
import { isSuccess } from '@domain/simulation/core';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationContext } from '@/domain/simulation/core/types';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { handleError } from '@/infrastructure/errorHandler';
import {
  getMaxClockFrequency,
  calculateUpdateInterval,
} from '../utils/canvasHelpers';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';
import type { Gate, Circuit } from '@/types/circuit';

interface UseCanvasSimulationProps {
  displayGates: Gate[];
  isReadOnly: boolean;
}

export const useCanvasSimulation = ({
  displayGates,
  isReadOnly,
}: UseCanvasSimulationProps) => {
  // 前回の回路状態を追跡（タイミングチャート用）
  const previousCircuitRef = useRef<Circuit | null>(null);

  // 🔧 パフォーマンス改善: CircuitEvaluatorのインスタンスを再利用
  const evaluatorRef = useRef<CircuitEvaluator | null>(null);

  // Zustandストアから必要な状態を取得
  const simulationConfig = useCircuitStore(state => state.simulationConfig);
  const gates = useCircuitStore(state => state.gates);
  const wires = useCircuitStore(state => state.wires);
  const timingChartActions = useCircuitStore(state => state.timingChartActions);
  const timingChart = useCircuitStore(state => state.timingChart);
  const selectedClockGateId = useCircuitStore(
    state => state.selectedClockGateId
  );

  // 現在の状態をrefで保持（間隔実行で使用）
  const currentStateRef = useRef({
    gates,
    wires,
    simulationConfig,
    timingChartActions,
    timingChart,
    selectedClockGateId,
  });

  // 状態が変更されたらrefを更新
  useEffect(() => {
    currentStateRef.current = {
      gates,
      wires,
      simulationConfig,
      timingChartActions,
      timingChart,
      selectedClockGateId,
    };
  }, [
    gates,
    wires,
    simulationConfig,
    timingChartActions,
    timingChart,
    selectedClockGateId,
  ]);

  // シミュレーション設定をglobalTimingCaptureに同期
  useEffect(() => {
    globalTimingCapture.updateSimulationConfig(simulationConfig);
    // 本番環境では時間プロバイダーをリセット（performance.nowを使用）
    globalTimingCapture.setTimeProvider(null);
  }, [simulationConfig]);

  // シミュレーション設定の変更を監視して同期
  useEffect(() => {
    const unsubscribe = useCircuitStore.subscribe(state => {
      globalTimingCapture.updateSimulationConfig(state.simulationConfig);
    });
    return unsubscribe;
  }, []);

  // 🔧 evaluatorの初期化
  useEffect(() => {
    // 初回作成
    if (!evaluatorRef.current) {
      evaluatorRef.current = new CircuitEvaluator();
    }
  }, []);

  // CLOCKゲートがある場合、定期的に回路を更新
  useEffect(() => {
    // プレビューモードでは更新しない
    if (isReadOnly) return;

    // 実行中のCLOCKゲートがあるか確認
    const hasRunningClockGate = displayGates.some(
      gate => gate.type === 'CLOCK' && gate.metadata?.isRunning
    );

    if (!hasRunningClockGate) {
      return; // 早期リターン
    }

    // 🌟 CLOCKゲート検出時の初期化（自動スクロールは削除）
    const clockGateCount = displayGates.filter(
      gate => gate.type === 'CLOCK'
    ).length;
    // Use a proper type for global timing capture with clock count tracking
    interface TimingCaptureWithClockCount {
      lastClockCount?: number;
    }
    const timingCaptureWithCount =
      globalTimingCapture as typeof globalTimingCapture &
        TimingCaptureWithClockCount;

    const previousCount = timingCaptureWithCount.lastClockCount || 0;

    if (clockGateCount > 0 && clockGateCount !== previousCount) {
      // シミュレーション開始時間をリセット
      globalTimingCapture.resetSimulationTime();
      globalTimingCapture.setSimulationStartTime();
      timingCaptureWithCount.lastClockCount = clockGateCount;
    }

    // 🎯 CLOCKゲートの最高周波数に応じて更新間隔を動的調整（パフォーマンス最適化）
    const maxClockFrequency = getMaxClockFrequency(displayGates);

    // サンプリング定理に従い、最低でも最高周波数の4倍で更新
    const updateInterval = calculateUpdateInterval(
      maxClockFrequency,
      CANVAS_CONSTANTS.CLOCK_UPDATE_MULTIPLIER,
      CANVAS_CONSTANTS.MAX_UPDATE_INTERVAL
    );

    const interval = setInterval(() => {
      // パフォーマンス最適化：実行中のCLOCKゲートがない場合は早期リターン
      const currentState = currentStateRef.current;
      const hasActiveClocks = currentState.gates.some(
        gate => gate.type === 'CLOCK' && gate.metadata?.isRunning
      );

      if (!hasActiveClocks) return;

      // 前回の回路状態を取得（タイミングイベント検出用）
      const previousCircuit = previousCircuitRef.current;

      // 現在の回路状態を構築
      const currentCircuit: Circuit = {
        gates: currentState.gates,
        wires: currentState.wires,
      };

      // 🔧 パフォーマンス改善: 既存のevaluatorインスタンスを使用
      if (!evaluatorRef.current) {
        console.error('[useCanvasSimulation] CircuitEvaluator not initialized');
        return;
      }

      let result;

      try {
        // Circuit型の準備（metadata保持）
        const evaluationCircuit: Circuit = {
          gates: currentCircuit.gates.map(gate => ({
            id: gate.id,
            type: gate.type as Gate['type'],
            position: gate.position,
            inputs: gate.inputs || [],
            outputs: gate.outputs || [],
            metadata: gate.metadata, // 🔧 重要: CLOCKゲートのmetadataを保持
          })),
          wires: currentCircuit.wires,
        };

        // 評価コンテキストを作成（適切なメモリ初期化）
        const evaluationContext: EvaluationContext = {
          currentTime: Date.now(),
          memory: {},
        };

        // 🔧 重要: ゲートの初期メモリを設定
        for (const gate of evaluationCircuit.gates) {
          switch (gate.type) {
            case 'INPUT':
              evaluationContext.memory[gate.id] = {
                state: gate.outputs[0] ?? false,
              };
              break;

            case 'CLOCK': {
              // startTimeは一度設定されたら固定する
              const currentTime = Date.now();
              const startTime = gate.metadata?.startTime ?? currentTime;

              evaluationContext.memory[gate.id] = {
                output: gate.outputs[0] ?? false,
                frequency: gate.metadata?.frequency ?? 1,
                startTime: startTime,
                manualToggle: false, // 時間ベース動作を有効化
              };

              // metadataにstartTimeを永続化（不変性を保ちつつ）
              // 注意: gate自体はreadonlyなので、ここでの変更は
              // 評価エンジン内部でのメタデータ更新処理に委ねる
              break;
            }

            case 'D-FF':
              evaluationContext.memory[gate.id] = {
                prevClk: false,
                q: gate.outputs[0] ?? false,
              };
              break;

            case 'SR-LATCH':
              evaluationContext.memory[gate.id] = {
                q: gate.outputs[0] ?? false,
              };
              break;
          }
        }

        // 🔧 デバッグ：CLOCK評価状況をログ出力
        const clockGates = evaluationCircuit.gates.filter(
          g => g.type === 'CLOCK'
        );
        if (clockGates.length > 0) {
          console.warn(
            'CLOCK Gates in useCanvasSimulation:',
            clockGates.map(g => ({
              id: g.id,
              metadata: g.metadata,
              memoryEntry: evaluationContext.memory[g.id],
            }))
          );
        }

        // 遅延モードに応じて適切な評価メソッドを呼び出し
        const evaluationResult = currentState.simulationConfig.delayMode
          ? evaluatorRef.current.evaluateDelayed(
              evaluationCircuit,
              evaluationContext
            )
          : evaluatorRef.current.evaluateImmediate(
              evaluationCircuit,
              evaluationContext
            );

        // 🔧 デバッグ：評価結果をログ出力
        if (clockGates.length > 0) {
          const updatedClockGates = evaluationResult.circuit.gates.filter(
            g => g.type === 'CLOCK'
          );
          console.warn(
            'CLOCK Evaluation Results:',
            updatedClockGates.map(g => ({
              id: g.id,
              outputs: g.outputs,
              currentTime: evaluationContext.currentTime,
            }))
          );
        }

        // 結果をCircuit型に変換
        const updatedCircuit: Circuit = {
          gates: evaluationResult.circuit.gates.map(gate => ({
            ...gate,
            position: gate.position,
            inputs: [...gate.inputs],
            outputs: [...gate.outputs],
            output: gate.outputs[0] ?? false,
          })),
          wires: evaluationResult.circuit.wires,
        };

        // 既存のコードとの互換性のためResult形式にラップ
        result = {
          success: true as const,
          data: {
            circuit: updatedCircuit,
            evaluationStats: {
              totalGates: updatedCircuit.gates.length,
              evaluatedGates: updatedCircuit.gates.length,
              skippedGates: 0,
              evaluationTimeMs: 0,
              dependencyResolutionTimeMs: 0,
              gateEvaluationTimes: new Map(),
            },
            dependencyGraph: {
              nodes: new Map(),
              edges: [],
              evaluationOrder: [],
              hasCycles: false,
              cycles: [],
            },
          },
          warnings: [],
        };
      } catch (error) {
        result = {
          success: false as const,
          error: {
            type: 'EVALUATION_ERROR' as const,
            message:
              error instanceof Error
                ? error.message
                : '回路評価中にエラーが発生しました',
            context: {},
          },
          warnings: [],
        };
      }

      if (isSuccess(result)) {
        // タイミングイベントを捕捉（previousCircuitは実際の前回状態または undefined）
        const timingEvents = globalTimingCapture.captureFromEvaluation(
          result,
          previousCircuit || undefined
        );

        // 🔧 タイミングイベントが生成された場合、タイミングチャートに同期
        if (
          timingEvents.length > 0 &&
          currentState.timingChartActions?.syncEventsFromGlobalCapture
        ) {
          currentState.timingChartActions.syncEventsFromGlobalCapture();
        }

        // 次回のために現在の回路状態を保存
        previousCircuitRef.current = {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };

        // Zustand storeを更新（パフォーマンス最適化：出力変更チェック）
        const hasOutputChanges = result.data.circuit.gates.some(
          (newGate, index) => {
            const oldGate = currentState.gates[index];
            // ゲートのIDが一致することも確認
            if (!oldGate || oldGate.id !== newGate.id) {
              console.warn(
                `[Canvas Simulation] Gate mismatch at index ${index}`
              );
              return true;
            }
            // 出力の変更をチェック
            const outputChanged = newGate.output !== oldGate.output;
            return outputChanged;
          }
        );

        // 常に更新（CLOCKの問題を解決するため）
        useCircuitStore.setState({
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        });

        // refも更新
        currentStateRef.current = {
          ...currentStateRef.current,
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };

        // 現在時刻更新（オシロスコープモード駆動）
        const currentSimTime = globalTimingCapture.getCurrentSimulationTime();
        if (currentState.timingChartActions && currentSimTime !== undefined) {
          currentState.timingChartActions.updateCurrentTime(currentSimTime);
        } else if (currentState.timingChartActions) {
          // globalTimingCaptureが動作していない場合は手動で時刻を設定
          const manualTime = Date.now();
          currentState.timingChartActions.updateCurrentTime(manualTime);
        }

        // タイミングイベント処理（条件付き）
        if (timingEvents.length > 0) {
          currentState.timingChartActions?.processTimingEvents(timingEvents);
        } else {
          // 手動でCLOCKイベントを生成（globalTimingCaptureの代替）
          // 出力変更時のみ生成
          if (hasOutputChanges) {
            const clockGates = result.data.circuit.gates.filter(
              g => g.type === 'CLOCK'
            );
            const manualEvents = [];

            for (const clockGate of clockGates) {
              const existingTrace = currentState.timingChart.traces.find(
                t =>
                  t.gateId === clockGate.id &&
                  t.pinType === 'output' &&
                  t.pinIndex === 0
              );

              if (existingTrace) {
                // 手動でタイミングイベントを作成
                const event = {
                  id: `event_${Date.now()}_${clockGate.id}_${Math.random().toString(36).substr(2, 9)}`,
                  time: Date.now(),
                  gateId: clockGate.id,
                  pinType: 'output' as const,
                  pinIndex: 0,
                  value: clockGate.outputs[0] ?? false,
                  source: 'MANUAL_GENERATION',
                  metadata: {
                    source: 'MANUAL_GENERATION',
                    gateType: 'CLOCK',
                  },
                };
                manualEvents.push(event);
              }
            }

            if (manualEvents.length > 0) {
              currentState.timingChartActions?.processTimingEvents(
                manualEvents
              );
            }
          }
        }

        // CLOCKゲートの自動トレース作成を削除（ユーザーが選択した時のみ作成）
        // 選択されたCLOCKゲートのみトレースを作成
        if (currentState.selectedClockGateId) {
          const selectedClockGate = result.data.circuit.gates.find(
            gate =>
              gate.id === currentState.selectedClockGateId &&
              gate.type === 'CLOCK'
          );

          if (selectedClockGate) {
            const existingTrace = currentState.timingChart.traces.find(
              t => t.gateId === selectedClockGate.id && t.pinType === 'output'
            );

            if (!existingTrace && currentState.timingChartActions) {
              currentState.timingChartActions.addTraceFromGate(
                selectedClockGate,
                'output',
                0
              );
              globalTimingCapture.watchGate(selectedClockGate.id, 'output', 0);
            }
          }
        }
      } else {
        // 回路評価失敗時の統一エラーハンドリング
        handleError(result.error, 'Canvas - CLOCKゲートシミュレーション', {
          userAction: '回路シミュレーション実行',
          severity: 'high',
          showToUser: true,
          logToConsole: true,
        });
      }
    }, updateInterval); // 動的更新間隔

    return () => {
      clearInterval(interval);
    };
  }, [
    displayGates,
    isReadOnly,
    gates,
    wires,
    simulationConfig,
    timingChartActions,
    timingChart,
    selectedClockGateId,
  ]); // CLOCKゲートの周波数変更を検出
};
