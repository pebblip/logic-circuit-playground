/**
 * 共通の型定義
 */

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  position: Position;
  size: Size;
}

export type ID = string;

export enum PinType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export interface Pin {
  id: ID;
  name: string;
  type: PinType;
  position: Position;
  value: boolean;
}