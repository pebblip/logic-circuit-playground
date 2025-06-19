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
import { handleError } from '@/infrastructure/errorHandler';

interface GateComponentProps {
  gate: Gate;
  isHighlighted?: boolean;
  onInputClick?: (gateId: string) => void;
}

const GateComponentImpl: React.FC<GateComponentProps> = ({
  gate,
  isHighlighted = false,
  onInputClick,
}) => {
  const isMobile = useIsMobile();
  // モバイルでのスケール倍率を1.5に削減（以前は2倍で大きすぎた）
  const scaleFactor = isMobile ? 1.5 : 1;

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
    try {
      // ゲートタイプの基本的な妥当性チェック
      if (!gate.type) {
        handleError(
          `Gate type is undefined or null for gate ${gate.id}`,
          'Gate Component',
          {
            userAction: 'ゲート描画',
            severity: 'high',
            showToUser: true,
            logToConsole: true,
          }
        );
        return null;
      }

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
            onInputClick={onInputClick}
          />
        );
      }

      // 特殊ゲート
      if (['CLOCK', 'D-FF', 'SR-LATCH', 'MUX', 'BINARY_COUNTER'].includes(gate.type)) {
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

      // 未知のゲートタイプの場合
      handleError(`Unknown gate type: ${gate.type}`, 'Gate Component', {
        userAction: 'ゲート描画',
        severity: 'medium',
        showToUser: true,
        logToConsole: true,
      });

      // フォールバック: 基本的なゲートレンダラーを使用
      return (
        <BasicGateRenderer
          {...baseProps}
          handleGateClick={wrappedHandleGateClick}
        />
      );
    } catch (error) {
      // レンダリング中の予期しないエラー
      handleError(error, 'Gate Component', {
        userAction: 'ゲート描画',
        severity: 'high',
        showToUser: true,
        logToConsole: true,
      });

      // 最低限のフォールバック表示
      return (
        <g>
          <rect
            x={gate.position.x - 30}
            y={gate.position.y - 15}
            width={60}
            height={30}
            fill="#ff9999"
            stroke="#ff0000"
            strokeWidth={2}
          />
          <text
            x={gate.position.x}
            y={gate.position.y + 4}
            textAnchor="middle"
            fontSize="10"
            fill="white"
          >
            ERROR
          </text>
        </g>
      );
    }
  };

  return (
    <g
      className={`gate-container ${isHighlighted ? 'highlighted' : ''}`}
      data-gate-id={gate.id}
      data-gate-type={gate.type}
      data-testid={`gate-${gate.id}`}
      transform={`translate(${gate.position.x}, ${gate.position.y})`}
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
    // 入力状態の変更もチェック（ピン状態の同期のため）
    JSON.stringify(prevProps.gate.inputs) ===
      JSON.stringify(nextProps.gate.inputs) &&
    // メタデータの変更（CLOCK頻度など）もチェック
    JSON.stringify(prevProps.gate.metadata) ===
      JSON.stringify(nextProps.gate.metadata)
  );
});

// 既存のコンポーネントとの互換性のためのエクスポート
export default GateComponent;
