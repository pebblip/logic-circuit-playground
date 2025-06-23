/**
 * ギャラリーモードの回路定義
 *
 * すべての回路を統一形式で管理
 */

import type { GalleryCircuit } from './types';

// 個別回路のエクスポート
export { MANDALA_CIRCUIT } from './mandala-circuit';
export { SELF_OSCILLATING_MEMORY_SIMPLE } from './self-oscillating-memory-simple';
export { SELF_OSCILLATING_MEMORY_IMPROVED } from './self-oscillating-memory-improved';
export { SELF_OSCILLATING_MEMORY_FINAL } from './self-oscillating-memory-final';
export { SIMPLE_RING_OSCILLATOR } from './simple-ring-oscillator';
export { SIMPLE_LFSR } from './simple-lfsr';
export { SR_LATCH_BASIC } from './sr-latch-circuit';
export { FIBONACCI_COUNTER } from './fibonacci-counter';
export { JOHNSON_COUNTER } from './johnson-counter';
export { CHAOS_GENERATOR } from './chaos-generator';
export { COMPARATOR_4BIT } from './comparator-circuit';
export { PARITY_CHECKER } from './parity-checker';
export { MAJORITY_VOTER } from './majority-voter';
export { SEVEN_SEGMENT_DECODER } from './seven-segment';
export { BINARY_COUNTER_BASIC } from './binary-counter-basic';
export { SIMPLE_COUNTER } from './simple-counter';
export { HALF_ADDER } from './half-adder';
export { DECODER_2TO4 } from './decoder';

// TODO: これらは後で個別ファイルに抽出
import { MANDALA_CIRCUIT } from './mandala-circuit';
import { SELF_OSCILLATING_MEMORY_SIMPLE } from './self-oscillating-memory-simple';
import { SELF_OSCILLATING_MEMORY_IMPROVED } from './self-oscillating-memory-improved';
import { SELF_OSCILLATING_MEMORY_FINAL } from './self-oscillating-memory-final';
import { SIMPLE_RING_OSCILLATOR } from './simple-ring-oscillator';
import { SIMPLE_LFSR } from './simple-lfsr';
import { SR_LATCH_BASIC } from './sr-latch-circuit';
import { FIBONACCI_COUNTER } from './fibonacci-counter';
import { JOHNSON_COUNTER } from './johnson-counter';
import { CHAOS_GENERATOR } from './chaos-generator';
import { COMPARATOR_4BIT } from './comparator-circuit';
import { PARITY_CHECKER } from './parity-checker';
import { MAJORITY_VOTER } from './majority-voter';
import { SEVEN_SEGMENT_DECODER } from './seven-segment';
import { HALF_ADDER } from './half-adder';
import { BINARY_COUNTER_BASIC } from './binary-counter-basic';
import { SIMPLE_COUNTER } from './simple-counter';
import { DECODER_2TO4 } from './decoder';

// ギャラリー回路マップ（useCanvasで使用）
export const GALLERY_CIRCUITS = {
  'half-adder': HALF_ADDER,
  decoder: DECODER_2TO4,
  'mandala-circuit': MANDALA_CIRCUIT,
  'self-oscillating-memory-simple': SELF_OSCILLATING_MEMORY_SIMPLE,
  'self-oscillating-memory-improved': SELF_OSCILLATING_MEMORY_IMPROVED,
  'self-oscillating-memory-final': SELF_OSCILLATING_MEMORY_FINAL,
  'simple-ring-oscillator': SIMPLE_RING_OSCILLATOR,
  'simple-lfsr': SIMPLE_LFSR,
  'sr-latch-basic': SR_LATCH_BASIC,
  'fibonacci-counter': FIBONACCI_COUNTER,
  'johnson-counter': JOHNSON_COUNTER,
  'chaos-generator': CHAOS_GENERATOR,
  '4bit-comparator': COMPARATOR_4BIT,
  'parity-checker': PARITY_CHECKER,
  'majority-voter': MAJORITY_VOTER,
  'seven-segment': SEVEN_SEGMENT_DECODER,
  'binary-counter-basic': BINARY_COUNTER_BASIC,
  'simple-counter': SIMPLE_COUNTER,
} as const;

// ギャラリー表示用の回路リスト（GalleryListPanelで使用）
export const FEATURED_CIRCUITS: GalleryCircuit[] = [
  // 基本回路
  HALF_ADDER,
  DECODER_2TO4,

  // 高度な組み合わせ回路
  COMPARATOR_4BIT,
  PARITY_CHECKER,
  MAJORITY_VOTER,
  SEVEN_SEGMENT_DECODER,

  // 循環回路
  SR_LATCH_BASIC,
  SIMPLE_RING_OSCILLATOR,
  SIMPLE_LFSR,
  CHAOS_GENERATOR,
  FIBONACCI_COUNTER,
  JOHNSON_COUNTER,
  SELF_OSCILLATING_MEMORY_SIMPLE,
  MANDALA_CIRCUIT,
];
