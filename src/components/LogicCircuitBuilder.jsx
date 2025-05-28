import React, { useEffect, useRef, useState } from 'react';
import { CircuitViewModel } from '../viewmodels/CircuitViewModel';
import { useCircuitViewModel } from '../hooks/useCircuitViewModel';
import { CircuitCanvas } from './Circuit/CircuitCanvas.jsx';
import { ToolPalette } from './Circuit/ToolPalette.jsx';
import { GateType } from '../types/gate';

export const LogicCircuitBuilder = () => {
  const [viewModel] = useState(() => new CircuitViewModel());
  useCircuitViewModel(viewModel);
  
  const [showToolPalette, setShowToolPalette] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);

  // Responsive design detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle drag over for drop support
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop from tool palette
  const handleDrop = (e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType');
    if (gateType) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        viewModel.addGate(gateType, { x, y });
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected gates/connections
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedGates = viewModel.getSelectedGates();
        const selectedConnections = viewModel.getSelectedConnections();
        
        selectedGates.forEach(gate => viewModel.removeGate(gate.id));
        selectedConnections.forEach(conn => viewModel.removeConnection(conn.id));
      }
      
      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        viewModel.selectAll();
      }
      
      // Deselect all
      if (e.key === 'Escape') {
        viewModel.clearSelection();
      }
      
      // Simulate
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        viewModel.simulate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewModel]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0e27]">
      {/* Header */}
      <header className="bg-[#0f1441] shadow-lg border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">論理回路プレイグラウンド</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => viewModel.simulate()}
              className="px-4 py-2 bg-[#00ff88] text-[#0a0e27] rounded hover:bg-[#00cc66] transition-colors font-medium"
            >
              シミュレート
            </button>
            <button
              onClick={() => viewModel.clearCircuit()}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              クリア
            </button>
            {isMobile && (
              <button
                onClick={() => setShowToolPalette(!showToolPalette)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors md:hidden"
              >
                ツール
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Tool Palette - responsive positioning */}
        {showToolPalette && (
          <div className={`
            ${isMobile 
              ? 'absolute inset-0 z-20 bg-[#0f1441] overflow-auto' 
              : 'w-64 bg-[#0f1441] border-r border-gray-800 overflow-y-auto'
            }
          `}>
            {isMobile && (
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="font-bold text-white">ツールパレット</h2>
                <button
                  onClick={() => setShowToolPalette(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="p-4">
              <ToolPalette viewModel={viewModel} />
            </div>
          </div>
        )}

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CircuitCanvas viewModel={viewModel} />
        </div>

        {/* Properties Panel - desktop only */}
        {!isMobile && (
          <div className="w-64 border-l border-gray-800 bg-[#0f1441] p-4">
            <h2 className="text-lg font-bold mb-4 text-white">プロパティ</h2>
            {viewModel.getSelectedGates().length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-white">選択中のゲート</h3>
                {viewModel.getSelectedGates().map(gate => (
                  <div key={gate.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <p className="text-sm text-gray-300">タイプ: {gate.type}</p>
                    <p className="text-sm text-gray-300">ID: {gate.id}</p>
                  </div>
                ))}
              </div>
            )}
            {viewModel.getSelectedConnections().length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-white">選択中の接続</h3>
                {viewModel.getSelectedConnections().map(conn => (
                  <div key={conn.id} className="mb-2 p-2 bg-gray-800 rounded">
                    <p className="text-sm text-gray-300">ID: {conn.id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB for tool palette */}
      {isMobile && !showToolPalette && (
        <button
          onClick={() => setShowToolPalette(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-[#00ff88] text-[#0a0e27] rounded-full shadow-lg flex items-center justify-center hover:bg-[#00cc66] transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};