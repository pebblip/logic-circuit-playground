import React, { useState } from 'react';
import { useDiscovery } from '../hooks/useDiscovery';

interface DiscoveryTutorialProps {
  onClose: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'ようこそ！論理回路プレイグラウンドへ',
    content: '論理回路の世界を探検しましょう！ゲートを配置して、新しい発見をしていきます。',
    target: null,
    icon: '👋'
  },
  {
    id: 'place_gate',
    title: '最初のゲートを配置しよう',
    content: '左のパレットからANDゲートをドラッグして、キャンバスに配置してみましょう。',
    target: 'tool-palette',
    icon: '🎯'
  },
  {
    id: 'connect_gates',
    title: 'ゲートを接続しよう',
    content: 'INPUTゲートを2つ配置して、ANDゲートに接続してみましょう。ピンをクリックして線を引きます。',
    target: 'canvas',
    icon: '🔗'
  },
  {
    id: 'toggle_input',
    title: '入力を切り替えよう',
    content: 'INPUTゲートをクリックして、ON/OFFを切り替えてみましょう。ANDゲートの出力が変わります！',
    target: 'input-gate',
    icon: '💡'
  },
  {
    id: 'discoveries',
    title: '発見を集めよう',
    content: '新しいゲートの組み合わせを試すと、発見があります。すべての発見を集めて、新しいゲートをアンロックしましょう！',
    target: 'discovery-counter',
    icon: '✨'
  },
  {
    id: 'notebook',
    title: '実験ノートを使おう',
    content: '気づいたことや面白い回路は、実験ノートに記録しましょう。📔ボタンから開けます。',
    target: 'notebook-button',
    icon: '📔'
  }
];

export const DiscoveryTutorial: React.FC<DiscoveryTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { incrementExperiments } = useDiscovery();
  
  const step = tutorialSteps[currentStep];

  // チュートリアル完了時
  const completeTutorial = () => {
    localStorage.setItem('logic-circuit-tutorial-completed', 'true');
    incrementExperiments(); // 最初の実験としてカウント
    onClose();
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      {/* スポットライト効果（ターゲットがある場合） */}
      {step.target && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
        >
          {/* ここにスポットライト効果を実装 */}
        </div>
      )}

      {/* チュートリアルカード */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(59, 130, 246, 0.5)',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* 進捗インジケーター */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '6px'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index <= currentStep ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* アイコン */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {step.icon}
        </div>

        {/* タイトル */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {step.title}
        </h2>

        {/* 内容 */}
        <p style={{
          fontSize: '16px',
          color: '#cbd5e1',
          lineHeight: '1.6',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {step.content}
        </p>

        {/* ボタン */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              戻る
            </button>
          )}
          
          <button
            onClick={nextStep}
            style={{
              padding: '12px 32px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            {currentStep === tutorialSteps.length - 1 ? '始める！' : '次へ'}
          </button>
        </div>

        {/* スキップボタン */}
        <button
          onClick={completeTutorial}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          スキップ
        </button>
      </div>
    </div>
  );
};

// アニメーション
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
document.head.appendChild(style);