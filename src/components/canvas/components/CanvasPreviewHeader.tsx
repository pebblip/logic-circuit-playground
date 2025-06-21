/**
 * Canvasプレビューモードヘッダーコンポーネント
 * カスタムゲートプレビュー時のヘッダー表示
 */

import React from 'react';

interface CanvasPreviewHeaderProps {
  customGateName: string;
  onExit: () => void;
}

export const CanvasPreviewHeader: React.FC<CanvasPreviewHeaderProps> =
  React.memo(({ customGateName, onExit }) => {
    return (
      <div className="preview-mode-header">
        <button
          className="btn btn--secondary"
          onClick={onExit}
          aria-label="プレビューモードを終了"
        >
          ← 戻る
        </button>
        <span className="preview-mode-title">{customGateName} - 内部回路</span>
        <span className="preview-mode-badge">読み取り専用</span>
      </div>
    );
  });

CanvasPreviewHeader.displayName = 'CanvasPreviewHeader';
