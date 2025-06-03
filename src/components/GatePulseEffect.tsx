import React, { useState, useEffect } from 'react';

interface GatePulseEffectProps {
  x: number;
  y: number;
  active: boolean;
  prevActive: boolean;
}

export const GatePulseEffect: React.FC<GatePulseEffectProps> = ({
  x,
  y,
  active,
  prevActive,
}) => {
  const [pulses, setPulses] = useState<
    { id: string; scale: number; opacity: number }[]
  >([]);

  // 状態が変化した時にパルスを生成
  useEffect(() => {
    if (active !== prevActive) {
      const newPulse = {
        id: `pulse-${Date.now()}`,
        scale: 1,
        opacity: 0.8,
      };
      setPulses(prev => [...prev, newPulse]);
    }
  }, [active, prevActive]);

  // パルスのアニメーション
  useEffect(() => {
    if (pulses.length === 0) return;

    const animationFrame = requestAnimationFrame(function animate() {
      setPulses(prev =>
        prev
          .map(pulse => ({
            ...pulse,
            scale: pulse.scale + 0.03,
            opacity: pulse.opacity - 0.02,
          }))
          .filter(pulse => pulse.opacity > 0)
      );

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [pulses.length]);

  return (
    <g className="gate-pulse-effects" pointerEvents="none">
      {pulses.map(pulse => (
        <circle
          key={pulse.id}
          cx={x}
          cy={y}
          r={30}
          fill="none"
          stroke={active ? '#00ff88' : '#ff0066'}
          strokeWidth="2"
          opacity={pulse.opacity}
          transform={`scale(${pulse.scale})`}
          style={{
            transformOrigin: `${x}px ${y}px`,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </g>
  );
};
