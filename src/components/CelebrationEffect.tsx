import React, { useState, useEffect } from 'react';
import '../features/learning-mode/ui/LearningPanel.css';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface CelebrationEffectProps {
  isActive: boolean;
  centerX?: number;
  centerY?: number;
  onComplete?: () => void;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ 
  isActive, 
  centerX = 400, 
  centerY = 300, 
  onComplete 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // パーティクルを生成
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }
    
    const colors = ['#00ff88', '#ff0066', '#00aaff', '#ffd700', '#ff6699'];
    const newParticles: Particle[] = [];
    
    // 爆発のような花火エフェクト
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 3 + Math.random() * 4;
      const life = 60 + Math.random() * 40;
      
      newParticles.push({
        id: `particle-${i}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
      });
    }
    
    setParticles(newParticles);
    
    // 3秒後に完了コールバック
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isActive, centerX, centerY, onComplete]);
  
  // パーティクルのアニメーション
  useEffect(() => {
    if (particles.length === 0) return;
    
    let animationId: number;
    
    const animate = () => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // 重力
          vx: particle.vx * 0.99, // 空気抵抗
          life: particle.life - 1,
        }))
        .filter(particle => particle.life > 0)
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [particles.length]);
  
  if (!isActive) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="particleGlow2">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {particles.map(particle => {
          const opacity = particle.life / particle.maxLife;
          return (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={opacity}
              filter="url(#particleGlow2)"
            >
              <animate
                attributeName="r"
                values={`${particle.size};${particle.size * 1.5};${particle.size * 0.5}`}
                dur="2s"
                repeatCount="1"
              />
            </circle>
          );
        })}
      </svg>
      
      {/* 中央のメッセージ */}
      <div
        className="celebration-text"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#00ff88',
          textShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        🎉 素晴らしい！ 🎉
      </div>
    </div>
  );
};