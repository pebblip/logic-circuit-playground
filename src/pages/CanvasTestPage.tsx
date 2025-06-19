/**
 * 統一キャンバステストページ
 * 
 * CLAUDE.md準拠: 段階的統合テスト
 * - 3モード（editor/gallery/preview）切り替え確認
 * - 基本機能動作確認
 * - 手動ブラウザテスト用
 */

import React, { useState, useMemo } from 'react';
import { UnifiedCanvas } from '@/components/canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '@/components/canvas/types/canvasTypes';
import type { CanvasMode, CanvasConfig, CanvasDataSource, CanvasEventHandlers } from '@/components/canvas/types/canvasTypes';
import type { Gate, Wire } from '@/types/circuit';

// サンプル回路データ：基本的なAND/OR回路
const SAMPLE_CIRCUIT_DATA = {
  gates: [
    // 入力ゲート
    {
      id: 'input-1',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      inputs: [],
      output: false,
      metadata: { label: 'A' }
    },
    {
      id: 'input-2', 
      type: 'INPUT' as const,
      position: { x: 100, y: 250 },
      inputs: [],
      output: false,
      metadata: { label: 'B' }
    },
    // ANDゲート
    {
      id: 'and-1',
      type: 'AND' as const,
      position: { x: 250, y: 200 },
      inputs: [false, false],
      output: false,
      metadata: {}
    },
    // ORゲート
    {
      id: 'or-1',
      type: 'OR' as const,
      position: { x: 400, y: 200 },
      inputs: [false, false],
      output: false,
      metadata: {}
    },
    // 出力ゲート
    {
      id: 'output-1',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 200 },
      inputs: [false],
      output: false,
      metadata: { label: 'Result' }
    }
  ] as Gate[],
  
  wires: [
    // 入力A → AND
    {
      id: 'wire-1',
      from: { gateId: 'input-1', pinIndex: -1 },
      to: { gateId: 'and-1', pinIndex: 0 },
      isActive: false
    },
    // 入力B → AND
    {
      id: 'wire-2', 
      from: { gateId: 'input-2', pinIndex: -1 },
      to: { gateId: 'and-1', pinIndex: 1 },
      isActive: false
    },
    // AND → OR
    {
      id: 'wire-3',
      from: { gateId: 'and-1', pinIndex: -1 },
      to: { gateId: 'or-1', pinIndex: 0 },
      isActive: false
    },
    // 入力B → OR (直接接続)
    {
      id: 'wire-4',
      from: { gateId: 'input-2', pinIndex: -1 },
      to: { gateId: 'or-1', pinIndex: 1 },
      isActive: false
    },
    // OR → 出力
    {
      id: 'wire-5',
      from: { gateId: 'or-1', pinIndex: -1 },
      to: { gateId: 'output-1', pinIndex: 0 },
      isActive: false
    }
  ] as Wire[]
};

export const CanvasTestPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<CanvasMode>('gallery');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // ログ追加ヘルパー
  const addLog = (message: string) => {
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // モード別設定
  const config = useMemo((): CanvasConfig => {
    const baseConfig = CANVAS_MODE_PRESETS[selectedMode];
    return {
      ...baseConfig,
      // デバッグ情報を常に表示
      galleryOptions: {
        ...baseConfig.galleryOptions,
        showDebugInfo: true,
        autoSimulation: selectedMode === 'gallery',
        animationInterval: 1500,
      },
      uiControls: {
        ...baseConfig.uiControls,
        showControls: true,
        showBackground: true,
        showPreviewHeader: selectedMode === 'preview',
      },
      previewOptions: {
        customGateName: 'テスト回路',
        readOnly: true,
      },
    };
  }, [selectedMode]);

  // データソース
  const dataSource = useMemo((): CanvasDataSource => {
    return {
      customData: SAMPLE_CIRCUIT_DATA,
    };
  }, []);

  // イベントハンドラー
  const handlers = useMemo((): CanvasEventHandlers => ({
    onGateClick: (gateId, gate) => {
      addLog(`ゲートクリック: ${gate.type} (${gateId})`);
    },
    onInputToggle: (gateId, newValue) => {
      addLog(`入力変更: ${gateId} → ${newValue}`);
    },
    onWireClick: (wireId, wire) => {
      addLog(`ワイヤークリック: ${wireId}`);
    },
    onCanvasClick: (position) => {
      addLog(`キャンバスクリック: (${Math.round(position.x)}, ${Math.round(position.y)})`);
    },
    onZoomChange: (scale) => {
      addLog(`ズーム変更: ${Math.round(scale * 100)}%`);
    },
    onExitPreview: () => {
      addLog('プレビュー終了');
      setSelectedMode('gallery');
    },
    onError: (error, context) => {
      addLog(`エラー[${context}]: ${error.message}`);
    },
  }), []);

  return (
    <div className="canvas-test-page" style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #00ff88', paddingBottom: '15px' }}>
        <h1 style={{ color: '#00ff88', marginBottom: '10px' }}>統一キャンバステストページ</h1>
        <p style={{ color: '#cccccc', margin: 0 }}>
          UnifiedCanvasの3モード動作確認・手動ブラウザテスト用
        </p>
      </div>

      {/* 制御パネル */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        borderRadius: '8px'
      }}>
        {/* モード選択 */}
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '10px' }}>動作モード</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            {(['editor', 'gallery', 'preview'] as CanvasMode[]).map(mode => (
              <label key={mode} style={{ color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  value={mode}
                  checked={selectedMode === mode}
                  onChange={(e) => {
                    setSelectedMode(e.target.value as CanvasMode);
                    addLog(`モード変更: ${e.target.value}`);
                  }}
                  style={{ accentColor: '#00ff88' }}
                />
                <span style={{ textTransform: 'capitalize' }}>{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 機能確認項目 */}
        <div>
          <h3 style={{ color: '#00ff88', marginBottom: '10px' }}>確認項目</h3>
          <ul style={{ color: '#cccccc', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>ズーム・パン操作</li>
            <li>ゲート表示・アニメーション</li>
            <li>入力ゲート値変更（gallery/editorモード）</li>
            <li>モード切り替え正常性</li>
            <li>エラー発生有無</li>
          </ul>
        </div>
      </div>

      {/* メインキャンバス */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        gap: '20px',
        minHeight: '500px'
      }}>
        {/* キャンバス表示エリア */}
        <div style={{ 
          flex: 3,
          border: '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <UnifiedCanvas
            config={config}
            dataSource={dataSource}
            handlers={handlers}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* デバッグ情報 */}
        <div style={{ 
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '15px',
          overflow: 'auto'
        }}>
          <h3 style={{ color: '#00ff88', marginBottom: '10px', fontSize: '16px' }}>動作ログ</h3>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '12px',
            color: '#cccccc',
            lineHeight: '1.4'
          }}>
            {debugInfo.length === 0 ? (
              <div style={{ color: '#666' }}>イベント待機中...</div>
            ) : (
              debugInfo.map((log, index) => (
                <div key={index} style={{ marginBottom: '3px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
          
          {/* 設定情報 */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            <h4 style={{ color: '#00ff88', marginBottom: '8px', fontSize: '14px' }}>現在の設定</h4>
            <div style={{ fontSize: '11px', color: '#999' }}>
              <div>モード: {selectedMode}</div>
              <div>インタラクション: {config.interactionLevel}</div>
              <div>シミュレーション: {config.simulationMode}</div>
              <div>コントロール: {config.uiControls?.showControls ? 'ON' : 'OFF'}</div>
              <div>自動シミュレーション: {config.galleryOptions?.autoSimulation ? 'ON' : 'OFF'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div style={{ 
        marginTop: '20px', 
        padding: '10px',
        borderTop: '1px solid #333',
        color: '#666',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        CLAUDE.md準拠：統合テスト → 手動確認 → 段階的移行
      </div>
    </div>
  );
};