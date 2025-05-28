import React, { useState, useEffect, CSSProperties } from 'react';
import {
  getSavedCircuits,
  saveCircuit,
  loadCircuit,
  deleteCircuit,
  encodeCircuitForURL,
  getStorageUsage
} from '../utils/circuitStorage';
import { SaveLoadPanelProps } from '../types/ComponentProps';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

/**
 * 回路の保存・読み込みパネル
 */
const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({ currentCircuit, onLoad, onClose }) => {
  const [savedCircuits, setSavedCircuits] = useState<Record<string, any>>({});
  const [saveName, setSaveName] = useState('');
  const [shareURL, setShareURL] = useState('');
  const [activeTab, setActiveTab] = useState<string>('save'); // 'save', 'load', 'share'
  const [storageUsage, setStorageUsage] = useState(0);

  useEffect(() => {
    loadSavedCircuits();
  }, []);

  const loadSavedCircuits = (): void => {
    const circuits = getSavedCircuits();
    setSavedCircuits(circuits);
    setStorageUsage(getStorageUsage());
  };

  const handleSave = (): void => {
    if (!saveName.trim()) {
      alert('回路名を入力してください');
      return;
    }

    if (saveCircuit(saveName, currentCircuit)) {
      alert(`"${saveName}" を保存しました`);
      setSaveName('');
      loadSavedCircuits();
      setActiveTab('load');
    } else {
      alert('保存に失敗しました');
    }
  };

  const handleLoad = (name: string): void => {
    const circuit = loadCircuit(name);
    if (circuit) {
      onLoad(circuit);
      alert(`"${name}" を読み込みました`);
      onClose();
    }
  };

  const handleDelete = (name: string): void => {
    if (deleteCircuit(name)) {
      loadSavedCircuits();
    }
  };

  const handleShare = (): void => {
    const encoded = encodeCircuitForURL(currentCircuit);
    if (encoded) {
      const url = `${window.location.origin}${window.location.pathname}?circuit=${encoded}`;
      setShareURL(url);
      
      // クリップボードにコピー
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          alert('URLをクリップボードにコピーしました');
        });
      }
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    maxWidth: '90vw',
    backgroundColor: '#0f1441',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    zIndex: 1000,
    color: 'white',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#00ff88'
  };

  const closeButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px'
  };

  const tabContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const tabs: TabConfig[] = [
    { id: 'save', label: '保存', icon: '💾' },
    { id: 'load', label: '読み込み', icon: '📂' },
    { id: 'share', label: '共有', icon: '🔗' }
  ];

  return (
    <div style={containerStyle}>
      {/* ヘッダー */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          回路の管理
        </h2>
        
        <button
          onClick={onClose}
          style={closeButtonStyle}
        >
          ×
        </button>
      </div>

      {/* タブ */}
      <div style={tabContainerStyle}>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* 保存タブ */}
        {activeTab === 'save' && (
          <SaveTab
            saveName={saveName}
            setSaveName={setSaveName}
            handleSave={handleSave}
            currentCircuit={currentCircuit}
          />
        )}

        {/* 読み込みタブ */}
        {activeTab === 'load' && (
          <LoadTab
            savedCircuits={savedCircuits}
            handleLoad={handleLoad}
            handleDelete={handleDelete}
            formatDate={formatDate}
          />
        )}

        {/* 共有タブ */}
        {activeTab === 'share' && (
          <ShareTab
            handleShare={handleShare}
            shareURL={shareURL}
          />
        )}
      </div>

      {/* フッター */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center'
      }}>
        ストレージ使用量: {storageUsage} KB / 5000 KB
      </div>
    </div>
  );
};

// Tab Button Component
interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onClick }) => {
  const style: CSSProperties = {
    background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
    border: 'none',
    color: isActive ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: isActive ? '2px solid #00ff88' : '2px solid transparent',
    transition: 'all 0.2s'
  };

  return (
    <button onClick={onClick} style={style}>
      {tab.icon} {tab.label}
    </button>
  );
};

// Save Tab Component
interface SaveTabProps {
  saveName: string;
  setSaveName: (name: string) => void;
  handleSave: () => void;
  currentCircuit: any;
}

const SaveTab: React.FC<SaveTabProps> = ({ saveName, setSaveName, handleSave, currentCircuit }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="回路名を入力..."
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            }
          }}
        />
        
        <button
          onClick={handleSave}
          disabled={!saveName.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: saveName.trim() ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
            color: saveName.trim() ? '#000' : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: saveName.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          保存
        </button>
      </div>
      
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          💡 ヒント: わかりやすい名前を付けましょう（例: 半加算器、4ビットカウンタ）
        </p>
        <p style={{ margin: 0 }}>
          ゲート数: {currentCircuit.gates?.length || 0} / 
          接続数: {currentCircuit.connections?.length || 0}
        </p>
      </div>
    </div>
  );
};

// Load Tab Component
interface LoadTabProps {
  savedCircuits: Record<string, any>;
  handleLoad: (name: string) => void;
  handleDelete: (name: string) => void;
  formatDate: (timestamp: number) => string;
}

const LoadTab: React.FC<LoadTabProps> = ({ savedCircuits, handleLoad, handleDelete, formatDate }) => {
  if (Object.keys(savedCircuits).length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '8px' }}>
          保存された回路がありません
        </p>
        <p style={{ fontSize: '14px' }}>
          「保存」タブから回路を保存してください
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '12px'
    }}>
      {Object.entries(savedCircuits).map(([name, circuit]) => (
        <CircuitItem
          key={name}
          name={name}
          circuit={circuit}
          handleLoad={handleLoad}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

// Circuit Item Component
interface CircuitItemProps {
  name: string;
  circuit: any;
  handleLoad: (name: string) => void;
  handleDelete: (name: string) => void;
  formatDate: (timestamp: number) => string;
}

const CircuitItem: React.FC<CircuitItemProps> = ({ name, circuit, handleLoad, handleDelete, formatDate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: `1px solid ${isHovered ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    transition: 'all 0.2s'
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <h4 style={{
          margin: '0 0 4px 0',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {name}
        </h4>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          {circuit.metadata && (
            <>
              更新: {formatDate(circuit.metadata.updatedAt)} / 
              ゲート: {circuit.metadata.gateCount} / 
              接続: {circuit.metadata.connectionCount}
            </>
          )}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleLoad(name)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 255, 136, 0.2)',
            color: '#00ff88',
            border: '1px solid #00ff88',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          読み込み
        </button>
        
        <button
          onClick={() => handleDelete(name)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: '#ff6666',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
};

// Share Tab Component
interface ShareTabProps {
  handleShare: () => void;
  shareURL: string;
}

const ShareTab: React.FC<ShareTabProps> = ({ handleShare, shareURL }) => {
  return (
    <div>
      <button
        onClick={handleShare}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#00b4d8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        🔗 共有URLを生成
      </button>
      
      {shareURL && (
        <div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            marginBottom: '16px',
            wordBreak: 'break-all',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            {shareURL}
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#00ff88'
          }}>
            ✅ URLがクリップボードにコピーされました！
            <br />
            このURLを共有すると、他の人があなたの回路を見ることができます。
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveLoadPanel;