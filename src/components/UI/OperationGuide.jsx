import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer, 
  Move, 
  Cable, 
  Trash2, 
  Save, 
  Upload,
  Keyboard,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  PlayCircle,
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const OperationGuide = () => {
  const [expandedSections, setExpandedSections] = useState(['basic']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: 'basic',
      title: '基本操作',
      icon: MousePointer,
      items: [
        {
          icon: <MousePointer className="w-4 h-4" />,
          title: 'ゲートの配置',
          description: '左側のツールバーからゲートをドラッグしてキャンバスに配置します',
          tips: ['ドラッグ中はグリッドにスナップされます', 'ESCキーでドラッグをキャンセル']
        },
        {
          icon: <Move className="w-4 h-4" />,
          title: 'ゲートの移動',
          description: '配置されたゲートをドラッグして移動できます',
          tips: ['Shiftを押しながら複数選択可能', 'グリッドスナップはCtrlで無効化']
        },
        {
          icon: <Cable className="w-4 h-4" />,
          title: '接続の作成',
          description: 'ゲートの出力ポートから入力ポートへドラッグして接続します',
          tips: ['接続中の線は自動的に経路を計算', '既存の接続をクリックで選択']
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          title: '削除',
          description: '選択したゲートや接続を削除します',
          tips: ['Deleteキーまたは右クリックメニューから削除', 'Ctrl+Zで元に戻す']
        }
      ]
    },
    {
      id: 'shortcuts',
      title: 'キーボードショートカット',
      icon: Keyboard,
      items: [
        {
          keys: ['Ctrl', 'Z'],
          action: '元に戻す',
          description: '直前の操作を取り消します'
        },
        {
          keys: ['Ctrl', 'Y'],
          action: 'やり直し',
          description: '取り消した操作をやり直します'
        },
        {
          keys: ['Delete'],
          action: '削除',
          description: '選択したアイテムを削除します'
        },
        {
          keys: ['Ctrl', 'A'],
          action: 'すべて選択',
          description: 'キャンバス上のすべてのゲートを選択します'
        },
        {
          keys: ['Ctrl', 'S'],
          action: '保存',
          description: '現在の回路を保存します'
        },
        {
          keys: ['Ctrl', 'O'],
          action: '開く',
          description: '保存した回路を開きます'
        },
        {
          keys: ['Space'],
          action: 'パン',
          description: 'スペースを押しながらドラッグでキャンバスを移動'
        },
        {
          keys: ['Shift'],
          action: '複数選択',
          description: 'Shiftを押しながらクリックで複数選択'
        },
        {
          keys: ['ESC'],
          action: 'キャンセル',
          description: '現在の操作をキャンセルします'
        }
      ]
    },
    {
      id: 'advanced',
      title: '高度な操作',
      icon: Layers,
      items: [
        {
          icon: <Grid className="w-4 h-4" />,
          title: 'グリッドスナップ',
          description: 'ゲートの配置時に自動的にグリッドに吸着します',
          tips: ['Ctrlキーでグリッドスナップを一時的に無効化', 'グリッドサイズは設定で変更可能']
        },
        {
          icon: <ZoomIn className="w-4 h-4" />,
          title: 'ズーム操作',
          description: 'マウスホイールまたはピンチジェスチャーでズーム',
          tips: ['Ctrl+0でズームリセット', 'ダブルクリックで該当エリアにズーム']
        },
        {
          icon: <PlayCircle className="w-4 h-4" />,
          title: 'シミュレーション',
          description: '回路は自動的にリアルタイムでシミュレーションされます',
          tips: ['スイッチをクリックして入力を変更', 'LEDで出力を確認']
        },
        {
          icon: <Layers className="w-4 h-4" />,
          title: '複数選択と操作',
          description: '複数のゲートを選択して一括操作できます',
          tips: ['ドラッグで範囲選択', 'Shiftクリックで追加選択', 'グループ移動可能']
        }
      ]
    },
    {
      id: 'tips',
      title: 'ヒントとコツ',
      icon: Info,
      items: [
        {
          title: '効率的な回路設計',
          points: [
            '入力（スイッチ）を左側、出力（LED）を右側に配置',
            '信号の流れを左から右へ統一',
            '複雑な回路は小さな部分から構築',
            'コメント機能で回路の説明を追加'
          ]
        },
        {
          title: 'デバッグのコツ',
          points: [
            '接続線の色で信号状態を確認（赤=1、グレー=0）',
            '各ゲートの出力をLEDで確認',
            '真理値表パネルで期待値と比較',
            'ステップ実行で信号の伝播を確認'
          ]
        },
        {
          title: 'パフォーマンス最適化',
          points: [
            '不要な接続は削除',
            '大規模回路は複数の小回路に分割',
            'フィードバックループに注意',
            '定期的に保存'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'トラブルシューティング',
      icon: Info,
      items: [
        {
          problem: '接続ができない',
          solutions: [
            '入力ポートに既に接続がないか確認',
            '出力から入力への方向で接続',
            'ゲート同士が近すぎないか確認'
          ]
        },
        {
          problem: '回路が動作しない',
          solutions: [
            'すべての入力が接続されているか確認',
            'フィードバックループがないか確認',
            '電源（スイッチ）が正しく配置されているか確認'
          ]
        },
        {
          problem: 'パフォーマンスが悪い',
          solutions: [
            '大量のゲートを削減',
            '不要なアニメーションを無効化',
            'ブラウザのハードウェアアクセラレーションを有効化'
          ]
        }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-3">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Section Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 
                     bg-gray-750 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-200">{section.title}</span>
            </div>
            {expandedSections.includes(section.id) ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Section Content */}
          {expandedSections.includes(section.id) && (
            <div className="p-4 bg-gray-800 space-y-4">
              {section.id === 'basic' || section.id === 'advanced' ? (
                // Basic and Advanced sections
                section.items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-blue-400">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-200">{item.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                        {item.tips && (
                          <ul className="mt-2 space-y-1">
                            {item.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-xs text-gray-500 flex items-start gap-1">
                                <span className="text-gray-600 mt-0.5">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : section.id === 'shortcuts' ? (
                // Shortcuts section
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 
                                              bg-gray-750 rounded-lg">
                      <div className="flex items-center gap-2">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && <span className="text-gray-500">+</span>}
                            <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 
                                          rounded text-xs font-mono text-gray-300">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-200">{shortcut.action}</div>
                        <div className="text-xs text-gray-500">{shortcut.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : section.id === 'tips' ? (
                // Tips section
                section.items.map((tip, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-gray-200">{tip.title}</h4>
                    <ul className="space-y-1">
                      {tip.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                // Troubleshooting section
                section.items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-red-400">問題: {item.problem}</h4>
                    <div className="pl-4 space-y-1">
                      <p className="text-sm text-gray-300 font-medium">解決方法:</p>
                      <ul className="space-y-1">
                        {item.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      ))}

      {/* Quick Start */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h3 className="font-medium text-blue-400 mb-2">クイックスタート</h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-blue-400">1.</span>
            左のツールバーからANDゲートをドラッグ
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">2.</span>
            スイッチを2つ、LEDを1つ配置
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">3.</span>
            スイッチの出力をANDゲートの入力に接続
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">4.</span>
            ANDゲートの出力をLEDに接続
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">5.</span>
            スイッチをクリックして動作確認！
          </li>
        </ol>
      </div>
    </div>
  );
};

export default OperationGuide;