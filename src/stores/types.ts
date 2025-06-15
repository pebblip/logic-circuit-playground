import type {
  Gate,
  Wire,
  CircuitState,
  GateType,
  Position,
  CustomGateDefinition,
} from '@/types/circuit';
import type { AppMode, ViewMode } from '@/types/appMode';
import type { TimingChartSlice } from './slices/timingChartSlice';
import type { ClockSelectionSlice } from './slices/clockSelectionSlice';
import type { ErrorSlice } from './slices/errorSlice';

// Re-export AppMode
export type { AppMode };

// 履歴管理用の型
export interface HistoryState {
  gates: Gate[];
  wires: Wire[];
}

// クリップボード用の型
export interface ClipboardData {
  gates: Gate[];
  wires: Wire[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

// ストアの基本的な状態
export interface CircuitStoreState extends CircuitState {
  // 履歴管理
  history: HistoryState[];
  historyIndex: number;

  // クリップボード
  clipboard: ClipboardData | null;

  // アプリケーションモード
  appMode: AppMode;
  allowedGates: GateType[] | null; // null = 全て許可
  isLearningMode: boolean;

  // ビューモード（カスタムゲートプレビュー）
  viewMode: ViewMode;
  previewingCustomGateId: string | null;

  // 複数選択
  selectedGateIds: string[];

  // 🎯 CLOCK選択状態（タイミングチャート用）
  selectedClockGateId: string | null;

  // ツールパレット選択
  selectedToolGateType: GateType | 'CUSTOM' | null;
  selectedToolCustomGateId: string | null;

  // 回路共有
  shareUrl: string | null;
  isGeneratingShareUrl: boolean;
  shareError: string | null;

  // エラーメッセージ
  errorMessage: string | null;
  errorType: 'connection' | 'general' | null;
}

// ストアのアクション
export interface CircuitStoreActions {
  // アプリケーションモード
  setAppMode: (mode: AppMode) => void;
  setAllowedGates: (gates: GateType[] | null) => void;
  setIsLearningMode: (isLearning: boolean) => void;

  // カスタムゲートプレビュー
  enterCustomGatePreview: (customGateId: string) => void;
  exitCustomGatePreview: () => void;

  // 複数選択
  setSelectedGates: (gateIds: string[]) => void;
  addToSelection: (gateId: string) => void;
  removeFromSelection: (gateId: string) => void;
  clearSelection: () => void;

  // 🎯 CLOCK選択操作（タイミングチャート用）
  setSelectedClockGate: (gateId: string | null) => void;

  // カスタムゲート管理
  addCustomGate: (definition: CustomGateDefinition) => void;
  removeCustomGate: (id: string) => void;
  createCustomGateFromCurrentCircuit: () => void;

  // ゲート操作
  addGate: (type: GateType, position: Position) => Gate;
  addCustomGateInstance: (
    definition: CustomGateDefinition,
    position: Position
  ) => Gate;
  moveGate: (
    gateId: string,
    position: Position,
    saveToHistory?: boolean
  ) => void;
  moveMultipleGates: (
    gateIds: string[],
    deltaX: number,
    deltaY: number,
    saveToHistory?: boolean
  ) => void;
  selectGate: (gateId: string | null) => void;
  deleteGate: (gateId: string) => void;

  // ワイヤー操作
  startWireDrawing: (gateId: string, pinIndex: number) => void;
  endWireDrawing: (gateId: string, pinIndex: number) => void;
  cancelWireDrawing: () => void;
  deleteWire: (wireId: string) => void;

  // ゲートの状態更新
  updateGateOutput: (gateId: string, output: boolean) => void;
  updateClockFrequency: (gateId: string, frequency: number) => void;

  // Undo/Redo/Clear
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Copy/Paste
  copySelection: () => void;
  paste: (position: Position) => void;
  canPaste: () => boolean;

  // 履歴管理（内部用）
  saveToHistory: () => void;

  // ツールパレット選択
  selectToolGate: (type: GateType | 'CUSTOM', customGateId?: string) => void;
  clearToolSelection: () => void;

  // 回路共有
  generateShareUrl: (name?: string, description?: string) => Promise<void>;
  loadFromShareUrl: () => Promise<boolean>;
  clearShareUrl: () => void;

  // エラーメッセージ
  setError: (message: string, type: 'connection' | 'general') => void;
  clearError: () => void;
}

export type CircuitStore = CircuitStoreState & CircuitStoreActions & TimingChartSlice & ClockSelectionSlice & ErrorSlice;
