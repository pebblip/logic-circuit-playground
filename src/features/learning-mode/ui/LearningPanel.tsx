import React, { useState, useEffect } from 'react';
import { LESSONS } from '../data/lessons';
import { GateData, Connection } from '../../../entities/types';

interface LearningPanelProps {
  gates: GateData[];
  connections: Connection[];
}

export const LearningPanel: React.FC<LearningPanelProps> = ({ gates, connections }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const currentLesson = LESSONS[currentLessonIndex];
  
  // レッスンの完了チェック
  useEffect(() => {
    if (currentLesson.checkCompletion) {
      const isCompleted = currentLesson.checkCompletion(gates, connections);
      if (isCompleted && !completedLessons.has(currentLesson.id)) {
        setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      }
    }
  }, [gates, connections, currentLesson, completedLessons]);
  
  const nextLesson = () => {
    if (currentLessonIndex < LESSONS.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };
  
  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg z-30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-green-400">
          📚 学習モード
        </h2>
        <span className="text-sm text-gray-400">
          {currentLessonIndex + 1} / {LESSONS.length}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2">
          {currentLesson.title}
        </h3>
        <p className="text-gray-300 text-sm mb-2">
          {currentLesson.description}
        </p>
        <div className="bg-gray-900 p-3 rounded text-sm">
          <div className="text-yellow-400 font-semibold mb-1">目標:</div>
          <div className="text-gray-300">{currentLesson.objective}</div>
        </div>
      </div>
      
      {completedLessons.has(currentLesson.id) && (
        <div className="bg-green-900 bg-opacity-50 border border-green-600 rounded p-3 mb-4">
          <div className="text-green-400 font-semibold">
            ✅ クリア！
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={prevLesson}
          disabled={currentLessonIndex === 0}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-2 px-4 rounded transition-colors"
        >
          前へ
        </button>
        <button
          onClick={nextLesson}
          disabled={currentLessonIndex === LESSONS.length - 1}
          className={`flex-1 py-2 px-4 rounded transition-colors ${
            completedLessons.has(currentLesson.id)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          } disabled:bg-gray-800 disabled:text-gray-600`}
        >
          次へ
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          進捗: {completedLessons.size} / {LESSONS.length} レッスン完了
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(completedLessons.size / LESSONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};