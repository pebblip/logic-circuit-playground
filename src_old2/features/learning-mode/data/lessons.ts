export interface Lesson {
  id: string;
  title: string;
  description: string;
  objective: string;
  availableGates: string[];
  checkCompletion?: (gates: any[], connections: any[]) => boolean;
}

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: '基本の入出力',
    description: 'INPUTスイッチとOUTPUT LEDを接続してみよう',
    objective: 'INPUTをOUTPUTに接続して、スイッチでLEDを点灯させる',
    availableGates: ['INPUT', 'OUTPUT'],
    checkCompletion: (gates, connections) => {
      const hasInput = gates.some(g => g.type === 'INPUT');
      const hasOutput = gates.some(g => g.type === 'OUTPUT');
      const hasConnection = connections.length > 0;
      return hasInput && hasOutput && hasConnection;
    }
  },
  {
    id: 'lesson-2',
    title: 'NOT ゲート',
    description: '信号を反転させるNOTゲートを使ってみよう',
    objective: 'INPUTをNOTゲートに接続し、その出力をOUTPUTに接続',
    availableGates: ['INPUT', 'OUTPUT', 'NOT'],
    checkCompletion: (gates, connections) => {
      const hasNot = gates.some(g => g.type === 'NOT');
      return hasNot && connections.length >= 2;
    }
  },
  {
    id: 'lesson-3',
    title: 'AND ゲート',
    description: '2つの入力が両方ONの時だけ出力するANDゲート',
    objective: '2つのINPUTをANDゲートに接続し、出力を確認',
    availableGates: ['INPUT', 'OUTPUT', 'AND'],
    checkCompletion: (gates, connections) => {
      const inputCount = gates.filter(g => g.type === 'INPUT').length;
      const hasAnd = gates.some(g => g.type === 'AND');
      return inputCount >= 2 && hasAnd && connections.length >= 3;
    }
  },
  {
    id: 'lesson-4',
    title: 'OR ゲート',
    description: 'どちらかの入力がONなら出力するORゲート',
    objective: '2つのINPUTをORゲートに接続し、動作を確認',
    availableGates: ['INPUT', 'OUTPUT', 'OR'],
    checkCompletion: (gates, connections) => {
      const inputCount = gates.filter(g => g.type === 'INPUT').length;
      const hasOr = gates.some(g => g.type === 'OR');
      return inputCount >= 2 && hasOr && connections.length >= 3;
    }
  },
  {
    id: 'lesson-5',
    title: '組み合わせ回路',
    description: '複数のゲートを組み合わせて回路を作ろう',
    objective: '学んだゲートを自由に組み合わせて実験',
    availableGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'],
  }
];