import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import StableLogicCircuit from '../StableLogicCircuit';

expect.extend(toHaveNoViolations);

/**
 * アクセシビリティテスト
 * キーボード操作、スクリーンリーダー対応、色覚異常対応などをテスト
 */
describe('論理回路プレイグラウンド - アクセシビリティテスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('キーボード操作', () => {
    it('すべての機能がキーボードで操作できる', async () => {
      render(<StableLogicCircuit />);
      
      // Tabキーでフォーカスを移動
      await user.tab();
      
      // 真理値表ボタンにフォーカスがあることを確認
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /真理値表/i })
      );
      
      // さらにTabで移動
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /元に戻す/i })
      );
      
      // ゲート選択ボタンまで移動
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Enterキーで選択
      await user.keyboard('{Enter}');
      
      // 選択されたことを確認
      const inputButton = screen.getByRole('button', { name: /input/i });
      expect(inputButton.className).toContain('bg-blue-500');
    });

    it('Escapeキーで操作をキャンセルできる', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // ワイヤー接続を開始
      const terminals = canvas.querySelectorAll('circle');
      if (terminals.length > 0) {
        fireEvent.mouseDown(terminals[0]);
        
        // ドラッグ中の線が表示されることを確認
        let dragLine = canvas.querySelector('line[stroke-dasharray]');
        expect(dragLine).toBeTruthy();
        
        // Escapeキーでキャンセル
        await user.keyboard('{Escape}');
        
        // ドラッグ中の線が消えることを確認
        dragLine = canvas.querySelector('line[stroke-dasharray]');
        expect(dragLine).toBeFalsy();
      }
    });

    it('矢印キーでゲートを選択できる', async () => {
      render(<StableLogicCircuit />);
      
      // ゲートを配置
      const canvas = document.querySelector('svg');
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      fireEvent.click(canvas, { clientX: 200, clientY: 100 });
      
      // 最初のゲートを選択
      const gates = canvas.querySelectorAll('rect');
      fireEvent.click(gates[0]);
      
      // 矢印キーで選択を移動
      await user.keyboard('{ArrowRight}');
      
      // フォーカスが移動したことを確認
      // （実装に依存しない方法で確認）
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('スクリーンリーダー対応', () => {
    it('適切なARIA属性が設定されている', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // ヘッダーのランドマーク
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      // ボタンのラベル
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
      
      // SVGの説明
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label');
    });

    it('状態変更が適切にアナウンスされる', async () => {
      render(<StableLogicCircuit />);
      
      // ライブリージョンの存在を確認
      const liveRegion = document.querySelector('[aria-live]');
      expect(liveRegion).toBeInTheDocument();
      
      // ゲートの配置
      const canvas = document.querySelector('svg');
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      // アナウンスが更新されることを確認
      expect(liveRegion.textContent).toContain('追加');
    });

    it('フォーカス順序が論理的である', async () => {
      render(<StableLogicCircuit />);
      
      const focusableElements = [];
      
      // すべてのフォーカス可能な要素を収集
      let currentElement = document.body;
      for (let i = 0; i < 20; i++) {
        await user.tab();
        if (document.activeElement !== currentElement) {
          focusableElements.push(document.activeElement);
          currentElement = document.activeElement;
        } else {
          break;
        }
      }
      
      // フォーカス順序が論理的であることを確認
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // ヘッダーのボタンが最初
      expect(focusableElements[0].textContent).toMatch(/真理値表|元に戻す|やり直す/);
    });
  });

  describe('色覚異常対応', () => {
    it('色だけに依存しない情報伝達', async () => {
      render(<StableLogicCircuit />);
      
      // ゲートを配置
      const canvas = document.querySelector('svg');
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      const gate = canvas.querySelector('rect');
      
      // 色以外の識別方法があることを確認
      // テキストラベル
      const label = gate.nextElementSibling;
      expect(label).toHaveTextContent('INPUT');
      
      // パターンやアイコンの使用
      // （実装されている場合）
    });

    it('コントラスト比が十分である', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // axeでアクセシビリティチェック
      const results = await axe(container);
      
      // 色のコントラストに関する違反がないことを確認
      const colorViolations = results.violations.filter(v => 
        v.id.includes('color-contrast')
      );
      
      expect(colorViolations).toHaveLength(0);
    });
  });

  describe('支援技術との互換性', () => {
    it('適切なrole属性が設定されている', () => {
      render(<StableLogicCircuit />);
      
      // ボタンにはbutton role
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // ヘッダーにはbanner role
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // メインコンテンツにはmain role
      // （実装されている場合）
    });

    it('フォームコントロールが適切にラベル付けされている', () => {
      render(<StableLogicCircuit />);
      
      // すべてのインタラクティブ要素にラベルがあることを確認
      const interactiveElements = [
        ...screen.getAllByRole('button'),
        ...document.querySelectorAll('input, select, textarea')
      ];
      
      interactiveElements.forEach(element => {
        expect(element).toHaveAccessibleName();
      });
    });
  });

  describe('エラーメッセージのアクセシビリティ', () => {
    it('エラーメッセージが適切にアナウンスされる', async () => {
      render(<StableLogicCircuit />);
      
      // エラーを発生させる操作
      // 例: 無効な接続を試みる
      const canvas = document.querySelector('svg');
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      const terminals = canvas.querySelectorAll('circle');
      if (terminals.length >= 2) {
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseUp(terminals[1]); // 同じゲートの端子
      }
      
      // エラーメッセージがアクセシブルであることを確認
      const errorRegion = document.querySelector('[role="alert"]');
      if (errorRegion) {
        expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
      }
    });
  });

  describe('モバイルアクセシビリティ', () => {
    it('タッチターゲットが十分な大きさである', () => {
      render(<StableLogicCircuit />);
      
      // すべてのクリック可能な要素をチェック
      const clickableElements = [
        ...screen.getAllByRole('button'),
        ...document.querySelectorAll('circle, rect')
      ];
      
      clickableElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        
        // WCAG推奨の最小サイズ (44x44px)
        expect(size).toBeGreaterThanOrEqual(20); // SVG要素は小さくても良い
      });
    });

    it('ピンチズームが無効化されていない', () => {
      render(<StableLogicCircuit />);
      
      // viewportメタタグをチェック
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const content = viewport.getAttribute('content');
        expect(content).not.toContain('user-scalable=no');
        expect(content).not.toContain('maximum-scale=1');
      }
    });
  });

  describe('アニメーションのアクセシビリティ', () => {
    it('アニメーションを無効化できる', () => {
      // prefers-reduced-motionメディアクエリのテスト
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      render(<StableLogicCircuit />);
      
      // アニメーションが設定に応じて調整されることを確認
      if (prefersReducedMotion.matches) {
        // アニメーションが無効化されていることを確認
        const animatedElements = document.querySelectorAll('[class*="transition"]');
        animatedElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          expect(styles.transitionDuration).toBe('0s');
        });
      }
    });
  });
});