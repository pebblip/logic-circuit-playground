import React, { useEffect, useState } from 'react';
import { Wire as WireType } from '../../../entities/types';

interface SignalParticleProps {
  wire: WireType;
  isActive: boolean;
}

interface Particle {
  id: string;
  progress: number;
  opacity: number;
}

export const SignalParticle: React.FC<SignalParticleProps> = ({ wire, isActive }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }
    
    // パーティクルを定期的に生成
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: `particle-${Date.now()}-${Math.random()}`,
        progress: 0,
        opacity: 1,
      };
      
      setParticles(prev => [...prev, newParticle]);
    }, 200); // 200msごとに新しいパーティクル
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  useEffect(() => {
    if (particles.length === 0) return;
    
    // パーティクルをアニメーション
    const animationFrame = requestAnimationFrame(function animate() {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          progress: particle.progress + 0.02, // 速度
          opacity: 1 - particle.progress * 0.3, // 徐々に透明に
        }))
        .filter(particle => particle.progress < 1) // 完了したパーティクルを削除
      );
      
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [particles.length]);
  
  // ワイヤーのパスを計算
  const getPathD = () => {
    const { from, to } = wire;
    const controlPoint1X = from.x + (to.x - from.x) * 0.5;
    const controlPoint1Y = from.y;
    const controlPoint2X = from.x + (to.x - from.x) * 0.5;
    const controlPoint2Y = to.y;
    
    return `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;
  };
  
  // パスに沿った座標を取得
  const getPointAtLength = (pathLength: number, progress: number) => {
    // SVGパスの長さに基づいて座標を補間
    const length = progress * pathLength;
    
    // ベジェ曲線の計算（簡易版）
    const t = progress;
    const { from, to } = wire;
    const controlPoint1X = from.x + (to.x - from.x) * 0.5;
    const controlPoint1Y = from.y;
    const controlPoint2X = from.x + (to.x - from.x) * 0.5;
    const controlPoint2Y = to.y;
    
    // 3次ベジェ曲線の公式
    const x = Math.pow(1 - t, 3) * from.x +
              3 * Math.pow(1 - t, 2) * t * controlPoint1X +
              3 * (1 - t) * Math.pow(t, 2) * controlPoint2X +
              Math.pow(t, 3) * to.x;
              
    const y = Math.pow(1 - t, 3) * from.y +
              3 * Math.pow(1 - t, 2) * t * controlPoint1Y +
              3 * (1 - t) * Math.pow(t, 2) * controlPoint2Y +
              Math.pow(t, 3) * to.y;
    
    return { x, y };
  };
  
  // おおよそのパスの長さ
  const pathLength = Math.sqrt(
    Math.pow(wire.to.x - wire.from.x, 2) + 
    Math.pow(wire.to.y - wire.from.y, 2)
  ) * 1.2; // ベジェ曲線なので少し長め
  
  return (
    <g className="signal-particles">
      {particles.map(particle => {
        const point = getPointAtLength(pathLength, particle.progress);
        return (
          <circle
            key={particle.id}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#00ff88"
            opacity={particle.opacity}
            filter="url(#glow)"
            style={{
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          >
            <animate
              attributeName="r"
              values="2;4;2"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
      
      {/* グロー効果の定義 */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};