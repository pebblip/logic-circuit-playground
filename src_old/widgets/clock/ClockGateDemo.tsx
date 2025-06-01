import React, { useState, useEffect } from 'react';
import { ClockGate } from '../entities/gates/ClockGate';

/**
 * クロックゲートの使い方デモ
 */
export const ClockGateDemo: React.FC = () => {
  const [clockGate] = useState(() => new ClockGate('demo-clock', { x: 100, y: 100 }, 1000));
  const [outputValue, setOutputValue] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState('1000');

  useEffect(() => {
    // クロックゲートの出力を監視
    const checkOutput = () => {
      const output = clockGate.getOutputs()[0];
      setOutputValue(output.value);
    };

    // コールバックを設定
    clockGate.onToggle = checkOutput;
    
    return () => {
      clockGate.destroy();
    };
  }, [clockGate]);

  const handleStartStop = () => {
    if (isRunning) {
      clockGate.stop();
      setIsRunning(false);
    } else {
      clockGate.start();
      setIsRunning(true);
    }
  };

  const handleIntervalChange = () => {
    const newInterval = parseInt(interval, 10);
    if (!isNaN(newInterval) && newInterval > 0) {
      clockGate.setInterval(newInterval);
    }
  };

  const handleManualToggle = () => {
    clockGate.toggle();
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">🕐 クロックゲートの使い方</h1>
      
      <div className="max-w-2xl space-y-6">
        {/* 説明 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">クロックゲートとは？</h2>
          <p className="text-gray-300 mb-4">
            クロックゲートは、一定の間隔で自動的にON/OFFを繰り返す特殊なゲートです。
            デジタル回路のタイミング制御に使用されます。
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>定期的なパルス信号を生成</li>
            <li>インターバル（周期）を自由に設定可能</li>
            <li>開始/停止の制御が可能</li>
            <li>手動でのトグルも可能</li>
          </ul>
        </div>

        {/* デモ */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">動作デモ</h2>
          
          {/* 出力表示 */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-lg">現在の出力:</span>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
              outputValue ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              {outputValue ? '1' : '0'}
            </div>
            <div className={`w-4 h-4 rounded-full ${
              outputValue ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
            }`} />
          </div>

          {/* コントロール */}
          <div className="space-y-4">
            {/* 開始/停止 */}
            <div>
              <button
                onClick={handleStartStop}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRunning ? '⏸ 停止' : '▶️ 開始'}
              </button>
            </div>

            {/* インターバル設定 */}
            <div>
              <label className="block text-sm mb-2">インターバル（ミリ秒）:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="bg-gray-700 rounded px-3 py-2 w-32"
                  min="100"
                  step="100"
                />
                <button
                  onClick={handleIntervalChange}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
                >
                  設定
                </button>
              </div>
            </div>

            {/* 手動トグル */}
            <div>
              <button
                onClick={handleManualToggle}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium"
              >
                🔄 手動トグル
              </button>
            </div>
          </div>
        </div>

        {/* 使用例 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">使用例</h2>
          <div className="space-y-3 text-gray-300">
            <p>1. <strong>カウンター回路</strong>: クロック信号でカウントアップ</p>
            <p>2. <strong>シーケンサー</strong>: 順番に処理を実行</p>
            <p>3. <strong>タイミング制御</strong>: 複数の処理を同期</p>
            <p>4. <strong>アニメーション</strong>: LEDの点滅パターン生成</p>
          </div>
        </div>

        {/* 実装方法 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">論理回路プレイグラウンドでの使い方</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>ツールパレットの「入出力」カテゴリから「クロック」を選択</li>
            <li>キャンバスにドラッグ＆ドロップで配置</li>
            <li>クロックゲートを選択すると、右パネルに制御が表示</li>
            <li>「開始」ボタンでクロック動作を開始</li>
            <li>インターバルを調整して速度を変更</li>
            <li>他のゲートと接続して回路を構築</li>
          </ol>
        </div>
      </div>
    </div>
  );
};