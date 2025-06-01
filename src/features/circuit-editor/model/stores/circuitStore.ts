import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CircuitViewModel } from '../CircuitViewModel';
import { GateData, Connection } from '../../../../entities/types';
import { AppMode } from '../../../../entities/types/mode';
import { BaseGate } from '../../../../entities/gates/BaseGate';

interface CircuitState {
  // ViewModelインスタンス（既存を活用）
  viewModel: CircuitViewModel;
  
  // 状態
  gates: GateData[];
  connections: Connection[];
  selectedGateId: string | null;
  mode: AppMode;
  
  // アクション
  addGate: (gate: GateData) => void;
  connectPins: (sourcePin: string, targetPin: string) => void;
  deleteSelection: () => void;
  setSelectedGate: (gateId: string | null) => void;
  toggleInputGate: (gateId: string) => void;
  moveGate: (gateId: string, x: number, y: number) => void;
  setMode: (mode: AppMode) => void;
  syncFromViewModel: () => void;
}

export const useCircuitStore = create<CircuitState>()(
  immer((set, get) => {
    const viewModel = new CircuitViewModel();
    
    // ViewModelのイベントをストアの状態に同期
    viewModel.on('gatesChanged', () => {
      get().syncFromViewModel();
    });
    
    viewModel.on('connectionsChanged', () => {
      get().syncFromViewModel();
    });
    
    viewModel.on('selectionChanged', (gateId) => {
      set(state => {
        state.selectedGateId = gateId;
      });
    });
    
    return {
      viewModel,
      gates: [],
      connections: [],
      selectedGateId: null,
      mode: 'learning' as AppMode,
      
      addGate: (gate) => {
        const { viewModel } = get();
        viewModel.addGate(gate);
      },
      
      connectPins: (sourcePin, targetPin) => {
        const { viewModel } = get();
        const success = viewModel.connectPins(sourcePin, targetPin);
        if (!success) {
          console.warn('Failed to connect pins');
        }
      },
      
      deleteSelection: () => {
        const { viewModel, selectedGateId } = get();
        if (selectedGateId) {
          viewModel.removeGate(selectedGateId);
        }
      },
      
      setSelectedGate: (gateId) => {
        const { viewModel } = get();
        viewModel.setSelectedGate(gateId);
      },
      
      toggleInputGate: (gateId) => {
        const { viewModel } = get();
        viewModel.toggleInputGate(gateId);
      },
      
      moveGate: (gateId, x, y) => {
        const { viewModel } = get();
        viewModel.moveGate(gateId, x, y);
      },
      
      setMode: (mode) => set(state => {
        state.mode = mode;
      }),
      
      syncFromViewModel: () => set(state => {
        const { viewModel } = get();
        state.gates = viewModel.getGates();
        state.connections = viewModel.getConnections();
      })
    };
  })
);