import React, { useEffect, useRef, useCallback } from 'react';
import { CircuitMetadata } from '../data/gallery';
import type { Gate, Wire } from '@/types/circuit';
import { GateComponent } from '../../../components/Gate';
import { WireComponent } from '../../../components/Wire';
import { formatCircuitWithAnimation } from '../../../domain/circuit/layout';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@domain/simulation/core/types';
import './GalleryCanvas.css';

interface GalleryCanvasProps {
  circuit: CircuitMetadata | null;
}

// EnhancedHybridEvaluatorのインスタンスを作成
const enhancedEvaluator = new EnhancedHybridEvaluator({
  strategy: 'AUTO_SELECT',
  enableDebugLogging: false,
});

export const GalleryCanvas: React.FC<GalleryCanvasProps> = ({ circuit }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [displayGates, setDisplayGates] = React.useState<Gate[]>([]);
  const [displayWires, setDisplayWires] = React.useState<Wire[]>([]);
  const [needsFormatting, setNeedsFormatting] = React.useState(false);
  const animationRef = useRef<number | null>(null);
  const displayWiresRef = useRef<Wire[]>([]);
  const displayGatesRef = useRef<Gate[]>([]);

  // 入力ゲートをクリックした時の処理
  const handleInputClick = useCallback((gateId: string) => {
    // 開発時のみデバッグ情報を表示
    if (import.meta.env.DEV) {
      console.log('クリックされたゲート:', gateId);
      const circuitInfo = enhancedEvaluator.analyzeCircuit({
        gates: displayGates,
        wires: displayWires
      });
      console.log('回路解析:', circuitInfo);
    }
    
    setDisplayGates(prevGates => {
      const newGates = prevGates.map(gate => {
        if (gate.id === gateId && gate.type === 'INPUT') {
          return { ...gate, output: !gate.output };
        }
        return gate;
      });

      // 回路を評価して出力を更新
      const circuitData: Circuit = {
        gates: newGates,
        wires: displayWires
      };

      const evaluationResult = enhancedEvaluator.evaluate(circuitData);
      const updatedCircuit = evaluationResult.circuit;
      
      // ワイヤーのアクティブ状態も更新
      setDisplayWires([...updatedCircuit.wires]);
      displayWiresRef.current = [...updatedCircuit.wires];
      displayGatesRef.current = [...updatedCircuit.gates];
      return [...updatedCircuit.gates];
    });
  }, [displayWires, displayGates]);

  // 回路が変更されたときに表示をリセット
  useEffect(() => {
    if (circuit) {
      // 深いコピーを作成して表示用に使用
      const gates = circuit.gates.map(g => ({ ...g }));
      const wires = circuit.wires.map(w => ({ ...w }));
      
      // 初期状態で回路を評価
      const circuitData: Circuit = { gates, wires };
      const evaluationResult = enhancedEvaluator.evaluate(circuitData);
      const updatedCircuit = evaluationResult.circuit;
      
      setDisplayGates([...updatedCircuit.gates]);
      setDisplayWires([...updatedCircuit.wires]);
      displayWiresRef.current = [...updatedCircuit.wires];
      displayGatesRef.current = [...updatedCircuit.gates];
      
      // ゲートが重なっている可能性があるかチェック
      const positions = new Map<string, { x: number; y: number }>();
      let hasOverlap = false;
      
      for (const gate of gates) {
        const key = `${Math.round(gate.position.x / 50)},${Math.round(gate.position.y / 50)}`;
        if (positions.has(key)) {
          hasOverlap = true;
          break;
        }
        positions.set(key, gate.position);
      }
      
      setNeedsFormatting(hasOverlap || gates.length > 10);
    } else {
      setDisplayGates([]);
      setDisplayWires([]);
      displayWiresRef.current = [];
      displayGatesRef.current = [];
      setNeedsFormatting(false);
    }
  }, [circuit]);
  
  // アニメーション対応（CLOCKゲート + オシレーター回路）
  useEffect(() => {
    const hasClockGate = displayGatesRef.current.some(g => g.type === 'CLOCK');
    const hasOscillatorComponents = displayGatesRef.current.some(g => 
      g.type === 'DELAY' || 
      circuit?.title.includes('オシレータ') ||
      circuit?.title.includes('カオス') ||
      circuit?.title.includes('メモリ')
    );
    
    if (hasClockGate || hasOscillatorComponents) {
      let lastUpdateTime = 0;
      let evaluationCount = 0;
      
      const animate = () => {
        const now = Date.now();
        
        // CLOCKゲート：100ms毎、オシレーター：200ms毎に更新
        const updateInterval = hasClockGate ? 100 : 200;
        
        if (now - lastUpdateTime > updateInterval) {
          lastUpdateTime = now;
          evaluationCount++;
          
          // 🔧 refから最新のゲート状態を取得（クロージャ問題を回避）
          const currentGates = [...displayGatesRef.current];
          let needsUpdate = false;
          
          // CLOCKゲートの更新
          currentGates.forEach(gate => {
            if (gate.type === 'CLOCK' && gate.metadata?.frequency) {
              const frequency = gate.metadata.frequency as number;
              const period = 1000 / frequency;
              const shouldBeOn = Math.floor(now / period) % 2 === 0;
              
              if (gate.output !== shouldBeOn) {
                gate.output = shouldBeOn;
                needsUpdate = true;
              }
            }
          });
          
          // オシレーター回路：定期的に評価して状態を更新
          if (hasOscillatorComponents) {
            needsUpdate = true; // オシレーター回路は常に評価
          }
          
          if (needsUpdate) {
            const circuitData: Circuit = { gates: currentGates, wires: displayWiresRef.current };
            
            try {
              const evaluationResult = enhancedEvaluator.evaluate(circuitData);
              const updatedCircuit = evaluationResult.circuit;
              
              // 🔧 ゲートとワイヤーを同期的に更新（バッチ更新で競合状態を回避）
              setDisplayGates([...updatedCircuit.gates]);
              setDisplayWires([...updatedCircuit.wires]);
              displayWiresRef.current = [...updatedCircuit.wires];
              displayGatesRef.current = [...updatedCircuit.gates];
              
              // デバッグ情報（開発時のみ）
              if (import.meta.env.DEV && hasOscillatorComponents && evaluationCount % 10 === 0) {
                const delayGates = updatedCircuit.gates.filter(g => g.type === 'DELAY');
                if (delayGates.length > 0) {
                  console.log(`オシレーター評価 ${evaluationCount}:`, 
                    delayGates.map(g => `${g.id}=${g.output ? '1' : '0'}`).join(', '));
                }
              }
            } catch (error) {
              console.error('ギャラリー回路評価エラー:', error);
            }
          }
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circuit]); // circuitが変更された時のみ再実行

  // 自動フォーマット機能
  const handleAutoFormat = () => {
    if (displayGates.length === 0) return;
    
    formatCircuitWithAnimation(displayGates, displayWires, (gateId, position) => {
      setDisplayGates(prev => prev.map(gate => 
        gate.id === gateId ? { ...gate, position } : gate
      ));
    });
    
    setNeedsFormatting(false);
  };

  if (!circuit) {
    return (
      <div className="gallery-canvas-empty">
        <div className="empty-message">
          <span className="empty-icon">📋</span>
          <h3>回路を選択してください</h3>
          <p>左のリストから回路を選択すると、ここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-canvas-container">
      {/* ツールバー */}
      <div className="gallery-canvas-toolbar">
        <div className="toolbar-title">
          <span className="toolbar-icon">🎮</span>
          <span>インタラクティブプレビュー</span>
        </div>
        {needsFormatting && (
          <button className="format-button" onClick={handleAutoFormat}>
            🔧 自動整形
          </button>
        )}
      </div>

      {/* キャンバス */}
      <svg
        ref={svgRef}
        className="gallery-canvas"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* グリッド背景 */}
        <defs>
          <pattern
            id="gallery-grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="rgba(255, 255, 255, 0.2)" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gallery-grid)" />

        {/* ワイヤー */}
        {displayWires.map((wire) => (
          <WireComponent
            key={wire.id}
            wire={wire}
            gates={displayGates}
          />
        ))}

        {/* ゲート */}
        {displayGates.map((gate) => (
          <GateComponent
            key={gate.id}
            gate={gate}
            isHighlighted={false}
            onInputClick={handleInputClick}
          />
        ))}
      </svg>

      {/* 循環回路の情報 */}
      {circuit.id.includes('oscillator') || circuit.id.includes('latch') || 
       circuit.id.includes('counter') || circuit.id.includes('chaos') || 
       circuit.id.includes('memory') || circuit.id.includes('mandala') ? (
        <div className="cyclical-warning" style={{ background: 'rgba(0, 255, 136, 0.1)', borderColor: '#00ff88' }}>
          <span className="warning-icon">ℹ️</span>
          <span>この回路は循環構造を持ちます - イベント駆動シミュレーションで動作中</span>
        </div>
      ) : null}
    </div>
  );
};