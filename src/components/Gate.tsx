import React, { useRef } from 'react';
import { Gate } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';

interface GateComponentProps {
  gate: Gate;
}

export const GateComponent: React.FC<GateComponentProps> = ({ gate }) => {
  const { moveGate, selectGate, selectedGateId, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  React.useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      // SVG要素を取得
      const svg = document.querySelector('.canvas') as SVGSVGElement;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

      const newPosition = {
        x: svgPoint.x - dragStart.current.x,
        y: svgPoint.y - dragStart.current.y,
      };
      
      // 実際に移動した場合はフラグを立てる
      const distance = Math.sqrt(
        Math.pow(newPosition.x - gate.position.x, 2) + 
        Math.pow(newPosition.y - gate.position.y, 2)
      );
      if (distance > 5) {
        hasDragged.current = true;
      }
      
      moveGate(gate.id, newPosition);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      // ドラッグが終わったら少し待ってからフラグをリセット
      setTimeout(() => {
        hasDragged.current = false;
      }, 100);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, gate.id, gate.position, moveGate]);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    
    // ワイヤー描画中で、このゲートから描画している場合は移動を禁止
    const state = useCircuitStore.getState();
    if (state.isDrawingWire && state.wireStart && state.wireStart.gateId === gate.id) {
      return;
    }
    
    // SVG座標系でのマウス位置を取得
    const svg = (event.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

    dragStart.current = {
      x: svgPoint.x - gate.position.x,
      y: svgPoint.y - gate.position.y,
    };
    
    setIsDragging(true);
    selectGate(gate.id);
  };

  const handlePinClick = (event: React.MouseEvent, pinIndex: number, isOutput: boolean) => {
    event.stopPropagation();
    event.preventDefault();
    
    // 出力ピンの場合は -1 を使用
    const actualPinIndex = isOutput ? -1 : pinIndex;
    
    if (useCircuitStore.getState().isDrawingWire) {
      endWireDrawing(gate.id, actualPinIndex);
    } else {
      startWireDrawing(gate.id, actualPinIndex);
    }
  };

  const handleInputClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // ドラッグが発生した場合はトグルしない
    if (gate.type === 'INPUT' && !hasDragged.current) {
      updateGateOutput(gate.id, !gate.output);
    }
  };

  const renderGate = () => {
    const isSelected = selectedGateId === gate.id;

    switch (gate.type) {
      case 'INPUT':
        return (
          <g>
            <g onClick={handleInputClick} onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`switch-track ${gate.output ? 'active' : ''}`}
                x="-25" y="-15" width="50" height="30" rx="15"
                fill={gate.output ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
                stroke={gate.output ? '#00ff88' : '#444'}
                strokeWidth="2"
              />
              <circle 
                className={`switch-thumb ${gate.output ? 'active' : ''}`}
                cx={gate.output ? 10 : -10} cy="0" r="10"
                fill={gate.output ? '#00ff88' : '#666'}
              />
            </g>
            {/* 出力ピン */}
            <g>
              <circle 
                cx="35" cy="0" r="15" 
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onClick={(e) => handlePinClick(e, 0, true)}
              />
              <circle 
                cx="35" cy="0" r="6" 
                className={`pin ${gate.output ? 'active' : ''}`}
                pointerEvents="none"
              />
              <line x1="25" y1="0" x2="35" y2="0" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
          </g>
        );

      case 'OUTPUT':
        return (
          <g>
            <g onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <circle cx="0" cy="0" r="20" fill="#1a1a1a" stroke="#444" strokeWidth="2"/>
              <circle cx="0" cy="0" r="15" fill={gate.inputs[0] === '1' ? '#00ff88' : '#333'}/>
              <text x="0" y="5" className="gate-text" style={{ fontSize: '20px' }}>💡</text>
            </g>
            {/* 入力ピン */}
            <g>
              <circle 
                cx="-30" cy="0" r="15" 
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onClick={(e) => handlePinClick(e, 0, false)}
              />
              <circle 
                cx="-30" cy="0" r="6" 
                className={`pin ${gate.inputs[0] === '1' ? 'active' : ''}`}
                pointerEvents="none"
              />
              <line x1="-20" y1="0" x2="-30" y2="0" className={`pin-line ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
          </g>
        );

      default:
        const inputCount = gate.type === 'NOT' ? 1 : 2;
        return (
          <g>
            <g onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-35" y="-25" width="70" height="50" rx="8"
              />
              <text className="gate-text" x="0" y="0">{gate.type}</text>
            </g>
            
            {/* 入力ピン */}
            {Array.from({ length: inputCount }).map((_, index) => {
              const y = inputCount === 1 ? 0 : index === 0 ? -10 : 10;
              return (
                <g key={`input-${index}`}>
                  {/* クリック領域を大きくするための透明な円 */}
                  <circle 
                    cx="-45" cy={y} r="15" 
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onClick={(e) => handlePinClick(e, index, false)}
                  />
                  <circle 
                    cx="-45" cy={y} r="6" 
                    className={`pin ${gate.inputs[index] === '1' ? 'active' : ''}`}
                    pointerEvents="none"
                  />
                  <line x1="-35" y1={y} x2="-45" y2={y} className={`pin-line ${gate.inputs[index] === '1' ? 'active' : ''}`} pointerEvents="none"/>
                </g>
              );
            })}
            
            {/* 出力ピン */}
            <g>
              {/* クリック領域を大きくするための透明な円 */}
              <circle 
                cx="45" cy="0" r="15" 
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onClick={(e) => handlePinClick(e, 0, true)}
              />
              <circle 
                cx="45" cy="0" r="6" 
                className={`pin ${gate.output ? 'active' : ''}`}
                pointerEvents="none"
              />
              <line x1="35" y1="0" x2="45" y2="0" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
          </g>
        );
    }
  };

  return (
    <g
      transform={`translate(${gate.position.x}, ${gate.position.y})`}
    >
      {renderGate()}
    </g>
  );
};