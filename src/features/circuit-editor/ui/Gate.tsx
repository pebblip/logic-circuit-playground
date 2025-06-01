import React, { useState } from 'react';
import { GateData } from '../../../entities/types';

interface GateProps {
  gate: GateData;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onToggleInput?: () => void;
  onPinClick: (pinId: string, x: number, y: number) => void;
}

const GateComponent: React.FC<GateProps> = ({ gate, isSelected, onSelect, onPositionChange, onToggleInput, onPinClick }) => {
  // ゲートのサイズ
  const width = 70;
  const height = 50;
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    
    // SVG座標系でのマウス位置を取得
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setDragOffset({
      x: svgP.x - gate.position.x,
      y: svgP.y - gate.position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    onPositionChange({
      x: svgP.x - dragOffset.x,
      y: svgP.y - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // OUTPUTゲート（LED）の特別な描画
  if (gate.type === 'OUTPUT') {
    return (
      <g
        transform={`translate(${gate.position.x}, ${gate.position.y})`}
        onMouseDown={handleMouseDown}
        className="cursor-move"
      >
        {/* LED外枠 */}
        <circle
          cx={0}
          cy={0}
          r={20}
          fill="#1a1a1a"
          stroke={isSelected ? '#00ff88' : '#444'}
          strokeWidth={isSelected ? 3 : 2}
        />
        
        {/* LED内部 */}
        <circle
          cx={0}
          cy={0}
          r={15}
          fill={gate.inputs[0]?.value ? '#00ff88' : '#333'}
          className="transition-all duration-300"
          style={{
            filter: gate.inputs[0]?.value ? 'drop-shadow(0 0 15px rgba(0, 255, 136, 1))' : 'none'
          }}
        />
        
        {/* LEDアイコン */}
        <text
          x={0}
          y={2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          className="pointer-events-none select-none"
        >
          💡
        </text>
        
        {/* 入力ピン */}
        {gate.inputs.length > 0 && (
          <g
            onClick={(e) => {
              e.stopPropagation();
              const x = gate.position.x - 30;
              const y = gate.position.y;
              onPinClick(gate.inputs[0].id, x, y);
            }}
            className="cursor-pointer"
          >
            {/* ヒットエリア（透明な大きな円） */}
            <circle
              cx={-30}
              cy={0}
              r={15}
              fill="transparent"
              className="hover:fill-gray-800 hover:fill-opacity-50"
            />
            <circle
              cx={-30}
              cy={0}
              r={6}
              fill={gate.inputs[0]?.value ? '#00ff88' : 'none'}
              stroke={gate.inputs[0]?.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
            <line
              x1={-20}
              y1={0}
              x2={-30}
              y2={0}
              stroke={gate.inputs[0]?.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
          </g>
        )}
        
        {/* ラベル */}
        <text
          x={0}
          y={-30}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
          className="pointer-events-none select-none"
        >
          {gate.label || 'OUTPUT'}
        </text>
      </g>
    );
  }

  // INPUTゲート（スイッチ）の特別な描画
  if (gate.type === 'INPUT') {
    return (
      <g
        transform={`translate(${gate.position.x}, ${gate.position.y})`}
        onMouseDown={handleMouseDown}
        className="cursor-move"
      >
        {/* スイッチトラック */}
        <rect
          x={-25}
          y={-15}
          width={50}
          height={30}
          rx={15}
          fill={gate.value ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
          stroke={isSelected ? '#00ff88' : (gate.value ? '#00ff88' : '#444')}
          strokeWidth={isSelected ? 3 : 2}
          onClick={(e) => {
            e.stopPropagation();
            onToggleInput?.();
          }}
          className="cursor-pointer"
        />
        
        {/* スイッチサム */}
        <circle
          cx={gate.value ? 5 : -5}
          cy={0}
          r={10}
          fill={gate.value ? '#00ff88' : '#666'}
          className="transition-all duration-300"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* 出力ピン */}
        {gate.outputs.length > 0 && (
          <g
            onClick={(e) => {
              e.stopPropagation();
              const x = gate.position.x + 35;
              const y = gate.position.y;
              onPinClick(gate.outputs[0].id, x, y);
            }}
            className="cursor-pointer"
          >
            {/* ヒットエリア（透明な大きな円） */}
            <circle
              cx={35}
              cy={0}
              r={15}
              fill="transparent"
              className="hover:fill-gray-800 hover:fill-opacity-50"
            />
            <circle
              cx={35}
              cy={0}
              r={6}
              fill={gate.outputs[0]?.value ? '#00ff88' : 'none'}
              stroke={gate.outputs[0]?.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
            <line
              x1={25}
              y1={0}
              x2={35}
              y2={0}
              stroke={gate.outputs[0]?.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
          </g>
        )}
        
        {/* ラベル */}
        <text
          x={0}
          y={-25}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
          className="pointer-events-none select-none"
        >
          {gate.label || 'INPUT'}
        </text>
      </g>
    );
  }

  // 通常のゲート描画
  return (
    <g
      transform={`translate(${gate.position.x}, ${gate.position.y})`}
      onMouseDown={handleMouseDown}
      className="cursor-move"
    >
      {/* ゲート本体 */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        fill="#1a1a1a"
        stroke={isSelected ? '#00ff88' : '#444'}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-200"
      />

      {/* ゲート名 */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="600"
        className="pointer-events-none select-none"
      >
        {gate.type}
      </text>

      {/* 入力ピン */}
      {gate.inputs.map((input, index) => {
        const yOffset = (index - (gate.inputs.length - 1) / 2) * 20;
        return (
          <g 
            key={input.id}
            onClick={(e) => {
              e.stopPropagation();
              const x = gate.position.x - width / 2 - 10;
              const y = gate.position.y + yOffset;
              onPinClick(input.id, x, y);
            }}
            className="cursor-pointer"
          >
            {/* ヒットエリア（透明な大きな円） */}
            <circle
              cx={-width / 2 - 10}
              cy={yOffset}
              r={15}
              fill="transparent"
              className="hover:fill-gray-800 hover:fill-opacity-50"
            />
            <circle
              cx={-width / 2 - 10}
              cy={yOffset}
              r={6}
              fill={input.value ? '#00ff88' : 'none'}
              stroke="#666"
              strokeWidth={2}
            />
            <line
              x1={-width / 2}
              y1={yOffset}
              x2={-width / 2 - 10}
              y2={yOffset}
              stroke="#666"
              strokeWidth={2}
            />
          </g>
        );
      })}

      {/* 出力ピン */}
      {gate.outputs.map((output, index) => {
        const yOffset = (index - (gate.outputs.length - 1) / 2) * 20;
        return (
          <g
            key={output.id}
            onClick={(e) => {
              e.stopPropagation();
              const x = gate.position.x + width / 2 + 10;
              const y = gate.position.y + yOffset;
              onPinClick(output.id, x, y);
            }}
            className="cursor-pointer"
          >
            {/* ヒットエリア（透明な大きな円） */}
            <circle
              cx={width / 2 + 10}
              cy={yOffset}
              r={15}
              fill="transparent"
              className="hover:fill-gray-800 hover:fill-opacity-50"
            />
            <circle
              cx={width / 2 + 10}
              cy={yOffset}
              r={6}
              fill={output.value ? '#00ff88' : 'none'}
              stroke={output.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
            <line
              x1={width / 2}
              y1={yOffset}
              x2={width / 2 + 10}
              y2={yOffset}
              stroke={output.value ? '#00ff88' : '#666'}
              strokeWidth={2}
            />
          </g>
        );
      })}
    </g>
  );
};

// パフォーマンス最適化のためのメモ化
export const Gate = React.memo(GateComponent, (prevProps, nextProps) => {
  return (
    prevProps.gate.id === nextProps.gate.id &&
    prevProps.gate.position.x === nextProps.gate.position.x &&
    prevProps.gate.position.y === nextProps.gate.position.y &&
    prevProps.gate.type === nextProps.gate.type &&
    prevProps.gate.value === nextProps.gate.value &&
    prevProps.isSelected === nextProps.isSelected &&
    // 入力・出力の値も比較
    JSON.stringify(prevProps.gate.inputs) === JSON.stringify(nextProps.gate.inputs) &&
    JSON.stringify(prevProps.gate.outputs) === JSON.stringify(nextProps.gate.outputs)
  );
});