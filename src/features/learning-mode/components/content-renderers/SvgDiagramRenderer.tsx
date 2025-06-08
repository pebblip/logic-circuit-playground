import React from 'react';
import type { SvgDiagramContent } from '@/types/lesson-content';

interface SvgDiagramRendererProps {
  content: SvgDiagramContent;
}

export const SvgDiagramRenderer: React.FC<SvgDiagramRendererProps> = ({ content }) => {
  const width = content.width || 400;
  const height = content.height || 200;

  if (content.diagramType === 'series-circuit') {
    // 直列回路（ANDゲート用）
    return (
      <div className="svg-diagram-container">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* 背景 */}
          <rect width={width} height={height} fill="#1a1a1a" />
          
          {/* 電源 */}
          <rect x="20" y="80" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="50" y="105" textAnchor="middle" fill="#fff" fontSize="14">電源</text>
          
          {/* 配線：電源 → スイッチA */}
          <line x1="80" y1="100" x2="120" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* スイッチA */}
          <rect x="120" y="80" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="150" y="105" textAnchor="middle" fill="#fff" fontSize="14">スイッチA</text>
          
          {/* 配線：スイッチA → スイッチB */}
          <line x1="180" y1="100" x2="220" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* スイッチB */}
          <rect x="220" y="80" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="250" y="105" textAnchor="middle" fill="#fff" fontSize="14">スイッチB</text>
          
          {/* 配線：スイッチB → ランプ */}
          <line x1="280" y1="100" x2="320" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* ランプ */}
          <circle cx="350" cy="100" r="25" fill="#333" stroke="#666" strokeWidth="2" />
          <text x="350" y="105" textAnchor="middle" fill="#fff" fontSize="20">💡</text>
        </svg>
      </div>
    );
  } else if (content.diagramType === 'parallel-circuit') {
    // 並列回路（ORゲート用）
    return (
      <div className="svg-diagram-container">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* 背景 */}
          <rect width={width} height={height} fill="#1a1a1a" />
          
          {/* 電源 */}
          <rect x="20" y="80" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="50" y="105" textAnchor="middle" fill="#fff" fontSize="14">電源</text>
          
          {/* 分岐点 */}
          <circle cx="100" cy="100" r="3" fill="#666" />
          
          {/* 配線：電源 → 分岐点 */}
          <line x1="80" y1="100" x2="100" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* 上の経路：分岐点 → スイッチA */}
          <line x1="100" y1="100" x2="100" y2="60" stroke="#666" strokeWidth="2" />
          <line x1="100" y1="60" x2="140" y2="60" stroke="#666" strokeWidth="2" />
          
          {/* スイッチA */}
          <rect x="140" y="40" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="170" y="65" textAnchor="middle" fill="#fff" fontSize="14">スイッチA</text>
          
          {/* 配線：スイッチA → 合流点 */}
          <line x1="200" y1="60" x2="240" y2="60" stroke="#666" strokeWidth="2" />
          <line x1="240" y1="60" x2="240" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* 下の経路：分岐点 → スイッチB */}
          <line x1="100" y1="100" x2="100" y2="140" stroke="#666" strokeWidth="2" />
          <line x1="100" y1="140" x2="140" y2="140" stroke="#666" strokeWidth="2" />
          
          {/* スイッチB */}
          <rect x="140" y="120" width="60" height="40" fill="#333" stroke="#666" strokeWidth="2" rx="4" />
          <text x="170" y="145" textAnchor="middle" fill="#fff" fontSize="14">スイッチB</text>
          
          {/* 配線：スイッチB → 合流点 */}
          <line x1="200" y1="140" x2="240" y2="140" stroke="#666" strokeWidth="2" />
          <line x1="240" y1="140" x2="240" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* 合流点 */}
          <circle cx="240" cy="100" r="3" fill="#666" />
          
          {/* 配線：合流点 → ランプ */}
          <line x1="240" y1="100" x2="320" y2="100" stroke="#666" strokeWidth="2" />
          
          {/* ランプ */}
          <circle cx="350" cy="100" r="25" fill="#333" stroke="#666" strokeWidth="2" />
          <text x="350" y="105" textAnchor="middle" fill="#fff" fontSize="20">💡</text>
        </svg>
      </div>
    );
  } else if (content.customSvg) {
    // カスタムSVG
    return (
      <div className="svg-diagram-container" dangerouslySetInnerHTML={{ __html: content.customSvg }} />
    );
  }

  return null;
};