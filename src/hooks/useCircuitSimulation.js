// 回路シミュレーション用カスタムフック

import { useState, useCallback, useEffect } from 'react';
import { calculateCircuit } from '../utils/circuit';
import { SIMULATION } from '../constants/circuit';

/**
 * 回路シミュレーションを管理するカスタムフック
 * @param {Array} gates - ゲートの配列
 * @param {Array} connections - 接続の配列
 * @returns {Object} シミュレーション関連の状態と関数
 */
export const useCircuitSimulation = (gates, connections) => {
  const [simulation, setSimulation] = useState({});
  const [autoMode, setAutoMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(SIMULATION.DEFAULT_SPEED);
  const [clockSignal, setClockSignal] = useState(false);

  // 回路計算の実行（特定のゲート状態を使用）
  const calculateCircuitWithGates = useCallback((currentGates) => {
    return calculateCircuit(currentGates, connections);
  }, [connections]);

  // 手動計算の実行
  const runCalculation = useCallback(() => {
    const newSimulation = calculateCircuitWithGates(gates);
    setSimulation(newSimulation);
    return newSimulation;
  }, [gates, calculateCircuitWithGates]);

  // クロック信号の更新（自動モード時のみ）
  useEffect(() => {
    if (autoMode && simulationSpeed > 0) {
      const interval = setInterval(() => {
        setClockSignal(prev => !prev);
      }, SIMULATION.CLOCK_INTERVAL_BASE / simulationSpeed);
      return () => clearInterval(interval);
    }
  }, [autoMode, simulationSpeed]);

  // 自動モードの切り替え
  const toggleAutoMode = useCallback(() => {
    setAutoMode(prev => !prev);
  }, []);

  // シミュレーション速度の設定
  const updateSimulationSpeed = useCallback((speed) => {
    const clampedSpeed = Math.max(
      SIMULATION.MIN_SPEED,
      Math.min(SIMULATION.MAX_SPEED, speed)
    );
    setSimulationSpeed(clampedSpeed);
  }, []);

  // リセット
  const resetSimulation = useCallback(() => {
    setSimulation({});
    setAutoMode(false);
    setClockSignal(false);
  }, []);

  return {
    simulation,
    autoMode,
    simulationSpeed,
    clockSignal,
    calculateCircuitWithGates,
    runCalculation,
    toggleAutoMode,
    updateSimulationSpeed,
    resetSimulation
  };
};