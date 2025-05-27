import React from 'react';
import { ChevronDown, Lightbulb, Eye, CheckCircle } from 'lucide-react';
import { TUTORIAL_CONTENT } from '../data/tutorialContent';

const LearningControls = ({ 
  currentLesson, 
  onLessonChange, 
  showHint, 
  onToggleHint, 
  onShowAnswer,
  isLessonCompleted 
}) => {
  const lessons = Object.entries(TUTORIAL_CONTENT).map(([key, content]) => ({
    id: key,
    title: content.title
  }));

  const currentLessonData = TUTORIAL_CONTENT[currentLesson];

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">学習モード:</span>
            
            {/* レッスンセレクター */}
            <div className="relative">
              <select
                value={currentLesson}
                onChange={(e) => onLessonChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* 完了バッジ */}
            {isLessonCompleted && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-2">
            {/* ヒントボタン */}
            <button
              onClick={onToggleHint}
              className={`
                flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${showHint 
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Lightbulb className="w-4 h-4" />
              <span>ヒント</span>
            </button>

            {/* 答えボタン */}
            <button
              onClick={onShowAnswer}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>答え</span>
            </button>
          </div>
        </div>

        {/* 進捗インジケーター */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {lessons.findIndex(l => l.id === currentLesson) + 1} / {lessons.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ 
                width: `${((lessons.findIndex(l => l.id === currentLesson) + 1) / lessons.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningControls;