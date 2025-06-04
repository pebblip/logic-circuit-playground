import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { circuitStorage } from '../../services/CircuitStorageService';
import type { CircuitStorageResult } from '../../types/circuitStorage';
import { CircuitPreview } from '../common/CircuitPreview';
import '../common/CircuitPreview.css';
import './SaveCircuitDialog.css';

interface SaveCircuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: CircuitStorageResult) => void;
  defaultName?: string;
  overwriteMode?: boolean;
  circuitId?: string;
}

export const SaveCircuitDialog: React.FC<SaveCircuitDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultName = '',
  overwriteMode = false,
  circuitId: _circuitId,
}) => {
  const { gates, wires } = useCircuitStore();
  const [formData, setFormData] = useState({
    name: defaultName,
    description: '',
    tags: [] as string[],
    tagInput: '',
  });
  const [isLoading, setSaving] = useState(false);
  const [error, setError] = useState<string>('');


  // フォームリセット
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: defaultName,
        description: '',
        tags: [],
        tagInput: '',
      });
      setError('');
    }
  }, [isOpen, defaultName]);


  /**
   * タグ追加
   */
  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }));
    }
  };

  /**
   * タグ削除
   */
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  /**
   * 保存実行
   */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('回路名を入力してください');
      return;
    }

    if (gates.length === 0) {
      setError('保存する回路がありません');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // サムネイル生成（共通コンポーネントを使った実装に変更予定）
      // TODO: CircuitPreviewコンポーネントから直接SVG文字列を取得する方法を検討
      const thumbnail = undefined;

      const result = await circuitStorage
        .get()
        .saveCircuit(formData.name.trim(), gates, wires, {
          description: formData.description.trim() || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          thumbnail,
          overwrite: overwriteMode,
        });

      if (result.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setError(result.message || '保存に失敗しました');
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '保存中にエラーが発生しました'
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * キーボードショートカット
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="save-dialog"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ヘッダー */}
        <div className="dialog-header">
          <h2 className="dialog-title">
            {overwriteMode ? '📝 回路を上書き保存' : '💾 回路を保存'}
          </h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="dialog-content">
          {/* プレビューセクション */}
          <div className="preview-section">
            <h3>プレビュー</h3>
            <CircuitPreview
              gates={gates}
              wires={wires}
              width={200}
              height={150}
              backgroundColor="#0a0a0a"
              showStats={false}
              className="circuit-preview"
            />
          </div>

          {/* フォームセクション */}
          <div className="form-section">
            {/* 回路名 */}
            <div className="form-group">
              <label htmlFor="circuit-name" className="form-label">
                回路名 <span className="required">*</span>
              </label>
              <input
                id="circuit-name"
                type="text"
                className="form-input"
                placeholder="回路名を入力..."
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                autoFocus
                maxLength={100}
              />
            </div>

            {/* 説明 */}
            <div className="form-group">
              <label htmlFor="circuit-description" className="form-label">
                説明
              </label>
              <textarea
                id="circuit-description"
                className="form-textarea"
                placeholder="回路の説明を入力（オプション）..."
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                maxLength={500}
              />
            </div>

            {/* タグ */}
            <div className="form-group">
              <label htmlFor="circuit-tags" className="form-label">
                タグ
              </label>
              <div className="tag-input-container">
                <input
                  id="circuit-tags"
                  type="text"
                  className="form-input"
                  placeholder="タグを追加..."
                  value={formData.tagInput}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, tagInput: e.target.value }))
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  className="add-tag-button"
                  onClick={addTag}
                  disabled={!formData.tagInput.trim()}
                >
                  追加
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="tags-container">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button
                        className="tag-remove"
                        onClick={() => removeTag(tag)}
                        aria-label={`${tag}を削除`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* フッター */}
        <div className="dialog-footer">
          <button
            className="button secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            className="button primary"
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                保存中...
              </>
            ) : (
              <>
                <span>💾</span>
                {overwriteMode ? '上書き保存' : '保存'}
              </>
            )}
          </button>
        </div>

        {/* ショートカットヒント */}
        <div className="shortcuts-hint">
          <span>💡 Ctrl+Enter で保存 / Esc で閉じる</span>
        </div>
      </div>
    </div>
  );
};
