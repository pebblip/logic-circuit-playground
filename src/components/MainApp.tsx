import React, { useState, useEffect } from 'react';
import UltraModernCircuitWithViewModel from './UltraModernCircuitWithViewModel';
import { getUserPreferences, saveUserPreferences } from '../utils/circuitStorage';

export const MainApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 初期設定を確認
    const prefs = getUserPreferences();
    
    // モードが設定されていない場合、デフォルトで discovery モードを設定
    if (!prefs.mode) {
      saveUserPreferences({ 
        mode: 'discovery',
        tutorialCompleted: false 
      });
    }
    
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <UltraModernCircuitWithViewModel />;
};