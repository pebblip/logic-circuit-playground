import { useState, useEffect } from 'react';
import type { CustomGatePin } from '@/types/circuit';

export interface CustomGateFormData {
  gateName: string;
  displayName: string;
  description: string;
  selectedIcon: string;
  selectedCategory: string;
  inputs: CustomGatePin[];
  outputs: CustomGatePin[];
  gateWidth: number;
  gateHeight: number;
}

interface UseCustomGateFormProps {
  initialInputs?: CustomGatePin[];
  initialOutputs?: CustomGatePin[];
  isOpen: boolean;
}

export const useCustomGateForm = ({
  initialInputs = [
    { name: 'A', index: 0 },
    { name: 'B', index: 1 },
  ],
  initialOutputs = [{ name: 'Y', index: 0 }],
  isOpen,
}: UseCustomGateFormProps) => {
  const [gateName, setGateName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔧');
  const [selectedCategory, setSelectedCategory] = useState('custom');
  const [inputs, setInputs] = useState<CustomGatePin[]>([]);
  const [outputs, setOutputs] = useState<CustomGatePin[]>([]);
  const [gateWidth, setGateWidth] = useState(100);
  const [gateHeight, setGateHeight] = useState(80);

  // ダイアログが開かれた時に初期値を設定
  useEffect(() => {
    if (isOpen) {
      // デバッグ: useCustomGateForm での初期化を確認
      console.log('=== useCustomGateForm Initialization Debug ===');
      console.log('isOpen:', isOpen);
      console.log('initialInputs received:', initialInputs);
      console.log('initialOutputs received:', initialOutputs);
      console.log(
        'initialInputs type:',
        typeof initialInputs,
        Array.isArray(initialInputs)
      );
      console.log(
        'initialOutputs type:',
        typeof initialOutputs,
        Array.isArray(initialOutputs)
      );

      if (initialInputs) {
        console.log('Setting inputs to:', initialInputs);
        setInputs(initialInputs);
      }
      if (initialOutputs) {
        console.log('Setting outputs to:', initialOutputs);
        setOutputs(initialOutputs);
      }
    }
  }, [isOpen, initialInputs, initialOutputs]);

  // ゲート高さを入力/出力数に応じて調整
  useEffect(() => {
    const maxPins = Math.max(inputs.length, outputs.length);
    // ピンラベルが重ならないよう十分な高さを確保
    const newHeight = Math.max(120, 60 + maxPins * 25);
    setGateHeight(newHeight);
  }, [inputs.length, outputs.length]);

  // ダイアログが閉じられたときに状態をリセット
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setGateName('');
    setDisplayName('');
    setDescription('');
    setSelectedIcon('🔧');
    setSelectedCategory('custom');
    setInputs([
      { name: 'A', index: 0 },
      { name: 'B', index: 1 },
    ]);
    setOutputs([{ name: 'Y', index: 0 }]);
  };

  // 真理値表を自動生成
  const generateTruthTable = (): Record<string, string> => {
    const truthTable: Record<string, string> = {};
    const inputCount = inputs.length;
    const outputCount = outputs.length;

    // 全ての入力パターンを生成
    for (let i = 0; i < Math.pow(2, inputCount); i++) {
      const inputPattern = i.toString(2).padStart(inputCount, '0');
      // デフォルトでは全て0（ユーザーが後で編集）
      const outputPattern = '0'.repeat(outputCount);
      truthTable[inputPattern] = outputPattern;
    }

    return truthTable;
  };

  // ピン操作関数
  const handleAddInput = () => {
    const newIndex = inputs.length;
    setInputs([...inputs, { name: `I${newIndex}`, index: newIndex }]);
  };

  const handleRemoveInput = (index: number) => {
    const updatedInputs = inputs
      .filter((_, i) => i !== index)
      .map((input, i) => ({ ...input, index: i }));
    setInputs(updatedInputs);
  };

  const handleUpdateInputName = (index: number, name: string) => {
    const updatedInputs = [...inputs];
    updatedInputs[index] = { ...updatedInputs[index], name };
    setInputs(updatedInputs);
  };

  const handleAddOutput = () => {
    const newIndex = outputs.length;
    setOutputs([...outputs, { name: `O${newIndex}`, index: newIndex }]);
  };

  const handleRemoveOutput = (index: number) => {
    if (outputs.length <= 1) return;

    const updatedOutputs = outputs
      .filter((_, i) => i !== index)
      .map((output, i) => ({ ...output, index: i }));
    setOutputs(updatedOutputs);
  };

  const handleUpdateOutputName = (index: number, name: string) => {
    const updatedOutputs = [...outputs];
    updatedOutputs[index] = { ...updatedOutputs[index], name };
    setOutputs(updatedOutputs);
  };

  return {
    formData: {
      gateName,
      displayName,
      description,
      selectedIcon,
      selectedCategory,
      inputs,
      outputs,
      gateWidth,
      gateHeight,
    },
    setters: {
      setGateName,
      setDisplayName,
      setDescription,
      setSelectedIcon,
      setSelectedCategory,
      setInputs,
      setOutputs,
      setGateWidth,
      setGateHeight,
    },
    handlers: {
      handleAddInput,
      handleRemoveInput,
      handleUpdateInputName,
      handleAddOutput,
      handleRemoveOutput,
      handleUpdateOutputName,
    },
    utils: {
      resetForm,
      generateTruthTable,
    },
  };
};
