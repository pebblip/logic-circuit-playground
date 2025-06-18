import React, { memo, useMemo } from 'react';
import type { Wire, Gate } from '../types/circuit';
import { useCircuitStore } from '../stores/circuitStore';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '../domain/analysis/pinPositionCalculator';
import { handleError } from '@/infrastructure/errorHandler';
import { generateWirePath } from '@/utils/wirePathGenerator';

interface WireComponentProps {
  wire: Wire;
  gates?: Gate[]; // プレビューモード用にオプショナルに
}

const WireComponentImpl: React.FC<WireComponentProps> = ({
  wire,
  gates: propGates,
}) => {
  const storeGates = useCircuitStore(state => state.gates);
  const deleteWire = useCircuitStore(state => state.deleteWire);
  const wireStyle = useCircuitStore(state => state.wireStyle);

  // プロパティで渡されたゲートがあればそれを使用、なければstoreから取得
  const gates = propGates || storeGates;

  // ゲート検索結果をメモ化（パフォーマンス最適化）
  const gateData = useMemo(() => {
    const fromGate = gates.find(g => g.id === wire.from.gateId);
    const toGate = gates.find(g => g.id === wire.to.gateId);

    // ゲートが見つからない場合のエラーハンドリング
    if (!fromGate) {
      handleError(
        `Wire connection failed: From gate not found (${wire.from.gateId})`,
        'Wire Component',
        {
          userAction: 'ワイヤー表示',
          severity: 'medium',
          showToUser: false, // 自動復旧可能なためユーザーには表示しない
          logToConsole: true,
        }
      );
    }

    if (!toGate) {
      handleError(
        `Wire connection failed: To gate not found (${wire.to.gateId})`,
        'Wire Component',
        {
          userAction: 'ワイヤー表示',
          severity: 'medium',
          showToUser: false, // 自動復旧可能なためユーザーには表示しない
          logToConsole: true,
        }
      );
    }

    return { fromGate, toGate };
  }, [gates, wire.from.gateId, wire.to.gateId, wire.id]);

  // パス計算をメモ化（パフォーマンス最適化）
  const pathData = useMemo(() => {
    const { fromGate, toGate } = gateData;

    if (!fromGate || !toGate) return null;

    // ピン位置計算を統一化されたユーティリティから取得
    // wire.from.pinIndex は負の値（出力ピン）：-1 = 出力0、-2 = 出力1、...
    // wire.to.pinIndex は 0以上の入力ピン番号

    try {
      // 負のpinIndexから実際の出力ピンインデックスを計算
      const outputPinIndex = Math.abs(wire.from.pinIndex) - 1;
      const from = getOutputPinPosition(fromGate, outputPinIndex);
      const to = getInputPinPosition(toGate, wire.to.pinIndex);

      // ピン位置の妥当性チェック
      if (
        !from ||
        !to ||
        !isFinite(from.x) ||
        !isFinite(from.y) ||
        !isFinite(to.x) ||
        !isFinite(to.y)
      ) {
        handleError(
          `Invalid pin positions calculated for wire ${wire.id}`,
          'Wire Component',
          {
            userAction: 'ワイヤーパス計算',
            severity: 'medium',
            showToUser: false,
            logToConsole: true,
          }
        );
        return null;
      }

      // 選択されたスタイルでパスを生成
      const path = generateWirePath({
        from,
        to,
        style: wireStyle
      });

      return { path, from, to };
    } catch (error) {
      handleError(error, 'Wire Component', {
        userAction: 'ワイヤーパス計算',
        severity: 'medium',
        showToUser: false,
        logToConsole: true,
      });
      return null;
    }
  }, [gateData, wire.from.pinIndex, wire.to.pinIndex, wireStyle]);

  if (!pathData) return null;

  const { path } = pathData;

  // 右クリックハンドラー
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteWire(wire.id);
  };

  return (
    <g
      onContextMenu={handleContextMenu}
      data-wire-id={wire.id}
      data-testid={`wire-${wire.id}`}
    >
      <path
        d={path}
        className={`wire ${wire.isActive ? 'active' : ''}`}
        style={{ cursor: 'context-menu' }}
      />
      {/* 見えない太い線でクリック領域を拡大 */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ cursor: 'context-menu' }}
      />
      {wire.isActive && (
        <>
          <path
            id={`wire-path-${wire.id}`}
            d={path}
            style={{ display: 'none' }}
          />
          <circle className="signal-particle" r="6">
            <animateMotion dur="1.5s" repeatCount="indefinite">
              <mpath xlinkHref={`#wire-path-${wire.id}`} />
            </animateMotion>
          </circle>
        </>
      )}
    </g>
  );
};

// React.memo で最適化し、カスタム比較関数で不要な再レンダリングを防止
export const WireComponent = memo(WireComponentImpl, (prevProps, nextProps) => {
  // パフォーマンス重要プロパティのみを比較
  return (
    prevProps.wire.id === nextProps.wire.id &&
    prevProps.wire.from.gateId === nextProps.wire.from.gateId &&
    prevProps.wire.from.pinIndex === nextProps.wire.from.pinIndex &&
    prevProps.wire.to.gateId === nextProps.wire.to.gateId &&
    prevProps.wire.to.pinIndex === nextProps.wire.to.pinIndex &&
    prevProps.wire.isActive === nextProps.wire.isActive &&
    // ゲートリストの参照比較（プレビューモード用）
    prevProps.gates === nextProps.gates
  );
});
