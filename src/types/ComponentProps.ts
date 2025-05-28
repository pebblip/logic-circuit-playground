import { ReactNode } from 'react';
import { Gate, Connection, Challenge, CustomGateDefinition } from './CircuitTypes';
import { Theme } from './ComponentTypes';

// Save/Load Panel
export interface SaveLoadPanelProps {
  currentCircuit: {
    gates: Gate[];
    connections: Connection[];
  };
  onLoad: (circuitData: any) => void;
  onClose: () => void;
}

// Gate Definition Dialog
export interface GateDefinitionDialogProps {
  gates: Gate[];
  connections: Connection[];
  onSave: (gateDefinition: CustomGateDefinition) => void;
  onClose: () => void;
}

// Custom Gate Detail
export interface CustomGateDetailProps {
  gateName: string;
  onClose: () => void;
}

// Tutorial Panel
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

// Challenge List
export interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onClose: () => void;
}

// Truth Table Challenge
export interface TruthTableChallengeProps {
  challenge: Challenge;
  gates: Gate[];
  connections: Connection[];
  onComplete: () => void;
  onSkip: () => void;
}

// Badge Display
export interface BadgeDisplayProps {
  badges: string[];
  onClose: () => void;
}

// Gate Renderer
export interface GateRendererProps {
  gate: Gate;
  isSelected: boolean;
  isDragging: boolean;
  theme: Theme;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

// Connection Renderer
export interface ConnectionRendererProps {
  connection: Connection;
  fromGate: Gate;
  toGate: Gate;
  isActive: boolean;
  theme: Theme;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}