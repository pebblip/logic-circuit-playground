import React, { useEffect, useMemo } from 'react';
import type { GateType, CustomGateDefinition } from '../../types/circuit';
import { useCircuitStore } from '../../stores/circuitStore';
import { useMobileDragGate } from '../../hooks/useMobileDragGate';
import { MobileDragPreview } from '../MobileDragPreview';

// デモ用カスタムゲート定義
const DEMO_CUSTOM_GATES: CustomGateDefinition[] = [
  {
    id: 'demo-half-adder',
    name: 'HalfAdder',
    displayName: '半加算器',
    description: '2進数の1桁加算を実現。A + B = Sum(S) + Carry(C)',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
    ],
    outputs: [
      { name: 'S', index: 0 }, // Sum（和）
      { name: 'C', index: 1 }, // Carry（桁上がり）
    ],
    truthTable: {
      '00': '00', // 0+0 = 0 (carry=0)
      '01': '10', // 0+1 = 1 (carry=0)
      '10': '10', // 1+0 = 1 (carry=0)
      '11': '01', // 1+1 = 0 (carry=1)
    },
    icon: '➕',
    category: 'arithmetic',
    width: 80,
    height: 60,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-full-adder',
    name: 'FullAdder',
    displayName: '全加算器',
    description: '桁上がりを含む1桁加算',
    inputs: [
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
      { name: 'Cin', index: 2 },
    ],
    outputs: [
      { name: 'S', index: 0 },
      { name: 'Cout', index: 1 },
    ],
    truthTable: {
      '000': '00',
      '001': '10',
      '010': '10',
      '011': '01',
      '100': '10',
      '101': '01',
      '110': '01',
      '111': '11',
    },
    icon: '∑',
    category: 'arithmetic',
    width: 80,
    height: 60,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

interface MobileToolbarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCategory: 'basic' | 'io' | 'special' | 'custom';
  onCategoryChange: (category: 'basic' | 'io' | 'special' | 'custom') => void;
}

const TOOL_CATEGORIES = {
  basic: {
    label: '基本',
    gates: [
      { type: 'AND' as GateType, label: 'AND', icon: 'AND' },
      { type: 'OR' as GateType, label: 'OR', icon: 'OR' },
      { type: 'NOT' as GateType, label: 'NOT', icon: 'NOT' },
      { type: 'XOR' as GateType, label: 'XOR', icon: 'XOR' },
      { type: 'NAND' as GateType, label: 'NAND', icon: 'NAND' },
      { type: 'NOR' as GateType, label: 'NOR', icon: 'NOR' },
    ],
  },
  io: {
    label: '入出力',
    gates: [
      { type: 'INPUT' as GateType, label: '入力', icon: 'IN' },
      { type: 'OUTPUT' as GateType, label: '出力', icon: 'OUT' },
    ],
  },
  special: {
    label: '特殊',
    gates: [
      { type: 'CLOCK' as GateType, label: 'CLK', icon: 'CLK' },
      { type: 'D-FF' as GateType, label: 'D-FF', icon: 'DFF' },
      { type: 'SR-LATCH' as GateType, label: 'SR', icon: 'SR' },
      { type: 'MUX' as GateType, label: 'MUX', icon: 'MUX' },
    ],
  },
  custom: {
    label: 'カスタム',
    gates: [] as any[], // 動的に取得
  },
};

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  isOpen,
  onToggle,
  selectedCategory,
  onCategoryChange,
}) => {
  const { addGate, gates, customGates, addCustomGateInstance } =
    useCircuitStore();
  const {
    dragPreview,
    isDragging,
    startTouchDrag,
    updateTouchDrag,
    endTouchDrag,
    cancelTouchDrag,
  } = useMobileDragGate();

  // グローバルタッチイベントリスナー
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // スクロールを防ぐ
      updateTouchDrag(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endTouchDrag(e);
    };

    const handleTouchCancel = () => {
      cancelTouchDrag();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isDragging, updateTouchDrag, endTouchDrag, cancelTouchDrag]);

  // カスタムゲートを含むカテゴリを準備
  const categories = useMemo(() => {
    const cats = { ...TOOL_CATEGORIES };

    // デモカスタムゲート + ユーザーカスタムゲートを結合
    const allCustomGates = [...DEMO_CUSTOM_GATES, ...(customGates || [])];

    // カスタムゲートタブを常に表示（デモゲートがあるため）
    cats.custom.gates = allCustomGates.map(cg => ({
      type: 'CUSTOM' as GateType,
      label: cg.displayName.substring(0, 4),
      icon: cg.icon || cg.displayName.substring(0, 2),
      customDefinition: cg,
    }));

    return cats;
  }, [customGates]);

  const handleToolClick = (
    type: GateType,
    customDefinition?: CustomGateDefinition
  ) => {
    // キャンバスの中央付近に配置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 200; // ツールバーの高さを考慮

    const baseX = viewportWidth / 2;
    const baseY = viewportHeight / 2;

    // 既存のゲートと重ならない位置を計算
    let x = baseX;
    let y = baseY;
    let offset = 0;

    while (
      gates.some(
        g => Math.abs(g.position.x - x) < 70 && Math.abs(g.position.y - y) < 50
      )
    ) {
      offset += 50;
      x = baseX + (offset % 200) - 100;
      y = baseY + Math.floor(offset / 200) * 60;
    }

    if (type === 'CUSTOM' && customDefinition) {
      addCustomGateInstance(customDefinition, { x, y });
    } else {
      addGate(type, { x, y });
    }
  };

  const handleToolTouchStart = (type: GateType, event: React.TouchEvent) => {
    event.preventDefault();
    startTouchDrag(type, event);
  };

  return (
    <>
      <div className={`mobile-toolbar ${isOpen ? 'open' : ''}`}>
        {/* スワイプハンドル */}
        <div className="swipe-handle" onClick={onToggle} />

        {/* カテゴリータブ */}
        <div className="tool-categories">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`category-chip ${selectedCategory === key ? 'active' : ''}`}
              onClick={() =>
                onCategoryChange(key as 'basic' | 'io' | 'special' | 'custom')
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* ツールグリッド */}
        <div className="tools-grid">
          {categories[selectedCategory]?.gates.map((tool: any) => (
            <button
              key={tool.customDefinition?.id || tool.type}
              className="tool-item"
              onClick={() => handleToolClick(tool.type, tool.customDefinition)}
              onTouchStart={e => handleToolTouchStart(tool.type, e)}
            >
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-name">{tool.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ドラッグプレビュー */}
      {isDragging && dragPreview && (
        <MobileDragPreview
          type={dragPreview.type}
          x={dragPreview.x}
          y={dragPreview.y}
        />
      )}
    </>
  );
};
