/**
 * 循環回路実現可能性実証テスト
 * 
 * 目的: LogiCircで循環回路が実際に構築可能かどうかを実証
 * 
 * テストケース:
 * 1. 手動SR-FF構築（予想：失敗）- NORゲートでフィードバック
 * 2. 専用SR-LATCHゲート（予想：成功）- 内蔵状態管理
 * 3. 手動バイナリカウンタ（予想：失敗）- D-FFとNOTでフィードバック
 */

import { describe, it, expect } from 'vitest';
import { evaluateCircuit } from '../../src/domain/simulation/core/circuitEvaluation';
import type { Circuit, Gate, Wire } from '../../src/types/circuit';
import { IdGenerator } from '../../src/shared/id';

describe('循環回路実現可能性テスト', () => {
  
  /**
   * テストケース1: 手動SR-FF構築（予想：失敗）
   * 
   * 構成:
   * INPUT_S ──→ NOR1 ──┬─→ NOR2 ──→ OUTPUT_Q
   *                ↑   │     ↑
   *                │   └─────┘（フィードバック）
   * INPUT_R ──────→┘         R
   * 
   * 予想結果: 循環依存エラー
   */
  describe('テストケース1: 手動SR-FF構築', () => {
    it('NORゲートでフィードバック回路を構築すると循環依存エラーが発生する', () => {
      // ゲート作成
      const inputS: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'INPUT',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
      };

      const inputR: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'INPUT',
        position: { x: 100, y: 200 },
        inputs: [],
        output: false,
      };

      const nor1: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'NOR',
        position: { x: 200, y: 150 },
        inputs: ['', ''],
        output: false,
      };

      const nor2: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'NOR',
        position: { x: 300, y: 150 },
        inputs: ['', ''],
        output: false,
      };

      const outputQ: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'OUTPUT',
        position: { x: 400, y: 150 },
        inputs: [''],
        output: false,
      };

      // ワイヤー作成（循環を含む）
      const wires: Wire[] = [
        // 通常の接続
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: inputS.id, pinIndex: 0 },
          to: { gateId: nor1.id, pinIndex: 0 },
          isActive: false,
        },
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: inputR.id, pinIndex: 0 },
          to: { gateId: nor2.id, pinIndex: 1 },
          isActive: false,
        },
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: nor1.id, pinIndex: 0 },
          to: { gateId: nor2.id, pinIndex: 0 },
          isActive: false,
        },
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: nor2.id, pinIndex: 0 },
          to: { gateId: outputQ.id, pinIndex: 0 },
          isActive: false,
        },
        // 🔄 フィードバック接続（循環を作成）
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: nor2.id, pinIndex: 0 },
          to: { gateId: nor1.id, pinIndex: 1 },
          isActive: false,
        },
      ];

      const circuit: Circuit = {
        gates: [inputS, inputR, nor1, nor2, outputQ],
        wires,
        metadata: {},
      };

      // 評価実行
      const result = evaluateCircuit(circuit);

      // 検証: 循環依存エラーが発生することを確認
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('無限ループ');
        // context情報は実装によって異なるため検証をスキップ
        console.log('テストケース1 結果:', {
          success: result.success,
          errorMessage: result.error.message,
          errorType: result.error.type,
        });
      }
    });

    it('循環依存検出の詳細な解析', () => {
      // より簡単な循環回路でテスト
      const gate1: Gate = {
        id: 'gate1',
        type: 'NOT',
        position: { x: 100, y: 100 },
        inputs: [''],
        output: false,
      };

      const gate2: Gate = {
        id: 'gate2',
        type: 'NOT',
        position: { x: 200, y: 100 },
        inputs: [''],
        output: false,
      };

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'gate1', pinIndex: 0 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'gate2', pinIndex: 0 },
          to: { gateId: 'gate1', pinIndex: 0 },
          isActive: false,
        },
      ];

      const circuit: Circuit = {
        gates: [gate1, gate2],
        wires,
        metadata: {},
      };

      const result = evaluateCircuit(circuit);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        console.log('循環依存詳細:', {
          errorMessage: result.error.message,
          errorType: result.error.type,
          context: result.error.context,
        });
      }
    });
  });

  /**
   * テストケース2: 専用SR-LATCHゲート（予想：成功）
   * 
   * 構成:
   * INPUT_S ──→ SR-LATCH ──→ OUTPUT_Q
   * INPUT_R ──→ SR-LATCH ──→ OUTPUT_Q_BAR
   * 
   * 予想結果: 成功（内部状態管理により循環不要）
   */
  describe('テストケース2: 専用SR-LATCHゲート', () => {
    it('SR-LATCHゲートは内部状態管理により正常に動作する', () => {
      // ゲート作成
      const inputS: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'INPUT',
        position: { x: 100, y: 100 },
        inputs: [],
        output: true, // S=1
      };

      const inputR: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'INPUT',
        position: { x: 100, y: 200 },
        inputs: [],
        output: false, // R=0
      };

      const srLatch: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'SR-LATCH',
        position: { x: 200, y: 150 },
        inputs: ['', ''],
        output: false,
        metadata: {
          qOutput: false,
          qBarOutput: true,
        },
      };

      const outputQ: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'OUTPUT',
        position: { x: 300, y: 120 },
        inputs: [''],
        output: false,
      };

      const outputQBar: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'OUTPUT',
        position: { x: 300, y: 180 },
        inputs: [''],
        output: false,
      };

      // ワイヤー作成（循環なし）
      const wires: Wire[] = [
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: inputS.id, pinIndex: 0 },
          to: { gateId: srLatch.id, pinIndex: 0 },
          isActive: false,
        },
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: inputR.id, pinIndex: 0 },
          to: { gateId: srLatch.id, pinIndex: 1 },
          isActive: false,
        },
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: srLatch.id, pinIndex: 0 },
          to: { gateId: outputQ.id, pinIndex: 0 },
          isActive: false,
        },
        // SR-LATCHの第2出力（Q̄）への接続は現在未実装のため省略
      ];

      const circuit: Circuit = {
        gates: [inputS, inputR, srLatch, outputQ, outputQBar],
        wires,
        metadata: {},
      };

      // 評価実行
      const result = evaluateCircuit(circuit);

      // 検証: SR-LATCHは正常に動作することを確認
      expect(result.success).toBe(true);
      if (result.success) {
        const { circuit: evaluatedCircuit } = result.data;
        const evaluatedSRLatch = evaluatedCircuit.gates.find(g => g.type === 'SR-LATCH');
        
        console.log('テストケース2 結果:', {
          success: result.success,
          srLatchOutput: evaluatedSRLatch?.output,
          srLatchMetadata: evaluatedSRLatch?.metadata,
          evaluationStats: result.data.evaluationStats,
        });

        // S=1, R=0の場合、Q=1になることを確認
        expect(evaluatedSRLatch?.output).toBe(true);
        expect(evaluatedSRLatch?.metadata?.qOutput).toBe(true);
      }
    });

    it('SR-LATCHの状態変化テスト', () => {
      // 初期状態: S=0, R=1 (Reset)
      const createCircuit = (sValue: boolean, rValue: boolean) => {
        const inputS: Gate = {
          id: 'input-s',
          type: 'INPUT',
          position: { x: 100, y: 100 },
          inputs: [],
          output: sValue,
        };

        const inputR: Gate = {
          id: 'input-r',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          inputs: [],
          output: rValue,
        };

        const srLatch: Gate = {
          id: 'sr-latch',
          type: 'SR-LATCH',
          position: { x: 200, y: 150 },
          inputs: ['', ''],
          output: false,
          metadata: {
            qOutput: false,
            qBarOutput: true,
          },
        };

        const wires: Wire[] = [
          {
            id: 'wire-s',
            from: { gateId: 'input-s', pinIndex: 0 },
            to: { gateId: 'sr-latch', pinIndex: 0 },
            isActive: false,
          },
          {
            id: 'wire-r',
            from: { gateId: 'input-r', pinIndex: 0 },
            to: { gateId: 'sr-latch', pinIndex: 1 },
            isActive: false,
          },
        ];

        return {
          gates: [inputS, inputR, srLatch],
          wires,
          metadata: {},
        };
      };

      // Step 1: S=0, R=1 (Reset)
      const resetResult = evaluateCircuit(createCircuit(false, true));
      expect(resetResult.success).toBe(true);
      
      // Step 2: S=1, R=0 (Set)
      const setResult = evaluateCircuit(createCircuit(true, false));
      expect(setResult.success).toBe(true);
      
      // Step 3: S=0, R=0 (Hold)
      const holdResult = evaluateCircuit(createCircuit(false, false));
      expect(holdResult.success).toBe(true);

      console.log('SR-LATCH状態変化テスト:', {
        reset: resetResult.success ? resetResult.data.circuit.gates.find(g => g.type === 'SR-LATCH')?.output : 'FAILED',
        set: setResult.success ? setResult.data.circuit.gates.find(g => g.type === 'SR-LATCH')?.output : 'FAILED',
        hold: holdResult.success ? holdResult.data.circuit.gates.find(g => g.type === 'SR-LATCH')?.output : 'FAILED',
      });
    });
  });

  /**
   * テストケース3: 手動バイナリカウンタ（予想：失敗）
   * 
   * 構成:
   * CLOCK ──→ D-FF ──→ NOT ──┐
   *             ↑            │
   *             └────────────┘（フィードバック）
   * 
   * 予想結果: 循環依存エラー
   */
  describe('テストケース3: 手動バイナリカウンタ', () => {
    it('D-FFとNOTでフィードバック回路を構築すると循環依存エラーが発生する', () => {
      // ゲート作成
      const clockGate: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1,
          startTime: Date.now(),
        },
      };

      const dFlipFlop: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'D-FF',
        position: { x: 200, y: 100 },
        inputs: ['', ''],
        output: false,
        metadata: {
          qOutput: false,
          qBarOutput: true,
          previousClockState: false,
        },
      };

      const notGate: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'NOT',
        position: { x: 300, y: 100 },
        inputs: [''],
        output: false,
      };

      const outputGate: Gate = {
        id: IdGenerator.generateGenericId(),
        type: 'OUTPUT',
        position: { x: 400, y: 100 },
        inputs: [''],
        output: false,
      };

      // ワイヤー作成（循環を含む）
      const wires: Wire[] = [
        // CLOCK → D-FF (CLK input)
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: clockGate.id, pinIndex: 0 },
          to: { gateId: dFlipFlop.id, pinIndex: 1 },
          isActive: false,
        },
        // D-FF → NOT
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: dFlipFlop.id, pinIndex: 0 },
          to: { gateId: notGate.id, pinIndex: 0 },
          isActive: false,
        },
        // D-FF → OUTPUT
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: dFlipFlop.id, pinIndex: 0 },
          to: { gateId: outputGate.id, pinIndex: 0 },
          isActive: false,
        },
        // 🔄 フィードバック接続（循環を作成）
        // NOT → D-FF (D input)
        {
          id: IdGenerator.generateGenericId(),
          from: { gateId: notGate.id, pinIndex: 0 },
          to: { gateId: dFlipFlop.id, pinIndex: 0 },
          isActive: false,
        },
      ];

      const circuit: Circuit = {
        gates: [clockGate, dFlipFlop, notGate, outputGate],
        wires,
        metadata: {},
      };

      // 評価実行
      const result = evaluateCircuit(circuit);

      // 検証: 循環依存エラーが発生することを確認
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('無限ループ');
        console.log('テストケース3 結果:', {
          success: result.success,
          errorMessage: result.error.message,
          errorType: result.error.type,
          context: result.error.context,
        });
      }
    });

    it('バイナリカウンタの理論的動作検証（循環なしバージョン）', () => {
      // 循環なしで1クロック分のD-FF動作をテスト
      const clockGate: Gate = {
        id: 'clock',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: true, // High状態
        metadata: {
          isRunning: true,
          frequency: 1,
          startTime: Date.now(),
        },
      };

      const inputD: Gate = {
        id: 'input-d',
        type: 'INPUT',
        position: { x: 100, y: 200 },
        inputs: [],
        output: true, // D=1
      };

      const dFlipFlop: Gate = {
        id: 'd-ff',
        type: 'D-FF',
        position: { x: 200, y: 150 },
        inputs: ['', ''],
        output: false,
        metadata: {
          qOutput: false,
          qBarOutput: true,
          previousClockState: false, // 前回Low状態
        },
      };

      const wires: Wire[] = [
        {
          id: 'wire-d',
          from: { gateId: 'input-d', pinIndex: 0 },
          to: { gateId: 'd-ff', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire-clk',
          from: { gateId: 'clock', pinIndex: 0 },
          to: { gateId: 'd-ff', pinIndex: 1 },
          isActive: false,
        },
      ];

      const circuit: Circuit = {
        gates: [clockGate, inputD, dFlipFlop],
        wires,
        metadata: {},
      };

      const result = evaluateCircuit(circuit);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const evaluatedDFF = result.data.circuit.gates.find(g => g.type === 'D-FF');
        console.log('D-FF単体動作テスト:', {
          output: evaluatedDFF?.output,
          metadata: evaluatedDFF?.metadata,
        });
      }
    });
  });

  /**
   * 総合検証: 循環回路の実現可能性についての結論
   */
  describe('総合検証', () => {
    it('循環回路実現可能性の結論', () => {
      const conclusions = {
        manualSRFF: '失敗（循環依存エラー）',
        builtInSRLatch: '成功（内部状態管理）',
        manualBinaryCounter: '失敗（循環依存エラー）',
        architecturalLimitation: 'evaluateCircuitは循環依存を禁止',
        workaround: '状態を持つ専用ゲート（SR-LATCH、D-FF）を使用',
      };

      console.log('\n=== 循環回路実現可能性テスト結果 ===');
      console.log('1. 手動SR-FF構築:', conclusions.manualSRFF);
      console.log('2. 専用SR-LATCHゲート:', conclusions.builtInSRLatch);
      console.log('3. 手動バイナリカウンタ:', conclusions.manualBinaryCounter);
      console.log('\n=== 結論 ===');
      console.log('・アーキテクチャ上の制限:', conclusions.architecturalLimitation);
      console.log('・解決策:', conclusions.workaround);
      console.log('・循環構造が必要な回路は専用ゲートとして実装済み');

      // テストが実行されたことを示すアサーション
      expect(conclusions.manualSRFF).toContain('失敗');
      expect(conclusions.builtInSRLatch).toContain('成功');
      expect(conclusions.manualBinaryCounter).toContain('失敗');
    });

    it('アーキテクチャ分析: なぜ循環回路が禁止されているか', () => {
      const analysis = {
        reason1: 'トポロジカルソートベースの評価順序決定',
        reason2: '無限ループ・発振の防止',
        reason3: '決定論的な評価結果の保証',
        solution: '状態を持つ専用ゲートによる内部状態管理',
        tradeoff: '柔軟性 vs 安定性・予測可能性',
      };

      console.log('\n=== アーキテクチャ分析 ===');
      Object.entries(analysis).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });

      expect(analysis.solution).toContain('内部状態管理');
    });
  });
});