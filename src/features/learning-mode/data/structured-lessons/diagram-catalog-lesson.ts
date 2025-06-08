import type { StructuredLesson } from '../../../../types/lesson-content';

/**
 * SVG図表カタログ - すべての図表タイプを一覧表示
 * 各レッスンで使用する図表の品質を事前に確認できます
 */
export const diagramCatalogLesson: StructuredLesson = {
  id: 'diagram-catalog',
  title: '📊 SVG図表カタログ',
  description: 'すべてのレッスンで使用する図表タイプの一覧',
  objective: '各種図表の表示品質を確認し、ASCIIアートからの移行を検証する',
  difficulty: 'beginner',
  prerequisites: [],
  estimatedMinutes: 10,
  availableGates: [],
  steps: [
    {
      id: 'gate-symbols',
      instruction: '【1. ゲート記号】基本論理ゲートのシンボル',
      content: [
        {
          type: 'heading',
          text: '📐 基本ゲート記号',
        },
        {
          type: 'text',
          text: '各ゲートの標準的な回路図記号です。',
        },
        {
          type: 'diagram',
          diagramType: 'gate-symbol',
          gateType: 'AND',
          title: 'ANDゲート',
        },
        {
          type: 'diagram',
          diagramType: 'gate-symbol',
          gateType: 'OR',
          title: 'ORゲート',
        },
        {
          type: 'diagram',
          diagramType: 'gate-symbol',
          gateType: 'NOT',
          title: 'NOTゲート（インバータ）',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'XORゲート',
          customSvg: `<svg viewBox="0 0 200 100" class="circuit-diagram">
            <path d="M 50 20 Q 70 50 50 80 L 55 80 Q 80 50 55 20 Z M 55 20 L 100 20 Q 130 50 100 80 L 55 80" 
                  fill="#2a2a2a" stroke="#00ff88" stroke-width="2" />
            <text x="75" y="55" text-anchor="middle" fill="#fff" font-size="14">XOR</text>
            <circle cx="50" cy="35" r="3" fill="#00ff88" />
            <circle cx="50" cy="65" r="3" fill="#00ff88" />
            <circle cx="130" cy="50" r="3" fill="#00ff88" />
          </svg>`,
        },
      ],
    },
    {
      id: 'circuit-connections',
      instruction: '【2. 回路接続図】基本的な回路の配線',
      content: [
        {
          type: 'heading',
          text: '🔌 シンプルな接続',
        },
        {
          type: 'diagram',
          diagramType: 'simple-connection',
          title: '基本接続（入力→出力）',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: '2入力ANDゲート回路',
          customSvg: `<svg viewBox="0 0 500 150" class="circuit-diagram">
            <!-- 入力1 -->
            <rect x="20" y="30" width="80" height="40" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="14">入力1</text>
            <circle cx="100" cy="50" r="4" fill="#00ff88" />
            
            <!-- 入力2 -->
            <rect x="20" y="80" width="80" height="40" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="60" y="105" text-anchor="middle" fill="#fff" font-size="14">入力2</text>
            <circle cx="100" cy="100" r="4" fill="#00ff88" />
            
            <!-- 配線 -->
            <line x1="100" y1="50" x2="200" y2="60" stroke="#00ff88" stroke-width="2" />
            <line x1="100" y1="100" x2="200" y2="90" stroke="#00ff88" stroke-width="2" />
            
            <!-- ANDゲート -->
            <g transform="translate(200, 50)">
              <path d="M 0 10 L 50 10 Q 80 25 50 40 L 0 40 Z" 
                    fill="#2a2a2a" stroke="#00ff88" stroke-width="2" />
              <text x="25" y="30" text-anchor="middle" fill="#fff" font-size="12">AND</text>
              <circle cx="0" cy="20" r="3" fill="#00ff88" />
              <circle cx="0" cy="30" r="3" fill="#00ff88" />
              <circle cx="80" cy="25" r="3" fill="#00ff88" />
            </g>
            
            <!-- 出力配線 -->
            <line x1="280" y1="75" x2="380" y2="75" stroke="#00ff88" stroke-width="2" />
            
            <!-- 出力 -->
            <circle cx="380" cy="75" r="4" fill="#00ff88" />
            <rect x="380" y="55" width="80" height="40" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="420" y="80" text-anchor="middle" fill="#fff" font-size="14">出力</text>
          </svg>`,
        },
      ],
    },
    {
      id: 'complex-circuits',
      instruction: '【3. 複合回路】より複雑な回路構成',
      content: [
        {
          type: 'heading',
          text: '🔧 半加算器の構成',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: '半加算器（Half Adder）',
          customSvg: `<svg viewBox="0 0 600 250" class="circuit-diagram">
            <!-- 入力A -->
            <text x="30" y="60" fill="#fff" font-size="14">A</text>
            <circle cx="50" cy="55" r="4" fill="#00ff88" />
            <line x1="50" y1="55" x2="100" y2="55" stroke="#00ff88" stroke-width="2" />
            <line x1="100" y1="55" x2="100" y2="100" stroke="#00ff88" stroke-width="2" />
            <line x1="100" y1="55" x2="200" y2="55" stroke="#00ff88" stroke-width="2" />
            
            <!-- 入力B -->
            <text x="30" y="160" fill="#fff" font-size="14">B</text>
            <circle cx="50" cy="155" r="4" fill="#00ff88" />
            <line x1="50" y1="155" x2="150" y2="155" stroke="#00ff88" stroke-width="2" />
            <line x1="150" y1="155" x2="150" y2="110" stroke="#00ff88" stroke-width="2" />
            <line x1="150" y1="155" x2="200" y2="155" stroke="#00ff88" stroke-width="2" />
            
            <!-- XORゲート（Sum） -->
            <g transform="translate(200, 40)">
              <path d="M 0 0 Q 20 30 0 60 L 5 60 Q 25 30 5 0 Z M 5 0 L 50 0 Q 80 30 50 60 L 5 60" 
                    fill="#2a2a2a" stroke="#00ff88" stroke-width="2" />
              <text x="25" y="35" text-anchor="middle" fill="#fff" font-size="12">XOR</text>
              <circle cx="0" cy="15" r="3" fill="#00ff88" />
              <circle cx="0" cy="45" r="3" fill="#00ff88" />
              <circle cx="80" cy="30" r="3" fill="#00ff88" />
            </g>
            
            <!-- ANDゲート（Carry） -->
            <g transform="translate(200, 140)">
              <path d="M 0 0 L 50 0 Q 80 30 50 60 L 0 60 Z" 
                    fill="#2a2a2a" stroke="#00ff88" stroke-width="2" />
              <text x="25" y="35" text-anchor="middle" fill="#fff" font-size="12">AND</text>
              <circle cx="0" cy="15" r="3" fill="#00ff88" />
              <circle cx="0" cy="45" r="3" fill="#00ff88" />
              <circle cx="80" cy="30" r="3" fill="#00ff88" />
            </g>
            
            <!-- 配線調整 -->
            <line x1="100" y1="100" x2="200" y2="100" stroke="#00ff88" stroke-width="2" />
            <line x1="150" y1="110" x2="200" y2="110" stroke="#00ff88" stroke-width="2" />
            
            <!-- 出力 -->
            <line x1="280" y1="70" x2="380" y2="70" stroke="#00ff88" stroke-width="2" />
            <line x1="280" y1="170" x2="380" y2="170" stroke="#00ff88" stroke-width="2" />
            
            <text x="400" y="75" fill="#fff" font-size="14">Sum (S)</text>
            <circle cx="380" cy="70" r="4" fill="#00ff88" />
            
            <text x="400" y="175" fill="#fff" font-size="14">Carry (C)</text>
            <circle cx="380" cy="170" r="4" fill="#00ff88" />
          </svg>`,
          caption: 'XORゲートで和を、ANDゲートで桁上がりを計算',
        },
      ],
    },
    {
      id: 'electrical-analogies',
      instruction: '【4. 電気回路アナロジー】論理ゲートの電気的意味',
      content: [
        {
          type: 'heading',
          text: '⚡ 電気回路での表現',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'ANDゲート = 直列接続',
          customSvg: `<svg viewBox="0 0 400 150" class="circuit-diagram">
            <text x="20" y="30" fill="#fff" font-size="14">電源</text>
            <line x1="50" y1="75" x2="100" y2="75" stroke="#00ff88" stroke-width="2" />
            
            <!-- スイッチA -->
            <g transform="translate(100, 75)">
              <circle cx="0" cy="0" r="3" fill="#00ff88" />
              <line x1="0" y1="0" x2="30" y2="-20" stroke="#00ff88" stroke-width="2" />
              <circle cx="40" cy="0" r="3" fill="#00ff88" />
              <text x="20" y="-25" text-anchor="middle" fill="#fff" font-size="12">SW A</text>
            </g>
            
            <line x1="140" y1="75" x2="200" y2="75" stroke="#00ff88" stroke-width="2" />
            
            <!-- スイッチB -->
            <g transform="translate(200, 75)">
              <circle cx="0" cy="0" r="3" fill="#00ff88" />
              <line x1="0" y1="0" x2="30" y2="-20" stroke="#00ff88" stroke-width="2" />
              <circle cx="40" cy="0" r="3" fill="#00ff88" />
              <text x="20" y="-25" text-anchor="middle" fill="#fff" font-size="12">SW B</text>
            </g>
            
            <line x1="240" y1="75" x2="320" y2="75" stroke="#00ff88" stroke-width="2" />
            
            <!-- ランプ -->
            <circle cx="340" cy="75" r="20" fill="none" stroke="#00ff88" stroke-width="2" />
            <text x="340" y="80" text-anchor="middle" fill="#fff" font-size="16">💡</text>
            
            <text x="200" y="120" text-anchor="middle" fill="#888" font-size="12">両方ONで点灯</text>
          </svg>`,
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'ORゲート = 並列接続',
          customSvg: `<svg viewBox="0 0 400 200" class="circuit-diagram">
            <text x="20" y="100" fill="#fff" font-size="14">電源</text>
            <line x1="50" y1="100" x2="100" y2="100" stroke="#00ff88" stroke-width="2" />
            
            <!-- 分岐 -->
            <line x1="100" y1="100" x2="100" y2="50" stroke="#00ff88" stroke-width="2" />
            <line x1="100" y1="100" x2="100" y2="150" stroke="#00ff88" stroke-width="2" />
            
            <!-- スイッチA（上） -->
            <g transform="translate(100, 50)">
              <line x1="0" y1="0" x2="60" y2="0" stroke="#00ff88" stroke-width="2" />
              <circle cx="60" cy="0" r="3" fill="#00ff88" />
              <line x1="60" y1="0" x2="90" y2="-20" stroke="#00ff88" stroke-width="2" />
              <circle cx="100" cy="0" r="3" fill="#00ff88" />
              <line x1="100" y1="0" x2="160" y2="0" stroke="#00ff88" stroke-width="2" />
              <text x="80" y="-25" text-anchor="middle" fill="#fff" font-size="12">SW A</text>
            </g>
            
            <!-- スイッチB（下） -->
            <g transform="translate(100, 150)">
              <line x1="0" y1="0" x2="60" y2="0" stroke="#00ff88" stroke-width="2" />
              <circle cx="60" cy="0" r="3" fill="#00ff88" />
              <line x1="60" y1="0" x2="90" y2="-20" stroke="#00ff88" stroke-width="2" />
              <circle cx="100" cy="0" r="3" fill="#00ff88" />
              <line x1="100" y1="0" x2="160" y2="0" stroke="#00ff88" stroke-width="2" />
              <text x="80" y="20" text-anchor="middle" fill="#fff" font-size="12">SW B</text>
            </g>
            
            <!-- 合流 -->
            <line x1="260" y1="50" x2="260" y2="100" stroke="#00ff88" stroke-width="2" />
            <line x1="260" y1="150" x2="260" y2="100" stroke="#00ff88" stroke-width="2" />
            <line x1="260" y1="100" x2="320" y2="100" stroke="#00ff88" stroke-width="2" />
            
            <!-- ランプ -->
            <circle cx="340" cy="100" r="20" fill="none" stroke="#00ff88" stroke-width="2" />
            <text x="340" y="105" text-anchor="middle" fill="#fff" font-size="16">💡</text>
            
            <text x="200" y="185" text-anchor="middle" fill="#888" font-size="12">どちらか片方ONで点灯</text>
          </svg>`,
        },
      ],
    },
    {
      id: 'signal-waveforms',
      instruction: '【5. 信号波形】デジタル信号とクロック',
      content: [
        {
          type: 'heading',
          text: '📈 信号波形の表現',
        },
        {
          type: 'diagram',
          diagramType: 'signal-flow',
          title: 'アナログ vs デジタル信号',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'クロック信号',
          customSvg: `<svg viewBox="0 0 500 150" class="circuit-diagram">
            <!-- グリッド -->
            <line x1="50" y1="30" x2="450" y2="30" stroke="#444" stroke-width="1" />
            <line x1="50" y1="90" x2="450" y2="90" stroke="#444" stroke-width="1" stroke-dasharray="2,2" />
            <line x1="50" y1="120" x2="450" y2="120" stroke="#444" stroke-width="1" />
            
            <!-- 軸 -->
            <line x1="50" y1="20" x2="50" y2="130" stroke="#fff" stroke-width="2" />
            <line x1="50" y1="120" x2="450" y2="120" stroke="#fff" stroke-width="2" />
            
            <!-- ラベル -->
            <text x="25" y="35" fill="#fff" font-size="12">1</text>
            <text x="25" y="125" fill="#fff" font-size="12">0</text>
            <text x="20" y="75" fill="#888" font-size="14" transform="rotate(-90 20 75)">CLK</text>
            
            <!-- クロック波形 -->
            <path d="M 80 120 L 80 30 L 150 30 L 150 120 L 220 120 L 220 30 L 290 30 L 290 120 L 360 120 L 360 30 L 430 30" 
                  fill="none" stroke="#00ff88" stroke-width="2" />
            
            <!-- 周期表示 -->
            <g transform="translate(115, 140)">
              <line x1="-35" y1="0" x2="35" y2="0" stroke="#888" stroke-width="1" />
              <line x1="-35" y1="0" x2="-35" y2="-5" stroke="#888" stroke-width="1" />
              <line x1="35" y1="0" x2="35" y2="-5" stroke="#888" stroke-width="1" />
              <text x="0" y="15" text-anchor="middle" fill="#888" font-size="11">周期 T</text>
            </g>
            
            <!-- 立ち上がりエッジ -->
            <circle cx="80" cy="75" r="4" fill="#ff6b6b" />
            <text x="95" y="70" fill="#ff6b6b" font-size="11">立ち上がり</text>
            
            <!-- 立ち下がりエッジ -->
            <circle cx="150" cy="75" r="4" fill="#4ecdc4" />
            <text x="165" y="70" fill="#4ecdc4" font-size="11">立ち下がり</text>
            
            <text x="250" y="15" text-anchor="middle" fill="#fff" font-size="14">クロック信号（50% デューティ比）</text>
          </svg>`,
          caption: 'デジタル回路の心臓部：一定周期で0と1を繰り返す',
        },
      ],
    },
    {
      id: 'truth-tables',
      instruction: '【6. 真理値表】論理演算の結果一覧',
      content: [
        {
          type: 'heading',
          text: '📊 ビジュアル真理値表',
        },
        {
          type: 'diagram',
          diagramType: 'truth-table-visual',
          title: 'ANDゲートの真理値表',
          data: [
            ['A', 'B', 'Y'],
            ['0', '0', '0'],
            ['0', '1', '0'],
            ['1', '0', '0'],
            ['1', '1', '1'],
          ],
        },
        {
          type: 'diagram',
          diagramType: 'truth-table-visual',
          title: 'XORゲートの真理値表',
          data: [
            ['A', 'B', 'Y'],
            ['0', '0', '0'],
            ['0', '1', '1'],
            ['1', '0', '1'],
            ['1', '1', '0'],
          ],
        },
      ],
    },
    {
      id: 'block-diagrams',
      instruction: '【7. ブロック図】システム構成の概要',
      content: [
        {
          type: 'heading',
          text: '🏗️ システムレベルの表現',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'CPU内部ブロック図',
          customSvg: `<svg viewBox="0 0 600 400" class="circuit-diagram">
            <!-- 制御部 -->
            <rect x="50" y="50" width="120" height="80" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="110" y="95" text-anchor="middle" fill="#fff" font-size="14">制御部</text>
            <text x="110" y="115" text-anchor="middle" fill="#888" font-size="10">Control Unit</text>
            
            <!-- レジスタファイル -->
            <rect x="250" y="50" width="120" height="80" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="310" y="85" text-anchor="middle" fill="#fff" font-size="14">レジスタ</text>
            <text x="310" y="100" text-anchor="middle" fill="#888" font-size="10">ファイル</text>
            <text x="310" y="115" text-anchor="middle" fill="#888" font-size="10">Register File</text>
            
            <!-- ALU -->
            <rect x="450" y="50" width="100" height="80" fill="#2a2a2a" stroke="#ff6b6b" stroke-width="2" rx="4" />
            <text x="500" y="95" text-anchor="middle" fill="#fff" font-size="14">ALU</text>
            
            <!-- メモリインターフェース -->
            <rect x="200" y="200" width="200" height="60" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
            <text x="300" y="235" text-anchor="middle" fill="#fff" font-size="14">メモリインターフェース</text>
            
            <!-- メモリ -->
            <rect x="200" y="300" width="200" height="60" fill="#1a1a1a" stroke="#888" stroke-width="2" rx="4" />
            <text x="300" y="335" text-anchor="middle" fill="#888" font-size="14">メインメモリ</text>
            
            <!-- 接続線 -->
            <!-- 制御線 -->
            <line x1="170" y1="90" x2="250" y2="90" stroke="#4ecdc4" stroke-width="2" marker-end="url(#arrowhead)" />
            <line x1="110" y1="130" x2="110" y2="170" stroke="#4ecdc4" stroke-width="2" />
            <line x1="110" y1="170" x2="500" y2="170" stroke="#4ecdc4" stroke-width="2" />
            <line x1="500" y1="170" x2="500" y2="130" stroke="#4ecdc4" stroke-width="2" marker-end="url(#arrowhead)" />
            
            <!-- データ線 -->
            <line x1="370" y1="90" x2="450" y2="90" stroke="#00ff88" stroke-width="3" marker-end="url(#arrowhead)" />
            <line x1="310" y1="130" x2="310" y2="200" stroke="#00ff88" stroke-width="3" />
            <line x1="300" y1="260" x2="300" y2="300" stroke="#00ff88" stroke-width="3" />
            
            <!-- マーカー定義 -->
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#00ff88" />
              </marker>
            </defs>
            
            <!-- ラベル -->
            <text x="180" y="80" fill="#4ecdc4" font-size="10">制御信号</text>
            <text x="380" y="80" fill="#00ff88" font-size="10">データ</text>
          </svg>`,
          caption: 'CPU内部の主要コンポーネントとデータフロー',
        },
      ],
    },
    {
      id: 'timing-diagrams',
      instruction: '【8. タイミング図】時間軸での動作',
      content: [
        {
          type: 'heading',
          text: '⏱️ タイミングチャート',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: 'D-FFのタイミング図',
          customSvg: `<svg viewBox="0 0 600 300" class="circuit-diagram">
            <!-- グリッド -->
            <line x1="80" y1="60" x2="520" y2="60" stroke="#444" stroke-width="1" />
            <line x1="80" y1="120" x2="520" y2="120" stroke="#444" stroke-width="1" />
            <line x1="80" y1="180" x2="520" y2="180" stroke="#444" stroke-width="1" />
            <line x1="80" y1="240" x2="520" y2="240" stroke="#444" stroke-width="1" />
            
            <!-- 信号名 -->
            <text x="30" y="65" fill="#fff" font-size="12">CLK</text>
            <text x="30" y="125" fill="#fff" font-size="12">D</text>
            <text x="30" y="185" fill="#fff" font-size="12">Q</text>
            <text x="30" y="245" fill="#fff" font-size="12">Q̄</text>
            
            <!-- CLK信号 -->
            <path d="M 100 90 L 100 30 L 150 30 L 150 90 L 200 90 L 200 30 L 250 30 L 250 90 L 300 90 L 300 30 L 350 30 L 350 90 L 400 90 L 400 30 L 450 30 L 450 90 L 500 90" 
                  fill="none" stroke="#00ff88" stroke-width="2" />
            
            <!-- D信号 -->
            <path d="M 100 120 L 180 120 L 180 90 L 280 90 L 280 120 L 380 120 L 380 90 L 500 90" 
                  fill="none" stroke="#ff6b6b" stroke-width="2" />
            
            <!-- Q信号 -->
            <path d="M 100 180 L 150 180 L 150 150 L 250 150 L 250 180 L 350 180 L 350 150 L 450 150 L 450 180 L 500 180" 
                  fill="none" stroke="#4ecdc4" stroke-width="2" />
            
            <!-- Q̄信号 -->
            <path d="M 100 210 L 150 210 L 150 240 L 250 240 L 250 210 L 350 210 L 350 240 L 450 240 L 450 210 L 500 210" 
                  fill="none" stroke="#ffd93d" stroke-width="2" />
            
            <!-- 立ち上がりエッジマーカー -->
            <line x1="150" y1="20" x2="150" y2="260" stroke="#888" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="250" y1="20" x2="250" y2="260" stroke="#888" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="350" y1="20" x2="350" y2="260" stroke="#888" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="450" y1="20" x2="450" y2="260" stroke="#888" stroke-width="1" stroke-dasharray="3,3" />
            
            <text x="300" y="285" text-anchor="middle" fill="#888" font-size="11">クロックの立ち上がりでDの値をQに転送</text>
          </svg>`,
          caption: 'D-FFは立ち上がりエッジでデータをラッチ',
        },
      ],
    },
    {
      id: 'data-flow',
      instruction: '【9. データフロー図】ビット演算の流れ',
      content: [
        {
          type: 'heading',
          text: '🔄 データの流れ',
        },
        {
          type: 'diagram',
          diagramType: 'custom',
          title: '4ビット加算のキャリー伝播',
          customSvg: `<svg viewBox="0 0 700 200" class="circuit-diagram">
            <!-- ビット位置 -->
            <text x="100" y="30" text-anchor="middle" fill="#888" font-size="12">ビット3</text>
            <text x="250" y="30" text-anchor="middle" fill="#888" font-size="12">ビット2</text>
            <text x="400" y="30" text-anchor="middle" fill="#888" font-size="12">ビット1</text>
            <text x="550" y="30" text-anchor="middle" fill="#888" font-size="12">ビット0</text>
            
            <!-- 全加算器 -->
            <g id="fa">
              <rect x="-40" y="-30" width="80" height="60" fill="#2a2a2a" stroke="#00ff88" stroke-width="2" rx="4" />
              <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="12">FA</text>
            </g>
            
            <use href="#fa" transform="translate(100, 100)" />
            <use href="#fa" transform="translate(250, 100)" />
            <use href="#fa" transform="translate(400, 100)" />
            <use href="#fa" transform="translate(550, 100)" />
            
            <!-- 入力 -->
            <text x="100" y="50" text-anchor="middle" fill="#fff" font-size="11">A₃ B₃</text>
            <text x="250" y="50" text-anchor="middle" fill="#fff" font-size="11">A₂ B₂</text>
            <text x="400" y="50" text-anchor="middle" fill="#fff" font-size="11">A₁ B₁</text>
            <text x="550" y="50" text-anchor="middle" fill="#fff" font-size="11">A₀ B₀</text>
            
            <!-- キャリー伝播 -->
            <line x1="140" y1="100" x2="210" y2="100" stroke="#ff6b6b" stroke-width="2" marker-end="url(#arrowhead2)" />
            <line x1="290" y1="100" x2="360" y2="100" stroke="#ff6b6b" stroke-width="2" marker-end="url(#arrowhead2)" />
            <line x1="440" y1="100" x2="510" y2="100" stroke="#ff6b6b" stroke-width="2" marker-end="url(#arrowhead2)" />
            <line x1="590" y1="100" x2="630" y2="100" stroke="#ff6b6b" stroke-width="2" />
            
            <!-- キャリーラベル -->
            <text x="175" y="95" text-anchor="middle" fill="#ff6b6b" font-size="10">C₃</text>
            <text x="325" y="95" text-anchor="middle" fill="#ff6b6b" font-size="10">C₂</text>
            <text x="475" y="95" text-anchor="middle" fill="#ff6b6b" font-size="10">C₁</text>
            <text x="610" y="95" text-anchor="middle" fill="#ff6b6b" font-size="10">C₀=0</text>
            
            <!-- 出力 -->
            <text x="100" y="150" text-anchor="middle" fill="#00ff88" font-size="11">S₃</text>
            <text x="250" y="150" text-anchor="middle" fill="#00ff88" font-size="11">S₂</text>
            <text x="400" y="150" text-anchor="middle" fill="#00ff88" font-size="11">S₁</text>
            <text x="550" y="150" text-anchor="middle" fill="#00ff88" font-size="11">S₀</text>
            
            <!-- 最終キャリー -->
            <text x="30" y="105" fill="#ff6b6b" font-size="12">C₄</text>
            <line x1="50" y1="100" x2="60" y2="100" stroke="#ff6b6b" stroke-width="2" />
            
            <!-- マーカー定義 -->
            <defs>
              <marker id="arrowhead2" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ff6b6b" />
              </marker>
            </defs>
            
            <text x="350" y="185" text-anchor="middle" fill="#888" font-size="11">リップルキャリー：右から左へ順次伝播</text>
          </svg>`,
          caption: '各ビットの加算結果が次のビットへ影響',
        },
      ],
    },
    {
      id: 'summary',
      instruction: '【まとめ】SVG図表の利点',
      content: [
        {
          type: 'heading',
          text: '✨ SVG図表システムの特徴',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '📐 **正確な表示** - ブラウザやフォントに依存しない',
            '🔍 **拡大縮小自在** - ベクターグラフィックスで常に鮮明',
            '🎨 **統一感のあるデザイン** - 色やスタイルを一元管理',
            '♿ **アクセシビリティ向上** - スクリーンリーダー対応可能',
            '🎬 **アニメーション対応** - 動的な説明も可能',
            '📱 **レスポンシブ** - 画面サイズに応じて自動調整',
          ],
        },
        {
          type: 'note',
          text: '💡 これらの図表を各レッスンに適用することで、より分かりやすい学習体験を提供できます。',
        },
        {
          type: 'text',
          text: '次のステップ：このカタログを参考に、既存レッスンのASCIIアートを段階的にSVG図表に置き換えていきます。',
        },
      ],
    },
  ],
};