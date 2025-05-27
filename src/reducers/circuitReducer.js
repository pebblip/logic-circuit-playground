// 回路の状態管理用リデューサー

import { createGate } from '../utils/circuit';

// アクションタイプ
export const ACTIONS = {
  ADD_GATE: 'ADD_GATE',
  REMOVE_GATE: 'REMOVE_GATE',
  DELETE_GATE: 'DELETE_GATE',
  MOVE_GATE: 'MOVE_GATE',
  UPDATE_GATE: 'UPDATE_GATE',
  UPDATE_GATE_VALUE: 'UPDATE_GATE_VALUE',
  UPDATE_GATES_BATCH: 'UPDATE_GATES_BATCH',
  SET_GATES: 'SET_GATES',
  
  ADD_CONNECTION: 'ADD_CONNECTION',
  REMOVE_CONNECTION: 'REMOVE_CONNECTION',
  DELETE_CONNECTION: 'DELETE_CONNECTION',
  SET_CONNECTIONS: 'SET_CONNECTIONS',
  
  SET_SELECTED_GATE: 'SET_SELECTED_GATE',
  SELECT_GATE: 'SELECT_GATE',
  SET_CURRENT_LEVEL: 'SET_CURRENT_LEVEL',
  UNLOCK_LEVEL: 'UNLOCK_LEVEL',
  LEVEL_UP: 'LEVEL_UP',
  
  SAVE_CIRCUIT: 'SAVE_CIRCUIT',
  LOAD_CIRCUIT: 'LOAD_CIRCUIT',
  CLEAR_CIRCUIT: 'CLEAR_CIRCUIT',
  
  RESET: 'RESET'
};

// 初期状態
export const initialState = {
  gates: [],
  connections: [],
  selectedGate: null,
  currentLevel: 1,
  unlockedLevels: { 1: true, 2: true, 3: true }, // レベル3までアンロック
  savedCircuits: []
};

/**
 * 回路状態管理用リデューサー
 */
export const circuitReducer = (state, action) => {
  switch (action.type) {
    // ゲート関連
    case ACTIONS.ADD_GATE: {
      const { type, x, y, clockSignal } = action.payload;
      const newGate = createGate(type, x, y, clockSignal);
      if (!newGate) return state;
      
      return {
        ...state,
        gates: [...state.gates, newGate]
      };
    }
    
    case ACTIONS.REMOVE_GATE: 
    case ACTIONS.DELETE_GATE: {
      const gateId = typeof action.payload === 'string' ? action.payload : action.payload.gateId;
      return {
        ...state,
        gates: state.gates.filter(g => g.id !== gateId),
        connections: state.connections.filter(c => 
          c.from !== gateId && c.to !== gateId
        ),
        selectedGate: state.selectedGate?.id === gateId ? null : state.selectedGate
      };
    }
    
    case ACTIONS.MOVE_GATE: {
      const { gateId, x, y } = action.payload;
      return {
        ...state,
        gates: state.gates.map(gate => 
          gate.id === gateId ? { ...gate, x, y } : gate
        )
      };
    }
    
    case ACTIONS.UPDATE_GATE: {
      const { id, updates } = action.payload;
      return {
        ...state,
        gates: state.gates.map(gate => 
          gate.id === id ? { ...gate, ...updates } : gate
        )
      };
    }
    
    case ACTIONS.UPDATE_GATE_VALUE: {
      const { gateId, value } = action.payload;
      return {
        ...state,
        gates: state.gates.map(gate => 
          gate.id === gateId ? { ...gate, value } : gate
        )
      };
    }
    
    case ACTIONS.UPDATE_GATES_BATCH: {
      const { updates } = action.payload;
      return {
        ...state,
        gates: state.gates.map(gate => {
          const update = updates.find(u => u.id === gate.id);
          return update ? { ...gate, ...update } : gate;
        })
      };
    }
    
    case ACTIONS.SET_GATES: {
      return {
        ...state,
        gates: action.payload
      };
    }
    
    // 接続関連
    case ACTIONS.ADD_CONNECTION: {
      const connection = action.payload;
      
      // 既存の接続をチェック（同じ入力端子への接続を防ぐ）
      const existingConnectionIndex = state.connections.findIndex(c => 
        c.to === connection.to && 
        c.toTerminal === connection.toTerminal // toTerminalが完全一致の場合のみ置き換え
      );
      
      // 既存の接続がある場合は置き換える
      if (existingConnectionIndex !== -1) {
        const newConnections = [...state.connections];
        newConnections[existingConnectionIndex] = connection;
        return {
          ...state,
          connections: newConnections
        };
      }
      
      // 新しい接続を追加
      return {
        ...state,
        connections: [...state.connections, connection]
      };
    }
    
    case ACTIONS.REMOVE_CONNECTION: 
    case ACTIONS.DELETE_CONNECTION: {
      const connectionId = action.payload;
      // indexかIDで削除をサポート
      if (typeof connectionId === 'number') {
        return {
          ...state,
          connections: state.connections.filter((_, i) => i !== connectionId)
        };
      } else {
        return {
          ...state,
          connections: state.connections.filter(c => c.id !== connectionId)
        };
      }
    }
    
    case ACTIONS.SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.payload
      };
    }
    
    // 選択関連
    case ACTIONS.SET_SELECTED_GATE:
    case ACTIONS.SELECT_GATE: {
      const gate = action.payload;
      return {
        ...state,
        selectedGate: gate,
        gates: state.gates.map(g => ({
          ...g,
          selected: g.id === gate?.id
        }))
      };
    }
    
    // レベル関連
    case ACTIONS.SET_CURRENT_LEVEL: {
      return {
        ...state,
        currentLevel: action.payload
      };
    }
    
    case ACTIONS.UNLOCK_LEVEL: {
      const { level } = action.payload;
      return {
        ...state,
        unlockedLevels: {
          ...state.unlockedLevels,
          [level]: true
        }
      };
    }
    
    case ACTIONS.LEVEL_UP: {
      const nextLevel = state.currentLevel + 1;
      return {
        ...state,
        currentLevel: nextLevel,
        unlockedLevels: {
          ...state.unlockedLevels,
          [nextLevel]: true
        }
      };
    }
    
    case ACTIONS.CLEAR_CIRCUIT: {
      return {
        ...state,
        gates: [],
        connections: [],
        selectedGate: null
      };
    }
    
    // 保存/読み込み
    case ACTIONS.SAVE_CIRCUIT: {
      const { name } = action.payload;
      const circuit = {
        id: Date.now(),
        name,
        gates: [...state.gates],
        connections: [...state.connections],
        level: state.currentLevel
      };
      
      return {
        ...state,
        savedCircuits: [...state.savedCircuits, circuit]
      };
    }
    
    case ACTIONS.LOAD_CIRCUIT: {
      const { circuit } = action.payload;
      return {
        ...state,
        gates: circuit.gates,
        connections: circuit.connections,
        selectedGate: null
      };
    }
    
    // リセット
    case ACTIONS.RESET: {
      return {
        ...initialState,
        currentLevel: state.currentLevel,
        unlockedLevels: state.unlockedLevels,
        savedCircuits: state.savedCircuits
      };
    }
    
    default:
      return state;
  }
};