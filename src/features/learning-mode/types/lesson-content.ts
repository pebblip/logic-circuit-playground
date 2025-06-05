// 学習モードの新しいコンテンツ型定義

// 基本的なコンテンツ要素
export type ContentElement = 
  | TextContent
  | HeadingContent
  | ListContent
  | TableContent
  | ComparisonContent
  | ExperimentResultContent
  | BinaryExpressionContent
  | QuizContent
  | CodeContent
  | ImageContent;

// テキストコンテンツ
export interface TextContent {
  type: 'text';
  text: string;
  className?: string;
}

// 見出しコンテンツ
export interface HeadingContent {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
  icon?: string;
}

// リストコンテンツ
export interface ListContent {
  type: 'list';
  ordered: boolean;
  items: string[];
}

// テーブルコンテンツ
export interface TableContent {
  type: 'table';
  headers: string[];
  rows: string[][];
  className?: string;
}

// 比較コンテンツ（AND vs OR vs XORなど）
export interface ComparisonContent {
  type: 'comparison';
  items: ComparisonItem[];
}

export interface ComparisonItem {
  gateType: string;
  values: BinaryExpression[];
}

// 実験結果コンテンツ
export interface ExperimentResultContent {
  type: 'experiment-result';
  title: string;
  results: BinaryExpression[];
  note?: string;
}

// 2進数式コンテンツ
export interface BinaryExpressionContent {
  type: 'binary-expression';
  expressions: BinaryExpression[];
}

export interface BinaryExpression {
  left: string;
  operator: '+' | 'AND' | 'OR' | 'XOR' | '=';
  right: string;
  result?: string;
}

// クイズコンテンツ
export interface QuizContent {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
}

// コードコンテンツ
export interface CodeContent {
  type: 'code';
  language: string;
  code: string;
}

// 画像コンテンツ
export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

// 構造化されたレッスンステップ
export interface StructuredLessonStep {
  id: string;
  instruction: string;
  hint?: string;
  content?: ContentElement[];
  action: StepAction;
  validation?: StepValidation;
}

// アクションタイプ（既存のものを継承）
export type StepAction =
  | { type: 'place-gate'; gateType: string; position?: { x: number; y: number } }
  | { type: 'connect-wire'; from: string; to: string }
  | { type: 'connect-wires' } // 複数のワイヤー接続
  | { type: 'toggle-input'; gateId: string; value: boolean }
  | { type: 'observe'; highlight?: string[] }
  | { type: 'explanation' } // 新しい構造では content 配列で処理
  | { type: 'quiz' }; // 新しい構造では content 配列で処理

export interface StepValidation {
  type: 'gate-placed' | 'wire-connected' | 'output-matches' | 'quiz-answered' | 'circuit-complete';
  expected?: any;
}

// レッスンタイプ別の特殊化
export type LessonType = 
  | 'basic'        // 基本概念の説明
  | 'gate-intro'   // ゲートの紹介
  | 'comparison'   // ゲートの比較
  | 'circuit'      // 回路構築
  | 'experiment'   // 実験的な学習
  | 'quiz'         // クイズ中心
  | 'project';     // プロジェクト型

// 拡張されたレッスン定義
export interface StructuredLesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[];
  category: string;
  icon: string;
  lessonType: LessonType;
  steps: StructuredLessonStep[];
  verification?: CircuitVerification;
}

export interface CircuitVerification {
  inputs: { [key: string]: boolean }[];
  expectedOutputs: { [key: string]: boolean }[];
}