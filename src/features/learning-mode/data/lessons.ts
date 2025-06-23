// 論理回路マスターへの道 - 体系的学習カリキュラム
// 初学者から実用レベルまで、完全習得

import { digitalBasicsStructuredLesson } from './structured-lessons/digital-basics-lesson';
import { notGateStructuredLesson } from './structured-lessons/not-gate-lesson';
import { andGateStructuredLesson } from './structured-lessons/and-gate-lesson';
import { orGateStructuredLesson } from './structured-lessons/or-gate-lesson';
import { xorGateStructuredLesson } from './structured-lessons/xor-gate-lesson';
import { halfAdderStructuredLesson } from './structured-lessons/half-adder-lesson';
import { fullAdderStructuredLesson } from './structured-lessons/full-adder-lesson';
import { fourBitAdderStructuredLesson } from './structured-lessons/4bit-adder-lesson';
import { comparatorStructuredLesson } from './structured-lessons/comparator-lesson';
import { encoderStructuredLesson } from './structured-lessons/encoder-lesson';
import { decoderStructuredLesson } from './structured-lessons/decoder-lesson';
import { multiplexerStructuredLesson } from './structured-lessons/multiplexer-lesson';
import { aluBasicsStructuredLesson } from './structured-lessons/alu-basics-lesson';
import { dFlipFlopStructuredLesson } from './structured-lessons/d-flip-flop-lesson';
import { srLatchStructuredLesson } from './structured-lessons/sr-latch-lesson';
import { counterStructuredLesson } from './structured-lessons/counter-lesson';
import { registerStructuredLesson } from './structured-lessons/register-lesson';
import { shiftRegisterStructuredLesson } from './structured-lessons/shift-register-lesson';
import { clockSyncStructuredLesson } from './structured-lessons/clock-sync-lesson';
import { trafficLightStructuredLesson } from './structured-lessons/traffic-light-lesson';
import { digitalClockStructuredLesson } from './structured-lessons/digital-clock-lesson';
import { nandGateStructuredLesson } from './structured-lessons/nand-gate-lesson';
import { jkFlipFlopStructuredLesson } from './structured-lessons/jk-flip-flop-lesson';
import { sevenSegmentDisplayStructuredLesson } from './structured-lessons/seven-segment-display-lesson';

// 既存のインターフェース定義（後方互換性のため維持）
export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[];
  category: string;
  icon: string;
  steps: LessonStep[];
  verification?: CircuitVerification;
}

export interface LessonStep {
  id: string;
  instruction: string;
  hint?: string;
  action: StepAction;
  validation?: StepValidation;
}

export type StepAction =
  | {
      type: 'place-gate';
      gateType: string;
      position?: { x: number; y: number };
    }
  | { type: 'connect-wire'; from: string; to: string }
  | { type: 'toggle-input'; gateId: string; value: boolean }
  | { type: 'observe'; highlight?: string[] }
  | { type: 'quiz'; question: string; options: string[]; correct: number }
  | { type: 'explanation'; content: string; visual?: string };

export type StepValidation =
  | { type: 'gate-placed'; expected?: string } // gate type
  | { type: 'wire-connected'; expected?: { from: string; to: string } }
  | { type: 'output-matches'; expected?: { [key: string]: boolean } }
  | { type: 'quiz-answered'; expected?: string | number }
  | { type: 'circuit-complete'; expected?: unknown };

export interface CircuitVerification {
  inputs: { [key: string]: boolean }[];
  expectedOutputs: { [key: string]: boolean }[];
}

// 構造化レッスンの配列（IDはレッスンファイル内で定義済み）
const cleanLessons = [
  digitalBasicsStructuredLesson,
  notGateStructuredLesson,
  andGateStructuredLesson,
  orGateStructuredLesson,
  xorGateStructuredLesson,
  nandGateStructuredLesson, // 新規追加
  halfAdderStructuredLesson,
  fullAdderStructuredLesson,
  fourBitAdderStructuredLesson,
  comparatorStructuredLesson,
  encoderStructuredLesson,
  decoderStructuredLesson,
  sevenSegmentDisplayStructuredLesson, // 新規追加
  multiplexerStructuredLesson,
  aluBasicsStructuredLesson,
  dFlipFlopStructuredLesson,
  srLatchStructuredLesson,
  jkFlipFlopStructuredLesson, // 新規追加
  counterStructuredLesson,
  registerStructuredLesson,
  shiftRegisterStructuredLesson,
  clockSyncStructuredLesson,
  trafficLightStructuredLesson,
  digitalClockStructuredLesson,
];

// カテゴリを追加（旧形式との互換性のため）
const lessonsWithCategory = cleanLessons.map(lesson => {
  // カテゴリを判定
  let category = 'basics';

  if (
    [
      'digital-basics',
      'not-gate',
      'and-gate',
      'or-gate',
      'xor-gate',
      'nand-gate',
    ].includes(lesson.id)
  ) {
    category = 'basics';
  } else if (
    [
      'half-adder',
      'full-adder',
      '4bit-adder',
      'comparator',
      'encoder',
      'decoder',
      'seven-segment-display',
      'multiplexer',
      'alu-basics',
    ].includes(lesson.id)
  ) {
    category = 'combinational';
  } else if (
    [
      'd-flip-flop',
      'sr-latch',
      'jk-flip-flop',
      'counter',
      'register',
      'shift-register',
      'clock-sync',
    ].includes(lesson.id)
  ) {
    category = 'sequential';
  } else if (['traffic-light', 'digital-clock'].includes(lesson.id)) {
    category = 'systems';
  } else if (lesson.id === 'diagram-catalog') {
    category = 'systems'; // カタログはシステムカテゴリーに追加
  }

  return {
    ...lesson,
    category,
  } as Lesson;
});

// エクスポートするレッスン配列
export const lessons: Lesson[] = lessonsWithCategory;

// カテゴリー別整理（重複なし）
export const lessonCategories = {
  basics: {
    title: 'Phase 1: デジタルの世界',
    description: '0と1の魔法を理解しよう',
    color: '#00ff88',
    lessons: [
      'digital-basics',
      'not-gate',
      'and-gate',
      'or-gate',
      'xor-gate',
      'nand-gate',
    ],
  },
  combinational: {
    title: 'Phase 2: 組み合わせ回路',
    description: '実用的な計算・判断回路を作ろう',
    color: '#ff6699',
    lessons: [
      'half-adder',
      'full-adder',
      '4bit-adder',
      'comparator',
      'encoder',
      'decoder',
      'seven-segment-display',
      'multiplexer',
      'alu-basics',
    ],
  },
  sequential: {
    title: 'Phase 3: 記憶と時系列',
    description: '時間と記憶を扱う回路を学ぼう',
    color: '#ffd700',
    lessons: [
      'd-flip-flop',
      'sr-latch',
      'jk-flip-flop',
      'counter',
      'register',
      'shift-register',
      'clock-sync',
    ],
  },
  systems: {
    title: 'Phase 4: 実用システム',
    description: '本格的なシステムを構築しよう',
    color: '#ff7b00',
    lessons: ['traffic-light', 'digital-clock', 'diagram-catalog'],
  },
};

// 学習統計
export const getLearningStats = (completedLessons: Set<string>) => {
  const totalLessons = lessons.length;
  const completed = completedLessons.size;
  const progress = Math.round((completed / totalLessons) * 100);

  const phaseStats = Object.entries(lessonCategories).map(([, category]) => ({
    phase: category.title,
    completed: category.lessons.filter(id => completedLessons.has(id)).length,
    total: category.lessons.length,
    color: category.color,
  }));

  return {
    totalLessons,
    completed,
    progress,
    phaseStats,
    estimatedTime: lessons.reduce(
      (sum, lesson) =>
        completedLessons.has(lesson.id) ? sum : sum + lesson.estimatedMinutes,
      0
    ),
  };
};
