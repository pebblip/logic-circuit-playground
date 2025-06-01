import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { BaseGate, GateType } from '../../entities/gates/BaseGate';
import { GateFactory } from '../../entities/gates/GateFactory';
import { Pin } from '../../entities/circuit/Pin';
import { GatePlacement, Position } from '../services/GatePlacement';
import { CollisionDetector } from '../services/CollisionDetector';
import { ConnectionValidator } from '../services/ConnectionValidator';

export interface Connection {
  id: string;
  fromGateId: string;
  fromPinIndex: number;
  toGateId: string;
  toPinIndex: number;
}

export interface CircuitState {
  // 状態
  gates: BaseGate[];
  connections: Connection[];
  selectedGateId: string | null;
  isSimulating: boolean;
  
  // UI状態
  isDragging: boolean;
  draggedGateId: string | null;
  drawingConnection: {
    fromGateId: string;
    fromPinIndex: number;
    fromPinType: 'input' | 'output';
    currentPosition?: Position;
    connectablePins?: Map<string, number[]>; // gateId -> connectablePinIndexes
  } | null;
  
  // 接続関連の状態
  hoveredPinId: string | null;
  lastConnectionError: string | null;
  
  // サービス
  gatePlacement: GatePlacement;
  collisionDetector: CollisionDetector;
  connectionValidator: ConnectionValidator;
}

export interface CircuitActions {
  // ゲート操作
  addGate: (type: GateType, position?: Position) => BaseGate;
  removeGate: (gateId: string) => void;
  moveGate: (gateId: string, position: Position) => void;
  selectGate: (gateId: string | null) => void;
  duplicateGate: (gateId: string) => BaseGate | null;
  
  // 接続操作（高品質版）
  startConnection: (gateId: string, pinIndex: number, pinType: 'input' | 'output') => boolean;
  updateConnectionPosition: (position: Position) => void;
  completeConnection: (toGateId: string, toPinIndex: number) => boolean;
  cancelConnection: () => void;
  removeConnection: (connectionId: string) => void;
  
  // ピンインタラクション
  setHoveredPin: (pinId: string | null) => void;
  isValidConnectionTarget: (gateId: string, pinIndex: number) => boolean;
  getConnectablePins: (gateId: string) => number[];
  
  // ドラッグ操作
  startDrag: (gateId: string) => void;
  endDrag: () => void;
  
  // シミュレーション
  startSimulation: () => void;
  stopSimulation: () => void;
  updateSimulation: () => void;
  
  // エラーハンドリング
  clearConnectionError: () => void;
  getLastError: () => string | null;
  
  // ユーティリティ
  getGateById: (gateId: string) => BaseGate | undefined;
  getSelectedGate: () => BaseGate | null;
  clearAll: () => void;
  getConnectionStats: () => ReturnType<ConnectionValidator['getConnectionStats']>;
  
  // 設定更新
  updateCanvasSize: (width: number, height: number) => void;
}

export type CircuitStore = CircuitState & CircuitActions;

const initialState: CircuitState = {
  gates: [],
  connections: [],
  selectedGateId: null,
  isSimulating: false,
  isDragging: false,
  draggedGateId: null,
  drawingConnection: null,
  hoveredPinId: null,
  lastConnectionError: null,
  gatePlacement: new GatePlacement(),
  collisionDetector: CollisionDetector.getInstance(),
  connectionValidator: ConnectionValidator.getInstance()
};

export const useCircuitStore = create<CircuitStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ゲート操作
      addGate: (type: GateType, position?: Position) => {
        const state = get();
        const placement = position || state.gatePlacement.calculateOptimalPosition(state.gates);
        const gate = GateFactory.create(type, placement);
        
        // デバッグ: ゲートの状態を確認
        console.log('[circuitStore] Created gate:', {
          id: gate.id,
          type: gate.type,
          hasInputPins: !!gate.inputPins,
          hasOutputPins: !!gate.outputPins,
          inputPinsLength: gate.inputPins?.length,
          outputPinsLength: gate.outputPins?.length,
          _inputs: (gate as any)._inputs?.length,
          _outputs: (gate as any)._outputs?.length
        });
        
        // immerのdraftに直接追加せず、新しい配列を作成
        set((state) => ({
          gates: [...state.gates, gate],
          selectedGateId: gate.id
        }));
        
        return gate;
      },

      removeGate: (gateId: string) => {
        set((draft) => {
          // ゲートを削除
          draft.gates = draft.gates.filter(g => g.id !== gateId);
          
          // 関連する接続を削除
          draft.connections = draft.connections.filter(
            c => c.fromGateId !== gateId && c.toGateId !== gateId
          );
          
          // 選択中のゲートを解除
          if (draft.selectedGateId === gateId) {
            draft.selectedGateId = null;
          }
          
          // ドラッグ中のゲートを解除
          if (draft.draggedGateId === gateId) {
            draft.draggedGateId = null;
            draft.isDragging = false;
          }
        });
      },

      moveGate: (gateId: string, position: Position) => {
        const state = get();
        const adjustedPosition = state.gatePlacement.adjustDragPosition(
          position, 
          state.gates.filter(g => g.id !== gateId),
          gateId
        );
        
        set((draft) => {
          const gate = draft.gates.find(g => g.id === gateId);
          if (gate) {
            gate.position = adjustedPosition;
          }
        });
      },

      selectGate: (gateId: string | null) => {
        set((draft) => {
          draft.selectedGateId = gateId;
        });
      },

      duplicateGate: (gateId: string) => {
        const state = get();
        const originalGate = state.gates.find(g => g.id === gateId);
        if (!originalGate) return null;

        const newPosition = {
          x: originalGate.position.x + 120,
          y: originalGate.position.y
        };

        const newGate = GateFactory.create(originalGate.type, newPosition);
        
        set((draft) => {
          draft.gates.push(newGate);
          draft.selectedGateId = newGate.id;
        });
        
        return newGate;
      },

      // 接続操作（高品質版）
      startConnection: (gateId: string, pinIndex: number, pinType: 'input' | 'output') => {
        // 出力ピンからのみ接続開始可能
        if (pinType !== 'output') {
          set((draft) => {
            draft.lastConnectionError = '接続は出力ピンから開始してください';
          });
          return false;
        }

        const state = get();
        const gate = state.gates.find(g => g.id === gateId);
        if (!gate || pinIndex >= gate.outputPins.length) {
          set((draft) => {
            draft.lastConnectionError = '無効なピンです';
          });
          return false;
        }

        // 接続可能なピンを事前計算
        const connectablePins = new Map<string, number[]>();
        state.gates.forEach(targetGate => {
          if (targetGate.id === gateId) return; // 自分自身は除外
          
          const connectablePinIndexes = state.connectionValidator.getConnectablePins(
            gateId,
            pinIndex,
            targetGate,
            state.connections
          );
          
          if (connectablePinIndexes.length > 0) {
            connectablePins.set(targetGate.id, connectablePinIndexes);
          }
        });

        set((draft) => {
          draft.drawingConnection = {
            fromGateId: gateId,
            fromPinIndex: pinIndex,
            fromPinType: pinType,
            connectablePins
          };
          draft.lastConnectionError = null;
        });

        return true;
      },

      updateConnectionPosition: (position: Position) => {
        set((draft) => {
          if (draft.drawingConnection) {
            draft.drawingConnection.currentPosition = position;
          }
        });
      },

      completeConnection: (toGateId: string, toPinIndex: number) => {
        const state = get();
        const drawing = state.drawingConnection;
        if (!drawing) {
          set((draft) => {
            draft.lastConnectionError = '接続が開始されていません';
          });
          return false;
        }

        // ConnectionValidatorで厳密な妥当性チェック
        const validation = state.connectionValidator.validateConnection(
          drawing.fromGateId,
          drawing.fromPinIndex,
          toGateId,
          toPinIndex,
          state.gates,
          state.connections
        );

        if (!validation.isValid) {
          set((draft) => {
            draft.lastConnectionError = validation.reason || '接続できません';
          });
          return false;
        }

        // 接続可能かチェック（事前計算されたリストから）
        const connectablePins = drawing.connectablePins?.get(toGateId);
        if (!connectablePins || !connectablePins.includes(toPinIndex)) {
          set((draft) => {
            draft.lastConnectionError = 'このピンには接続できません';
          });
          return false;
        }

        // 接続ID生成
        const connectionId = `${drawing.fromGateId}-${drawing.fromPinIndex}-${toGateId}-${toPinIndex}`;
        
        set((draft) => {
          // 新しい接続を追加
          draft.connections.push({
            id: connectionId,
            fromGateId: drawing.fromGateId,
            fromPinIndex: drawing.fromPinIndex,
            toGateId,
            toPinIndex
          });
          
          // 接続完了
          draft.drawingConnection = null;
          draft.lastConnectionError = null;
          
          // シミュレーションが有効な場合は即座に更新
          if (draft.isSimulating) {
            // updateSimulation(); // 次のフレームで実行
          }
        });

        // 接続完了後にシミュレーション更新をトリガー
        if (state.isSimulating) {
          setTimeout(() => get().updateSimulation(), 0);
        }

        return true;
      },

      cancelConnection: () => {
        set((draft) => {
          draft.drawingConnection = null;
        });
      },

      removeConnection: (connectionId: string) => {
        set((draft) => {
          draft.connections = draft.connections.filter(c => c.id !== connectionId);
          draft.lastConnectionError = null;
        });
        
        // シミュレーション中なら更新
        const state = get();
        if (state.isSimulating) {
          setTimeout(() => get().updateSimulation(), 0);
        }
      },

      // ピンインタラクション
      setHoveredPin: (pinId: string | null) => {
        set((draft) => {
          draft.hoveredPinId = pinId;
        });
      },

      isValidConnectionTarget: (gateId: string, pinIndex: number) => {
        const state = get();
        const drawing = state.drawingConnection;
        if (!drawing || !drawing.connectablePins) return false;
        
        const connectablePins = drawing.connectablePins.get(gateId);
        return connectablePins ? connectablePins.includes(pinIndex) : false;
      },

      getConnectablePins: (gateId: string) => {
        const state = get();
        const drawing = state.drawingConnection;
        if (!drawing || !drawing.connectablePins) return [];
        
        return drawing.connectablePins.get(gateId) || [];
      },

      // ドラッグ操作
      startDrag: (gateId: string) => {
        set((draft) => {
          draft.isDragging = true;
          draft.draggedGateId = gateId;
          draft.selectedGateId = gateId;
        });
      },

      endDrag: () => {
        set((draft) => {
          draft.isDragging = false;
          draft.draggedGateId = null;
        });
      },

      // シミュレーション
      startSimulation: () => {
        set((draft) => {
          draft.isSimulating = true;
        });
        get().updateSimulation();
      },

      stopSimulation: () => {
        set((draft) => {
          draft.isSimulating = false;
        });
      },

      updateSimulation: () => {
        const state = get();
        if (!state.isSimulating) return;

        // シミュレーションロジック
        const updatedGates = [...state.gates];
        
        // 接続情報を元に信号を伝播
        state.connections.forEach(connection => {
          const fromGate = updatedGates.find(g => g.id === connection.fromGateId);
          const toGate = updatedGates.find(g => g.id === connection.toGateId);
          
          if (fromGate && toGate) {
            const outputValue = fromGate.outputPins[connection.fromPinIndex]?.value ?? false;
            const inputPin = toGate.inputPins[connection.toPinIndex];
            if (inputPin) {
              inputPin.value = outputValue;
            }
          }
        });

        // 各ゲートの計算を実行
        updatedGates.forEach(gate => {
          gate.update();
        });

        set((draft) => {
          draft.gates = updatedGates;
        });
      },

      // エラーハンドリング
      clearConnectionError: () => {
        set((draft) => {
          draft.lastConnectionError = null;
        });
      },

      getLastError: () => {
        return get().lastConnectionError;
      },

      // ユーティリティ
      getGateById: (gateId: string) => {
        return get().gates.find(g => g.id === gateId);
      },

      getSelectedGate: () => {
        const state = get();
        return state.gates.find(g => g.id === state.selectedGateId) || null;
      },

      clearAll: () => {
        set((draft) => {
          draft.gates = [];
          draft.connections = [];
          draft.selectedGateId = null;
          draft.isDragging = false;
          draft.draggedGateId = null;
          draft.drawingConnection = null;
          draft.hoveredPinId = null;
          draft.lastConnectionError = null;
          draft.isSimulating = false;
        });
      },

      getConnectionStats: () => {
        const state = get();
        return state.connectionValidator.getConnectionStats(state.connections, state.gates);
      },

      updateCanvasSize: (width: number, height: number) => {
        set((draft) => {
          draft.gatePlacement = new GatePlacement({
            canvasWidth: width,
            canvasHeight: height
          });
        });
      }
    }))
  )
);

// シミュレーションループの設定
let simulationInterval: NodeJS.Timeout | null = null;

useCircuitStore.subscribe(
  state => state.isSimulating,
  (isSimulating) => {
    if (isSimulating && !simulationInterval) {
      simulationInterval = setInterval(() => {
        useCircuitStore.getState().updateSimulation();
      }, 100); // 10 FPS
    } else if (!isSimulating && simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  }
);