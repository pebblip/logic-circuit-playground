import React from 'react';
import type { Gate } from '@/types/circuit';
import { LEDGateRenderer } from './LEDGateRenderer';
import {
  ClockGateRenderer,
  DFFGateRenderer,
  SRLatchGateRenderer,
  MuxGateRenderer,
  BinaryCounterGateRenderer,
} from './special-gates';

interface SpecialGateRendererProps {
  gate: Gate;
  isSelected: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handlePinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
  handleGateClick: (event: React.MouseEvent) => void;
}

// レンダラーコンポーネントの型定義
type RendererComponent = React.FC<SpecialGateRendererProps>;

// ゲートタイプごとのレンダラーマップ（オブジェクト指向パターン）
const SPECIAL_GATE_RENDERERS: Record<string, RendererComponent> = {
  CLOCK: ClockGateRenderer,
  'D-FF': DFFGateRenderer,
  'SR-LATCH': SRLatchGateRenderer,
  MUX: MuxGateRenderer,
  BINARY_COUNTER: BinaryCounterGateRenderer,
  LED: LEDGateRenderer,
};

export const SpecialGateRenderer: React.FC<
  SpecialGateRendererProps
> = props => {
  const Renderer = SPECIAL_GATE_RENDERERS[props.gate.type];

  if (!Renderer) {
    console.warn(`Unknown special gate type: ${props.gate.type}`);
    return null;
  }

  return <Renderer {...props} />;
};
