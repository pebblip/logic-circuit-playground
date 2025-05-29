export interface UltraModernGate {
  id: string;
  type: string;
  x: number;
  y: number;
  inputs?: Array<{ id: string; name: string; value?: boolean }>;
  outputs?: Array<{ id: string; name: string; value?: boolean }>;
  value?: boolean;
}

export interface UltraModernConnection {
  id: string;
  from: string;
  fromOutput?: number;
  to: string;
  toInput?: number;
}

export interface Progress {
  'basics-learn-gates': boolean;
  'basics-first-connection': boolean;
  'basics-signal-flow': boolean;
  'basics-complete-circuit': boolean;
  'basics-truth-table': boolean;
  gatesPlaced: number;
  wiresConnected: number;
  challengesCompleted: number;
}

export interface Preferences {
  tutorialCompleted?: boolean;
  mode?: string | null;
}

export interface DrawingWire {
  from: string;
  fromOutput?: number;
  fromInput?: number;
  pinType?: 'input' | 'output';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DragOffset {
  x: number;
  y: number;
}

export interface CustomGateDefinition {
  name: string;
  inputs: Array<{ id: string; name: string }>;
  outputs: Array<{ id: string; name: string }>;
  circuit: {
    gates: UltraModernGate[];
    connections: UltraModernConnection[];
  };
}

export interface Theme {
  name: string;
  colors: {
    background: string;
    canvas: string;
    grid: string;
    gate: {
      bg: string;
      border: string;
      text: string;
      activeBg: string;
      activeBorder: string;
      activeText: string;
    };
    signal: {
      off: string;
      on: string;
      flow: string;
    };
    ui: {
      primary: string;
      secondary: string;
      accent: string;
      border: string;
      hover: string;
      buttonBg: string;
      buttonHover: string;
      buttonActive: string;
    };
  };
}

export interface GateType {
  name: string;
  icon: (isActive: boolean) => React.ReactNode;
  inputs?: number;
  outputs?: number;
  circuit?: any;
  isCustom?: boolean;
}

export interface SimulationResult {
  gateStates: Map<string, boolean[]>;
  timestamp: number;
}

export type SimulationResults = Record<string, boolean | boolean[]>;

export interface CircuitData {
  gates: UltraModernGate[];
  connections: UltraModernConnection[];
  customGates?: CustomGateDefinition[];
}

export type Gate = UltraModernGate;
export type Connection = UltraModernConnection;