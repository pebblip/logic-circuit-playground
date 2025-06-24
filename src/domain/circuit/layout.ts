import type { Gate, Wire } from '../../types/circuit';

export interface LayoutPosition {
  x: number;
  y: number;
  layer: number;
}

export interface CircuitLayout {
  gatePositions: Map<string, LayoutPosition>;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * 回路の美しい自動レイアウトを計算
 * ultrathink設計: シンプルで美しい配置アルゴリズム
 */
export function calculateCircuitLayout(
  gates: Gate[],
  wires: Wire[]
): CircuitLayout {
  if (gates.length === 0) {
    return {
      gatePositions: new Map(),
      boundingBox: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    };
  }

  // 1. グラフ構築: ゲート間の接続関係を分析
  const connections = buildConnectionGraph(gates, wires);

  // 2. レイヤー分け: 入力→出力の段階を決定
  const layers = assignGatesToLayers(gates, connections);

  // 3. 美しい配置計算
  const positions = calculateBeautifulPositions(layers);

  // 4. バウンディングボックス計算
  const boundingBox = calculateBoundingBox(positions);

  return {
    gatePositions: positions,
    boundingBox,
  };
}

/**
 * ゲート間の接続グラフを構築
 */
function buildConnectionGraph(
  gates: Gate[],
  wires: Wire[]
): Map<string, string[]> {
  const connections = new Map<string, string[]>();

  // 初期化
  gates.forEach(gate => {
    connections.set(gate.id, []);
  });

  // ワイヤーから接続関係を構築
  wires.forEach(wire => {
    const fromGate = wire.from.gateId;
    const toGate = wire.to.gateId;

    const fromConnections = connections.get(fromGate) || [];
    fromConnections.push(toGate);
    connections.set(fromGate, fromConnections);
  });

  return connections;
}

/**
 * ゲートをレイヤー（段階）に分類
 * ultrathink: 論理的な流れを視覚的に表現
 */
function assignGatesToLayers(
  gates: Gate[],
  connections: Map<string, string[]>
): Gate[][] {
  const layers: Gate[][] = [];
  const processed = new Set<string>();

  // レイヤー0: 入力ゲート（INPUT, CLOCK）
  const inputGates = gates.filter(
    g => g.type === 'INPUT' || g.type === 'CLOCK'
  );
  if (inputGates.length > 0) {
    layers.push(inputGates);
    inputGates.forEach(g => processed.add(g.id));
  }

  // 中間レイヤー: トポロジカルソートで段階的に配置
  let hasChanges = true;
  while (hasChanges && processed.size < gates.length) {
    hasChanges = false;
    const currentLayer: Gate[] = [];

    gates.forEach(gate => {
      if (processed.has(gate.id)) return;
      if (gate.type === 'OUTPUT') return; // 出力は最後

      // このゲートへの入力がすべて処理済みかチェック
      const hasUnprocessedInputs = gates.some(inputGate => {
        const inputConnections = connections.get(inputGate.id) || [];
        return (
          inputConnections.includes(gate.id) && !processed.has(inputGate.id)
        );
      });

      if (!hasUnprocessedInputs) {
        currentLayer.push(gate);
        processed.add(gate.id);
        hasChanges = true;
      }
    });

    if (currentLayer.length > 0) {
      layers.push(currentLayer);
    }
  }

  // 最終レイヤー: 出力ゲート
  const outputGates = gates.filter(
    g => g.type === 'OUTPUT' && !processed.has(g.id)
  );
  if (outputGates.length > 0) {
    layers.push(outputGates);
  }

  // 未処理のゲートがあれば最後に追加
  const unprocessedGates = gates.filter(g => !processed.has(g.id));
  if (unprocessedGates.length > 0) {
    layers.push(unprocessedGates);
  }

  return layers;
}

/**
 * 美しい配置を計算
 * ultrathink: 黄金比と視覚的バランスを考慮
 */
function calculateBeautifulPositions(
  layers: Gate[][]
): Map<string, LayoutPosition> {
  const positions = new Map<string, LayoutPosition>();

  if (layers.length === 0) return positions;

  // 基本パラメータ
  const LAYER_SPACING = 250; // レイヤー間の距離（ゲート幅100px + 余白150px）
  const GATE_SPACING = 120; // ゲート間の距離（ゲート高さ60px + 余白60px）
  const START_X = 100; // 開始X座標
  const CENTER_Y = 300; // 中央Y座標

  layers.forEach((layer, layerIndex) => {
    const x = START_X + layerIndex * LAYER_SPACING;
    const totalHeight = (layer.length - 1) * GATE_SPACING;
    const startY = CENTER_Y - totalHeight / 2;

    // 各レイヤー内でゲートを縦に配置
    layer.forEach((gate, gateIndex) => {
      const y = startY + gateIndex * GATE_SPACING;

      positions.set(gate.id, {
        x,
        y,
        layer: layerIndex,
      });
    });
  });

  return positions;
}

/**
 * バウンディングボックスを計算
 */
function calculateBoundingBox(positions: Map<string, LayoutPosition>) {
  if (positions.size === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  positions.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });

  // マージンを追加
  const MARGIN = 100;
  return {
    minX: minX - MARGIN,
    maxX: maxX + MARGIN,
    minY: minY - MARGIN,
    maxY: maxY + MARGIN,
  };
}

/**
 * 回路を美しくアニメーション付きで整形
 */
export function formatCircuitWithAnimation(
  gates: Gate[],
  wires: Wire[],
  onGateMove: (gateId: string, position: { x: number; y: number }) => void
): Promise<void> {
  return new Promise(resolve => {
    const layout = calculateCircuitLayout(gates, wires);

    // アニメーション用のパラメータ
    const ANIMATION_DURATION = 1000; // 1秒
    const FRAME_RATE = 60;
    const TOTAL_FRAMES = (ANIMATION_DURATION / 1000) * FRAME_RATE;

    const startPositions = new Map(
      gates.map(g => [g.id, { x: g.position.x, y: g.position.y }])
    );

    let currentFrame = 0;

    const animate = () => {
      const progress = currentFrame / TOTAL_FRAMES;
      // イージング関数（ease-out）
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      gates.forEach(gate => {
        const startPos = startPositions.get(gate.id);
        const targetPos = layout.gatePositions.get(gate.id);

        if (startPos && targetPos) {
          const currentX =
            startPos.x + (targetPos.x - startPos.x) * easedProgress;
          const currentY =
            startPos.y + (targetPos.y - startPos.y) * easedProgress;

          onGateMove(gate.id, { x: currentX, y: currentY });
        }
      });

      currentFrame++;

      if (currentFrame <= TOTAL_FRAMES) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}
