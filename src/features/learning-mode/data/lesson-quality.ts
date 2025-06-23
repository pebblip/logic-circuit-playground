/**
 * レッスン品質管理システム
 * 本番環境でリリース可能な品質レベルを管理
 */

export type LessonQualityLevel =
  | 'production' // 本番リリース可能（高品質・完成済み）
  | 'beta' // ベータ版（基本機能完成、改善余地あり）
  | 'draft' // ドラフト版（未完成・開発中）
  | 'concept'; // コンセプト段階（アイデアのみ）

export interface LessonQualityInfo {
  level: LessonQualityLevel;
  completionScore: number; // 0-100の完成度スコア
  issues: string[]; // 未解決の問題点
  lastReviewed: string; // 最終レビュー日
  reviewer?: string; // レビュアー
}

/**
 * 品質基準の定義
 */
export const QUALITY_STANDARDS = {
  production: {
    minScore: 90,
    requirements: [
      '10ステップ以上の詳細な構成',
      '実践的な例とアナロジー',
      'インタラクティブな要素',
      '理解度確認クイズ',
      '視覚的な図表・回路図',
      'ユーザーテスト完了',
    ],
  },
  beta: {
    minScore: 70,
    requirements: [
      '5ステップ以上の基本構成',
      '基本的な説明と例',
      '動作する実装',
      '基本的な理解度確認',
    ],
  },
  draft: {
    minScore: 40,
    requirements: ['基本的なステップ構成', '概要説明あり'],
  },
} as const;

/**
 * 現在のレッスン品質状況
 * 手動レビューに基づく暫定評価
 */
export const LESSON_QUALITY_MAP: Record<string, LessonQualityInfo> = {
  // 高品質（本番リリース可能）
  'digital-basics': {
    level: 'production',
    completionScore: 95,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'and-gate': {
    level: 'production',
    completionScore: 92,
    issues: ['実習部分の強化必要'],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'or-gate': {
    level: 'production',
    completionScore: 90,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'not-gate': {
    level: 'beta',
    completionScore: 85,
    issues: ['応用例の追加必要'],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },

  // ベータ版（基本完成、改善余地あり）
  'xor-gate': {
    level: 'production',
    completionScore: 92,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'half-adder': {
    level: 'production',
    completionScore: 93,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },

  // ドラフト版（未完成・開発中）
  'full-adder': {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  '4bit-adder': {
    level: 'production',
    completionScore: 92,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  comparator: {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },

  // コンセプト段階（大幅な改善必要）
  encoder: {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  decoder: {
    level: 'production',
    completionScore: 90,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  multiplexer: {
    level: 'production',
    completionScore: 89,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'alu-basics': {
    level: 'production',
    completionScore: 90,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },

  // 順序回路（ほぼ全て未完成）
  'd-flip-flop': {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'sr-latch': {
    level: 'production',
    completionScore: 90,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  counter: {
    level: 'beta',
    completionScore: 80,
    issues: ['実装部分の強化必要'],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  register: {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'shift-register': {
    level: 'production',
    completionScore: 91,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'clock-sync': {
    level: 'production',
    completionScore: 90,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },

  // 応用システム（未完成）
  'traffic-light': {
    level: 'beta',
    completionScore: 85,
    issues: ['テスト強化必要'],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
  'digital-clock': {
    level: 'production',
    completionScore: 89,
    issues: [],
    lastReviewed: '2024-12-13',
    reviewer: 'system',
  },
};

/**
 * 品質レベルに基づいてレッスンをフィルタリング
 */
export function getAvailableLessons(
  isDebugMode: boolean = false,
  minQualityLevel: LessonQualityLevel = 'production'
): string[] {
  if (isDebugMode) {
    // デバッグモードでは全レッスン表示
    return Object.keys(LESSON_QUALITY_MAP);
  }

  const qualityOrder: LessonQualityLevel[] = [
    'production',
    'beta',
    'draft',
    'concept',
  ];
  const minIndex = qualityOrder.indexOf(minQualityLevel);

  return Object.entries(LESSON_QUALITY_MAP)
    .filter(([, info]) => {
      const currentIndex = qualityOrder.indexOf(info.level);
      return currentIndex <= minIndex;
    })
    .map(([lessonId]) => lessonId);
}

/**
 * 品質統計を取得
 */
export function getQualityStats() {
  const stats = {
    production: 0,
    beta: 0,
    draft: 0,
    concept: 0,
  };

  Object.values(LESSON_QUALITY_MAP).forEach(info => {
    stats[info.level]++;
  });

  return {
    ...stats,
    total: Object.keys(LESSON_QUALITY_MAP).length,
    productionReady: stats.production + stats.beta,
    needsWork: stats.draft + stats.concept,
  };
}

/**
 * レッスンの品質情報を取得
 */
export function getLessonQuality(lessonId: string): LessonQualityInfo | null {
  return LESSON_QUALITY_MAP[lessonId] || null;
}

/**
 * 本番環境で表示可能かチェック
 */
export function isProductionReady(lessonId: string): boolean {
  const quality = getLessonQuality(lessonId);
  return quality ? ['production', 'beta'].includes(quality.level) : false;
}
