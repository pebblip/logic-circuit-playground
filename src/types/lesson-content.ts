// 学習コンテンツの構造化された型定義

// 基本的なコンテンツタイプ
export type ContentType = 
  | 'text'
  | 'heading'
  | 'list'
  | 'table'
  | 'binary-expression'
  | 'comparison'
  | 'experiment-result'
  | 'quiz'
  | 'note';

// 基本インターフェース
export interface BaseContent {
  type: ContentType;
  id?: string;
}

// テキストコンテンツ
export interface TextContent extends BaseContent {
  type: 'text';
  text: string;
}

// 見出しコンテンツ
export interface HeadingContent extends BaseContent {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3 | 4;
  icon?: string;
}

// リストコンテンツ
export interface ListContent extends BaseContent {
  type: 'list';
  ordered: boolean;
  items: string[];
}

// テーブルコンテンツ
export interface TableContent extends BaseContent {
  type: 'table';
  headers: string[];
  rows: string[][];
}

// 2進数式（0+1=1など）
export interface BinaryExpression {
  input1: string;
  operator: string;
  input2: string;
  output: string;
}

// 2進数式コンテンツ
export interface BinaryExpressionContent extends BaseContent {
  type: 'binary-expression';
  expression: BinaryExpression;
}

// 比較コンテンツ（AND vs ORなど）
export interface ComparisonContent extends BaseContent {
  type: 'comparison';
  items: {
    gateType: 'AND' | 'OR' | 'XOR' | 'NOT';
    expressions: BinaryExpression[];
  }[];
}

// 実験結果コンテンツ
export interface ExperimentResultContent extends BaseContent {
  type: 'experiment-result';
  title: string;
  results: BinaryExpression[];
  note?: string;
}

// クイズコンテンツ
export interface QuizContent extends BaseContent {
  type: 'quiz';
  question: string;
  options: string[];
  correct: number;
}

// ノートコンテンツ（💡ヒントなど）
export interface NoteContent extends BaseContent {
  type: 'note';
  text: string;
  icon?: string;
  variant?: 'info' | 'warning' | 'success' | 'tip';
}

// すべてのコンテンツタイプのユニオン
export type Content = 
  | TextContent
  | HeadingContent
  | ListContent
  | TableContent
  | BinaryExpressionContent
  | ComparisonContent
  | ExperimentResultContent
  | QuizContent
  | NoteContent;

// 構造化されたレッスンステップ
export interface StructuredLessonStep {
  id: string;
  instruction: string;
  hint?: string;
  content: Content[];
  action?: {
    type: 'place-gate' | 'connect-wire' | 'toggle-input' | 'observe';
    gateType?: string;
  };
}

// 構造化されたレッスン
export interface StructuredLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedMinutes: number;
  steps: StructuredLessonStep[];
}