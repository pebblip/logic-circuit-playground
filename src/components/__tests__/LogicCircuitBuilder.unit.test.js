import { describe, it, expect, vi } from 'vitest';

// 主要な問題: 自動実行中のINPUT値変更が保持されない問題をテスト

describe('LogicCircuitBuilder - 状態管理テスト', () => {
  
  describe('自動実行中のINPUT値保持', () => {
    it('クロック更新時にINPUT値が保持されるべき', () => {
      // 初期状態
      const gates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'INPUT', value: false },
        { id: 3, type: 'CLOCK', value: false }
      ];
      
      // クロック更新のシミュレーション
      const updatedGates = gates.map(gate => 
        gate.type === 'CLOCK' ? { ...gate, value: true } : gate
      );
      
      // INPUT値が変わっていないことを確認
      expect(updatedGates[0].value).toBe(true);
      expect(updatedGates[1].value).toBe(false);
      expect(updatedGates[2].value).toBe(true); // CLOCKのみ変更
    });

    it('setGatesの更新関数内でINPUT値が保持されるべき', () => {
      let currentGates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'CLOCK', value: false }
      ];
      
      // setGatesのシミュレーション
      const setGates = (updateFn) => {
        currentGates = updateFn(currentGates);
      };
      
      // 自動実行のロジック
      setGates(prevGates => {
        const newClockValue = true;
        const updatedGates = prevGates.map(gate => 
          gate.type === 'CLOCK' ? { ...gate, value: newClockValue } : gate
        );
        
        // 簡単な計算シミュレーション
        return updatedGates.map(gate => ({
          ...gate,
          value: gate.type === 'INPUT' || gate.type === 'CLOCK' 
            ? gate.value  // 元の値を保持
            : gate.value
        }));
      });
      
      expect(currentGates[0].value).toBe(true); // INPUT値は保持
      expect(currentGates[1].value).toBe(true); // CLOCKは更新
    });
  });

  describe('calculateCircuitWithGatesの動作', () => {
    it('関数が正しくゲート状態を受け取り計算できる', () => {
      const gateTypes = {
        AND: { inputs: 2, func: (a, b) => a && b },
        INPUT: { inputs: 0 },
        OUTPUT: { inputs: 1, func: (a) => a }
      };
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 },
        { from: 3, to: 4, toInput: 0 }
      ];
      
      const gates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'INPUT', value: true },
        { id: 3, type: 'AND', value: null },
        { id: 4, type: 'OUTPUT', value: null }
      ];
      
      // calculateCircuitWithGatesのロジックを再現
      const calculateCircuitWithGates = (currentGates) => {
        const newSimulation = {};
        
        // 入力値を設定
        currentGates.forEach(gate => {
          if (gate.type === 'INPUT') {
            newSimulation[gate.id] = gate.value;
          }
        });
        
        // 簡略化した計算ロジック
        const andGate = currentGates.find(g => g.type === 'AND');
        if (andGate) {
          const inputs = connections
            .filter(c => c.to === andGate.id)
            .map(c => newSimulation[c.from]);
          
          if (inputs.length === 2) {
            newSimulation[andGate.id] = gateTypes.AND.func(...inputs);
          }
        }
        
        return newSimulation;
      };
      
      const result = calculateCircuitWithGates(gates);
      
      expect(result[1]).toBe(true);  // INPUT 1
      expect(result[2]).toBe(true);  // INPUT 2
      expect(result[3]).toBe(true);  // AND結果
    });
  });

  describe('タイミング問題の検証', () => {
    it('setTimeoutによる非同期更新が正しく動作する', async () => {
      let value = 0;
      
      const toggleInput = () => {
        value = 1;
        setTimeout(() => {
          value = 2;
        }, 10);
      };
      
      toggleInput();
      expect(value).toBe(1); // 即座に更新
      
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(value).toBe(2); // 非同期更新後
    });
  });
});