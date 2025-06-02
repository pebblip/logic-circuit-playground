import React, { useRef } from 'react';
import { Gate } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import { useIsMobile } from '../hooks/useResponsive';
import { isCustomGate } from '../types/gates';
import { GateFactory } from '../models/gates/GateFactory';

interface GateComponentProps {
  gate: Gate;
}

export const GateComponent: React.FC<GateComponentProps> = ({ gate }) => {
  const { moveGate, selectGate, selectedGateId, startWireDrawing, endWireDrawing, updateGateOutput, updateClockFrequency } = useCircuitStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const isMobile = useIsMobile();
  
  // モバイルでは2倍、デスクトップでは通常サイズ
  const scaleFactor = isMobile ? 2 : 1;

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
    
    console.log('Pin clicked:', { gateId: gate.id, gateType: gate.type, pinIndex, isOutput });
    
    // カスタムゲートの場合、pinIndexは既に正しい値（出力:負、入力:正）
    // 通常ゲートの場合、出力ピンは-1、入力ピンはインデックスをそのまま使用
    let actualPinIndex: number;
    
    if (gate.type === 'CUSTOM') {
      // カスタムゲートは既に正しいインデックスが渡されている
      actualPinIndex = pinIndex;
    } else {
      // 通常ゲートは出力ピンの場合のみ-1を使用
      actualPinIndex = isOutput ? -1 : pinIndex;
    }
    
    console.log('Actual pin index used:', actualPinIndex);
    
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

  const [showFrequencyMenu, setShowFrequencyMenu] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  // メニューを外部クリックで閉じる
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showFrequencyMenu) {
        setShowFrequencyMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showFrequencyMenu]);

  const handleClockRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (gate.type === 'CLOCK' && !hasDragged.current) {
      setShowFrequencyMenu(!showFrequencyMenu);
    }
  };

  const handleFrequencySelect = (frequency: number) => {
    updateClockFrequency(gate.id, frequency);
    setShowFrequencyMenu(false);
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
        const frequency = gate.metadata?.frequency || 1;
        const animDuration = `${1 / frequency}s`; // 周波数に応じたアニメーション速度
        return (
          <g>
            <g 
              onMouseDown={handleMouseDown} 
              onTouchStart={handleTouchStart} 
              onContextMenu={handleClockRightClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* 円形デザイン */}
              <circle 
                className={`gate ${isSelected ? 'selected' : ''}`}
                cx="0" cy="0" r="40"
                fill="#1a1a1a"
                stroke={isSelected ? '#00aaff' : '#00ff88'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              {/* パルス表示 */}
              <circle cx="0" cy="0" r="37" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.3">
                <animate attributeName="r" from="37" to="45" dur={animDuration} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur={animDuration} repeatCount="indefinite" />
              </circle>
              
              {/* 時計アイコン */}
              <text x="0" y="5" className="gate-text" style={{ fontSize: '24px' }}>⏰</text>
              
              {/* 波線アニメーション */}
              <g>
                <path 
                  d="M -25 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5 v-8 h5 v8 h5" 
                  stroke={gate.output ? '#00ff88' : '#0ff'} 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.8"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="10 0"
                    dur={animDuration}
                    repeatCount="indefinite"
                  />
                </path>
                {/* 複製して流れる効果を強化 */}
                <path 
                  d="M -35 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5 v-8 h5 v8 h5" 
                  stroke={gate.output ? '#00ff88' : '#0ff'} 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.4"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="10 0"
                    dur={animDuration}
                    repeatCount="indefinite"
                  />
                </path>
              </g>
              
              {/* ホバー時のみ周波数表示 */}
              {isHovering && (
                <text x="0" y="35" className="gate-text" style={{ fontSize: '10px', fill: '#00ff88' }}>
                  {frequency}Hz (右クリックで変更)
                </text>
              )}
            </g>
            
            {/* 右クリックメニュー */}
            {showFrequencyMenu && (
              <g transform="translate(50, -30)">
                <rect 
                  x="-25" y="-15" width="50" height="50" rx="5"
                  fill="#2a2a2a" 
                  stroke="#00ff88" 
                  strokeWidth="1"
                />
                {[1, 2, 10].map((freq, index) => (
                  <g key={freq}>
                    <rect 
                      x="-20" y={-10 + index * 15} width="40" height="12" rx="2"
                      fill={frequency === freq ? '#00ff88' : 'transparent'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFrequencySelect(freq)}
                    />
                    <text 
                      x="0" y={-2 + index * 15} 
                      className="gate-text" 
                      style={{ 
                        fontSize: '10px', 
                        fill: frequency === freq ? '#1a1a1a' : '#00ff88',
                        textAnchor: 'middle',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleFrequencySelect(freq)}
                    >
                      {freq}Hz
                    </text>
                  </g>
                ))}
              </g>
            )}
            
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

      case 'CUSTOM':
        if (!isCustomGate(gate) || !gate.customGateDefinition) {
          return null;
        }
        
        const definition = gate.customGateDefinition;
        const size = GateFactory.getGateSize(gate);
        const halfWidth = size.width / 2;
        const halfHeight = size.height / 2;
        
        return (
          <g>
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              {/* カスタムゲートの外側境界（モックアップの二重境界線） */}
              <rect 
                className="custom-gate-border"
                x={-halfWidth - 2} y={-halfHeight - 2} 
                width={size.width + 4} height={size.height + 4} 
                rx="10"
                fill="none"
                stroke="#6633cc"
                strokeWidth="4"
                opacity="0.3"
              />
              
              {/* カスタムゲートの本体 */}
              <rect 
                className={`custom-gate ${isSelected ? 'selected' : ''}`}
                x={-halfWidth} y={-halfHeight} 
                width={size.width} height={size.height} 
                rx="8"
                fill="rgba(102, 51, 153, 0.1)"
                stroke="#6633cc"
                strokeWidth="2"
              />
              
              {/* 表示名（外側上部） */}
              <text className="gate-text" x="0" y={-halfHeight - 8} fill="#00ff88" fontSize="12px" fontWeight="600">
                {definition.displayName.length > 12 ? definition.displayName.substring(0, 12) + '...' : definition.displayName}
              </text>
              
              {/* アイコン */}
              {definition.icon && (
                <text x="0" y="0" className="gate-text" style={{ fontSize: '18px' }}>
                  {definition.icon}
                </text>
              )}
            </g>
            
            {/* 入力ピン */}
            {definition.inputs.map((inputPin, index) => {
              const pinCount = definition.inputs.length;
              const availableHeight = Math.max(40, size.height - 80); // ストアと統一
              const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
              const y = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (index * spacing);
              
              return (
                <g key={`input-${index}`}>
                  <circle 
                    cx={-halfWidth - 10} cy={y} r="15" 
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onClick={(e) => handlePinClick(e, index, false)}
                  />
                  <circle 
                    cx={-halfWidth - 10} cy={y} r="6" 
                    className={`pin ${gate.inputs[index] === '1' ? 'active' : ''}`}
                    pointerEvents="none"
                  />
                  <line 
                    x1={-halfWidth} y1={y} x2={-halfWidth - 10} y2={y} 
                    className={`pin-line ${gate.inputs[index] === '1' ? 'active' : ''}`} 
                    pointerEvents="none"
                  />
                  {/* ピン名 */}
                  <text 
                    x={-halfWidth + 10} y={y + 3} 
                    className="gate-text" 
                    style={{ fontSize: '10px', fill: '#999' }}
                  >
                    {inputPin.name}
                  </text>
                </g>
              );
            })}
            
            {/* 出力ピン */}
            {definition.outputs.map((outputPin, index) => {
              const pinCount = definition.outputs.length;
              const availableHeight = Math.max(40, size.height - 80); // ストアと統一
              const spacing = pinCount === 1 ? 0 : Math.max(30, availableHeight / Math.max(1, pinCount - 1));
              const y = pinCount === 1 ? 0 : (-((pinCount - 1) * spacing) / 2) + (index * spacing);
              
              return (
                <g key={`output-${index}`}>
                  <circle 
                    cx={halfWidth + 10} cy={y} r="15" 
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onClick={(e) => handlePinClick(e, -(index + 1), true)}
                  />
                  <circle 
                    cx={halfWidth + 10} cy={y} r="6" 
                    className={`pin ${gate.output ? 'active' : ''}`}
                    pointerEvents="none"
                  />
                  <line 
                    x1={halfWidth} y1={y} x2={halfWidth + 10} y2={y} 
                    className={`pin-line ${gate.output ? 'active' : ''}`} 
                    pointerEvents="none"
                  />
                  {/* ピン名 */}
                  <text 
                    x={halfWidth - 10} y={y + 3} 
                    className="gate-text" 
                    style={{ fontSize: '10px', fill: '#999', textAnchor: 'end' }}
                  >
                    {outputPin.name}
                  </text>
                </g>
              );
            })}
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

  const isSelected = selectedGateId === gate.id;
  
  return (
    <g
      className="gate-container"
      data-gate-id={gate.id}
      transform={`translate(${gate.position.x}, ${gate.position.y}) scale(${scaleFactor})`}
    >
      {/* 選択枠 */}
      {isSelected && (
        <rect
          x={gate.type === 'CUSTOM' && gate.customGateDefinition ? -gate.customGateDefinition.width/2 - 10 : -55}
          y={gate.type === 'CUSTOM' && gate.customGateDefinition ? -gate.customGateDefinition.height/2 - 10 : -35}
          width={gate.type === 'CUSTOM' && gate.customGateDefinition ? gate.customGateDefinition.width + 20 : 110}
          height={gate.type === 'CUSTOM' && gate.customGateDefinition ? gate.customGateDefinition.height + 20 : 70}
          fill="none"
          stroke="#00aaff"
          strokeWidth="2"
          strokeDasharray="5,5"
          pointerEvents="none"
        />
      )}
      {renderGate()}
    </g>
  );
};