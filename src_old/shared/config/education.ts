// Education constants placeholder
export const EDUCATION_MODES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const CURRICULUM_STAGES = [
  {
    id: 'basics',
    name: '基礎',
    description: '論理ゲートの基本を学ぶ',
  },
  {
    id: 'combinations',
    name: '組み合わせ',
    description: '複数のゲートを組み合わせる',
  },
  {
    id: 'advanced',
    name: '応用',
    description: '高度な回路を作成する',
  },
] as const;