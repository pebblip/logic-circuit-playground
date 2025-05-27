import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { TUTORIAL_ANIMATIONS } from '../../data/tutorialContent';

const TutorialAnimation = ({ animationId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const animation = TUTORIAL_ANIMATIONS[animationId];
  
  useEffect(() => {
    if (!animation || !isPlaying) return;
    
    const startTime = Date.now();
    const animationSteps = animation.steps;
    let animationFrame;
    let lastStepIndex = -1;
    
    const updateAnimation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      setProgress(progress * 100);
      
      // 現在のステップを更新
      const currentTime = elapsed;
      const activeStep = animationSteps.findLastIndex(step => step.time <= currentTime);
      if (activeStep !== -1 && activeStep !== lastStepIndex) {
        lastStepIndex = activeStep;
        setCurrentStep(activeStep);
      }
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateAnimation);
      } else {
        setIsPlaying(false);
        // アニメーション終了時は最後のステップを維持
        setCurrentStep(animationSteps.length - 1);
      }
    };
    
    animationFrame = requestAnimationFrame(updateAnimation);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animation, isPlaying]);
  
  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };
  
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  if (!animation) return null;
  
  const currentStepData = animation.steps[currentStep];
  
  const renderAnimationContent = () => {
    switch (animationId) {
      case 'and_gate_intro':
        return <ANDGateAnimation step={currentStepData} />;
      case 'feedback_loop_concept':
        return <FeedbackLoopAnimation step={currentStepData} />;
      case 'binary_addition_explained':
        return <BinaryAdditionAnimation step={currentStepData} />;
      case 'nand_universal':
        return <NANDUniversalAnimation step={currentStepData} />;
      default:
        return <DefaultAnimation step={currentStepData} animationId={animationId} />;
    }
  };
  
  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">アニメーション</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* アニメーション表示エリア */}
        <div className="flex-1 p-8 flex items-center justify-center bg-gray-50">
          <div className="w-full h-full max-w-lg max-h-96">
            {renderAnimationContent()}
          </div>
        </div>
        
        {/* コントロール */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleTogglePlay}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleRestart}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>,
    document.body
  );
};

// 個別のアニメーションコンポーネント
const ANDGateAnimation = ({ step }) => {
  if (!step) return null;
  
  return (
    <svg viewBox="0 0 250 120" className="w-full h-full">
      {/* ANDゲートの形状 */}
      <g transform="translate(80, 35)">
        <path
          d="M 0 0 L 50 0 Q 75 25 50 50 L 0 50 Z"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        
        {/* 入力A */}
        <line x1="-30" y1="15" x2="0" y2="15" stroke="black" strokeWidth="2" />
        <circle cx="-35" cy="15" r="5" fill={step.values?.[0] ? "#ef4444" : "#9ca3af"} />
        <text x="-50" y="19" fontSize="14" textAnchor="middle" fill="black">A</text>
        
        {/* 入力B */}
        <line x1="-30" y1="35" x2="0" y2="35" stroke="black" strokeWidth="2" />
        <circle cx="-35" cy="35" r="5" fill={step.values?.[1] ? "#ef4444" : "#9ca3af"} />
        <text x="-50" y="39" fontSize="14" textAnchor="middle" fill="black">B</text>
        
        {/* 出力 */}
        <line x1="62.5" y1="25" x2="92.5" y2="25" stroke="black" strokeWidth="2" />
        <circle 
          cx="97.5" 
          cy="25" 
          r="5" 
          fill={step.action === 'show_output' ? (step.value ? "#ef4444" : "#9ca3af") : "#9ca3af"}
        />
        <text x="115" y="29" fontSize="14" textAnchor="middle" fill="black">OUT</text>
        
        {/* ゲート名 */}
        <text x="25" y="30" fontSize="16" textAnchor="middle" fill="black">AND</text>
      </g>
      
      {/* 真理値表示 */}
      {step.action === 'show_output' && (
        <g transform="translate(125, 100)">
          <rect x="-50" y="-15" width="100" height="25" fill="#f3f4f6" stroke="#9ca3af" rx="5" />
          <text x="0" y="0" fontSize="14" textAnchor="middle" fontWeight="bold" fill="black">
            {step.values?.[0]} AND {step.values?.[1]} = {step.value}
          </text>
        </g>
      )}
    </svg>
  );
};

const FeedbackLoopAnimation = ({ step }) => {
  if (!step) return null;
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* NORゲート1 */}
      <g transform="translate(50, 50)" opacity={step.action !== 'show_single_nor' ? 1 : 1}>
        <path
          d="M 0 0 Q 20 0 30 15 Q 20 30 0 30 Z"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <circle cx="35" cy="15" r="3" fill="white" stroke="black" strokeWidth="2" />
        <text x="15" y="-10" fontSize="12" textAnchor="middle">NOR1</text>
      </g>
      
      {/* NORゲート2 */}
      {(step.action === 'show_second_nor' || 
        step.action === 'draw_feedback_line' || 
        step.action === 'pulse_feedback_loop') && (
        <g transform="translate(200, 50)">
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <path
              d="M 0 0 Q 20 0 30 15 Q 20 30 0 30 Z"
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            <circle cx="35" cy="15" r="3" fill="white" stroke="black" strokeWidth="2" />
            <text x="15" y="-10" fontSize="12" textAnchor="middle">NOR2</text>
          </motion.g>
        </g>
      )}
      
      {/* フィードバックライン */}
      {step.from === 'nor1_out' && (
        <motion.path
          d="M 88 65 Q 150 65 150 85 L 200 85"
          fill="none"
          stroke="blue"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {step.from === 'nor2_out' && (
        <motion.path
          d="M 238 65 Q 150 65 150 45 L 50 45"
          fill="none"
          stroke="red"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {/* パルスアニメーション */}
      {step.action === 'pulse_feedback_loop' && (
        <>
          <motion.circle
            cx="150"
            cy="65"
            r="5"
            fill="yellow"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <text x="150" y="130" fontSize="14" textAnchor="middle" fontWeight="bold">
            フィードバックループ完成！
          </text>
        </>
      )}
    </svg>
  );
};

const BinaryAdditionAnimation = ({ step }) => {
  // 2進数加算のアニメーション実装
  return (
    <div className="text-center font-mono">
      {step.action === 'show_decimal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl"
        >
          {step.text}
        </motion.div>
      )}
      
      {step.action === 'show_binary' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl mt-4"
        >
          <div>101</div>
          <div>+ 111</div>
          <div className="border-t-2 border-black mt-2">????</div>
        </motion.div>
      )}
      
      {/* 他のステップの実装... */}
    </div>
  );
};

const NANDUniversalAnimation = ({ step }) => {
  if (!step) return null;
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {step.action === 'show_nand_gate' && (
        <svg viewBox="0 0 200 100" className="w-48 h-24">
          <g transform="translate(50, 25)">
            <path d="M 0 0 L 50 0 Q 75 25 50 50 L 0 50 Z" fill="white" stroke="black" strokeWidth="2" />
            <circle cx="67" cy="25" r="4" fill="white" stroke="black" strokeWidth="2" />
            <text x="25" y="30" fontSize="14" textAnchor="middle">NAND</text>
          </g>
        </svg>
      )}
      
      {step.action === 'show_text' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-bold text-blue-600"
        >
          {step.text}
        </motion.div>
      )}
      
      {(step.action === 'transform_to_not' || 
        step.action === 'transform_to_and' || 
        step.action === 'transform_to_or') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300"
        >
          <p className="text-lg font-mono text-center">{step.text}</p>
        </motion.div>
      )}
      
      {step.action === 'show_conclusion' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-3xl font-bold text-green-600 text-center"
        >
          {step.text}
        </motion.div>
      )}
    </div>
  );
};

const DefaultAnimation = ({ step, animationId }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">アニメーション: {animationId} - {step?.action}</p>
    </div>
  );
};

export default TutorialAnimation;