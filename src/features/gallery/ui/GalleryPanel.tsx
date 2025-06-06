import React, { useState, useMemo } from 'react';
import type {
  CircuitMetadata,
  GalleryFilter,
  GallerySortOption,
  CircuitCategory,
  CircuitComplexity,
} from '../data/gallery';
import {
  FEATURED_CIRCUITS,
  POPULAR_TAGS,
  CATEGORY_LABELS,
  COMPLEXITY_LABELS,
  GalleryService,
} from '../data/gallery';
import { useCircuitStore } from '../../../stores/circuitStore';
import { debug } from '@/shared/debug';
import './GalleryPanel.css';

interface GalleryPanelProps {
  isVisible: boolean;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ isVisible }) => {
  const [selectedCircuit, setSelectedCircuit] =
    useState<CircuitMetadata | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>({});
  const [sort, setSort] = useState<GallerySortOption>({
    field: 'likes',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { clearAll, setAppMode } = useCircuitStore();

  // フィルタリング&ソート済み回路一覧
  const filteredCircuits = useMemo(() => {
    const filtered = GalleryService.filterCircuits(FEATURED_CIRCUITS, {
      ...filter,
      searchQuery: searchQuery.trim() || undefined,
    });
    return GalleryService.sortCircuits(filtered, sort);
  }, [filter, sort, searchQuery]);

  // 注目の回路（featured）
  const featuredCircuits = useMemo(
    () => FEATURED_CIRCUITS.filter(circuit => circuit.isFeatured).slice(0, 3),
    []
  );

  // 回路を読み込んで自由制作モードで開く
  const handleLoadCircuit = (circuit: CircuitMetadata) => {
    clearAll();

    // ストアに直接回路データを設定
    useCircuitStore.setState({
      gates: circuit.gates.map(gate => ({ ...gate })), // ディープコピー
      wires: circuit.wires.map(wire => ({ ...wire })), // ディープコピー
      selectedGateId: null,
      isDrawingWire: false,
      wireStart: null,
    });

    // 自由制作モードに切り替え
    setAppMode('自由制作');
  };

  // いいねボタン（デモ用）
  const handleLike = (circuitId: string) => {
    debug.log(`❤️ 回路「${circuitId}」にいいね！`);
    // 実際の実装では、サーバーAPIに送信
  };

  // タグクリック時のフィルタ追加
  const handleTagClick = (tag: string) => {
    const currentTags = filter.tags || [];
    if (currentTags.includes(tag)) {
      setFilter({ ...filter, tags: currentTags.filter(t => t !== tag) });
    } else {
      setFilter({ ...filter, tags: [...currentTags, tag] });
    }
  };

  const renderSearchAndFilters = () => (
    <div className="gallery-controls">
      {/* 検索バー */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="回路を検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span>🎛️</span>
          <span>フィルタ</span>
        </button>
      </div>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-row">
            <label>カテゴリ</label>
            <select
              value={filter.category || ''}
              onChange={e =>
                setFilter({
                  ...filter,
                  category: (e.target.value || undefined) as
                    | CircuitCategory
                    | undefined,
                })
              }
            >
              <option value="">すべて</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <label>複雑さ</label>
            <select
              value={filter.complexity || ''}
              onChange={e =>
                setFilter({
                  ...filter,
                  complexity: (e.target.value || undefined) as
                    | CircuitComplexity
                    | undefined,
                })
              }
            >
              <option value="">すべて</option>
              {Object.entries(COMPLEXITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <label>ソート</label>
            <select
              value={`${sort.field}-${sort.direction}`}
              onChange={e => {
                const [field, direction] = e.target.value.split('-');
                setSort({
                  field: field as 'likes' | 'createdAt' | 'views' | 'title',
                  direction: direction as 'asc' | 'desc',
                });
              }}
            >
              <option value="likes-desc">人気順</option>
              <option value="createdAt-desc">新しい順</option>
              <option value="views-desc">閲覧数順</option>
              <option value="title-asc">名前順</option>
            </select>
          </div>
        </div>
      )}

      {/* 選択されたタグ */}
      {filter.tags && filter.tags.length > 0 && (
        <div className="selected-tags">
          {filter.tags.map(tag => (
            <button
              key={tag}
              className="tag selected"
              onClick={() => handleTagClick(tag)}
            >
              {tag} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderCircuitCard = (circuit: CircuitMetadata) => (
    <div key={circuit.id} className="circuit-card">
      {/* サムネイル */}
      <div className="circuit-thumbnail">
        {circuit.thumbnail ? (
          <img src={circuit.thumbnail} alt={circuit.title} />
        ) : (
          <div className="thumbnail-placeholder">
            <span>📱</span>
            <span>{circuit.gates.length} ゲート</span>
          </div>
        )}
      </div>

      {/* メタデータ */}
      <div className="circuit-info">
        <h3 className="circuit-title">{circuit.title}</h3>
        <p className="circuit-description">{circuit.description}</p>

        <div className="circuit-meta">
          <span className="category">{CATEGORY_LABELS[circuit.category]}</span>
          <span className="complexity">
            {COMPLEXITY_LABELS[circuit.complexity]}
          </span>
        </div>

        <div className="circuit-tags">
          {circuit.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              className="tag"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="circuit-stats">
          <span className="stat">
            <span>👤</span>
            <span>{circuit.author}</span>
          </span>
          <span className="stat">
            <span>❤️</span>
            <span>{circuit.likes}</span>
          </span>
          <span className="stat">
            <span>👁️</span>
            <span>{circuit.views}</span>
          </span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="circuit-actions">
        <button
          className="action-button primary"
          onClick={() => handleLoadCircuit(circuit)}
        >
          <span>🔧</span>
          <span>開く</span>
        </button>
        <button
          className="action-button secondary"
          onClick={() => setSelectedCircuit(circuit)}
        >
          <span>👁️</span>
          <span>詳細</span>
        </button>
        <button
          className="action-button secondary"
          onClick={() => handleLike(circuit.id)}
        >
          <span>❤️</span>
          <span>{circuit.likes}</span>
        </button>
      </div>
    </div>
  );

  const renderFeaturedSection = () => (
    <div className="featured-section">
      <h2>✨ 注目の回路</h2>
      <div className="featured-grid">
        {featuredCircuits.map(renderCircuitCard)}
      </div>
    </div>
  );

  const renderPopularTags = () => (
    <div className="popular-tags-section">
      <h3>🏷️ 人気タグ</h3>
      <div className="tags-cloud">
        {POPULAR_TAGS.slice(0, 15).map(tag => (
          <button
            key={tag}
            className={`tag ${filter.tags?.includes(tag) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCircuitDetail = () => {
    if (!selectedCircuit) return null;

    return (
      <div className="circuit-detail-modal">
        <div
          className="modal-backdrop"
          onClick={() => setSelectedCircuit(null)}
        />
        <div className="modal-content">
          <div className="modal-header">
            <h2>{selectedCircuit.title}</h2>
            <button
              className="close-button"
              onClick={() => setSelectedCircuit(null)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="circuit-preview">
              {selectedCircuit.thumbnail ? (
                <img
                  src={selectedCircuit.thumbnail}
                  alt={selectedCircuit.title}
                />
              ) : (
                <div className="preview-placeholder">
                  <span>📱</span>
                  <span>プレビュー画像なし</span>
                </div>
              )}
            </div>

            <div className="circuit-details">
              <p className="description">{selectedCircuit.description}</p>

              <div className="detail-stats">
                <div className="stat-group">
                  <span className="label">作者</span>
                  <span className="value">{selectedCircuit.author}</span>
                </div>
                <div className="stat-group">
                  <span className="label">カテゴリ</span>
                  <span className="value">
                    {CATEGORY_LABELS[selectedCircuit.category]}
                  </span>
                </div>
                <div className="stat-group">
                  <span className="label">複雑さ</span>
                  <span className="value">
                    {COMPLEXITY_LABELS[selectedCircuit.complexity]}
                  </span>
                </div>
                <div className="stat-group">
                  <span className="label">ゲート数</span>
                  <span className="value">{selectedCircuit.gates.length}</span>
                </div>
                <div className="stat-group">
                  <span className="label">ワイヤー数</span>
                  <span className="value">{selectedCircuit.wires.length}</span>
                </div>
              </div>

              <div className="circuit-tags">
                {selectedCircuit.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="action-button primary"
              onClick={() => {
                handleLoadCircuit(selectedCircuit);
                setSelectedCircuit(null);
              }}
            >
              <span>🔧</span>
              <span>この回路を開く</span>
            </button>
            <button
              className="action-button secondary"
              onClick={() => handleLike(selectedCircuit.id)}
            >
              <span>❤️</span>
              <span>いいね ({selectedCircuit.likes})</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="gallery-panel">
      <div className="gallery-header">
        <h1>🎨 回路ギャラリー</h1>
        <p className="gallery-subtitle">美しい回路の世界を探索しましょう</p>
      </div>

      {renderSearchAndFilters()}
      {renderFeaturedSection()}
      {renderPopularTags()}

      <div className="circuits-section">
        <div className="section-header">
          <h2>🔍 回路一覧</h2>
          <span className="results-count">
            {filteredCircuits.length} 件の回路
          </span>
        </div>

        <div className="circuits-grid">
          {filteredCircuits.map(renderCircuitCard)}
        </div>

        {filteredCircuits.length === 0 && (
          <div className="no-results">
            <span>😅</span>
            <p>検索条件に一致する回路が見つかりませんでした</p>
            <button
              onClick={() => {
                setFilter({});
                setSearchQuery('');
              }}
            >
              フィルタをリセット
            </button>
          </div>
        )}
      </div>

      {renderCircuitDetail()}
    </div>
  );
};
