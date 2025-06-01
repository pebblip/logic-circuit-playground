import React from 'react';
import { AppMode, MODE_CONFIGS } from '@/entities/types/mode';
import { useAppMode } from '@/shared/lib/hooks/useAppMode';
import { TEST_IDS } from '@/shared/config/testIds';

interface AppModeSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
}

/**
 * アプリケーションモード選択コンポーネント
 * 3つのモード（学習・自由・パズル）を切り替える
 */
export const AppModeSelector: React.FC<AppModeSelectorProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal'
}) => {
  const { currentMode, setMode, availableModes } = useAppMode();

  const handleModeChange = (mode: AppMode) => {
    setMode(mode);
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-4'
  };

  const containerClasses = variant === 'horizontal' 
    ? 'flex flex-row gap-2' 
    : 'flex flex-col gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      {availableModes.map((mode) => {
        const config = MODE_CONFIGS[mode];
        const isActive = mode === currentMode;
        
        return (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`
              ${sizeClasses[size]}
              rounded-lg font-semibold transition-all duration-300
              border-2 cursor-pointer
              ${isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
              }
            `}
            aria-pressed={isActive}
            aria-label={`${config.name}に切り替え`}
            data-testid={`mode-btn-${mode}`}
            title={config.description}
          >
            <span className="mr-2">{config.icon}</span>
            {config.name}
          </button>
        );
      })}
    </div>
  );
};

export default AppModeSelector;