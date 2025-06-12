import React from 'react';
import { getGateDescription } from '@/data/gateDescriptions';
import type { CustomGateDefinition } from '@/types/circuit';

interface GateDescriptionProps {
  gateType: string;
  customGateDefinition?: CustomGateDefinition;
}

export const GateDescription: React.FC<GateDescriptionProps> = ({
  gateType,
  customGateDefinition,
}) => {
  // カスタムゲートの場合は専用の表示
  if (gateType === 'CUSTOM' && customGateDefinition) {
    return (
      <div
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* 説明 */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3
            style={{
              color: '#00ff88',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
            }}
          >
            説明
          </h3>
          <p style={{ margin: 0 }}>
            {customGateDefinition.description ||
              'このカスタムゲートの説明は登録されていません。'}
          </p>
        </div>

        {/* 入出力情報 */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3
            style={{
              color: 'var(--color-secondary)',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
            }}
          >
            入出力構成
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-md)',
            }}
          >
            <div>
              <h4
                style={{
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                入力ピン ({customGateDefinition.inputs.length}個)
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--spacing-lg)',
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                }}
              >
                {customGateDefinition.inputs.map((pin, index: number) => (
                  <li
                    key={index}
                    style={{
                      fontSize: 'var(--font-size-base)',
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {pin.name || `入力${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                出力ピン ({customGateDefinition.outputs.length}個)
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--spacing-lg)',
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                }}
              >
                {customGateDefinition.outputs.map((pin, index: number) => (
                  <li
                    key={index}
                    style={{
                      fontSize: 'var(--font-size-base)',
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {pin.name || `出力${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 作成情報 */}
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            paddingTop: 'var(--spacing-md)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <p style={{ margin: '0 0 4px 0' }}>
            作成日時:{' '}
            {new Date(customGateDefinition.createdAt).toLocaleString('ja-JP')}
          </p>
          {customGateDefinition.updatedAt !==
            customGateDefinition.createdAt && (
            <p style={{ margin: 0 }}>
              更新日時:{' '}
              {new Date(customGateDefinition.updatedAt).toLocaleString('ja-JP')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 通常のゲートの場合は既存の処理
  const data = getGateDescription(gateType);

  return (
    <div
      style={{
        fontSize: 'var(--font-size-base)',
        lineHeight: 'var(--line-height-normal)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* 基本動作 */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            margin: '0 0 12px 0',
          }}
        >
          基本動作
        </h3>
        <p style={{ margin: 0 }}>{data.basicOperation}</p>
        {data.truthTableNote && (
          <div
            style={{
              margin: 'var(--spacing-md) 0 0 0',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-primary-subtle-light)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            💡 {data.truthTableNote}
          </div>
        )}
      </div>

      {/* 日常的な判断との類比 */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--spacing-md) 0',
          }}
        >
          日常的な例
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 'var(--spacing-lg)',
            listStyleType: 'disc',
            listStylePosition: 'outside',
          }}
        >
          {data.realWorldAnalogy.map((analogy, index) => (
            <li
              key={index}
              style={{
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
                display: 'list-item',
              }}
            >
              {analogy}
            </li>
          ))}
        </ul>
      </div>

      {/* なぜ重要？ */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--spacing-md) 0',
          }}
        >
          なぜ重要？
        </h3>
        <p style={{ margin: 0 }}>{data.whyImportant}</p>
      </div>

      {/* 技術的洞察 */}
      {data.technicalInsight && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3
            style={{
              color: 'var(--color-secondary)',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
            }}
          >
            技術的洞察
          </h3>
          <p style={{ margin: 0 }}>{data.technicalInsight}</p>
        </div>
      )}

      {/* 学習のコツ */}
      <div
        style={{
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg-glass)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--border-radius-sm)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--spacing-sm) 0',
            color: 'var(--color-warning)',
          }}
        >
          💡 学習のコツ
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
          {data.learningTip}
        </p>
      </div>
    </div>
  );
};
