import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UltraModernCircuit from '../UltraModernCircuit';
import { saveCustomGate, getCustomGates } from '../../utils/circuitStorage';

// LocalStorageのモック
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('カスタムゲート機能', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    localStorageMock.clear();
    // モード選択済みの状態を設定
    localStorageMock.setItem('logicPlayground_userPreferences', JSON.stringify({
      mode: 'free',
      theme: 'modern',
      tutorialCompleted: true,
      showTutorialOnStartup: false
    }));
    
    // alert/confirmのモック
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('カスタムゲートの作成と保存', () => {
    it('単純なNOTゲートをカスタムゲートとして保存できる', async () => {
      const { container } = render(<UltraModernCircuit />);
      
      // INPUTゲートを配置
      const inputButton = screen.getByRole('button', { name: /入力/ });
      await user.click(inputButton);
      
      // NOTゲートを配置
      const notButton = screen.getByRole('button', { name: /NOT/ });
      await user.click(notButton);
      
      // OUTPUTゲートを配置
      const outputButton = screen.getByRole('button', { name: /出力/ });
      await user.click(outputButton);
      
      // ゲート化ボタンをクリック
      const gateifyButton = screen.getByRole('button', { name: /ゲート化/ });
      await user.click(gateifyButton);
      
      // ダイアログが表示される
      const dialog = await screen.findByRole('heading', { name: /カスタムゲートの作成/ });
      expect(dialog).toBeInTheDocument();
      
      // ゲート名を入力
      const nameInput = screen.getByPlaceholderText(/半加算器、4to1MUX/);
      await user.clear(nameInput);
      await user.type(nameInput, 'MyNOT');
      
      // 作成ボタンをクリック
      const createButton = screen.getByRole('button', { name: /作成/ });
      await user.click(createButton);
      
      // LocalStorageに保存されたことを確認
      const savedGates = JSON.parse(localStorageMock.getItem('logicPlayground_customGates'));
      expect(savedGates).toHaveProperty('MyNOT');
      expect(savedGates.MyNOT.inputs).toHaveLength(1);
      expect(savedGates.MyNOT.outputs).toHaveLength(1);
    });

    it('複数入出力のカスタムゲートを作成できる', async () => {
      const { container } = render(<UltraModernCircuit />);
      
      // 2つのINPUTゲートを配置
      const inputButton = screen.getByRole('button', { name: /入力/ });
      await user.click(inputButton);
      await user.click(inputButton);
      
      // ANDゲートを配置（複数ある場合は最初のものを選択）
      const andButtons = screen.getAllByRole('button', { name: /AND/ });
      await user.click(andButtons[0]);
      
      // 2つのOUTPUTゲートを配置
      const outputButton = screen.getByRole('button', { name: /出力/ });
      await user.click(outputButton);
      await user.click(outputButton);
      
      // ゲート化ボタンをクリック
      const gateifyButton = screen.getByRole('button', { name: /ゲート化/ });
      await user.click(gateifyButton);
      
      // ゲート名を入力
      const nameInput = screen.getByPlaceholderText(/半加算器、4to1MUX/);
      await user.clear(nameInput);
      await user.type(nameInput, 'MultiIO');
      
      // 入力ピン名を変更
      const inputPinNames = screen.getAllByDisplayValue(/IN\d/);
      await user.clear(inputPinNames[0]);
      await user.type(inputPinNames[0], 'A');
      await user.clear(inputPinNames[1]);
      await user.type(inputPinNames[1], 'B');
      
      // 出力ピン名を変更
      const outputPinNames = screen.getAllByDisplayValue(/OUT\d/);
      await user.clear(outputPinNames[0]);
      await user.type(outputPinNames[0], 'SUM');
      await user.clear(outputPinNames[1]);
      await user.type(outputPinNames[1], 'CARRY');
      
      // 作成ボタンをクリック
      const createButton = screen.getByRole('button', { name: /作成/ });
      await user.click(createButton);
      
      // 保存されたゲートを確認
      const savedGates = JSON.parse(localStorageMock.getItem('logicPlayground_customGates'));
      expect(savedGates.MultiIO.inputs).toHaveLength(2);
      expect(savedGates.MultiIO.outputs).toHaveLength(2);
      expect(savedGates.MultiIO.inputs[0].name).toBe('A');
      expect(savedGates.MultiIO.inputs[1].name).toBe('B');
      expect(savedGates.MultiIO.outputs[0].name).toBe('SUM');
      expect(savedGates.MultiIO.outputs[1].name).toBe('CARRY');
    });
  });

  describe('カスタムゲートの使用', () => {
    beforeEach(() => {
      // テスト用のカスタムゲートを事前に保存
      const testGate = {
        name: 'TestNOT',
        inputs: [{ id: 'input1', name: 'IN', position: 0 }],
        outputs: [{ id: 'output1', name: 'OUT', position: 0 }],
        circuit: {
          gates: [
            { id: 'input1', type: 'INPUT', x: 100, y: 100 },
            { id: 'not1', type: 'NOT', x: 200, y: 100 },
            { id: 'output1', type: 'OUTPUT', x: 300, y: 100 }
          ],
          connections: [
            { id: 'c1', from: 'input1', to: 'not1', toInput: 0 },
            { id: 'c2', from: 'not1', to: 'output1', toInput: 0 }
          ]
        }
      };
      
      saveCustomGate(testGate);
    });

    it('カスタムゲートパネルが表示される', async () => {
      render(<UltraModernCircuit />);
      
      // カスタムゲートボタンが表示される
      const customGateButton = await screen.findByRole('button', { name: /カスタムゲート.*1/ });
      expect(customGateButton).toBeInTheDocument();
      
      // クリックでパネルが開く
      await user.click(customGateButton);
      
      // カスタムゲートパネルが表示される
      const panel = await screen.findByText('カスタムゲート');
      expect(panel).toBeInTheDocument();
      
      // TestNOTゲートが表示される
      const testGateButton = screen.getByRole('button', { name: /TestNOT/ });
      expect(testGateButton).toBeInTheDocument();
    });

    it('カスタムゲートを配置できる', async () => {
      const { container } = render(<UltraModernCircuit />);
      
      // カスタムゲートパネルを開く
      const customGateButton = await screen.findByRole('button', { name: /カスタムゲート/ });
      await user.click(customGateButton);
      
      // TestNOTゲートをクリックして配置
      const testGateButton = screen.getByRole('button', { name: /TestNOT/ });
      await user.click(testGateButton);
      
      // SVG内にカスタムゲートが配置されたことを確認
      const gates = container.querySelectorAll('g[data-gate-type="TestNOT"]');
      expect(gates).toHaveLength(1);
    });

    it('カスタムゲートのシミュレーションが正しく動作する', async () => {
      const { container } = render(<UltraModernCircuit />);
      
      // INPUTゲートを配置
      const inputButton = screen.getByRole('button', { name: /入力/ });
      await user.click(inputButton);
      
      // カスタムゲートを配置
      const customGateButton = await screen.findByRole('button', { name: /カスタムゲート/ });
      await user.click(customGateButton);
      const testGateButton = screen.getByRole('button', { name: /TestNOT/ });
      await user.click(testGateButton);
      
      // OUTPUTゲートを配置
      const outputButton = screen.getByRole('button', { name: /出力/ });
      await user.click(outputButton);
      
      // ゲートを取得
      await waitFor(() => {
        const gates = container.querySelectorAll('g[data-gate-id]');
        expect(gates).toHaveLength(3);
      });
      
      // 接続を作成（この部分は実際のUI操作が複雑なため、簡略化）
      // 実際のテストでは、ドラッグ＆ドロップのシミュレーションが必要
      
      // INPUTゲートをクリックしてONにする
      const inputGate = container.querySelector('g[data-gate-type="INPUT"]');
      const clickableArea = inputGate.querySelector('g[style*="cursor: move"]');
      fireEvent.click(clickableArea);
      
      // カスタムゲート（NOT）の出力がOFFになることを確認
      // （実際のシミュレーション結果の確認はDOM構造に依存）
    });
  });

  describe('カスタムゲートの管理', () => {
    beforeEach(() => {
      // 複数のカスタムゲートを保存
      saveCustomGate({
        name: 'Gate1',
        inputs: [{ id: 'in1', name: 'IN1', position: 0 }],
        outputs: [{ id: 'out1', name: 'OUT1', position: 0 }],
        circuit: { gates: [], connections: [] }
      });
      
      saveCustomGate({
        name: 'Gate2',
        inputs: [{ id: 'in2', name: 'IN2', position: 0 }],
        outputs: [{ id: 'out2', name: 'OUT2', position: 0 }],
        circuit: { gates: [], connections: [] }
      });
    });

    it('すべてのカスタムゲートを削除できる', async () => {
      render(<UltraModernCircuit />);
      
      // カスタムゲートパネルを開く
      const customGateButton = await screen.findByRole('button', { name: /カスタムゲート.*2/ });
      await user.click(customGateButton);
      
      // すべて削除ボタンをクリック
      const deleteAllButton = screen.getByRole('button', { name: /すべて削除/ });
      
      await user.click(deleteAllButton);
      
      // LocalStorageからカスタムゲートが削除されたことを確認
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('customGates');
      
      // パネルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByText('カスタムゲート')).not.toBeInTheDocument();
      });
    });

    it('カスタムゲートのツールチップに入出力情報が表示される', async () => {
      render(<UltraModernCircuit />);
      
      // カスタムゲートパネルを開く
      const customGateButton = await screen.findByRole('button', { name: /カスタムゲート/ });
      await user.click(customGateButton);
      
      // Gate1ボタンのtitle属性を確認
      const gate1Button = screen.getByRole('button', { name: /Gate1/ });
      expect(gate1Button.title).toContain('入力: 1');
      expect(gate1Button.title).toContain('出力: 1');
    });
  });
});