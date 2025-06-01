import { ReactNode } from 'react';

// Gate icon configuration
export interface GateIconConfig {
  name: string;
  icon: (isActive: boolean) => ReactNode;
}

// Theme configuration
export interface Theme {
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

// Challenge configuration
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gates: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    value?: boolean;
  }>;
  connections: Array<{
    id: string;
    from: string;
    to: string;
    fromOutput: number;
    toInput: number;
  }>;
  truthTable: {
    inputs: string[];
    outputs: string[];
    rows: Array<{
      inputs: boolean[];
      outputs: boolean[];
    }>;
  };
  hint?: string;
}

// Tutorial content
export interface TutorialContent {
  steps: Array<{
    title: string;
    content: string;
    action?: string;
    targetGate?: string;
    highlight?: string;
    requiredGates?: string[];
    requiredConnections?: number;
  }>;
}

// Props interfaces
export interface ModeSelectorProps {
  onModeSelected: (mode: 'learning' | 'sandbox') => void;
}

export interface SaveLoadPanelProps {
  currentCircuit: any;
  onLoad: (circuitData: any) => void;
  onClose: () => void;
}

export interface GateDefinitionDialogProps {
  gates: any[];
  connections: any[];
  onSave: (gateDefinition: any) => void;
  onClose: () => void;
}

export interface CustomGateDetailProps {
  gateName: string;
  onClose: () => void;
}

export interface TutorialPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  step: number;
  totalSteps: number;
  content: string;
  title: string;
  action?: string;
  progress: number;
}

export interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onClose: () => void;
}

export interface TruthTableChallengeProps {
  challenge: Challenge;
  gates: any[];
  connections: any[];
  onComplete: () => void;
  onSkip: () => void;
}

// Drag state
export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  gateId: string | null;
}

// Connection drawing state
export interface ConnectionDrawingState {
  isDrawing: boolean;
  fromGate: string | null;
  fromOutput: number;
  toPoint: { x: number; y: number };
}