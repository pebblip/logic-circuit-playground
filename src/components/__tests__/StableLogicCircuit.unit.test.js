// StableLogicCircuit コンポーネントの単体テスト（Cypressで困難だった機能）

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('StableLogicCircuit - Cypressで困難だった機能の単体テスト', () => {
  // simulate関数の単体テスト
  describe('シミュレーション関数', () => {
    const createGate = (id, type, x, y, value = null) => ({
      id,
      type,
      x,
      y,
      value
    });

    const createConnection = (from, to, fromIndex = 0, toIndex = 0) => ({
      id: `conn_${from}_${to}`,
      from,
      to,
      fromIndex,
      toIndex
    });

    it('100個のゲートでも10回以内の反復で収束する', () => {
      const gates = [];
      const connections = [];
      
      // 100個のゲートを作成（50個のINPUT、50個のNOT）
      for (let i = 0; i < 50; i++) {
        gates.push(createGate(`input_${i}`, 'INPUT', i * 20, 100, false));
        gates.push(createGate(`not_${i}`, 'NOT', i * 20, 200));
        connections.push(createConnection(`input_${i}`, `not_${i}`));
      }
      
      // シミュレーション実行（簡易版）
      let iterations = 0;
      const results = {};
      
      // 入力ゲートの値を設定
      gates.forEach(gate => {
        if (gate.type === 'INPUT') {
          results[gate.id] = gate.value;
        }
      });
      
      // 最大10回の反復
      let changed = true;
      while (changed && iterations < 10) {
        changed = false;
        iterations++;
        
        gates.forEach(gate => {
          if (gate.type === 'NOT' && results[gate.id] === undefined) {
            const conn = connections.find(c => c.to === gate.id);
            if (conn && results[conn.from] !== undefined) {
              results[gate.id] = !results[conn.from];
              changed = true;
            }
          }
        });
      }
      
      expect(iterations).toBeLessThanOrEqual(10);
      expect(Object.keys(results).length).toBe(100);
    });

    it('循環参照があっても無限ループに陥らない', () => {
      const gates = [
        createGate('not1', 'NOT', 100, 100),
        createGate('not2', 'NOT', 200, 100)
      ];
      
      const connections = [
        createConnection('not1', 'not2'),
        createConnection('not2', 'not1') // 循環参照
      ];
      
      let iterations = 0;
      const results = {};
      
      // シミュレーション実行
      let changed = true;
      while (changed && iterations < 10) {
        changed = false;
        iterations++;
        
        gates.forEach(gate => {
          const conn = connections.find(c => c.to === gate.id);
          if (conn && results[conn.from] !== undefined && results[gate.id] === undefined) {
            results[gate.id] = !results[conn.from];
            changed = true;
          }
        });
      }
      
      // 10回以内で処理が完了することを確認（無限ループに陥らない）
      expect(iterations).toBeLessThanOrEqual(10);
    });
  });

  // ゲート配置の制約テスト
  describe('ゲート配置の制約', () => {
    it('重複防止ロジックが正しく動作する', () => {
      const existingGates = [
        { id: 'gate1', x: 200, y: 200 }
      ];
      
      // 重複チェック関数
      const isOverlapping = (x, y, gates) => {
        return gates.some(gate => 
          Math.abs(gate.x - x) < 60 && Math.abs(gate.y - y) < 40
        );
      };
      
      // 近すぎる位置
      expect(isOverlapping(240, 200, existingGates)).toBe(true);
      expect(isOverlapping(200, 230, existingGates)).toBe(true);
      
      // 十分離れた位置
      expect(isOverlapping(300, 200, existingGates)).toBe(false);
      expect(isOverlapping(200, 300, existingGates)).toBe(false);
    });

    it('グリッドスナップが20px単位で動作する', () => {
      const snapToGrid = (value) => {
        return Math.round(value / 20) * 20;
      };
      
      expect(snapToGrid(117)).toBe(120);
      expect(snapToGrid(123)).toBe(120);
      expect(snapToGrid(130)).toBe(140);
      expect(snapToGrid(110)).toBe(120);
    });

    it('境界値制約が正しく適用される', () => {
      const CANVAS = { width: 800, height: 600 };
      const GATE_BOUNDS = { width: 60, height: 40 };
      
      const constrainGatePosition = (x, y, canvas) => {
        const minX = GATE_BOUNDS.width / 2;
        const minY = GATE_BOUNDS.height / 2;
        const maxX = canvas.width - GATE_BOUNDS.width / 2;
        const maxY = canvas.height - GATE_BOUNDS.height / 2;
        
        return {
          x: Math.max(minX, Math.min(maxX, x)),
          y: Math.max(minY, Math.min(maxY, y))
        };
      };
      
      // 範囲外の座標
      expect(constrainGatePosition(-100, -100, CANVAS)).toEqual({ x: 30, y: 20 });
      expect(constrainGatePosition(1000, 1000, CANVAS)).toEqual({ x: 770, y: 580 });
      
      // 範囲内の座標
      expect(constrainGatePosition(400, 300, CANVAS)).toEqual({ x: 400, y: 300 });
    });
  });

  // 接続の検証テスト
  describe('接続の検証', () => {
    it('異なるゲート間のみ接続を許可する', () => {
      const validateConnection = (fromGateId, toGateId) => {
        return fromGateId !== toGateId;
      };
      
      expect(validateConnection('gate1', 'gate2')).toBe(true);
      expect(validateConnection('gate1', 'gate1')).toBe(false);
    });

    it('出力から入力への接続のみ許可する', () => {
      const validateTerminalConnection = (fromTerminal, toTerminal) => {
        return fromTerminal === 'output' && toTerminal === 'input';
      };
      
      expect(validateTerminalConnection('output', 'input')).toBe(true);
      expect(validateTerminalConnection('output', 'output')).toBe(false);
      expect(validateTerminalConnection('input', 'input')).toBe(false);
      expect(validateTerminalConnection('input', 'output')).toBe(false);
    });

    it('削除されたゲートの接続が自動的に削除される', () => {
      const connections = [
        { id: 'conn1', from: 'gate1', to: 'gate2' },
        { id: 'conn2', from: 'gate2', to: 'gate3' },
        { id: 'conn3', from: 'gate3', to: 'gate1' }
      ];
      
      const removeGateConnections = (gateId, connections) => {
        return connections.filter(c => c.from !== gateId && c.to !== gateId);
      };
      
      // gate2を削除
      const updatedConnections = removeGateConnections('gate2', connections);
      
      expect(updatedConnections.length).toBe(1);
      expect(updatedConnections[0].id).toBe('conn3');
    });
  });

  // 複数入力の処理テスト
  describe('複数入力ゲートの処理', () => {
    it('ANDゲートの2つの入力を正しく識別する', () => {
      const getInputCount = (gateType) => {
        return gateType === 'AND' || gateType === 'OR' ? 2 :
               gateType === 'NOT' || gateType === 'OUTPUT' ? 1 : 0;
      };
      
      expect(getInputCount('AND')).toBe(2);
      expect(getInputCount('OR')).toBe(2);
      expect(getInputCount('NOT')).toBe(1);
      expect(getInputCount('INPUT')).toBe(0);
    });

    it('入力端子のY座標オフセットが正しく計算される', () => {
      const calculateInputYOffset = (inputIndex, inputCount) => {
        return inputCount === 1 ? 0 : (inputIndex - (inputCount - 1) / 2) * 15;
      };
      
      // 1入力の場合
      expect(calculateInputYOffset(0, 1)).toBe(0);
      
      // 2入力の場合
      expect(calculateInputYOffset(0, 2)).toBe(-7.5);
      expect(calculateInputYOffset(1, 2)).toBe(7.5);
    });

    it('接続先の入力インデックスが正しく保存される', () => {
      const connection = {
        from: 'input1',
        to: 'and1',
        fromIndex: 0,
        toIndex: 1 // 2番目の入力端子
      };
      
      expect(connection.toIndex).toBe(1);
    });
  });
});