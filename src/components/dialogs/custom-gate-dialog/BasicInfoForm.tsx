import React from 'react';

interface BasicInfoFormProps {
  gateName: string;
  displayName: string;
  description: string;
  selectedIcon: string;
  selectedCategory: string;
  onGateNameChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIconChange: (icon: string) => void;
  onCategoryChange: (category: string) => void;
}

const ICON_OPTIONS = [
  '🔧',
  '➕',
  '✖️',
  '⚙️',
  '🔀',
  '🔄',
  '⚡',
  '🎯',
  '📊',
  '🎲',
];

const CATEGORY_OPTIONS = [
  { value: 'custom', label: 'カスタム' },
  { value: 'arithmetic', label: '算術' },
  { value: 'memory', label: 'メモリ' },
  { value: 'control', label: '制御' },
  { value: 'logic', label: '論理' },
  { value: 'other', label: 'その他' },
];

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  gateName,
  displayName,
  description,
  selectedIcon,
  selectedCategory,
  onGateNameChange,
  onDisplayNameChange,
  onDescriptionChange,
  onIconChange,
  onCategoryChange,
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              内部名 <span style={{ color: '#ff4444' }}>*</span>（英数字）
            </label>
            <input
              type="text"
              value={gateName}
              onChange={e => onGateNameChange(e.target.value)}
              placeholder="MyCustomGate"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              表示名（任意）
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => onDisplayNameChange(e.target.value)}
              placeholder="カスタムゲート"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            説明（任意）
          </label>
          <textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="このゲートの機能を説明してください..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              minHeight: '60px',
              resize: 'vertical' as const,
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              アイコン
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
              }}
            >
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => onIconChange(icon)}
                  style={{
                    padding: '8px',
                    backgroundColor:
                      selectedIcon === icon
                        ? 'rgba(0, 255, 136, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedIcon === icon ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '6px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              カテゴリ
            </label>
            <select
              value={selectedCategory}
              onChange={e => onCategoryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
              }}
            >
              {CATEGORY_OPTIONS.map(category => (
                <option
                  key={category.value}
                  value={category.value}
                  style={{ backgroundColor: '#0f1441' }}
                >
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
