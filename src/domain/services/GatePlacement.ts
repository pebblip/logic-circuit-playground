import { BaseGate } from '../../entities/gates/BaseGate';

export interface Position {
  x: number;
  y: number;
}

export interface PlacementOptions {
  gridSize?: number;
  spacing?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * ゲート配置の最適化を行うサービス
 * - グリッドスナップ
 * - 衝突回避
 * - 自動配置アルゴリズム
 */
export class GatePlacement {
  private static readonly DEFAULT_GRID_SIZE = 20;
  private static readonly DEFAULT_SPACING = 120;
  private static readonly INITIAL_OFFSET = { x: 100, y: 100 };
  private static readonly GATE_WIDTH = 70;
  private static readonly GATE_HEIGHT = 50;
  private static readonly EDGE_MARGIN = 50;

  private gridSize: number;
  private spacing: number;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(options: PlacementOptions = {}) {
    this.gridSize = options.gridSize ?? GatePlacement.DEFAULT_GRID_SIZE;
    this.spacing = options.spacing ?? GatePlacement.DEFAULT_SPACING;
    this.canvasWidth = options.canvasWidth ?? 1200;
    this.canvasHeight = options.canvasHeight ?? 800;
  }

  /**
   * 新しいゲートの最適な配置位置を計算
   */
  calculateOptimalPosition(existingGates: BaseGate[]): Position {
    if (existingGates.length === 0) {
      return this.snapToGrid(GatePlacement.INITIAL_OFFSET);
    }

    // 既存ゲートの配置状況を分析
    const positions = this.analyzeExistingPositions(existingGates);
    
    // 複数の配置候補を生成
    const candidates = this.generateCandidatePositions(positions);
    
    // 最適な位置を選択
    const optimalPosition = this.selectBestPosition(candidates, existingGates);
    
    return this.snapToGrid(optimalPosition);
  }

  /**
   * 指定位置をグリッドにスナップ
   */
  snapToGrid(position: Position): Position {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize
    };
  }

  /**
   * 既存ゲートの配置パターンを分析
   */
  private analyzeExistingPositions(gates: BaseGate[]): {
    rightmost: Position;
    bottommost: Position;
    center: Position;
    rows: Map<number, BaseGate[]>;
  } {
    let rightmost = GatePlacement.INITIAL_OFFSET;
    let bottommost = GatePlacement.INITIAL_OFFSET;
    let sumX = 0, sumY = 0;

    // 行ごとにゲートをグループ化
    const rows = new Map<number, BaseGate[]>();

    gates.forEach(gate => {
      const y = this.snapToGrid({ x: 0, y: gate.position.y }).y;
      
      if (!rows.has(y)) {
        rows.set(y, []);
      }
      rows.get(y)!.push(gate);

      if (gate.position.x > rightmost.x) {
        rightmost = { ...gate.position };
      }
      if (gate.position.y > bottommost.y) {
        bottommost = { ...gate.position };
      }
      sumX += gate.position.x;
      sumY += gate.position.y;
    });

    return {
      rightmost,
      bottommost,
      center: { x: sumX / gates.length, y: sumY / gates.length },
      rows
    };
  }

  /**
   * 配置候補を生成
   */
  private generateCandidatePositions(analysis: ReturnType<typeof this.analyzeExistingPositions>): Position[] {
    const candidates: Position[] = [];

    // 1. 最右端の右側に配置
    candidates.push({
      x: analysis.rightmost.x + this.spacing,
      y: analysis.rightmost.y
    });

    // 2. 現在の行で空いている位置を探す
    analysis.rows.forEach((gatesInRow, y) => {
      const sortedGates = [...gatesInRow].sort((a, b) => a.position.x - b.position.x);
      
      // 行の左端に配置
      if (sortedGates[0].position.x > GatePlacement.INITIAL_OFFSET.x + this.spacing) {
        candidates.push({
          x: GatePlacement.INITIAL_OFFSET.x,
          y
        });
      }

      // ゲート間の隙間を探す
      for (let i = 0; i < sortedGates.length - 1; i++) {
        const gap = sortedGates[i + 1].position.x - sortedGates[i].position.x;
        if (gap > this.spacing + GatePlacement.GATE_WIDTH) {
          candidates.push({
            x: sortedGates[i].position.x + this.spacing,
            y
          });
        }
      }
    });

    // 3. 新しい行に配置
    const newRowY = analysis.bottommost.y + this.spacing;
    if (newRowY + GatePlacement.GATE_HEIGHT + GatePlacement.EDGE_MARGIN < this.canvasHeight) {
      candidates.push({
        x: GatePlacement.INITIAL_OFFSET.x,
        y: newRowY
      });
    }

    // 4. 画面中央付近の空いている位置
    const centerY = this.snapToGrid({ x: 0, y: analysis.center.y }).y;
    if (!analysis.rows.has(centerY)) {
      candidates.push({
        x: GatePlacement.INITIAL_OFFSET.x,
        y: centerY
      });
    }

    return candidates;
  }

  /**
   * 最適な配置位置を選択
   */
  private selectBestPosition(candidates: Position[], existingGates: BaseGate[]): Position {
    if (candidates.length === 0) {
      return GatePlacement.INITIAL_OFFSET;
    }

    // 各候補のスコアを計算
    const scoredCandidates = candidates.map(candidate => {
      const score = this.calculatePositionScore(candidate, existingGates);
      return { position: candidate, score };
    });

    // スコアが最も高い位置を選択
    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0].position;
  }

  /**
   * 配置位置のスコアを計算
   * スコアが高いほど良い位置
   */
  private calculatePositionScore(position: Position, existingGates: BaseGate[]): number {
    let score = 100;

    // キャンバス内に収まっているか
    if (position.x < GatePlacement.EDGE_MARGIN || 
        position.x > this.canvasWidth - GatePlacement.GATE_WIDTH - GatePlacement.EDGE_MARGIN) {
      score -= 50;
    }
    if (position.y < GatePlacement.EDGE_MARGIN || 
        position.y > this.canvasHeight - GatePlacement.GATE_HEIGHT - GatePlacement.EDGE_MARGIN) {
      score -= 50;
    }

    // 他のゲートとの衝突チェック
    for (const gate of existingGates) {
      const distance = this.calculateDistance(position, gate.position);
      
      // 衝突している場合
      if (distance < GatePlacement.GATE_WIDTH) {
        return -1000; // 配置不可
      }
      
      // 近すぎる場合はスコアを下げる
      if (distance < this.spacing) {
        score -= (this.spacing - distance) / 2;
      }
    }

    // 左上に近いほど高スコア（整理された配置）
    score -= (position.x + position.y) / 100;

    return score;
  }

  /**
   * 2点間の距離を計算
   */
  private calculateDistance(p1: Position, p2: Position): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * ゲートが重なっているかチェック
   */
  checkCollision(position: Position, existingGates: BaseGate[], excludeGateId?: string): boolean {
    for (const gate of existingGates) {
      if (gate.id === excludeGateId) continue;

      const dx = Math.abs(position.x - gate.position.x);
      const dy = Math.abs(position.y - gate.position.y);

      if (dx < GatePlacement.GATE_WIDTH && dy < GatePlacement.GATE_HEIGHT) {
        return true;
      }
    }
    return false;
  }

  /**
   * ドラッグ中の位置を調整（衝突回避）
   */
  adjustDragPosition(position: Position, existingGates: BaseGate[], draggedGateId: string): Position {
    const snappedPosition = this.snapToGrid(position);
    
    // 衝突がない場合はそのまま返す
    if (!this.checkCollision(snappedPosition, existingGates, draggedGateId)) {
      return snappedPosition;
    }

    // 近くの空いている位置を探す
    const offsets = [
      { x: 0, y: -this.spacing },   // 上
      { x: this.spacing, y: 0 },    // 右
      { x: 0, y: this.spacing },    // 下
      { x: -this.spacing, y: 0 },   // 左
    ];

    for (const offset of offsets) {
      const adjustedPosition = {
        x: snappedPosition.x + offset.x,
        y: snappedPosition.y + offset.y
      };

      if (!this.checkCollision(adjustedPosition, existingGates, draggedGateId)) {
        return adjustedPosition;
      }
    }

    // どこも空いていない場合は元の位置
    return snappedPosition;
  }
}