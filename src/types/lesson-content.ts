// 学習コンテンツの構造化された型定義

// 基本的なコンテンツタイプ
export type ContentType =
  | 'text'
  | 'rich-text'
  | 'heading'
  | 'list'
  | 'table'
  | 'binary-expression'
  | 'comparison'
  | 'experiment-result'
  | 'quiz'
  | 'note'
  | 'ascii-art'
  | 'diagram'
  | 'circuit-diagram-v2'
  | 'digital-signal'
  | 'voltage-signal'
  | 'bit-pattern'
  | 'svg-diagram';

// 基本インターフェース
export interface BaseContent {
  type: ContentType;
  id?: string;
}

// テキストコンテンツ
export interface TextContent extends BaseContent {
  type: 'text';
  text: string;
  className?: string;
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
  className?: string;
}

// 2進数式（0+1=1など）
export interface BinaryExpression {
  left: string;
  operator: string;
  right: string;
  result: string;
}

// 2進数式コンテンツ
export interface BinaryExpressionContent extends BaseContent {
  type: 'binary-expression';
  expressions: BinaryExpression[];
}

// 比較コンテンツ（AND vs ORなど）
export interface ComparisonContent extends BaseContent {
  type: 'comparison';
  items: {
    gateType: 'AND' | 'OR' | 'XOR' | 'NOT';
    values: BinaryExpression[];
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
  correctIndex: number;
}

// ノートコンテンツ（💡ヒントなど）
export interface NoteContent extends BaseContent {
  type: 'note';
  text: string;
  icon?: string;
  variant?: 'info' | 'warning' | 'success' | 'tip';
}

// ASCIIアートコンテンツ（回路図など）
export interface AsciiArtContent extends BaseContent {
  type: 'ascii-art';
  art: string;
  title?: string;
  className?: string;
}

// 図表コンテンツ（ASCIIアートの代替）
export interface DiagramContent extends BaseContent {
  type: 'diagram';
  diagramType: 'simple-connection' | 'gate-symbol' | 'truth-table-visual' | 'signal-flow' | 'custom';
  title?: string;
  caption?: string;
  gateType?: string;  // gate-symbolの場合
  data?: any[][];     // truth-table-visualの場合
  signals?: any[];    // signal-flowの場合
  customSvg?: string; // customの場合のSVGコード
  className?: string;
}

// 新しい回路図コンテンツ（制作モード描画システム使用）
export interface CircuitDiagramV2Content extends BaseContent {
  type: 'circuit-diagram-v2';
  circuitId: string;
  description?: string;
  showTruthTable?: boolean;
}

// デジタル信号波形表示
export interface DigitalSignalContent extends BaseContent {
  type: 'digital-signal';
  title?: string;
  showAnalog?: boolean;
  showDigital?: boolean;
}

// 電圧レベルとデジタル信号の関係図
export interface VoltageSignalContent extends BaseContent {
  type: 'voltage-signal';
}

// ビット数とパターン表
export interface BitPatternContent extends BaseContent {
  type: 'bit-pattern';
}

// リッチテキストコンテンツ（強調表示付きテキスト）
export interface RichTextContent extends BaseContent {
  type: 'rich-text';
  elements: (string | {
    text: string;
    bold?: boolean;      // 太字
    gate?: boolean;      // ゲート名（色付き）
    emphasis?: boolean;  // 強調（背景色付き）
  })[];
}

// SVG図形コンテンツ
export interface SvgDiagramContent extends BaseContent {
  type: 'svg-diagram';
  diagramType: 'series-circuit' | 'parallel-circuit' | 'custom';
  customSvg?: string;  // カスタムSVGの場合
  width?: number;
  height?: number;
}

// すべてのコンテンツタイプのユニオン
export type Content =
  | TextContent
  | RichTextContent
  | HeadingContent
  | ListContent
  | TableContent
  | BinaryExpressionContent
  | ComparisonContent
  | ExperimentResultContent
  | QuizContent
  | NoteContent
  | AsciiArtContent
  | DiagramContent
  | CircuitDiagramV2Content
  | DigitalSignalContent
  | VoltageSignalContent
  | BitPatternContent
  | SvgDiagramContent;

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
  objective?: string;
  category?: string;
  lessonType?: string;
  icon?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedMinutes: number;
  steps: StructuredLessonStep[];
  availableGates?: string[]; // レッスンで使用可能なゲートタイプ
}
