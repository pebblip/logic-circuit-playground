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
  const originalPosition = useRef({ x: 0, y: 0 });
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
      // ドラッグ終了時、位置が変わっていたら履歴に保存
      if (hasDragged.current) {
        const currentPosition = gate.position;
        const distanceMoved = Math.sqrt(
          Math.pow(currentPosition.x - originalPosition.current.x, 2) + 
          Math.pow(currentPosition.y - originalPosition.current.y, 2)
        );
        
        if (distanceMoved > 5) {
          // 位置が実際に変わった場合のみ履歴に保存
          moveGate(gate.id, currentPosition, true);
        }
      }
      
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
    
    // ドラッグ開始時の位置を記録
    originalPosition.current = { ...gate.position };
    
    setIsDragging(true);
  };

  // ゲート選択用のクリックハンドラー（ドラッグと分離）
  const handleGateClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Gate clicked:', gate.id, 'hasDragged:', hasDragged.current);
    // 常に選択を実行（デバッグ用に一時的に変更）
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
      
      // ドラッグ開始時の位置を記録
      originalPosition.current = { ...gate.position };
      
      setIsDragging(true);
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
    // シングルクリックでは選択のみ
    if (gate.type === 'INPUT' && !hasDragged.current) {
      selectGate(gate.id);
    }
  };

  const handleInputDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // ダブルクリックでスイッチ切り替え
    if (gate.type === 'INPUT' && !hasDragged.current) {
      updateGateOutput(gate.id, !gate.output);
    }
  };

  const [isHovering, setIsHovering] = React.useState(false);

  const renderGate = () => {
    const isSelected = selectedGateId === gate.id;

    switch (gate.type) {
      case 'INPUT':
        return (
          <g>
            <g onClick={handleInputClick} onDoubleClick={handleInputDoubleClick} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`switch-track ${gate.output ? 'active' : ''}`}
                x="-25" y="-15" width="50" height="30" rx="15"
                fill={gate.output ? 'rgba(0, 255, 136, 0.1)' : '#1a1a1a'}
                stroke={isSelected ? '#00aaff' : (gate.output ? '#00ff88' : '#444')}
                strokeWidth={isSelected ? '3' : '2'}
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <circle cx="0" cy="0" r="20" fill="#1a1a1a" stroke={isSelected ? '#00aaff' : '#444'} strokeWidth={isSelected ? '3' : '2'}/>
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
            {/* メインコンテンツ（視覚的要素のみ、pointer-events無効） */}
            <g pointerEvents="none">
              {/* 円形デザイン */}
              <circle 
                className={`gate ${isSelected ? 'selected' : ''}`}
                cx="0" cy="0" r="40"
                fill="#1a1a1a"
                stroke={isSelected ? '#00aaff' : '#444'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              
              {/* 時計アイコン */}
              <text x="0" y="-5" className="gate-text" style={{ fontSize: '24px' }}>⏰</text>
              
              {/* パルス波形表示 */}
              <path d="M -20 20 h5 v-8 h5 v8 h5 v-8 h5 v8 h5" 
                    stroke={gate.output ? '#00ff88' : '#0ff'} 
                    strokeWidth="1.5" 
                    fill="none" 
                    opacity="0.8"/>
              
              {/* パルス表示（アニメーション） */}
              <circle cx="0" cy="0" r="37" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.3">
                <animate attributeName="r" from="37" to="45" dur={animDuration} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur={animDuration} repeatCount="indefinite" />
              </circle>
              
              {/* ホバー時のみ周波数表示 */}
              {isHovering && (
                <text x="0" y="35" className="gate-text" style={{ fontSize: '10px', fill: '#00ff88' }}>
                  {frequency}Hz
                </text>
              )}
            </g>
            
            {/* クリック専用の透明エリア（最上位） */}
            <circle 
              cx="0" cy="0" r="45"
              fill="transparent"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown} 
              onTouchStart={handleTouchStart} 
              onClick={handleGateClick}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            />
            
            
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
                stroke={isSelected ? '#00aaff' : undefined}
                strokeWidth={isSelected ? '3' : undefined}
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
                stroke={isSelected ? '#00aaff' : undefined}
                strokeWidth={isSelected ? '3' : undefined}
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-50" y="-40" width="100" height="80" rx="8"
                stroke={isSelected ? '#00aaff' : undefined}
                strokeWidth={isSelected ? '3' : undefined}
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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
                stroke={isSelected ? '#00aaff' : '#6633cc'}
                strokeWidth={isSelected ? '3' : '2'}
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
            <g onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleGateClick} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <rect 
                className={`gate ${isSelected ? 'selected' : ''}`}
                x="-35" y="-25" width="70" height="50" rx="8"
                stroke={isSelected ? '#00aaff' : undefined}
                strokeWidth={isSelected ? '3' : undefined}
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
      {renderGate()}
    </g>
  );
};