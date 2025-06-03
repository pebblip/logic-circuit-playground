import React, { useState } from 'react';
import { useCircuitStore } from '../stores/circuitStore';
import { isCustomGate } from '../types/gates';
import { TruthTableDisplay } from './TruthTableDisplay';
import { generateTruthTable } from '../utils/truthTableGenerator';

interface GateDescription {
  title: string;
  icon: string;
  basicOperation: string;
  truthTableNote?: string;
  realWorldAnalogy: string[];
  whyImportant: string;
  technicalInsight?: string;
  learningTip: string;
}

export const PropertyPanel: React.FC = () => {
  const { gates, wires, selectedGateId, updateClockFrequency } = useCircuitStore();
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
            if (gate.type === 'CLOCK' && gate.metadata && !gate.metadata.isRunning) {
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
        if (gate.type === 'CLOCK' && gate.metadata && !gate.metadata.isRunning) {
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

  // 構造化されたゲート説明データ
  const getGateDescriptionData = (gateType: string): GateDescription => {
    switch (gateType) {
      case 'AND':
        return {
          title: 'ANDゲート（論理積）',
          icon: '🔗',
          basicOperation: 'すべての入力が1（ON）の時のみ出力が1（ON）になります。一つでも0（OFF）があると出力は0になります。',
          truthTableNote: '真理値表では、最後の行（1,1→1）だけが出力1になることに注目してください。',
          realWorldAnalogy: [
            '車の発進システムのような判断：「シートベルト装着 かつ ドア閉鎖」の両方が満たされた時のみ発進可能',
            'セキュリティシステムのような考え方：「IDカード認証 かつ 指紋認証」の両方が成功した時のみアクセス許可',
            'レストランの営業判定のような論理：「食材の準備完了 かつ スタッフの出勤完了」の両方で営業開始'
          ],
          whyImportant: 'ANDゲートは「厳格な条件判定」の基礎です。複数の条件をすべて満たす場合にのみ動作させるという考え方は、安全性や品質管理において不可欠な概念です。',
          technicalInsight: 'デジタル回路では、複数の信号が同時に「有効」である状況を検出する基本素子として機能します。論理演算の基礎であり、より複雑な判定回路の構成要素となります。',
          learningTip: 'このツールでINPUTゲートを2つ配置し、ANDゲートに接続してみてください。両方のINPUTを色々な組み合わせでON/OFFして、「両方ONの時だけ」という動作を体感してみましょう。'
        };

      case 'OR':
        return {
          title: 'ORゲート（論理和）',
          icon: '🌈',
          basicOperation: '少なくとも一つの入力が1（ON）であれば出力が1（ON）になります。すべてが0（OFF）の時のみ出力が0になります。',
          truthTableNote: '真理値表では、最初の行（0,0→0）以外はすべて出力1になることが特徴的です。',
          realWorldAnalogy: [
            '緊急停止システムのような判断：「手動停止ボタン または 異常センサー検知」のどちらか一つでも作動すると停止',
            'ログイン認証のような考え方：「パスワード認証 または 生体認証」のどちらか一つでも成功すればアクセス可能',
            '警報システムのような論理：「煙の検知 または 高温の検知」のどちらか一つでも反応すれば警報発動'
          ],
          whyImportant: 'ORゲートは「選択肢と冗長性」を表現します。複数の手段や経路がある場合に、どれか一つでも利用可能であれば目的を達成できるという柔軟な思考の基礎となります。',
          technicalInsight: 'マルチパス設計や冗長システムの基本概念です。システムの可用性と信頼性を高めるために、複数の入力のうち少なくとも一つが有効であれば動作を継続する仕組みを作ります。',
          learningTip: 'ANDゲートと比較してみてください。同じ入力でも「すべて必要」と「どれか一つでも」で結果がどう変わるか実験してみましょう。'
        };

      case 'NOT':
        return {
          title: 'NOTゲート（論理否定）',
          icon: '🔄',
          basicOperation: '入力が1（ON）なら出力は0（OFF）、入力が0（OFF）なら出力は1（ON）になります。完全に逆転させます。',
          truthTableNote: '真理値表は2行だけのシンプルな構造で、入力と出力が必ず逆になります。',
          realWorldAnalogy: [
            '照明スイッチのような動作：「現在OFFなら点灯、現在ONなら消灯」という逆転操作',
            'エレベーターのような判断：「扉が開いていない」時のみ動作という否定的条件',
            '在庫管理のような考え方：「商品が不足していない」= 「商品が十分にある」という論理'
          ],
          whyImportant: 'NOTゲートは「逆転思考」と「否定条件」を扱う基本です。「〜でない場合」や「〜の逆」という概念は、安全設計や条件分岐において極めて重要です。',
          technicalInsight: '唯一の単入力ゲートで、他のすべてのゲートと組み合わせることで様々な論理を構築できます。補数信号の生成や論理の反転に不可欠です。',
          learningTip: 'INPUTゲートをダブルクリックして状態を切り替えながら、NOTゲートの出力が必ず逆になることを確認してください。シンプルですが非常に重要な動作です。'
        };

      case 'XOR':
        return {
          title: 'XORゲート（排他的論理和）',
          icon: '✨',
          basicOperation: '「どちらか片方だけ」が1（ON）の時に出力が1（ON）。同じ値（00または11）の時は出力が0（OFF）になります。',
          truthTableNote: '「違い」を検出する魔法の動作です。入力が異なる時のみ1を出力します。',
          realWorldAnalogy: [
            '秘密の扉のような判断：「鍵A または 鍵B のどちらか片方だけ」で開く特殊な錠前',
            '警備システムのような考え方：「センサー1とセンサー2の状態が違う」時に異常信号',
            'バランス検知のような論理：「左右の重さが違う」時にアラームという天秤システム'
          ],
          whyImportant: 'XORゲートは「違いの検出」と「排他性」を表現します。暗号化、誤り検出、比較処理など、情報の「差分」を扱うあらゆる分野で不可欠です。',
          technicalInsight: '暗号化技術の基礎要素として革命的な役割を果たします。A⊕A=0、A⊕0=Aという自己消去性により、可逆計算や量子コンピュータの基本演算となっています。',
          learningTip: '同じ値を入力した時（00や11）と違う値を入力した時（01や10）で出力がどう変わるか実験してみてください。「違い検知器」としての面白さが分かります。'
        };

      case 'NAND':
        return {
          title: 'NANDゲート（否定論理積）',
          icon: '⚡',
          basicOperation: 'ANDゲートの出力を反転したもの。すべての入力が1（ON）の時のみ出力が0（OFF）になり、それ以外は1（ON）です。',
          truthTableNote: 'ANDの真逆で、「全部揃った時だけNO」という特殊な判定をします。',
          realWorldAnalogy: [
            '安全装置のような判断：「全ての条件が危険状態」の時のみ緊急停止という保護システム',
            '品質管理のような考え方：「全部が完璧」でない限り合格という柔軟な基準',
            'チーム判定のような論理：「全員が反対」でない限り企画続行という民主的決定'
          ],
          whyImportant: 'NANDゲートは「万能ゲート」として、すべての論理演算を単独で実現できます。製造コストと設計の単純化において革命的な意味を持ちます。',
          technicalInsight: '論理的完全性を持つため、NANDだけで任意の論理回路を構築可能。TTL技術の基盤となり、初期のコンピュータ設計を支えた歴史的に重要なゲートです。',
          learningTip: 'ANDゲートと比較して、出力が完全に逆になることを確認してください。「万能性」を体感するため、NANDだけでNOTやORを作る実験も面白いです。'
        };

      case 'NOR':
        return {
          title: 'NORゲート（否定論理和）',
          icon: '🌟',
          basicOperation: 'ORゲートの出力を反転したもの。すべての入力が0（OFF）の時のみ出力が1（ON）になり、一つでも1があると出力は0（OFF）です。',
          truthTableNote: '「何もない状態」でのみ動作する、清浄性を重視した判定です。',
          realWorldAnalogy: [
            'クリーンルームのような判断：「一切の汚染がない」時のみ作業開始という厳格な環境管理',
            '静寂センサーのような考え方：「すべての音源が静か」な時のみ録音開始という音響システム',
            '完全リセットのような論理：「全ての警告が消えた」時のみ正常運転という安全確認'
          ],
          whyImportant: 'NORゲートは「清浄状態の検出」と「フェイルセーフ設計」の基礎です。NANDと同じ万能性を持ちながら、異なる製造プロセスで有利な特性を示します。',
          technicalInsight: 'CMOS技術では、NORゲートの方が効率的な場合があります。ECL回路の基本要素として高速デジタル通信で活躍し、設計者に選択肢を提供します。',
          learningTip: 'ORゲートとの違いを確認し、「すべてがクリア」という条件でのみ動作する特殊性を体感してください。安全システムの基本思想が理解できます。'
        };

      case 'INPUT':
        return {
          title: 'INPUTゲート（入力制御）',
          icon: '🎮',
          basicOperation: 'ダブルクリックでON（1）/OFF（0）を切り替え。シングルクリックでは選択のみ。この直感的な操作で回路に生命を吹き込みます。',
          truthTableNote: '外部からの信号を回路内に取り込む最初の関門として機能します。',
          realWorldAnalogy: [
            'コンサートホールのような入口：「観客（信号）が入場」することで会場（回路）に活気をもたらす',
            'レストランの注文のような役割：「お客様のリクエスト」を厨房（回路）に伝える窓口',
            '図書館の受付のような機能：「利用者の要求」を館内システムに入力する最初の接点'
          ],
          whyImportant: 'INPUTゲートは「外界とデジタル世界の架け橋」です。どんなに優秀な回路も、適切な入力なしには何も始まりません。すべての情報処理の出発点となります。',
          technicalInsight: '現実のシステムでは、アナログ信号をデジタル信号に変換するADコンバータや、外部機器からの信号を受け取るGPIOピンとして実装されます。',
          learningTip: 'このツールでは最も基本的な操作です。ダブルクリックで状態を変更し、他のゲートへの影響を観察することで、信号の流れを理解しましょう。'
        };

      case 'OUTPUT':
        return {
          title: 'OUTPUTゲート（出力表示）',
          icon: '💡',
          basicOperation: '接続された信号の状態を💡ライトで視覚化。ON（1）の時は明るく光り、OFF（0）の時は暗くなります。',
          truthTableNote: '回路の「答え」を人間が理解できる形で表示する重要な役割を担います。',
          realWorldAnalogy: [
            '劇場の照明のような表現：「舞台（回路）の状況」を観客（ユーザー）に美しく伝える',
            '病院のモニターのような機能：「患者（信号）の状態」を医師（エンジニア）に正確に表示',
            '天気予報の表示のような役割：「大気（回路内部）の状況」を市民（利用者）に分かりやすく提示'
          ],
          whyImportant: 'OUTPUTゲートは「デジタル思考の可視化」を実現します。内部処理がどれほど複雑でも、結果を理解可能な形で提示することがユーザビリティの核心です。',
          technicalInsight: '実際のシステムでは、LED、ディスプレイ、スピーカー、モーターなど様々な出力デバイスとして実装され、人間とシステムの対話を可能にします。',
          learningTip: '回路の「答え合わせ」ができる場所です。期待した結果が出ているか確認し、回路設計の正しさを検証してください。'
        };

      case 'CLOCK':
        return {
          title: 'CLOCKゲート（クロック信号）',
          icon: '⏰',
          basicOperation: '一定の間隔で0→1→0を繰り返す周期的な信号を生成。この「鼓動」がデジタル回路に時間の概念をもたらします。',
          truthTableNote: '時間軸に沿った周期的な変化で、固定的な入出力関係を持ちません。',
          realWorldAnalogy: [
            'オーケストラの指揮者のような役割：「全楽器（回路）」を同じリズムで演奏させる統率者',
            '工場のベルトコンベアのような機能：「すべての工程（処理）」を一定のタイミングで進める制御装置',
            '学校のチャイムのような存在：「全クラス（システム）」の時間割を同期させる基準信号'
          ],
          whyImportant: 'CLOCKゲートは「デジタル世界の心臓」として、すべての同期動作を司ります。これなしには複雑なシステムの協調動作は不可能です。',
          technicalInsight: '現代のコンピュータでは数GHzの超高速で動作し、プロセッサの性能指標の基準となります。クロックドメインの設計は、大規模システム設計の最重要課題です。',
          learningTip: '右パネルで周波数を変更して、タイミングの重要性を体感してください。フリップフロップと組み合わせると、同期動作の神秘を体験できます。'
        };

      case 'D-FF':
        return {
          title: 'D型フリップフロップ（D-FF）',
          icon: '💾',
          basicOperation: 'クロック信号の立ち上がりエッジ（0→1の瞬間）で、D入力の値をQ出力に「記憶」します。クロックがない間は前の値を保持し続けます。',
          truthTableNote: 'タイミング依存の動作で、クロックエッジでのみ状態が更新される特殊な性質を持ちます。',
          realWorldAnalogy: [
            '写真のシャッターのような機能：「決定的瞬間（クロックエッジ）」でその時の状況（D入力）を永続保存',
            '銀行の金庫のような仕組み：「特定の時刻（クロック）」にのみ開いて新しい内容（D値）を格納',
            '日記の記録のような動作：「毎日決まった時間（クロック）」にその日の出来事（D入力）を書き留める'
          ],
          whyImportant: 'D-FFは「デジタル記憶の基本単位」として、現代コンピュータのメモリとレジスタの根幹を支えます。情報の一時保存と同期処理に不可欠です。',
          technicalInsight: 'CPUレジスタ、SRAM、パイプライン制御の基礎要素です。セットアップ/ホールドタイムの概念は、高速デジタル設計の重要な制約となります。',
          learningTip: 'CLOCKゲートと組み合わせて、「値を記憶する瞬間」を観察してください。クロックが止まっても値が保持される「記憶」の概念を体感できます。'
        };

      case 'SR-LATCH':
        return {
          title: 'SRラッチ（Set-Reset Latch）',
          icon: '🔐',
          basicOperation: 'S（Set）を1にすると出力Qが1になり記憶、R（Reset）を1にすると出力Qが0になりリセット、S=0,R=0では前の状態を保持します。',
          truthTableNote: 'S=1,R=1は禁止状態として、予測不能な動作を示す特殊な性質があります。',
          realWorldAnalogy: [
            '電源スイッチのような動作：「ONボタン（Set）」で点灯、「OFFボタン（Reset）」で消灯、どちらも押さなければ現状維持',
            '警報システムのような機能：「異常検知（Set）」で警報開始、「手動リセット（Reset）」で警報停止という一度発動型',
            '会議室の使用状況のような管理：「使用開始（Set）」で占有、「使用終了（Reset）」で解放という状態管理'
          ],
          whyImportant: 'SRラッチは「最初のメモリ素子」として、デジタル記憶の歴史を切り開きました。非同期動作と状態保持の基本概念を体現しています。',
          technicalInsight: '1918年のエクルス・ジョーダン回路に起源を持つ100年以上の歴史があります。現代でもデバウンス回路や電源管理回路の重要な構成要素です。',
          learningTip: 'SetとResetの操作で状態がどう変わるか実験してください。「記憶するタイミング」を自由に制御できる面白さと、禁止状態の危険性を体感しましょう。'
        };

      case 'MUX':
        return {
          title: 'マルチプレクサ（MUX）',
          icon: '🎛️',
          basicOperation: 'セレクト信号S（選択信号）の値に応じて、S=0の時はA入力を、S=1の時はB入力を出力Yに接続します。デジタル切り替えスイッチです。',
          truthTableNote: '選択信号によって「どの入力を通すか」が決まる、条件分岐を物理的に実現した回路です。',
          realWorldAnalogy: [
            '鉄道の分岐器のような機能：「進路選択（セレクト信号）」に応じて列車（データ）を適切な線路（出力）に導く',
            'テレビのチャンネル切り替えのような操作：「チャンネルボタン（セレクト）」で複数の放送（入力）から一つを選択',
            'エレベーターの階選択のような仕組み：「押したボタン（セレクト）」に応じて適切な階（出力）に移動'
          ],
          whyImportant: 'MUXは「選択と効率性」を実現します。限られた配線で複数の信号を扱い、条件に応じた分岐処理をハードウェアレベルで実現する重要な要素です。',
          technicalInsight: 'CPU内のALU、メモリアクセス、データパス制御の基礎となります。時分割多重化通信や、プログラムのif-else文のハードウェア実装としても活躍します。',
          learningTip: 'セレクト信号を変更しながら、どの入力が出力に現れるか観察してください。「選択」という概念をハードウェアで体験できる面白い回路です。'
        };

      default:
        return {
          title: `${gateType}ゲート`,
          icon: '⚙️',
          basicOperation: 'このゲートの詳細説明は準備中です。基本的な論理演算や特殊機能を提供します。',
          realWorldAnalogy: ['詳細な解説は今後のアップデートで追加予定です。'],
          whyImportant: 'デジタル回路の重要な構成要素として機能します。',
          learningTip: '基本的な動作を確認し、他のゲートとの組み合わせを試してみてください。'
        };
    }
  };

  // 美しいJSXレンダリング関数
  const renderGateDescription = (gateType: string) => {
    const data = getGateDescriptionData(gateType);
    
    return (
      <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.9)' }}>
        {/* メインタイトル */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '12px',
          borderBottom: '2px solid rgba(0, 255, 136, 0.3)'
        }}>
          <span style={{ fontSize: '24px' }}>{data.icon}</span>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#00ff88'
          }}>
            {data.title}
          </h2>
        </div>

        {/* 基本動作 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #00ff88',
            paddingLeft: '12px'
          }}>
            基本動作
          </h3>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            {data.basicOperation}
          </p>
          {data.truthTableNote && (
            <p style={{ 
              margin: '12px 0 0 0', 
              padding: '12px',
              backgroundColor: 'rgba(0, 255, 136, 0.05)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              💡 {data.truthTableNote}
            </p>
          )}
        </div>

        {/* 日常的な判断との類比 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #00ff88',
            paddingLeft: '12px'
          }}>
            日常的な判断との類比
          </h3>
          {data.realWorldAnalogy.map((analogy, index) => (
            <div key={index} style={{
              margin: '8px 0',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderLeft: '3px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '4px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {analogy}
            </div>
          ))}
        </div>

        {/* なぜ重要？ */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            color: '#00ff88',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #00ff88',
            paddingLeft: '12px'
          }}>
            なぜ重要？
          </h3>
          <p style={{ margin: 0, lineHeight: '1.6' }}>
            {data.whyImportant}
          </p>
        </div>

        {/* 技術的洞察 */}
        {data.technicalInsight && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              color: '#ff6699',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              borderLeft: '4px solid #ff6699',
              paddingLeft: '12px'
            }}>
              技術的洞察
            </h3>
            <p style={{ 
              margin: 0, 
              lineHeight: '1.6',
              padding: '12px',
              backgroundColor: 'rgba(255, 102, 153, 0.05)',
              border: '1px solid rgba(255, 102, 153, 0.2)',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              {data.technicalInsight}
            </p>
          </div>
        )}

        {/* 学習のコツ */}
        <div>
          <h3 style={{
            color: '#ffd700',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            borderLeft: '4px solid #ffd700',
            paddingLeft: '12px'
          }}>
            学習のコツ
          </h3>
          <p style={{ 
            margin: 0, 
            lineHeight: '1.6',
            padding: '12px',
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            💡 {data.learningTip}
          </p>
        </div>
      </div>
    );
  };

  // 詳細説明表示ハンドラ
  const handleShowDetail = () => {
    // すべての実行中のCLOCKゲートを一時停止
    const runningClocks = gates.filter(g => g.type === 'CLOCK' && g.metadata?.isRunning);
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
    const runningClocks = gates.filter(g => g.type === 'CLOCK' && g.metadata?.isRunning);
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

    if (isCustomGate(selectedGate) && selectedGate.customGateDefinition?.truthTable) {
      // カスタムゲートの場合
      const definition = selectedGate.customGateDefinition;
      const inputNames = definition.inputs.map(input => input.name);
      const outputNames = definition.outputs.map(output => output.name);
      
      const table = Object.entries(definition.truthTable).map(([inputs, outputs]) => ({
        inputs,
        outputs,
        inputValues: inputs.split('').map(bit => bit === '1'),
        outputValues: outputs.split('').map(bit => bit === '1')
      }));
      
      const result = {
        table,
        inputCount: definition.inputs.length,
        outputCount: definition.outputs.length,
        isSequential: false,
        recognizedPattern: definition.recognizedPattern
      };
      
      setTruthTableData({
        result,
        inputNames,
        outputNames,
        gateName: definition.displayName
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
          const inputs = selectedGate.type === 'NOT' ? 
            row.a.toString() : 
            `${row.a}${row.b}`;
          const outputs = row.out.toString();
          
          return {
            inputs,
            outputs,
            inputValues: inputs.split('').map(bit => bit === '1'),
            outputValues: outputs.split('').map(bit => bit === '1')
          };
        });
        
        setTruthTableData({
          result: {
            table,
            inputCount: inputNames.length,
            outputCount: 1,
            isSequential: false,
            recognizedPattern: selectedGate.type
          },
          inputNames,
          outputNames,
          gateName
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
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: '20px 0'
          }}>
            ゲートを選択すると<br />
            詳細情報が表示されます
          </p>
        </div>
      </aside>
    );
  }

  const getTruthTable = () => {
    // カスタムゲートの場合
    if (isCustomGate(selectedGate) && selectedGate.customGateDefinition?.truthTable) {
      const definition = selectedGate.customGateDefinition;
      return Object.entries(definition.truthTable).map(([inputs, outputs]) => {
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

  const truthTable = getTruthTable();

  const getGateDescription = () => {
    // カスタムゲートの場合
    if (isCustomGate(selectedGate) && selectedGate.customGateDefinition) {
      const definition = selectedGate.customGateDefinition;
      let description = definition.description || 'ユーザー定義のカスタムゲートです。';
      
      if (definition.recognizedPattern) {
        description += ` このゲートは${definition.recognizedPattern}のパターンとして認識されています。`;
      }
      
      return description;
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
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
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
          flexDirection: 'column'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: 'rgba(0, 255, 136, 0.05)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#00ff88'
          }}>
            📖 {isCustomGate(selectedGate) && selectedGate.customGateDefinition ? 
              selectedGate.customGateDefinition.displayName : 
              `${selectedGate.type}ゲート`} の詳細説明
          </h2>
          <button
            onClick={(e) => {
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
              transition: 'all 0.2s ease'
            }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
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
            <span>選択中: {isCustomGate(selectedGate) && selectedGate.customGateDefinition ? 
              selectedGate.customGateDefinition.displayName : 
              `${selectedGate.type}ゲート`}</span>
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
            <span className="property-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {selectedGate.id}
            </span>
          </div>
          <div className="property-row">
            <span className="property-label">位置</span>
            <span className="property-value">
              X: {Math.round(selectedGate.position.x)}, Y: {Math.round(selectedGate.position.y)}
            </span>
          </div>
          {/* 現在の状態表示 */}
          <div className="property-row">
            <span className="property-label">現在の状態</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* 入力状態 */}
              {selectedGate.inputs && selectedGate.inputs.length > 0 && (
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  入力: [{selectedGate.inputs.join(',')}]
                </span>
              )}
              {/* 出力状態 */}
              <span style={{ 
                fontSize: '12px', 
                color: selectedGate.output ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: '600'
              }}>
                出力: {selectedGate.output ? '1' : '0'}
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
                gap: '8px'
              }}
            >
              📖 詳細説明を表示
            </button>
            
            {/* 基本ゲートとカスタムゲートのみ真理値表ボタン表示 */}
            {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'].includes(selectedGate.type) || 
              (isCustomGate(selectedGate) && selectedGate.customGateDefinition?.truthTable)) && (
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
                  gap: '8px'
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
              <span className="property-value" style={{ color: '#00ff88', fontWeight: '600' }}>
                {selectedGate.metadata?.frequency || 1} Hz
              </span>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                周波数を変更
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {[1, 2, 5, 10].map(freq => (
                  <button
                    key={freq}
                    onClick={() => updateClockFrequency(selectedGate.id, freq)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: (selectedGate.metadata?.frequency || 1) === freq ? '#00ff88' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${(selectedGate.metadata?.frequency || 1) === freq ? '#00ff88' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: (selectedGate.metadata?.frequency || 1) === freq ? '#000' : '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {freq}Hz
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.1)',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.4'
              }}>
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