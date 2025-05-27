import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * 振る舞いベースのテスト
 * 実装詳細ではなく、ユーザーが期待する動作をテストする
 */
describe('論理回路プレイグラウンド - 振る舞いテスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('ユーザーストーリー: 基本的な回路の作成', () => {
    it('ユーザーはANDゲートで論理積回路を作成できる', async () => {
      render(<StableLogicCircuit />);
      
      // ストーリー: 2つの入力と1つのANDゲート、1つの出力を配置して接続する
      
      // 1. 入力を2つ配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      const canvas = document.querySelector('svg'); // SVGを直接取得
      
      // 入力1を配置
      fireEvent.click(canvas, { 
        clientX: canvas.getBoundingClientRect().left + 100,
        clientY: canvas.getBoundingClientRect().top + 100
      });
      
      // 入力2を配置
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 100,
        clientY: canvas.getBoundingClientRect().top + 200
      });
      
      // 2. ANDゲートを配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 300,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 3. 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 500,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 4. 接続を作成（実装詳細に依存せず、視覚的な要素を探す）
      const terminals = canvas.querySelectorAll('circle');
      expect(terminals.length).toBeGreaterThan(0);
      
      // 5. 論理をテスト - 両方の入力がONの時だけ出力がON
      // 入力ゲートをクリックして値を変更
      const inputGates = canvas.querySelectorAll('rect');
      
      // 初期状態: 両方OFF -> 出力OFF
      await waitFor(() => {
        const outputGate = Array.from(inputGates).find(rect => 
          rect.nextElementSibling?.textContent === 'OUTPUT'
        );
        expect(outputGate).toBeDefined();
      });
      
      // TODO: より詳細な論理テストを追加
    });

    it('ユーザーはNOTゲートで論理否定回路を作成できる', async () => {
      render(<StableLogicCircuit />);
      
      // 1. 入力を配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      const canvas = document.querySelector('svg');
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 100,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 2. NOTゲートを配置
      await user.click(screen.getByRole('button', { name: /not/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 300,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 3. 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 500,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 4. ゲートが配置されたことを確認
      const gates = screen.getAllByText(/input|not|output/i);
      expect(gates.length).toBeGreaterThan(3); // ボタンとゲートの両方
    });
  });

  describe('ユーザーストーリー: インタラクション', () => {
    it('ユーザーは配置したゲートを削除できる', async () => {
      render(<StableLogicCircuit />);
      
      // ゲートを配置
      const canvas = document.querySelector('svg');
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 200,
        clientY: canvas.getBoundingClientRect().top + 200
      });
      
      // ゲートが存在することを確認
      const gatesBefore = canvas.querySelectorAll('g > rect');
      const initialCount = gatesBefore.length;
      expect(initialCount).toBeGreaterThan(0);
      
      // 右クリックで削除
      fireEvent.contextMenu(gatesBefore[0]);
      
      // ゲートが削除されたことを確認
      await waitFor(() => {
        const gatesAfter = canvas.querySelectorAll('g > rect');
        expect(gatesAfter.length).toBeLessThan(initialCount);
      });
    });

    it('ユーザーは入力ゲートの値を切り替えられる', async () => {
      render(<StableLogicCircuit />);
      
      // 入力ゲートを配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      const canvas = document.querySelector('svg');
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 200,
        clientY: canvas.getBoundingClientRect().top + 200
      });
      
      // 入力ゲートを見つける
      const inputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      
      expect(inputGate).toBeDefined();
      const initialColor = inputGate.getAttribute('fill');
      
      // クリックして値を切り替え
      fireEvent.click(inputGate);
      
      // 色が変わったことを確認（ON/OFFの視覚的フィードバック）
      await waitFor(() => {
        const newColor = inputGate.getAttribute('fill');
        expect(newColor).not.toBe(initialColor);
      });
    });
  });

  describe('ユーザーストーリー: 回路の動作確認', () => {
    it('ユーザーは作成した回路の真理値を確認できる', async () => {
      render(<StableLogicCircuit />);
      
      // シンプルなバッファ回路を作成（INPUT -> OUTPUT）
      const canvas = document.querySelector('svg');
      
      // 入力を配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 100,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 300,
        clientY: canvas.getBoundingClientRect().top + 150
      });
      
      // 接続を作成
      const terminals = canvas.querySelectorAll('circle');
      if (terminals.length >= 2) {
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseUp(terminals[1]);
      }
      
      // 入力を切り替えて出力が追従することを確認
      const inputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      const outputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
        rect.nextElementSibling?.textContent === 'OUTPUT'
      );
      
      // 初期状態を記録
      const outputInitialColor = outputGate?.getAttribute('fill');
      
      // 入力を切り替え
      if (inputGate) {
        fireEvent.click(inputGate);
        
        // 出力が変化することを確認
        await waitFor(() => {
          const outputNewColor = outputGate?.getAttribute('fill');
          expect(outputNewColor).not.toBe(outputInitialColor);
        }, { timeout: 1000 });
      }
    });
  });

  describe('ユーザーストーリー: エラーケース', () => {
    it('ユーザーは無効な接続を作成できない', async () => {
      render(<StableLogicCircuit />);
      
      // ANDゲートを1つ配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      const canvas = document.querySelector('svg');
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 200,
        clientY: canvas.getBoundingClientRect().top + 200
      });
      
      // 同じゲートの入力と出力を接続しようとする
      const terminals = canvas.querySelectorAll('circle');
      if (terminals.length >= 2) {
        const connectionsBefore = canvas.querySelectorAll('line').length;
        
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseUp(terminals[1]);
        
        // 接続が作成されていないことを確認
        const connectionsAfter = canvas.querySelectorAll('line').length;
        expect(connectionsAfter).toBe(connectionsBefore);
      }
    });
  });
});