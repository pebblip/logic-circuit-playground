import { create } from 'zustand';
import { Gate, Wire, CircuitState, GateType, Position, CustomGateDefinition } from '../types/circuit';
import { evaluateCircuit } from '../utils/simulation';
import { GateFactory } from '../models/gates/GateFactory';

interface CircuitStore extends CircuitState {
  // カスタムゲート管理
  addCustomGate: (definition: CustomGateDefinition) => void;
  removeCustomGate: (id: string) => void;
  createCustomGateFromSelection: () => void;
  // 回路分析用の一時データ
  pendingCustomGateData?: {
    internalGates: Gate[];
    internalWires: Wire[];
    inputWires: Wire[];
    outputWires: Wire[];
  };
  
  // ゲート操作
  addGate: (type: GateType, position: Position) => Gate;
  moveGate: (gateId: string, position: Position) => void;
  selectGate: (gateId: string | null) => void;
  deleteGate: (gateId: string) => void;
  
  // 複数選択操作
  toggleGateSelection: (gateId: string) => void;
  selectGatesInArea: (area: { start: Position; end: Position }) => void;
  clearSelection: () => void;
  setSelectionMode: (mode: 'single' | 'multiple' | 'area') => void;
  startAreaSelection: (position: Position) => void;
  updateAreaSelection: (position: Position) => void;
  endAreaSelection: () => void;
  
  // ワイヤー操作
  startWireDrawing: (gateId: string, pinIndex: number) => void;
  endWireDrawing: (gateId: string, pinIndex: number) => void;
  cancelWireDrawing: () => void;
  deleteWire: (wireId: string) => void;
  
  // ゲートの状態更新
  updateGateOutput: (gateId: string, output: boolean) => void;
  updateClockFrequency: (gateId: string, frequency: number) => void;
}

export const useCircuitStore = create<CircuitStore>((set) => ({
  gates: [],
  wires: [],
  selectedGateId: null,
  selectedGateIds: new Set<string>(),
  isDrawingWire: false,
  wireStart: null,
  customGates: [],
  selectionMode: 'single',
  isAreaSelecting: false,
  selectionArea: null,

  addCustomGate: (definition) => {
    set((state) => ({
      customGates: [...state.customGates, definition]
    }));
  },

  removeCustomGate: (id) => {
    set((state) => ({
      customGates: state.customGates.filter(gate => gate.id !== id)
    }));
  },

  addGate: (type, position) => {
    // GateFactoryを使用してゲートを作成（特殊ゲートにも対応）
    const newGate = GateFactory.createGate(type, position);
    
    set((state) => {
      const newGates = [...state.gates, newGate];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
    
    return newGate;
  },

  moveGate: (gateId, position) => {
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
  },

  selectGate: (gateId) => {
    set({ selectedGateId: gateId });
  },

  deleteGate: (gateId) => {
    set((state) => {
      const newGates = state.gates.filter((gate) => gate.id !== gateId);
      const newWires = state.wires.filter(
        (wire) => wire.from.gateId !== gateId && wire.to.gateId !== gateId
      );
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        selectedGateId: state.selectedGateId === gateId ? null : state.selectedGateId,
      };
    });
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

      const newWire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  },

  updateGateOutput: (gateId, output) => {
    set((state) => {
      // まずINPUTゲートの状態を更新
      const updatedGates = state.gates.map((gate) =>
        gate.id === gateId ? { ...gate, output } : gate
      );
      
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

  // 複数選択関連の機能
  toggleGateSelection: (gateId) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedGateIds);
      if (newSelectedIds.has(gateId)) {
        newSelectedIds.delete(gateId);
      } else {
        newSelectedIds.add(gateId);
      }
      return { selectedGateIds: newSelectedIds };
    });
  },

  selectGatesInArea: (area) => {
    set((state) => {
      const minX = Math.min(area.start.x, area.end.x);
      const maxX = Math.max(area.start.x, area.end.x);
      const minY = Math.min(area.start.y, area.end.y);
      const maxY = Math.max(area.start.y, area.end.y);

      const selectedIds = new Set<string>();
      state.gates.forEach((gate) => {
        if (
          gate.position.x >= minX &&
          gate.position.x <= maxX &&
          gate.position.y >= minY &&
          gate.position.y <= maxY
        ) {
          selectedIds.add(gate.id);
        }
      });

      return { selectedGateIds: selectedIds };
    });
  },

  clearSelection: () => {
    set({ selectedGateIds: new Set(), selectedGateId: null });
  },

  setSelectionMode: (mode) => {
    set({ selectionMode: mode });
  },

  startAreaSelection: (position) => {
    set({
      isAreaSelecting: true,
      selectionArea: { start: position, end: position },
    });
  },

  updateAreaSelection: (position) => {
    set((state) => {
      if (state.selectionArea) {
        return {
          selectionArea: { ...state.selectionArea, end: position },
        };
      }
      return state;
    });
  },

  endAreaSelection: () => {
    const state = useCircuitStore.getState();
    if (state.selectionArea) {
      // エリア内のゲートを選択
      state.selectGatesInArea(state.selectionArea);
    }
    set({
      isAreaSelecting: false,
      selectionArea: null,
    });
  },

  createCustomGateFromSelection: () => {
    const state = useCircuitStore.getState();
    const selectedGates = state.gates.filter((g) => state.selectedGateIds.has(g.id));
    
    if (selectedGates.length === 0) {
      console.warn('No gates selected for custom gate creation');
      return;
    }

    // 選択されたゲートに関連するワイヤーを収集
    const selectedGateIdSet = new Set(selectedGates.map(g => g.id));
    const internalWires = state.wires.filter(
      (w) => selectedGateIdSet.has(w.from.gateId) && selectedGateIdSet.has(w.to.gateId)
    );

    // 境界を跨ぐワイヤーから入出力ピンを検出
    const inputWires = state.wires.filter(
      (w) => !selectedGateIdSet.has(w.from.gateId) && selectedGateIdSet.has(w.to.gateId)
    );
    const outputWires = state.wires.filter(
      (w) => selectedGateIdSet.has(w.from.gateId) && !selectedGateIdSet.has(w.to.gateId)
    );

    console.log('Creating custom gate from selection:', {
      selectedGates,
      internalWires,
      inputWires,
      outputWires,
    });

    // ピン情報を抽出
    const inputPins: CustomGatePin[] = inputWires.map((wire, index) => ({
      name: String.fromCharCode(65 + index), // A, B, C...
      index,
    }));
    
    const outputPins: CustomGatePin[] = outputWires.map((wire, index) => ({
      name: index === 0 ? 'Y' : `O${index}`, // Y, O1, O2...
      index,
    }));

    // 一時データを保存
    set({
      pendingCustomGateData: {
        internalGates: selectedGates,
        internalWires,
        inputWires,
        outputWires,
      },
    });

    // ダイアログを表示するためのイベントを発生させる
    // TODO: ToolPaletteコンポーネントに統合
    const event = new CustomEvent('open-custom-gate-dialog', {
      detail: { 
        initialInputs: inputPins, 
        initialOutputs: outputPins 
      },
    });
    window.dispatchEvent(event);
  },
}));