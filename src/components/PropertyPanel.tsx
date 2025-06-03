import React, { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { isCustomGate } from '../types/gates';
import { TruthTableDisplay } from './TruthTableDisplay';
import { getGateDescription } from '../data/gateDescriptions';
import {
  booleanToDisplayState,
  getGateInputsAsBoolean,
} from '../domain/simulation';

export const PropertyPanel: React.FC = () => {
  const { gates, selectedGateId, updateClockFrequency } = useCircuitStore();
  const selectedGate = gates.find(g => g.id === selectedGateId);

  // モーダル管理用のstate
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTruthTableModal, setShowTruthTableModal] = useState(false);
  const [truthTableData, setTruthTableData] = useState<any>(null);
  const [clockWasRunning, setClockWasRunning] = useState(false);

  // 前回のselectedGateIdを記憶
  const prevSelectedGateIdRef = React.useRef(selectedGateId);

  // ゲート選択が変わった時にモーダルを閉じる
  React.useEffect(() => {
    // 実際にselectedGateIdが変わった場合のみ処理
    if (prevSelectedGateIdRef.current !== selectedGateId) {
      prevSelectedGateIdRef.current = selectedGateId;

      // モーダルが開いている場合のみ処理
      if (showDetailModal || showTruthTableModal) {
        // すべてのCLOCKゲートの状態を復元
        if (clockWasRunning) {
          const currentGates = useCircuitStore.getState().gates;
          const updatedGates = currentGates.map(gate => {
            if (
              gate.type === 'CLOCK' &&
              gate.metadata &&
              !gate.metadata.isRunning
            ) {
              return {
                ...gate,
                metadata: { ...gate.metadata, isRunning: true },
              };
            }
            return gate;
          });
          useCircuitStore.setState({ gates: updatedGates });
          setClockWasRunning(false);
        }

        setShowDetailModal(false);
        setShowTruthTableModal(false);
        setTruthTableData(null);
      }
    }
  }, [selectedGateId, showDetailModal, showTruthTableModal, clockWasRunning]);

  // 強制的にモーダルを閉じる関数
  const forceCloseModal = React.useCallback(() => {
    // すべてのCLOCKゲートの実行状態を復元
    if (clockWasRunning) {
      // 最新のgatesを直接取得
      const currentGates = useCircuitStore.getState().gates;
      const updatedGates = currentGates.map(gate => {
        if (
          gate.type === 'CLOCK' &&
          gate.metadata &&
          !gate.metadata.isRunning
        ) {
          // 停止しているCLOCKゲートを再開
          return { ...gate, metadata: { ...gate.metadata, isRunning: true } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
      setClockWasRunning(false);
    }

    setShowDetailModal(false);
    setShowTruthTableModal(false);
    setTruthTableData(null);
  }, [clockWasRunning]); // gatesを依存配列から削除

  // Escapeキーでモーダルを閉じる
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (showDetailModal || showTruthTableModal)) {
        forceCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDetailModal, showTruthTableModal, forceCloseModal]);

  // 構造化されたゲート説明データ（外部化済み）

  // 美しいJSXレンダリング関数
  const renderGateDescription = (gateType: string) => {
    const data = getGateDescription(gateType);

    return (
      <div
        style={{
          fontSize: '14px',
          lineHeight: '1.7',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* メインタイトル */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(0, 255, 136, 0.3)',
          }}
        >
          <span style={{ fontSize: '24px' }}>{data.icon}</span>
          <h2
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#00ff88',
            }}
          >
            {data.title}
          </h2>
        </div>

        {/* 基本動作 */}
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#00ff88',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #00ff88',
              paddingLeft: '12px',
            }}
          >
            基本動作
          </h3>
          <p style={{ margin: 0, lineHeight: '1.6' }}>{data.basicOperation}</p>
          {data.truthTableNote && (
            <p
              style={{
                margin: '12px 0 0 0',
                padding: '12px',
                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: '6px',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              💡 {data.truthTableNote}
            </p>
          )}
        </div>

        {/* 日常的な判断との類比 */}
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#00ff88',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #00ff88',
              paddingLeft: '12px',
            }}
          >
            日常的な判断との類比
          </h3>
          {data.realWorldAnalogy.map((analogy, index) => (
            <div
              key={index}
              style={{
                margin: '8px 0',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid rgba(0, 255, 136, 0.4)',
                borderRadius: '4px',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              {analogy}
            </div>
          ))}
        </div>

        {/* なぜ重要？ */}
        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              color: '#00ff88',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #00ff88',
              paddingLeft: '12px',
            }}
          >
            なぜ重要？
          </h3>
          <p style={{ margin: 0, lineHeight: '1.6' }}>{data.whyImportant}</p>
        </div>

        {/* 技術的洞察 */}
        {data.technicalInsight && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: '#ff6699',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                borderLeft: '4px solid #ff6699',
                paddingLeft: '12px',
              }}
            >
              技術的洞察
            </h3>
            <p
              style={{
                margin: 0,
                lineHeight: '1.6',
                padding: '12px',
                backgroundColor: 'rgba(255, 102, 153, 0.05)',
                border: '1px solid rgba(255, 102, 153, 0.2)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              {data.technicalInsight}
            </p>
          </div>
        )}

        {/* 学習のコツ */}
        <div>
          <h3
            style={{
              color: '#ffd700',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #ffd700',
              paddingLeft: '12px',
            }}
          >
            学習のコツ
          </h3>
          <p
            style={{
              margin: 0,
              lineHeight: '1.6',
              padding: '12px',
              backgroundColor: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            💡 {data.learningTip}
          </p>
        </div>
      </div>
    );
  };

  // 詳細説明表示ハンドラ
  const handleShowDetail = () => {
    // すべての実行中のCLOCKゲートを一時停止
    const runningClocks = gates.filter(
      g => g.type === 'CLOCK' && g.metadata?.isRunning
    );
    if (runningClocks.length > 0) {
      setClockWasRunning(true);
      const updatedGates = gates.map(gate => {
        if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
          return { ...gate, metadata: { ...gate.metadata, isRunning: false } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
    }

    setShowDetailModal(true);
  };

  // 真理値表表示ハンドラ
  const handleShowTruthTable = () => {
    if (!selectedGate) return;

    // すべての実行中のCLOCKゲートを一時停止
    const runningClocks = gates.filter(
      g => g.type === 'CLOCK' && g.metadata?.isRunning
    );
    if (runningClocks.length > 0) {
      setClockWasRunning(true);
      const updatedGates = gates.map(gate => {
        if (gate.type === 'CLOCK' && gate.metadata?.isRunning) {
          return { ...gate, metadata: { ...gate.metadata, isRunning: false } };
        }
        return gate;
      });
      useCircuitStore.setState({ gates: updatedGates });
    }

    if (
      isCustomGate(selectedGate) &&
      selectedGate.customGateDefinition?.truthTable
    ) {
      // カスタムゲートの場合
      const definition = selectedGate.customGateDefinition;
      const inputNames = definition.inputs.map(input => input.name);
      const outputNames = definition.outputs.map(output => output.name);

      const table = definition.truthTable
        ? Object.entries(definition.truthTable).map(([inputs, outputs]) => ({
            inputs,
            outputs,
            inputValues: inputs.split('').map(bit => bit === '1'),
            outputValues: outputs.split('').map(bit => bit === '1'),
          }))
        : [];

      const result = {
        table,
        inputCount: definition.inputs.length,
        outputCount: definition.outputs.length,
        isSequential: false,
      };

      setTruthTableData({
        result,
        inputNames,
        outputNames,
        gateName: definition.displayName,
      });
    } else {
      // 基本ゲートの場合
      const inputNames = selectedGate.type === 'NOT' ? ['A'] : ['A', 'B'];
      const outputNames = ['出力'];
      const gateName = `${selectedGate.type}ゲート`;

      // 基本ゲートの真理値表を生成（簡易版）
      const truthTable = getTruthTable();
      if (truthTable.length > 0) {
        const table = truthTable.map(row => {
          const inputs =
            selectedGate.type === 'NOT'
              ? booleanToDisplayState(!!row.a)
              : `${booleanToDisplayState(!!row.a)}${booleanToDisplayState(!!row.b)}`;
          const outputs = booleanToDisplayState(!!row.out);

          return {
            inputs,
            outputs,
            inputValues: inputs.split('').map(bit => bit === '1'),
            outputValues: outputs.split('').map(bit => bit === '1'),
          };
        });

        setTruthTableData({
          result: {
            table,
            inputCount: inputNames.length,
            outputCount: 1,
            isSequential: false,
            recognizedPattern: selectedGate.type,
          },
          inputNames,
          outputNames,
          gateName,
        });
      }
    }

    setShowTruthTableModal(true);
  };

  if (!selectedGate) {
    return (
      <aside className="property-panel">
        <div className="property-group">
          <div className="section-title">
            <span>📝</span>
            <span>プロパティ</span>
          </div>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              lineHeight: '1.6',
              textAlign: 'center',
              margin: '20px 0',
            }}
          >
            ゲートを選択すると
            <br />
            詳細情報が表示されます
          </p>
        </div>
      </aside>
    );
  }

  const getTruthTable = () => {
    // カスタムゲートの場合
    if (
      isCustomGate(selectedGate) &&
      selectedGate.customGateDefinition?.truthTable
    ) {
      const definition = selectedGate.customGateDefinition;
      const truthTable = definition.truthTable;
      if (!truthTable) return [];
      return Object.entries(truthTable).map(([inputs, outputs]) => {
        const row: any = {};

        // 入力列を追加
        definition.inputs.forEach((inputPin, index) => {
          row[inputPin.name] = parseInt(inputs[index]);
        });

        // 出力列を追加
        definition.outputs.forEach((outputPin, index) => {
          row[`out_${outputPin.name}`] = parseInt(outputs[index]);
        });

        return row;
      });
    }

    // 基本ゲートの場合
    switch (selectedGate.type) {
      case 'AND':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 0 },
          { a: 1, b: 0, out: 0 },
          { a: 1, b: 1, out: 1 },
        ];
      case 'OR':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 1 },
        ];
      case 'XOR':
        return [
          { a: 0, b: 0, out: 0 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 0 },
        ];
      case 'NOT':
        return [
          { a: 0, out: 1 },
          { a: 1, out: 0 },
        ];
      case 'NAND':
        return [
          { a: 0, b: 0, out: 1 },
          { a: 0, b: 1, out: 1 },
          { a: 1, b: 0, out: 1 },
          { a: 1, b: 1, out: 0 },
        ];
      case 'NOR':
        return [
          { a: 0, b: 0, out: 1 },
          { a: 0, b: 1, out: 0 },
          { a: 1, b: 0, out: 0 },
          { a: 1, b: 1, out: 0 },
        ];
      default:
        return [];
    }
  };

  const _truthTable = getTruthTable();

  const _getGateDescriptionLegacy = () => {
    // カスタムゲートの場合
    if (isCustomGate(selectedGate) && selectedGate.customGateDefinition) {
      const definition = selectedGate.customGateDefinition;
      return definition.description || 'ユーザー定義のカスタムゲートです。';
    }

    // 基本ゲートの場合
    switch (selectedGate.type) {
      case 'AND':
        return `🔗 ANDゲート（論理積）は全ての条件が揃った時だけ動作する「厳格な門番」です。

**基本動作**：
すべての入力が1（ON）の時のみ出力が1（ON）になります。一つでも0（OFF）があると出力は0になります。

**実世界での応用**：
• CPUの条件分岐：「AかつBの条件が満たされた場合のみ実行」
• セキュリティシステム：「IDカードかつ指紋認証の両方でロック解除」
• 信号機制御：「歩行者ボタンかつ安全確認の両方で青信号」

**なぜ重要？**：
ANDゲートは論理回路の基礎中の基礎。複数の条件を同時に満たす判定は、あらゆるデジタルシステムで不可欠です。CPUの演算ユニット、メモリアクセス制御、通信プロトコルなど、現代のコンピュータの根幹を支えています。

**組み合わせのコツ**：
NOTゲートと組み合わせることで、「AでありBでない」などの複雑な条件も表現できます。`;
      case 'OR':
        return `🌈 ORゲート（論理和）は「どれか一つでも条件があれば動作する」柔軟な判定器です。

**基本動作**：
少なくとも一つの入力が1（ON）であれば出力が1（ON）になります。すべてが0（OFF）の時のみ出力が0になります。

**実世界での応用**：
• 緊急停止システム：「手動ボタンまたは自動センサーのどちらかで停止」
• ログイン認証：「パスワードまたは生体認証のどちらかで成功」
• 警報システム：「煙センサーまたは熱センサーのどちらかで発動」

**なぜ重要？**：
ORゲートは「選択肢」と「代替手段」を表現する基本要素。マルチパス設計、冗長性確保、ユーザビリティ向上など、システムの柔軟性と信頼性を支えています。CPUの割り込み処理や、ネットワークの複数経路制御でも活躍します。

**組み合わせのコツ**：
ANDゲートと組み合わせて「（AまたはB）かつC」のような複雑な条件分岐を作れます。これは分散処理システムの基本パターンです。`;
      case 'XOR':
        return `✨ XORゲート（排他的論理和）は「違いを見つける天才」として、情報処理の最前線で活躍する特別なゲートです！

**基本動作**：
「どちらか片方だけ」が1（ON）の時に出力が1（ON）。同じ値（00または11）の時は出力が0（OFF）になります。

**「違い」を検出する魔法**：
XORは2つの入力が「異なる」時にのみ反応します。これが数々の革新的応用を生み出しています。

**実世界での応用**：
• デジタル暗号化：データの秘匿化と復号化
• エラー検出：パリティチェック、チェックサム計算
• 信号比較：センサー値の差分監視
• 乱数生成：真性乱数生成器の核心部分

**暗号技術での王座**：
🔐 ワンタイムパッド暗号の基礎原理。平文⊕鍵=暗号文、暗号文⊕鍵=平文という美しい対称性。

**コンピュータ算術の英雄**：
• 加算器回路：桁上がりなし加算の実装
• 減算器回路：2の補数演算
• 乗算器：部分積の計算

**通信技術での革命**：
• フェーズシフトキーイング（PSK）変調
• CDMA通信の拡散符号処理
• 光通信の信号処理

**自己参照の美しさ**：
A⊕A=0、A⊕0=A という性質により、XORは「取り消し可能な操作」として、可逆計算の基礎となっています。

**量子コンピュータへの道**：
量子ゲートのCNOT（Controlled-NOT）は、XORの量子版として量子計算の基本要素です。`;
      case 'NOT':
        return `🔄 NOTゲート（論理否定）は「逆転の発想」を体現する、最もシンプルで最も強力なゲートです。

**基本動作**：
入力が1（ON）なら出力は0（OFF）、入力が0（OFF）なら出力は1（ON）。完全に反転させます。

**実世界での応用**：
• 信号の反転：「赤信号を青信号に変換」
• エラー検出：「正常でない = 異常」の判定
• 補完信号生成：「データとその補完データを同時生成」
• 論理の否定：「条件が満たされていない場合の処理」

**なぜ特別？**：
NOTゲートは唯一の単入力ゲートで、他のどんな複雑なゲートも「基本ゲート + NOT」で表現可能です。実際、NANDゲートやNORゲートの強力さも、内部にNOTが組み込まれているからです。

**デジタル回路の魔法**：
• メモリ回路：フリップフロップの状態反転
• クロック信号：立ち上がりエッジと立ち下がりエッジの生成
• エンコーダ/デコーダ：信号の相互変換

**哲学的重要性**：
「ある」と「ない」、「真」と「偽」を明確に区別する、デジタル世界の根本原理を体現しています。`;
      case 'NAND':
        return `⚡ NANDゲート（否定論理積）は「万能ゲート」と呼ばれる驚異的な存在です！

**基本動作**：
ANDゲートの出力を反転したもの。すべての入力が1（ON）の時のみ出力が0（OFF）になり、それ以外は1（ON）です。

**衝撃的な事実**：
🔥 NANDゲートだけで、AND、OR、NOT、XOR、すべてのゲートを作ることができます！これは論理回路設計の革命です。

**実世界での応用**：
• 初期のコンピュータ：すべてNANDゲートで構築
• TTL（Transistor-Transistor Logic）回路の主要素子
• フラッシュメモリの基本セル
• CPUの演算回路の基礎ブロック

**なぜ万能？**：
NANDは「完全性」を持つ論理演算子。任意の論理関数をNANDの組み合わせだけで表現できます。これにより、工場では1種類のゲートだけ作れば全てのデジタル回路が製造可能に！

**製造業界での革命**：
製造コスト削減、品質管理の簡素化、設計の標準化を実現。現代の半導体産業の基盤を支えています。

**組み合わせの魔法**：
• NOT: NANDの入力を結合
• AND: NANDの出力をNAND
• OR: ド・モルガンの法則を活用`;
      case 'NOR':
        return `🌟 NORゲート（否定論理和）は「もう一つの万能ゲート」として、NANDと双璧をなす存在です！

**基本動作**：
ORゲートの出力を反転したもの。すべての入力が0（OFF）の時のみ出力が1（ON）になり、一つでも1があると出力は0（OFF）です。

**NANDとの違い**：
NORは「デフォルトがON、何か入力があるとOFF」という特性を持ち、安全装置や監視システムに最適です。

**実世界での応用**：
• 安全監視システム：「全センサーが正常な時のみ運転継続」
• 電源管理：「すべての条件がクリアされた時のみ電源ON」
• ECL（Emitter-Coupled Logic）回路の基本要素
• 高速デジタル回路での信号処理

**NORの万能性**：
NANDと同様、NORだけですべての論理ゲートを構築可能！異なる製造プロセスで有利な場合があり、設計者に選択肢を提供します。

**CMOSでの優位性**：
CMOS技術では、NORゲートの方が効率的な場合があります。特に低消費電力設計で威力を発揮。

**安全設計の哲学**：
「何もない状態が安全」という設計思想を体現。フェイルセーフ系統の基本原理となっています。

**対称性の美しさ**：
ド・モルガンの法則により、ANDとOR、NANDとNORは美しい対称性を持ちます。これは論理数学の基本原理です。`;
      case 'INPUT':
        return `🎮 INPUTゲート（入力制御）は「人間とデジタル世界を繋ぐ架け橋」として、すべてのインタラクションの出発点です！

**基本操作**：
ダブルクリックでON（1）/OFF（0）を切り替え。シングルクリックでは選択のみ。この直感的な操作で回路に生命を吹き込みます。

**デジタル世界での役割**：
• キーボード入力：各キーが一つのINPUTゲート
• センサー信号：温度、圧力、光、音の検出
• ユーザーインターフェース：ボタン、スイッチ、タッチパネル
• 通信信号：ネットワークから受信するデータ

**なぜ不可欠？**：
コンピュータは外部からの入力なしには何もできません。INPUTゲートは「現実世界のアナログ情報をデジタル信号に変換」する最初の関門です。

**実システムでの実装**：
• マイクロコントローラのGPIOピン
• PLCの入力端子
• スマートフォンのセンサー群
• 自動車のECU入力

**設計思想の重要性**：
「ガベージイン、ガベージアウト」- 入力の品質が全体の品質を決定します。だからこそINPUTゲートの設計は慎重に行われます。

**デバッグの出発点**：
すべての問題解決は「入力が正しいか？」から始まります。INPUTゲートは回路設計者の最初の友です。

**操作のコツ**：
このツールでは、INPUTゲートを「データの源」として使い、様々なパターンを試して回路の動作を理解しましょう。`;
      case 'OUTPUT':
        return `💡 OUTPUTゲート（出力表示）は「デジタル思考を可視化する窓」として、計算結果を私たちに見せてくれる重要な存在です！

**基本動作**：
接続された信号の状態を💡ライトで視覚化。ON（1）の時は明るく光り、OFF（0）の時は暗くなります。

**情報表示の革命**：
• LED表示器：信号機、電光掲板、ステータスライト
• 7セグメントディスプレイ：デジタル時計、計測器
• LCD/OLED画面：各ピクセルが一つのOUTPUT
• 音響機器：スピーカーへの信号出力

**デバッグの最強ツール**：
🔍 回路設計において、OUTPUTゲートは「内部状態の観測窓」。複雑な回路の動作確認に不可欠です。

**実世界での重要性**：
• 医療機器：心電図、血圧計の表示
• 産業制御：工場の稼働状態表示
• 自動車：ダッシュボードの警告灯
• 航空機：コックピットの計器類

**ユーザビリティの核心**：
どんなに優秀な計算も、結果が見えなければ意味がありません。OUTPUTゲートは「機械と人間の対話」を可能にします。

**設計思想**：
「見える化」の重要性 - 内部処理を外部に伝える責任を担います。適切なタイミング、明度、色彩設計が求められます。

**多様な出力形態**：
• バイナリ表示：ON/OFF状態
• アナログ表示：PWM信号による明度制御
• パルス表示：点滅パターンによる情報伝達

**学習のポイント**：
回路の「答え」を確認する場所。期待した結果が出ているかチェックして、論理回路の理解を深めましょう。`;
      case 'CLOCK':
        return `⏰ CLOCKゲート（クロック信号）は「デジタル世界の心臓」として、すべての同期動作を司る絶対不可欠な存在です！

**基本動作**：
一定の間隔で0→1→0を繰り返す周期的な信号を生成。この「鼓動」がデジタル回路に時間の概念をもたらします。

**デジタル世界の時間軸**：
⏱️ クロックなしには、いつ計算するか、いつデータを転送するか、いつ状態を更新するかが決められません。

**実世界での重要性**：
• CPU：ギガヘルツの超高速クロックで処理を制御
• メモリ：データの読み書きタイミングを同期
• 通信：送信者と受信者の同期を確保
• 動画：60FPSのリフレッシュレート制御

**周波数の意味**：
• 1Hz = 1秒間に1回の切り替え（超低速）
• 1MHz = 1秒間に100万回（昔のコンピュータ）
• 1GHz = 1秒間に10億回（現代のCPU）
• 上記のクロック設定で体験できます

**同期設計の哲学**：
「みんなで同じタイミングで動く」ことで、複雑なシステムでも秩序を保てます。これが現代コンピュータの基盤です。

**クロックドメイン**：
大規模システムでは、部分ごとに異なるクロックを使用。クロック境界の設計は最重要課題の一つです。

**パフォーマンスとトレードオフ**：
• 高周波数 = 高性能だが高消費電力
• 低周波数 = 省電力だが低性能
• 設計者は常にこの天秤と向き合います

**学習のコツ**：
フリップフロップやラッチと組み合わせて、「タイミング制御」の重要性を体感してみましょう。`;
      case 'D-FF':
        return `💾 D型フリップフロップ（D-FF）は「デジタル記憶の基本単位」として、現代コンピュータのメモリとレジスタの根幹を支える革命的な発明です！

**基本動作**：
クロック信号の立ち上がりエッジ（0→1の瞬間）で、D入力の値をQ出力に「記憶」します。クロックがない間は前の値を保持し続けます。

**「記憶」の革命**：
🧠 D-FFは「1ビットの記憶素子」。これが何億個も集まってコンピュータのメモリやレジスタが構成されます。

**実世界での応用**：
• CPUレジスタ：演算結果の一時保存
• SRAM/DRAM：メインメモリの基本セル
• カウンタ回路：数値のカウントアップ/ダウン
• シフトレジスタ：データの直列転送

**タイミング制御の天才**：
⏰ クロック同期により「いつ記憶するか」を正確に制御。これにより複雑なシーケンス処理が可能になります。

**デジタル設計の基礎**：
• 状態マシン：システムの状態遷移制御
• パイプライン：処理の流れ作業化
• 同期回路：確実なタイミング制御

**D入力の意味**：
「Data」の頭文字。記憶したいデータを入力します。クロックエッジでこの値が「確定」されます。

**セットアップ/ホールドタイム**：
現実のD-FFには「クロック前後の安定時間」が必要。これが高速設計の制約となります。

**メタステーブル問題**：
非同期信号を扱う際の重要な課題。設計者が最も注意すべき現象の一つです。

**学習ポイント**：
CLOCKゲートと組み合わせて、「値を記憶する瞬間」を観察してください。デジタル記憶の神秘を体感できます！`;
      case 'SR-LATCH':
        return `🔐 SRラッチ（Set-Reset Latch）は「最初のメモリ素子」として、デジタル記憶の歴史を切り開いた伝説的な回路です！

**基本動作**：
• S（Set）を1にすると出力Qが1になり記憶
• R（Reset）を1にすると出力Qが0になりリセット
• S=0, R=0では前の状態を保持
• S=1, R=1は禁止状態（予測不能）

**歴史的重要性**：
📜 1918年のエクルス・ジョーダン回路に起源を持つ、100年以上の歴史を持つ基本回路。デジタル記憶の祖先です。

**実世界での応用**：
• 電源スイッチ：押したら点灯、もう一度押したら消灯
• 警報システム：一度発動したら手動リセットまで継続
• 機械制御：「運転開始」「緊急停止」ボタン
• 回路保護：過電流検出とラッチ

**ラッチ vs フリップフロップ**：
🕰️ ラッチは「レベル敏感」、フリップフロップは「エッジ敏感」。SRラッチは入力が変化するとすぐに反応します。

**非同期動作の特徴**：
クロック信号に依存せず、入力の変化に即座に反応。これが高速性と不安定性の両面をもたらします。

**禁止状態の謎**：
S=1, R=1の時、出力が予測不能になる理由は、回路の対称性にあります。この「不確定性」が量子力学的な面白さを持ちます。

**デバウンス回路**：
機械的スイッチの「チャタリング」を除去する回路として重要。接点の物理的振動を電気的に安定化します。

**現代での役割**：
• CPU内のキャッシュ制御
• 割り込み処理の状態保持
• 電源管理回路
• 故障検出システム

**学習のポイント**：
「記憶するタイミング」を自由に制御できる面白さを体験してください。D-FFとの動作の違いも比較してみましょう！`;
      case 'MUX':
        return `🎛️ マルチプレクサ（MUX）は「デジタル世界の切り替えスイッチ」として、現代コンピュータの柔軟性と効率性を支える重要な回路です！

**基本動作**：
セレクト信号S（選択信号）の値に応じて：
• S=0の時：A入力を出力Yに接続
• S=1の時：B入力を出力Yに接続
まさに「デジタル切り替えスイッチ」！

**実世界での応用**：
• CPUのALU：複数の演算結果から一つを選択
• メモリアクセス：複数のメモリバンクから選択
• 通信系統：複数の信号線から一つを選択
• 音響機器：複数の入力音源の切り替え

**効率性の革命**：
🚀 1本の出力線で複数の入力を扱えるため、配線数とコストを大幅削減。大規模システムの実現に不可欠です。

**CPUでの重要性**：
• レジスタファイル：数十個のレジスタから指定されたものを選択
• キャッシュ制御：複数のキャッシュラインから選択
• パイプライン制御：各段階での適切なデータ選択

**通信技術での活躍**：
• 時分割多重化（TDM）：一つの回線で複数の通話を処理
• パケット交換：宛先に応じたルーティング
• 光ファイバー通信：波長分割多重化

**拡張性の魔法**：
• 2-to-1 MUX（今回の実装）
• 4-to-1, 8-to-1, 16-to-1...無限に拡張可能
• 複数のMUXを組み合わせて巨大な選択回路を構築

**デマルチプレクサとの対比**：
MUXの逆動作がデマルチプレクサ（DEMUX）。1つの入力を複数の出力に振り分けます。

**プログラミングとの類似**：
if-else文やswitch文のハードウェア版。条件に応じた分岐処理を物理的に実現します。

**学習ポイント**：
セレクト信号を変えながら、「選択」の概念をハードウェアで体験してください。複雑な判定ロジックの基礎が理解できます！`;
      default:
        return '詳細な説明はまだ実装されていません。';
    }
  };

  // 詳細説明モーダルの内容
  const DetailModal = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          forceCloseModal();
        }
      }}
    >
      <div
        style={{
          width: '90vw',
          maxWidth: '700px',
          maxHeight: '90vh',
          backgroundColor: '#0f1441',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          borderRadius: '16px',
          color: 'white',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: 'rgba(0, 255, 136, 0.05)',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#00ff88',
            }}
          >
            📖{' '}
            {isCustomGate(selectedGate) && selectedGate.customGateDefinition
              ? selectedGate.customGateDefinition.displayName
              : `${selectedGate.type}ゲート`}{' '}
            の詳細説明
          </h2>
          <button
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              forceCloseModal();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}
        >
          {renderGateDescription(selectedGate.type)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="property-panel">
        {/* ヘッダー */}
        <div className="property-group">
          <div className="section-title">
            <span>📝</span>
            <span>
              選択中:{' '}
              {isCustomGate(selectedGate) && selectedGate.customGateDefinition
                ? selectedGate.customGateDefinition.displayName
                : `${selectedGate.type}ゲート`}
            </span>
          </div>
        </div>

        {/* インスタンス情報 */}
        <div className="property-group">
          <div className="section-title">
            <span>🔧</span>
            <span>インスタンス情報</span>
          </div>
          <div className="property-row">
            <span className="property-label">ID</span>
            <span
              className="property-value"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            >
              {selectedGate.id}
            </span>
          </div>
          <div className="property-row">
            <span className="property-label">位置</span>
            <span className="property-value">
              X: {Math.round(selectedGate.position.x)}, Y:{' '}
              {Math.round(selectedGate.position.y)}
            </span>
          </div>
          {/* 現在の状態表示 */}
          <div className="property-row">
            <span className="property-label">現在の状態</span>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* 入力状態 */}
              {selectedGate.inputs && selectedGate.inputs.length > 0 && (
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  入力: [
                  {getGateInputsAsBoolean(selectedGate)
                    .map(val => booleanToDisplayState(val) || '0')
                    .join(',')}
                  ]
                </span>
              )}
              {/* 出力状態 */}
              <span
                style={{
                  fontSize: '12px',
                  color: selectedGate.output
                    ? '#00ff88'
                    : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: '600',
                }}
              >
                出力: {booleanToDisplayState(selectedGate.output)}
              </span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="property-group">
          <div className="section-title">
            <span>📚</span>
            <span>学習リソース</span>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <button
              onClick={handleShowDetail}
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid #00ff88',
                borderRadius: '8px',
                color: '#00ff88',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📖 詳細説明を表示
            </button>

            {/* 基本ゲートとカスタムゲートのみ真理値表ボタン表示 */}
            {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(
              selectedGate.type
            ) ||
              (isCustomGate(selectedGate) &&
                selectedGate.customGateDefinition?.truthTable)) && (
              <button
                onClick={handleShowTruthTable}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 102, 153, 0.1)',
                  border: '1px solid #ff6699',
                  borderRadius: '8px',
                  color: '#ff6699',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📊 真理値表を表示
              </button>
            )}
          </div>
        </div>

        {/* CLOCKゲートの周波数調整 */}
        {selectedGate.type === 'CLOCK' && (
          <div className="property-group">
            <div className="section-title">
              <span>⏱️</span>
              <span>クロック設定</span>
            </div>
            <div className="property-row">
              <span className="property-label">現在の周波数</span>
              <span
                className="property-value"
                style={{ color: '#00ff88', fontWeight: '600' }}
              >
                {selectedGate.metadata?.frequency || 1} Hz
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                周波数を変更
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {[1, 2, 5, 10].map(freq => (
                  <button
                    key={freq}
                    onClick={() => updateClockFrequency(selectedGate.id, freq)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor:
                        (selectedGate.metadata?.frequency || 1) === freq
                          ? '#00ff88'
                          : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${(selectedGate.metadata?.frequency || 1) === freq ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color:
                        (selectedGate.metadata?.frequency || 1) === freq
                          ? '#000'
                          : '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {freq}Hz
                  </button>
                ))}
              </div>
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid rgba(0, 255, 136, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: '1.4',
                }}
              >
                💡 高い周波数ほど速くON/OFFが切り替わります
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* モーダル表示 */}
      {showDetailModal === true && selectedGate && <DetailModal />}

      {showTruthTableModal && truthTableData && (
        <TruthTableDisplay
          result={truthTableData.result}
          inputNames={truthTableData.inputNames}
          outputNames={truthTableData.outputNames}
          gateName={truthTableData.gateName}
          onClose={() => {
            setShowTruthTableModal(false);
            setTruthTableData(null);
          }}
        />
      )}
    </>
  );
};
