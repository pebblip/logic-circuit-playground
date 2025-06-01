import React, { useState, useEffect } from 'react';
import { AppMode } from '../../../entities/types/mode';

interface LearningGuideProps {
  currentMode: AppMode;
  currentLesson?: number;
  onLessonChange?: (lesson: number) => void;
  className?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  objective: string;
  gatesIntroduced: string[];
  totalSteps: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const LEARNING_CURRICULUM: Lesson[] = [
  {
    id: 1,
    title: 'プレイグラウンドの基本操作',
    description: '論理回路プレイグラウンドの基本的な使い方を学びます',
    objective: 'ゲートの配置、接続、削除ができるようになる',
    gatesIntroduced: ['INPUT', 'OUTPUT'],
    totalSteps: 5,
    difficulty: 'beginner'
  },
  {
    id: 2,
    title: 'ANDゲートの世界',
    description: 'ANDゲートの動作原理と使い方を理解します',
    objective: 'ANDゲートの真理値表を完全に理解する',
    gatesIntroduced: ['AND'],
    totalSteps: 7,
    difficulty: 'beginner'
  },
  {
    id: 3,
    title: 'ORゲートの理解',
    description: 'ORゲートの動作と実際の応用例を学びます',
    objective: 'ORゲートを使った回路を自分で作れるようになる',
    gatesIntroduced: ['OR'],
    totalSteps: 6,
    difficulty: 'beginner'
  },
  {
    id: 4,
    title: 'NOTゲートと論理の逆転',
    description: 'NOTゲートによる論理の反転を理解します',
    objective: 'NOTゲートの重要性と組み合わせ方を理解する',
    gatesIntroduced: ['NOT'],
    totalSteps: 5,
    difficulty: 'beginner'
  },
  {
    id: 5,
    title: '基本ゲートの組み合わせ',
    description: '複数のゲートを組み合わせた回路を作ります',
    objective: '3つ以上のゲートを使った回路を設計できる',
    gatesIntroduced: [],
    totalSteps: 8,
    difficulty: 'intermediate'
  },
  {
    id: 6,
    title: 'XORゲートの魔法',
    description: 'XORゲートの特殊な性質と用途を学びます',
    objective: 'XORゲートを使った実用的な回路を作る',
    gatesIntroduced: ['XOR'],
    totalSteps: 7,
    difficulty: 'intermediate'
  }
];

export const LearningGuide: React.FC<LearningGuideProps> = ({
  currentMode,
  currentLesson = 1,
  onLessonChange,
  className = ''
}) => {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(currentLesson);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  // ローカルストレージから進捗を読み込み
  useEffect(() => {
    const saved = localStorage.getItem('learning-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setCompletedLessons(progress.completedLessons || []);
      } catch (e) {
        console.warn('Failed to parse learning progress:', e);
      }
    }
  }, []);

  // 進捗をローカルストレージに保存
  const saveProgress = (completed: number[]) => {
    const progress = {
      completedLessons: completed,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('learning-progress', JSON.stringify(progress));
  };

  // レッスン完了処理
  const completeLesson = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      saveProgress(newCompleted);
    }
  };

  // レッスン選択処理
  const selectLesson = (lessonId: number) => {
    // TODO: 実際のレッスン切り替え機能を実装
    const message = `TODO: レッスン切り替え機能は未実装です。\n\n選択されたレッスン: レッスン${lessonId}\n\n現在の実装:\n- レッスン一覧の表示 ✅\n- 進捗状況の表示 ✅\n- 展開/折りたたみUI ✅\n\n未実装:\n- 実際のレッスン切り替え\n- レッスン内容の読み込み\n- チュートリアル再開機能`;
    
    // テスト環境の判定とアラート表示
    const isTestEnv = process.env.NODE_ENV === 'test' || typeof window === 'undefined' || !window.alert;
    
    if (!isTestEnv) {
      alert(message);
    } else {
      console.log(message);
    }
    
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
    onLessonChange?.(lessonId);
  };

  // 学習モード以外では表示しない
  if (currentMode !== 'learning') {
    return null;
  }

  const currentLessonData = LEARNING_CURRICULUM.find(l => l.id === currentLesson);
  const progressPercentage = (completedLessons.length / LEARNING_CURRICULUM.length) * 100;

  return (
    <div 
      className={`learning-guide ${className}`}
      role="complementary"
      aria-label="学習ガイドパネル"
      data-testid="learning-guide"
    >
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        padding: '20px',
        borderRadius: '12px 12px 0 0',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>📚</span>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            margin: 0 
          }}>
            学習ガイド
          </h2>
        </div>
        
        {/* 進捗表示 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              全体進捗
            </span>
            <span style={{ fontSize: '14px' }}>
              {completedLessons.length}/{LEARNING_CURRICULUM.length} レッスン完了
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* 現在のレッスン情報 */}
        {currentLessonData && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              現在のレッスン
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {currentLessonData.title}
            </div>
          </div>
        )}
      </div>

      {/* レッスン一覧 */}
      <div style={{
        background: '#ffffff',
        maxHeight: '400px',
        overflowY: 'auto',
        borderRadius: '0 0 12px 12px',
        border: '1px solid #e5e7eb'
      }}>
        {LEARNING_CURRICULUM.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === currentLesson;
          const isExpanded = expandedLesson === lesson.id;
          const isUnlocked = lesson.id <= Math.max(1, Math.max(...completedLessons, 0) + 1);

          return (
            <div
              key={lesson.id}
              style={{
                borderBottom: '1px solid #f3f4f6',
                opacity: isUnlocked ? 1 : 0.5
              }}
            >
              {/* レッスンヘッダー */}
              <div
                onClick={() => isUnlocked && selectLesson(lesson.id)}
                role="button"
                tabIndex={isUnlocked ? 0 : -1}
                aria-label={`レッスン${lesson.id}: ${lesson.title}${isCompleted ? ' (完了済み)' : ''}`}
                aria-expanded={isExpanded}
                aria-disabled={!isUnlocked}
                style={{
                  padding: '16px 20px',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  background: isCurrent ? '#f0f9ff' : isExpanded ? '#fefce8' : 'transparent',
                  borderLeft: isCurrent ? '4px solid #3b82f6' : '4px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onKeyDown={(e) => {
                  if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    selectLesson(lesson.id);
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* ステータスアイコン */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      background: isCompleted ? '#10b981' : 
                                 isCurrent ? '#3b82f6' : 
                                 isUnlocked ? '#e5e7eb' : '#f3f4f6',
                      color: isCompleted || isCurrent ? 'white' : '#6b7280'
                    }}>
                      {isCompleted ? '✓' : 
                       !isUnlocked ? '🔒' : lesson.id}
                    </div>

                    {/* レッスン情報 */}
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isUnlocked ? '#111827' : '#9ca3af',
                        marginBottom: '4px'
                      }}>
                        {lesson.title}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>{lesson.totalSteps} ステップ</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          background: lesson.difficulty === 'beginner' ? '#dcfce7' :
                                     lesson.difficulty === 'intermediate' ? '#fef3c7' : '#fee2e2',
                          color: lesson.difficulty === 'beginner' ? '#166534' :
                                lesson.difficulty === 'intermediate' ? '#92400e' : '#991b1b'
                        }}>
                          {lesson.difficulty === 'beginner' ? '初級' :
                           lesson.difficulty === 'intermediate' ? '中級' : '上級'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 展開アイコン */}
                  {isUnlocked && (
                    <div style={{
                      fontSize: '20px',
                      color: '#9ca3af',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▼
                    </div>
                  )}
                </div>
              </div>

              {/* レッスン詳細 */}
              {isExpanded && isUnlocked && (
                <div style={{
                  padding: '0 20px 20px 20px',
                  background: '#fafafa'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    {lesson.description}
                  </div>
                  
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1e40af',
                      marginBottom: '4px'
                    }}>
                      🎯 学習目標
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>
                      {lesson.objective}
                    </div>
                  </div>

                  {lesson.gatesIntroduced.length > 0 && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#166534',
                        marginBottom: '4px'
                      }}>
                        🔧 導入するゲート
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        {lesson.gatesIntroduced.map(gate => (
                          <span
                            key={gate}
                            style={{
                              padding: '4px 8px',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontFamily: 'monospace'
                            }}
                          >
                            {gate}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};