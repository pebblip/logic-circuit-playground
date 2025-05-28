import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CircuitViewModel } from '../../viewmodels/CircuitViewModel';
import { GateComponent } from './GateComponent.jsx';
import { ConnectionComponent } from './ConnectionComponent.jsx';

const GRID_SIZE = 20;

export const CircuitCanvas = ({ viewModel }) => {
  const svgRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    gateId: null,
    offset: { x: 0, y: 0 }
  });
  const [wireDrawing, setWireDrawing] = useState({
    isDrawing: false,
    fromGateId: null,
    fromPinId: null,
    fromPinType: null,
    currentPos: { x: 0, y: 0 }
  });
  const [hoveredGateId, setHoveredGateId] = useState(null);
  const [hoveredPinInfo, setHoveredPinInfo] = useState(null);

  // Helper function to get mouse position relative to SVG
  const getMousePosition = useCallback((e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Snap position to grid
  const snapToGrid = useCallback((pos) => ({
    x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE
  }), []);

  // Gate drag handling
  const handleGateMouseDown = useCallback((e, gateId) => {
    e.stopPropagation();
    const gate = viewModel.getCircuit().getGate(gateId);
    if (!gate) return;

    const mousePos = getMousePosition(e);
    setDragState({
      isDragging: true,
      gateId,
      offset: {
        x: mousePos.x - gate.position.x,
        y: mousePos.y - gate.position.y
      }
    });

    // Handle selection
    if (!e.shiftKey && !viewModel.isGateSelected(gateId)) {
      viewModel.clearSelection();
    }
    viewModel.selectGate(gateId);
  }, [viewModel, getMousePosition]);

  // Pin click handling for wire creation
  const handlePinClick = useCallback((e, gateId, pinId, pinType) => {
    e.stopPropagation();

    if (wireDrawing.isDrawing) {
      // Complete wire connection
      if (wireDrawing.fromPinType !== pinType) {
        const fromGate = wireDrawing.fromPinType === 'output' ? wireDrawing.fromGateId : gateId;
        const fromPin = wireDrawing.fromPinType === 'output' ? wireDrawing.fromPinId : pinId;
        const toGate = wireDrawing.fromPinType === 'output' ? gateId : wireDrawing.fromGateId;
        const toPin = wireDrawing.fromPinType === 'output' ? pinId : wireDrawing.fromPinId;

        try {
          viewModel.addConnection(fromGate, fromPin, toGate, toPin);
        } catch (error) {
          console.error('Failed to create connection:', error);
        }
      }
      setWireDrawing({
        isDrawing: false,
        fromGateId: null,
        fromPinId: null,
        fromPinType: null,
        currentPos: { x: 0, y: 0 }
      });
    } else {
      // Start wire drawing
      const mousePos = getMousePosition(e);
      setWireDrawing({
        isDrawing: true,
        fromGateId: gateId,
        fromPinId: pinId,
        fromPinType: pinType,
        currentPos: mousePos
      });
    }
  }, [wireDrawing, viewModel, getMousePosition]);

  // Mouse move handling
  const handleMouseMove = useCallback((e) => {
    const mousePos = getMousePosition(e);

    if (dragState.isDragging && dragState.gateId) {
      const newPos = snapToGrid({
        x: mousePos.x - dragState.offset.x,
        y: mousePos.y - dragState.offset.y
      });
      viewModel.moveGate(dragState.gateId, newPos);
    }

    if (wireDrawing.isDrawing) {
      setWireDrawing(prev => ({
        ...prev,
        currentPos: mousePos
      }));
    }
  }, [dragState, wireDrawing.isDrawing, viewModel, getMousePosition, snapToGrid]);

  // Mouse up handling
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      gateId: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  // Canvas click handling
  const handleCanvasClick = useCallback((e) => {
    if (e.target === svgRef.current) {
      viewModel.clearSelection();
      if (wireDrawing.isDrawing) {
        setWireDrawing({
          isDrawing: false,
          fromGateId: null,
          fromPinId: null,
          fromPinType: null,
          currentPos: { x: 0, y: 0 }
        });
      }
    }
  }, [viewModel, wireDrawing.isDrawing]);

  // Connection click handling
  const handleConnectionClick = useCallback((e, connectionId) => {
    e.stopPropagation();
    if (!e.shiftKey) {
      viewModel.clearSelection();
    }
    viewModel.selectConnection(connectionId);
  }, [viewModel]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && wireDrawing.isDrawing) {
        setWireDrawing({
          isDrawing: false,
          fromGateId: null,
          fromPinId: null,
          fromPinType: null,
          currentPos: { x: 0, y: 0 }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wireDrawing.isDrawing]);

  // Get wire start position for drawing
  const getWireStartPosition = useCallback(() => {
    if (!wireDrawing.fromGateId || !wireDrawing.fromPinId) return { x: 0, y: 0 };
    
    const gate = viewModel.getCircuit().getGate(wireDrawing.fromGateId);
    if (!gate) return { x: 0, y: 0 };

    const pin = wireDrawing.fromPinType === 'output' 
      ? gate.outputs.find(p => p.id === wireDrawing.fromPinId)
      : gate.inputs.find(p => p.id === wireDrawing.fromPinId);

    if (!pin) return { x: 0, y: 0 };

    const pinOffset = wireDrawing.fromPinType === 'output' ? 100 : 0;
    const pinIndex = wireDrawing.fromPinType === 'output'
      ? gate.outputs.indexOf(pin)
      : gate.inputs.indexOf(pin);
    const pinY = 20 + pinIndex * 20;

    return {
      x: gate.position.x + pinOffset,
      y: gate.position.y + pinY
    };
  }, [wireDrawing, viewModel]);

  const circuit = viewModel.getCircuit();
  const selectedGateIds = viewModel.getSelectedGates().map(g => g.id);
  const selectedConnectionIds = viewModel.getSelectedConnections().map(c => c.id);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      className="bg-[#0f1441]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ cursor: dragState.isDragging ? 'grabbing' : 'default' }}
    >
      {/* Grid pattern */}
      <defs>
        <pattern
          id="grid"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="0.5" fill="rgba(255, 255, 255, 0.05)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Connections */}
      {circuit.getConnections().map(connection => {
        const fromGate = circuit.getGate(connection.fromGateId);
        const toGate = circuit.getGate(connection.toGateId);
        if (!fromGate || !toGate) return null;

        const fromPin = fromGate.outputs.find(p => p.id === connection.fromPinId);
        const toPin = toGate.inputs.find(p => p.id === connection.toPinId);
        if (!fromPin || !toPin) return null;

        const fromIndex = fromGate.outputs.indexOf(fromPin);
        const toIndex = toGate.inputs.indexOf(toPin);

        const from = {
          x: fromGate.position.x + 100,
          y: fromGate.position.y + 20 + fromIndex * 20
        };
        const to = {
          x: toGate.position.x,
          y: toGate.position.y + 20 + toIndex * 20
        };

        return (
          <g
            key={connection.id}
            data-connection-id={connection.id}
            onClick={(e) => handleConnectionClick(e, connection.id)}
            style={{ cursor: 'pointer' }}
          >
            <ConnectionComponent
              from={from}
              to={to}
              value={fromPin.value}
              isSelected={selectedConnectionIds.includes(connection.id)}
            />
          </g>
        );
      })}

      {/* Temporary wire while drawing */}
      {wireDrawing.isDrawing && (
        <ConnectionComponent
          from={getWireStartPosition()}
          to={wireDrawing.currentPos}
          value={false}
          isSelected={false}
          className="temp-wire"
          style={{ pointerEvents: 'none', opacity: 0.6 }}
        />
      )}

      {/* Gates */}
      {circuit.getGates().map(gate => (
        <g
          key={gate.id}
          data-gate-id={gate.id}
          transform={`translate(${gate.position.x}, ${gate.position.y})`}
          onMouseDown={(e) => handleGateMouseDown(e, gate.id)}
          onMouseEnter={() => setHoveredGateId(gate.id)}
          onMouseLeave={() => setHoveredGateId(null)}
          style={{ cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
        >
          <GateComponent
            gate={gate}
            isSelected={selectedGateIds.includes(gate.id)}
            isHovered={hoveredGateId === gate.id}
            onPinClick={handlePinClick}
            onPinHover={setHoveredPinInfo}
          />
        </g>
      ))}
    </svg>
  );
};