import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import { CircuitShareService } from '@/services/CircuitShareService';
import { IdGenerator } from '@/shared/id';

export interface ShareSlice {
  shareUrl: string | null;
  isGeneratingShareUrl: boolean;
  shareError: string | null;
  generateShareUrl: (name?: string, description?: string) => Promise<void>;
  loadFromShareUrl: () => Promise<boolean>;
  clearShareUrl: () => void;
}

export const createShareSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ShareSlice
> = (set, get) => ({
  shareUrl: null,
  isGeneratingShareUrl: false,
  shareError: null,

  generateShareUrl: async (name?: string, description?: string) => {
    set({ isGeneratingShareUrl: true, shareError: null });
    
    const state = get();
    const result = await CircuitShareService.createShareUrl(
      state.gates,
      state.wires,
      { name, description }
    );

    if (result.success && result.url) {
      set({ 
        shareUrl: result.url, 
        isGeneratingShareUrl: false 
      });
    } else {
      set({ 
        shareError: result.error || '共有URLの生成に失敗しました',
        isGeneratingShareUrl: false 
      });
    }
  },

  loadFromShareUrl: async () => {
    if (!CircuitShareService.hasShareData()) {
      return false;
    }

    const result = await CircuitShareService.loadFromCurrentUrl();
    
    if (result.success && result.data) {
      // 新しいIDを生成（重複を避けるため）
      const gates = result.data.gates.map(gate => ({
        ...gate,
        id: IdGenerator.generateGateId(),
      }));
      
      const wires = result.data.wires.map(wire => ({
        ...wire,
        id: IdGenerator.generateWireId(),
      }));

      // 回路を読み込み
      set({
        gates,
        wires,
        selectedGateId: null,
        selectedGateIds: [],
      });

      // 履歴に保存
      get().saveToHistory();

      // URLパラメータをクリア
      CircuitShareService.clearShareParams();

      return true;
    }

    return false;
  },

  clearShareUrl: () => {
    set({ shareUrl: null, shareError: null });
  },
});