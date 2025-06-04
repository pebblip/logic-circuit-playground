import React, { useMemo } from 'react';
import type { Gate, Wire } from '../../types/circuit';

interface CircuitPreviewProps {
  gates: Gate[];
  wires: Wire[];
  width?: number;
  height?: number;
  backgroundColor?: string;
  showStats?: boolean;
  className?: string;
}

export const CircuitPreview: React.FC<CircuitPreviewProps> = ({
  gates,
  wires,
  width = 200,
  height = 150,
  backgroundColor = '#0a0a0a',
  showStats = false,
  className = '',
}) => {
  const previewSvg = useMemo(() => {
    if (gates.length === 0) {
      return '';
    }

    try {
      // 回路の境界を計算
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      gates.forEach(gate => {
        const padding = 50;
        minX = Math.min(minX, gate.position.x - padding);
        minY = Math.min(minY, gate.position.y - padding);
        maxX = Math.max(maxX, gate.position.x + padding);
        maxY = Math.max(maxY, gate.position.y + padding);
      });

      if (!isFinite(minX)) {
        minX = minY = 0;
        maxX = maxY = 100;
      }

      const viewWidth = maxX - minX;
      const viewHeight = maxY - minY;
      const scale = Math.min(width / viewWidth, height / viewHeight, 1);

      // SVGプレビューを生成
      const svgContent = `
        <svg viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}" 
             width="${width}" height="${height}" 
             style="background: ${backgroundColor}; border-radius: 8px;">
          <defs>
            <pattern id="preview-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="rgba(255, 255, 255, 0.1)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#preview-grid)"/>
          
          <!-- ワイヤー -->
          ${wires
            .map(wire => {
              const fromGate = gates.find(g => g.id === wire.from.gateId);
              const toGate = gates.find(g => g.id === wire.to.gateId);
              if (!fromGate || !toGate) return '';

              // ゲートタイプに応じたピンオフセットを計算
              const fromOffset = getGateOutputOffset(fromGate);
              const toOffset = getGateInputOffset(toGate);

              return `<line x1="${fromGate.position.x + fromOffset.x}" y1="${fromGate.position.y + fromOffset.y}" 
                          x2="${toGate.position.x + toOffset.x}" y2="${toGate.position.y + toOffset.y}"
                          stroke="${wire.isActive ? '#00ff88' : '#444'}" stroke-width="2"/>`;
            })
            .join('')}
          
          <!-- ゲート -->
          ${gates
            .map(gate => {
              const fillColor = getGateFillColor(gate);
              const strokeColor = gate.output ? '#00ff88' : '#444';

              return `<g transform="translate(${gate.position.x}, ${gate.position.y})">
              <rect x="-35" y="-25" width="70" height="50" rx="8" 
                    fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
              <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" 
                    fill="#fff" font-size="12" font-family="monospace">${getGateDisplayText(gate)}</text>
            </g>`;
            })
            .join('')}
        </svg>
      `;

      return svgContent;
    } catch (error) {
      console.error('Preview generation failed:', error);
      return '';
    }
  }, [gates, wires, width, height, backgroundColor]);

  if (gates.length === 0) {
    return (
      <div className={`circuit-preview-empty ${className}`}>
        <span>🔌</span>
        <p>回路が空です</p>
      </div>
    );
  }

  if (!previewSvg) {
    return (
      <div className={`circuit-preview-error ${className}`}>
        <span>⚠️</span>
        <p>プレビューの生成に失敗しました</p>
      </div>
    );
  }

  return (
    <div className={`circuit-preview-container ${className}`}>
      <div 
        className="circuit-preview"
        dangerouslySetInnerHTML={{ __html: previewSvg }} 
      />
      {showStats && (
        <div className="circuit-stats">
          <span className="stat-item">
            <span className="stat-icon">🔲</span>
            {gates.length} ゲート
          </span>
          <span className="stat-item">
            <span className="stat-icon">🔗</span>
            {wires.length} 接続
          </span>
        </div>
      )}
    </div>
  );
};

// ヘルパー関数
function getGateFillColor(gate: Gate): string {
  switch (gate.type) {
    case 'INPUT':
      return gate.output ? '#00ff88' : '#666';
    case 'OUTPUT':
      return '#ff6666';
    case 'CUSTOM':
      return 'rgba(102, 51, 153, 0.3)';
    case 'CLOCK':
      return gate.output ? '#ff9900' : '#664400';
    default:
      return '#1a1a1a';
  }
}

function getGateDisplayText(gate: Gate): string {
  if (gate.type === 'CUSTOM' && gate.customGateDefinition?.displayName) {
    const name = gate.customGateDefinition.displayName;
    return name.length > 8 ? name.substring(0, 8) + '...' : name;
  }
  return gate.type;
}

function getGateOutputOffset(gate: Gate): { x: number; y: number } {
  // ゲートタイプに応じた出力ピンの位置
  return { x: 35, y: 0 };
}

function getGateInputOffset(gate: Gate): { x: number; y: number } {
  // ゲートタイプに応じた入力ピンの位置
  return { x: -35, y: 0 };
}