/**
 * イベント駆動シミュレーションエンジンのエクスポート
 */

export { EventDrivenEngine } from './EventDrivenEngine';
export type { EventDrivenConfig } from './EventDrivenEngine';

// 既存のevent-driven-minimalからの再エクスポート（互換性のため）
export { EventQueue } from '../event-driven-minimal/EventQueue';
export type {
  SimTime,
  GateEvent,
  GateState,
  CircuitState,
  SimulationConfig,
  SimulationResult,
  DebugTrace,
} from '../event-driven-minimal/types';
