import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import UltraModernCircuitWithViewModel from '../../../../app/UltraModernCircuitWithViewModel';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';

describe('実際のワイヤー接続問題の再現テスト', () => {
  it('実際のコンポーネントでピン間の接続ができない問題', async () => {
    // ViewModelのモックを作成して接続を監視
    const viewModel = new UltraModernCircuitViewModel();
    const addConnectionSpy = vi.spyOn(viewModel, 'addConnection');
    
    // コンポーネントをレンダリング
    const { container } = render(<UltraModernCircuitWithViewModel />);
    
    // 直接ViewModelにゲートを追加（UIを介さない）
    const gate1 = viewModel.addGate('INPUT', { x: 100, y: 100 });
    const gate2 = viewModel.addGate('OUTPUT', { x: 300, y: 100 });
    
    // ViewModelの変更を反映させるため少し待機
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // ピンを探す
    const circles = container.querySelectorAll('circle');
    let outputPin: SVGCircleElement | null = null;
    let inputPin: SVGCircleElement | null = null;
    
    // 大きな当たり判定（r=12）のピンを探す
    circles.forEach(circle => {
      const r = parseFloat(circle.getAttribute('r') || '0');
      const cx = parseFloat(circle.getAttribute('cx') || '0');
      
      if (r === 12) {
        // gate1の出力ピン（右側）
        if (cx > 0 && !outputPin) {
          const parent = circle.closest('g[data-testid*="gate-"]');
          if (parent?.getAttribute('data-testid')?.includes(gate1.id)) {
            outputPin = circle as SVGCircleElement;
          }
        }
        // gate2の入力ピン（左側）
        if (cx < 0 && !inputPin) {
          const parent = circle.closest('g[data-testid*="gate-"]');
          if (parent?.getAttribute('data-testid')?.includes(gate2.id)) {
            inputPin = circle as SVGCircleElement;
          }
        }
      }
    });
    
    console.log('Found output pin:', !!outputPin);
    console.log('Found input pin:', !!inputPin);
    
    if (outputPin && inputPin) {
      // ピンからピンへのドラッグ操作
      fireEvent.mouseDown(outputPin);
      
      // マウスを移動
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      
      // 別のピンでマウスアップ
      fireEvent.mouseUp(inputPin);
      
      // 期待: addConnectionが呼ばれる
      // 実際: SVGのonMouseUpでキャンセルされて呼ばれない
      expect(addConnectionSpy).toHaveBeenCalled();
    } else {
      // そもそもピンが見つからない場合
      throw new Error('ピンが見つかりません');
    }
  });

  it('SVGのonMouseUpでワイヤー接続がキャンセルされる', async () => {
    const { container } = render(<UltraModernCircuitWithViewModel />);
    const viewModel = new UltraModernCircuitViewModel();
    
    // ゲートを追加
    viewModel.addGate('INPUT', { x: 100, y: 100 });
    viewModel.addGate('OUTPUT', { x: 300, y: 100 });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // SVG要素を取得
    const svg = container.querySelector('svg');
    const circles = container.querySelectorAll('circle[r="12"]');
    
    if (circles.length >= 2 && svg) {
      // ピンでマウスダウン
      fireEvent.mouseDown(circles[0]);
      
      // SVGでマウスアップ（これが実際のブラウザで起こること）
      fireEvent.mouseUp(svg);
      
      // 描画中のワイヤーがキャンセルされる
      const drawingWire = container.querySelector('line[stroke-dasharray]');
      expect(drawingWire).toBeNull();
    }
  });
});

// 修正案のテスト
describe('ワイヤー接続の修正案', () => {
  it('onMouseEnterでターゲットピンを記録する方式', () => {
    let targetPin: { gateId: string; pinType: string; pinIndex: number } | null = null;
    let drawingWire = false;
    
    const handlePinMouseEnter = (gateId: string, pinType: string, pinIndex: number) => {
      if (drawingWire) {
        targetPin = { gateId, pinType, pinIndex };
      }
    };
    
    const handlePinMouseLeave = () => {
      targetPin = null;
    };
    
    const handleMouseUp = () => {
      if (drawingWire && targetPin) {
        console.log('Connection completed to:', targetPin);
        // ここで接続を作成
      }
      drawingWire = false;
    };
    
    // ワイヤー描画開始
    drawingWire = true;
    
    // ピンにマウスが入る
    handlePinMouseEnter('gate-2', 'input', 0);
    expect(targetPin).toEqual({ gateId: 'gate-2', pinType: 'input', pinIndex: 0 });
    
    // マウスアップ（どこでも）
    handleMouseUp();
    
    // 接続が完了する
    expect(targetPin).toBeTruthy();
  });
});