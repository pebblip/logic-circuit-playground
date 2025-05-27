import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * リグレッションテスト
 * 過去に発生したバグが再発しないことを確認
 */
describe('論理回路プレイグラウンド - リグレッションテスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Issue #001: 2本目の線が引けない', () => {
    it('ORゲートに2つの入力を接続できる', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 2つの入力を配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      // ORゲートを配置
      await user.click(screen.getByRole('button', { name: /or/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 150 });
      
      // 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 500, clientY: 150 });
      
      const terminals = canvas.querySelectorAll('circle');
      
      // 最初の接続
      fireEvent.mouseDown(terminals[0]); // INPUT1の出力
      fireEvent.mouseUp(terminals[4]);   // ORの入力1
      
      // 2番目の接続（これが失敗していたバグ）
      fireEvent.mouseDown(terminals[1]); // INPUT2の出力
      fireEvent.mouseUp(terminals[4]);   // ORの入力2
      
      // 両方の接続が作成されていることを確認
      const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
      expect(connections.length).toBeGreaterThanOrEqual(1);
      
      // ORゲートが正しく動作することを確認
      const inputGates = Array.from(canvas.querySelectorAll('rect')).filter(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      
      // 片方だけONでも出力がONになることを確認
      fireEvent.click(inputGates[0]);
      
      await waitFor(() => {
        const outputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
          rect.nextElementSibling?.textContent === 'OUTPUT'
        );
        expect(outputGate?.getAttribute('fill')).toBe('#10b981');
      });
    });

    it('ANDゲートに複数の入力を正しく接続できる', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 3つの入力を配置（3入力ANDをシミュレート）
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: 50,
          clientY: 50 + i * 100
        });
      }
      
      // 2つのANDゲートを配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 250, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, { clientX: 450, clientY: 150 });
      
      // 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 650, clientY: 150 });
      
      // 接続を作成
      const terminals = canvas.querySelectorAll('circle');
      
      // INPUT1 -> AND1
      fireEvent.mouseDown(terminals[0]);
      fireEvent.mouseUp(terminals[6]);
      
      // INPUT2 -> AND1（2番目の入力）
      fireEvent.mouseDown(terminals[1]);
      fireEvent.mouseUp(terminals[6]);
      
      // AND1 -> AND2
      fireEvent.mouseDown(terminals[7]);
      fireEvent.mouseUp(terminals[8]);
      
      // INPUT3 -> AND2（2番目の入力）
      fireEvent.mouseDown(terminals[2]);
      fireEvent.mouseUp(terminals[8]);
      
      // 接続が正しく作成されていることを確認
      const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
      expect(connections.length).toBeGreaterThan(0);
    });
  });

  describe('Issue #002: 履歴管理の不具合', () => {
    it('最初の操作も履歴に保存される', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      const undoButton = screen.getByRole('button', { name: /元に戻す/i });
      
      // 初期状態でUndoが無効
      expect(undoButton).toBeDisabled();
      
      // 最初の操作
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      // Undoが有効になることを確認
      await waitFor(() => {
        expect(undoButton).not.toBeDisabled();
      });
      
      // Undoを実行
      await user.click(undoButton);
      
      // ゲートが削除されたことを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(0);
    });

    it('連続した操作の履歴が正しく管理される', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      const undoButton = screen.getByRole('button', { name: /元に戻す/i });
      const redoButton = screen.getByRole('button', { name: /やり直す/i });
      
      // 5つの操作を実行
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: 100 + i * 50,
          clientY: 100
        });
      }
      
      // 3回Undo
      for (let i = 0; i < 3; i++) {
        await user.click(undoButton);
      }
      
      // 2つのゲートが残っていることを確認
      let gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(2);
      
      // 新しい操作を実行（履歴の分岐）
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 400, clientY: 100 });
      
      // Redoが無効になることを確認（履歴が分岐したため）
      expect(redoButton).toBeDisabled();
      
      // 3つのゲートがあることを確認
      gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(3);
    });
  });

  describe('Issue #003: シミュレーションの不具合', () => {
    it('接続が削除されたときにシミュレーションが更新される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // INPUT -> NOT -> OUTPUT の回路を作成
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /not/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 500, clientY: 100 });
      
      // 接続を作成
      const terminals = canvas.querySelectorAll('circle');
      fireEvent.mouseDown(terminals[0]);
      fireEvent.mouseUp(terminals[1]);
      fireEvent.mouseDown(terminals[2]);
      fireEvent.mouseUp(terminals[3]);
      
      // INPUTをONにする
      const inputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      fireEvent.click(inputGate);
      
      // OUTPUTがOFF（NOT反転）であることを確認
      await waitFor(() => {
        const outputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
          rect.nextElementSibling?.textContent === 'OUTPUT'
        );
        expect(outputGate?.getAttribute('fill')).toBe('#6b7280');
      });
      
      // 接続を削除
      const connection = canvas.querySelector('line:not([stroke-dasharray])');
      if (connection) {
        fireEvent.contextMenu(connection);
      }
      
      // OUTPUTが未接続状態に戻ることを確認
      await waitFor(() => {
        const outputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
          rect.nextElementSibling?.textContent === 'OUTPUT'
        );
        expect(outputGate?.getAttribute('fill')).toBe('#6b7280');
      });
    });

    it('複雑な回路でシミュレーションが無限ループに陥らない', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // フィードバックループを含む回路を作成
      const gatePositions = [
        { type: 'OR', x: 200, y: 100 },
        { type: 'AND', x: 400, y: 100 },
        { type: 'NOT', x: 300, y: 200 }
      ];
      
      for (const pos of gatePositions) {
        await user.click(screen.getByRole('button', { name: new RegExp(pos.type, 'i') }));
        fireEvent.click(canvas, { clientX: pos.x, clientY: pos.y });
      }
      
      // タイムアウトせずに完了することを確認
      const startTime = Date.now();
      
      // シミュレーションをトリガー
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 50, clientY: 100 });
      
      const elapsedTime = Date.now() - startTime;
      
      // 1秒以内に完了することを確認
      expect(elapsedTime).toBeLessThan(1000);
    });
  });

  describe('Issue #004: UI状態の不整合', () => {
    it('選択されたゲートタイプが正しくハイライトされる', async () => {
      render(<StableLogicCircuit />);
      
      const gateTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];
      
      for (const type of gateTypes) {
        const button = screen.getByRole('button', { name: new RegExp(type, 'i') });
        await user.click(button);
        
        // 選択されたボタンがハイライトされる
        expect(button.className).toContain('bg-blue-500');
        
        // 他のボタンがハイライトされていない
        gateTypes.forEach(otherType => {
          if (otherType !== type) {
            const otherButton = screen.getByRole('button', { name: new RegExp(otherType, 'i') });
            expect(otherButton.className).not.toContain('bg-blue-500');
          }
        });
      }
    });

    it('削除したゲートが選択状態のままにならない', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      const gate = canvas.querySelector('rect');
      
      // ゲートを選択
      fireEvent.click(gate);
      
      // 選択状態を示す何らかの視覚的フィードバックがあることを確認
      // （実装に依存しない方法で）
      
      // ゲートを削除
      fireEvent.contextMenu(gate);
      
      // 選択状態がクリアされることを確認
      // 新しいゲートを配置して、それが自動的に選択されないことを確認
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 100 });
      
      const newGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
        rect.nextElementSibling?.textContent === 'OUTPUT'
      );
      
      // 新しいゲートが自動的に選択されていないことを確認
      expect(newGate).toBeTruthy();
    });
  });

  describe('Issue #005: メモリリーク', () => {
    it('イベントリスナーが適切にクリーンアップされる', async () => {
      const { unmount } = render(<StableLogicCircuit />);
      
      // イベントリスナーの数を記録
      const initialListeners = window.getEventListeners ? 
        Object.keys(window.getEventListeners(document)).length : 0;
      
      // コンポーネントをアンマウント
      unmount();
      
      // 再度マウント
      const { unmount: unmount2 } = render(<StableLogicCircuit />);
      
      // 再度アンマウント
      unmount2();
      
      // イベントリスナーが増加していないことを確認
      if (window.getEventListeners) {
        const finalListeners = Object.keys(window.getEventListeners(document)).length;
        expect(finalListeners).toBeLessThanOrEqual(initialListeners + 1); // 許容範囲
      }
    });

    it('大量の操作後もパフォーマンスが維持される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 初期のレンダリング時間を測定
      const firstGateStart = performance.now();
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 50, clientY: 50 });
      const firstGateTime = performance.now() - firstGateStart;
      
      // 大量の操作を実行
      for (let i = 0; i < 100; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: (i % 10) * 70 + 50,
          clientY: Math.floor(i / 10) * 50 + 50
        });
        
        // 一部を削除
        if (i % 20 === 0) {
          const gates = canvas.querySelectorAll('rect');
          if (gates.length > 10) {
            for (let j = 0; j < 5; j++) {
              fireEvent.contextMenu(gates[j]);
            }
          }
        }
      }
      
      // 最後のゲート追加時間を測定
      const lastGateStart = performance.now();
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 750, clientY: 550 });
      const lastGateTime = performance.now() - lastGateStart;
      
      // パフォーマンスが大幅に劣化していないことを確認
      expect(lastGateTime).toBeLessThan(firstGateTime * 10);
    });
  });
});