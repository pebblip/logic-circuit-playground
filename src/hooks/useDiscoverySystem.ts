import { useState, useCallback } from 'react';

interface Discovery {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

interface Milestone {
  id: string;
  name: string;
  achieved: boolean;
}

interface UseDiscoverySystemReturn {
  discoveryProgress: number;
  discoveries: Discovery[];
  milestones: Milestone[];
  showDiscoveryNotification: boolean;
  showDiscoveryTutorial: boolean;
  checkDiscoveries: () => void;
  incrementExperiments: () => void;
  setShowDiscoveryNotification: (show: boolean) => void;
  setShowDiscoveryTutorial: (show: boolean) => void;
}

export function useDiscoverySystem(): UseDiscoverySystemReturn {
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showDiscoveryNotification, setShowDiscoveryNotification] = useState(false);
  const [showDiscoveryTutorial, setShowDiscoveryTutorial] = useState(false);

  const checkDiscoveries = useCallback(() => {
    // 発見チェックロジック
    // 実際の実装は後で追加
  }, []);

  const incrementExperiments = useCallback(() => {
    setDiscoveryProgress(prev => prev + 1);
  }, []);

  return {
    discoveryProgress,
    discoveries,
    milestones,
    showDiscoveryNotification,
    showDiscoveryTutorial,
    checkDiscoveries,
    incrementExperiments,
    setShowDiscoveryNotification,
    setShowDiscoveryTutorial
  };
}