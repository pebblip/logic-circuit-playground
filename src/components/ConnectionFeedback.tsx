import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import type { Position } from '../types/circuit';

// 接続フィードバックの種類
export type ConnectionFeedbackType = 
  | 'success'      // 接続成功
  | 'error'        // 接続失敗
  | 'invalid'      // 無効な接続対象
  | 'preview'      // 接続プレビュー
  | 'hover';       // ホバー状態

// フィードバック情報
export interface ConnectionFeedback {
  id: string;
  type: ConnectionFeedbackType;
  position: Position;
  message?: string;
  duration?: number; // ms
}

interface ConnectionFeedbackProps {
  feedback: ConnectionFeedback[];
  onFeedbackComplete?: (id: string) => void;
}

export const ConnectionFeedback: React.FC<ConnectionFeedbackProps> = ({
  feedback,
  onFeedbackComplete,
}) => {
  const [visibleFeedback, setVisibleFeedback] = useState<Set<string>>(new Set());

  useEffect(() => {
    feedback.forEach(fb => {
      if (fb.duration && !visibleFeedback.has(fb.id)) {
        setVisibleFeedback(prev => new Set(prev).add(fb.id));
        
        setTimeout(() => {
          setVisibleFeedback(prev => {
            const newSet = new Set(prev);
            newSet.delete(fb.id);
            return newSet;
          });
          onFeedbackComplete?.(fb.id);
        }, fb.duration);
      }
    });
  }, [feedback, visibleFeedback, onFeedbackComplete]);

  return (
    <g className="connection-feedback">
      {feedback.map(fb => {
        if (fb.duration && !visibleFeedback.has(fb.id)) return null;
        
        return (
          <g key={fb.id} className={`feedback feedback-${fb.type}`}>
            {fb.type === 'success' && (
              <SuccessFeedback position={fb.position} />
            )}
            {fb.type === 'error' && (
              <ErrorFeedback position={fb.position} message={fb.message} />
            )}
            {fb.type === 'invalid' && (
              <InvalidFeedback position={fb.position} />
            )}
            {fb.type === 'preview' && (
              <PreviewFeedback position={fb.position} />
            )}
            {fb.type === 'hover' && (
              <HoverFeedback position={fb.position} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// 成功フィードバック: 緑色のパルス
const SuccessFeedback: React.FC<{ position: Position }> = ({ position }) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    {/* パルスリング */}
    <circle
      r="0"
      fill="none"
      stroke="#00ff88"
      strokeWidth="3"
      opacity="0.8"
    >
      <animate
        attributeName="r"
        values="0;30;0"
        dur="0.6s"
        repeatCount="1"
      />
      <animate
        attributeName="opacity"
        values="0.8;0.2;0"
        dur="0.6s"
        repeatCount="1"
      />
    </circle>
    
    {/* チェックマーク */}
    <g className="success-check">
      <circle
        r="12"
        fill="#00ff88"
        opacity="0.9"
      />
      <path
        d="M -4 0 L 0 4 L 8 -4"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        values="0;1.2;1"
        dur="0.4s"
        repeatCount="1"
      />
    </g>
  </g>
);

// エラーフィードバック: 赤色のバツマーク
const ErrorFeedback: React.FC<{ position: Position; message?: string }> = ({ 
  position, 
  message 
}) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    {/* パルスリング */}
    <circle
      r="0"
      fill="none"
      stroke="#ff4757"
      strokeWidth="3"
      opacity="0.8"
    >
      <animate
        attributeName="r"
        values="0;30;0"
        dur="0.6s"
        repeatCount="1"
      />
      <animate
        attributeName="opacity"
        values="0.8;0.2;0"
        dur="0.6s"
        repeatCount="1"
      />
    </circle>
    
    {/* バツマーク */}
    <g className="error-cross">
      <circle
        r="12"
        fill="#ff4757"
        opacity="0.9"
      />
      <path
        d="M -4 -4 L 4 4 M 4 -4 L -4 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        values="0;1.2;1"
        dur="0.4s"
        repeatCount="1"
      />
    </g>
    
    {/* エラーメッセージ */}
    {message && (
      <g className="error-message" opacity="0">
        <rect
          x="-40"
          y="20"
          width="80"
          height="20"
          rx="4"
          fill="rgba(255, 71, 87, 0.9)"
        />
        <text
          x="0"
          y="32"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {message}
        </text>
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="2s"
          begin="0.2s"
          repeatCount="1"
        />
      </g>
    )}
  </g>
);

// 無効な接続対象の表示
const InvalidFeedback: React.FC<{ position: Position }> = ({ position }) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    <circle
      r="8"
      fill="none"
      stroke="#ff6b6b"
      strokeWidth="2"
      strokeDasharray="3,3"
      opacity="0.6"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0;360"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    
    <path
      d="M -3 -3 L 3 3 M 3 -3 L -3 3"
      stroke="#ff6b6b"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </g>
);

// プレビュー表示: 接続中のワイヤーのエンドポイント
const PreviewFeedback: React.FC<{ position: Position }> = ({ position }) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    <circle
      r="6"
      fill="#00aaff"
      opacity="0.8"
    >
      <animate
        attributeName="r"
        values="4;8;4"
        dur="1s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.8;0.4;0.8"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </g>
);

// ホバー表示: ピンにマウスを乗せた時
const HoverFeedback: React.FC<{ position: Position }> = ({ position }) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    <circle
      r="10"
      fill="none"
      stroke="#00ff88"
      strokeWidth="2"
      opacity="0.6"
    >
      <animate
        attributeName="r"
        values="8;12;8"
        dur="0.8s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.6;0.3;0.6"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  </g>
);

// 動的なワイヤープレビュー
interface WirePreviewProps {
  startPosition: Position;
  endPosition: Position;
  isValid: boolean;
}

export const WirePreview: React.FC<WirePreviewProps> = ({
  startPosition,
  endPosition,
  isValid,
}) => {
  const midX = (startPosition.x + endPosition.x) / 2;
  const path = `M ${startPosition.x} ${startPosition.y} Q ${midX} ${startPosition.y} ${midX} ${(startPosition.y + endPosition.y) / 2} T ${endPosition.x} ${endPosition.y}`;

  return (
    <g className="wire-preview">
      <path
        d={path}
        stroke={isValid ? '#00ff88' : '#ff4757'}
        strokeWidth="3"
        fill="none"
        strokeDasharray="5,5"
        opacity="0.7"
        style={{
          filter: isValid 
            ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))'
            : 'drop-shadow(0 0 8px rgba(255, 71, 87, 0.5))'
        }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-10"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
};

// フィードバック管理用のカスタムフック
export const useConnectionFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<ConnectionFeedback[]>([]);

  const addFeedback = (feedback: Omit<ConnectionFeedback, 'id'>) => {
    const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFeedback: ConnectionFeedback = {
      ...feedback,
      id,
      duration: feedback.duration ?? 1500, // デフォルト1.5秒
    };
    
    setFeedbackList(prev => [...prev, newFeedback]);
  };

  const removeFeedback = (id: string) => {
    setFeedbackList(prev => prev.filter(fb => fb.id !== id));
  };

  const clearFeedback = () => {
    setFeedbackList([]);
  };

  const showSuccess = (position: Position, message?: string) => {
    addFeedback({
      type: 'success',
      position,
      message,
      duration: 1000,
    });
  };

  const showError = (position: Position, message?: string) => {
    addFeedback({
      type: 'error',
      position,
      message,
      duration: 2000,
    });
  };

  const showPreview = (position: Position) => {
    addFeedback({
      type: 'preview',
      position,
      duration: 0, // 永続的（手動削除まで）
    });
  };

  return {
    feedbackList,
    addFeedback,
    removeFeedback,
    clearFeedback,
    showSuccess,
    showError,
    showPreview,
  };
};