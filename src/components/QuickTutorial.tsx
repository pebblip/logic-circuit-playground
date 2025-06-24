import React, { useState, useEffect } from 'react';
import './QuickTutorial.css';
import type { Gate, Wire } from '../types/circuit';
import { debug } from '../shared/debug';
import { TERMS } from '../features/learning-mode/data/terms';

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
    | 'basic-gates'
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
    content: `これから5つのステップで、${TERMS.LOGIC_CIRCUIT}の基本操作を体験します。ESCキーでいつでも終了できます。`,
    position: 'center',
  },
  {
    id: 'place-input',
    title: `ステップ 1/5：${TERMS.INPUT}を配置`,
    content: `左のツールパレットから「${TERMS.INPUT}」を${TERMS.DRAG_AND_DROP}して、キャンバスの左側にドロップしてください。`,
    highlight: 'tool-palette',
    checkCondition: gates => gates.some(g => g.type === 'INPUT'),
    position: 'top-left',
  },
  {
    id: 'place-output',
    title: `ステップ 2/5：${TERMS.OUTPUT}を配置`,
    content: `次に「${TERMS.OUTPUT}」を${TERMS.DRAG}して、${TERMS.INPUT}の右側に${TERMS.PLACE}してください。`,
    highlight: 'tool-palette',
    checkCondition: gates => gates.some(g => g.type === 'OUTPUT'),
    position: 'top-left',
  },
  {
    id: 'connect-wire',
    title: `ステップ 3/5：${TERMS.CONNECTION}する`,
    content: `${TERMS.INPUT}の${TERMS.RIGHT_CIRCLE}（${TERMS.OUTPUT_PIN}）を${TERMS.CLICK}して、${TERMS.OUTPUT}の${TERMS.LEFT_CIRCLE}（${TERMS.INPUT_PIN}）を${TERMS.CLICK}すると${TERMS.CONNECTION}できます。`,
    highlight: 'gates-area',
    checkCondition: (gates, wires) => wires.length > 0,
    position: 'bottom',
  },
  {
    id: 'toggle-input',
    title: `ステップ 4/5：動作を確認`,
    content: `${TERMS.INPUT}を${TERMS.DOUBLE_CLICK}すると、${TERMS.OFF}（0）から${TERMS.ON}（1）に切り替わり、${TERMS.OUTPUT}も連動して光ります！試してみてください。`,
    highlight: 'input-gate',
    checkCondition: gates => {
      const inputGate = gates.find(g => g.type === 'INPUT');
      return inputGate ? (inputGate.outputs?.[0] ?? false) === true : false;
    },
    position: 'bottom',
  },
  {
    id: 'and-gate-experience',
    title: `ステップ 5/5：${TERMS.LOGIC_GATE}を体験`,
    content: `最後に、${TERMS.AND}${TERMS.GATE}を体験してみましょう！まず、もう一つ${TERMS.INPUT}を追加し、次に「${TERMS.AND}」${TERMS.GATE}を${TERMS.PLACE}して、2つの${TERMS.INPUT}を${TERMS.AND}${TERMS.GATE}に${TERMS.CONNECTION}してください。両方の${TERMS.INPUT}が${TERMS.ON}の時だけ${TERMS.OUTPUT}が光ることを確認しましょう。`,
    highlight: 'basic-gates',
    checkCondition: (gates, wires) => {
      const hasAndGate = gates.some(g => g.type === 'AND');
      const hasMultipleInputs =
        gates.filter(g => g.type === 'INPUT').length >= 2;
      const hasConnections = wires.length >= 3; // 入力2つ→AND, AND→出力
      return hasAndGate && hasMultipleInputs && hasConnections;
    },
    position: 'top-left',
  },
  {
    id: 'complete',
    title: `🌟 ${TERMS.LOGIC_CIRCUIT}マスター！`,
    content: `おめでとうございます！基本操作と${TERMS.LOGIC_GATE}の動作を理解しました。\n\n次は${TERMS.LEARNING_MODE}で21の体系的な${TERMS.LESSON}を受講するか、${TERMS.FREE_MODE}で自由に${TERMS.CIRCUIT}を作成してください。\n\n${TERMS.LOGIC_CIRCUIT}の世界は奥深く、創造性次第で無限の可能性があります！`,
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
  const inputGateOutput =
    gates.find(g => g.type === 'INPUT')?.outputs?.[0] ?? false;

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
              text.includes(TERMS.INPUT_OUTPUT) ||
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

            debug.log(`${TERMS.INPUT_OUTPUT}セクション位置:`, {
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

        case 'basic-gates': {
          // 基本ゲートセクションを動的に探す
          const sections = document.querySelectorAll('.section-title');
          let basicSection: Element | null = null;
          sections.forEach(section => {
            const text = section.textContent || '';
            if (
              text.includes('基本ゲート') ||
              text.includes('基本') ||
              text.includes('BASIC')
            ) {
              basicSection = section;
            }
          });

          if (basicSection) {
            const rect = (basicSection as HTMLElement).getBoundingClientRect();
            const toolsGrid = (basicSection as HTMLElement)
              .nextElementSibling as HTMLElement | null;
            const gridRect = toolsGrid?.getBoundingClientRect();

            debug.log('基本ゲートセクション位置:', {
              section: rect,
              grid: gridRect,
              text: (basicSection as HTMLElement).textContent,
            });

            setHighlightStyle({
              top: `${rect.top - 16}px`, // より大きめの余白
              left: `${rect.left - 16}px`,
              width: `${rect.width + 32}px`, // 左右より大きな余白
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
              // const canvasRect = canvasContainer.getBoundingClientRect(); - position calculation unused
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
