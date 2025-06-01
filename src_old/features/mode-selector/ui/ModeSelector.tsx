import React, { CSSProperties } from 'react';
import { saveUserPreferences } from '../../../shared/lib/utils/circuitStorage';

interface Mode {
  id: string;
  title: string;
  description: string;
  features: string[];
  color: string;
}

interface ModeSelectorProps {
  onModeSelected: (mode: string) => void;
}

/**
 * 初回起動時のモード選択画面
 */
const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelected }) => {
  const modes: Mode[] = [
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

  const handleModeSelect = (mode: string): void => {
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

  const containerStyle: CSSProperties = {
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
  };

  const contentStyle: CSSProperties = {
    maxWidth: '900px',
    width: '90%',
    padding: '40px',
    textAlign: 'center'
  };

  const titleStyle: CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif'
  };

  const subtitleStyle: CSSProperties = {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '48px',
    lineHeight: '1.6'
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  const footerStyle: CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '32px'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>
          論理回路プレイグラウンド
        </h1>
        
        <p style={subtitleStyle}>
          あなたに合ったモードを選んでください
        </p>
        
        <div style={gridStyle}>
          {modes.map(mode => (
            <ModeCard
              key={mode.id}
              mode={mode}
              onSelect={handleModeSelect}
            />
          ))}
        </div>
        
        <p style={footerStyle}>
          ※ モードは後から設定画面で変更できます
        </p>
      </div>
    </div>
  );
};

interface ModeCardProps {
  mode: Mode;
  onSelect: (modeId: string) => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ mode, onSelect }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: CSSProperties = {
    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    border: `2px solid ${isHovered ? mode.color : 'transparent'}`,
    borderRadius: '16px',
    padding: '32px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
  };

  const gradientStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${mode.color}00, ${mode.color}, ${mode.color}00)`,
    opacity: 0.8
  };

  const titleStyle: CSSProperties = {
    fontSize: '28px',
    fontWeight: '600',
    color: mode.color,
    marginBottom: '12px'
  };

  const descriptionStyle: CSSProperties = {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    lineHeight: '1.5'
  };

  const featureListStyle: CSSProperties = {
    textAlign: 'left',
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const featureStyle: CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
    paddingLeft: '20px',
    position: 'relative'
  };

  const checkmarkStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    color: mode.color
  };

  const buttonStyle: CSSProperties = {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: mode.color,
    color: '#000',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    opacity: isHovered ? 1 : 0.9,
    transition: 'opacity 0.2s'
  };

  return (
    <div
      style={cardStyle}
      onClick={() => onSelect(mode.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={gradientStyle} />
      
      <h2 style={titleStyle}>
        {mode.title}
      </h2>
      
      <p style={descriptionStyle}>
        {mode.description}
      </p>
      
      <ul style={featureListStyle}>
        {mode.features.map((feature, index) => (
          <li key={index} style={featureStyle}>
            <span style={checkmarkStyle}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <div style={buttonStyle}>
        選択
      </div>
    </div>
  );
};

export default ModeSelector;