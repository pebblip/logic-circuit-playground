import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import { useCircuitStore } from '../../stores/circuitStore';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = () => {
  const { selectionMode, setSelectionMode, selectedGateIds, createCustomGateFromSelection } = useCircuitStore();
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
            className={`tool-button ${selectionMode === 'single' ? 'active' : ''}`} 
            title="単一選択"
            onClick={() => setSelectionMode('single')}
          >🖱️</button>
          <button 
            className={`tool-button ${selectionMode === 'area' ? 'active' : ''}`} 
            title="エリア選択"
            onClick={() => setSelectionMode('area')}
          >☐️</button>
          <button className="tool-button" title="パン">✋</button>
          <button className="tool-button" title="接続">🔗</button>
          <button className="tool-button" title="切断">✂️</button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }}></div>
          <button className="tool-button" title="元に戻す">↩️</button>
          <button className="tool-button" title="やり直し">↪️</button>
          <button className="tool-button" title="削除">🗑️</button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }}></div>
          <button 
            className="tool-button" 
            title="選択した回路をカスタムゲート化"
            onClick={createCustomGateFromSelection}
            disabled={selectedGateIds.size === 0}
            style={selectedGateIds.size === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >🔄</button>
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
            <span>ゲート: 0</span>
          </div>
          <div className="status-item">
            <span>接続: 0</span>
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