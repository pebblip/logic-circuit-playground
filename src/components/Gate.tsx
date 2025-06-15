import React, { memo } from 'react';
import type { Gate } from '@/types/circuit';
import { useIsMobile } from '@/hooks/useResponsive';
import { useGateDragAndDrop } from '@/hooks/useGateDragAndDrop';
import { useGateWireConnection } from '@/hooks/useGateWireConnection';
import { useGateEvents } from '@/hooks/useGateEvents';
import { BasicGateRenderer } from '@/components/gate-renderers/BasicGateRenderer';
import { IOGateRenderer } from '@/components/gate-renderers/IOGateRenderer';
import { SpecialGateRenderer } from '@/components/gate-renderers/SpecialGateRenderer';
import { CustomGateRenderer } from '@/components/gate-renderers/CustomGateRenderer';

interface GateComponentProps {
  gate: Gate;
  isHighlighted?: boolean;
}

const GateComponentImpl: React.FC<GateComponentProps> = ({
  gate,
  isHighlighted = false,
}) => {
  const isMobile = useIsMobile();
  const scaleFactor = isMobile ? 2 : 1;

  // カスタムフックを使用
  const {
    isDragging: _isDragging,
    handleMouseDown,
    handleTouchStart,
    hasDragged,
  } = useGateDragAndDrop(gate);
  const { handlePinClick } = useGateWireConnection(gate);
  const {
    isSelected,
    handleGateClick,
    handleInputClick,
    handleInputDoubleClick,
  } = useGateEvents(gate);

  // クリックハンドラーにドラッグ状態を渡す
  const wrappedHandleGateClick = (event: React.MouseEvent) => {
    handleGateClick(event, hasDragged);
  };

  const wrappedHandleInputClick = (event: React.MouseEvent) => {
    handleInputClick(event, hasDragged);
  };

  const wrappedHandleInputDoubleClick = (event: React.MouseEvent) => {
    handleInputDoubleClick(event, hasDragged);
  };

  // ゲートタイプに応じてレンダラーを選択
  const renderGate = () => {
    const baseProps = {
      gate,
      isSelected,
      handleMouseDown,
      handleTouchStart,
      handlePinClick,
    };

    // 基本ゲート (AND, OR, NOT, XOR, NAND, NOR)
    if (['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(gate.type)) {
      return (
        <BasicGateRenderer
          {...baseProps}
          handleGateClick={wrappedHandleGateClick}
        />
      );
    }

    // 入出力ゲート
    if (gate.type === 'INPUT' || gate.type === 'OUTPUT') {
      return (
        <IOGateRenderer
          {...baseProps}
          handleGateClick={wrappedHandleGateClick}
          handleInputClick={wrappedHandleInputClick}
          handleInputDoubleClick={wrappedHandleInputDoubleClick}
        />
      );
    }

    // 特殊ゲート
    if (['CLOCK', 'D-FF', 'SR-LATCH', 'MUX'].includes(gate.type)) {
      return (
        <SpecialGateRenderer
          {...baseProps}
          handleGateClick={wrappedHandleGateClick}
        />
      );
    }

    // カスタムゲート
    if (gate.type === 'CUSTOM') {
      return (
        <CustomGateRenderer
          {...baseProps}
          handleGateClick={wrappedHandleGateClick}
        />
      );
    }

    return null;
  };

  return (
    <g
      className={`gate-container ${isHighlighted ? 'highlighted' : ''}`}
      data-gate-id={gate.id}
      data-gate-type={gate.type}
      transform={`translate(${gate.position.x}, ${gate.position.y}) scale(${scaleFactor})`}
    >
      {renderGate()}
    </g>
  );
};

// React.memo で最適化し、カスタム比較関数で不要な再レンダリングを防止
export const GateComponent = memo(GateComponentImpl, (prevProps, nextProps) => {
  // パフォーマンス重要プロパティのみを比較
  return (
    prevProps.gate.id === nextProps.gate.id &&
    prevProps.gate.type === nextProps.gate.type &&
    prevProps.gate.position.x === nextProps.gate.position.x &&
    prevProps.gate.position.y === nextProps.gate.position.y &&
    prevProps.gate.output === nextProps.gate.output &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    // メタデータの変更（CLOCK頻度など）もチェック
    JSON.stringify(prevProps.gate.metadata) === JSON.stringify(nextProps.gate.metadata)
  );
});

// 既存のコンポーネントとの互換性のためのエクスポート
export default GateComponent;
