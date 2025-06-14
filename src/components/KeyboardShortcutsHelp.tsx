import React, { useState, useEffect } from 'react';

interface ShortcutItem {
  keys: string;
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // 編集操作
  { keys: 'Ctrl+Z', description: '元に戻す', category: '編集' },
  { keys: 'Ctrl+Shift+Z', description: 'やり直し', category: '編集' },
  { keys: 'Ctrl+Y', description: 'やり直し（別の方法）', category: '編集' },
  { keys: 'Delete', description: '選択したゲートを削除', category: '編集' },
  { keys: 'Backspace', description: '選択したゲートを削除', category: '編集' },
  
  // 選択操作
  { keys: 'Ctrl+A', description: '全てのゲートを選択', category: '選択' },
  { keys: 'Escape', description: '選択解除・操作キャンセル', category: '選択' },
  
  // コピー・ペースト
  { keys: 'Ctrl+C', description: '選択したゲートをコピー', category: 'コピー・ペースト' },
  { keys: 'Ctrl+V', description: 'コピーしたゲートをペースト', category: 'コピー・ペースト' },
  
  // ファイル操作
  { keys: 'Ctrl+S', description: '回路を保存', category: 'ファイル' },
];

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showInitialHint, setShowInitialHint] = useState(true);

  // 初回表示のヒントを3秒後に非表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // ? キーでヘルプを表示
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        // フォーム要素にフォーカスがある場合は無効化
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        event.preventDefault();
        setIsVisible(!isVisible);
      }
      // Escapeでヘルプを閉じる
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const formatKeys = (keys: string) => {
    return keys.replace(/Ctrl/g, cmdKey);
  };

  return (
    <>
      {/* ヘルプボタンとヒント */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        {showInitialHint && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            「?」でショートカット表示
          </div>
        )}
        
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #00ff88',
            color: '#00ff88',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="キーボードショートカット（?キーでも開けます）"
        >
          ?
        </button>
      </div>

      {/* ヘルプモーダル */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setIsVisible(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #00ff88',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              color: 'white',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #333',
                paddingBottom: '12px',
              }}
            >
              <h2 style={{ margin: 0, color: '#00ff88', fontSize: '24px' }}>
                ⌨️ キーボードショートカット
              </h2>
              <button
                onClick={() => setIsVisible(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    margin: '0 0 12px 0',
                    color: '#ff6699',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {category}
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {items.map((shortcut, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>
                        {shortcut.description}
                      </span>
                      <kbd
                        style={{
                          backgroundColor: '#333',
                          color: '#00ff88',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          border: '1px solid #555',
                        }}
                      >
                        {formatKeys(shortcut.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div
              style={{
                textAlign: 'center',
                marginTop: '20px',
                color: '#888',
                fontSize: '12px',
              }}
            >
              「?」キーまたは「Escape」キーで閉じる
            </div>
          </div>
        </div>
      )}
    </>
  );
};