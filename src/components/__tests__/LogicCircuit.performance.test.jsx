import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * パフォーマンステスト
 * レンダリング性能、メモリ使用量、応答性などをテスト
 */
describe('論理回路プレイグラウンド - パフォーマンステスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
    // パフォーマンス測定のリセット
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('レンダリングパフォーマンス', () => {
    it('初期レンダリングが高速である', async () => {
      performance.mark('render-start');
      
      render(<StableLogicCircuit />);
      
      performance.mark('render-end');
      performance.measure('initial-render', 'render-start', 'render-end');
      
      const measure = performance.getEntriesByName('initial-render')[0];
      
      // 初期レンダリングは100ms以内
      expect(measure.duration).toBeLessThan(100);
    });

    it('多数のゲートでも適切なフレームレートを維持する', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 100個のゲートを追加
      performance.mark('gates-start');
      
      for (let i = 0; i < 100; i++) {
        const gateType = ['INPUT', 'AND', 'OR', 'NOT'][i % 4];
        await user.click(screen.getByRole('button', { name: new RegExp(gateType, 'i') }));
        
        fireEvent.click(canvas, {
          clientX: (i % 10) * 80 + 50,
          clientY: Math.floor(i / 10) * 60 + 50
        });
      }
      
      performance.mark('gates-end');
      performance.measure('gates-addition', 'gates-start', 'gates-end');
      
      const measure = performance.getEntriesByName('gates-addition')[0];
      
      // 平均して1ゲートあたり50ms以内
      expect(measure.duration / 100).toBeLessThan(50);
      
      // すべてのゲートが表示されていることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(100);
    });

    it('複雑な接続でもスムーズにレンダリングされる', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // グリッド状にゲートを配置
      const gridSize = 5;
      const gates = [];
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          await user.click(screen.getByRole('button', { name: /and/i }));
          fireEvent.click(canvas, {
            clientX: col * 150 + 100,
            clientY: row * 100 + 100
          });
          gates.push({ row, col });
        }
      }
      
      // 接続を作成（メッシュ状）
      performance.mark('connections-start');
      
      const terminals = canvas.querySelectorAll('circle');
      let connectionCount = 0;
      
      // 隣接するゲート間で接続
      for (let i = 0; i < gates.length; i++) {
        const { row, col } = gates[i];
        
        // 右隣に接続
        if (col < gridSize - 1) {
          const fromIndex = i * 2 + 1; // 出力端子
          const toIndex = (i + 1) * 2; // 入力端子
          
          if (terminals[fromIndex] && terminals[toIndex]) {
            fireEvent.mouseDown(terminals[fromIndex]);
            fireEvent.mouseUp(terminals[toIndex]);
            connectionCount++;
          }
        }
        
        // 下に接続
        if (row < gridSize - 1) {
          const fromIndex = i * 2 + 1; // 出力端子
          const toIndex = (i + gridSize) * 2; // 入力端子
          
          if (terminals[fromIndex] && terminals[toIndex]) {
            fireEvent.mouseDown(terminals[fromIndex]);
            fireEvent.mouseUp(terminals[toIndex]);
            connectionCount++;
          }
        }
      }
      
      performance.mark('connections-end');
      performance.measure('connections-creation', 'connections-start', 'connections-end');
      
      const measure = performance.getEntriesByName('connections-creation')[0];
      
      // 接続作成が適切な時間内に完了
      expect(measure.duration).toBeLessThan(5000);
      
      // 接続が作成されていることを確認
      const connections = canvas.querySelectorAll('line:not([stroke-dasharray])');
      expect(connections.length).toBeGreaterThan(0);
    });
  });

  describe('メモリ使用量', () => {
    it('ゲートの追加と削除でメモリリークが発生しない', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // メモリ使用量の初期値を記録（可能な場合）
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // 1000回の追加と削除を繰り返す
      for (let i = 0; i < 1000; i++) {
        // ゲートを追加
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, { clientX: 200, clientY: 200 });
        
        // ゲートを削除
        const gate = canvas.querySelector('rect');
        if (gate) {
          fireEvent.contextMenu(gate);
        }
      }
      
      // 最終的なゲート数が0であることを確認
      const finalGates = canvas.querySelectorAll('g > rect');
      expect(finalGates.length).toBe(0);
      
      // メモリ使用量が大幅に増加していないことを確認（可能な場合）
      if (performance.memory) {
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        // メモリ増加が10MB以内
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('大量の履歴でもメモリ使用量が制限される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      const undoButton = screen.getByRole('button', { name: /元に戻す/i });
      
      // 500個の操作を実行
      for (let i = 0; i < 500; i++) {
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: (i % 10) * 50 + 50,
          clientY: Math.floor(i / 10) * 50 + 50
        });
      }
      
      // Undoボタンが有効であることを確認
      expect(undoButton).not.toBeDisabled();
      
      // すべての操作を元に戻せることを確認（最初の数個）
      for (let i = 0; i < 10; i++) {
        await user.click(undoButton);
      }
      
      // まだUndoできることを確認
      expect(undoButton).not.toBeDisabled();
    });
  });

  describe('応答性', () => {
    it('ユーザー入力に対して即座に反応する', async () => {
      render(<StableLogicCircuit />);
      
      const inputButton = screen.getByRole('button', { name: /input/i });
      
      performance.mark('click-start');
      await user.click(inputButton);
      performance.mark('click-end');
      
      performance.measure('button-response', 'click-start', 'click-end');
      
      const measure = performance.getEntriesByName('button-response')[0];
      
      // クリック応答が50ms以内
      expect(measure.duration).toBeLessThan(50);
      
      // ボタンの状態が変更されたことを確認
      expect(inputButton.className).toContain('bg-blue-500');
    });

    it('ドラッグ操作がスムーズである', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // ゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 100 });
      
      const terminals = canvas.querySelectorAll('circle');
      
      if (terminals.length >= 2) {
        // ドラッグ開始
        fireEvent.mouseDown(terminals[0]);
        
        // 複数のマウス移動イベントを発生させる
        const moveEvents = [];
        for (let i = 0; i < 10; i++) {
          performance.mark(`move-${i}-start`);
          
          fireEvent.mouseMove(canvas, {
            clientX: 100 + i * 20,
            clientY: 100
          });
          
          performance.mark(`move-${i}-end`);
          performance.measure(`move-${i}`, `move-${i}-start`, `move-${i}-end`);
          
          moveEvents.push(performance.getEntriesByName(`move-${i}`)[0]);
        }
        
        // 各移動イベントが16ms以内（60fps）
        moveEvents.forEach(event => {
          expect(event.duration).toBeLessThan(16);
        });
        
        fireEvent.mouseUp(terminals[1]);
      }
    });
  });

  describe('最適化', () => {
    it('不要な再レンダリングが発生しない', async () => {
      const renderSpy = vi.fn();
      
      // カスタムコンポーネントでレンダリング回数を追跡
      const TrackedComponent = () => {
        renderSpy();
        return <StableLogicCircuit />;
      };
      
      render(<TrackedComponent />);
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // 無関係な操作
      await user.hover(document.body);
      await user.unhover(document.body);
      
      // レンダリング回数が増えていないことを確認
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });

    it('シミュレーションの計算が効率的である', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      // 複雑な回路を作成
      const gateCount = 50;
      for (let i = 0; i < gateCount; i++) {
        const gateType = i % 2 === 0 ? 'AND' : 'OR';
        await user.click(screen.getByRole('button', { name: new RegExp(gateType, 'i') }));
        fireEvent.click(canvas, {
          clientX: (i % 5) * 150 + 100,
          clientY: Math.floor(i / 5) * 80 + 100
        });
      }
      
      // 入力を変更してシミュレーションをトリガー
      performance.mark('simulation-start');
      
      const inputGates = Array.from(canvas.querySelectorAll('rect')).filter(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      
      if (inputGates.length > 0) {
        fireEvent.click(inputGates[0]);
      }
      
      performance.mark('simulation-end');
      performance.measure('simulation-time', 'simulation-start', 'simulation-end');
      
      const measure = performance.getEntriesByName('simulation-time')[0];
      
      // シミュレーションが100ms以内に完了
      expect(measure.duration).toBeLessThan(100);
    });
  });

  describe('バッチ処理', () => {
    it('複数の操作がバッチで処理される', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      performance.mark('batch-start');
      
      // 短時間に複数の操作を実行
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          user.click(screen.getByRole('button', { name: /input/i })).then(() =>
            fireEvent.click(canvas, {
              clientX: i * 50 + 50,
              clientY: 100
            })
          )
        );
      }
      
      await Promise.all(promises);
      
      performance.mark('batch-end');
      performance.measure('batch-processing', 'batch-start', 'batch-end');
      
      const measure = performance.getEntriesByName('batch-processing')[0];
      
      // バッチ処理により効率化されていることを確認
      // 個別処理の場合より短い時間で完了
      expect(measure.duration).toBeLessThan(500);
      
      // すべてのゲートが正しく追加されていることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(10);
    });
  });

  describe('スロットリングとデバウンス', () => {
    it('高頻度のイベントが適切にスロットリングされる', async () => {
      const { container } = render(<StableLogicCircuit />);
      const canvas = document.querySelector('svg');
      
      let eventCount = 0;
      const originalMouseMove = canvas.onmousemove;
      
      // マウス移動イベントをカウント
      canvas.onmousemove = (e) => {
        eventCount++;
        if (originalMouseMove) originalMouseMove(e);
      };
      
      // 高速でマウスを移動
      for (let i = 0; i < 100; i++) {
        fireEvent.mouseMove(canvas, {
          clientX: i * 5,
          clientY: 100
        });
      }
      
      // すべてのイベントが処理されていないことを確認
      // （スロットリングにより削減されている）
      expect(eventCount).toBeLessThan(100);
    });
  });
});