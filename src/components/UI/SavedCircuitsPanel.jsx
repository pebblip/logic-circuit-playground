import React, { useState } from 'react';
import { Trash2, Download, Calendar } from 'lucide-react';
import { colors } from '../../styles/design-tokens';

const SavedCircuitsPanel = ({ savedCircuits = [], onLoadCircuit, onSaveCircuit }) => {
  const [circuitName, setCircuitName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = () => {
    if (circuitName.trim()) {
      onSaveCircuit(circuitName.trim());
      setCircuitName('');
      setShowSaveDialog(false);
    }
  };

  const handleDelete = (index) => {
    if (window.confirm('この回路を削除しますか？')) {
      // TODO: Implement delete functionality
      console.log('Delete circuit at index:', index);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Save Button */}
      <div className="p-4 border-b border-gray-200">
        {showSaveDialog ? (
          <div className="space-y-2">
            <input
              type="text"
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              placeholder="回路の名前を入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!circuitName.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setCircuitName('');
                }}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            現在の回路を保存
          </button>
        )}
      </div>

      {/* Saved Circuits List */}
      <div className="flex-1 overflow-auto">
        {savedCircuits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <Download className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-sm">保存された回路がありません</p>
            <p className="text-xs mt-2">上のボタンから現在の回路を保存できます</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {savedCircuits.map((circuit, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {circuit.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(circuit.timestamp)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      ゲート: {circuit.gates?.length || 0} / 接続: {circuit.connections?.length || 0}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onLoadCircuit(circuit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="読み込む"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCircuitsPanel;