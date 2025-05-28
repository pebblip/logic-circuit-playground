// Circuit related types

export interface Gate {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: boolean;
  circuit?: any; // For custom gates
  inputs?: any[];
  outputs?: any[];
  selected?: boolean;
}

export interface Connection {
  id: string;
  from: string;
  fromOutput: number;
  to: string;
  toInput: number;
  isActive?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  gateId: string | null;
}

export interface ConnectionDrawingState {
  isDrawing: boolean;
  fromGate: string | null;
  fromOutput: number;
  toPoint: Point;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gates: Gate[];
  connections: Connection[];
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

export interface TutorialStep {
  title: string;
  content: string;
  action?: string;
  targetGate?: string;
  highlight?: string;
  requiredGates?: string[];
  requiredConnections?: number;
}

export interface CustomGateDefinition {
  name: string;
  inputs: Array<{ id: string; label?: string }>;
  outputs: Array<{ id: string; label?: string }>;
  gates?: Gate[];
  connections?: Connection[];
  circuit?: any;
}

export interface SimulationResult {
  [gateId: string]: boolean | boolean[];
}