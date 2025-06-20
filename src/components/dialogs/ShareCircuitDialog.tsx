import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import './ShareCircuitDialog.css';

interface ShareCircuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCircuitDialog: React.FC<ShareCircuitDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    shareUrl,
    isGeneratingShareUrl,
    shareError,
    generateShareUrl,
    clearShareUrl,
    gates,
  } = useCircuitStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // ダイアログが閉じられたらリセット
      clearShareUrl();
      setName('');
      setDescription('');
      setCopied(false);
    }
  }, [isOpen, clearShareUrl]);

  const handleGenerate = async () => {
    setCopied(false);
    await generateShareUrl(name || undefined, description || undefined);
  };

  const handleCopy = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('コピーに失敗しました:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="share-dialog" onClick={e => e.stopPropagation()}>
        <div className="share-dialog-header">
          <h2>🔗 回路を共有</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="share-dialog-content">
          {gates.length === 0 ? (
            <div className="empty-circuit-message">
              <p data-testid="empty-circuit-message">共有する回路がありません。</p>
              <p>ゲートを配置してから共有してください。</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="circuit-name">回路名（オプション）</label>
                <input
                  id="circuit-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例: 半加算器"
                  disabled={isGeneratingShareUrl}
                />
              </div>

              <div className="form-group">
                <label htmlFor="circuit-description">説明（オプション）</label>
                <textarea
                  id="circuit-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="例: 2ビットの加算を行う基本的な回路"
                  rows={3}
                  disabled={isGeneratingShareUrl}
                />
              </div>

              <button
                className="generate-button"
                onClick={handleGenerate}
                disabled={isGeneratingShareUrl}
              >
                {isGeneratingShareUrl ? '生成中...' : '共有URLを生成'}
              </button>

              {shareError && <div className="error-message">{shareError}</div>}

              {shareUrl && (
                <div className="share-result">
                  <label>共有URL</label>
                  <div className="url-container">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      onClick={e => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      className="copy-button"
                      onClick={handleCopy}
                      title="URLをコピー"
                    >
                      {copied ? '✅' : '📋'}
                    </button>
                  </div>
                  <p className="share-note">
                    このURLを共有すると、他の人があなたの回路を開くことができます。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
