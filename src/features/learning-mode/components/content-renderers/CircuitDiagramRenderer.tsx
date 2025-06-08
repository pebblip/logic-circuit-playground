import React from 'react';
import type { DiagramContent } from '../../../../types/lesson-content';
import '../../ui/CircuitDiagram.css';

interface CircuitDiagramRendererProps {
  content: DiagramContent;
}

/**
 * SVGベースの回路図レンダラー
 * ASCIIアートの代替として、ブラウザで確実に表示される図を生成
 */
export const CircuitDiagramRenderer: React.FC<CircuitDiagramRendererProps> = ({
  content,
}) => {
  // 回路図タイプに応じてSVGを動的生成
  const renderDiagram = () => {
    switch (content.diagramType) {
      case 'simple-connection':
        return renderSimpleConnection();
      case 'gate-symbol':
        return renderGateSymbol(content.gateType);
      case 'truth-table-visual':
        return renderTruthTableVisual(content.data);
      case 'signal-flow':
        return renderSignalFlow(content.signals);
      case 'custom':
        return renderCustomSvg(content.customSvg);
      default:
        return null;
    }
  };

  // シンプルな接続図
  const renderSimpleConnection = () => (
    <svg viewBox="0 0 400 100" className="circuit-diagram">
      {/* 入力 */}
      <rect x="20" y="30" width="80" height="40" fill="#2a2a2a" stroke="#00ff88" strokeWidth="2" rx="4" />
      <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="14">入力</text>
      <circle cx="100" cy="50" r="4" fill="#00ff88" />
      
      {/* 配線 */}
      <line x1="100" y1="50" x2="300" y2="50" stroke="#00ff88" strokeWidth="2" />
      
      {/* 出力 */}
      <circle cx="300" cy="50" r="4" fill="#00ff88" />
      <rect x="300" y="30" width="80" height="40" fill="#2a2a2a" stroke="#00ff88" strokeWidth="2" rx="4" />
      <text x="340" y="55" textAnchor="middle" fill="#fff" fontSize="14">出力</text>
    </svg>
  );

  // ゲートシンボル
  const renderGateSymbol = (gateType?: string) => {
    switch (gateType) {
      case 'AND':
        return (
          <svg viewBox="0 0 200 100" className="circuit-diagram">
            <path d="M 50 20 L 100 20 Q 130 50 100 80 L 50 80 Z" 
                  fill="#2a2a2a" stroke="#00ff88" strokeWidth="2" />
            <text x="75" y="55" textAnchor="middle" fill="#fff" fontSize="14">AND</text>
            {/* 入力ピン */}
            <circle cx="50" cy="35" r="3" fill="#00ff88" />
            <circle cx="50" cy="65" r="3" fill="#00ff88" />
            {/* 出力ピン */}
            <circle cx="130" cy="50" r="3" fill="#00ff88" />
          </svg>
        );
      case 'OR':
        return (
          <svg viewBox="0 0 200 100" className="circuit-diagram">
            <path d="M 50 20 Q 70 50 50 80 L 80 80 Q 130 50 80 20 Z" 
                  fill="#2a2a2a" stroke="#00ff88" strokeWidth="2" />
            <text x="75" y="55" textAnchor="middle" fill="#fff" fontSize="16">≥1</text>
            <circle cx="50" cy="35" r="3" fill="#00ff88" />
            <circle cx="50" cy="65" r="3" fill="#00ff88" />
            <circle cx="130" cy="50" r="3" fill="#00ff88" />
          </svg>
        );
      case 'NOT':
        return (
          <svg viewBox="0 0 200 100" className="circuit-diagram">
            <path d="M 50 50 L 100 30 L 100 70 Z" 
                  fill="#2a2a2a" stroke="#00ff88" strokeWidth="2" />
            <circle cx="110" cy="50" r="8" fill="none" stroke="#00ff88" strokeWidth="2" />
            <circle cx="50" cy="50" r="3" fill="#00ff88" />
            <circle cx="118" cy="50" r="3" fill="#00ff88" />
          </svg>
        );
      default:
        return null;
    }
  };

  // 真理値表のビジュアル表現
  const renderTruthTableVisual = (data?: any[][]) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="truth-table-visual">
        <table className="truth-table">
          <thead>
            <tr>
              {data[0].map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={cell === '1' ? 'active' : ''}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 信号フロー図
  const renderSignalFlow = (signals?: any[]) => {
    return (
      <svg viewBox="0 0 400 150" className="circuit-diagram">
        {/* アナログ信号 */}
        <text x="20" y="30" fill="#fff" fontSize="12">アナログ:</text>
        <path d="M 20 50 Q 40 30, 60 50 T 100 50 Q 120 70, 140 50 T 180 50" 
              fill="none" stroke="#ff6b6b" strokeWidth="2" />
        
        {/* デジタル信号 */}
        <text x="220" y="30" fill="#fff" fontSize="12">デジタル:</text>
        <path d="M 220 50 L 240 50 L 240 30 L 260 30 L 260 50 L 280 50 L 280 70 L 300 70 L 300 50 L 320 50" 
              fill="none" stroke="#00ff88" strokeWidth="2" />
        
        {/* 説明 */}
        <text x="100" y="100" textAnchor="middle" fill="#888" fontSize="10">連続的な変化</text>
        <text x="270" y="100" textAnchor="middle" fill="#888" fontSize="10">0と1の2値のみ</text>
      </svg>
    );
  };

  // カスタムSVG
  const renderCustomSvg = (customSvg?: string) => {
    if (!customSvg) return null;
    
    return (
      <div dangerouslySetInnerHTML={{ __html: customSvg }} />
    );
  };

  return (
    <div className={`circuit-diagram-container ${content.className || ''}`}>
      {content.title && <div className="diagram-title">{content.title}</div>}
      <div className="diagram-content">
        {renderDiagram()}
      </div>
      {content.caption && <div className="diagram-caption">{content.caption}</div>}
    </div>
  );
};