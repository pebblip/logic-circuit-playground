import React, { memo } from 'react';
import type { Gate } from '@/types/circuit';
import { useGateDragAndDrop } from '@/hooks/useGateDragAndDrop';
import { useGateWireConnection } from '@/hooks/useGateWireConnection';
import { useGateEvents } from '@/hooks/useGateEvents';
import { BasicGateRenderer } from '@/components/gate-renderers/BasicGateRenderer';
import { IOGateRenderer } from '@/components/gate-renderers/IOGateRenderer';
import { SpecialGateRenderer } from '@/components/gate-renderers/SpecialGateRenderer';
import { CustomGateRenderer } from '@/components/gate-renderers/CustomGateRenderer';
import { handleError } from '@/infrastructure/errorHandler';

// レンダラー選択の型定義
interface GateRendererProps {
  gate: Gate;
  isSelected: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handlePinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
  handleGateClick: (event: React.MouseEvent) => void;
  handleInputDoubleClick: (event: React.MouseEvent) => void;
  onInputClick?: (gateId: string) => void;
}

type RendererComponent = React.FC<GateRendererProps>;

// ゲートタイプ別レンダラーマップ（オブジェクト指向パターン）
const GATE_RENDERERS: Record<string, RendererComponent> = {
  // 基本ゲート
  AND: BasicGateRenderer,
  OR: BasicGateRenderer,
  NOT: BasicGateRenderer,
  XOR: BasicGateRenderer,
  NAND: BasicGateRenderer,
  NOR: BasicGateRenderer,

  // 入出力ゲート
  INPUT: IOGateRenderer,
  OUTPUT: IOGateRenderer,

  // 特殊ゲート
  CLOCK: SpecialGateRenderer,
  'D-FF': SpecialGateRenderer,
  'SR-LATCH': SpecialGateRenderer,
  MUX: SpecialGateRenderer,
  BINARY_COUNTER: SpecialGateRenderer,
  LED: SpecialGateRenderer,

  // カスタムゲート
  CUSTOM: CustomGateRenderer,
};

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
  // モバイルでのスケール倍率を1.5に削減（以前は2倍で大きすぎた）
  // Note: scaleFactor is currently unused but may be needed for future mobile optimization

  // カスタムフックを使用
  const { handleMouseDown, handleTouchStart, hasDragged } =
    useGateDragAndDrop(gate);
  const { handlePinClick } = useGateWireConnection(gate);
  const { isSelected, handleGateClick, handleInputDoubleClick } =
    useGateEvents(gate);

  // クリックハンドラーにドラッグ状態を渡す
  const wrappedHandleGateClick = (event: React.MouseEvent) => {
    handleGateClick(event, hasDragged);
  };

  const wrappedHandleInputDoubleClick = (event: React.MouseEvent) => {
    handleInputDoubleClick(event, hasDragged);
  };

  // ゲートレンダラー選択（純粋関数・オブジェクト指向パターン）
  const renderGate = (): React.ReactNode => {
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

      // レンダラーマップから選択（オブジェクト指向パターン）
      const RendererComponent = GATE_RENDERERS[gate.type];

      if (!RendererComponent) {
        // 未知のゲートタイプの場合
        setTimeout(() => {
          handleError(`Unknown gate type: ${gate.type}`, 'Gate Component', {
            userAction: 'ゲート描画',
            severity: 'medium',
            showToUser: true,
            logToConsole: true,
          });
        }, 0);

        // フォールバック: BasicGateRendererを使用
        const FallbackRenderer = BasicGateRenderer;
        const fallbackProps: GateRendererProps = {
          gate,
          isSelected,
          handleMouseDown,
          handleTouchStart,
          handlePinClick,
          handleGateClick: wrappedHandleGateClick,
          handleInputDoubleClick: wrappedHandleInputDoubleClick,
          onInputClick,
        };
        return <FallbackRenderer {...fallbackProps} />;
      }

      // 共通プロパティ（純粋関数パターン）
      const rendererProps: GateRendererProps = {
        gate,
        isSelected,
        handleMouseDown,
        handleTouchStart,
        handlePinClick,
        handleGateClick: wrappedHandleGateClick,
        handleInputDoubleClick: wrappedHandleInputDoubleClick,
        onInputClick,
      };

      return <RendererComponent {...rendererProps} />;
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
    prevProps.gate.outputs[0] === nextProps.gate.outputs[0] &&
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
