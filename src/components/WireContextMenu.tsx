import React, { useEffect, useRef } from 'react';
import './WireContextMenu.css';

interface WireContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

export const WireContextMenu: React.FC<WireContextMenuProps> = ({
  x,
  y,
  onDelete,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="wire-context-menu"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <button
        className="wire-context-menu-item"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <span className="wire-context-menu-icon">🗑️</span>
        <span>接続線を削除</span>
      </button>
    </div>
  );
};
