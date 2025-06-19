/**
 * Canvas用シミュレーションフック
 * CLOCKゲートの定期的な回路更新とタイミングチャート管理
 */

import { useEffect, useRef } from 'react';
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
  // 前回の回路状態を追跡（タイミングチャート用）
  const previousCircuitRef = useRef<Circuit | null>(null);

  // シミュレーション設定をglobalTimingCaptureに同期
  useEffect(() => {
    const currentState = useCircuitStore.getState();
    globalTimingCapture.updateSimulationConfig(currentState.simulationConfig);
  }, []);

  // シミュレーション設定の変更を監視して同期
  useEffect(() => {
    const unsubscribe = useCircuitStore.subscribe(
      (state) => {
        globalTimingCapture.updateSimulationConfig(state.simulationConfig);
      }
    );
    return unsubscribe;
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
    const previousCount = (globalTimingCapture as any)._lastClockCount || 0;

    if (clockGateCount > 0 && clockGateCount !== previousCount) {
      // シミュレーション開始時間をリセット
      globalTimingCapture.resetSimulationTime();
      globalTimingCapture.setSimulationStartTime();
      (globalTimingCapture as any)._lastClockCount = clockGateCount;

      console.log(
        `[Canvas] 🎯 Detected ${clockGateCount} CLOCK gates`
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

      // 前回の回路状態を取得（タイミングイベント検出用）
      const previousCircuit = previousCircuitRef.current;
      
      // 現在の回路状態を構築
      const currentCircuit: Circuit = {
        gates: currentState.gates,
        wires: currentState.wires,
      };

      // EnhancedHybridEvaluatorを使用して循環回路に対応
      const enhancedEvaluator = new EnhancedHybridEvaluator({
        strategy: 'AUTO_SELECT',
        enableDebugLogging: false, // デバッグログを無効化（大量のログを防ぐ）
        delayMode: currentState.simulationConfig.delayMode,
      });
      let result;
      
      try {
        const evaluationResult = enhancedEvaluator.evaluate(currentCircuit);
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
        // タイミングイベントを捕捉（previousCircuitは実際の前回状態または undefined）
        const timingEvents = globalTimingCapture.captureFromEvaluation(
          result,
          previousCircuit || undefined
        );

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
              console.warn(`[Canvas Simulation] Gate mismatch at index ${index}`);
              return true;
            }
            // 出力の変更をチェック
            const outputChanged = newGate.output !== oldGate.output;
            if (outputChanged && newGate.type === 'CLOCK') {
              console.log(`[Canvas Simulation] CLOCK ${newGate.id} output changed: ${oldGate.output} → ${newGate.output}`);
            }
            return outputChanged;
          }
        );

        // 常に更新（CLOCKの問題を解決するため）
        // console.log(`[Canvas Simulation] Updating store (hasOutputChanges: ${hasOutputChanges})`);
        useCircuitStore.setState({
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        });

        // 現在時刻更新（オシロスコープモード駆動）
        const currentSimTime = globalTimingCapture.getCurrentSimulationTime();
        if (currentState.timingChartActions && currentSimTime !== undefined) {
          currentState.timingChartActions.updateCurrentTime(currentSimTime);
        } else if (currentState.timingChartActions) {
          // globalTimingCaptureが動作していない場合は手動で時刻を設定
          const manualTime = Date.now();
          currentState.timingChartActions.updateCurrentTime(manualTime);
          // if (Math.random() < 0.05) { // 5%の確率でログ
          //   console.log(`[Canvas Simulation] Manual time update: ${manualTime}`);
          // }
        }

        // タイミングイベント処理（条件付き）
        if (timingEvents.length > 0) {
          console.log(`[Canvas Simulation] Processing ${timingEvents.length} timing events from globalTimingCapture`);
          currentState.timingChartActions?.processTimingEvents(timingEvents);
        } else {
          // 手動でCLOCKイベントを生成（globalTimingCaptureの代替）
          // 出力変更時のみ生成
          if (hasOutputChanges) {
            const clockGates = result.data.circuit.gates.filter(g => g.type === 'CLOCK');
            const manualEvents = [];
            
            console.log(`[Canvas Simulation] Found ${clockGates.length} CLOCK gates for manual event generation`);
            console.log(`[Canvas Simulation] Current traces:`, currentState.timingChart.traces.map(t => ({
              id: t.id,
              gateId: t.gateId,
              pinType: t.pinType,
              pinIndex: t.pinIndex,
              name: t.name
            })));
            
            for (const clockGate of clockGates) {
              const existingTrace = currentState.timingChart.traces.find(
                t => t.gateId === clockGate.id && t.pinType === 'output' && t.pinIndex === 0
              );
              
              console.log(`[Canvas Simulation] CLOCK gate ${clockGate.id} output=${clockGate.output}, isRunning=${clockGate.metadata?.isRunning}, trace exists: ${!!existingTrace}`);
              
              if (existingTrace) {
                // 手動でタイミングイベントを作成
                const event = {
                  id: `event_${Date.now()}_${clockGate.id}_${Math.random().toString(36).substr(2, 9)}`,
                  time: Date.now(),
                  gateId: clockGate.id,
                  pinType: 'output' as const,
                  pinIndex: 0,
                  value: clockGate.output,
                  source: 'MANUAL_GENERATION',
                  metadata: {
                    source: 'MANUAL_GENERATION',
                    gateType: 'CLOCK'
                  }
                };
                manualEvents.push(event);
                console.log(`[Canvas Simulation] Generated manual event for CLOCK ${clockGate.id}:`, event);
              }
            }
            
            if (manualEvents.length > 0) {
              console.log(`[Canvas Simulation] Manually generated ${manualEvents.length} CLOCK events:`, manualEvents);
              currentState.timingChartActions?.processTimingEvents(manualEvents);
            } else {
              console.log(`[Canvas Simulation] No manual events generated (no matching traces or no output changes)`);
            }
          }
        }

        // CLOCKゲートの自動トレース作成を削除（ユーザーが選択した時のみ作成）
        // 選択されたCLOCKゲートのみトレースを作成
        if (currentState.selectedClockGateId) {
          const selectedClockGate = result.data.circuit.gates.find(
            gate => gate.id === currentState.selectedClockGateId && gate.type === 'CLOCK'
          );
          
          if (selectedClockGate) {
            const existingTrace = currentState.timingChart.traces.find(
              t => t.gateId === selectedClockGate.id && t.pinType === 'output'
            );

            if (!existingTrace && currentState.timingChartActions) {
              const traceId = currentState.timingChartActions.addTraceFromGate(selectedClockGate, 'output', 0);
              globalTimingCapture.watchGate(selectedClockGate.id, 'output', 0);
              // console.log(`[Canvas Simulation] Added trace for CLOCK ${selectedClockGate.id}, traceId: ${traceId}`);
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
  }, [displayGates, isReadOnly]); // CLOCKゲートの周波数変更を検出
};