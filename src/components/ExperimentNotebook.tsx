import React, { useState, useEffect } from 'react';
import { ExperimentEntry } from '../types/discovery';

interface ExperimentNotebookProps {
  isOpen: boolean;
  onClose: () => void;
  currentCircuit: any | null;
  discoveries: string[];
}

export const ExperimentNotebook: React.FC<ExperimentNotebookProps> = ({
  isOpen,
  onClose,
  currentCircuit,
  discoveries
}) => {
  const [entries, setEntries] = useState<ExperimentEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');

  // 実験ノートの読み込み
  useEffect(() => {
    const saved = localStorage.getItem('logic-circuit-notebook');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  // エントリーの保存
  const saveEntry = () => {
    if (!currentCircuit || !newNote.trim()) return;

    const newEntry: ExperimentEntry = {
      id: `exp_${Date.now()}`,
      timestamp: new Date(),
      circuit: JSON.stringify(currentCircuit), // シリアライズ
      notes: newNote,
      tags: selectedTags,
      discovery: discoveries[discoveries.length - 1] // 最新の発見を関連付け
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('logic-circuit-notebook', JSON.stringify(updatedEntries));

    // フォームをリセット
    setNewNote('');
    setSelectedTags([]);
  };

  // タグの候補
  const availableTags = [
    '💡 アイデア',
    '🔍 発見',
    '❓ 疑問',
    '✅ 成功',
    '❌ 失敗',
    '🔧 改善',
    '📝 メモ'
  ];

  // フィルタリング
  const filteredEntries = filterTag === 'all' 
    ? entries 
    : entries.filter(entry => entry.tags.includes(filterTag));

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1f3a',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* ヘッダー */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📔 実験ノート
            <span style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: 'normal'
            }}>
              {entries.length} 件の記録
            </span>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'none';
            }}
          >
            ×
          </button>
        </div>

        {/* 新規エントリー作成 */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(59, 130, 246, 0.05)'
        }}>
          <div style={{
            marginBottom: '16px'
          }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="実験の結果や気づいたことを記録しよう..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* タグ選択 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '16px'
          }}>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: selectedTags.includes(tag) 
                    ? '2px solid #3b82f6' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  background: selectedTags.includes(tag)
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: selectedTags.includes(tag) ? '#60a5fa' : '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={saveEntry}
            disabled={!newNote.trim() || !currentCircuit}
            style={{
              padding: '12px 24px',
              background: newNote.trim() && currentCircuit ? '#3b82f6' : '#475569',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: newNote.trim() && currentCircuit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            記録を保存
          </button>
        </div>

        {/* フィルター */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>フィルター:</span>
          <button
            onClick={() => setFilterTag('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border: 'none',
              background: filterTag === 'all' ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
              color: filterTag === 'all' ? '#fff' : '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            すべて
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: filterTag === tag ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                color: filterTag === tag ? '#fff' : '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* エントリー一覧 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {filteredEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '48px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <div>まだ実験記録がありません</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                上のフォームから最初の記録を作成しましょう！
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* エントリーヘッダー */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span style={{
                      color: '#64748b',
                      fontSize: '12px'
                    }}>
                      {new Date(entry.timestamp).toLocaleString('ja-JP')}
                    </span>
                  </div>

                  {/* ノート内容 */}
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {entry.notes}
                  </div>

                  {/* 関連する発見 */}
                  {entry.discovery && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '8px',
                      color: '#fbbf24',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}>
                      🎉 発見: {entry.discovery}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};