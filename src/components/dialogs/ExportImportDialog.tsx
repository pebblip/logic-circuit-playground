import React, { useState, useRef } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { circuitStorage } from '../../services/CircuitStorageService';
import type {
  CircuitStorageResult,
  ExportOptions,
  ImportOptions,
} from '../../types/circuitStorage';
import './ExportImportDialog.css';

interface ExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  onSuccess?: (result: CircuitStorageResult) => void;
}

export const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  isOpen,
  onClose,
  mode,
  onSuccess,
}) => {
  const { gates, wires } = useCircuitStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export states
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeThumbnail: true,
    compress: false,
  });
  const [circuitName, setCircuitName] = useState('');
  const [isExporting, setExporting] = useState(false);

  // Import states
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwriteExisting: false,
    generateNewName: true,
    validate: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);

  const [error, setError] = useState<string>('');

  /**
   * エクスポートを実行
   */
  const handleExport = async () => {
    if (!circuitName.trim()) {
      setError('回路名を入力してください');
      return;
    }

    if (gates.length === 0) {
      setError('エクスポートする回路がありません');
      return;
    }

    setExporting(true);
    setError('');

    try {
      // 一時的に回路を保存してからエクスポート
      const saveResult = await circuitStorage
        .get()
        .saveCircuit(circuitName.trim(), gates, wires, {
          description: `エクスポート用回路 - ${new Date().toLocaleString('ja-JP')}`,
          tags: ['export'],
        });

      if (saveResult.success && saveResult.data) {
        const exportResult = await circuitStorage
          .get()
          .exportCircuit(saveResult.data.id, exportOptions);

        if (exportResult.success) {
          // 一時的に保存した回路を削除
          await circuitStorage.get().deleteCircuit(saveResult.data.id);

          onSuccess?.(exportResult);
          onClose();
        } else {
          setError(exportResult.message || 'エクスポートに失敗しました');
        }
      } else {
        setError(saveResult.message || '回路の準備に失敗しました');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'エクスポート中にエラーが発生しました'
      );
    } finally {
      setExporting(false);
    }
  };

  /**
   * ファイル選択処理
   */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('JSONファイルを選択してください');
      return;
    }

    setSelectedFile(file);
    setError('');

    // プレビューを生成
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 基本的なバリデーション
      if (!data.metadata || !data.circuit || !data.version) {
        setError('無効な回路ファイルです');
        setImportPreview(null);
        return;
      }

      setImportPreview({
        name: data.metadata.name,
        description: data.metadata.description,
        gateCount: data.circuit.gates?.length || 0,
        wireCount: data.circuit.wires?.length || 0,
        createdAt: data.metadata.createdAt,
        version: data.version,
        tags: data.metadata.tags || [],
      });
    } catch {
      setError('ファイルの読み込みに失敗しました');
      setImportPreview(null);
    }
  };

  /**
   * インポートを実行
   */
  const handleImport = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const result = await circuitStorage
        .get()
        .importCircuit(selectedFile, importOptions);

      if (result.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setError(result.message || 'インポートに失敗しました');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'インポート中にエラーが発生しました'
      );
    } finally {
      setImporting(false);
    }
  };

  /**
   * ダイアログをリセット
   */
  const resetDialog = () => {
    setCircuitName('');
    setSelectedFile(null);
    setImportPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ダイアログが開かれた時にリセット
  React.useEffect(() => {
    if (isOpen) {
      resetDialog();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="export-import-dialog" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="dialog-header">
          <h2 className="dialog-title">
            {mode === 'export'
              ? '📤 回路をエクスポート'
              : '📥 回路をインポート'}
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
          {mode === 'export' ? (
            /* エクスポートモード */
            <div className="export-content">
              {/* 現在の回路情報 */}
              <div className="current-circuit-info">
                <h3>現在の回路</h3>
                <div className="circuit-stats">
                  <span className="stat-item">
                    <span className="stat-icon">🔲</span>
                    {gates.length} ゲート
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">🔗</span>
                    {wires.length} 接続
                  </span>
                  <span className="stat-item">
                    <span className="stat-icon">📅</span>
                    {new Date().toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>

              {/* エクスポート設定 */}
              <div className="export-settings">
                <h3>エクスポート設定</h3>

                {/* 回路名 */}
                <div className="form-group">
                  <label htmlFor="export-name" className="form-label">
                    ファイル名 <span className="required">*</span>
                  </label>
                  <input
                    id="export-name"
                    type="text"
                    className="form-input"
                    placeholder="回路名を入力..."
                    value={circuitName}
                    onChange={e => setCircuitName(e.target.value)}
                    autoFocus
                  />
                  <small className="form-help">
                    .json拡張子が自動的に追加されます
                  </small>
                </div>

                {/* オプション */}
                <div className="options-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={e =>
                        setExportOptions(prev => ({
                          ...prev,
                          includeMetadata: e.target.checked,
                        }))
                      }
                    />
                    <span className="checkbox-label">
                      メタデータを含める
                      <small>作成日時、説明、タグなどの情報</small>
                    </span>
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeThumbnail}
                      onChange={e =>
                        setExportOptions(prev => ({
                          ...prev,
                          includeThumbnail: e.target.checked,
                        }))
                      }
                    />
                    <span className="checkbox-label">
                      サムネイルを含める
                      <small>
                        プレビュー画像（ファイルサイズが大きくなります）
                      </small>
                    </span>
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={exportOptions.compress}
                      onChange={e =>
                        setExportOptions(prev => ({
                          ...prev,
                          compress: e.target.checked,
                        }))
                      }
                    />
                    <span className="checkbox-label">
                      圧縮する
                      <small>
                        ファイルサイズを小さくします（可読性は下がります）
                      </small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* インポートモード */
            <div className="import-content">
              {/* ファイル選択 */}
              <div className="file-selection">
                <h3>回路ファイルを選択</h3>
                <div className="file-input-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="file-input"
                    id="circuit-file"
                  />
                  <label htmlFor="circuit-file" className="file-input-label">
                    <span className="file-icon">📁</span>
                    <span className="file-text">
                      {selectedFile
                        ? selectedFile.name
                        : 'JSONファイルを選択...'}
                    </span>
                  </label>
                </div>

                {selectedFile && (
                  <div className="file-info">
                    <span className="file-size">
                      サイズ: {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="file-date">
                      更新日:{' '}
                      {new Date(selectedFile.lastModified).toLocaleDateString(
                        'ja-JP'
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* プレビュー */}
              {importPreview && (
                <div className="import-preview">
                  <h3>回路プレビュー</h3>
                  <div className="preview-content">
                    <div className="preview-header">
                      <h4 className="preview-name">{importPreview.name}</h4>
                      {importPreview.description && (
                        <p className="preview-description">
                          {importPreview.description}
                        </p>
                      )}
                    </div>

                    <div className="preview-stats">
                      <span className="stat-item">
                        <span className="stat-icon">🔲</span>
                        {importPreview.gateCount} ゲート
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">🔗</span>
                        {importPreview.wireCount} 接続
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">📅</span>
                        {new Date(importPreview.createdAt).toLocaleDateString(
                          'ja-JP'
                        )}
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">⚙️</span>v
                        {importPreview.version}
                      </span>
                    </div>

                    {importPreview.tags.length > 0 && (
                      <div className="preview-tags">
                        {importPreview.tags.map((tag: string) => (
                          <span key={tag} className="preview-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* インポート設定 */}
              {selectedFile && (
                <div className="import-settings">
                  <h3>インポート設定</h3>
                  <div className="options-group">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={importOptions.generateNewName}
                        onChange={e =>
                          setImportOptions(prev => ({
                            ...prev,
                            generateNewName: e.target.checked,
                          }))
                        }
                      />
                      <span className="checkbox-label">
                        新しい名前を生成
                        <small>
                          同名の回路がある場合に自動的に番号を付けます
                        </small>
                      </span>
                    </label>

                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={importOptions.validate}
                        onChange={e =>
                          setImportOptions(prev => ({
                            ...prev,
                            validate: e.target.checked,
                          }))
                        }
                      />
                      <span className="checkbox-label">
                        ファイルを検証
                        <small>回路データの整合性をチェックします</small>
                      </span>
                    </label>

                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={importOptions.overwriteExisting}
                        onChange={e =>
                          setImportOptions(prev => ({
                            ...prev,
                            overwriteExisting: e.target.checked,
                          }))
                        }
                      />
                      <span className="checkbox-label">
                        既存の回路を上書き
                        <small>⚠️ 同名の回路が削除されます</small>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
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
            disabled={isExporting || isImporting}
          >
            キャンセル
          </button>

          {mode === 'export' ? (
            <button
              className="button primary"
              onClick={handleExport}
              disabled={
                isExporting || !circuitName.trim() || gates.length === 0
              }
            >
              {isExporting ? (
                <>
                  <span className="loading-spinner"></span>
                  エクスポート中...
                </>
              ) : (
                <>
                  <span>📤</span>
                  エクスポート
                </>
              )}
            </button>
          ) : (
            <button
              className="button primary"
              onClick={handleImport}
              disabled={isImporting || !selectedFile}
            >
              {isImporting ? (
                <>
                  <span className="loading-spinner"></span>
                  インポート中...
                </>
              ) : (
                <>
                  <span>📥</span>
                  インポート
                </>
              )}
            </button>
          )}
        </div>

        {/* ヒント */}
        <div className="shortcuts-hint">
          <span>
            💡{' '}
            {mode === 'export'
              ? 'エクスポートしたファイルは他の人と共有できます'
              : 'インポートすると現在の回路は失われます'}
          </span>
        </div>
      </div>
    </div>
  );
};
