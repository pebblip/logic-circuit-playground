// 回路の状態管理用リデューサー

import { createGate } from '../utils/circuit';

// アクションタイプ
export const ACTIONS = {
  ADD_GATE: 'ADD_GATE',
  REMOVE_GATE: 'REMOVE_GATE',
  MOVE_GATE: 'MOVE_GATE',
  UPDATE_GATE_VALUE: 'UPDATE_GATE_VALUE',
  UPDATE_GATES_BATCH: 'UPDATE_GATES_BATCH',
  SET_GATES: 'SET_GATES',
  
  ADD_CONNECTION: 'ADD_CONNECTION',
  REMOVE_CONNECTION: 'REMOVE_CONNECTION',
  SET_CONNECTIONS: 'SET_CONNECTIONS',
  
  SET_SELECTED_GATE: 'SET_SELECTED_GATE',
  SET_CURRENT_LEVEL: 'SET_CURRENT_LEVEL',
  UNLOCK_LEVEL: 'UNLOCK_LEVEL',
  
  SAVE_CIRCUIT: 'SAVE_CIRCUIT',
  LOAD_CIRCUIT: 'LOAD_CIRCUIT',
  
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
    
    case ACTIONS.REMOVE_GATE: {
      const { gateId } = action.payload;
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
      const { from, fromOutput, to, toInput } = action.payload;
      
      // 既存の接続をチェック
      const existingConnection = state.connections.find(c => 
        c.to === to && c.toInput === toInput
      );
      
      if (existingConnection) return state;
      
      return {
        ...state,
        connections: [...state.connections, {
          from,
          fromOutput: fromOutput || 0,
          to,
          toInput
        }]
      };
    }
    
    case ACTIONS.REMOVE_CONNECTION: {
      const { index } = action.payload;
      return {
        ...state,
        connections: state.connections.filter((_, i) => i !== index)
      };
    }
    
    case ACTIONS.SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.payload
      };
    }
    
    // 選択関連
    case ACTIONS.SET_SELECTED_GATE: {
      return {
        ...state,
        selectedGate: action.payload
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