import React, { createContext, useContext, ReactNode } from 'react';
import { AppMode, MODE_CONFIGS, ModeFeatures } from '../../../entities/types/mode';

interface CircuitModeContextValue {
  mode: AppMode;
  features: ModeFeatures;
}

const CircuitModeContext = createContext<CircuitModeContextValue | null>(null);

interface CircuitModeProviderProps {
  mode: AppMode;
  children: ReactNode;
}

export const CircuitModeProvider: React.FC<CircuitModeProviderProps> = ({ mode, children }) => {
  const features = MODE_CONFIGS[mode].features || {
    availableGates: [],
    allowCustomGates: false,
    showHints: false,
    trackDiscoveries: false,
  };

  return (
    <CircuitModeContext.Provider value={{ mode, features }}>
      {children}
    </CircuitModeContext.Provider>
  );
};

export const useCircuitMode = () => {
  const context = useContext(CircuitModeContext);
  if (!context) {
    throw new Error('useCircuitMode must be used within CircuitModeProvider');
  }
  return context;
};