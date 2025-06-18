import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GalleryPanel } from '../../../src/features/gallery/ui/GalleryPanel';
import { useCircuitStore } from '../../../src/stores/circuitStore';

// CircuitStoreをモック
vi.mock('../../../src/stores/circuitStore', () => ({
  useCircuitStore: vi.fn(),
}));

const mockSetState = vi.fn();
const mockSetAppMode = vi.fn();
const mockClearAll = vi.fn();

const mockCircuitStore = {
  clearAll: mockClearAll,
  setAppMode: mockSetAppMode,
  getState: vi.fn(() => ({
    setAppMode: mockSetAppMode,
  })),
};

// useCircuitStore.setStateをモック
(useCircuitStore as any).setState = mockSetState;

describe('GalleryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCircuitStore as any).mockReturnValue(mockCircuitStore);
    // getStateも同じオブジェクトを返すように設定
    (useCircuitStore as any).getState = mockCircuitStore.getState;
  });

  describe('基本表示', () => {
    it('ギャラリーパネルが表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      expect(screen.getByText('📚 回路ギャラリー')).toBeInTheDocument();
      expect(screen.getByText('様々な回路でデジタルロジックを学習しよう')).toBeInTheDocument();
    });

    it('非表示時は何も描画しない', () => {
      const { container } = render(<GalleryPanel isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('カテゴリ表示', () => {
    it('循環回路カテゴリが表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      expect(screen.getByRole('heading', { name: '🔄 循環回路' })).toBeInTheDocument();
      expect(screen.getByText('フィードバックループを持つ高度な回路')).toBeInTheDocument();
    });

    it('高度回路カテゴリが表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      expect(screen.getByRole('heading', { name: '⚡ 高度回路' })).toBeInTheDocument();
      expect(screen.getByText('実用的なデジタルシステムの回路')).toBeInTheDocument();
    });

    it('基本回路カテゴリが表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      expect(screen.getByRole('heading', { name: '🔧 基本回路' })).toBeInTheDocument();
      expect(screen.getByText('デジタル回路の基礎となる回路')).toBeInTheDocument();
    });
  });

  describe('回路一覧', () => {
    it('循環回路が表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      // 追加した循環回路が表示されることを確認
      expect(screen.getByText('🌀 カオス発生器（LFSR）')).toBeInTheDocument();
      expect(screen.getByText('🌸 フィボナッチカウンター')).toBeInTheDocument();
      expect(screen.getByText('💫 ジョンソンカウンター')).toBeInTheDocument();
      expect(screen.getByText('🌀 セルフオシレーティングメモリ')).toBeInTheDocument();
      expect(screen.getByText('🌸 マンダラ回路')).toBeInTheDocument();
    });

    it('各回路にロードボタンが表示される', () => {
      render(<GalleryPanel isVisible={true} />);
      
      const loadButtons = screen.getAllByText(/キャンバスで開く/);
      expect(loadButtons.length).toBeGreaterThan(0);
    });
  });

  describe('回路読み込み機能', () => {
    it('回路をクリックするとclearAllが呼ばれる', async () => {
      render(<GalleryPanel isVisible={true} />);
      
      const firstLoadButton = screen.getAllByText(/キャンバスで開く/)[0];
      fireEvent.click(firstLoadButton);
      
      expect(mockClearAll).toHaveBeenCalledTimes(1);
    });

    it('回路をクリックするとsetStateが適切に呼ばれる', async () => {
      render(<GalleryPanel isVisible={true} />);
      
      const firstLoadButton = screen.getAllByText(/キャンバスで開く/)[0];
      fireEvent.click(firstLoadButton);
      
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          gates: expect.any(Array),
          wires: expect.any(Array),
          selectedGateId: null,
          isDrawingWire: false,
          wireStart: null,
        })
      );
    });
  });

  describe('編集モード', () => {
    it('回路選択後に編集ボタンが表示される', async () => {
      render(<GalleryPanel isVisible={true} />);
      
      const firstLoadButton = screen.getAllByText(/キャンバスで開く/)[0];
      fireEvent.click(firstLoadButton);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ 編集モードで開く')).toBeInTheDocument();
      });
    });

    it('編集ボタンクリックでフリーモードに切り替わる', async () => {
      render(<GalleryPanel isVisible={true} />);
      
      const firstLoadButton = screen.getAllByText(/キャンバスで開く/)[0];
      fireEvent.click(firstLoadButton);
      
      await waitFor(() => {
        const editButton = screen.getByText('✏️ 編集モードで開く');
        fireEvent.click(editButton);
        
        // clearAllが呼ばれることを確認
        expect(mockClearAll).toHaveBeenCalledTimes(2); // 回路読み込み時 + 編集時
        
        // setStateが再度呼ばれることを確認（編集モード用）
        expect(mockSetState).toHaveBeenCalledTimes(2);
        
        // フリーモードに切り替わることを確認
        expect(mockSetAppMode).toHaveBeenCalledWith('フリーモード');
      });
    });

    it('戻るボタンでギャラリー一覧に戻る', async () => {
      render(<GalleryPanel isVisible={true} />);
      
      const firstLoadButton = screen.getAllByText(/キャンバスで開く/)[0];
      fireEvent.click(firstLoadButton);
      
      await waitFor(() => {
        const backButton = screen.getByText('← ギャラリーに戻る');
        fireEvent.click(backButton);
        
        expect(screen.getByText('📚 回路ギャラリー')).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なheading階層が設定されている', () => {
      render(<GalleryPanel isVisible={true} />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('📚 回路ギャラリー');
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('ボタンに適切なテキストが設定されている', () => {
      render(<GalleryPanel isVisible={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy();
      });
    });
  });
});