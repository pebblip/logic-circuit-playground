/**
 * Canvasコントロールコンポーネント
 * ズームイン/アウト、リセット機能、配線スタイル切り替えを提供
 */

import React from 'react';
import { CANVAS_CONSTANTS } from '../utils/canvasConstants';
import { useCircuitStore } from '@/stores/circuitStore';
import type { WireStyle } from '@/utils/wirePathGenerator';

interface CanvasControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  hideWireStyleButton?: boolean;  // ギャラリーモード用
}

export const CanvasControls: React.FC<CanvasControlsProps> = React.memo(({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  hideWireStyleButton = false,
}) => {
  const { wireStyle, setWireStyle } = useCircuitStore();
  
  // 配線スタイルの切り替え
  const handleWireStyleToggle = () => {
    const styles: WireStyle[] = ['bezier', 'manhattan', 'manhattan-rounded'];
    const currentIndex = styles.indexOf(wireStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setWireStyle(styles[nextIndex]);
  };
  
  // 配線スタイルのラベル
  const getWireStyleLabel = () => {
    switch (wireStyle) {
      case 'bezier':
        return '曲線';
      case 'manhattan':
        return '直交';
      case 'manhattan-rounded':
        return '角丸';
      default:
        return '配線';
    }
  };
  
  return (
    <div
      className="zoom-controls canvas-overlay"
      style={{
        position: 'absolute',
        top: `${CANVAS_CONSTANTS.ZOOM_CONTROLS_OFFSET}px`,
        right: `${CANVAS_CONSTANTS.ZOOM_CONTROLS_OFFSET}px`,
        zIndex: 10,
      }}
    >
      {/* 配線スタイル切り替えボタン */}
      {!hideWireStyleButton && (
        <>
          <button
            className="zoom-button wire-style-button"
            onClick={handleWireStyleToggle}
            title={`配線スタイル: ${getWireStyleLabel()}`}
            aria-label="配線スタイル切り替え"
            style={{
              background: wireStyle === 'manhattan' || wireStyle === 'manhattan-rounded' 
                ? 'rgba(0, 255, 136, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: wireStyle === 'manhattan' || wireStyle === 'manhattan-rounded'
                ? '1px solid rgba(0, 255, 136, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 10px',
              minWidth: '60px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                {wireStyle === 'bezier' && (
                  // 曲線アイコン - ベジェ曲線を表現
                  <path d="M 4 12 Q 12 4, 20 12" strokeLinecap="round" />
                )}
                {wireStyle === 'manhattan' && (
                  // 直交線アイコン - L字型の配線
                  <>
                    <path d="M 4 8 L 12 8 L 12 16 L 20 16" strokeLinecap="square" />
                    <circle cx="4" cy="8" r="2" fill="currentColor" />
                    <circle cx="20" cy="16" r="2" fill="currentColor" />
                  </>
                )}
                {wireStyle === 'manhattan-rounded' && (
                  // 角丸線アイコン - 角が丸いL字型
                  <>
                    <path d="M 4 8 L 10 8 Q 12 8, 12 10 L 12 14 Q 12 16, 14 16 L 20 16" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="8" r="2" fill="currentColor" />
                    <circle cx="20" cy="16" r="2" fill="currentColor" />
                  </>
                )}
              </svg>
              <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {getWireStyleLabel()}
              </span>
            </div>
          </button>
          
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
        </>
      )}
      
      {/* ズームアウトボタン */}
      <button
        className="zoom-button"
        onClick={onZoomOut}
        title="ズームアウト（マウスホイール下）"
        aria-label="ズームアウト"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </button>

      {/* ズームリセットボタン */}
      <button
        className="zoom-button zoom-reset"
        onClick={onResetZoom}
        title="ズームリセット（ダブルクリック）"
        aria-label={`ズーム率 ${Math.round(scale * 100)}%`}
      >
        {Math.round(scale * 100)}%
      </button>

      {/* ズームインボタン */}
      <button
        className="zoom-button"
        onClick={onZoomIn}
        title="ズームイン（マウスホイール上）"
        aria-label="ズームイン"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
});

CanvasControls.displayName = 'CanvasControls';