import React, { useEffect, useState } from 'react';
import { Discovery } from '../../types/discovery';
import { DISCOVERIES } from '../../data/discoveries';

interface DiscoveryNotificationProps {
  discoveryIds: string[];
  onClose: () => void;
}

export const DiscoveryNotification: React.FC<DiscoveryNotificationProps> = ({
  discoveryIds,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const discoveries = discoveryIds.map(id => 
    DISCOVERIES.flatMap(cat => cat.discoveries).find(d => d.id === id)
  ).filter(Boolean) as Discovery[];

  const currentDiscovery = discoveries[currentIndex];

  useEffect(() => {
    // アニメーション開始
    setTimeout(() => setIsVisible(true), 100);

    // 複数の発見がある場合は自動で次へ
    if (discoveries.length > 1 && currentIndex < discoveries.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, discoveries.length]);

  if (!currentDiscovery) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      {/* 背景のキラキラエフェクト */}
      <div style={{
        position: 'absolute',
        inset: '-50px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
        animation: 'pulse 2s ease-in-out infinite'
      }} />

      {/* メインカード */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '24px',
        padding: '32px',
        minWidth: '400px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        border: '3px solid #fbbf24',
        textAlign: 'center'
      }}>
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#92400e',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          ×
        </button>

        {/* タイトル */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#92400e',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>🎉</span>
          <span>新しい発見！</span>
          <span style={{ fontSize: '32px' }}>🎉</span>
        </div>

        {/* アイコンと名前 */}
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          {currentDiscovery.icon}
        </div>

        <h3 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#78350f',
          marginBottom: '12px'
        }}>
          {currentDiscovery.name}
        </h3>

        {/* 説明 */}
        <p style={{
          fontSize: '16px',
          color: '#92400e',
          lineHeight: '1.6',
          maxWidth: '350px',
          margin: '0 auto 24px'
        }}>
          {currentDiscovery.description}
        </p>

        {/* アンロックされたゲート */}
        {currentDiscovery.unlocksGates && currentDiscovery.unlocksGates.length > 0 && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#78350f',
              marginBottom: '8px'
            }}>
              🔓 新しいゲートが使えるようになりました！
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {currentDiscovery.unlocksGates.map(gate => (
                <span
                  key={gate}
                  style={{
                    background: '#fbbf24',
                    color: '#78350f',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {gate}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 進捗インジケーター */}
        {discoveries.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            {discoveries.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentIndex ? '#f59e0b' : '#fed7aa',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// アニメーション用のCSS
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;
document.head.appendChild(style);