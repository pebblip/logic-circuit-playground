import React, { useRef } from 'react';
import { Gate } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import { useIsMobile } from '../hooks/useResponsive';

interface GateComponentProps {
  gate: Gate;
}

export const GateComponent: React.FC<GateComponentProps> = ({ gate }) => {
  const { moveGate, selectGate, selectedGateId, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const isMobile = useIsMobile();
  
  // モバイルでは1.4倍、デスクトップでは通常サイズ
  const scaleFactor = isMobile ? 1.4 : 1;

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

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (!isDragging || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const svg = document.querySelector('.canvas') as SVGSVGElement;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = touch.clientX;
      point.y = touch.clientY;
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

    const handleGlobalEnd = () => {
      setIsDragging(false);
      // ドラッグが終わったら少し待ってからフラグをリセット
      setTimeout(() => {
        hasDragged.current = false;
      }, 100);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalEnd);
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

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    
    // ワイヤー描画中で、このゲートから描画している場合は移動を禁止
    const state = useCircuitStore.getState();
    if (state.isDrawingWire && state.wireStart && state.wireStart.gateId === gate.id) {
      return;
    }
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      
      // SVG座標系でのタッチ位置を取得
      const svg = (event.currentTarget as SVGElement).ownerSVGElement;
      if (!svg) return;

      const point = svg.createSVGPoint();
      point.x = touch.clientX;
      point.y = touch.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

      dragStart.current = {
        x: svgPoint.x - gate.position.x,
        y: svgPoint.y - gate.position.y,
      };
      
      setIsDragging(true);
      selectGate(gate.id);
    }
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
            <g onClick={handleInputClick} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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

      case 'CLOCK':
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              {/* 円形デザイン（モックアップに合わせて） */}
              <circle 
                className={`gate ${isSelected ? 'selected' : ''}`}
                cx="0" cy="0" r="40"
                fill="#1a1a1a"
                stroke={isSelected ? '#00aaff' : '#444'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* 時計アイコン */}
              <text x="0" y="-5" className="gate-text" style={{ fontSize: '24px' }}>⏰</text>
              {/* パルス表示 */}
              <path d="M -20 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5" 
                    stroke={gate.output ? '#00ff88' : '#0ff'} 
                    strokeWidth="1.5" 
                    fill="none" 
                    opacity="0.8"/>
            </g>
            
            {/* 出力ピン */}
            <g>
              <circle 
                cx="55" cy="0" r="15" 
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onClick={(e) => handlePinClick(e, 0, true)}
              />
              <circle 
                cx="55" cy="0" r="6" 
                className={`pin ${gate.output ? 'active' : ''}`}
                pointerEvents="none"
              />
              <line x1="40" y1="0" x2="55" y2="0" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
          </g>
        );

      case 'D-FF':
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
              />
              <text className="gate-text" x="0" y="0">D-FF</text>
              {/* ピン名 */}
              <text className="gate-text" x="-35" y="-20" style={{ fontSize: '11px', fill: '#999' }}>D</text>
              <text className="gate-text" x="-35" y="20" style={{ fontSize: '11px', fill: '#999' }}>CLK</text>
              <text className="gate-text" x="40" y="-20" style={{ fontSize: '11px', fill: '#999' }}>Q</text>
              <text className="gate-text" x="40" y="20" style={{ fontSize: '11px', fill: '#999' }}>Q̄</text>
            </g>
            
            {/* 入力ピン - D */}
            <g>
              <circle cx="-60" cy="-20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, false)} />
              <circle cx="-60" cy="-20" r="6" className={`pin ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="-20" x2="-60" y2="-20" className={`pin-line ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 入力ピン - CLK */}
            <g>
              <circle cx="-60" cy="20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 1, false)} />
              <circle cx="-60" cy="20" r="6" className={`pin ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="20" x2="-60" y2="20" className={`pin-line ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            
            {/* 出力ピン - Q */}
            <g>
              <circle cx="60" cy="-20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, true)} />
              <circle cx="60" cy="-20" r="6" className={`pin ${gate.output ? 'active' : ''}`} pointerEvents="none" />
              <line x1="50" y1="-20" x2="60" y2="-20" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 出力ピン - Q̄ (今は単一出力として扱う) */}
          </g>
        );

      case 'SR-LATCH':
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
              />
              <text className="gate-text" x="0" y="-10">SR</text>
              <text className="gate-text" x="0" y="10" style={{ fontSize: '11px', fill: '#999' }}>LATCH</text>
              {/* ピン名 */}
              <text className="gate-text" x="-35" y="-20" style={{ fontSize: '11px', fill: '#999' }}>S</text>
              <text className="gate-text" x="-35" y="20" style={{ fontSize: '11px', fill: '#999' }}>R</text>
              <text className="gate-text" x="40" y="-20" style={{ fontSize: '11px', fill: '#999' }}>Q</text>
              <text className="gate-text" x="40" y="20" style={{ fontSize: '11px', fill: '#999' }}>Q̄</text>
            </g>
            
            {/* 入力ピン - S */}
            <g>
              <circle cx="-60" cy="-20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, false)} />
              <circle cx="-60" cy="-20" r="6" className={`pin ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="-20" x2="-60" y2="-20" className={`pin-line ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 入力ピン - R */}
            <g>
              <circle cx="-60" cy="20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 1, false)} />
              <circle cx="-60" cy="20" r="6" className={`pin ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="20" x2="-60" y2="20" className={`pin-line ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            
            {/* 出力ピン - Q */}
            <g>
              <circle cx="60" cy="-20" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, true)} />
              <circle cx="60" cy="-20" r="6" className={`pin ${gate.output ? 'active' : ''}`} pointerEvents="none" />
              <line x1="50" y1="-20" x2="60" y2="-20" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 出力ピン - Q̄ (今は単一出力として扱う) */}
          </g>
        );

      case 'MUX':
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
              />
              <text className="gate-text" x="0" y="0">MUX</text>
              {/* ピン名 */}
              <text className="gate-text" x="-35" y="-25" style={{ fontSize: '11px', fill: '#999' }}>A</text>
              <text className="gate-text" x="-35" y="0" style={{ fontSize: '11px', fill: '#999' }}>B</text>
              <text className="gate-text" x="-35" y="25" style={{ fontSize: '11px', fill: '#999' }}>S</text>
              <text className="gate-text" x="40" y="0" style={{ fontSize: '11px', fill: '#999' }}>Y</text>
            </g>
            
            {/* 入力ピン - A (I0) */}
            <g>
              <circle cx="-60" cy="-25" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, false)} />
              <circle cx="-60" cy="-25" r="6" className={`pin ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="-25" x2="-60" y2="-25" className={`pin-line ${gate.inputs[0] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 入力ピン - B (I1) */}
            <g>
              <circle cx="-60" cy="0" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 1, false)} />
              <circle cx="-60" cy="0" r="6" className={`pin ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="0" x2="-60" y2="0" className={`pin-line ${gate.inputs[1] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            {/* 入力ピン - S (Select) */}
            <g>
              <circle cx="-60" cy="25" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 2, false)} />
              <circle cx="-60" cy="25" r="6" className={`pin ${gate.inputs[2] === '1' ? 'active' : ''}`} pointerEvents="none" />
              <line x1="-50" y1="25" x2="-60" y2="25" className={`pin-line ${gate.inputs[2] === '1' ? 'active' : ''}`} pointerEvents="none"/>
            </g>
            
            {/* 出力ピン - Y */}
            <g>
              <circle cx="60" cy="0" r="15" fill="transparent" style={{ cursor: 'crosshair' }} onClick={(e) => handlePinClick(e, 0, true)} />
              <circle cx="60" cy="0" r="6" className={`pin ${gate.output ? 'active' : ''}`} pointerEvents="none" />
              <line x1="50" y1="0" x2="60" y2="0" className={`pin-line ${gate.output ? 'active' : ''}`} pointerEvents="none"/>
            </g>
          </g>
        );

      default:
        const inputCount = gate.type === 'NOT' ? 1 : 2;
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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
      className="gate-container"
      data-gate-id={gate.id}
      transform={`translate(${gate.position.x}, ${gate.position.y}) scale(${scaleFactor})`}
    >
      {renderGate()}
    </g>
  );
};