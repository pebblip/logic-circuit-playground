import React, { useState, useEffect, useCallback } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { circuitStorage } from '../../services/CircuitStorageService';
import type {
  CircuitMetadata,
  CircuitStorageResult,
} from '../../types/circuitStorage';
import { TERMS } from '../../features/learning-mode/data/terms';
import './LoadCircuitDialog.css';

interface LoadCircuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad?: (result: CircuitStorageResult) => void;
}

export const LoadCircuitDialog: React.FC<LoadCircuitDialogProps> = ({
  isOpen,
  onClose,
  onLoad,
}) => {
  const { gates: currentGates, wires: currentWires } = useCircuitStore();
  const [circuits, setCircuits] = useState<CircuitMetadata[]>([]);
  const [filteredCircuits, setFilteredCircuits] = useState<CircuitMetadata[]>(
    []
  );
  const [selectedCircuit, setSelectedCircuit] =
    useState<CircuitMetadata | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isLoadingCircuit, setLoadingCircuit] = useState(false);
  const [error, setError] = useState<string>('');

  // フィルター・検索状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    'name' | 'createdAt' | 'updatedAt' | 'gateCount'
  >('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 利用可能なタグ一覧
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  /**
   * 回路一覧を取得
   */
  const loadCircuits = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await circuitStorage.get().listCircuits();

      if (result.success && result.data) {
        setCircuits(result.data);

        // 利用可能なタグを抽出
        const allTags = new Set<string>();
        result.data.forEach((circuit: CircuitMetadata) => {
          circuit.tags?.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      } else {
        setError(result.message || '回路一覧の取得に失敗しました');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `${TERMS.LOAD}中に${TERMS.ERROR}が発生しました`
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * フィルタリングを適用
   */
  const applyFilters = useCallback(() => {
    let filtered = [...circuits];

    // 検索クエリでフィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        circuit =>
          circuit.name.toLowerCase().includes(query) ||
          circuit.description?.toLowerCase().includes(query) ||
          circuit.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // タグでフィルタ
    if (selectedTags.length > 0) {
      filtered = filtered.filter(circuit =>
        selectedTags.some(tag => circuit.tags?.includes(tag))
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aVal: string | number, bVal: string | number;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'gateCount':
          aVal = a.stats.gateCount;
          bVal = b.stats.gateCount;
          break;
        default:
          aVal = new Date(a[sortBy]).getTime();
          bVal = new Date(b[sortBy]).getTime();
      }

      return sortOrder === 'asc'
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

    setFilteredCircuits(filtered);
  }, [circuits, searchQuery, selectedTags, sortBy, sortOrder]);

  // ダイアログが開かれた時に回路一覧を取得
  useEffect(() => {
    if (isOpen) {
      loadCircuits();
    }
  }, [isOpen]);

  // フィルタリング処理
  useEffect(() => {
    applyFilters();
  }, [circuits, searchQuery, selectedTags, sortBy, sortOrder, applyFilters]);

  /**
   * 回路を読み込み
   */
  const handleLoad = async (circuitId: string) => {
    if (currentGates.length > 0 || currentWires.length > 0) {
      const confirmed = window.confirm(
        '作業中の回路は保存されません。\nよろしければ保存してから新しい回路を読み込んでください。\n\n続行しますか？'
      );
      if (!confirmed) return;
    }

    setLoadingCircuit(true);
    setError('');

    try {
      const result = await circuitStorage.get().loadCircuit(circuitId);

      if (result.success && result.data) {
        // Zustandストアの全メソッドを取得
        const store = useCircuitStore.getState();

        // 現在の回路をクリア
        store.gates.forEach(gate => store.deleteGate(gate.id));
        store.wires.forEach(wire => store.deleteWire(wire.id));

        // 新しい回路を読み込み
        const circuit = result.data.circuit;

        // 直接状態を設定（IDを保持するため）
        useCircuitStore.setState({
          gates: [...circuit.gates], // スプレッド構文でmutable配列へ変換
          wires: [...circuit.wires], // スプレッド構文でmutable配列へ変換
        });

        // 回路の評価を強制的に実行
        const { evaluateCircuit, defaultConfig } = await import(
          '@domain/simulation/core'
        );
        const evaluatedCircuit = await evaluateCircuit(
          { gates: circuit.gates, wires: circuit.wires },
          defaultConfig
        );

        if (evaluatedCircuit.success) {
          useCircuitStore.setState({
            gates: [...evaluatedCircuit.data.circuit.gates], // スプレッド構文でmutable配列へ変換
            wires: [...evaluatedCircuit.data.circuit.wires], // スプレッド構文でmutable配列へ変換
          });
        }

        onLoad?.(result);
        onClose();
      } else {
        setError(result.message || `${TERMS.LOAD}に${TERMS.FAILED}しました`);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `${TERMS.LOAD}中に${TERMS.ERROR}が発生しました`
      );
    } finally {
      setLoadingCircuit(false);
    }
  };

  /**
   * 回路を削除
   */
  const handleDelete = async (
    circuit: CircuitMetadata,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `回路「${circuit.name}」を完全に削除します。\n\n⚠️ 削除した回路は復元できません。\n本当に削除しますか？`
    );

    if (!confirmed) return;

    try {
      const result = await circuitStorage.get().deleteCircuit(circuit.id);

      if (result.success) {
        // リストから削除
        setCircuits(prev => prev.filter(c => c.id !== circuit.id));
        if (selectedCircuit?.id === circuit.id) {
          setSelectedCircuit(null);
        }
      } else {
        setError(result.message || `${TERMS.DELETE}に${TERMS.FAILED}しました`);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `${TERMS.DELETE}中に${TERMS.ERROR}が発生しました`
      );
    }
  };

  /**
   * タグフィルターの切り替え
   */
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  /**
   * 日付フォーマット
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="load-dialog" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="dialog-header">
          <h2 className="dialog-title">
            📂 保存済み{TERMS.CIRCUIT}を{TERMS.LOAD}
          </h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label={TERMS.CLOSE}
          >
            ✕
          </button>
        </div>

        {/* 検索・フィルターバー */}
        <div className="filter-bar">
          {/* 検索ボックス */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`${TERMS.CIRCUIT_NAME}、説明、タグで検索...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 表示切り替え */}
          <div className="view-controls">
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="グリッド表示"
            >
              ⚏
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="リスト表示"
            >
              ☰
            </button>
          </div>

          {/* ソート */}
          <div className="sort-controls">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [
                  typeof sortBy,
                  typeof sortOrder,
                ];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="sort-select"
            >
              <option value="updatedAt-desc">更新日時 (新→古)</option>
              <option value="updatedAt-asc">更新日時 (古→新)</option>
              <option value="createdAt-desc">作成日時 (新→古)</option>
              <option value="createdAt-asc">作成日時 (古→新)</option>
              <option value="name-asc">名前 (A→Z)</option>
              <option value="name-desc">名前 (Z→A)</option>
              <option value="gateCount-desc">ゲート数 (多→少)</option>
              <option value="gateCount-asc">ゲート数 (少→多)</option>
            </select>
          </div>
        </div>

        {/* タグフィルター */}
        {availableTags.length > 0 && (
          <div className="tag-filter-section">
            <span className="filter-label">タグでフィルター:</span>
            <div className="tag-filters">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTagFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="dialog-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner large"></div>
              <p>回路一覧を読み込み中...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="retry-button" onClick={loadCircuits}>
                再試行
              </button>
            </div>
          ) : filteredCircuits.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📁</span>
              <h3>回路が見つかりません</h3>
              <p>
                {circuits.length === 0
                  ? '保存された回路がありません'
                  : '検索条件に一致する回路がありません'}
              </p>
            </div>
          ) : (
            <div className={`circuits-container ${viewMode}`}>
              {filteredCircuits.map(circuit => (
                <div
                  key={circuit.id}
                  className={`circuit-card ${selectedCircuit?.id === circuit.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCircuit(circuit)}
                  onDoubleClick={() => handleLoad(circuit.id)}
                >
                  {/* サムネイル */}
                  <div className="circuit-thumbnail">
                    {circuit.thumbnail ? (
                      <img src={circuit.thumbnail} alt={circuit.name} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>🔌</span>
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <div className="circuit-info">
                    <h3 className="circuit-name">{circuit.name}</h3>
                    {circuit.description && (
                      <p className="circuit-description">
                        {circuit.description}
                      </p>
                    )}

                    <div className="circuit-meta">
                      <span className="meta-item">
                        🔲 {circuit.stats.gateCount}ゲート
                      </span>
                      <span className="meta-item">
                        🔗 {circuit.stats.wireCount}接続
                      </span>
                      <span className="meta-item">
                        📅 {formatDate(circuit.updatedAt)}
                      </span>
                    </div>

                    {circuit.tags && circuit.tags.length > 0 && (
                      <div className="circuit-tags">
                        {circuit.tags.map(tag => (
                          <span key={tag} className="circuit-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* アクション */}
                  <div className="circuit-actions">
                    <button
                      className="action-button delete"
                      onClick={e => handleDelete(circuit, e)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
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
          <div className="footer-info">
            {filteredCircuits.length > 0 && (
              <span className="circuit-count">
                {filteredCircuits.length}/{circuits.length} 個の回路
              </span>
            )}
          </div>

          <div className="footer-actions">
            <button
              className="button secondary"
              onClick={onClose}
              disabled={isLoadingCircuit}
            >
              キャンセル
            </button>
            <button
              className="button primary"
              onClick={() => selectedCircuit && handleLoad(selectedCircuit.id)}
              disabled={isLoadingCircuit || !selectedCircuit}
            >
              {isLoadingCircuit ? (
                <>
                  <span className="loading-spinner"></span>
                  読み込み中...
                </>
              ) : (
                <>
                  <span>📂</span>
                  読み込み
                </>
              )}
            </button>
          </div>
        </div>

        {/* ショートカットヒント */}
        <div className="shortcuts-hint">
          <span>💡 ダブルクリックで読み込み / Esc で閉じる</span>
        </div>
      </div>
    </div>
  );
};
