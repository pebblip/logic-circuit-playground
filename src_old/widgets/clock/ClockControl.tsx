import React, { useState, useEffect } from 'react';
import { UltraModernCircuitViewModel } from '../features/circuit-editor/model/UltraModernCircuitViewModel';

interface ClockControlProps {
  gateId: string;
  viewModel: UltraModernCircuitViewModel;
}

export const ClockControl: React.FC<ClockControlProps> = ({ gateId, viewModel }) => {
  const [clockState, setClockState] = useState<{ isRunning: boolean; interval: number } | null>(null);
  const [intervalInput, setIntervalInput] = useState('1000');

  useEffect(() => {
    const updateState = () => {
      const state = viewModel.getClockState(gateId);
      setClockState(state);
      if (state) {
        setIntervalInput(state.interval.toString());
      }
    };

    updateState();

    // ViewModelのイベントを監視
    const handleClockStateChange = (id: string, isRunning: boolean) => {
      if (id === gateId) {
        updateState();
      }
    };

    const handleClockIntervalChange = (id: string, interval: number) => {
      if (id === gateId) {
        updateState();
      }
    };

    viewModel.on('clockStateChanged', handleClockStateChange);
    viewModel.on('clockIntervalChanged', handleClockIntervalChange);

    return () => {
      viewModel.off('clockStateChanged', handleClockStateChange);
      viewModel.off('clockIntervalChanged', handleClockIntervalChange);
    };
  }, [gateId, viewModel]);

  if (!clockState) {
    return null;
  }

  const handleStartStop = () => {
    if (clockState.isRunning) {
      viewModel.stopClock(gateId);
    } else {
      viewModel.startClock(gateId);
    }
  };

  const handleIntervalChange = () => {
    const newInterval = parseInt(intervalInput, 10);
    if (!isNaN(newInterval) && newInterval > 0) {
      viewModel.setClockInterval(gateId, newInterval);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
      <h3 className="text-white font-semibold mb-3">クロック制御</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-sm block mb-1">状態</label>
          <button
            onClick={handleStartStop}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
              clockState.isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {clockState.isRunning ? '停止' : '開始'}
          </button>
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1">
            インターバル (ミリ秒)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={intervalInput}
              onChange={(e) => setIntervalInput(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
              step="100"
            />
            <button
              onClick={handleIntervalChange}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              設定
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full mr-2 ${
            clockState.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }"></span>
          {clockState.isRunning ? '動作中' : '停止中'} - {clockState.interval}ms
        </div>
      </div>
    </div>
  );
};