import React, { useState } from 'react';
import { demoCircuits, DemoCircuit } from '../data/demoCircuits';
import { X, Search, ChevronDown, ChevronRight, Star, Lock } from 'lucide-react';

interface DemoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemo: (circuitData: any) => void;
}

const DemoGallery: React.FC<DemoGalleryProps> = ({ isOpen, onClose, onLoadDemo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['算術演算'])
  );

  if (!isOpen) return null;

  // カテゴリ別にグループ化
  const groupedCircuits = demoCircuits.reduce((acc, circuit) => {
    if (!acc[circuit.category]) {
      acc[circuit.category] = [];
    }
    acc[circuit.category].push(circuit);
    return acc;
  }, {} as Record<string, DemoCircuit[]>);

  // 検索フィルタ
  const filteredGroups = Object.entries(groupedCircuits).reduce((acc, [category, circuits]) => {
    const filtered = circuits.filter(
      circuit =>
        circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, DemoCircuit[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getDifficultyStars = (difficulty: string) => {
    const filled = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <Star
            key={i}
            size={12}
            className={i <= filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '算術演算': return '🧮';
      case '記憶素子': return '💾';
      case '順序回路': return '🔄';
      case 'チャレンジ': return '🎯';
      default: return '📁';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📚 デモ回路ギャラリー
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* デモリスト */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
          {Object.entries(filteredGroups).map(([category, circuits]) => (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 w-full text-left text-white hover:text-blue-400 transition-colors mb-2"
              >
                {expandedCategories.has(category) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <span className="font-semibold">{category}</span>
              </button>

              {expandedCategories.has(category) && (
                <div className="ml-6 space-y-2">
                  {circuits.map((circuit) => (
                    <div
                      key={circuit.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{circuit.name}</h3>
                        {getDifficultyStars(circuit.difficulty)}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{circuit.description}</p>
                      
                      {circuit.circuitData.gates.length > 0 ? (
                        <button
                          onClick={() => {
                            onLoadDemo(circuit.circuitData);
                            onClose();
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                        >
                          試してみる
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-gray-700 text-gray-500 rounded-md text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock size={14} />
                          近日公開
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoGallery;