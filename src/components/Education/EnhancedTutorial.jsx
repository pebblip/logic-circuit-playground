import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  BookOpen, 
  Cpu, 
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { TUTORIAL_CONTENT, HINT_SYSTEM, TUTORIAL_ANIMATIONS } from '../../data/tutorialContent';
import TutorialAnimation from './TutorialAnimation';

const EnhancedTutorial = ({ 
  tutorialId, 
  currentStep, 
  onStepComplete, 
  onTutorialComplete,
  attemptCount = 0 
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(null);
  
  const tutorial = TUTORIAL_CONTENT[tutorialId];
  const progressiveHints = HINT_SYSTEM.progressive_hints[tutorialId];
  
  if (!tutorial) {
    return <div>チュートリアルが見つかりません</div>;
  }
  
  const currentSectionData = tutorial.sections[currentSection];
  
  // ヒントの表示判定
  useEffect(() => {
    if (progressiveHints && attemptCount > 0) {
      const availableHint = progressiveHints.find(
        hint => attemptCount >= hint.showAfterAttempts && hint.level > currentHintLevel
      );
      
      if (availableHint) {
        setCurrentHintLevel(availableHint.level);
        setShowHint(true);
      }
    }
  }, [attemptCount, progressiveHints, currentHintLevel]);
  
  const getSectionIcon = (type) => {
    switch (type) {
      case 'introduction': return <Info className="w-5 h-5" />;
      case 'real_world': return <Cpu className="w-5 h-5" />;
      case 'technical': return <BookOpen className="w-5 h-5" />;
      case 'interactive': return <PlayCircle className="w-5 h-5" />;
      case 'construction': return <Cpu className="w-5 h-5" />;
      case 'verification': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };
  
  const handleNextSection = () => {
    if (currentSection < tutorial.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onTutorialComplete?.();
    }
  };
  
  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };
  
  const renderContent = () => {
    switch (currentSectionData.type) {
      case 'introduction':
      case 'real_world':
      case 'technical':
      case 'concept':
        return (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700">
                {currentSectionData.content}
              </p>
            </div>
            
            {currentSectionData.examples && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {currentSectionData.examples.map((example, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">{example.name}</h4>
                    <p className="text-sm text-blue-700">{example.description}</p>
                    {example.visual && (
                      <button
                        onClick={() => setAnimationPlaying(example.visual)}
                        className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        図解を見る
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {currentSectionData.animation && (
              <div className="mt-4">
                <button
                  onClick={() => setAnimationPlaying(currentSectionData.animation)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  アニメーションを見る
                </button>
              </div>
            )}
          </div>
        );
        
      case 'construction':
        return (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700">
                {currentSectionData.content}
              </p>
            </div>
            
            {currentSectionData.steps && (
              <div className="space-y-3 mt-6">
                {currentSectionData.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full 
                                  flex items-center justify-center text-sm font-semibold text-blue-700">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{step.description}</p>
                      {step.hint && (
                        <p className="text-sm text-gray-500 mt-1">{step.hint}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700">
                {currentSectionData.content}
              </p>
            </div>
            
            {currentSectionData.task && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">実践タスク</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {currentSectionData.task.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-sm text-yellow-800">{instruction}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold mb-1">{tutorial.title}</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSectionIcon(currentSectionData.type)}
            <span className="text-sm opacity-90">{currentSectionData.title}</span>
          </div>
          <div className="text-sm opacity-75">
            {currentSection + 1} / {tutorial.sections.length}
          </div>
        </div>
      </div>
      
      {/* プログレスバー */}
      <div className="h-2 bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSection + 1) / tutorial.sections.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* コンテンツ */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* ヒント表示 */}
      {showHint && progressiveHints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">
                ヒント (レベル {currentHintLevel})
              </p>
              <p className="text-sm text-amber-800">
                {progressiveHints.find(h => h.level === currentHintLevel)?.hint}
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* ナビゲーション */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevSection}
            disabled={currentSection === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                     ${currentSection === 0 
                       ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                       : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>
          
          <div className="flex gap-2">
            {tutorial.sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 rounded-full transition-all
                         ${idx === currentSection 
                           ? 'bg-blue-600 w-8' 
                           : 'bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNextSection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                     rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentSection === tutorial.sections.length - 1 ? '完了' : '次へ'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* アニメーションモーダル */}
      {animationPlaying && (
        <TutorialAnimation
          animationId={animationPlaying}
          onClose={() => setAnimationPlaying(null)}
        />
      )}
    </div>
  );
};

export default EnhancedTutorial;