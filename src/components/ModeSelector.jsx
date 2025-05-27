import React from 'react';
import { saveUserPreferences } from '../utils/circuitStorage';

/**
 * 初回起動時のモード選択画面
 */
const ModeSelector = ({ onModeSelected }) => {
  const modes = [
    {
      id: 'learning',
      title: '🎓 学習モード',
      description: 'チュートリアルから始めて、段階的に論理回路を学びます',
      features: [
        'ステップバイステップのチュートリアル',
        'レベル別のチャレンジ問題',
        '進捗トラッキング'
      ],
      color: '#00ff88'
    },
    {
      id: 'free',
      title: '🎨 自由制作モード',
      description: '自由に回路を設計・実験できます',
      features: [
        'すべての基本ゲートが使用可能',
        '回路の保存・読み込み',
        'カスタムゲートの作成'
      ],
      color: '#00b4d8'
    },
    {
      id: 'advanced',
      title: '🔧 上級者モード',
      description: 'すべての機能が解放された完全版',
      features: [
        '複合ゲート（NAND, NOR, XNOR）',
        'レベル2チャレンジ',
        'デバッグ機能'
      ],
      color: '#ff006e'
    }
  ];

  const handleModeSelect = (mode) => {
    // ユーザー設定を保存
    const preferences = {
      mode: mode,
      theme: 'modern',
      tutorialCompleted: false,
      showTutorialOnStartup: mode === 'learning'
    };
    
    saveUserPreferences(preferences);
    onModeSelected(mode);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0a0e27',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        maxWidth: '900px',
        width: '90%',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif'
        }}>
          論理回路プレイグラウンド
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '48px',
          lineHeight: '1.6'
        }}>
          あなたに合ったモードを選んでください
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {modes.map(mode => (
            <div
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid transparent',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = mode.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* グラデーション効果 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${mode.color}00, ${mode.color}, ${mode.color}00)`,
                opacity: 0.8
              }} />
              
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: mode.color,
                marginBottom: '12px'
              }}>
                {mode.title}
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '24px',
                lineHeight: '1.5'
              }}>
                {mode.description}
              </p>
              
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {mode.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '8px',
                      paddingLeft: '20px',
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: mode.color
                    }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: mode.color,
                color: '#000',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}>
                選択
              </div>
            </div>
          ))}
        </div>
        
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '32px'
        }}>
          ※ モードは後から設定画面で変更できます
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;