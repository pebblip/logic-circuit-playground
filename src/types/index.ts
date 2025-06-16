// 既存の型定義のエクスポート
export * from './circuit';

// 新しい型定義のエクスポート
export * from './gates';

// 型の再エクスポート（便利なアクセスのため）
export type { Gate, Wire, Position, GateType, CircuitState } from './circuit';

export type {
  BasicGateType,
  IOGateType,
  SpecialGateType,
  AllGateType,
  ClockGate,
  DFlipFlopGate,
  SRLatchGate,
  MuxGate,
  BinaryCounterGate,
} from './gates';

// 定数のエクスポート
export { GATE_SIZES, PIN_CONFIGS } from './gates';

// 型ガード関数のエクスポート
export {
  isClockGate,
  isDFlipFlopGate,
  isSRLatchGate,
  isMuxGate,
  isBinaryCounterGate,
} from './gates';
