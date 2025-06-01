import React, { useState, useEffect } from 'react';

interface SettingsPanelProps {
  onClose: () => void;
  theme: any;
}

interface Settings {
  theme: 'modern' | 'neon' | 'minimal';
  soundEnabled: boolean;
  soundVolume: number;
  animationsEnabled: boolean;
  showGrid: boolean;
  autoSave: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, theme }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('logic-circuit-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      theme: 'modern',
      soundEnabled: true,
      soundVolume: 50,
      animationsEnabled: true,
      showGrid: true,
      autoSave: true
    };
  });

  // 設定を保存
  useEffect(() => {
    localStorage.setItem('logic-circuit-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1f3a',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            margin: 0
          }}>
            ⚙️ 設定
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            ×
          </button>
        </div>

        {/* 設定項目 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* テーマ設定 */}
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '12px' }}>
              テーマ
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['modern', 'neon', 'minimal'] as const).map(themeName => (
                <button
                  key={themeName}
                  onClick={() => updateSetting('theme', themeName)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: settings.theme === themeName ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                    background: settings.theme === themeName ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: settings.theme === themeName ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {themeName === 'modern' && 'モダン'}
                  {themeName === 'neon' && 'ネオン'}
                  {themeName === 'minimal' && 'ミニマル'}
                </button>
              ))}
            </div>
          </div>

          {/* サウンド設定 */}
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '12px' }}>
              サウンド
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                  効果音を有効にする
                </span>
              </label>
              
              {settings.soundEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px', minWidth: '60px' }}>
                    音量:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => updateSetting('soundVolume', Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '14px', minWidth: '40px' }}>
                    {settings.soundVolume}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 表示設定 */}
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '12px' }}>
              表示
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                  アニメーションを有効にする
                </span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => updateSetting('showGrid', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                  グリッドを表示する
                </span>
              </label>
            </div>
          </div>

          {/* その他 */}
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', marginBottom: '12px' }}>
              その他
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                回路を自動保存する
              </span>
            </label>
          </div>
        </div>

        {/* フッター */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              localStorage.removeItem('logic-circuit-settings');
              localStorage.removeItem('logic-circuit-discoveries');
              localStorage.removeItem('logic-circuit-notebook');
              if (confirm('すべてのデータをリセットしますか？')) {
                location.reload();
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            データをリセット
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};