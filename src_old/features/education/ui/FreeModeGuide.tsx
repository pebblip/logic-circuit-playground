import React, { useState } from 'react';
import { CircuitMode } from '../../../entities/types/mode';

interface FreeModeGuideProps {
  currentMode: CircuitMode;
  onStartTutorial?: () => void;
}

interface TipCard {
  id: string;
  title: string;
  content: string;
  icon: string;
}

const TIPS: TipCard[] = [
  {
    id: 'basic-gates',
    title: '基本ゲート',
    content: 'AND, OR, NOT などの基本ゲートから始めましょう。これらを組み合わせることで、より複雑な回路を作ることができます。',
    icon: '🔌'
  },
  {
    id: 'custom-gates',
    title: 'カスタムゲート',
    content: '作成した回路を「カスタムゲート」として保存できます。複雑な回路を部品化して再利用しましょう。',
    icon: '📦'
  },
  {
    id: 'keyboard-shortcuts',
    title: 'キーボードショートカット',
    content: 'Delete: 選択したゲートを削除、Ctrl+S: 回路を保存、Ctrl+L: 回路を読み込み、ESC: 選択解除',
    icon: '⌨️'
  },
  {
    id: 'save-share',
    title: '保存と共有',
    content: '作成した回路は保存して後で読み込むことができます。URLで共有することも可能です。',
    icon: '💾'
  }
];

const PROJECT_IDEAS = [
  {
    title: '半加算器',
    description: '2つの1ビット数を加算する基本的な算術回路',
    difficulty: 'easy'
  },
  {
    title: '7セグメントデコーダ',
    description: '4ビット入力を7セグメントディスプレイ用の信号に変換',
    difficulty: 'hard'
  },
  {
    title: 'マルチプレクサ',
    description: '複数の入力から1つを選択して出力する回路',
    difficulty: 'medium'
  },
  {
    title: 'カウンタ回路',
    description: 'クロック信号をカウントする順序回路',
    difficulty: 'hard'
  }
];

export const FreeModeGuide: React.FC<FreeModeGuideProps> = ({
  currentMode,
  onStartTutorial
}) => {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🎨 自由制作モード
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          自由に回路を設計・実験できます
        </p>
      </div>

      {/* クイックスタート */}
      <div style={{
        background: '#e0f2fe',
        border: '1px solid #0284c7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0c4a6e' }}>
          🚀 クイックスタート
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#0c4a6e' }}>
          初めての方は、発見チュートリアルから始めることをお勧めします。
        </p>
        <button
          onClick={onStartTutorial}
          style={{
            padding: '8px 16px',
            background: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          チュートリアルを開始
        </button>
      </div>

      {/* ヒントとコツ */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>💡 ヒントとコツ</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {TIPS.map(tip => (
            <div
              key={tip.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{tip.icon}</span>
                <h4 style={{ margin: 0, flex: 1 }}>{tip.title}</h4>
                <span style={{
                  transform: expandedTip === tip.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              </div>
              {expandedTip === tip.id && (
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  color: '#6b7280',
                  paddingLeft: '28px'
                }}>
                  {tip.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* プロジェクトアイデア */}
      <div>
        <h3 style={{ marginBottom: '12px' }}>🎯 プロジェクトアイデア</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {PROJECT_IDEAS.map((project, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{project.title}</h4>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: project.difficulty === 'easy' ? '#dcfce7' :
                             project.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                  color: project.difficulty === 'easy' ? '#166534' :
                        project.difficulty === 'medium' ? '#92400e' : '#991b1b'
                }}>
                  {project.difficulty === 'easy' ? '簡単' :
                   project.difficulty === 'medium' ? '中級' : '上級'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* リソース */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>📚 学習リソース</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#6b7280' }}>
          <li>論理回路の基礎を学ぶには「学習モード」がおすすめです</li>
          <li>具体的な課題に挑戦したい場合は「パズルモード」を試してみてください</li>
          <li>作成した回路は保存して、後で改良することができます</li>
        </ul>
      </div>
    </div>
  );
};