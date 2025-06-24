import { describe, it, expect } from 'vitest';
import { calculateCircuitLayout } from '@/domain/circuit/layout';
import type { Gate, Wire } from '@/types/circuit';

describe('calculateCircuitLayout', () => {
  it('レイヤー内のゲートが重ならないよう適切な間隔で配置される', () => {
    // 同じレイヤーに配置される3つのゲート
    const gates: Gate[] = [
      {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
      {
        id: 'and2',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
      {
        id: 'and3',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
    ];

    const wires: Wire[] = [];

    const layout = calculateCircuitLayout(gates, wires);

    // 各ゲートの位置を取得
    const pos1 = layout.gatePositions.get('and1');
    const pos2 = layout.gatePositions.get('and2');
    const pos3 = layout.gatePositions.get('and3');

    expect(pos1).toBeDefined();
    expect(pos2).toBeDefined();
    expect(pos3).toBeDefined();

    // ゲート間の垂直距離が120px（GATE_SPACING）であることを確認
    expect(Math.abs(pos2!.y - pos1!.y)).toBe(120);
    expect(Math.abs(pos3!.y - pos2!.y)).toBe(120);

    // 同じレイヤーのゲートは同じX座標を持つ
    expect(pos1!.x).toBe(pos2!.x);
    expect(pos2!.x).toBe(pos3!.x);
  });

  it('異なるレイヤーのゲートが適切な水平間隔で配置される', () => {
    const gates: Gate[] = [
      {
        id: 'input1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [false],
        output: false,
      },
      {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
      {
        id: 'output1',
        type: 'OUTPUT',
        position: { x: 0, y: 0 },
        inputs: [false],
        outputs: [],
        output: false,
      },
    ];

    const wires: Wire[] = [
      {
        id: 'w1',
        from: { gateId: 'input1', pinIndex: 0 },
        to: { gateId: 'and1', pinIndex: 0 },
        path: [],
      },
      {
        id: 'w2',
        from: { gateId: 'and1', pinIndex: 0 },
        to: { gateId: 'output1', pinIndex: 0 },
        path: [],
      },
    ];

    const layout = calculateCircuitLayout(gates, wires);

    const inputPos = layout.gatePositions.get('input1');
    const andPos = layout.gatePositions.get('and1');
    const outputPos = layout.gatePositions.get('output1');

    expect(inputPos).toBeDefined();
    expect(andPos).toBeDefined();
    expect(outputPos).toBeDefined();

    // レイヤー間の水平距離が250px（LAYER_SPACING）であることを確認
    expect(andPos!.x - inputPos!.x).toBe(250);
    // OUTPUTゲートは常に最終レイヤーに配置される
    // この場合、INPUT(Layer0)→AND(Layer1)→OUTPUT(Layer2)となるが、
    // OUTPUTは特別扱いで最終レイヤーに配置される可能性がある
    expect(outputPos!.x - inputPos!.x).toBe(750); // 3レイヤー分の距離
  });

  it('カスタムゲートも考慮した配置でゲートが重ならない', () => {
    const gates: Gate[] = [
      {
        id: 'custom1',
        type: 'CUSTOM',
        position: { x: 0, y: 0 },
        inputs: [false, false, false, false], // 4入力のカスタムゲート
        outputs: [false, false], // 2出力
        output: false,
        width: 120, // カスタムゲートの幅
        height: 100, // カスタムゲートの高さ
      },
      {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
    ];

    const wires: Wire[] = [];

    const layout = calculateCircuitLayout(gates, wires);

    const customPos = layout.gatePositions.get('custom1');
    const andPos = layout.gatePositions.get('and1');

    expect(customPos).toBeDefined();
    expect(andPos).toBeDefined();

    // カスタムゲートとANDゲートの間の距離が十分であることを確認
    // 120px（GATE_SPACING）はカスタムゲートの高さ100pxより大きいので重ならない
    expect(Math.abs(andPos!.y - customPos!.y)).toBe(120);
  });

  it('空の回路でもエラーが発生しない', () => {
    const layout = calculateCircuitLayout([], []);

    expect(layout.gatePositions.size).toBe(0);
    expect(layout.boundingBox).toEqual({
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    });
  });

  it('バウンディングボックスが正しく計算される', () => {
    const gates: Gate[] = [
      {
        id: 'gate1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
      {
        id: 'gate2',
        type: 'OR',
        position: { x: 0, y: 0 },
        inputs: [false, false],
        outputs: [false],
        output: false,
      },
    ];

    const layout = calculateCircuitLayout(gates, []);

    // マージン100pxを含むバウンディングボックス
    expect(layout.boundingBox.minX).toBe(0); // 100 - 100
    expect(layout.boundingBox.minY).toBeLessThan(300); // CENTER_Y - spacing/2 - margin
    expect(layout.boundingBox.maxX).toBeGreaterThan(100); // START_X + margin
    expect(layout.boundingBox.maxY).toBeGreaterThan(300); // CENTER_Y + spacing/2 + margin
  });
});