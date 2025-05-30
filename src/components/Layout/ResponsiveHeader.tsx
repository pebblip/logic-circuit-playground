import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { DiscoveryModeSelector } from '../UI/DiscoveryModeSelector';
import { CircuitMode } from '../../types/mode';
import { SPACING, TOUCH_TARGET } from '../../constants/responsive';

interface ResponsiveHeaderProps {
  currentMode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
  onMenuClick?: () => void;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  showNotebook: boolean;
  onNotebookToggle: () => void;
  showProgress: boolean;
  onProgressToggle: () => void;
  showSaveLoad: boolean;
  onSaveLoadToggle: () => void;
  onClear: () => void;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  currentMode,
  onModeChange,
  onMenuClick,
  selectedTheme,
  onThemeChange,
  showNotebook,
  onNotebookToggle,
  showProgress,
  onProgressToggle,
  showSaveLoad,
  onSaveLoadToggle,
  onClear
}) => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: `0 ${SPACING.md}px`,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* ハンバーガーメニュー */}
        <button
          onClick={onMenuClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: TOUCH_TARGET.minimum,
            height: TOUCH_TARGET.minimum,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: '#374151'
          }}
          aria-label="メニューを開く"
        >
          ☰
        </button>

        {/* タイトル */}
        <h1 style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
          margin: 0,
          flex: 1,
          textAlign: 'center'
        }}>
          論理回路プレイグラウンド
        </h1>

        {/* 設定ボタン */}
        <button
          onClick={onProgressToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: TOUCH_TARGET.minimum,
            height: TOUCH_TARGET.minimum,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: '#374151'
          }}
          aria-label="進捗を表示"
        >
          📊
        </button>
      </div>
    );
  }

  // タブレット・デスクトップ
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
      padding: `0 ${SPACING.lg}px`,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <h1 style={{
        fontSize: 20,
        fontWeight: 600,
        color: '#1f2937',
        margin: 0
      }}>
        論理回路プレイグラウンド
      </h1>

      <div style={{
        display: 'flex',
        gap: SPACING.sm,
        alignItems: 'center'
      }}>
        {/* モード選択（デスクトップのみ） */}
        {!isTablet && (
          <DiscoveryModeSelector
            currentMode={currentMode}
            onModeChange={onModeChange}
          />
        )}

        {/* テーマ選択 */}
        <select
          value={selectedTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#374151',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="modern">モダン</option>
          <option value="neon">ネオン</option>
          <option value="minimal">ミニマル</option>
        </select>

        {/* アクションボタン */}
        <button
          onClick={onNotebookToggle}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: showNotebook ? '#3b82f6' : '#ffffff',
            color: showNotebook ? '#ffffff' : '#374151',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📔 ノート
        </button>

        <button
          onClick={onProgressToggle}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: showProgress ? '#3b82f6' : '#ffffff',
            color: showProgress ? '#ffffff' : '#374151',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          進捗
        </button>

        <button
          onClick={onSaveLoadToggle}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: showSaveLoad ? '#3b82f6' : '#ffffff',
            color: showSaveLoad ? '#ffffff' : '#374151',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          保存/読込
        </button>

        <button
          onClick={onClear}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          クリア
        </button>
      </div>
    </div>
  );
};