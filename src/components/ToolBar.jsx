import React from 'react';
import GateIcon from './UI/GateIcon';

const ToolBar = ({ selectedTool, onToolSelect }) => {
  const tools = [
    { id: 'and', label: 'AND', type: 'gate', tip: '両方の入力がONの時ONを出力' },
    { id: 'or', label: 'OR', type: 'gate', tip: 'どちらかの入力がONの時ONを出力' },
    { id: 'not', label: 'NOT', type: 'gate', tip: '入力を反転して出力' },
    { id: 'input', label: '入力', type: 'io', tip: 'クリックでON/OFFを切り替え' },
    { id: 'output', label: '出力', type: 'io', tip: '接続された信号を表示' },
    { id: 'wire', label: '配線', type: 'action', tip: '出力端子から入力端子へドラッグ' },
    { id: 'delete', label: '削除', type: 'action', tip: 'クリックで削除' }
  ];

  const getIcon = (toolId) => {
    switch (toolId) {
      case 'input':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="8" width="10" height="8" strokeWidth="2" rx="1" />
            <path d="M13 12h8m-4-4l4 4-4 4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'output':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="11" y="8" width="10" height="8" strokeWidth="2" rx="1" />
            <path d="M11 12H3" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'wire':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12h16" strokeWidth="2" strokeLinecap="round" />
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <circle cx="20" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return <GateIcon type={toolId.toUpperCase()} className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            title={tool.tip}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
              ${selectedTool === tool.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {getIcon(tool.id)}
            <span className="font-medium">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolBar;