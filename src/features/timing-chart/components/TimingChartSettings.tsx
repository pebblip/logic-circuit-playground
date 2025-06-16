/**
 * タイミングチャートの設定パネルコンポーネント
 */

import React, { useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { TimingChartSettings as SettingsType } from '@/types/timing';

interface TimingChartSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: Partial<SettingsType>) => void;
  onClose: () => void;
  className?: string;
}

interface SettingGroupProps {
  title: string;
  children: React.ReactNode;
}

const SettingGroup: React.FC<SettingGroupProps> = ({ title, children }) => (
  <div className="setting-group">
    <h5 className="text-xs font-semibold text-gray-300 mb-2">{title}</h5>
    <div className="space-y-2">{children}</div>
  </div>
);

interface ToggleSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  value,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <label className="text-xs text-gray-200">{label}</label>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="
        w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 
        peer-focus:ring-green-500 rounded-full peer 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:rounded-full after:h-4 after:w-4 
        after:transition-all peer-checked:bg-green-500
      "
      />
    </label>
  </div>
);

interface NumberSettingProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

const NumberSetting: React.FC<NumberSettingProps> = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-200">{label}</label>
      <span className="text-xs text-gray-400">
        {value}
        {unit}
      </span>
    </div>
    {description && <p className="text-xs text-gray-400">{description}</p>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="
        w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer
        slider:bg-green-500 slider:rounded-full
      "
    />
    <div className="flex justify-between text-xs text-gray-500">
      <span>
        {min}
        {unit}
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
  </div>
);

interface SelectSettingProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

const SelectSetting: React.FC<SelectSettingProps> = ({
  label,
  description,
  value,
  onChange,
  options,
}) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-200">{label}</label>
    {description && <p className="text-xs text-gray-400">{description}</p>}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="
        w-full bg-gray-700 border border-gray-600 text-white text-xs 
        rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500
      "
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const TimingChartSettings: React.FC<TimingChartSettingsProps> = ({
  settings,
  onSettingsChange,
  onClose,
  className = '',
}) => {
  // 個別設定の更新ハンドラー
  const updateSetting = useCallback(
    <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
      onSettingsChange({ [key]: value });
    },
    [onSettingsChange]
  );

  // プリセット設定
  const applyPreset = useCallback(
    (preset: 'performance' | 'quality' | 'default') => {
      switch (preset) {
        case 'performance':
          onSettingsChange({
            updateInterval: 33, // 30fps
            captureDepth: 5000,
            gridVisible: false,
            edgeMarkersEnabled: false,
          });
          break;

        case 'quality':
          onSettingsChange({
            updateInterval: 16, // 60fps
            captureDepth: 20000,
            gridVisible: true,
            edgeMarkersEnabled: true,
          });
          break;

        case 'default':
          onSettingsChange({
            theme: 'dark',
            gridVisible: true,
            clockHighlightEnabled: true,
            edgeMarkersEnabled: true,
            signalLabelsVisible: true,
            autoCapture: true,
            captureDepth: 10000,
            updateInterval: 16,
          });
          break;
      }
    },
    [onSettingsChange]
  );

  return (
    <div className={`timing-chart-settings p-4 bg-gray-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">
          タイミングチャート設定
        </h4>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 表示設定 */}
        <SettingGroup title="表示設定">
          <SelectSetting
            label="テーマ"
            value={settings.theme}
            onChange={value =>
              updateSetting('theme', value as 'dark' | 'light')
            }
            options={[
              { value: 'dark', label: 'ダーク' },
              { value: 'light', label: 'ライト' },
            ]}
          />

          <ToggleSetting
            label="グリッド表示"
            description="時間軸のグリッド線を表示"
            value={settings.gridVisible}
            onChange={value => updateSetting('gridVisible', value)}
          />

          <ToggleSetting
            label="信号ラベル表示"
            description="信号名を波形上に表示"
            value={settings.signalLabelsVisible}
            onChange={value => updateSetting('signalLabelsVisible', value)}
          />

          <ToggleSetting
            label="エッジマーカー"
            description="立ち上がり/立ち下がりを強調"
            value={settings.edgeMarkersEnabled}
            onChange={value => updateSetting('edgeMarkersEnabled', value)}
          />
        </SettingGroup>

        {/* CLOCK設定 */}
        <SettingGroup title="CLOCK設定">
          <ToggleSetting
            label="CLOCK同期表示"
            description="CLOCK信号を特別に強調表示"
            value={settings.clockHighlightEnabled}
            onChange={value => updateSetting('clockHighlightEnabled', value)}
          />
        </SettingGroup>

        {/* データ取得設定 */}
        <SettingGroup title="データ取得">
          <ToggleSetting
            label="自動キャプチャ"
            description="シミュレーション中に自動でイベントを記録"
            value={settings.autoCapture}
            onChange={value => updateSetting('autoCapture', value)}
          />

          <NumberSetting
            label="保持イベント数"
            description="メモリ使用量を制限"
            value={settings.captureDepth}
            onChange={value => updateSetting('captureDepth', value)}
            min={1000}
            max={50000}
            step={1000}
            unit=" イベント"
          />

          <NumberSetting
            label="更新間隔"
            description="描画頻度（低いほど高速）"
            value={settings.updateInterval}
            onChange={value => updateSetting('updateInterval', value)}
            min={16}
            max={100}
            step={1}
            unit=" ms"
          />
        </SettingGroup>
      </div>

      {/* プリセット */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h5 className="text-xs font-semibold text-gray-300 mb-2">プリセット</h5>
        <div className="flex gap-2">
          <button
            onClick={() => applyPreset('performance')}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            パフォーマンス優先
          </button>
          <button
            onClick={() => applyPreset('quality')}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            品質優先
          </button>
          <button
            onClick={() => applyPreset('default')}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            デフォルト
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h5 className="text-xs font-semibold text-gray-300 mb-2">統計情報</h5>
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
          <div>
            <span className="text-gray-500">更新頻度:</span>
            <br />
            {Math.round(1000 / settings.updateInterval)} fps
          </div>
          <div>
            <span className="text-gray-500">メモリ制限:</span>
            <br />~{Math.round((settings.captureDepth * 200) / 1024)} KB
          </div>
          <div>
            <span className="text-gray-500">テーマ:</span>
            <br />
            {settings.theme === 'dark' ? 'ダーク' : 'ライト'}
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS スタイル
const styles = `
.timing-chart-settings {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.setting-group {
  padding: 16px;
  background: #374151;
  border-radius: 6px;
}

/* カスタムスライダースタイル */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-webkit-slider-track {
  height: 4px;
  border-radius: 2px;
  background: #4b5563;
}

input[type="range"]::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: #4b5563;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .timing-chart-settings .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .timing-chart-settings .gap-6 {
    gap: 1rem;
  }
}
`;

// スタイルの注入
if (
  typeof window !== 'undefined' &&
  !document.querySelector('#timing-chart-settings-styles')
) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'timing-chart-settings-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
