import { Gate, Wire } from '../../../types';

export interface CircuitMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  
  // 分類
  category: 'basic' | 'intermediate' | 'advanced' | 'creative' | 'educational';
  tags: string[];
  
  // 統計
  likes: number;
  views: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  
  // 回路データ
  gates: Gate[];
  wires: Wire[];
  
  // プレビュー
  thumbnail?: string; // base64 SVG
  isPublic: boolean;
  isFeatured: boolean;
}

export interface GalleryFilter {
  category?: CircuitMetadata['category'];
  complexity?: CircuitMetadata['complexity'];
  tags?: string[];
  author?: string;
  searchQuery?: string;
}

export interface GallerySortOption {
  field: 'createdAt' | 'likes' | 'views' | 'title';
  direction: 'asc' | 'desc';
}

// ultrathink: 美しく実用的なサンプル回路集
export const FEATURED_CIRCUITS: CircuitMetadata[] = [
  {
    id: 'half-adder',
    title: '半加算器',
    description: '2つの1ビット数を加算する基本回路。コンピュータの計算の原点です。',
    author: 'システム',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: 'educational',
    tags: ['加算', '基本', '論理回路'],
    likes: 156,
    views: 2341,
    complexity: 'simple',
    gates: [
      { id: 'input-a', type: 'INPUT', position: { x: 100, y: 150 }, output: false, inputs: [] },
      { id: 'input-b', type: 'INPUT', position: { x: 100, y: 250 }, output: false, inputs: [] },
      { id: 'xor-sum', type: 'XOR', position: { x: 300, y: 150 }, output: false, inputs: [] },
      { id: 'and-carry', type: 'AND', position: { x: 300, y: 250 }, output: false, inputs: [] },
      { id: 'output-sum', type: 'OUTPUT', position: { x: 500, y: 150 }, output: false, inputs: [] },
      { id: 'output-carry', type: 'OUTPUT', position: { x: 500, y: 250 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input-a', pinIndex: -1 }, to: { gateId: 'xor-sum', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-b', pinIndex: -1 }, to: { gateId: 'xor-sum', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'input-a', pinIndex: -1 }, to: { gateId: 'and-carry', pinIndex: 0 }, isActive: false },
      { id: 'w4', from: { gateId: 'input-b', pinIndex: -1 }, to: { gateId: 'and-carry', pinIndex: 1 }, isActive: false },
      { id: 'w5', from: { gateId: 'xor-sum', pinIndex: -1 }, to: { gateId: 'output-sum', pinIndex: 0 }, isActive: false },
      { id: 'w6', from: { gateId: 'and-carry', pinIndex: -1 }, to: { gateId: 'output-carry', pinIndex: 0 }, isActive: false }
    ],
    isPublic: true,
    isFeatured: true
  },
  
  {
    id: 'sr-latch',
    title: 'SRラッチ',
    description: '状態を記憶する最も基本的な順序回路。メモリの基本構成要素です。',
    author: 'システム',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    category: 'educational',
    tags: ['記憶', '順序回路', 'ラッチ'],
    likes: 89,
    views: 1456,
    complexity: 'moderate',
    gates: [
      { id: 'input-s', type: 'INPUT', position: { x: 100, y: 150 }, output: false, inputs: [] },
      { id: 'input-r', type: 'INPUT', position: { x: 100, y: 300 }, output: false, inputs: [] },
      { id: 'nor1', type: 'NOR', position: { x: 300, y: 180 }, output: false, inputs: [] },
      { id: 'nor2', type: 'NOR', position: { x: 300, y: 270 }, output: false, inputs: [] },
      { id: 'output-q', type: 'OUTPUT', position: { x: 500, y: 180 }, output: false, inputs: [] },
      { id: 'output-qbar', type: 'OUTPUT', position: { x: 500, y: 270 }, output: false, inputs: [] }
    ],
    wires: [
      { id: 'w1', from: { gateId: 'input-s', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 0 }, isActive: false },
      { id: 'w2', from: { gateId: 'input-r', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 1 }, isActive: false },
      { id: 'w3', from: { gateId: 'nor1', pinIndex: -1 }, to: { gateId: 'output-q', pinIndex: 0 }, isActive: false },
      { id: 'w4', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'output-qbar', pinIndex: 0 }, isActive: false },
      { id: 'w5', from: { gateId: 'nor1', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 0 }, isActive: false },
      { id: 'w6', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 1 }, isActive: false }
    ],
    isPublic: true,
    isFeatured: true
  },
  
  {
    id: 'traffic-light',
    title: '信号機制御回路',
    description: '3色の信号機を制御する創造的な回路。実世界の応用例です。',
    author: 'システム',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    category: 'creative',
    tags: ['信号機', '制御', '実用'],
    likes: 234,
    views: 3821,
    complexity: 'complex',
    gates: [
      { id: 'clock', type: 'CLOCK', position: { x: 100, y: 200 }, output: false, inputs: [], metadata: { frequency: 1, startTime: 0 } },
      { id: 'counter1', type: 'D-FF', position: { x: 250, y: 150 }, output: false, inputs: [] },
      { id: 'counter2', type: 'D-FF', position: { x: 250, y: 250 }, output: false, inputs: [] },
      { id: 'not1', type: 'NOT', position: { x: 400, y: 150 }, output: false, inputs: [] },
      { id: 'not2', type: 'NOT', position: { x: 400, y: 200 }, output: false, inputs: [] },
      { id: 'and1', type: 'AND', position: { x: 550, y: 120 }, output: false, inputs: [] },
      { id: 'and2', type: 'AND', position: { x: 550, y: 200 }, output: false, inputs: [] },
      { id: 'red', type: 'OUTPUT', position: { x: 700, y: 120 }, output: false, inputs: [] },
      { id: 'yellow', type: 'OUTPUT', position: { x: 700, y: 200 }, output: false, inputs: [] },
      { id: 'green', type: 'OUTPUT', position: { x: 700, y: 280 }, output: false, inputs: [] }
    ],
    wires: [],
    isPublic: true,
    isFeatured: true
  },
  
  {
    id: 'pattern-generator',
    title: 'パターン生成器',
    description: '美しい波形パターンを生成するアート的な回路。創造性の表現です。',
    author: 'アーティスト',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    category: 'creative',
    tags: ['パターン', 'アート', '波形'],
    likes: 178,
    views: 2156,
    complexity: 'complex',
    gates: [],
    wires: [],
    isPublic: true,
    isFeatured: true
  },
  
  {
    id: 'multiplexer-demo',
    title: '4:1マルチプレクサー',
    description: '4つの入力から1つを選択する回路。データ選択の基本です。',
    author: 'システム',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    category: 'intermediate',
    tags: ['マルチプレクサー', 'データ選択', '中級'],
    likes: 143,
    views: 1889,
    complexity: 'moderate',
    gates: [],
    wires: [],
    isPublic: true,
    isFeatured: true
  }
];

// 人気タグ一覧
export const POPULAR_TAGS = [
  '基本', '中級', '上級', '加算', '記憶', '順序回路', 
  'ラッチ', 'フリップフロップ', 'カウンタ', 'マルチプレクサー',
  'デコーダー', 'エンコーダー', '制御', '信号機', 'アート',
  'パターン', '波形', '実用', '教育', '創造的'
];

// カテゴリ表示名
export const CATEGORY_LABELS = {
  basic: '🟢 基本',
  intermediate: '🟡 中級', 
  advanced: '🟠 上級',
  creative: '🎨 創造的',
  educational: '📚 教育'
} as const;

// 複雑さ表示名
export const COMPLEXITY_LABELS = {
  simple: '⭐ シンプル',
  moderate: '⭐⭐ 標準',
  complex: '⭐⭐⭐ 複雑',
  expert: '⭐⭐⭐⭐ エキスパート'
} as const;

// ギャラリーユーティリティ関数
export class GalleryService {
  /**
   * 回路をフィルタリング
   */
  static filterCircuits(circuits: CircuitMetadata[], filter: GalleryFilter): CircuitMetadata[] {
    return circuits.filter(circuit => {
      // カテゴリフィルタ
      if (filter.category && circuit.category !== filter.category) {
        return false;
      }
      
      // 複雑さフィルタ
      if (filter.complexity && circuit.complexity !== filter.complexity) {
        return false;
      }
      
      // タグフィルタ
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.every(tag => circuit.tags.includes(tag))) {
          return false;
        }
      }
      
      // 作者フィルタ
      if (filter.author && circuit.author !== filter.author) {
        return false;
      }
      
      // 検索クエリ
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchable = `${circuit.title} ${circuit.description} ${circuit.tags.join(' ')}`.toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * 回路をソート
   */
  static sortCircuits(circuits: CircuitMetadata[], sort: GallerySortOption): CircuitMetadata[] {
    return [...circuits].sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];
      
      // 文字列の場合は小文字で比較
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  /**
   * 回路の複雑さを計算
   */
  static calculateComplexity(gates: Gate[], wires: Wire[]): CircuitMetadata['complexity'] {
    const gateCount = gates.length;
    const wireCount = wires.length;
    const totalElements = gateCount + wireCount;
    
    if (totalElements <= 5) return 'simple';
    if (totalElements <= 15) return 'moderate';
    if (totalElements <= 30) return 'complex';
    return 'expert';
  }

  /**
   * 回路のサムネイルを生成
   */
  static generateThumbnail(gates: Gate[], wires: Wire[]): string {
    // 簡単なSVGサムネイルを生成
    // 実際の実装では、回路を小さくレンダリングしてbase64化
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmYWZjIi8+PC9zdmc+';
  }
}