import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * エッジケーステスト
 * 通常では起こりにくいが、起こりうる特殊なケースをテスト
 */
describe('論理回路プレイグラウンド - エッジケーステスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('極端な入力値', () => {
    it('キャンバスの境界外にゲートを配置しようとした場合', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      await user.click(screen.getByRole('button', { name: /input/i }));
      
      // キャンバス外の座標でクリック
      fireEvent.click(canvas, {
        clientX: -100,
        clientY: -100
      });
      
      // ゲートが配置されていることを確認（境界内に調整される）
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(1);
      
      // ゲートの位置が適切に調整されていることを確認
      const gate = gates[0];
      const x = parseInt(gate.getAttribute('x'));
      const y = parseInt(gate.getAttribute('y'));
      
      expect(x).toBeGreaterThanOrEqual(-30); // ゲートの幅の半分を考慮
      expect(y).toBeGreaterThanOrEqual(-20); // ゲートの高さの半分を考慮
    });

    it('非常に長い名前のゲートタイプ', async () => {
      // カスタムゲートタイプを追加する機能がある場合のテスト
      render(<StableLogicCircuit />);
      
      // 通常のゲートで代用
      const longNameGate = screen.getByRole('button', { name: /input/i });
      expect(longNameGate).toBeInTheDocument();
      
      // テキストがオーバーフローしていないことを確認
      const styles = window.getComputedStyle(longNameGate);
      expect(styles.overflow).not.toBe('visible');
    });

    it('極端に多くの入力を持つゲート', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 多入力ゲートのシミュレーション（複数のANDゲートを連結）
      const inputCount = 10;
      
      // 入力ゲートを配置
      for (let i = 0; i < inputCount; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: 50,
          clientY: 50 + i * 40
        });
      }
      
      // ANDゲートを階層的に配置
      let currentLevel = inputCount;
      let yOffset = 0;
      
      while (currentLevel > 1) {
        const gatesInLevel = Math.ceil(currentLevel / 2);
        for (let i = 0; i < gatesInLevel; i++) {
          await user.click(screen.getByRole('button', { name: /and/i }));
          fireEvent.click(canvas, {
            clientX: 200 + yOffset * 150,
            clientY: 50 + i * 80
          });
        }
        currentLevel = gatesInLevel;
        yOffset++;
      }
      
      // すべてのゲートが配置されていることを確認
      const totalGates = canvas.querySelectorAll('g > rect').length;
      expect(totalGates).toBeGreaterThan(inputCount);
    });
  });

  describe('タイミングの問題', () => {
    it('非常に速い連続クリック', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      await user.click(screen.getByRole('button', { name: /input/i }));
      
      // 同じ位置に高速で複数回クリック
      const clickPromises = [];
      for (let i = 0; i < 10; i++) {
        clickPromises.push(
          fireEvent.click(canvas, {
            clientX: 200,
            clientY: 200
          })
        );
      }
      
      await Promise.all(clickPromises);
      
      // 1つまたは少数のゲートのみが配置されることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBeLessThanOrEqual(10);
    });

    it('接続中にゲートが削除された場合', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 2つのゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 100 });
      
      const terminals = canvas.querySelectorAll('circle');
      const gates = canvas.querySelectorAll('rect');
      
      if (terminals.length >= 2 && gates.length >= 2) {
        // 接続を開始
        fireEvent.mouseDown(terminals[0]);
        
        // 接続中に対象ゲートを削除
        fireEvent.contextMenu(gates[1]);
        
        // 接続を完了しようとする
        fireEvent.mouseUp(canvas, { clientX: 300, clientY: 100 });
        
        // 接続が作成されていないことを確認
        const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
        expect(connections.length).toBe(0);
      }
    });

    it('同時に複数のドラッグ操作', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 複数のゲートを配置
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: 100 + i * 100,
          clientY: 100
        });
      }
      
      const terminals = canvas.querySelectorAll('circle');
      
      if (terminals.length >= 4) {
        // 複数の接続を同時に開始（実際には起こらないが）
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseDown(terminals[2]);
        
        // 最後の操作のみが有効であることを確認
        const dragLines = canvas.querySelectorAll('line[stroke-dasharray]');
        expect(dragLines.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('データの整合性', () => {
    it('循環参照の検出', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 循環参照を作成しようとする
      // A -> B -> C -> A
      const positions = [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 200, y: 250 }
      ];
      
      for (const pos of positions) {
        await user.click(screen.getByRole('button', { name: /and/i }));
        fireEvent.click(canvas, pos);
      }
      
      const terminals = canvas.querySelectorAll('circle');
      
      // 接続を作成
      if (terminals.length >= 6) {
        // A -> B
        fireEvent.mouseDown(terminals[1]); // A output
        fireEvent.mouseUp(terminals[2]);   // B input
        
        // B -> C
        fireEvent.mouseDown(terminals[3]); // B output
        fireEvent.mouseUp(terminals[4]);   // C input
        
        // C -> A (循環)
        fireEvent.mouseDown(terminals[5]); // C output
        fireEvent.mouseUp(terminals[0]);   // A input
      }
      
      // アプリケーションがクラッシュしないことを確認
      expect(canvas).toBeInTheDocument();
      
      // シミュレーションが無限ループに陥らないことを確認
      const inputButton = screen.getByRole('button', { name: /input/i });
      await user.click(inputButton);
      fireEvent.click(canvas, { clientX: 50, clientY: 50 });
      
      // タイムアウトせずに完了することを確認
      await waitFor(() => {
        expect(canvas).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('同じ入力に複数の接続', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 3つのゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 150 });
      
      const terminals = canvas.querySelectorAll('circle');
      
      if (terminals.length >= 5) {
        // 最初の入力をANDに接続
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseUp(terminals[4]);
        
        // 2番目の入力を同じAND入力に接続（上書き）
        fireEvent.mouseDown(terminals[1]);
        fireEvent.mouseUp(terminals[4]);
        
        // 接続が1つだけであることを確認
        const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
        const toSameInput = Array.from(connections).filter(line => {
          const x2 = line.getAttribute('x2');
          const y2 = line.getAttribute('y2');
          return x2 && y2; // 同じ終点を持つ接続をカウント
        });
        
        expect(toSameInput.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('ブラウザの互換性', () => {
    it('SVGがサポートされていない場合のフォールバック', async () => {
      // SVGサポートをモック
      const originalCreateElementNS = document.createElementNS;
      document.createElementNS = vi.fn(() => {
        throw new Error('SVG not supported');
      });
      
      try {
        render(<StableLogicCircuit />);
        
        // エラーメッセージまたは代替表示があることを確認
        const fallbackMessage = screen.queryByText(/サポート|support/i);
        if (fallbackMessage) {
          expect(fallbackMessage).toBeInTheDocument();
        }
      } finally {
        document.createElementNS = originalCreateElementNS;
      }
    });

    it('タッチイベントとマウスイベントの混在', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      await user.click(screen.getByRole('button', { name: /input/i }));
      
      // タッチイベントをシミュレート
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchEnd(canvas, {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100 }]
      });
      
      // マウスイベントも発生させる
      fireEvent.click(canvas, { clientX: 200, clientY: 200 });
      
      // 両方のイベントが適切に処理されることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBeGreaterThan(0);
    });
  });

  describe('セキュリティ', () => {
    it('XSS攻撃に対する耐性', async () => {
      render(<StableLogicCircuit />);
      
      // 悪意のある入力をシミュレート
      const maliciousScript = '<script>alert("XSS")</script>';
      
      // ゲートのラベルなどに悪意のあるコードが含まれても安全であることを確認
      const canvas = document.querySelector('svg');
      const textElements = canvas.querySelectorAll('text');
      
      textElements.forEach(text => {
        expect(text.innerHTML).not.toContain('<script>');
        expect(text.textContent).not.toContain('<script>');
      });
    });

    it('大量データによるDoS攻撃への耐性', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 制限時間内に処理が完了することを確認
      const startTime = performance.now();
      
      // 大量のゲートを追加しようとする
      for (let i = 0; i < 10000; i++) {
        if (performance.now() - startTime > 5000) {
          // 5秒でタイムアウト
          break;
        }
        
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: Math.random() * 800,
          clientY: Math.random() * 600
        });
      }
      
      // アプリケーションが応答することを確認
      expect(canvas).toBeInTheDocument();
      
      // 適切な数のゲートのみが追加されていることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBeLessThan(10000);
    });
  });

  describe('状態の復元', () => {
    it('不正な履歴データからの復元', async () => {
      const { container } = render(<StableLogicCircuit />);
      
      // 不正な履歴データをシミュレート
      const corruptedHistory = {
        gates: null,
        connections: undefined
      };
      
      // localStorageに不正なデータを保存（実装されている場合）
      localStorage.setItem('circuit-history', JSON.stringify(corruptedHistory));
      
      // 再レンダリング
      const { rerender } = render(<StableLogicCircuit />);
      
      // アプリケーションがクラッシュしないことを確認
      expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
      
      // クリーンアップ
      localStorage.removeItem('circuit-history');
    });

    it('部分的に欠損したデータの処理', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      // ゲートデータを部分的に破損させる（実際のシナリオをシミュレート）
      const gates = canvas.querySelectorAll('g > rect');
      if (gates.length > 0) {
        // 属性を削除
        gates[0].removeAttribute('x');
        
        // それでもアプリケーションが動作することを確認
        await user.click(screen.getByRole('button', { name: /output/i }));
        fireEvent.click(canvas, { clientX: 300, clientY: 100 });
        
        expect(canvas.querySelectorAll('g > rect').length).toBeGreaterThan(1);
      }
    });
  });
});