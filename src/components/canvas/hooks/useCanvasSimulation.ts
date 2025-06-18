/**
 * Canvas用シミュレーションフック
 * CLOCKゲートの定期的な回路更新とタイミングチャート管理
 */

import { useEffect } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import { Circuit } from '@domain/simulation/core/types';
import { isSuccess } from '@domain/simulation/core';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { handleError } from '@/infrastructure/errorHandler';
import { getMaxClockFrequency, calculateUpdateInterval } from '../utils/canvasHelpers';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';
import type { Gate } from '@/types/circuit';

interface UseCanvasSimulationProps {
  displayGates: Gate[];
  isReadOnly: boolean;
}

export const useCanvasSimulation = ({ 
  displayGates, 
  isReadOnly 
}: UseCanvasSimulationProps) => {
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

    // 🌟 新設計：CLOCKゲート検出時にオシロスコープモード開始
    const clockGateCount = displayGates.filter(
      gate => gate.type === 'CLOCK'
    ).length;
    const previousCount = (globalTimingCapture as any)._lastClockCount || 0;

    if (clockGateCount > 0 && clockGateCount !== previousCount) {
      // シミュレーション開始時間をリセット
      globalTimingCapture.resetSimulationTime();
      globalTimingCapture.setSimulationStartTime();
      (globalTimingCapture as any)._lastClockCount = clockGateCount;

      // 🎯 オシロスコープライクなスクロール開始
      const currentState = useCircuitStore.getState();
      if (currentState.timingChartActions) {
        // 初期化：時間窓を0-500msにリセット
        currentState.timingChartActions.resetView();
        // 連続スクロール開始
        currentState.timingChartActions.startContinuousScroll();
        console.log('[Canvas] 🚀 Started continuous scroll mode');
      }

      console.log(
        `[Canvas] 🎯 Initialized timing chart for ${clockGateCount} CLOCK gates`
      );
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
      const currentState = useCircuitStore.getState();
      const hasActiveClocks = currentState.gates.some(
        gate => gate.type === 'CLOCK' && gate.metadata?.isRunning
      );

      if (!hasActiveClocks) return;

      const previousCircuit: Circuit = {
        gates: currentState.gates,
        wires: currentState.wires,
      };

      // EnhancedHybridEvaluatorを使用して循環回路に対応
      const enhancedEvaluator = new EnhancedHybridEvaluator({
        strategy: 'AUTO_SELECT',
        enableDebugLogging: false,
      });
      let result;
      
      try {
        const evaluationResult = enhancedEvaluator.evaluate(previousCircuit);
        const updatedCircuit = evaluationResult.circuit;
        
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
              gateEvaluationTimes: new Map()
            },
            dependencyGraph: {
              nodes: new Map(),
              edges: [],
              evaluationOrder: [],
              hasCycles: false,
              cycles: []
            }
          },
          warnings: []
        };
      } catch (error) {
        result = {
          success: false as const,
          error: {
            type: 'EVALUATION_ERROR' as const,
            message: error instanceof Error ? error.message : '回路評価中にエラーが発生しました',
            context: {}
          },
          warnings: []
        };
      }

      if (isSuccess(result)) {
        // タイミングイベントを捕捉
        const timingEvents = globalTimingCapture.captureFromEvaluation(
          result,
          previousCircuit
        );

        // Zustand storeを更新（パフォーマンス最適化：出力変更チェック）
        const hasOutputChanges = result.data.circuit.gates.some(
          (newGate, index) => {
            const oldGate = currentState.gates[index];
            return !oldGate || newGate.output !== oldGate.output;
          }
        );

        if (hasOutputChanges) {
          useCircuitStore.setState({
            gates: [...result.data.circuit.gates],
            wires: [...result.data.circuit.wires],
          });
        }

        // 現在時刻更新（オシロスコープモード駆動）
        const currentSimTime = globalTimingCapture.getCurrentSimulationTime();
        if (currentState.timingChartActions && currentSimTime !== undefined) {
          currentState.timingChartActions.updateCurrentTime(currentSimTime);
        }

        // タイミングイベント処理（条件付き）
        if (timingEvents.length > 0) {
          currentState.timingChartActions?.processTimingEvents(timingEvents);
        }

        // CLOCKゲートの自動トレース作成（初回のみ、パフォーマンス最適化）
        const clockGates = result.data.circuit.gates.filter(
          gate => gate.type === 'CLOCK'
        );
        clockGates.forEach(gate => {
          // CLOCKゲートのトレースが存在しない場合は作成
          const existingTrace = currentState.timingChart.traces.find(
            t => t.gateId === gate.id && t.pinType === 'output'
          );

          if (!existingTrace && currentState.timingChartActions) {
            currentState.timingChartActions.addTraceFromGate(gate, 'output', 0);
            globalTimingCapture.watchGate(gate.id, 'output', 0);
          }
        });
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
  }, [displayGates, isReadOnly]); // CLOCKゲートの周波数変更を検出
};