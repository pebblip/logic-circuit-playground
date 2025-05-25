import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import LogicCircuitBuilder from "../LogicCircuitBuilderRefactored";

describe("接続モード終了のテスト", () => {
  let container;
  let svg;
  let createSVGPointMock;
  let matrixTransformMock;

  beforeEach(() => {
    // SVG関連のモック
    createSVGPointMock = vi.fn(() => ({
      x: 0,
      y: 0,
      matrixTransform: matrixTransformMock
    }));
    
    matrixTransformMock = vi.fn(function() {
      return { x: this.x, y: this.y };
    });

    // SVGSVGElementのモック
    global.SVGSVGElement = global.SVGSVGElement || class {};
    global.SVGSVGElement.prototype.createSVGPoint = createSVGPointMock;
    global.SVGSVGElement.prototype.getScreenCTM = vi.fn(() => ({
      inverse: () => ({}),
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
    }));

    const { container: c } = render(<LogicCircuitBuilder />);
    container = c;
    svg = container.querySelector('svg');
  });

  it("ゲート間の接続が完了したら接続モードが終了する", async () => {
    // NOTゲートのボタンを探す（テキストが "NOT" のボタン）
    const notGateButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'NOT'
    );
    expect(notGateButton).toBeTruthy();

    // 2つのゲートを追加
    fireEvent.click(notGateButton); // NOT gate
    fireEvent.click(notGateButton); // Another NOT gate

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates).toHaveLength(2);
    });

    // すべてのゲートを取得
    const gates = container.querySelectorAll('g[data-testid^="gate-"]');
    
    // 最初のゲートの出力端子を探す（NOTゲートの出力は cx="60"）
    const firstGate = gates[0];
    const outputTerminal = firstGate?.querySelector('circle[cx="60"]');
    
    expect(outputTerminal).toBeTruthy();

    // 2番目のゲートの入力端子を探す（NOTゲートの入力は cx="-60"）
    const secondGate = gates[1];
    const inputTerminal = secondGate?.querySelector('circle[cx="-60"]');
    
    expect(inputTerminal).toBeTruthy();

    // 接続開始前：接続線なし
    let connectionLines = container.querySelectorAll('path[stroke-dasharray]');
    expect(connectionLines).toHaveLength(0);

    // 出力端子をクリックして接続開始
    fireEvent.mouseDown(outputTerminal);
    
    // 接続中：波線が表示される
    connectionLines = container.querySelectorAll('path[stroke-dasharray]');
    expect(connectionLines).toHaveLength(1);

    // マウス移動をシミュレート
    fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });

    // まだ接続中：波線が表示されている
    connectionLines = container.querySelectorAll('path[stroke-dasharray]');
    expect(connectionLines).toHaveLength(1);

    // 入力端子でマウスアップして接続完了
    fireEvent.mouseUp(inputTerminal);

    await waitFor(() => {
      // 接続完了後：波線は消えて、実線の接続線のみ
      const dashedLines = container.querySelectorAll('path[stroke-dasharray]');
      expect(dashedLines).toHaveLength(0);
      
      // 実線の接続線が1本存在（strokeが#000または#999）
      const solidLines = container.querySelectorAll('path:not([stroke-dasharray])');
      const connectionLines = Array.from(solidLines).filter(path => {
        const stroke = path.getAttribute('stroke');
        return stroke === '#000' || stroke === '#999';
      });
      expect(connectionLines.length).toBeGreaterThan(0);
    });
  });

  it("接続をキャンセルした場合も接続モードが終了する", async () => {
    // NOTゲートのボタンを探す
    const notGateButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'NOT'
    );
    fireEvent.click(notGateButton);

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates).toHaveLength(1);
    });

    // 出力端子を探す
    const gates = container.querySelectorAll('g[data-testid^="gate-"]');
    const gate = gates[0];
    const outputTerminal = gate?.querySelector('circle[cx="60"]');

    // 接続開始
    fireEvent.mouseDown(outputTerminal);
    
    // 波線が表示される
    let connectionLines = container.querySelectorAll('path[stroke-dasharray]');
    expect(connectionLines).toHaveLength(1);

    // 空白部分でマウスアップ（キャンセル）
    fireEvent.mouseUp(svg, { clientX: 300, clientY: 300 });

    await waitFor(() => {
      // キャンセル後：波線は消える
      const dashedLines = container.querySelectorAll('path[stroke-dasharray]');
      expect(dashedLines).toHaveLength(0);
    });
  });

  it("複数の接続を連続して行えること", async () => {
    // NOTゲートのボタンを探す
    const notGateButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'NOT'
    );
    
    // 3つのゲートを追加
    fireEvent.click(notGateButton);
    fireEvent.click(notGateButton);
    fireEvent.click(notGateButton);

    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates).toHaveLength(3);
    });

    // 1回目の接続
    const gates = container.querySelectorAll('g[data-testid^="gate-"]');
    const gate0 = gates[0];
    const gate0Output = gate0?.querySelector('circle[cx="60"]');
    const gate1 = gates[1];
    const gate1Input = gate1?.querySelector('circle[cx="-60"]');

    fireEvent.mouseDown(gate0Output);
    fireEvent.mouseUp(gate1Input);

    await waitFor(() => {
      const dashedLines = container.querySelectorAll('path[stroke-dasharray]');
      expect(dashedLines).toHaveLength(0);
    });

    // 2回目の接続
    const gates2 = container.querySelectorAll('g[data-testid^="gate-"]');
    const gate1_2 = gates2[1];
    const gate1Output = gate1_2?.querySelector('circle[cx="60"]');
    const gate2 = gates2[2];
    const gate2Input = gate2?.querySelector('circle[cx="-60"]');

    fireEvent.mouseDown(gate1Output);
    
    // 2回目の接続中も波線は1本のみ
    let dashedLines = container.querySelectorAll('path[stroke-dasharray]');
    expect(dashedLines).toHaveLength(1);

    fireEvent.mouseUp(gate2Input);

    await waitFor(() => {
      // 2回目の接続完了後も波線は消える
      const dashedLinesAfter = container.querySelectorAll('path[stroke-dasharray]');
      expect(dashedLinesAfter).toHaveLength(0);
      
      // 実線の接続線が2本存在
      const solidLines = container.querySelectorAll('path:not([stroke-dasharray])');
      const connectionLines = Array.from(solidLines).filter(path => {
        const stroke = path.getAttribute('stroke');
        return stroke === '#000' || stroke === '#999';
      });
      expect(connectionLines.length).toBeGreaterThanOrEqual(2);
    });
  });
});