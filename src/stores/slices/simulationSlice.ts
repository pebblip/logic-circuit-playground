import { type StateCreator } from 'zustand';

/**
 * シミュレーション設定の型定義
 */
export interface SimulationConfig {
  /** 遅延モードの有効/無効 */
  delayMode: boolean;
  
  /** カスタム遅延値 (ゲートID -> 遅延値) */
  customDelays: Record<string, number>;
  
  /** デフォルト遅延値の倍率 */
  delayMultiplier: number;
  
  /** デバッグモード */
  enableDebug: boolean;
}

/**
 * シミュレーションスライスの状態
 */
export interface SimulationSlice {
  simulationConfig: SimulationConfig;
  
  // Actions
  setDelayMode: (enabled: boolean) => void;
  setCustomDelay: (gateId: string, delay: number | null) => void;
  setDelayMultiplier: (multiplier: number) => void;
  setDebugMode: (enabled: boolean) => void;
  resetSimulationConfig: () => void;
}

/**
 * デフォルトのシミュレーション設定
 */
const defaultSimulationConfig: SimulationConfig = {
  delayMode: false,
  customDelays: {},
  delayMultiplier: 1.0,
  enableDebug: false,
};

/**
 * シミュレーションスライスの作成
 */
export const createSimulationSlice: StateCreator<
  SimulationSlice,
  [],
  [],
  SimulationSlice
> = (set) => ({
  simulationConfig: defaultSimulationConfig,
  
  setDelayMode: (enabled) =>
    set((state) => ({
      simulationConfig: {
        ...state.simulationConfig,
        delayMode: enabled,
      },
    })),
  
  setCustomDelay: (gateId, delay) =>
    set((state) => {
      const customDelays = { ...state.simulationConfig.customDelays };
      
      if (delay === null) {
        delete customDelays[gateId];
      } else {
        customDelays[gateId] = delay;
      }
      
      return {
        simulationConfig: {
          ...state.simulationConfig,
          customDelays,
        },
      };
    }),
  
  setDelayMultiplier: (multiplier) =>
    set((state) => ({
      simulationConfig: {
        ...state.simulationConfig,
        delayMultiplier: Math.max(0.1, Math.min(10.0, multiplier)),
      },
    })),
  
  setDebugMode: (enabled) =>
    set((state) => ({
      simulationConfig: {
        ...state.simulationConfig,
        enableDebug: enabled,
      },
    })),
  
  resetSimulationConfig: () =>
    set(() => ({
      simulationConfig: defaultSimulationConfig,
    })),
});