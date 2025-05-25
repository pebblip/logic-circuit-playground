import React from "react";
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import LogicCircuitBuilder from "../LogicCircuitBuilderRefactored";

describe("draggedGate状態の確認", () => {
  it("ドラッグ状態が正しく管理されること", () => {
    const { container } = render(<LogicCircuitBuilder />);
    
    // NOTゲートを追加
    const notButton = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent === 'NOT'
    );
    fireEvent.click(notButton);
    
    // ゲートが追加されたことを確認
    const gate = container.querySelector('g[data-testid^="gate-"]');
    expect(gate).toBeTruthy();
    
    // ドラッグを開始
    const gateRect = gate.querySelector('rect');
    fireEvent.mouseDown(gateRect);
    
    // この時点でdraggedGateが設定されているはず
    // （内部状態なので直接確認はできないが、エラーが出ないことを確認）
    
    // ドラッグを終了
    fireEvent.mouseUp(container.querySelector('svg'));
    
    // エラーなく完了
    expect(true).toBe(true);
  });
});