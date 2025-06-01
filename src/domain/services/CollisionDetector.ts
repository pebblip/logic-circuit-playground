import { BaseGate } from '../../entities/gates/BaseGate';
import { Position } from './GatePlacement';
import { CoordinateTransform } from './CoordinateTransform';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * 統一された当たり判定システム
 * - ゲート同士の衝突
 * - ピンのクリック判定
 * - マウス/タッチイベントの処理
 */
export class CollisionDetector {
  private static instance: CollisionDetector;
  private coordinateTransform: CoordinateTransform;
  
  // ゲートサイズ定数
  private static readonly GATE_WIDTH = 70;
  private static readonly GATE_HEIGHT = 50;
  
  // ピン定数
  private static readonly PIN_RADIUS = 6;
  private static readonly PIN_HIT_RADIUS = 20; // デスクトップ
  private static readonly PIN_HIT_RADIUS_MOBILE = 30; // モバイル

  private constructor() {
    this.coordinateTransform = CoordinateTransform.getInstance();
  }

  static getInstance(): CollisionDetector {
    if (!CollisionDetector.instance) {
      CollisionDetector.instance = new CollisionDetector();
    }
    return CollisionDetector.instance;
  }

  /**
   * 矩形同士の衝突判定
   */
  isRectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  /**
   * 点と矩形の衝突判定
   */
  isPointInRectangle(point: Position, rect: Rectangle): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
  }

  /**
   * 点と円の衝突判定
   */
  isPointInCircle(point: Position, circle: Circle): boolean {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
  }

  /**
   * ゲート同士の衝突判定
   */
  isGateCollision(gate1: BaseGate, gate2: BaseGate): boolean {
    const rect1 = this.getGateRectangle(gate1);
    const rect2 = this.getGateRectangle(gate2);
    return this.isRectangleCollision(rect1, rect2);
  }

  /**
   * ゲートの矩形領域を取得
   */
  getGateRectangle(gate: BaseGate): Rectangle {
    return {
      x: gate.position.x - CollisionDetector.GATE_WIDTH / 2,
      y: gate.position.y - CollisionDetector.GATE_HEIGHT / 2,
      width: CollisionDetector.GATE_WIDTH,
      height: CollisionDetector.GATE_HEIGHT
    };
  }

  /**
   * マウス/タッチ位置がゲート上にあるかチェック
   */
  isPointOnGate(point: Position, gate: BaseGate): boolean {
    const rect = this.getGateRectangle(gate);
    return this.isPointInRectangle(point, rect);
  }

  /**
   * マウス/タッチ位置でピンを検索
   */
  findPinAtPosition(point: Position, gates: BaseGate[], isMobile: boolean = false): {
    gate: BaseGate;
    pinIndex: number;
    pinType: 'input' | 'output';
  } | null {
    const hitRadius = isMobile ? 
      CollisionDetector.PIN_HIT_RADIUS_MOBILE : 
      CollisionDetector.PIN_HIT_RADIUS;

    for (const gate of gates) {
      // immerプロキシ対応
      const inputPins = (gate as any)._inputs || gate.inputPins || [];
      const outputPins = (gate as any)._outputs || gate.outputPins || [];
      
      // 入力ピンをチェック
      for (let i = 0; i < inputPins.length; i++) {
        const pinPosition = this.calculateInputPinPosition(gate, i);
        const circle: Circle = {
          x: pinPosition.x,
          y: pinPosition.y,
          radius: hitRadius
        };

        if (this.isPointInCircle(point, circle)) {
          return {
            gate,
            pinIndex: i,
            pinType: 'input'
          };
        }
      }

      // 出力ピンをチェック
      for (let i = 0; i < outputPins.length; i++) {
        const pinPosition = this.calculateOutputPinPosition(gate, i);
        const circle: Circle = {
          x: pinPosition.x,
          y: pinPosition.y,
          radius: hitRadius
        };

        if (this.isPointInCircle(point, circle)) {
          return {
            gate,
            pinIndex: i,
            pinType: 'output'
          };
        }
      }
    }

    return null;
  }

  /**
   * 入力ピンの絶対位置を計算
   */
  calculateInputPinPosition(gate: BaseGate, pinIndex: number): Position {
    // immerプロキシ対応: プライベートプロパティに直接アクセス
    const inputPins = (gate as any)._inputs || gate.inputPins || [];
    const pinCount = inputPins.length;
    const pinSpacing = CollisionDetector.GATE_HEIGHT / (pinCount + 1);
    return {
      x: gate.position.x - CollisionDetector.GATE_WIDTH / 2,
      y: gate.position.y - CollisionDetector.GATE_HEIGHT / 2 + pinSpacing * (pinIndex + 1)
    };
  }

  /**
   * 出力ピンの絶対位置を計算
   */
  calculateOutputPinPosition(gate: BaseGate, pinIndex: number): Position {
    // immerプロキシ対応: プライベートプロパティに直接アクセス
    const outputPins = (gate as any)._outputs || gate.outputPins || [];
    const pinCount = outputPins.length;
    const pinSpacing = CollisionDetector.GATE_HEIGHT / (pinCount + 1);
    return {
      x: gate.position.x + CollisionDetector.GATE_WIDTH / 2,
      y: gate.position.y - CollisionDetector.GATE_HEIGHT / 2 + pinSpacing * (pinIndex + 1)
    };
  }

  /**
   * ゲートクリック判定（ピン以外の部分）
   */
  isGateBodyClicked(point: Position, gate: BaseGate, isMobile: boolean = false): boolean {
    // ゲート全体の領域内かチェック
    if (!this.isPointOnGate(point, gate)) {
      return false;
    }

    // ピンエリアを除外
    const hitRadius = isMobile ? 
      CollisionDetector.PIN_HIT_RADIUS_MOBILE : 
      CollisionDetector.PIN_HIT_RADIUS;

    // immerプロキシ対応
    const inputPins = (gate as any)._inputs || gate.inputPins || [];
    const outputPins = (gate as any)._outputs || gate.outputPins || [];
    
    // 入力ピンエリアをチェック
    for (let i = 0; i < inputPins.length; i++) {
      const pinPosition = this.calculateInputPinPosition(gate, i);
      if (this.isPointInCircle(point, { ...pinPosition, radius: hitRadius })) {
        return false; // ピンエリア内のクリック
      }
    }

    // 出力ピンエリアをチェック
    for (let i = 0; i < outputPins.length; i++) {
      const pinPosition = this.calculateOutputPinPosition(gate, i);
      if (this.isPointInCircle(point, { ...pinPosition, radius: hitRadius })) {
        return false; // ピンエリア内のクリック
      }
    }

    return true; // ゲート本体のクリック
  }

  /**
   * キャンバス座標をSVG座標に変換（高精度版）
   */
  canvasToSvgCoordinates(canvasPoint: Position, svgElement: SVGSVGElement): Position {
    return this.coordinateTransform.canvasToSvg(canvasPoint, svgElement);
  }

  /**
   * SVG座標をキャンバス座標に変換（高精度版）
   */
  svgToCanvasCoordinates(svgPoint: Position, svgElement: SVGSVGElement): Position {
    return this.coordinateTransform.svgToCanvas(svgPoint, svgElement);
  }

  /**
   * ドラッグ専用の座標変換ヘルパーを作成
   */
  createDragHelper(svgElement: SVGSVGElement) {
    return this.coordinateTransform.createDragTransform(svgElement);
  }

  /**
   * 2点間の距離を計算
   */
  calculateDistance(p1: Position, p2: Position): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 最も近いゲートを検索
   */
  findNearestGate(point: Position, gates: BaseGate[], maxDistance: number = 100): BaseGate | null {
    let nearestGate: BaseGate | null = null;
    let minDistance = maxDistance;

    for (const gate of gates) {
      const distance = this.calculateDistance(point, gate.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestGate = gate;
      }
    }

    return nearestGate;
  }

  /**
   * デバッグ用：当たり判定を可視化
   */
  drawDebugOverlay(svgElement: SVGSVGElement, gates: BaseGate[]): void {
    // 既存のデバッグ要素を削除
    const existingDebug = svgElement.querySelectorAll('.debug-collision');
    existingDebug.forEach(el => el.remove());

    gates.forEach(gate => {
      // ゲート矩形を描画
      const gateRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const rect = this.getGateRectangle(gate);
      
      gateRect.setAttribute('x', rect.x.toString());
      gateRect.setAttribute('y', rect.y.toString());
      gateRect.setAttribute('width', rect.width.toString());
      gateRect.setAttribute('height', rect.height.toString());
      gateRect.setAttribute('fill', 'none');
      gateRect.setAttribute('stroke', 'red');
      gateRect.setAttribute('stroke-width', '1');
      gateRect.setAttribute('class', 'debug-collision');
      
      svgElement.appendChild(gateRect);

      // ピンの当たり判定円を描画
      [...gate.inputPins, ...gate.outputPins].forEach((_, index) => {
        const pinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const isInput = index < gate.inputPins.length;
        const pinIndex = isInput ? index : index - gate.inputPins.length;
        const pinPos = isInput ? 
          this.calculateInputPinPosition(gate, pinIndex) :
          this.calculateOutputPinPosition(gate, pinIndex);
        
        pinCircle.setAttribute('cx', pinPos.x.toString());
        pinCircle.setAttribute('cy', pinPos.y.toString());
        pinCircle.setAttribute('r', CollisionDetector.PIN_HIT_RADIUS.toString());
        pinCircle.setAttribute('fill', 'none');
        pinCircle.setAttribute('stroke', 'blue');
        pinCircle.setAttribute('stroke-width', '1');
        pinCircle.setAttribute('class', 'debug-collision');
        
        svgElement.appendChild(pinCircle);
      });
    });
  }
}