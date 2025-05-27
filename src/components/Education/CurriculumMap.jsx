import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  ChevronRight,
  Trophy,
  Clock,
  Target,
  BookOpen,
  Cpu,
  Calculator,
  Zap
} from 'lucide-react';
import { LEARNING_OBJECTIVES } from '../../constants/education';

const CurriculumMap = ({ 
  currentLevel, 
  completedObjectives, 
  currentObjective,
  onObjectiveSelect,
  earnedBadges 
}) => {
  const [expandedLevel, setExpandedLevel] = useState(currentLevel);
  
  const levels = [
    {
      id: 1,
      name: '基本ゲート',
      icon: <Zap className="w-5 h-5" />,
      description: '論理回路の基礎を学ぶ',
      estimatedTime: '2-3時間',
      color: 'blue'
    },
    {
      id: 2,
      name: 'メモリ要素',
      icon: <Cpu className="w-5 h-5" />,
      description: '状態を保持する回路',
      estimatedTime: '3-4時間',
      color: 'purple'
    },
    {
      id: 3,
      name: '演算回路',
      icon: <Calculator className="w-5 h-5" />,
      description: '計算を行う回路',
      estimatedTime: '4-5時間',
      color: 'green'
    },
    {
      id: 4,
      name: 'CPU要素',
      icon: <Cpu className="w-5 h-5" />,
      description: 'コンピュータの心臓部',
      estimatedTime: '5-6時間',
      color: 'orange',
      locked: true
    }
  ];
  
  const getObjectiveStatus = (objective) => {
    if (completedObjectives.includes(objective.id)) {
      return 'completed';
    }
    if (currentObjective === objective.id) {
      return 'current';
    }
    if (objective.id.includes('advanced') && !isBasicCompleted(objective)) {
      return 'locked';
    }
    return 'available';
  };
  
  const isBasicCompleted = (objective) => {
    // 基礎が完了しているかチェック
    const levelObjectives = LEARNING_OBJECTIVES[`level${currentLevel}`];
    if (!levelObjectives || !levelObjectives.basics) return false;
    
    return levelObjectives.basics.every(obj => 
      completedObjectives.includes(obj.id)
    );
  };
  
  const calculateLevelProgress = (levelId) => {
    const levelKey = `level${levelId}`;
    const objectives = LEARNING_OBJECTIVES[levelKey];
    if (!objectives) return 0;
    
    let total = 0;
    let completed = 0;
    
    Object.values(objectives).forEach(category => {
      category.forEach(obj => {
        total++;
        if (completedObjectives.includes(obj.id)) {
          completed++;
        }
      });
    });
    
    return total > 0 ? (completed / total) * 100 : 0;
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <div className="w-5 h-5 rounded-full bg-blue-500 animate-pulse" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getObjectiveIcon = (type) => {
    switch (type) {
      case 'truth_table':
        return '📊';
      case 'construction':
        return '🔨';
      case 'verification':
        return '✅';
      default:
        return '📝';
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">学習パス</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>バッジ: {earnedBadges.length}個</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>完了: {completedObjectives.length}個</span>
          </div>
        </div>
      </div>
      
      {/* レベル一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {levels.map((level) => {
          const progress = calculateLevelProgress(level.id);
          const isExpanded = expandedLevel === level.id;
          const isLocked = level.locked || level.id > currentLevel;
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: level.id * 0.1 }}
              className={`bg-white rounded-lg shadow-md overflow-hidden
                       ${isLocked ? 'opacity-50' : ''}`}
            >
              {/* レベルヘッダー */}
              <button
                onClick={() => !isLocked && setExpandedLevel(isExpanded ? null : level.id)}
                disabled={isLocked}
                className={`w-full p-4 flex items-center justify-between
                         ${isLocked ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${level.color}-100`}>
                    {level.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">
                      レベル {level.id}: {level.name}
                    </h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {level.estimatedTime}
                    </div>
                    <div className="text-sm font-medium">
                      {Math.round(progress)}% 完了
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 transition-transform
                             ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>
              
              {/* プログレスバー */}
              <div className="h-2 bg-gray-200">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${level.color}-400 to-${level.color}-600`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {/* 展開されたコンテンツ */}
              {isExpanded && !isLocked && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4 space-y-4">
                    {/* カテゴリごとに表示 */}
                    {Object.entries(LEARNING_OBJECTIVES[`level${level.id}`] || {}).map(
                      ([category, objectives]) => (
                        <div key={category}>
                          <h4 className="font-medium text-gray-700 mb-2 capitalize">
                            {category === 'basics' ? '基礎' : 
                             category === 'constructions' ? '構築' : '応用'}
                          </h4>
                          <div className="space-y-2">
                            {objectives.map((objective) => {
                              const status = getObjectiveStatus(objective);
                              
                              return (
                                <button
                                  key={objective.id}
                                  onClick={() => status !== 'locked' && onObjectiveSelect(objective)}
                                  disabled={status === 'locked'}
                                  className={`w-full p-3 rounded-lg border text-left
                                           transition-all flex items-center gap-3
                                           ${status === 'completed' ? 'bg-green-50 border-green-300' :
                                             status === 'current' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400' :
                                             status === 'locked' ? 'bg-gray-50 border-gray-200 cursor-not-allowed' :
                                             'bg-white border-gray-300 hover:bg-gray-50'}`}
                                >
                                  {getStatusIcon(status)}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {getObjectiveIcon(objective.type)}
                                      </span>
                                      <span className="font-medium">
                                        {objective.name}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {objective.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* フッター統計 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-600">総学習時間（推定）:</span>
            <span className="font-medium ml-1">14-18時間</span>
          </div>
          <div>
            <span className="text-gray-600">次の目標:</span>
            <span className="font-medium ml-1 text-blue-600">
              {currentObjective ? '進行中' : '選択してください'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumMap;