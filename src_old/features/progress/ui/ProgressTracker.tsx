import React from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface Progress {
  gatesPlaced?: number;
  challengesCompleted?: number;
  totalTime?: number;
}

interface ProgressTrackerProps {
  progress: Progress;
  badges: string[];
  onClose: () => void;
}

/**
 * 進捗トラッカーとバッジシステム
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, badges, onClose }) => {
  // バッジの定義
  const allBadges: Badge[] = [
    {
      id: 'first-gate',
      name: '初めての一歩',
      description: '最初のゲートを配置',
      icon: '🎯',
      earned: badges.includes('first-gate')
    },
    {
      id: 'first-connection',
      name: '接続マスター',
      description: '初めてワイヤーを接続',
      icon: '🔗',
      earned: badges.includes('first-connection')
    },
    {
      id: 'tutorial-complete',
      name: 'チュートリアル完了',
      description: 'チュートリアルを完了',
      icon: '🎓',
      earned: badges.includes('tutorial-complete')
    },
    {
      id: 'challenge-1',
      name: 'チャレンジャー',
      description: '最初のチャレンジをクリア',
      icon: '⭐',
      earned: badges.includes('challenge-1')
    },
    {
      id: 'challenge-all',
      name: '論理回路マスター',
      description: '全てのチャレンジをクリア',
      icon: '👑',
      earned: badges.includes('challenge-all')
    },
    {
      id: 'complex-circuit',
      name: '複雑回路ビルダー',
      description: '10個以上のゲートを使用',
      icon: '🏗️',
      earned: badges.includes('complex-circuit')
    },
    {
      id: 'speed-builder',
      name: 'スピードビルダー',
      description: '1分以内にチャレンジをクリア',
      icon: '⚡',
      earned: badges.includes('speed-builder')
    },
    {
      id: 'perfect-solver',
      name: 'パーフェクトソルバー',
      description: 'ヒントなしで全チャレンジクリア',
      icon: '💎',
      earned: badges.includes('perfect-solver')
    }
  ];

  const earnedCount = allBadges.filter(b => b.earned).length;
  const totalCount = allBadges.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxHeight: '80vh',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      border: '1px solid rgba(0, 255, 136, 0.5)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: '#00ff88'
        }}>
          学習の進捗
        </h2>
        
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
      </div>

      {/* 総合進捗 */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600'
          }}>
            総合進捗
          </h3>
          <span style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#00ff88'
          }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div style={{
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: '#00ff88',
            transition: 'width 0.5s',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
          }} />
        </div>
        
        <p style={{
          margin: '12px 0 0',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          {earnedCount} / {totalCount} バッジを獲得
        </p>
      </div>

      {/* スタッツ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#00ff88',
            marginBottom: '4px'
          }}>
            {progress.gatesPlaced || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            配置したゲート
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#00ff88',
            marginBottom: '4px'
          }}>
            {progress.challengesCompleted || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            クリアしたチャレンジ
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#00ff88',
            marginBottom: '4px'
          }}>
            {progress.totalTime || 0}分
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            学習時間
          </div>
        </div>
      </div>

      {/* バッジ一覧 */}
      <h3 style={{
        margin: '0 0 16px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        獲得バッジ
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {allBadges.map(badge => (
          <div
            key={badge.id}
            style={{
              backgroundColor: badge.earned ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${badge.earned ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: badge.earned ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (badge.earned) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: '32px',
              marginBottom: '8px',
              filter: badge.earned ? 'none' : 'grayscale(100%)'
            }}>
              {badge.icon}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '4px',
              color: badge.earned ? '#00ff88' : 'rgba(255, 255, 255, 0.7)'
            }}>
              {badge.name}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.3'
            }}>
              {badge.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;