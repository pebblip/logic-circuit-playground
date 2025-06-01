// UltraModernCircuitWithViewModel specific types

import { ReactNode } from 'react';
import { Gate, Connection } from './circuit';

// ViewModel Gate type
export interface UltraModernGate {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: boolean;
  circuit?: any;
  inputs?: Array<{ id: string; name: string; value?: boolean }>;
  outputs?: Array<{ id: string; name: string; value?: boolean }>;
  selected?: boolean;
}

// ViewModel Connection type
export interface UltraModernConnection extends Connection {
  id: string;
  from: string;
  fromOutput: number;
  to: string;
  toInput: number;
  isActive?: boolean;
}

// Gate type configuration
export interface GateTypeConfig {
  name: string;
  icon: (isActive: boolean) => ReactNode;
}

// Theme configuration (extended)
export interface UltraModernTheme {
  selectedTheme: string;
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

// Tutorial state
export interface TutorialState {
  isOpen: boolean;
  currentStep: number;
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

// Challenge state
export interface ChallengeState {
  isActive: boolean;
  currentChallenge: any | null;
  showList: boolean;
}

// Canvas viewport
export interface Viewport {
  offsetX: number;
  offsetY: number;
  scale: number;
}

// Tool types
export type ToolType = 'select' | 'pan' | 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | string;

// User mode
export type UserMode = 'learning' | 'sandbox' | null;