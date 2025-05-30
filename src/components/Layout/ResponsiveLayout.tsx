import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { LAYOUT_WIDTHS, HEADER_HEIGHT, Z_INDEX, TRANSITION } from '../../constants/responsive';

interface ResponsiveLayoutProps {
  header: React.ReactNode;
  sidePanel?: React.ReactNode;
  toolPalette?: React.ReactNode;
  canvas: React.ReactNode;
  bottomNav?: React.ReactNode;
  showSidePanel?: boolean;
  showToolPalette?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps & {
  isSidePanelOpen?: boolean;
  isToolPaletteOpen?: boolean;
  onSidePanelToggle?: () => void;
  onToolPaletteToggle?: () => void;
}> = ({
  header,
  sidePanel,
  toolPalette,
  canvas,
  bottomNav,
  showSidePanel = true,
  showToolPalette = true,
  isSidePanelOpen: externalSidePanelOpen,
  isToolPaletteOpen: externalToolPaletteOpen,
  onSidePanelToggle,
  onToolPaletteToggle
}) => {
  const { isMobile, isTablet, deviceType } = useResponsive();
  const [internalSidePanelOpen, setInternalSidePanelOpen] = useState(false);
  const [internalToolPaletteOpen, setInternalToolPaletteOpen] = useState(false);
  
  // 外部制御と内部制御の統合
  const isSidePanelOpen = externalSidePanelOpen ?? internalSidePanelOpen;
  const isToolPaletteOpen = externalToolPaletteOpen ?? internalToolPaletteOpen;
  
  const toggleSidePanel = () => {
    if (onSidePanelToggle) {
      onSidePanelToggle();
    } else {
      setInternalSidePanelOpen(!internalSidePanelOpen);
    }
  };
  
  const toggleToolPalette = () => {
    if (onToolPaletteToggle) {
      onToolPaletteToggle();
    } else {
      setInternalToolPaletteOpen(!internalToolPaletteOpen);
    }
  };

  // デバイス変更時にメニューを閉じる
  useEffect(() => {
    if (!isMobile) {
      if (!onSidePanelToggle) setInternalSidePanelOpen(false);
      if (!onToolPaletteToggle) setInternalToolPaletteOpen(false);
    }
  }, [isMobile, onSidePanelToggle, onToolPaletteToggle]);

  // モバイルレイアウト
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* ヘッダー */}
        <header style={{
          height: HEADER_HEIGHT[deviceType],
          flexShrink: 0,
          zIndex: Z_INDEX.header,
          position: 'relative'
        }}>
          {header}
        </header>

        {/* メインキャンバス */}
        <main style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {canvas}
        </main>

        {/* ボトムナビゲーション */}
        {bottomNav && (
          <nav style={{
            height: 56,
            flexShrink: 0,
            borderTop: '1px solid #e5e7eb',
            background: '#fff',
            zIndex: Z_INDEX.header
          }}>
            {bottomNav}
          </nav>
        )}

        {/* サイドパネル（スライドイン） */}
        {showSidePanel && sidePanel && (
          <>
            {/* オーバーレイ */}
            {isSidePanelOpen && (
              <div
                onClick={toggleSidePanel}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: Z_INDEX.overlay,
                  transition: `opacity ${TRANSITION.normal}`
                }}
              />
            )}
            {/* パネル本体 */}
            <aside style={{
              position: 'fixed',
              top: HEADER_HEIGHT.mobile,
              left: isSidePanelOpen ? 0 : '-80vw',
              width: '80vw',
              height: `calc(100vh - ${HEADER_HEIGHT.mobile}px)`,
              background: '#fff',
              zIndex: Z_INDEX.sidePanel,
              transition: `left ${TRANSITION.normal} ease-out`,
              overflowY: 'auto',
              boxShadow: isSidePanelOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none'
            }}>
              {sidePanel}
            </aside>
          </>
        )}

        {/* ツールパレット（ボトムシート） */}
        {showToolPalette && toolPalette && (
          <>
            {/* オーバーレイ */}
            {isToolPaletteOpen && (
              <div
                onClick={toggleToolPalette}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: Z_INDEX.overlay,
                  transition: `opacity ${TRANSITION.normal}`
                }}
              />
            )}
            {/* ボトムシート */}
            <div style={{
              position: 'fixed',
              bottom: isToolPaletteOpen ? 0 : '-60vh',
              left: 0,
              right: 0,
              height: '60vh',
              background: '#fff',
              zIndex: Z_INDEX.toolPalette,
              transition: `bottom ${TRANSITION.normal} ease-out`,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}>
              {/* ハンドル */}
              <div style={{
                width: 40,
                height: 4,
                background: '#d1d5db',
                borderRadius: 2,
                margin: '8px auto'
              }} />
              <div style={{
                padding: 16,
                height: 'calc(100% - 20px)',
                overflowY: 'auto'
              }}>
                {toolPalette}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // タブレット・デスクトップレイアウト
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <header style={{
        height: HEADER_HEIGHT[deviceType],
        flexShrink: 0,
        zIndex: Z_INDEX.header,
        position: 'relative'
      }}>
        {header}
      </header>

      {/* メインコンテンツ */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* サイドパネル */}
        {showSidePanel && sidePanel && (
          <aside style={{
            width: LAYOUT_WIDTHS.sidePanel[deviceType],
            flexShrink: 0,
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
            background: '#f9fafb'
          }}>
            {sidePanel}
          </aside>
        )}

        {/* ツールパレット */}
        {showToolPalette && toolPalette && (
          <nav style={{
            width: LAYOUT_WIDTHS.toolPalette[deviceType],
            flexShrink: 0,
            background: '#1f2937',
            overflowY: 'auto'
          }}>
            {toolPalette}
          </nav>
        )}

        {/* キャンバス */}
        <main style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {canvas}
        </main>
      </div>
    </div>
  );
};

// モバイルメニュー制御用の関数をエクスポート
export const useMobileMenus = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(false);

  const toggleSidePanel = () => setIsSidePanelOpen(prev => !prev);
  const toggleToolPalette = () => setIsToolPaletteOpen(prev => !prev);
  const closeAllMenus = () => {
    setIsSidePanelOpen(false);
    setIsToolPaletteOpen(false);
  };

  return {
    isSidePanelOpen,
    isToolPaletteOpen,
    toggleSidePanel,
    toggleToolPalette,
    closeAllMenus
  };
};