import React, { useState } from 'react';
import { useDiscovery } from '../../hooks/useDiscovery';
import { DISCOVERIES } from '../../data/discoveries';

interface HelpButtonProps {
  theme: any;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ theme }) => {
  const [showHelp, setShowHelp] = useState(false);
  const { progress } = useDiscovery();

  // 次の発見のヒントを取得
  const getNextHints = () => {
    const undiscovered = DISCOVERIES.flatMap(cat => 
      cat.discoveries.filter(d => !progress.discoveries[d.id])
    ).slice(0, 3); // 最大3つまで表示
    
    return undiscovered;
  };

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: 'none',
          background: theme.colors.ui.buttonBg,
          color: theme.colors.ui.primary,
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover;
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg;
        }}
        title="ヘルプ"
      >
        ❓
        {/* ヒントがある場合は通知バッジ */}
        {getNextHints().length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            background: '#f59e0b',
            borderRadius: '50%',
            border: '2px solid #0a0e27'
          }} />
        )}
      </button>

      {/* ヘルプパネル */}
      {showHelp && (
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
            maxWidth: '700px',
            maxHeight: '80vh',
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
                margin: 0
              }}>
                ❓ ヘルプ
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px'
                }}
              >
                ×
              </button>
            </div>

            {/* コンテンツ */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* 基本操作 */}
              <section style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#60a5fa', fontSize: '18px', marginBottom: '16px' }}>
                  🎮 基本操作
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <strong>ゲートの配置:</strong> 左のパレットからドラッグ＆ドロップ
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <strong>接続:</strong> ゲートのピンをクリックして線を引く
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <strong>入力切替:</strong> INPUTゲートをクリック
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <strong>削除:</strong> ゲートを選択してDeleteキー
                  </div>
                </div>
              </section>

              {/* 次の発見へのヒント */}
              <section style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#fbbf24', fontSize: '18px', marginBottom: '16px' }}>
                  💡 次の発見へのヒント
                </h3>
                {getNextHints().length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    すべての基本的な発見を達成しました！サンドボックスモードで自由に実験してみましょう。
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {getNextHints().map(discovery => (
                      <div
                        key={discovery.id}
                        style={{
                          background: 'rgba(251, 191, 36, 0.1)',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid rgba(251, 191, 36, 0.2)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '24px' }}>{discovery.icon}</span>
                          <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                            {discovery.name}
                          </span>
                        </div>
                        <div style={{ color: '#fef3c7', fontSize: '13px' }}>
                          ヒント: {discovery.hint || '???'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ショートカット */}
              <section>
                <h3 style={{ color: '#a78bfa', fontSize: '18px', marginBottom: '16px' }}>
                  ⌨️ ショートカット
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <kbd style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px' 
                    }}>Ctrl+S</kbd> 回路を保存
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <kbd style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px' 
                    }}>Ctrl+O</kbd> 回路を読み込み
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <kbd style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px' 
                    }}>Delete</kbd> 選択を削除
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                    <kbd style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px' 
                    }}>Esc</kbd> 選択を解除
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};