import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type { WireStyle } from '@/utils/wirePathGenerator';

export interface PreferencesSlice {
  // 配線スタイル設定
  wireStyle: WireStyle;
  setWireStyle: (style: WireStyle) => void;

  // その他の設定（将来的に追加）
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;

  gridSize: number;
  setGridSize: (size: number) => void;

  // 設定の永続化
  loadPreferences: () => void;
  savePreferences: () => void;
}

const PREFERENCES_STORAGE_KEY = 'logicirc-preferences';

export const createPreferencesSlice: StateCreator<
  CircuitStore,
  [],
  [],
  PreferencesSlice
> = (set, get) => ({
  // デフォルト値
  wireStyle: 'bezier',
  showGrid: false,
  gridSize: 20,

  setWireStyle: (style: WireStyle) => {
    set({ wireStyle: style });
    get().savePreferences();
  },

  setShowGrid: (show: boolean) => {
    set({ showGrid: show });
    get().savePreferences();
  },

  setGridSize: (size: number) => {
    set({ gridSize: size });
    get().savePreferences();
  },

  loadPreferences: () => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        set({
          wireStyle: preferences.wireStyle || 'bezier',
          showGrid: preferences.showGrid ?? false,
          gridSize: preferences.gridSize || 20,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  },

  savePreferences: () => {
    try {
      const state = get();
      const preferences = {
        wireStyle: state.wireStyle,
        showGrid: state.showGrid,
        gridSize: state.gridSize,
      };
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },
});
