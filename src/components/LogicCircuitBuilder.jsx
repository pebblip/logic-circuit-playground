import React, { useState, useEffect, useRef, useCallback } from 'react';

const LogicCircuitBuilder = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedGate, setSelectedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [simulation, setSimulation] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState({ 1: true });
  const [savedCircuits, setSavedCircuits] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [clockSignal, setClockSignal] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const svgRef = useRef(null);

  // レベル定義
  const levels = {
    1: {
      name: "基本ゲート",
      gates: ['AND', 'OR', 'NOT', 'INPUT', 'OUTPUT'],
      description: "基本的な論理ゲートを学びましょう"
    },
    2: {
      name: "メモリ要素",
      gates: ['NAND', 'NOR', 'CLOCK', 'SR_LATCH', 'D_FF'],
      description: "記憶素子とクロック信号を学びましょう"
    },
    3: {
      name: "演算回路",
      gates: ['XOR', 'HALF_ADDER', 'FULL_ADDER', 'BUS'],
      description: "加算器と演算回路を構築しましょう"
    },
    4: {
      name: "CPU要素",
      gates: ['REGISTER', 'ALU', 'MUX', 'DECODER'],
      description: "簡単なCPUを作ってみましょう"
    }
  };

  // ゲートの種類定義（拡張版）
  const gateTypes = {
    // レベル1: 基本ゲート
    AND: { name: 'AND', symbol: 'AND', inputs: 2, outputs: 1, func: (a, b) => a && b, level: 1 },
    OR: { name: 'OR', symbol: 'OR', inputs: 2, outputs: 1, func: (a, b) => a || b, level: 1 },
    NOT: { name: 'NOT', symbol: 'NOT', inputs: 1, outputs: 1, func: (a) => !a, level: 1 },
    INPUT: { name: '入力', symbol: 'IN', inputs: 0, outputs: 1, func: () => true, level: 1 },
    OUTPUT: { name: '出力', symbol: 'OUT', inputs: 1, outputs: 0, func: (a) => a, level: 1 },
    
    // レベル2: メモリ要素
    NAND: { name: 'NAND', symbol: 'NAND', inputs: 2, outputs: 1, func: (a, b) => !(a && b), level: 2 },
    NOR: { name: 'NOR', symbol: 'NOR', inputs: 2, outputs: 1, func: (a, b) => !(a || b), level: 2 },
    CLOCK: { name: 'クロック', symbol: 'CLK', inputs: 0, outputs: 1, func: () => true, level: 2 },
    SR_LATCH: { name: 'SRラッチ', symbol: 'SR', inputs: 2, outputs: 2, func: null, level: 2, hasMemory: true },
    D_FF: { name: 'Dフリップフロップ', symbol: 'D-FF', inputs: 2, outputs: 2, func: null, level: 2, hasMemory: true },
    
    // レベル3: 演算回路
    XOR: { name: 'XOR', symbol: 'XOR', inputs: 2, outputs: 1, func: (a, b) => a !== b, level: 3 },
    HALF_ADDER: { name: '半加算器', symbol: 'HA', inputs: 2, outputs: 2, func: null, level: 3, isComposite: true },
    FULL_ADDER: { name: '全加算器', symbol: 'FA', inputs: 3, outputs: 2, func: null, level: 3, isComposite: true },
    
    // レベル4: CPU要素（将来実装）
    REGISTER: { name: 'レジスタ', symbol: 'REG', inputs: 9, outputs: 8, func: null, level: 4, hasMemory: true },
    ALU: { name: 'ALU', symbol: 'ALU', inputs: 10, outputs: 9, func: null, level: 4, isComposite: true }
  };

  // 利用可能なゲートを取得
  const getAvailableGates = () => {
    return Object.entries(gateTypes).filter(([_, info]) => 
      info.level <= currentLevel && unlockedLevels[info.level]
    );
  };

  // ゲートを追加
  const addGate = (type) => {
    const gateInfo = gateTypes[type];
    if (!gateInfo || gateInfo.level > currentLevel) return;

    const newGate = {
      id: Date.now(),
      type,
      x: 400 + (Math.random() - 0.5) * 200,
      y: 250 + (Math.random() - 0.5) * 100,
      inputs: Array(gateInfo.inputs).fill(null),
      outputs: Array(gateInfo.outputs).fill(null),
      value: type === 'INPUT' ? true : type === 'CLOCK' ? clockSignal : null,
      memory: gateInfo.hasMemory ? {} : null
    };
    setGates([...gates, newGate]);
  };

  // SVG座標変換
  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  // ゲートクリック処理
  const handleGateClick = (e, gate) => {
    e.stopPropagation();
    setSelectedGate(gate);
  };

  // ゲートダブルクリック処理（INゲートの値切り替え）
  const handleGateDoubleClick = (e, gate) => {
    e.stopPropagation();
    if (gate.type === 'INPUT') {
      toggleInput(gate.id);
    }
  };

  // ドラッグ開始（ゲート移動用）
  const handleGateMouseDown = (e, gate) => {
    e.stopPropagation();
    const point = getSVGPoint(e);
    // ドラッグ開始時に選択状態にする
    setSelectedGate(gate);
    setDragOffset({
      x: point.x - gate.x,
      y: point.y - gate.y
    });
  };

  // 端子ドラッグ開始（配線用）
  const handleTerminalMouseDown = (e, gate, isOutput, outputIndex = 0) => {
    e.stopPropagation();
    const gateInfo = gateTypes[gate.type];
    if (isOutput && gateInfo.outputs > 0) {
      setConnectionDrag({
        fromGate: gate,
        fromOutput: outputIndex,
        fromX: gate.x + 60,
        fromY: gate.y + (outputIndex * 20)
      });
    }
  };

  // 端子へのドロップ（配線完了）
  const handleTerminalMouseUp = (e, gate, inputIndex) => {
    e.stopPropagation();
    if (connectionDrag && gate.id !== connectionDrag.fromGate.id) {
      const existingConnections = connections.filter(c => c.to === gate.id && c.toInput === inputIndex);
      if (existingConnections.length === 0) {
        setConnections([...connections, {
          from: connectionDrag.fromGate.id,
          fromOutput: connectionDrag.fromOutput || 0,
          to: gate.id,
          toInput: inputIndex
        }]);
      }
    }
    setConnectionDrag(null);
  };

  // マウス移動
  const handleMouseMove = (e) => {
    const point = getSVGPoint(e);
    setMousePosition(point);
    
    if (selectedGate && dragOffset) {
      const newX = point.x - dragOffset.x;
      const newY = point.y - dragOffset.y;
      
      setGates(gates.map(gate => 
        gate.id === selectedGate.id 
          ? { ...gate, x: Math.max(50, Math.min(950, newX)), y: Math.max(50, Math.min(550, newY)) }
          : gate
      ));
    }
  };

  // マウスアップ
  const handleMouseUp = () => {
    setDragOffset(null);
    setConnectionDrag(null);
  };

  // INPUT値の切り替え
  const toggleInput = (gateId) => {
    setGates(prevGates => {
      // まず入力値を切り替え
      const updatedGates = prevGates.map(gate => 
        gate.id === gateId && gate.type === 'INPUT'
          ? { ...gate, value: !gate.value }
          : gate
      );
      
      // 更新されたゲートで回路を計算
      const newSimulation = calculateCircuitWithGates(updatedGates);
      setSimulation(newSimulation);
      
      // 全てのゲートの値を更新（INPUTとCLOCKは既に更新済み）
      return updatedGates.map(gate => ({
        ...gate,
        value: gate.type === 'INPUT' || gate.type === 'CLOCK' 
          ? gate.value 
          : (newSimulation[gate.id] ?? gate.value)
      }));
    });
  };

  // 回路計算の実行（特定のゲート状態を使用）
  const calculateCircuitWithGates = useCallback((currentGates) => {
    const newSimulation = {};
    
    // 入力とクロックの初期値設定
    currentGates.forEach(gate => {
      if (gate.type === 'INPUT' || gate.type === 'CLOCK') {
        newSimulation[gate.id] = gate.value;
      }
    });

    // 組み合わせ回路のシミュレーション
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 20) {
      changed = false;
      iterations++;

      currentGates.forEach(gate => {
        if (gate.type !== 'INPUT' && gate.type !== 'CLOCK') {
          const gateInfo = gateTypes[gate.type];
          const inputConnections = connections.filter(c => c.to === gate.id);
          
          if (inputConnections.length === gateInfo.inputs && gateInfo.func) {
            const inputValues = inputConnections.map(c => newSimulation[c.from]);
            
            if (inputValues.every(v => v !== undefined)) {
              const result = gateInfo.func(...inputValues);
              if (newSimulation[gate.id] !== result) {
                newSimulation[gate.id] = result;
                changed = true;
              }
            }
          }
        }
      });
    }

    return newSimulation;
  }, [connections, gateTypes]);

  // 回路計算の実行（現在のゲート状態を使用）
  const calculateCircuit = () => {
    setGates(prevGates => {
      const newSimulation = calculateCircuitWithGates(prevGates);
      setSimulation(newSimulation);
      
      return prevGates.map(gate => ({
        ...gate,
        value: gate.type === 'INPUT' || gate.type === 'CLOCK'
          ? gate.value
          : (newSimulation[gate.id] ?? gate.value)
      }));
    });
  };

  // キーボードイベント処理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedGate) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          // 選択中のゲートを削除
          setGates(gates.filter(g => g.id !== selectedGate.id));
          // 関連する接続も削除
          setConnections(connections.filter(c => 
            c.from !== selectedGate.id && c.to !== selectedGate.id
          ));
          setSelectedGate(null);
        } else if (e.key === 'Escape') {
          setSelectedGate(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGate, gates, connections]);

  // クロック信号の更新（自動モード時のみ）
  useEffect(() => {
    if (autoMode && simulationSpeed > 0) {
      const interval = setInterval(() => {
        // クロック信号を反転
        setClockSignal(prev => !prev);
      }, 1000 / simulationSpeed);
      return () => clearInterval(interval);
    }
  }, [autoMode, simulationSpeed]);

  // クロック信号が変わったら回路を再計算
  useEffect(() => {
    if (autoMode) {
      // クロックゲートの値を更新
      setGates(prevGates => {
        const updatedGates = prevGates.map(gate => 
          gate.type === 'CLOCK' ? { ...gate, value: clockSignal } : gate
        );
        
        // 更新されたゲートで計算を実行
        const newSimulation = calculateCircuitWithGates(updatedGates);
        setSimulation(newSimulation);
        
        // OUTPUT と その他のゲートの値のみ更新（INPUTとCLOCKは既に正しい値）
        return updatedGates.map(gate => ({
          ...gate,
          value: gate.type === 'INPUT' || gate.type === 'CLOCK' 
            ? gate.value 
            : (newSimulation[gate.id] ?? gate.value)
        }));
      });
    }
  }, [clockSignal, autoMode, calculateCircuitWithGates]);


  // 接続線の計算
  const getConnectionPath = (fromX, fromY, toX, toY) => {
    const midX = (fromX + toX) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  // 接続の削除
  const deleteConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  // 回路の保存
  const saveCircuit = (name) => {
    const circuit = {
      id: Date.now(),
      name,
      gates: gates.map(g => ({ ...g })),
      connections: connections.map(c => ({ ...c })),
      level: currentLevel
    };
    setSavedCircuits([...savedCircuits, circuit]);
  };

  // 保存した回路の読み込み
  const loadSavedCircuit = (circuit) => {
    setGates(circuit.gates);
    setConnections(circuit.connections);
    setSimulation({});
    setIsSimulating(false);
  };

  // リセット
  const reset = () => {
    setGates([]);
    setConnections([]);
    setSimulation({});
    setAutoMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Logic Circuit Builder</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="text-sm">ヘルプ</span>
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <span className="text-sm">設定</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3rem)]">
        {/* 左パネル: レベル選択 */}
        <div className={`bg-white border-r border-gray-200 transition-all ${showLeftPanel ? 'w-64' : 'w-0'} overflow-hidden`}>
          <div className="p-4">
            <h2 className="font-medium text-gray-900 mb-4">レベル選択</h2>
            {Object.entries(levels).map(([levelNum, levelInfo]) => {
              const isUnlocked = unlockedLevels[levelNum];
              const isActive = currentLevel === parseInt(levelNum);
              return (
                <div key={levelNum} className="mb-4">
                  <button
                    onClick={() => isUnlocked && setCurrentLevel(parseInt(levelNum))}
                    className={`w-full text-left p-2 rounded ${
                      isActive ? 'bg-blue-50 border border-blue-300' : 
                      isUnlocked ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!isUnlocked}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        Lv{levelNum} {levelInfo.name}
                      </span>
                      {isUnlocked && <span className="text-green-500">✓</span>}
                    </div>
                  </button>
                  {isActive && (
                    <div className="mt-2 ml-4 text-sm text-gray-600">
                      {levelInfo.gates.map(gateType => {
                        const gateInfo = gateTypes[gateType];
                        return gateInfo ? (
                          <div key={gateType} className="py-1">
                            • {gateInfo.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* メインエリア */}
        <div className="flex-1 flex flex-col">
          {/* ツールバー */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* ゲート追加ボタン */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">ゲート追加:</span>
                  <div className="flex gap-1">
                    {getAvailableGates().map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => addGate(type)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        title={info.name}
                      >
                        {info.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 実行制御 */}
                <button
                  onClick={calculateCircuit}
                  className="px-4 py-1.5 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
                >
                  計算
                </button>
                
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`px-4 py-1.5 text-sm rounded transition-colors ${
                    autoMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {autoMode ? '自動実行中' : '自動実行'}
                </button>

                <button
                  onClick={reset}
                  className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                >
                  リセット
                </button>

                {/* 速度制御（自動実行時のみ表示） */}
                {autoMode && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">速度:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={simulationSpeed}
                      onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-700">{simulationSpeed}Hz</span>
                  </div>
                )}
              </div>
            </div>

            {/* 入力制御 */}
            {gates.some(g => g.type === 'INPUT' || g.type === 'CLOCK') && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">入力制御:</span>
                {gates.filter(g => g.type === 'INPUT').map((gate, index) => (
                  <button
                    key={gate.id}
                    onClick={() => toggleInput(gate.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      gate.value 
                        ? 'bg-gray-900 text-white' 
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    IN{index + 1}: {gate.value ? '1' : '0'}
                  </button>
                ))}
                {gates.some(g => g.type === 'CLOCK') && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">CLK:</span>
                    <div className={`w-4 h-4 rounded-full ${clockSignal ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* キャンバス */}
          <div className="flex-1 bg-gray-50 p-4">
            <div className="bg-white border border-gray-300 rounded-lg h-full overflow-hidden">
              <svg
                ref={svgRef}
                viewBox="0 0 1000 600"
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedGate(null)}
              >
                {/* グリッド背景 */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 接続線 */}
                {connections.map((conn, index) => {
                  const fromGate = gates.find(g => g.id === conn.from);
                  const toGate = gates.find(g => g.id === conn.to);
                  if (!fromGate || !toGate) return null;

                  const fromX = fromGate.x + 60;
                  const fromY = fromGate.y + (conn.fromOutput || 0) * 20;
                  const toX = toGate.x - 60;
                  const toY = toGate.y - 20 + (conn.toInput * 25);
                  const isActive = simulation[conn.from];

                  return (
                    <g key={index}>
                      <path
                        d={getConnectionPath(fromX, fromY, toX, toY)}
                        stroke={isActive ? '#000' : '#999'}
                        strokeWidth={isActive ? '3' : '2'}
                        fill="none"
                        className="cursor-pointer hover:stroke-red-500"
                        onClick={() => deleteConnection(index)}
                      />
                    </g>
                  );
                })}

                {/* ドラッグ中の接続線 */}
                {connectionDrag && (
                  <path
                    d={getConnectionPath(
                      connectionDrag.fromX,
                      connectionDrag.fromY,
                      mousePosition.x,
                      mousePosition.y
                    )}
                    stroke="#666"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    fill="none"
                    pointerEvents="none"
                  />
                )}

                {/* ゲート */}
                {gates.map(gate => {
                  const gateInfo = gateTypes[gate.type];
                  const isSelected = selectedGate?.id === gate.id;
                  
                  return (
                    <g key={gate.id} transform={`translate(${gate.x}, ${gate.y})`}>
                      {/* ゲート本体 */}
                      {gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK' ? (
                        <circle
                          cx={0}
                          cy={0}
                          r="35"
                          fill={
                            gate.type === 'INPUT' ? (gate.value ? '#000' : '#fff') :
                            gate.type === 'CLOCK' ? (gate.value ? '#3b82f6' : '#fff') :
                            '#f9f9f9'
                          }
                          stroke={isSelected ? "#3b82f6" : "#333"}
                          strokeWidth={isSelected ? "3" : "2"}
                          className="cursor-pointer"
                          onClick={(e) => handleGateClick(e, gate)}
                          onDoubleClick={(e) => handleGateDoubleClick(e, gate)}
                          onMouseDown={(e) => handleGateMouseDown(e, gate)}
                        />
                      ) : (
                        <rect
                          x={-60}
                          y={-25}
                          width="120"
                          height="50"
                          rx="4"
                          fill="#fff"
                          stroke={isSelected ? "#3b82f6" : "#333"}
                          strokeWidth={isSelected ? "3" : "2"}
                          className="cursor-pointer"
                          onClick={(e) => handleGateClick(e, gate)}
                          onDoubleClick={(e) => handleGateDoubleClick(e, gate)}
                          onMouseDown={(e) => handleGateMouseDown(e, gate)}
                        />
                      )}

                      {/* ゲートラベル */}
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        fill={
                          gate.type === 'INPUT' && gate.value ? '#fff' :
                          gate.type === 'CLOCK' && gate.value ? '#fff' :
                          '#333'
                        }
                        fontSize="14"
                        fontWeight="500"
                        className="pointer-events-none select-none"
                      >
                        {gateInfo.symbol}
                      </text>

                      {/* 入力端子 */}
                      {Array.from({ length: gateInfo.inputs }).map((_, i) => (
                        <circle
                          key={`in-${i}`}
                          cx={-60}
                          cy={-20 + (i * 25)}
                          r="6"
                          fill="#fff"
                          stroke="#333"
                          strokeWidth="2"
                          className="cursor-crosshair hover:fill-gray-200"
                          onMouseUp={(e) => handleTerminalMouseUp(e, gate, i)}
                        />
                      ))}

                      {/* 出力端子 */}
                      {Array.from({ length: gateInfo.outputs }).map((_, i) => (
                        <circle
                          key={`out-${i}`}
                          cx={60}
                          cy={gateInfo.outputs === 1 ? 0 : -10 + (i * 20)}
                          r="6"
                          fill="#333"
                          className="cursor-crosshair hover:fill-gray-600"
                          onMouseDown={(e) => handleTerminalMouseDown(e, gate, true, i)}
                        />
                      ))}

                      {/* 値の表示 */}
                      {gate.type === 'OUTPUT' && gate.value !== null && (
                        <text
                          x={0}
                          y={-50}
                          textAnchor="middle"
                          fill={gate.value ? '#000' : '#999'}
                          fontSize="24"
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          {gate.value ? '1' : '0'}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 情報パネル */}
          <div className="bg-white border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'description' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                回路説明
              </button>
              <button
                onClick={() => setActiveTab('timing')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'timing' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                タイミング
              </button>
              <button
                onClick={() => setActiveTab('truth')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'truth' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                真理値表
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'tutorial' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                チュートリアル
              </button>
            </div>
            <div className="p-4 h-32 overflow-y-auto">
              {activeTab === 'description' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">レベル {currentLevel}: {levels[currentLevel].name}</h3>
                  <p className="text-sm text-gray-600">{levels[currentLevel].description}</p>
                  {selectedGate && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-900">
                        選択中: {gateTypes[selectedGate.type].name}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'tutorial' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">次のステップ</h3>
                  {currentLevel === 1 && (
                    <p className="text-sm text-gray-600">
                      基本的なAND、OR、NOT回路を組み合わせて、XOR回路を作ってみましょう。
                      すべての基本回路をマスターしたら、レベル2のメモリ要素が解放されます。
                    </p>
                  )}
                  {currentLevel === 2 && (
                    <p className="text-sm text-gray-600">
                      NANDゲートを使ってSRラッチを構築してみましょう。
                      クロック信号と組み合わせることで、Dフリップフロップも作れます。
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右パネル: プロパティと保存回路 */}
        <div className={`bg-white border-l border-gray-200 transition-all ${showRightPanel ? 'w-64' : 'w-0'} overflow-hidden`}>
          <div className="p-4">
            <h2 className="font-medium text-gray-900 mb-4">プロパティ</h2>
            {selectedGate ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">種類</p>
                  <p className="font-medium">{gateTypes[selectedGate.type].name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">入力数</p>
                  <p className="font-medium">{gateTypes[selectedGate.type].inputs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">出力数</p>
                  <p className="font-medium">{gateTypes[selectedGate.type].outputs}</p>
                </div>
                {selectedGate.value !== null && (
                  <div>
                    <p className="text-sm text-gray-600">現在の値</p>
                    <p className="font-medium">{selectedGate.value ? '1' : '0'}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">ゲートを選択してください</p>
            )}

            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-3">保存済み回路</h3>
              {savedCircuits.length > 0 ? (
                <div className="space-y-2">
                  {savedCircuits.map(circuit => (
                    <button
                      key={circuit.id}
                      onClick={() => loadSavedCircuit(circuit)}
                      className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className="font-medium">{circuit.name}</div>
                      <div className="text-xs text-gray-500">Lv{circuit.level}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">保存された回路はありません</p>
              )}
              
              <button
                onClick={() => {
                  const name = prompt('回路名を入力してください:');
                  if (name) saveCircuit(name);
                }}
                className="mt-3 w-full px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
              >
                現在の回路を保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicCircuitBuilder;