import React, { useState, useEffect } from 'react';
import './QuickTutorial.css';
import type { Gate, Wire } from '../types/circuit';
import { debug } from '../shared/debug';

interface QuickTutorialProps {
  onClose: () => void;
  gates: Gate[];
  wires: Wire[];
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?:
    | 'tool-palette'
    | 'canvas'
    | 'input-gate'
    | 'output-gate'
    | 'gates-area';
  checkCondition?: (gates: Gate[], wires: Wire[]) => boolean;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎯 ようこそ！実際に操作しながら学びましょう',
    content:
      'これから3つのステップで、論理回路の基本操作を体験します。ESCキーでいつでも終了できます。',
    position: 'center',
  },
  {
    id: 'place-input',
    title: 'ステップ 1/3：スイッチを配置',
    content:
      '左のツールパレットから「入力」をドラッグして、キャンバスの左側にドロップしてください。',
    highlight: 'tool-palette',
    checkCondition: gates => gates.some(g => g.type === 'INPUT'),
    position: 'top-left',
  },
  {
    id: 'place-output',
    title: 'ステップ 2/3：ランプを配置',
    content: '次に「出力」をドラッグして、入力の右側に配置してください。',
    highlight: 'tool-palette',
    checkCondition: gates => gates.some(g => g.type === 'OUTPUT'),
    position: 'top-left',
  },
  {
    id: 'connect-wire',
    title: 'ステップ 3/3：接続する',
    content:
      '入力の右側の丸（出力ピン）をクリックして、出力の左側の丸（入力ピン）をクリックすると接続できます。',
    highlight: 'gates-area', // canvasの代わりにゲートエリアをハイライト
    checkCondition: (gates, wires) => wires.length > 0,
    position: 'bottom',
  },
  {
    id: 'toggle-input',
    title: '🎉 完成！動作を確認',
    content:
      '入力をダブルクリックすると、OFF（0）からON（1）に切り替わり、出力も連動して光ります！試してみてください。',
    highlight: 'input-gate',
    checkCondition: gates => {
      const inputGate = gates.find(g => g.type === 'INPUT');
      return inputGate ? inputGate.output === true : false;
    },
    position: 'bottom',
  },
  {
    id: 'complete',
    title: '🌟 基本操作マスター！',
    content:
      'おめでとうございます！これで基本操作は完璧です。学習モードでより深く学ぶか、自由に回路を作成してください。',
    position: 'center',
  },
];

export const QuickTutorial: React.FC<QuickTutorialProps> = ({
  onClose,
  gates,
  wires,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const currentStep = tutorialSteps[currentStepIndex];

  // INPUTゲートの状態を監視するための値
  const inputGateOutput = gates.find(g => g.type === 'INPUT')?.output;

  // 条件を満たしたら自動的に次へ
  useEffect(() => {
    const step = tutorialSteps[currentStepIndex];
    if (!step.checkCondition || !step.checkCondition(gates, wires)) {
      return; // 条件を満たさない場合は早期リターン
    }

    // 少し待ってから次へ（ユーザーが達成感を感じられるように）
    const timer = setTimeout(() => {
      if (currentStepIndex < tutorialSteps.length - 1) {
        // 最後のステップ以外は自動進行
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [gates, wires, currentStepIndex, inputGateOutput]);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // ESCキーで終了
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ハイライトの位置を動的に更新
  useEffect(() => {
    const updateHighlightPosition = () => {
      if (!currentStep.highlight) {
        setHighlightStyle({});
        return;
      }

      switch (currentStep.highlight) {
        case 'tool-palette': {
          // 入出力セクションを動的に探す（複数のパターンに対応）
          const sections = document.querySelectorAll('.section-title');
          let ioSection: Element | null = null;
          sections.forEach(section => {
            const text = section.textContent || '';
            if (
              text.includes('入出力') ||
              text.includes('INPUT') ||
              text.includes('I/O')
            ) {
              ioSection = section;
            }
          });

          if (ioSection) {
            const rect = (ioSection as HTMLElement).getBoundingClientRect();
            const toolsGrid = (ioSection as HTMLElement)
              .nextElementSibling as HTMLElement | null;
            const gridRect = toolsGrid?.getBoundingClientRect();

            debug.log('入出力セクション位置:', {
              section: rect,
              grid: gridRect,
              text: (ioSection as HTMLElement).textContent,
            });

            setHighlightStyle({
              top: `${rect.top - 16}px`, // より大きめの余白
              left: `${rect.left - 16}px`,
              width: `${rect.width + 32}px`, // 左右により大きな余白
              height: `${(gridRect?.bottom || rect.bottom) - rect.top + 32}px`, // 上下により大きな余白
            });
          }
          break;
        }

        case 'canvas': {
          const canvas = document.querySelector('.canvas-container');
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            debug.log('キャンバス位置:', rect);

            // キャンバスの中央付近をハイライト（上部に寄りすぎないように）
            setHighlightStyle({
              top: `${rect.top + 50}px`, // 上部の余白を追加
              left: `${rect.left + 20}px`, // 少し内側に
              width: `${Math.min(rect.width - 40, 600)}px`, // 幅を制限
              height: `${Math.min(rect.height - 100, 300)}px`, // 高さを制限して中央付近のみ
            });
          }
          break;
        }

        case 'input-gate': {
          const inputGate = gates.find(g => g.type === 'INPUT');
          if (inputGate) {
            // SVG要素の座標を画面座標に変換
            const svg = document.querySelector('.canvas') as SVGSVGElement;
            const canvasContainer = document.querySelector('.canvas-container');
            if (svg && canvasContainer) {
              const _canvasRect = canvasContainer.getBoundingClientRect();
              const svgRect = svg.getBoundingClientRect();

              // viewBoxとSVGの実際のサイズから比率を計算
              const viewBox = svg.viewBox.baseVal;
              const scaleX = svgRect.width / viewBox.width;
              const scaleY = svgRect.height / viewBox.height;

              // 実際の画面座標を計算
              const screenX =
                svgRect.left + (inputGate.position.x - viewBox.x) * scaleX;
              const screenY =
                svgRect.top + (inputGate.position.y - viewBox.y) * scaleY;

              debug.log('INPUTゲート位置:', {
                gate: inputGate.position,
                screen: { x: screenX, y: screenY },
                viewBox,
                scale: { x: scaleX, y: scaleY },
              });

              setHighlightStyle({
                top: `${screenY - 30}px`, // より大きめの余白
                left: `${screenX - 30}px`,
                width: '160px', // 少し大きめに
                height: '120px',
              });
            }
          }
          break;
        }

        case 'gates-area': {
          // 配置されたゲートの周辺をハイライト
          if (gates.length > 0) {
            const svg = document.querySelector('.canvas') as SVGSVGElement;
            const canvasContainer = document.querySelector('.canvas-container');
            if (svg && canvasContainer) {
              const svgRect = svg.getBoundingClientRect();
              const viewBox = svg.viewBox.baseVal;
              const scaleX = svgRect.width / viewBox.width;
              const scaleY = svgRect.height / viewBox.height;

              // すべてのゲートの位置から範囲を計算
              let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
              gates.forEach(gate => {
                const x = gate.position.x;
                const y = gate.position.y;
                minX = Math.min(minX, x - 50);
                minY = Math.min(minY, y - 50);
                maxX = Math.max(maxX, x + 150);
                maxY = Math.max(maxY, y + 100);
              });

              // 画面座標に変換
              const screenMinX = svgRect.left + (minX - viewBox.x) * scaleX;
              const screenMinY = svgRect.top + (minY - viewBox.y) * scaleY;
              const width = (maxX - minX) * scaleX;
              const height = (maxY - minY) * scaleY;

              setHighlightStyle({
                top: `${screenMinY}px`,
                left: `${screenMinX}px`,
                width: `${width}px`,
                height: `${height}px`,
              });
            }
          }
          break;
        }

        default:
          setHighlightStyle({});
      }
    };

    // 初回実行
    updateHighlightPosition();

    // ウィンドウリサイズ時に再計算
    window.addEventListener('resize', updateHighlightPosition);

    // 少し遅延させて実行（DOMが更新されるのを待つ）
    const timer = setTimeout(updateHighlightPosition, 200); // 少し長めに待つ

    return () => {
      window.removeEventListener('resize', updateHighlightPosition);
      clearTimeout(timer);
    };
  }, [currentStep.highlight, gates]);

  return (
    <>
      {/* 半透明オーバーレイ（操作可能） */}
      <div className="quick-tutorial-overlay-transparent" />

      {/* ハイライト（最初に配置してz-indexを最も低く） */}
      {currentStep.highlight && (
        <div className="tutorial-highlight" style={highlightStyle} />
      )}

      {/* チュートリアルパネル */}
      <div
        className={`quick-tutorial-panel ${currentStep.position || 'center'}`}
      >
        <div className="tutorial-header">
          <div className="tutorial-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentStepIndex + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
            <span className="progress-text">
              {currentStepIndex > 0 && currentStepIndex <= 3
                ? `${currentStepIndex}/3`
                : ''}
            </span>
          </div>
          <button className="tutorial-close" onClick={handleSkip}>
            ×
          </button>
        </div>

        <div className="tutorial-content">
          <h3 className="tutorial-title">{currentStep.title}</h3>
          <p className="tutorial-text">{currentStep.content}</p>

          {/* 条件を満たした時の成功表示 */}
          {currentStep.checkCondition &&
            currentStep.checkCondition(gates, wires) &&
            currentStepIndex < 4 && (
              <div className="tutorial-success">✅ よくできました！</div>
            )}
        </div>

        <div className="tutorial-actions">
          {currentStepIndex === 0 && (
            <button className="tutorial-button primary" onClick={handleNext}>
              始める
            </button>
          )}
          {currentStepIndex === tutorialSteps.length - 1 && (
            <button className="tutorial-button primary" onClick={handleNext}>
              完了
            </button>
          )}
        </div>

        {currentStepIndex > 0 &&
          currentStepIndex < tutorialSteps.length - 1 && (
            <button className="tutorial-skip" onClick={handleSkip}>
              スキップ
            </button>
          )}
      </div>
    </>
  );
};
