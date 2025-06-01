import { useState, useCallback } from 'react';

interface UsePanelVisibilityReturn {
  showHelp: boolean;
  showSaveLoad: boolean;
  showGateDefinition: boolean;
  showCustomGatePanel: boolean;
  showNotebook: boolean;
  selectedCustomGateDetail: any;
  toggleHelp: () => void;
  toggleSaveLoad: () => void;
  toggleGateDefinition: () => void;
  toggleCustomGatePanel: () => void;
  toggleNotebook: () => void;
  setSelectedCustomGateDetail: (detail: any) => void;
}

export function usePanelVisibility(): UsePanelVisibilityReturn {
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showGateDefinition, setShowGateDefinition] = useState(false);
  const [showCustomGatePanel, setShowCustomGatePanel] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [selectedCustomGateDetail, setSelectedCustomGateDetail] = useState<any>(null);

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  const toggleSaveLoad = useCallback(() => {
    setShowSaveLoad(prev => !prev);
  }, []);

  const toggleGateDefinition = useCallback(() => {
    setShowGateDefinition(prev => !prev);
  }, []);

  const toggleCustomGatePanel = useCallback(() => {
    setShowCustomGatePanel(prev => !prev);
  }, []);

  const toggleNotebook = useCallback(() => {
    setShowNotebook(prev => !prev);
  }, []);

  return {
    showHelp,
    showSaveLoad,
    showGateDefinition,
    showCustomGatePanel,
    showNotebook,
    selectedCustomGateDetail,
    toggleHelp,
    toggleSaveLoad,
    toggleGateDefinition,
    toggleCustomGatePanel,
    toggleNotebook,
    setSelectedCustomGateDetail
  };
}