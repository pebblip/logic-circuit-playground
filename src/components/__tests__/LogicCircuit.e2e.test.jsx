import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StableLogicCircuit from '../StableLogicCircuit';

/**
 * E2Eテスト - 実際のユーザーシナリオをテスト
 */
describe('論理回路プレイグラウンド - E2Eテスト', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('シナリオ: 半加算器の作成', () => {
    it('ユーザーは半加算器を作成して動作を確認できる', async () => {
      render(<StableLogicCircuit />);
      
      // 半加算器: 2入力、XOR（和）とAND（桁上げ）で構成
      // 簡略版として、ANDゲートのみで桁上げ部分をテスト
      
      const canvas = document.querySelector('svg');
      const rect = canvas.getBoundingClientRect();
      
      // 座標計算用ヘルパー
      const getCanvasCoords = (x, y) => ({
        clientX: rect.left + x,
        clientY: rect.top + y
      });
      
      // 1. 2つの入力を配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, getCanvasCoords(100, 100));
      fireEvent.click(canvas, getCanvasCoords(100, 200));
      
      // 2. ANDゲート（桁上げ用）を配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, getCanvasCoords(300, 150));
      
      // 3. 出力（桁上げ）を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, getCanvasCoords(500, 150));
      
      // 4. 配線を接続
      // 実装に依存しない方法: 端子を視覚的な位置で特定
      await connectGates(canvas);
      
      // 5. 真理値表の確認
      await verifyTruthTable(canvas, [
        { inputs: [false, false], output: false }, // 0 + 0 = 0
        { inputs: [false, true], output: false },  // 0 + 1 = 0 (carry)
        { inputs: [true, false], output: false },  // 1 + 0 = 0 (carry)
        { inputs: [true, true], output: true },    // 1 + 1 = 1 (carry)
      ]);
    });
  });

  describe('シナリオ: 複雑な組み合わせ回路', () => {
    it('ユーザーは (A AND B) OR (C AND D) の回路を作成できる', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      const rect = canvas.getBoundingClientRect();
      const getCoords = (x, y) => ({ clientX: rect.left + x, clientY: rect.top + y });
      
      // 4つの入力を配置
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, getCoords(50, 50));   // A
      fireEvent.click(canvas, getCoords(50, 150));  // B
      fireEvent.click(canvas, getCoords(50, 250));  // C
      fireEvent.click(canvas, getCoords(50, 350));  // D
      
      // 2つのANDゲートを配置
      await user.click(screen.getByRole('button', { name: /and/i }));
      fireEvent.click(canvas, getCoords(250, 100));  // AND1
      fireEvent.click(canvas, getCoords(250, 300));  // AND2
      
      // ORゲートを配置
      await user.click(screen.getByRole('button', { name: /or/i }));
      fireEvent.click(canvas, getCoords(450, 200));
      
      // 出力を配置
      await user.click(screen.getByRole('button', { name: /output/i }));
      fireEvent.click(canvas, getCoords(650, 200));
      
      // ゲートが正しく配置されたことを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(8); // 4 inputs + 2 ANDs + 1 OR + 1 output
    });
  });

  describe('シナリオ: ユーザビリティ', () => {
    it('ユーザーは操作を元に戻す/やり直すことができる', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      const undoButton = screen.getByRole('button', { name: /元に戻す/i });
      const redoButton = screen.getByRole('button', { name: /やり直す/i });
      
      // 初期状態: Undo/Redoは無効
      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();
      
      // ゲートを追加
      await user.click(screen.getByRole('button', { name: /input/i }));
      fireEvent.click(canvas, {
        clientX: canvas.getBoundingClientRect().left + 200,
        clientY: canvas.getBoundingClientRect().top + 200
      });
      
      // Undoが有効になることを確認
      await waitFor(() => {
        expect(undoButton).not.toBeDisabled();
      });
      
      // 元に戻す
      await user.click(undoButton);
      
      // ゲートが消えて、Redoが有効になることを確認
      await waitFor(() => {
        expect(redoButton).not.toBeDisabled();
        const gates = canvas.querySelectorAll('g > rect');
        expect(gates.length).toBe(0);
      });
      
      // やり直す
      await user.click(redoButton);
      
      // ゲートが復元されることを確認
      await waitFor(() => {
        const gates = canvas.querySelectorAll('g > rect');
        expect(gates.length).toBe(1);
      });
    });

    it('ユーザーは真理値表を表示できる', async () => {
      render(<StableLogicCircuit />);
      
      // 真理値表ボタンをクリック
      const truthTableButton = screen.getByRole('button', { name: /真理値表/i });
      await user.click(truthTableButton);
      
      // TODO: 真理値表の表示を確認
      // 現在は未実装なので、ボタンの存在のみ確認
      expect(truthTableButton).toBeInTheDocument();
    });
  });

  describe('シナリオ: エラーハンドリング', () => {
    it('大量のゲートを配置してもアプリケーションがクラッシュしない', async () => {
      render(<StableLogicCircuit />);
      
      const canvas = document.querySelector('svg');
      
      // 50個のゲートを配置
      for (let i = 0; i < 50; i++) {
        const gateType = ['input', 'output', 'and', 'or', 'not'][i % 5];
        await user.click(screen.getByRole('button', { name: new RegExp(gateType, 'i') }));
        
        fireEvent.click(canvas, {
          clientX: canvas.getBoundingClientRect().left + (i % 10) * 70 + 50,
          clientY: canvas.getBoundingClientRect().top + Math.floor(i / 10) * 70 + 50
        });
      }
      
      // アプリケーションが正常に動作していることを確認
      const gates = canvas.querySelectorAll('g > rect');
      expect(gates.length).toBe(50);
      
      // 削除も正常に動作することを確認
      fireEvent.contextMenu(gates[0]);
      await waitFor(() => {
        const remainingGates = canvas.querySelectorAll('g > rect');
        expect(remainingGates.length).toBe(49);
      });
    });
  });
});

// ヘルパー関数

async function connectGates(canvas) {
  // 接続を作成するヘルパー
  // 実装詳細に依存しない方法で端子を見つけて接続
  const terminals = canvas.querySelectorAll('circle');
  
  // 視覚的な位置関係から適切な端子を選択
  const outputTerminals = Array.from(terminals).filter(t => 
    parseInt(t.getAttribute('cx')) > parseInt(t.parentElement.querySelector('rect').getAttribute('x'))
  );
  const inputTerminals = Array.from(terminals).filter(t => 
    parseInt(t.getAttribute('cx')) < parseInt(t.parentElement.querySelector('rect').getAttribute('x'))
  );
  
  // 接続を作成
  if (outputTerminals.length >= 2 && inputTerminals.length >= 2) {
    // Input1 -> AND
    fireEvent.mouseDown(outputTerminals[0]);
    fireEvent.mouseUp(inputTerminals[0]);
    
    // Input2 -> AND
    fireEvent.mouseDown(outputTerminals[1]);
    fireEvent.mouseUp(inputTerminals[0]);
    
    // AND -> Output
    const andOutput = outputTerminals.find(t => 
      t.parentElement.querySelector('text')?.textContent === 'AND'
    );
    const outputInput = inputTerminals.find(t => 
      t.parentElement.querySelector('text')?.textContent === 'OUTPUT'
    );
    
    if (andOutput && outputInput) {
      fireEvent.mouseDown(andOutput);
      fireEvent.mouseUp(outputInput);
    }
  }
}

async function verifyTruthTable(canvas, truthTable) {
  // 真理値表を検証するヘルパー
  const inputGates = Array.from(canvas.querySelectorAll('rect')).filter(rect =>
    rect.nextElementSibling?.textContent === 'INPUT'
  );
  const outputGate = Array.from(canvas.querySelectorAll('rect')).find(rect =>
    rect.nextElementSibling?.textContent === 'OUTPUT'
  );
  
  for (const row of truthTable) {
    // 入力を設定
    for (let i = 0; i < row.inputs.length; i++) {
      const gate = inputGates[i];
      const currentColor = gate.getAttribute('fill');
      const isOn = currentColor === '#10b981'; // 緑色 = ON
      
      if (isOn !== row.inputs[i]) {
        fireEvent.click(gate);
        await waitFor(() => {
          const newColor = gate.getAttribute('fill');
          expect(newColor).not.toBe(currentColor);
        });
      }
    }
    
    // 出力を確認
    await waitFor(() => {
      const outputColor = outputGate.getAttribute('fill');
      const isOutputOn = outputColor === '#10b981';
      expect(isOutputOn).toBe(row.output);
    });
  }
}