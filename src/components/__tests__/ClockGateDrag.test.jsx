import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import LogicCircuitBuilder from "../LogicCircuitBuilderRefactored";

describe("CLOCKゲートのドラッグ機能", () => {
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

  it("CLOCKゲートがドラッグ可能であること", async () => {
    // レベル2に切り替え
    const level2Button = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent.includes('Lv2')
    );
    expect(level2Button).toBeTruthy();
    fireEvent.click(level2Button);

    // CLOCKゲートボタンを探す
    await waitFor(() => {
      const clockButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent === 'CLK'
      );
      expect(clockButton).toBeTruthy();
    });

    const clockButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'CLK'
    );
    
    // CLOCKゲートを追加
    fireEvent.click(clockButton);

    // CLOCKゲートが追加されたことを確認
    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates).toHaveLength(1);
    });

    // CLOCKゲートを取得
    const clockGate = container.querySelector('g[data-testid^="gate-"]');
    const initialTransform = clockGate.getAttribute('transform');
    const initialMatch = initialTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    const initialX = parseFloat(initialMatch[1]);
    const initialY = parseFloat(initialMatch[2]);

    console.log('Initial position:', { initialX, initialY });

    // CLOCKゲートの円要素を取得（I/Oゲートは円で表示される）
    const clockCircle = clockGate.querySelector('circle[r="35"]');
    expect(clockCircle).toBeTruthy();

    // ドラッグ開始
    fireEvent.mouseDown(clockCircle, { clientX: initialX, clientY: initialY });

    // マウスを移動
    const newX = initialX + 100;
    const newY = initialY + 50;
    
    // createSVGPointのモックを更新
    createSVGPointMock.mockReturnValue({
      x: newX,
      y: newY,
      matrixTransform: matrixTransformMock
    });

    fireEvent.mouseMove(svg, { clientX: newX, clientY: newY });

    // ドラッグ終了
    fireEvent.mouseUp(svg);

    // 位置が変更されたことを確認
    await waitFor(() => {
      const updatedGate = container.querySelector('g[data-testid^="gate-"]');
      const updatedTransform = updatedGate.getAttribute('transform');
      const updatedMatch = updatedTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      const updatedX = parseFloat(updatedMatch[1]);
      const updatedY = parseFloat(updatedMatch[2]);

      console.log('Updated position:', { updatedX, updatedY });
      
      // 位置が変更されていることを確認
      expect(updatedX).not.toBe(initialX);
      expect(updatedY).not.toBe(initialY);
      
      // 期待される位置に近いことを確認（完全一致ではなく、ある程度の差があることを確認）
      expect(Math.abs(updatedX - newX)).toBeLessThan(10);
      expect(Math.abs(updatedY - newY)).toBeLessThan(10);
    });
  });

  it("INPUTゲートとCLOCKゲートの両方がドラッグ可能であること", async () => {
    // INPUTゲートを追加
    const inputButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'IN'
    );
    fireEvent.click(inputButton);

    // レベル2に切り替え
    const level2Button = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent.includes('Lv2')
    );
    fireEvent.click(level2Button);

    // CLOCKゲートを追加
    await waitFor(() => {
      const clockButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent === 'CLK'
      );
      expect(clockButton).toBeTruthy();
    });

    const clockButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'CLK'
    );
    fireEvent.click(clockButton);

    // 2つのゲートが追加されたことを確認
    await waitFor(() => {
      const gates = container.querySelectorAll('g[data-testid^="gate-"]');
      expect(gates).toHaveLength(2);
    });

    // 各ゲートがドラッグ可能であることを確認
    const gates = container.querySelectorAll('g[data-testid^="gate-"]');
    
    for (const gate of gates) {
      const initialTransform = gate.getAttribute('transform');
      const circle = gate.querySelector('circle[r="35"]');
      expect(circle).toBeTruthy();
      
      // ドラッグシミュレーション
      fireEvent.mouseDown(circle);
      
      createSVGPointMock.mockReturnValue({
        x: 500,
        y: 300,
        matrixTransform: matrixTransformMock
      });
      
      fireEvent.mouseMove(svg, { clientX: 500, clientY: 300 });
      fireEvent.mouseUp(svg);
      
      // 位置が変更されたことを確認
      await waitFor(() => {
        const updatedTransform = gate.getAttribute('transform');
        expect(updatedTransform).not.toBe(initialTransform);
      });
    }
  });
});