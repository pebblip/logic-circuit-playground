import React, { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  onClose
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length > 0) {
      setVisible(true);
      setCurrentIndex(0);
    }
  }, [achievements]);

  useEffect(() => {
    if (visible && achievements.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setVisible(false);
          setTimeout(onClose, 300);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, currentIndex, achievements.length, onClose]);

  if (!visible || achievements.length === 0) {
    return null;
  }

  const currentAchievement = achievements[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
          color: 'white',
          minWidth: '300px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 装飾的な背景 */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
            position: 'relative'
          }}
        >
          <div
            style={{
              fontSize: '28px',
              animation: 'bounce 0.6s ease-in-out'
            }}
          >
            {currentAchievement.icon}
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                opacity: 0.9,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              🏆 実績解除！
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '700',
                marginTop: '2px'
              }}
            >
              {currentAchievement.title}
            </div>
          </div>
          
          {/* 閉じるボタン */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ×
          </button>
        </div>

        {/* 説明文 */}
        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.4',
            opacity: 0.95,
            position: 'relative'
          }}
        >
          {currentAchievement.description}
        </div>

        {/* 進捗インジケーター */}
        {achievements.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '12px',
              justifyContent: 'center'
            }}
          >
            {achievements.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentIndex ? 
                    'rgba(255, 255, 255, 0.9)' : 
                    'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* プログレスバー */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            width: '100%'
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'rgba(255, 255, 255, 0.7)',
              width: '0%',
              animation: 'progress 2.5s linear forwards'
            }}
          />
        </div>
      </div>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 60%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          80% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};