import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ModernLogicCircuit from '../ModernLogicCircuit';

describe('ModernLogicCircuit', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });
  
  describe('デザインシステムの適用', () => {
    it('正しいカラーテーマが適用される', () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // ヘッダーの存在確認
      expect(screen.getByText('Logic Circuit Playground')).toBeInTheDocument();
      
      // ヘルプボタンの存在確認
      expect(screen.getByText('ヘルプ (?)')).toBeInTheDocument();
      
      // 背景色の確認（グレイッシュな背景）
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveStyle({ backgroundColor: '#fafafa' });
    });
    
    it('ツールバーが正しく表示される', () => {
      render(<ModernLogicCircuit />);
      
      // 各ゲートボタンの存在確認
      expect(screen.getByTitle('入力 (I)')).toBeInTheDocument();
      expect(screen.getByTitle('出力 (O)')).toBeInTheDocument();
      expect(screen.getByTitle('ANDゲート (A)')).toBeInTheDocument();
      expect(screen.getByTitle('ORゲート (R)')).toBeInTheDocument();
      expect(screen.getByTitle('NOTゲート (N)')).toBeInTheDocument();
      
      // クリアボタンの存在確認
      expect(screen.getByText('クリア')).toBeInTheDocument();
    });
  });
  
  describe('ゲートの配置機能', () => {
    it('ツールバーからゲートを配置できる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // INPUTゲートを配置
      const inputButton = screen.getByTitle('入力 (I)');
      await user.click(inputButton);
      
      // ゲートが配置されたことを確認
      const gates = container.querySelectorAll('text');
      const inputGate = Array.from(gates).find(g => g.textContent === 'IN');
      expect(inputGate).toBeInTheDocument();
    });
    
    it('キーボードショートカットでゲートを配置できる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // 'A'キーでANDゲートを配置
      await user.keyboard('A');
      
      // ANDゲートが配置されたことを確認
      const gates = container.querySelectorAll('text');
      const andGate = Array.from(gates).find(g => g.textContent === '&');
      expect(andGate).toBeInTheDocument();
    });
    
    it('複数のゲートが重ならないように配置される', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // 複数のゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      await user.click(screen.getByTitle('入力 (I)'));
      await user.click(screen.getByTitle('入力 (I)'));
      
      // 各ゲートの位置を取得
      const rects = container.querySelectorAll('.gate-rect'); // ゲート本体のrect
      const positions = Array.from(rects).map(rect => ({
        x: parseFloat(rect.getAttribute('x')),
        y: parseFloat(rect.getAttribute('y'))
      }));
      
      // ゲートが重なっていないことを確認
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const distance = Math.sqrt(
            Math.pow(positions[i].x - positions[j].x, 2) + 
            Math.pow(positions[i].y - positions[j].y, 2)
          );
          expect(distance).toBeGreaterThan(50); // 最小距離を確保
        }
      }
    });
  });
  
  describe('インタラクション', () => {
    it('ゲートをホバーするとビジュアルフィードバックが表示される', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // ゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      
      // ゲートにホバー
      const gateRect = container.querySelector('.gate-rect');
      expect(gateRect).toBeInTheDocument();
      fireEvent.mouseEnter(gateRect);
      
      // ホバー効果（スケール）が適用されることを確認
      expect(gateRect).toHaveStyle({ transform: 'scale(1.05)' });
      
      // ゲート名が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('入力')).toBeInTheDocument();
      });
    });
    
    it('入力ゲートをクリックすると値が切り替わる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // 入力ゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      
      // ゲートの初期色を確認（非アクティブ = グレー）
      const gateRect = container.querySelector('.gate-rect');
      expect(gateRect).toBeInTheDocument();
      expect(gateRect).toHaveAttribute('fill', '#9ca3af');
      
      // ゲートをクリック
      await user.click(gateRect);
      
      // 色が変わったことを確認（アクティブ = 緑）
      expect(gateRect).toHaveAttribute('fill', '#22c55e');
    });
    
    it('右クリックでゲートを削除できる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // ゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      
      // ゲートが存在することを確認
      let gates = container.querySelectorAll('text');
      let inputGate = Array.from(gates).find(g => g.textContent === 'IN');
      expect(inputGate).toBeInTheDocument();
      
      // 右クリックで削除
      const gateRect = container.querySelector('.gate-rect');
      expect(gateRect).toBeInTheDocument();
      fireEvent.contextMenu(gateRect);
      
      // ゲートが削除されたことを確認
      gates = container.querySelectorAll('text');
      inputGate = Array.from(gates).find(g => g.textContent === 'IN');
      expect(inputGate).toBeUndefined();
    });
  });
  
  describe('ヘルプ機能', () => {
    it('ヘルプボタンでヘルプパネルを表示できる', async () => {
      render(<ModernLogicCircuit />);
      
      // 初期状態ではヘルプパネルは非表示
      expect(screen.queryByText('ショートカット')).not.toBeInTheDocument();
      
      // ヘルプボタンをクリック
      await user.click(screen.getByText('ヘルプ (?)'));
      
      // ヘルプパネルが表示される
      expect(screen.getByText('ショートカット')).toBeInTheDocument();
      expect(screen.getByText('• 左クリック: ゲートを選択・移動')).toBeInTheDocument();
    });
    
    it('?キーでヘルプパネルをトグルできる', async () => {
      render(<ModernLogicCircuit />);
      
      // ?キーを押す
      await user.keyboard('?');
      
      // ヘルプパネルが表示される
      expect(screen.getByText('ショートカット')).toBeInTheDocument();
      
      // もう一度?キーを押す
      await user.keyboard('?');
      
      // ヘルプパネルが非表示になる
      expect(screen.queryByText('ショートカット')).not.toBeInTheDocument();
    });
  });
  
  describe('クリア機能', () => {
    it('クリアボタンで全てのゲートと接続を削除できる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // 複数のゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      await user.click(screen.getByTitle('出力 (O)'));
      await user.click(screen.getByTitle('ANDゲート (A)'));
      
      // ゲートが存在することを確認
      let gates = container.querySelectorAll('text');
      const gateTexts = Array.from(gates).filter(g => 
        ['IN', 'OUT', '&'].includes(g.textContent)
      );
      expect(gateTexts).toHaveLength(3);
      
      // クリアボタンをクリック
      await user.click(screen.getByText('クリア'));
      
      // 全てのゲートが削除されたことを確認
      gates = container.querySelectorAll('text');
      const remainingGates = Array.from(gates).filter(g => 
        ['IN', 'OUT', '&'].includes(g.textContent)
      );
      expect(remainingGates).toHaveLength(0);
    });
  });
  
  describe('ドラッグ機能', () => {
    it('ゲートをドラッグして移動できる', async () => {
      const { container } = render(<ModernLogicCircuit />);
      
      // ゲートを配置
      await user.click(screen.getByTitle('入力 (I)'));
      
      // ゲートの初期位置を取得
      const gateRect = container.querySelector('.gate-rect');
      expect(gateRect).toBeInTheDocument();
      const initialX = parseFloat(gateRect.getAttribute('x'));
      const initialY = parseFloat(gateRect.getAttribute('y'));
      
      // ドラッグ操作をシミュレート
      fireEvent.mouseDown(gateRect, { button: 0 });
      fireEvent.mouseMove(container.querySelector('svg'), { 
        clientX: initialX + 100, 
        clientY: initialY + 50 
      });
      fireEvent.mouseUp(container.querySelector('svg'));
      
      // 位置が変更されたことを確認
      const newX = parseFloat(gateRect.getAttribute('x'));
      const newY = parseFloat(gateRect.getAttribute('y'));
      
      expect(newX).not.toBe(initialX);
      expect(newY).not.toBe(initialY);
    });
  });
  
  describe('最近使用したツール', () => {
    it('使用したゲートが最近使用したツールの先頭に移動する', async () => {
      render(<ModernLogicCircuit />);
      
      // 初期状態のツールバーの順序を確認
      const toolbar = screen.getByTitle('入力 (I)').parentElement;
      const buttons = toolbar.querySelectorAll('button[title]');
      expect(buttons[0]).toHaveAttribute('title', '入力 (I)');
      
      // NOTゲートを使用
      await user.click(screen.getByTitle('NOTゲート (N)'));
      
      // NOTゲートが先頭に移動したことを確認
      const updatedButtons = toolbar.querySelectorAll('button[title]');
      expect(updatedButtons[0]).toHaveAttribute('title', 'NOTゲート (N)');
    });
  });
});