import { useState, useCallback } from 'react';

interface Badge {
  id: string;
  name: string;
  unlocked: boolean;
}

interface Progress {
  level: number;
  completedChallenges: string[];
}

interface UseEducationalFeaturesReturn {
  userMode: string;
  setUserMode: (mode: string) => void;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  showChallenge: boolean;
  setShowChallenge: (show: boolean) => void;
  showExtendedChallenge: boolean;
  setShowExtendedChallenge: (show: boolean) => void;
  showProgress: boolean;
  setShowProgress: (show: boolean) => void;
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  progress: Progress;
  setProgress: (progress: Progress) => void;
  preferences: any;
  setPreferences: (prefs: any) => void;
}

export function useEducationalFeatures(): UseEducationalFeaturesReturn {
  const [userMode, setUserMode] = useState('student');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showExtendedChallenge, setShowExtendedChallenge] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<Progress>({ level: 1, completedChallenges: [] });
  const [preferences, setPreferences] = useState({});

  return {
    userMode,
    setUserMode,
    showTutorial,
    setShowTutorial,
    showChallenge,
    setShowChallenge,
    showExtendedChallenge,
    setShowExtendedChallenge,
    showProgress,
    setShowProgress,
    badges,
    setBadges,
    progress,
    setProgress,
    preferences,
    setPreferences
  };
}