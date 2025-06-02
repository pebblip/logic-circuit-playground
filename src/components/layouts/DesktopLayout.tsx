import React from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import { useCircuitStore } from '../../stores/circuitStore';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = () => {
  const { gates, wires, undo, redo, clearAll, canUndo, canRedo } = useCircuitStore();
  return (
    <div className="app-container">
      {/* ヘッダー（グリッド全幅） */}
      <Header />
      
      {/* 左サイドバー - ツールパレット */}
      <aside className="sidebar-left">
        <ToolPalette />
      </aside>
      
      {/* メインキャンバス */}
      <main className="main-canvas">
        {/* キャンバスツールバー */}
        <div className="canvas-toolbar">
          <button 
            className="tool-button" 
            title="元に戻す" 
            onClick={undo}
            disabled={!canUndo()}
            style={{ opacity: canUndo() ? 1 : 0.3 }}
          >
            ↩️
          </button>
          <button 
            className="tool-button" 
            title="やり直し" 
            onClick={redo}
            disabled={!canRedo()}
            style={{ opacity: canRedo() ? 1 : 0.3 }}
          >
            ↪️
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }}></div>
          <button 
            className="tool-button" 
            title="すべてクリア" 
            onClick={() => {
              if (window.confirm('すべての回路を削除しますか？')) {
                clearAll();
              }
            }}
          >
            🗑️
          </button>
        </div>
        
        {/* キャンバス */}
        <div className="canvas-container">
          <Canvas />
        </div>
        
        {/* ステータスバー */}
        <div className="status-bar">
          <div className="status-item">
            <div className="status-dot"></div>
            <span>シミュレーション実行中</span>
          </div>
          <div className="status-item">
            <span>ゲート: {gates.length}</span>
          </div>
          <div className="status-item">
            <span>接続: {wires.length}</span>
          </div>
          <div className="status-item">
            <span>100% ズーム</span>
          </div>
        </div>
      </main>
      
      {/* 右サイドバー - プロパティパネル */}
      <aside className="sidebar-right">
        <PropertyPanel />
      </aside>
    </div>
  );
};