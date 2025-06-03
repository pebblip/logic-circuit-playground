import { create } from 'zustand';
import { Gate, Wire, CircuitState, GateType, Position, CustomGateDefinition, CustomGatePin } from '../types/circuit';
import { evaluateCircuit } from '@domain/simulation';
import { GateFactory } from '../models/gates/GateFactory';
import { saveCustomGates, loadCustomGates } from '@infrastructure/storage/customGateStorage';
import { booleanToDisplayState, displayStateToBoolean, getGateInputValue, setGateInputValue } from '@domain/simulation';
import { IdGenerator } from '@shared/id';

// 履歴管理用の型
interface HistoryState {
  gates: Gate[];
  wires: Wire[];
}

// クリップボード用の型
interface ClipboardData {
  gates: Gate[];
  wires: Wire[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

interface CircuitStore extends CircuitState {
  // 履歴管理
  history: HistoryState[];
  historyIndex: number;
  
  // クリップボード
  clipboard: ClipboardData | null;
  
  // アプリケーションモード
  appMode: '学習モード' | '自由制作' | 'パズル・チャレンジ';
  setAppMode: (mode: '学習モード' | '自由制作' | 'パズル・チャレンジ') => void;
  allowedGates: GateType[] | null; // null = 全て許可
  setAllowedGates: (gates: GateType[] | null) => void;
  
  // 複数選択
  selectedGateIds: string[];
  setSelectedGates: (gateIds: string[]) => void;
  addToSelection: (gateId: string) => void;
  removeFromSelection: (gateId: string) => void;
  clearSelection: () => void;
  
  
  // カスタムゲート管理
  addCustomGate: (definition: CustomGateDefinition) => void;
  removeCustomGate: (id: string) => void;
  createCustomGateFromCurrentCircuit: () => void;
  
  // ゲート操作
  addGate: (type: GateType, position: Position) => Gate;
  addCustomGateInstance: (definition: CustomGateDefinition, position: Position) => Gate;
  moveGate: (gateId: string, position: Position, saveToHistory?: boolean) => void;
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
  pushHistory: () => void;
}

// アプリ起動時にlocalStorageからカスタムゲートを読み込む
const initialCustomGates = loadCustomGates();

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  gates: [],
  wires: [],
  selectedGateId: null,
  selectedGateIds: [],
  isDrawingWire: false,
  wireStart: null,
  customGates: initialCustomGates, // localStorageから読み込んだ値で初期化
  history: [{ gates: [], wires: [] }], // 初期状態を履歴に追加
  historyIndex: 0,
  clipboard: null,
  appMode: '自由制作',
  allowedGates: null,

  addCustomGate: (definition) => {
    set((state) => {
      const newCustomGates = [...state.customGates, definition];
      // LocalStorageに保存
      saveCustomGates(newCustomGates);
      return {
        customGates: newCustomGates
      };
    });
  },

  removeCustomGate: (id) => {
    set((state) => {
      const newCustomGates = state.customGates.filter(gate => gate.id !== id);
      // LocalStorageに保存
      saveCustomGates(newCustomGates);
      return {
        customGates: newCustomGates
      };
    });
  },

  addGate: (type, position) => {
    // GateFactoryを使用してゲートを作成（特殊ゲートにも対応）
    const newGate = GateFactory.createGate(type, position);
    
    // 新しいゲートの入力値を適切な形式で初期化
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input => 
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }
    
    set((state) => {
      const newGates = [...state.gates, newGate];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
    
    // 履歴に追加
    get().pushHistory();
    
    return newGate;
  },

  addCustomGateInstance: (definition, position) => {
    
    // GateFactoryを使用してカスタムゲートを作成
    const newGate = GateFactory.createCustomGate(definition, position);
    
    // カスタムゲートの入力値を適切な形式で初期化
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input => 
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }
    
    set((state) => {
      const newGates = [...state.gates, newGate];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
    
    // 履歴に追加
    get().pushHistory();
    
    return newGate;
  },

  moveGate: (gateId, position, saveToHistory = false) => {
    set((state) => {
      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (state.isDrawingWire && state.wireStart && state.wireStart.gateId === gateId) {
        const gate = state.gates.find(g => g.id === gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          let x = position.x;
          let y = position.y;
          
          if (gate.type === 'INPUT') {
            x += 35;
          } else if (gate.type === 'OUTPUT') {
            x -= 30;
          } else if (gate.type === 'CLOCK') {
            x += 55;
          } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 60;
              y -= 20; // Q output
            } else {
              x -= 60;
              y += pinIndex === 0 ? -20 : 20;
            }
          } else if (gate.type === 'MUX') {
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 60;
            } else {
              x -= 60;
              if (pinIndex === 0) y -= 25;
              else if (pinIndex === 1) y += 0;
              else if (pinIndex === 2) y += 25;
            }
          } else if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
            // カスタムゲート
            const definition = gate.customGateDefinition;
            const size = { width: definition.width, height: definition.height };
            const halfWidth = size.width / 2;
            const isOutput = pinIndex < 0; // 負の値は出力ピン
            
            if (isOutput) {
              const outputIndex = (-pinIndex) - 1; // -1 -> 0, -2 -> 1, -3 -> 2...
              const pinCount = definition.outputs.length;
              const availableHeight = Math.max(40, size.height - 80); // 統一された計算
              const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
              const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (outputIndex * spacing);
              
              x += halfWidth + 10;
              y += pinY;
            } else {
              const pinCount = definition.inputs.length;
              const availableHeight = Math.max(40, size.height - 80); // 統一された計算
              const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
              const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (pinIndex * spacing);
              
              x -= halfWidth + 10;
              y += pinY;
            }
          } else {
            // 通常のゲート
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 45;
            } else {
              x -= 45;
              const inputCount = gate.type === 'NOT' ? 1 : 2;
              if (inputCount === 2) {
                y += pinIndex === 0 ? -10 : 10;
              }
            }
          }
          
          newWireStart = { ...state.wireStart, position: { x, y } };
        }
      }
      
      return {
        gates: state.gates.map((gate) =>
          gate.id === gateId ? { ...gate, position } : gate
        ),
        wireStart: newWireStart,
      };
    });
    
    // ドラッグ終了時のみ履歴に追加
    if (saveToHistory) {
      get().pushHistory();
    }
  },

  selectGate: (gateId) => {
    set({ 
      selectedGateId: gateId,
      selectedGateIds: gateId ? [gateId] : []
    });
  },
  
  setSelectedGates: (gateIds) => {
    set({ 
      selectedGateIds: gateIds,
      selectedGateId: gateIds.length === 1 ? gateIds[0] : null
    });
  },
  
  addToSelection: (gateId) => {
    set((state) => ({
      selectedGateIds: [...state.selectedGateIds, gateId],
      selectedGateId: null // 複数選択時は単一選択をクリア
    }));
  },
  
  removeFromSelection: (gateId) => {
    set((state) => {
      const newSelection = state.selectedGateIds.filter(id => id !== gateId);
      return {
        selectedGateIds: newSelection,
        selectedGateId: newSelection.length === 1 ? newSelection[0] : null
      };
    });
  },
  
  clearSelection: () => {
    set({ selectedGateIds: [], selectedGateId: null });
  },

  deleteGate: (gateId) => {
    set((state) => {
      // 削除対象のゲートIDリスト（単一の場合も配列にする）
      const gateIdsToDelete = state.selectedGateIds.includes(gateId) 
        ? state.selectedGateIds 
        : [gateId];
      
      const newGates = state.gates.filter((gate) => !gateIdsToDelete.includes(gate.id));
      const newWires = state.wires.filter(
        (wire) => !gateIdsToDelete.includes(wire.from.gateId) && !gateIdsToDelete.includes(wire.to.gateId)
      );
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        selectedGateId: null,
        selectedGateIds: [],
      };
    });
    
    // 履歴に追加
    get().pushHistory();
  },

  startWireDrawing: (gateId, pinIndex) => {
    const gate = useCircuitStore.getState().gates.find(g => g.id === gateId);
    if (!gate) return;
    
    // ピンの位置を計算
    let x = gate.position.x;
    let y = gate.position.y;
    
    if (gate.type === 'INPUT') {
      x += 35;
    } else if (gate.type === 'OUTPUT') {
      x -= 30;
    } else if (gate.type === 'CLOCK') {
      x += 55;
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      const isOutput = pinIndex === -1;
      if (isOutput) {
        x += 60;
        y -= 20; // Q output
      } else {
        x -= 60;
        y += pinIndex === 0 ? -20 : 20;
      }
    } else if (gate.type === 'MUX') {
      const isOutput = pinIndex === -1;
      if (isOutput) {
        x += 60;
      } else {
        x -= 60;
        if (pinIndex === 0) y -= 25;
        else if (pinIndex === 1) y += 0;
        else if (pinIndex === 2) y += 25;
      }
    } else if (gate.type === 'CUSTOM' && gate.customGateDefinition) {
      // カスタムゲート
      const definition = gate.customGateDefinition;
      const size = { width: definition.width, height: definition.height };
      const halfWidth = size.width / 2;
      const isOutput = pinIndex < 0; // 負の値は出力ピン
      
      if (isOutput) {
        // 出力ピンの場合
        const outputIndex = (-pinIndex) - 1; // -1 -> 0, -2 -> 1, -3 -> 2...
        const pinCount = definition.outputs.length;
        const availableHeight = Math.max(40, size.height - 80); // 統一された計算
        const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
        const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (outputIndex * spacing);
        
        x += halfWidth + 10;
        y += pinY;
      } else {
        // 入力ピンの場合
        const pinCount = definition.inputs.length;
        const availableHeight = Math.max(40, size.height - 80); // 統一された計算
        const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
        const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (pinIndex * spacing);
        
        x -= halfWidth + 10;
        y += pinY;
      }
    } else {
      // 通常のゲート
      const isOutput = pinIndex === -1; // -1は出力ピン
      if (isOutput) {
        x += 45;
      } else {
        x -= 45;
        const inputCount = gate.type === 'NOT' ? 1 : 2;
        if (inputCount === 2) {
          y += pinIndex === 0 ? -10 : 10;
        }
      }
    }
    
    set({
      isDrawingWire: true,
      wireStart: { gateId, pinIndex, position: { x, y } },
    });
  },

  endWireDrawing: (gateId, pinIndex) => {
    set((state) => {
      if (!state.wireStart || state.wireStart.gateId === gateId) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 接続先のゲートを見つけてposition計算
      const toGate = state.gates.find(g => g.id === gateId);
      if (!toGate) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 接続先ピンの位置を計算
      let toX = toGate.position.x;
      let toY = toGate.position.y;
      
      if (toGate.type === 'INPUT' || toGate.type === 'OUTPUT') {
        // INPUT/OUTPUTゲートの位置計算
        const isOutput = pinIndex === -1;
        if (isOutput) {
          toX += 60;
        } else {
          toX -= 60;
          if (pinIndex === 0) toY -= 25;
          else if (pinIndex === 1) toY += 0;
          else if (pinIndex === 2) toY += 25;
        }
      } else if (toGate.type === 'CUSTOM' && toGate.customGateDefinition) {
        // カスタムゲートの位置計算
        const definition = toGate.customGateDefinition;
        const size = { width: definition.width, height: definition.height };
        const halfWidth = size.width / 2;
        const isOutput = pinIndex < 0; // 負の値は出力ピン
        
        if (isOutput) {
          const outputIndex = (-pinIndex) - 1; // -1 -> 0, -2 -> 1, -3 -> 2...
          const pinCount = definition.outputs.length;
          const availableHeight = Math.max(40, size.height - 80); // 統一された計算
          const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
          const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (outputIndex * spacing);
          
          toX += halfWidth + 10;
          toY += pinY;
        } else {
          const pinCount = definition.inputs.length;
          const availableHeight = Math.max(40, size.height - 80); // 統一された計算
          const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
          const pinY = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (pinIndex * spacing);
          
          toX -= halfWidth + 10;
          toY += pinY;
        }
      } else {
        // 通常のゲートの位置計算
        const isOutput = pinIndex === -1;
        if (isOutput) {
          toX += 45;
        } else {
          toX -= 45;
          const inputCount = toGate.type === 'NOT' ? 1 : 2;
          if (inputCount === 2) {
            toY += pinIndex === 0 ? -10 : 10;
          }
        }
      }

      // 接続の方向を正規化（常に出力→入力になるようにする）
      let from = state.wireStart;
      let to = { gateId, pinIndex, position: { x: toX, y: toY } };
      
      // fromが入力ピン（pinIndex >= 0）で、toが出力ピン（pinIndex < 0）の場合、入れ替える
      if (from.pinIndex >= 0 && to.pinIndex < 0) {
        [from, to] = [to, from];
      }
      // 両方が入力ピンまたは両方が出力ピンの場合は接続しない
      else if ((from.pinIndex >= 0 && to.pinIndex >= 0) || (from.pinIndex < 0 && to.pinIndex < 0)) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 重要: 入力ピンに既に接続されているワイヤーがある場合は接続を拒否
      // 論理回路では各入力ピンには1つのワイヤーしか接続できない
      const targetInputPin = to.pinIndex >= 0 ? to : (from.pinIndex >= 0 ? from : null);
      if (targetInputPin) {
        const existingConnection = state.wires.find(wire => 
          wire.to.gateId === targetInputPin.gateId && 
          wire.to.pinIndex === targetInputPin.pinIndex
        );
        
        if (existingConnection) {
          console.warn('⚠️ 入力ピンに既に接続されています:', {
            gateId: targetInputPin.gateId,
            pinIndex: targetInputPin.pinIndex,
            existingWireId: existingConnection.id
          });
          return { isDrawingWire: false, wireStart: null };
        }
      }

      const newWire: Wire = {
        id: IdGenerator.generateWireId(),
        from: { gateId: from.gateId, pinIndex: from.pinIndex },
        to: { gateId: to.gateId, pinIndex: to.pinIndex },
        isActive: false,
      };

      // 新しいワイヤーを追加
      const newWires = [...state.wires, newWire];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(state.gates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        isDrawingWire: false,
        wireStart: null,
      };
    });
    
    // 履歴に追加
    get().pushHistory();
  },

  cancelWireDrawing: () => {
    set({ isDrawingWire: false, wireStart: null });
  },

  deleteWire: (wireId) => {
    set((state) => {
      const newWires = state.wires.filter((wire) => wire.id !== wireId);
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(state.gates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
    
    // 履歴に追加
    get().pushHistory();
  },

  updateGateOutput: (gateId, output) => {
    set((state) => {
      // INPUTゲートの状態を更新（boolean値を統一的に処理）
      const updatedGates = state.gates.map((gate) => {
        if (gate.id === gateId) {
          // 出力値を適切な型で設定
          return { ...gate, output };
        }
        return gate;
      });
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(updatedGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
  },

  updateClockFrequency: (gateId, frequency) => {
    set((state) => {
      const updatedGates = state.gates.map((gate) => {
        if (gate.id === gateId && gate.type === 'CLOCK' && gate.metadata) {
          return {
            ...gate,
            metadata: {
              ...gate.metadata,
              frequency: frequency,
              // 周波数変更時は開始時刻をリセット
              startTime: Date.now(),
            }
          };
        }
        return gate;
      });
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(updatedGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
  },

  createCustomGateFromCurrentCircuit: () => {
    const state = useCircuitStore.getState();
    const { gates, wires } = state;
    
    // INPUTとOUTPUTゲートを抽出
    const inputGates = gates.filter(g => g.type === 'INPUT');
    const outputGates = gates.filter(g => g.type === 'OUTPUT');
    
    if (inputGates.length === 0 || outputGates.length === 0) {
      console.warn('Circuit must have at least one INPUT and one OUTPUT gate');
      alert('回路にはINPUTゲートとOUTPUTゲートが必要です');
      return;
    }
    
    // ピン情報を作成
    const inputPins: CustomGatePin[] = inputGates.map((gate, index) => ({
      name: String.fromCharCode(65 + index), // A, B, C...
      index,
      gateId: gate.id  // 元のゲートIDを保持
    }));
    
    const outputPins: CustomGatePin[] = outputGates.map((gate, index) => ({
      name: index === 0 ? 'Y' : `O${index}`, // Y, O1, O2...
      index,
      gateId: gate.id  // 元のゲートIDを保持
    }));
    
    // ダイアログを表示するためのイベントを発生させる
    const event = new CustomEvent('open-custom-gate-dialog', {
      detail: { 
        initialInputs: inputPins, 
        initialOutputs: outputPins,
        isFullCircuit: true  // 全回路からの作成であることを示す
      },
    });
    window.dispatchEvent(event);
  },
  
  // 履歴管理（内部用）
  pushHistory: () => {
    const state = get();
    const currentState = { gates: state.gates, wires: state.wires };
    
    // 現在の位置より後の履歴を削除（新しい分岐を作成）
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(currentState);
    
    // 履歴の最大サイズを制限（メモリ節約）
    const MAX_HISTORY_SIZE = 50;
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
  
  // Undo/Redo/Clear
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const historicalState = state.history[newIndex];
      
      // 履歴から復元する際も入力値の形式を統一
      const normalizedGates = historicalState.gates.map(gate => ({
        ...gate,
        inputs: gate.inputs ? gate.inputs.map(input => 
          typeof input === 'boolean' ? booleanToDisplayState(input) : input
        ) : []
      }));
      
      set({
        gates: normalizedGates,
        wires: historicalState.wires,
        historyIndex: newIndex,
        selectedGateId: null,
        isDrawingWire: false,
        wireStart: null
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const historicalState = state.history[newIndex];
      
      // 履歴から復元する際も入力値の形式を統一
      const normalizedGates = historicalState.gates.map(gate => ({
        ...gate,
        inputs: gate.inputs ? gate.inputs.map(input => 
          typeof input === 'boolean' ? booleanToDisplayState(input) : input
        ) : []
      }));
      
      set({
        gates: normalizedGates,
        wires: historicalState.wires,
        historyIndex: newIndex,
        selectedGateId: null,
        isDrawingWire: false,
        wireStart: null
      });
    }
  },
  
  clearAll: () => {
    set({
      gates: [],
      wires: [],
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null
    });
    
    // clearAllも履歴に追加
    get().pushHistory();
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  // Copy/Paste
  copySelection: () => {
    const state = get();
    const selectedGates = state.gates.filter(g => state.selectedGateIds.includes(g.id));
    
    if (selectedGates.length === 0) return;
    
    // 選択されたゲート間のワイヤーのみをコピー
    const selectedGateIds = new Set(state.selectedGateIds);
    const internalWires = state.wires.filter(w => 
      selectedGateIds.has(w.from.gateId) && selectedGateIds.has(w.to.gateId)
    );
    
    // 境界ボックスを計算
    const xs = selectedGates.map(g => g.position.x);
    const ys = selectedGates.map(g => g.position.y);
    const bounds = {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
    
    set({
      clipboard: {
        gates: selectedGates.map(g => ({ 
          ...g,
          // コピー時に入力値の形式を統一
          inputs: g.inputs ? g.inputs.map(input => 
            typeof input === 'boolean' ? booleanToDisplayState(input) : input
          ) : []
        })), // ディープコピー
        wires: internalWires.map(w => ({ ...w })), // ディープコピー
        bounds
      }
    });
  },
  
  paste: (position) => {
    const state = get();
    if (!state.clipboard || state.clipboard.gates.length === 0) return;
    
    const { gates: clipboardGates, wires: clipboardWires, bounds } = state.clipboard;
    
    // クリップボードの中心を計算
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    // マウス位置へのオフセットを計算
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;
    
    // IDマッピング（古いID → 新しいID）
    const idMapping = new Map<string, string>();
    
    // 新しいゲートを作成
    const newGates = clipboardGates.map(gate => {
      const newId = IdGenerator.generateGateId();
      idMapping.set(gate.id, newId);
      
      // ペースト時に入力値の形式を統一
      const normalizedInputs = gate.inputs ? gate.inputs.map(input => 
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      ) : [];
      
      return {
        ...gate,
        id: newId,
        inputs: normalizedInputs,
        position: {
          x: gate.position.x + offsetX,
          y: gate.position.y + offsetY
        }
      };
    });
    
    // 新しいワイヤーを作成（内部接続のみ）
    const newWires = clipboardWires.map(wire => ({
      ...wire,
      id: IdGenerator.generateWireId(),
      from: {
        ...wire.from,
        gateId: idMapping.get(wire.from.gateId) || wire.from.gateId
      },
      to: {
        ...wire.to,
        gateId: idMapping.get(wire.to.gateId) || wire.to.gateId
      }
    }));
    
    // 状態を更新
    set(state => {
      const updatedGates = [...state.gates, ...newGates];
      const updatedWires = [...state.wires, ...newWires];
      
      // 回路を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(updatedGates, updatedWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        selectedGateIds: newGates.map(g => g.id), // ペーストしたゲートを選択
      };
    });
    
    // 履歴に追加
    get().pushHistory();
  },
  
  canPaste: () => get().clipboard !== null && (get().clipboard?.gates.length ?? 0) > 0,
  
  // アプリケーションモード管理
  setAppMode: (mode) => {
    set({ appMode: mode });
  },
  
  setAllowedGates: (gates) => {
    set({ allowedGates: gates });
  }
}));