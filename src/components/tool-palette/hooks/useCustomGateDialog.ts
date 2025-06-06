import { useState, useEffect } from 'react';
import type { CustomGatePin } from '@/types/circuit';
import type { TruthTableResult } from '@/domain/analysis';
import { debug } from '@/shared/debug';

interface DialogInitialData {
  initialInputs?: CustomGatePin[];
  initialOutputs?: CustomGatePin[];
  isFullCircuit?: boolean;
}

interface TruthTableData {
  result: TruthTableResult;
  inputNames: string[];
  outputNames: string[];
  gateName: string;
}

export const useCustomGateDialog = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dialogInitialData, setDialogInitialData] = useState<DialogInitialData>(
    {}
  );
  const [isTruthTableOpen, setIsTruthTableOpen] = useState(false);
  const [currentTruthTable, setCurrentTruthTable] =
    useState<TruthTableData | null>(null);

  // カスタムゲート作成ダイアログを開くイベントリスナー
  useEffect(() => {
    const handleOpenDialog = (event: Event) => {
      const customEvent = event as CustomEvent<{
        initialInputs: unknown;
        initialOutputs: unknown;
        isFullCircuit: boolean;
      }>;
      const { initialInputs, initialOutputs, isFullCircuit } =
        customEvent.detail;

      // デバッグ: イベントから受け取ったデータを確認
      debug.log('=== useCustomGateDialog Event Debug ===');
      debug.log('Raw event detail:', customEvent.detail);
      debug.log('initialInputs:', initialInputs);
      debug.log('initialOutputs:', initialOutputs);
      debug.log('isFullCircuit:', isFullCircuit);

      const processedData = {
        initialInputs: initialInputs as CustomGatePin[] | undefined,
        initialOutputs: initialOutputs as CustomGatePin[] | undefined,
        isFullCircuit,
      };

      debug.log('Processed dialogInitialData:', processedData);

      setDialogInitialData(processedData);
      setIsCreateDialogOpen(true);
    };

    window.addEventListener('open-custom-gate-dialog', handleOpenDialog);

    return () => {
      window.removeEventListener('open-custom-gate-dialog', handleOpenDialog);
    };
  }, []);

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setDialogInitialData({});
  };

  const openTruthTable = (data: TruthTableData) => {
    setCurrentTruthTable(data);
    setIsTruthTableOpen(true);
  };

  const closeTruthTable = () => {
    setIsTruthTableOpen(false);
    setCurrentTruthTable(null);
  };

  return {
    isCreateDialogOpen,
    dialogInitialData,
    isTruthTableOpen,
    currentTruthTable,
    openCreateDialog,
    closeCreateDialog,
    openTruthTable,
    closeTruthTable,
  };
};
