import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CanvasControls } from '@/components/canvas/components/CanvasControls';
import { useCircuitStore } from '@/stores/circuitStore';

// Mock the store
vi.mock('@/stores/circuitStore', () => ({
  useCircuitStore: vi.fn(() => ({
    wireStyle: 'bezier',
    setWireStyle: vi.fn(),
  })),
}));

describe('CanvasControls', () => {
  const mockZoomIn = vi.fn();
  const mockZoomOut = vi.fn();
  const mockResetZoom = vi.fn();

  const defaultProps = {
    scale: 1,
    onZoomIn: mockZoomIn,
    onZoomOut: mockZoomOut,
    onResetZoom: mockResetZoom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ズームコントロール', () => {
    it('ズームインボタンがクリック可能である', () => {
      const { getByTestId } = render(<CanvasControls {...defaultProps} />);
      
      const zoomInButton = getByTestId('zoom-in-button');
      expect(zoomInButton).toBeDefined();
      
      fireEvent.click(zoomInButton);
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
    });

    it('ズームアウトボタンがクリック可能である', () => {
      const { getByTestId } = render(<CanvasControls {...defaultProps} />);
      
      const zoomOutButton = getByTestId('zoom-out-button');
      expect(zoomOutButton).toBeDefined();
      
      fireEvent.click(zoomOutButton);
      expect(mockZoomOut).toHaveBeenCalledTimes(1);
    });

    it('リセットボタンがクリック可能である', () => {
      const { getByTestId } = render(<CanvasControls {...defaultProps} />);
      
      const resetButton = getByTestId('zoom-reset-button');
      expect(resetButton).toBeDefined();
      
      fireEvent.click(resetButton);
      expect(mockResetZoom).toHaveBeenCalledTimes(1);
    });

    it('現在のズーム率が表示される', () => {
      const { getByTestId } = render(
        <CanvasControls {...defaultProps} scale={1.5} />
      );
      
      const resetButton = getByTestId('zoom-reset-button');
      expect(resetButton.textContent).toBe('150%');
    });

    it('ギャラリーモードでも動作する', () => {
      const { getByTestId } = render(
        <CanvasControls {...defaultProps} hideWireStyleButton={true} />
      );
      
      // ワイヤースタイルボタンが非表示
      const wireStyleButton = document.querySelector('.wire-style-button');
      expect(wireStyleButton).toBeNull();
      
      // ズームボタンは表示され、クリック可能
      const zoomInButton = getByTestId('zoom-in-button');
      fireEvent.click(zoomInButton);
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('配線スタイル切り替え', () => {
    it('配線スタイルボタンが表示される（非ギャラリーモード）', () => {
      const { container } = render(<CanvasControls {...defaultProps} />);
      
      const wireStyleButton = container.querySelector('.wire-style-button');
      expect(wireStyleButton).toBeDefined();
    });

    it('配線スタイルボタンが非表示（ギャラリーモード）', () => {
      const { container } = render(
        <CanvasControls {...defaultProps} hideWireStyleButton={true} />
      );
      
      const wireStyleButton = container.querySelector('.wire-style-button');
      expect(wireStyleButton).toBeNull();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      const { getByLabelText, getByTestId } = render(
        <CanvasControls {...defaultProps} scale={2} />
      );
      
      expect(getByLabelText('ズームイン')).toBeDefined();
      expect(getByLabelText('ズームアウト')).toBeDefined();
      expect(getByLabelText('ズーム率 200%')).toBeDefined();
    });

    it('適切なタイトル属性が設定されている', () => {
      const { getByTitle } = render(<CanvasControls {...defaultProps} />);
      
      expect(getByTitle('ズームイン（マウスホイール上）')).toBeDefined();
      expect(getByTitle('ズームアウト（マウスホイール下）')).toBeDefined();
      expect(getByTitle('ズームリセット（ダブルクリック）')).toBeDefined();
    });
  });
});