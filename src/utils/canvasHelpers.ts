// Canvas helper functions for UltraModernCircuitWithViewModel

import { UltraModernGate, Point } from '../types/UltraModernTypes';

export interface BezierPath {
  path: string;
  midX: number;
  midY: number;
}

/**
 * Create a smooth bezier path between two points
 */
export const createBezierPath = (x1: number, y1: number, x2: number, y2: number): BezierPath => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset based on distance
  const controlOffset = Math.min(distance * 0.5, 100);
  
  // Bias towards horizontal connections
  const horizontalBias = 0.8;
  const verticalBias = 1 - horizontalBias;
  
  const cp1x = x1 + controlOffset * horizontalBias;
  const cp1y = y1 + (dy * 0.2) * verticalBias;
  const cp2x = x2 - controlOffset * horizontalBias;
  const cp2y = y2 - (dy * 0.2) * verticalBias;
  
  // Calculate midpoint for connection click detection
  const t = 0.5;
  const midX = (1-t)*(1-t)*(1-t)*x1 + 3*(1-t)*(1-t)*t*cp1x + 3*(1-t)*t*t*cp2x + t*t*t*x2;
  const midY = (1-t)*(1-t)*(1-t)*y1 + 3*(1-t)*(1-t)*t*cp1y + 3*(1-t)*t*t*cp2y + t*t*t*y2;
  
  return {
    path: `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`,
    midX,
    midY
  };
};

/**
 * Get gate output position
 */
export const getGateOutputPosition = (gate: UltraModernGate, outputIndex: number = 0): Point => {
  const outputCount = gate.outputs?.length || 1;
  const spacing = 30 / (outputCount + 1);
  const offset = spacing * (outputIndex + 1) - 15;
  
  return {
    x: gate.x + 30,
    y: gate.y + offset
  };
};

/**
 * Get gate input position
 */
export const getGateInputPosition = (gate: UltraModernGate, inputIndex: number = 0): Point => {
  const inputCount = gate.inputs?.length || 1;
  const spacing = 30 / (inputCount + 1);
  const offset = spacing * (inputIndex + 1) - 15;
  
  return {
    x: gate.x - 30,
    y: gate.y + offset
  };
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInRect = (
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

/**
 * Get canvas coordinates from mouse event
 */
export const getCanvasCoordinates = (
  e: React.MouseEvent,
  canvasRef: React.RefObject<SVGSVGElement>,
  viewport: { offsetX: number; offsetY: number; scale: number }
): Point => {
  if (!canvasRef.current) return { x: 0, y: 0 };
  
  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left - viewport.offsetX) / viewport.scale;
  const y = (e.clientY - rect.top - viewport.offsetY) / viewport.scale;
  
  return { x, y };
};

/**
 * Calculate selection box from two points
 */
export const calculateSelectionBox = (
  startPoint: Point,
  endPoint: Point
): { x: number; y: number; width: number; height: number } => {
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  
  return { x, y, width, height };
};