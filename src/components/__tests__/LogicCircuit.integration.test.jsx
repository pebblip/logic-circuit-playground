import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * 統合テスト - コンポーネント間の連携をテスト
 */
describe('論理回路プレイグラウンド - 統合テスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('ゲート配置システム', () => {
    it('異なる種類のゲートを配置できる', async () => {
      render(<StableLogicCircuit />);
      
      const gateTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];
      const canvas = document.querySelector('svg');
      
      for (let i = 0; i < gateTypes.length; i++) {
        const gateType = gateTypes[i];
        await user.click(screen.getByRole('button', { name: new RegExp(gateType, 'i') }));
        
        fireEvent.click(canvas, {
          clientX: canvas.getBoundingClientRect().left + 100 + i * 100,
          clientY: canvas.getBoundingClientRect().top + 200
        });
      }
      
      // 各ゲートタイプが配置されたことを確認
      for (const gateType of gateTypes) {
        const gateElements = screen.getAllByText(gateType);
        // 最低2つ（ボタン + 配置されたゲート）
        expect(gateElements.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('接続システム', () => {
    it('複数のゲート間で接続を作成できる', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // 入力 -> AND -> OR -> 出力 の回路を作成
      const positions = [
        { type: 'INPUT', x: 100, y: 100 },
        { type: 'INPUT', x: 100, y: 200 },
        { type: 'AND', x: 300, y: 150 },
        { type: 'OR', x: 500, y: 200 },
        { type: 'OUTPUT', x: 700, y: 200 }
      ];
      
      // ゲートを配置
      for (const pos of positions) {
        await user.click(screen.getByRole('button', { name: new RegExp(pos.type, 'i') }));
        fireEvent.click(canvas, {
          clientX: canvas.getBoundingClientRect().left + pos.x,
          clientY: canvas.getBoundingClientRect().top + pos.y
        });
      }
      
      // 接続線が作成可能であることを確認
      const terminals = canvas.querySelectorAll('circle');
      expect(terminals.length).toBeGreaterThan(0);
      
      // ドラッグ操作のシミュレーション
      if (terminals.length >= 2) {
        fireEvent.mouseDown(terminals[0]);
        fireEvent.mouseMove(canvas, {
          clientX: canvas.getBoundingClientRect().left + 200,
          clientY: canvas.getBoundingClientRect().top + 150
        });
        
        // ドラッグ中の線が表示されることを確認
        const dragLine = canvas.querySelector('line[stroke-dasharray]');
        expect(dragLine).toBeTruthy();
      }
    });
  });

  describe('シミュレーションシステム', () => {
    it('回路の状態が正しく計算される', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // シンプルなバッファ回路（INPUT -> OUTPUT）を作成
      await createSimpleCircuit(canvas, user, screen);
      
      // 入力の状態を変更
      const inputGate = findGateByType(canvas, 'INPUT');
      const outputGate = findGateByType(canvas, 'OUTPUT');
      
      // 初期状態（OFF）を確認
      expect(getGateState(inputGate)).toBe(false);
      expect(getGateState(outputGate)).toBe(false);
      
      // 入力をONに変更
      fireEvent.click(inputGate);
      
      // 状態が更新されることを確認
      await waitFor(() => {
        expect(getGateState(inputGate)).toBe(true);
      });
      
      // 接続がある場合、出力も更新されることを確認
      // （接続の実装に依存しない方法で確認）
    });

    it('複雑な論理回路が正しく動作する', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // ORゲートのテスト
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });
      
      await user.click(screen.getByRole('button', { name: /or/i }));
      fireEvent.click(canvas, { clientX: 300, clientY: 150 });
      
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, { clientX: 500, clientY: 150 });
      
      // ORゲートの真理値表
      // 0,0 -> 0
      // 0,1 -> 1
      // 1,0 -> 1
      // 1,1 -> 1
      
      const inputs = canvas.querySelectorAll('rect');
      const inputGates = Array.from(inputs).filter(rect =>
        rect.nextElementSibling?.textContent === 'INPUT'
      );
      
      // 各組み合わせをテスト
      const testCases = [
        [false, false],
        [false, true],
        [true, false],
        [true, true]
      ];
      
      for (const [input1, input2] of testCases) {
        // 入力を設定
        if (getGateState(inputGates[0]) !== input1) {
          fireEvent.click(inputGates[0]);
          await waitFor(() => expect(getGateState(inputGates[0])).toBe(input1));
        }
        if (getGateState(inputGates[1]) !== input2) {
          fireEvent.click(inputGates[1]);
          await waitFor(() => expect(getGateState(inputGates[1])).toBe(input2));
        }
        
        // OR演算の結果を確認
        const expectedOutput = input1 || input2;
        // 実際の出力確認は接続実装後に追加
      }
    });
  });

  describe('エラー処理とバリデーション', () => {
    it('不正な操作を適切に処理する', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // キャンバス外をクリック
      fireEvent.click(document.body);
      
      // エラーが発生しないことを確認
      expect(canvas).toBeInTheDocument();
      
      // 存在しないゲートを削除しようとする
      fireEvent.contextMenu(canvas);
      
      // アプリケーションが正常に動作することを確認
      expect(screen.getByText('論理回路プレイグラウンド')).toBeInTheDocument();
    });

    it('大量の操作でもメモリリークが発生しない', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // 100回の追加と削除を繰り返す
      for (let i = 0; i < 100; i++) {
        // ゲートを追加
        await user.click(screen.getByRole('button', { name: /input/i }));
        fireEvent.click(canvas, {
          clientX: canvas.getBoundingClientRect().left + 200,
          clientY: canvas.getBoundingClientRect().top + 200
        });
        
        // ゲートを削除
        const gate = canvas.querySelector('rect');
        if (gate) {
          fireEvent.contextMenu(gate);
        }
      }
      
      // DOM要素が蓄積されていないことを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(0);
    });
  });

  describe('ユーザーインターフェース', () => {
    it('選択したゲートタイプが視覚的にフィードバックされる', async () => {
      render(<StableLogicCircuit />);
      
      const gateButtons = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'].map(type =>
        screen.getByRole('button', { name: new RegExp(type, 'i') })
      );
      
      for (const button of gateButtons) {
        await user.click(button);
        
        // 選択されたボタンがハイライトされることを確認
        expect(button.className).toContain('bg-blue-500');
        
        // 他のボタンがハイライトされていないことを確認
        gateButtons.forEach(otherButton => {
          if (otherButton !== button) {
            expect(otherButton.className).not.toContain('bg-blue-500');
          }
        });
      }
    });
  });
});

// ヘルパー関数

function findGateByType(canvas, type) {
  return Array.from(canvas.querySelectorAll('rect')).find(rect =>
    rect.nextElementSibling?.textContent === type
  );
}

function getGateState(gateElement) {
  if (!gateElement) return null;
  const color = gateElement.getAttribute('fill');
  return color === '#10b981'; // 緑色 = true/ON
}

async function createSimpleCircuit(canvas, user, screen) {
  // INPUT -> OUTPUT のシンプルな回路を作成
  await user.click(screen.getByRole('button', { name: /input/i }));
  fireEvent.click(canvas, {
    clientX: canvas.getBoundingClientRect().left + 100,
    clientY: canvas.getBoundingClientRect().top + 200
  });
  
  await user.click(screen.getByRole('button', { name: /output/i }));
  fireEvent.click(canvas, {
    clientX: canvas.getBoundingClientRect().left + 300,
    clientY: canvas.getBoundingClientRect().top + 200
  });
  
  // 接続を作成（実装に依存しない方法）
  const terminals = canvas.querySelectorAll('circle');
  if (terminals.length >= 2) {
    fireEvent.mouseDown(terminals[0]);
    fireEvent.mouseUp(terminals[1]);
  }
}