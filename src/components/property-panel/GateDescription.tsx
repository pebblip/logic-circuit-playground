import React from 'react';
import { getGateDescription } from '@/data/gateDescriptions';

interface GateDescriptionProps {
  gateType: string;
}

export const GateDescription: React.FC<GateDescriptionProps> = ({
  gateType,
}) => {
  const data = getGateDescription(gateType);

  return (
    <div
      style={{
        fontSize: '14px',
        lineHeight: '1.7',
        color: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* メインタイトル */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '12px',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
        }}
      >
        <span style={{ fontSize: '24px' }}>{data.icon}</span>
        <h2
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#00ff88',
          }}
        >
          {data.title}
        </h2>
      </div>

      {/* 基本動作 */}
      <div style={{ 
        marginBottom: '32px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(5px)'
      }}>
        <h3
          style={{
            color: '#00ff88',
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ 
            background: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '16px'
          }}>⚡</span>
          基本動作
        </h3>
        <p style={{ margin: 0, lineHeight: '1.7', fontSize: '15px' }}>{data.basicOperation}</p>
        {data.truthTableNote && (
          <div
            style={{
              margin: '16px 0 0 0',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 255, 200, 0.05) 100%)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.6',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(to bottom, #00ff88, #00ffdd)',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
              <span>{data.truthTableNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* 日常的な判断との類比 */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #00ff88',
            paddingLeft: '12px',
          }}
        >
          日常的な判断との類比
        </h3>
        {data.realWorldAnalogy.map((analogy, index) => (
          <div
            key={index}
            style={{
              margin: '8px 0',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderLeft: '3px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '4px',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            {analogy}
          </div>
        ))}
      </div>

      {/* なぜ重要？ */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #00ff88',
            paddingLeft: '12px',
          }}
        >
          なぜ重要？
        </h3>
        <p style={{ margin: 0, lineHeight: '1.6' }}>{data.whyImportant}</p>
      </div>

      {/* 技術的洞察 */}
      {data.technicalInsight && (
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#ff6699',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #ff6699',
              paddingLeft: '12px',
            }}
          >
            技術的洞察
          </h3>
          <p
            style={{
              margin: 0,
              lineHeight: '1.6',
              padding: '12px',
              backgroundColor: 'rgba(255, 102, 153, 0.05)',
              border: '1px solid rgba(255, 102, 153, 0.2)',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            {data.technicalInsight}
          </p>
        </div>
      )}

      {/* 学習のコツ */}
      <div>
        <h3
          style={{
            color: '#ffd700',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #ffd700',
            paddingLeft: '12px',
          }}
        >
          学習のコツ
        </h3>
        <p
          style={{
            margin: 0,
            lineHeight: '1.6',
            padding: '12px',
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          💡 {data.learningTip}
        </p>
      </div>
    </div>
  );
};
