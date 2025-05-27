// シンプルなツールパレットコンポーネント

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Plus,
  Play,
  Pause,
  RotateCcw,
  Undo,
  Redo,
  Zap,
  ChevronLeft
} from 'lucide-react';
import GateIcon from './GateIcon';

const SimpleToolPalette = ({ 
  currentLevel = 1,
  autoMode = false,
  canUndo = false,
  canRedo = false,
  onAddGate,
  onToggleAutoMode,
  onCalculate,
  onReset,
  onUndo,
  onRedo
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState('basic');

  // ゲートカテゴリー
  const gateCategories = {
    basic: {
      label: '基本',
      gates: [
        { type: 'AND', name: 'AND', level: 1 },
        { type: 'OR', name: 'OR', level: 1 },
        { type: 'NOT', name: 'NOT', level: 1 }
      ]
    },
    advanced: {
      label: '応用',
      gates: [
        { type: 'NAND', name: 'NAND', level: 2 },
        { type: 'NOR', name: 'NOR', level: 2 },
        { type: 'XOR', name: 'XOR', level: 3 }
      ]
    },
    io: {
      label: 'I/O',
      gates: [
        { type: 'INPUT', name: '入力', level: 1 },
        { type: 'OUTPUT', name: '出力', level: 1 },
        { type: 'CLOCK', name: 'クロック', level: 2 }
      ]
    }
  };

  const currentGates = activeCategory ? gateCategories[activeCategory].gates : [];

  return (
    <div 
      className="fixed z-40"
      style={{
        left: '20px',
        top: '80px',
        width: isExpanded ? '280px' : '56px',
        transition: 'width 0.3s ease'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}
      >
        {/* ヘッダー */}
        <div 
          style={{
            height: '40px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            cursor: 'pointer'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', flex: 1 }}>
            ツール
          </span>
          <ChevronLeft 
            style={{
              width: '16px',
              height: '16px',
              color: '#6b7280',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

        {/* コンテンツ */}
        {isExpanded && (
          <div style={{ padding: '12px' }}>
            {/* カテゴリータブ */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              {Object.entries(gateCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: activeCategory === key ? '#3b82f6' : '#f3f4f6',
                    color: activeCategory === key ? '#ffffff' : '#6b7280'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* ゲートグリッド */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              {currentGates.map((gate) => {
                const isLocked = gate.level > currentLevel;
                return (
                  <button
                    key={gate.type}
                    onClick={() => !isLocked && onAddGate(gate.type)}
                    disabled={isLocked}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: isLocked ? '#f9fafb' : '#ffffff',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLocked) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <GateIcon type={gate.type} size={24} />
                    <span style={{ fontSize: '11px', color: '#374151' }}>
                      {gate.name}
                    </span>
                    {isLocked && (
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                        Lv.{gate.level}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ツールボタン */}
            <div style={{ 
              display: 'flex', 
              gap: '4px',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={onCalculate}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title="計算実行"
              >
                <Zap style={{ width: '16px', height: '16px' }} />
              </button>
              
              <button
                onClick={onToggleAutoMode}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: autoMode ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title={autoMode ? '自動停止' : '自動実行'}
              >
                {autoMode ? (
                  <Pause style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Play style={{ width: '16px', height: '16px' }} />
                )}
              </button>
              
              <button
                onClick={onReset}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title="リセット"
              >
                <RotateCcw style={{ width: '16px', height: '16px' }} />
              </button>
              
              <button
                onClick={onUndo}
                disabled={!canUndo}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  opacity: canUndo ? 1 : 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title="元に戻す"
              >
                <Undo style={{ width: '16px', height: '16px' }} />
              </button>
              
              <button
                onClick={onRedo}
                disabled={!canRedo}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                  opacity: canRedo ? 1 : 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title="やり直す"
              >
                <Redo style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}

        {/* 折りたたみ時の表示 */}
        {!isExpanded && (
          <div style={{ padding: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

SimpleToolPalette.propTypes = {
  currentLevel: PropTypes.number,
  autoMode: PropTypes.bool,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onAddGate: PropTypes.func.isRequired,
  onToggleAutoMode: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired
};

export default SimpleToolPalette;