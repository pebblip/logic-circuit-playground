// Types specific to UltraModernCircuitWithViewModel component

import { UltraModernGate, UltraModernConnection, UserMode } from './UltraModernTypes';

// Component state types
export interface ComponentState {
  selectedTool: string | null;
  draggedGate: string | null;
  dragOffset: { x: number; y: number } | null;
  isDraggingGate: boolean;
  drawingWire: DrawingWire | null;
  hoveredGate: string | null;
  showHelp: boolean;
  showSaveLoad: boolean;
  showGateDefinition: boolean;
  selectedTheme: string;
  userMode: UserMode;
  preferences: UserPreferences | null;
  showTutorial: boolean;
  showChallenge: boolean;
  showExtendedChallenge: boolean;
  showProgress: boolean;
  badges: string[];
  progress: Progress;
  customGates: Record<string, any>;
  showCustomGatePanel: boolean;
  selectedCustomGateDetail: string | null;
  debugMode: boolean;
  gates: UltraModernGate[];
  connections: UltraModernConnection[];
  simulationResults: Record<string, boolean | boolean[]>;
}

export interface DrawingWire {
  fromGate: string;
  fromOutput: number;
  toPoint: { x: number; y: number };
}

export interface UserPreferences {
  mode: string | null;
  theme: string;
  tutorialCompleted: boolean;
  showTutorialOnStartup: boolean;
}

export interface Progress {
  'basics-learn-gates': boolean;
  'basics-first-connection': boolean;
  'basics-first-simulation': boolean;
  'basics-and-gate': boolean;
  'basics-or-gate': boolean;
  'basics-not-gate': boolean;
  'constructions-xor': boolean;
  'constructions-multiplexer': boolean;
  'applications-half-adder': boolean;
  'applications-decoder': boolean;
}

// Theme types
export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    canvas: {
      bg: string;
      grid: string;
      border: string;
    };
    gate: {
      bg: string;
      border: string;
      text: string;
      activeBg: string;
      activeBorder: string;
      activeText: string;
    };
    connection: {
      line: string;
      active: string;
      selected: string;
    };
    ui: {
      primary: string;
      secondary: string;
      accent: string;
      buttonBg: string;
      buttonHover: string;
      border: string;
    };
    signal: {
      flow: string;
    };
  };
}

// Tutorial system props
export interface TutorialSystemProps {
  gates: UltraModernGate[];
  connections: UltraModernConnection[];
  onComplete: () => void;
  onClose: () => void;
  currentObjective?: string;
  onAddGate: (type: string, x: number, y: number) => void;
  onConnect: (from: string, fromOutput: number, to: string, toInput: number) => void;
  onToggleInput: (gateId: string) => void;
}

// Challenge system props
export interface ChallengeSystemProps {
  gates: UltraModernGate[];
  connections: UltraModernConnection[];
  onClose: () => void;
  onAddGate: (type: string, x: number, y: number) => void;
  onConnect: (from: string, fromOutput: number, to: string, toInput: number) => void;
  onToggleInput: (gateId: string) => void;
  onClearCircuit: () => void;
}

// Progress tracker props
export interface ProgressTrackerProps {
  progress: Progress;
  badges: string[];
  onClose: () => void;
  currentLevel: number;
}

// Canvas event handlers
export interface CanvasEventHandlers {
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: (e: React.MouseEvent<SVGSVGElement>) => void;
  onWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

// Gate event handlers
export interface GateEventHandlers {
  onMouseDown: (e: React.MouseEvent, gateId: string) => void;
  onDoubleClick: (gateId: string) => void;
  onContextMenu: (e: React.MouseEvent, gateId: string) => void;
  onMouseEnter: (gateId: string) => void;
  onMouseLeave: () => void;
}

// Wire event handlers
export interface WireEventHandlers {
  onStartWire: (gateId: string, outputIndex: number, e: React.MouseEvent) => void;
  onEndWire: (gateId: string, inputIndex: number) => void;
  onCancelWire: () => void;
}